---
sidebar_position: 10
sidebar_label: 'ClickHouse в ClickHouse Cloud'
slug: /cloud/migration/clickhouse-to-cloud
title: 'Миграция между самоуправляемым ClickHouse и ClickHouse Cloud'
description: 'Страница, описывающая, как мигрировать между самоуправляемым ClickHouse и ClickHouse Cloud'
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# Миграция между самоуправляемым ClickHouse и ClickHouse Cloud

<Image img={self_managed_01} size='md' alt='Миграция самоуправляемого ClickHouse' background='white' />

Этот гид покажет, как мигрировать с самоуправляемого сервера ClickHouse в ClickHouse Cloud, а также как мигрировать между сервисами ClickHouse Cloud. Функция [`remoteSecure`](../../sql-reference/table-functions/remote.md) используется в запросах `SELECT` и `INSERT`, чтобы разрешить доступ к удалённым серверам ClickHouse, что делает миграцию таблиц такой простой, как написание запроса `INSERT INTO` с встроенным `SELECT`.

## Миграция из самоуправляемого ClickHouse в ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

:::note
Независимо от того, разбита ли ваша исходная таблица на шард и/или реплицирована, в ClickHouse Cloud вы просто создаете целевую таблицу (вы можете не указывать параметр Engine для этой таблицы, она автоматически станет таблицей ReplicatedMergeTree),
и ClickHouse Cloud автоматически позаботится о вертикальном и горизонтальном масштабировании. Вам не нужно беспокоиться о том, как реплицировать и шардировать таблицу.
:::

В этом примере самоуправляемый сервер ClickHouse является *источником*, а сервис ClickHouse Cloud — *назначением*.

### Обзор {#overview}

Процесс заключается в следующем:

1. Добавьте пользователя с правами только на чтение к исходному сервису
1. Дублируйте структуру исходной таблицы на целевом сервисе
1. Перенесите данные из источника в назначение или отправьте данные из источника, в зависимости от доступности сети исходника
1. Удалите исходный сервер из списка доступа IP на целевом (если применимо)
1. Удалите пользователя с правами только на чтение из исходного сервиса


### Миграция таблиц из одной системы в другую: {#migration-of-tables-from-one-system-to-another}
Этот пример демонстрирует миграцию одной таблицы с самоуправляемого сервера ClickHouse в ClickHouse Cloud.

### На исходной системе ClickHouse (система, которая в данный момент размещает данные) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

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
select create_table_query
from system.tables
where database = 'db' and table = 'table'
```

### На целевой системе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-system}

- Создайте целевую базу данных:
```sql
CREATE DATABASE db
```

- Используя оператор CREATE TABLE из источника, создайте целевую таблицу.

:::tip
Измените ENGINE на ReplicatedMergeTree без каких-либо параметров, когда вы выполняете оператор CREATE. ClickHouse Cloud всегда реплицирует таблицы и предоставляет правильные параметры. Однако сохраните условия `ORDER BY`, `PRIMARY KEY`, `PARTITION BY`, `SAMPLE BY`, `TTL` и `SETTINGS`.
:::

```sql
CREATE TABLE db.table ...
```


- Используйте функцию `remoteSecure`, чтобы получить данные из самоуправляемого источника

<Image img={self_managed_03} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
Если исходная система недоступна из внешних сетей, вы можете отправить данные, а не извлекать их, поскольку функция `remoteSecure` работает для обеих операций выборки и вставки.  Смотрите следующий вариант.
:::

- Используйте функцию `remoteSecure`, чтобы отправить данные в сервис ClickHouse Cloud

<Image img={self_managed_04} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

:::tip Добавьте удалённую систему в список доступа IP вашего сервиса ClickHouse Cloud
Чтобы функция `remoteSecure` могла подключиться к вашему сервису ClickHouse Cloud, IP-адрес удалённой системы должен быть разрешен в списке доступа IP.  Раскройте **Управление списком доступа IP** ниже этой подсказки для получения дополнительной информации.
:::

  <AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```


## Миграция между сервисами ClickHouse Cloud {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt='Миграция самоуправляемого ClickHouse' background='white' />

Некоторые примеры использования для миграции данных между сервисами ClickHouse Cloud:
- Миграция данных из восстановленной резервной копии
- Копирование данных из сервиса разработки в сервис предварительного просмотра (или из предварительного просмотра в продакшн)

В этом примере есть два сервиса ClickHouse Cloud, которые будут называться *источником* и *назначением*.  Данные будут извлекаться из источника в назначение. Хотя вы можете отправить данные, если хотите, выбран метод извлечения, так как он использует пользователя с правами только на чтение.

<Image img={self_managed_06} size='lg' alt='Миграция самоуправляемого ClickHouse' background='white' />

Миграция состоит из нескольких этапов:
1. Определите один сервис ClickHouse Cloud в качестве *источника*, а другой — в качестве *назначения*
1. Добавьте пользователя с правами только на чтение к исходному сервису
1. Дублируйте структуру исходной таблицы на целевом сервисе
1. Временно разрешите доступ IP к исходному сервису
1. Скопируйте данные из источника в назначение
1. Восстановите список доступа IP на целевом сервисе
1. Удалите пользователя с правами только на чтение из исходного сервиса


#### Добавьте пользователя с правами только на чтение к исходному сервису {#add-a-read-only-user-to-the-source-service}

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
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

#### Дублируйте структуру таблицы на целевом сервисе {#duplicate-the-table-structure-on-the-destination-service}

На целевом сервисе создайте базу данных, если она ещё не существует:

- Создайте целевую базу данных:
  ```sql
  CREATE DATABASE db
  ```



- Используя оператор CREATE TABLE из источника, создайте целевую таблицу.

  На целевом сервисе создайте таблицу, используя вывод команды `select create_table_query...` из источника:

  ```sql
  CREATE TABLE db.table ...
  ```

#### Разрешите удаленный доступ к исходному сервису {#allow-remote-access-to-the-source-service}

Для того чтобы извлечь данные из источника в назначение, исходный сервис должен разрешать подключения. Временно отключите функциональность "Список доступа IP" на исходном сервисе.

:::tip
Если вы планируете продолжать использовать исходный сервис ClickHouse Cloud, то экспортируйте существующий список доступа IP в JSON-файл перед переключением на разрешение доступа отовсюду; это позволит вам импортировать список доступа после миграции данных.
:::

Измените список разрешённых адресов и временно разрешите доступ от **везде**. Смотрите документацию [Список доступа IP](/cloud/security/setting-ip-filters) для подробной информации.

#### Скопируйте данные из источника в назначение {#copy-the-data-from-source-to-destination}

- Используйте функцию `remoteSecure`, чтобы извлечь данные из сервиса ClickHouse Cloud источника
  Подключитесь к целевому сервису.  Выполните эту команду на целевом сервисе ClickHouse Cloud:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- Проверьте данные на целевом сервисе

#### Восстановите список доступа IP на исходном {#re-establish-the-ip-access-list-on-the-source}

  Если вы ранее экспортировали список доступа, вы можете повторно импортировать его с помощью **Поделиться**, в противном случае снова добавьте ваши записи в список доступа.

#### Удалите пользователя с правами только на чтение `exporter` {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- Переключите список доступа IP сервиса, чтобы ограничить доступ
