---
sidebar_position: 10
sidebar_label: 'ClickHouse в ClickHouse Cloud'
slug: /cloud/migration/clickhouse-to-cloud
title: 'Перемещение между самоуправляемым ClickHouse и ClickHouse Cloud'
description: 'Страница, описывающая, как перемещаться между самоуправляемым ClickHouse и ClickHouse Cloud'
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/ru/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# Перемещение между самоуправляемым ClickHouse и ClickHouse Cloud

<Image img={self_managed_01} size='md' alt='Перемещение самоуправляемого ClickHouse' background='white' />

Этот гид покажет, как переместиться с сервера самоуправляемого ClickHouse в ClickHouse Cloud, а также как переместиться между службами ClickHouse Cloud. Функция [`remoteSecure`](../../sql-reference/table-functions/remote.md) используется в запросах `SELECT` и `INSERT`, чтобы обеспечить доступ к удаленным серверам ClickHouse, что делает перемещение таблиц таким же простым, как написание запроса `INSERT INTO` с вложенным `SELECT`.

## Перемещение из самоуправляемого ClickHouse в ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='sm' alt='Перемещение самоуправляемого ClickHouse' background='white' />

:::note
Независимо от того, является ли ваша исходная таблица шардированной и/или реплицированной, в ClickHouse Cloud вы просто создаете целевую таблицу (вы можете опустить параметр Engine для этой таблицы, она автоматически станет таблицей ReplicatedMergeTree), и ClickHouse Cloud автоматически позаботится о вертикальном и горизонтальном масштабировании. Вам не нужно думать о том, как реплицировать и шардировать таблицу.
:::

В этом примере сервер самоуправляемого ClickHouse является *исходником*, а служба ClickHouse Cloud является *назначением*.

### Обзор {#overview}

Процесс:

1. Добавить пользователя только для чтения в исходную службу
2. Дублировать структуру исходной таблицы в целевой службе
3. Перенести данные из источника в назначение или отправить данные из источника, в зависимости от доступности сети источника
4. Удалить сервер источника из списка доступа по IP на назначении (если применимо)
5. Удалить пользователя только для чтения из исходной службы


### Перемещение таблиц из одной системы в другую: {#migration-of-tables-from-one-system-to-another}
Этот пример перемещает одну таблицу с сервера самоуправляемого ClickHouse в ClickHouse Cloud.

### На исходной системе ClickHouse (системе, которая в настоящее время хранит данные) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

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

### На целевой системе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-system}

- Создайте целевую базу данных:
```sql
CREATE DATABASE db
```

- Используя оператор CREATE TABLE из источника, создайте назначение.

:::tip
Измените ENGINE на ReplicatedMergeTree без каких-либо параметров, когда вы запускаете оператор CREATE. ClickHouse Cloud всегда реплицирует таблицы и предоставляет правильные параметры. Тем не менее, оставьте в clauses `ORDER BY`, `PRIMARY KEY`, `PARTITION BY`, `SAMPLE BY`, `TTL`, и `SETTINGS`.
:::

```sql
CREATE TABLE db.table ...
```


- Используйте функцию `remoteSecure` для переноса данных из самоуправляемого источника

<Image img={self_managed_03} size='sm' alt='Перемещение самоуправляемого ClickHouse' background='white' />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
Если исходная система недоступна из внешних сетей, то вы можете отправить данные, а не получать, так как функция `remoteSecure` работает как для выборок, так и для вставок. Смотрите следующий вариант.
:::

- Используйте функцию `remoteSecure` для отправки данных в службу ClickHouse Cloud

<Image img={self_managed_04} size='sm' alt='Перемещение самоуправляемого ClickHouse' background='white' />

:::tip Добавьте удаленную систему в свой список доступа по IP службы ClickHouse Cloud
Чтобы функция `remoteSecure` смогла подключиться к вашей службе ClickHouse Cloud, IP-адрес удаленной системы должен быть разрешен в списке доступа по IP. Разверните **Управление своим списком доступа по IP** ниже этой подсказки для получения дополнительной информации.
:::

  <AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```



## Перемещение между службами ClickHouse Cloud {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt='Перемещение самоуправляемого ClickHouse' background='white' />

Некоторые примеры использования для перемещения данных между службами ClickHouse Cloud:
- Перемещение данных из восстановленной резервной копии
- Копирование данных из сервисной разработки на сервис промежуточного тестирования (или с промежуточного тестирования на продакшн)

В этом примере две службы ClickHouse Cloud будут называться *исходником* и *назначением*. Данные будут вытянуты из источника в назначение. Хотя вы можете отправить данные, если хотите, показан вариант получения, так как он использует пользователя только для чтения.

<Image img={self_managed_06} size='lg' alt='Перемещение самоуправляемого ClickHouse' background='white' />

Процесс перемещения состоит из нескольких шагов:
1. Определите одну службу ClickHouse Cloud в качестве *исходника*, а другую — в качестве *назначения*
2. Добавьте пользователя только для чтения в исходную службу
3. Дублируйте структуру исходной таблицы в целевой службе
4. Временно разрешите доступ по IP к исходной службе
5. Скопируйте данные из источника в назначение
6. Восстановите список доступа по IP на назначении
7. Удалите пользователя только для чтения из исходной службы


#### Добавьте пользователя только для чтения в исходную службу {#add-a-read-only-user-to-the-source-service}

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

#### Дублируйте структуру таблицы на целевой службе {#duplicate-the-table-structure-on-the-destination-service}

На целевой службе создайте базу данных, если ее еще нет:

- Создайте целевую базу данных:
  ```sql
  CREATE DATABASE db
  ```



- Используя оператор CREATE TABLE из источника, создайте назначение.

  На целевой службе создайте таблицу, используя вывод `select create_table_query...` из источника:

  ```sql
  CREATE TABLE db.table ...
  ```

#### Разрешите удаленный доступ к исходной службе {#allow-remote-access-to-the-source-service}

Чтобы переместить данные из источника в назначение, служба источника должна разрешить подключения. Временно отключите функциональность "Список доступа по IP" на исходной службе.

:::tip
Если вы продолжите использовать исходную службу ClickHouse Cloud, экспортируйте существующий список доступа по IP в файл JSON перед переключением на разрешение доступа отовсюду; это позволит вам импортировать список доступа после миграции данных.
:::

Измените разрешенный список и временно разрешите доступ от **Anywhere**. См. документацию по [Списку доступа по IP](/cloud/security/setting-ip-filters) для получения подробной информации.

#### Скопируйте данные из источника в назначение {#copy-the-data-from-source-to-destination}

- Используйте функцию `remoteSecure`, чтобы получить данные из службы ClickHouse Cloud источника
  Подключитесь к назначению. Запустите эту команду на целевой службе ClickHouse Cloud:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- Проверьте данные в целевой службе

#### Восстановите список доступа по IP на исходном {#re-establish-the-ip-access-list-on-the-source}

  Если вы ранее экспортировали список доступа, вы можете повторно импортировать его с помощью **Поделиться**, в противном случае повторно добавьте свои записи в список доступа.

#### Удалите пользователя только для чтения `exporter` {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- Переключите список доступа по IP службы, чтобы ограничить доступ
