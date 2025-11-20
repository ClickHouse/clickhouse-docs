---
sidebar_label: 'ClickHouse OSS'
slug: /cloud/migration/clickhouse-to-cloud
title: 'Миграция между самостоятельным размещением ClickHouse и ClickHouse Cloud'
description: 'Страница с описанием миграции между самостоятельным размещением ClickHouse и ClickHouse Cloud'
doc_type: 'guide'
keywords: ['migration', 'ClickHouse Cloud', 'OSS', 'Migrate self-managed to Cloud']
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/docs/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# Миграция между самостоятельно управляемым ClickHouse и ClickHouse Cloud

<Image img={self_managed_01} size='md' alt='Миграция самостоятельно управляемого ClickHouse' background='white' />

В этом руководстве показано, как выполнить миграцию с самостоятельно управляемого сервера ClickHouse в ClickHouse Cloud, а также как выполнять миграцию между сервисами ClickHouse Cloud. Функция [`remoteSecure`](/sql-reference/table-functions/remote) используется в запросах `SELECT` и `INSERT` для доступа к удалённым серверам ClickHouse, что делает миграцию таблиц такой же простой, как выполнение запроса `INSERT INTO` с вложенным `SELECT`.



## Миграция из самостоятельно управляемого ClickHouse в ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image
  img={self_managed_02}
  size='sm'
  alt='Миграция самостоятельно управляемого ClickHouse'
  background='white'
/>

:::note
Независимо от того, является ли исходная таблица шардированной и/или реплицированной, в ClickHouse Cloud достаточно создать целевую таблицу (параметр Engine можно опустить, таблица автоматически станет таблицей ReplicatedMergeTree),
и ClickHouse Cloud автоматически обеспечит вертикальное и горизонтальное масштабирование. Вам не нужно задумываться о репликации и шардировании таблицы.
:::

В этом примере самостоятельно управляемый сервер ClickHouse является _источником_, а сервис ClickHouse Cloud — _целевой системой_.

### Обзор {#overview}

Процесс включает следующие шаги:

1. Добавить пользователя с правами только на чтение в исходной системе
1. Воспроизвести структуру исходной таблицы в целевой системе
1. Извлечь данные из источника в целевую систему или отправить данные из источника в зависимости от сетевой доступности источника
1. Удалить исходный сервер из списка разрешённых IP-адресов в целевой системе (если применимо)
1. Удалить пользователя с правами только на чтение из исходной системы

### Миграция таблиц из одной системы в другую: {#migration-of-tables-from-one-system-to-another}

В этом примере выполняется миграция одной таблицы из самостоятельно управляемого сервера ClickHouse в ClickHouse Cloud.

### В исходной системе ClickHouse (система, в которой в настоящее время хранятся данные) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- Добавьте пользователя с правами только на чтение, который может читать исходную таблицу (`db.table` в этом примере)

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

- Скопируйте определение таблицы

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

### В целевой системе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-system}

- Создайте целевую базу данных:

```sql
CREATE DATABASE db
```

- Используя оператор CREATE TABLE из источника, создайте целевую таблицу.

:::tip
Измените ENGINE на ReplicatedMergeTree без параметров при выполнении оператора CREATE. ClickHouse Cloud всегда реплицирует таблицы и предоставляет корректные параметры. Однако сохраните секции `ORDER BY`, `PRIMARY KEY`, `PARTITION BY`, `SAMPLE BY`, `TTL` и `SETTINGS`.
:::

```sql
CREATE TABLE db.table ...
```

- Используйте функцию `remoteSecure` для извлечения данных из самостоятельно управляемого источника

<Image
  img={self_managed_03}
  size='sm'
  alt='Миграция самостоятельно управляемого ClickHouse'
  background='white'
/>

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
Если исходная система недоступна из внешних сетей, вы можете отправить данные вместо их извлечения, поскольку функция `remoteSecure` работает как для выборок, так и для вставок. См. следующий вариант.
:::

- Используйте функцию `remoteSecure` для отправки данных в сервис ClickHouse Cloud

<Image
  img={self_managed_04}
  size='sm'
  alt='Миграция самостоятельно управляемого ClickHouse'
  background='white'
/>

:::tip Добавьте удалённую систему в список разрешённых IP-адресов вашего сервиса ClickHouse Cloud
Чтобы функция `remoteSecure` могла подключиться к вашему сервису ClickHouse Cloud, IP-адрес удалённой системы должен быть разрешён в списке разрешённых IP-адресов. Разверните раздел **Управление списком разрешённых IP-адресов** ниже для получения дополнительной информации.
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```


## Миграция между сервисами ClickHouse Cloud {#migrating-between-clickhouse-cloud-services}

<Image
  img={self_managed_05}
  size='lg'
  alt='Миграция самостоятельно управляемого ClickHouse'
  background='white'
/>

Примеры сценариев миграции данных между сервисами ClickHouse Cloud:

- Миграция данных из восстановленной резервной копии
- Копирование данных из сервиса разработки в промежуточный сервис (или из промежуточного в продуктивный)

В этом примере используются два сервиса ClickHouse Cloud, которые будут называться _источник_ и _назначение_. Данные будут извлекаться из источника в назначение. Хотя можно использовать отправку данных, в примере показан метод извлечения, так как он использует пользователя только для чтения.

<Image
  img={self_managed_06}
  size='lg'
  alt='Миграция самостоятельно управляемого ClickHouse'
  background='white'
/>

Процесс миграции включает несколько шагов:

1. Определите один сервис ClickHouse Cloud как _источник_, а другой как _назначение_
1. Добавьте пользователя только для чтения в сервис-источник
1. Воспроизведите структуру таблицы источника в сервисе назначения
1. Временно разрешите IP-доступ к сервису-источнику
1. Скопируйте данные из источника в назначение
1. Восстановите список IP-доступа в источнике
1. Удалите пользователя только для чтения из сервиса-источника

#### Добавление пользователя только для чтения в сервис-источник {#add-a-read-only-user-to-the-source-service}

- Добавьте пользователя только для чтения, который может читать исходную таблицу (`db.table` в этом примере)

  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

- Скопируйте определение таблицы
  ```sql
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

#### Воспроизведение структуры таблицы в сервисе назначения {#duplicate-the-table-structure-on-the-destination-service}

В сервисе назначения создайте базу данных, если она еще не существует:

- Создайте базу данных назначения:

  ```sql
  CREATE DATABASE db
  ```

- Используя оператор CREATE TABLE из источника, создайте таблицу в назначении.

  В сервисе назначения создайте таблицу, используя результат выполнения `select create_table_query...` из источника:

  ```sql
  CREATE TABLE db.table ...
  ```

#### Разрешение удаленного доступа к сервису-источнику {#allow-remote-access-to-the-source-service}

Чтобы извлечь данные из источника в назначение, сервис-источник должен разрешать подключения. Временно отключите функциональность «Список IP-доступа» в сервисе-источнике.

:::tip
Если вы планируете продолжить использование сервиса-источника ClickHouse Cloud, экспортируйте существующий список IP-доступа в файл JSON перед переключением на разрешение доступа отовсюду; это позволит вам импортировать список доступа после завершения миграции данных.
:::

Измените список разрешений и временно разрешите доступ **Отовсюду**. Подробности см. в документации [Список IP-доступа](/cloud/security/setting-ip-filters).

#### Копирование данных из источника в назначение {#copy-the-data-from-source-to-destination}

- Используйте функцию `remoteSecure` для извлечения данных из сервиса-источника ClickHouse Cloud
  Подключитесь к сервису назначения. Выполните эту команду в сервисе назначения ClickHouse Cloud:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- Проверьте данные в сервисе назначения

#### Восстановление списка IP-доступа в источнике {#re-establish-the-ip-access-list-on-the-source}

Если вы ранее экспортировали список доступа, вы можете повторно импортировать его с помощью **Share**, в противном случае повторно добавьте записи в список доступа.

#### Удаление пользователя `exporter` только для чтения {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- Переключите список IP-доступа сервиса для ограничения доступа
