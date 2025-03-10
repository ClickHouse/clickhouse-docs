---
sidebar_position: 10
sidebar_label: ClickHouse в ClickHouse Cloud
slug: /cloud/migration/clickhouse-to-cloud
---
import AddARemoteSystem from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# Миграция между self-managed ClickHouse и ClickHouse Cloud

<img src={self_managed_01} class="image" alt="Миграция Self-managed ClickHouse" style={{width: '80%', padding: '30px'}} />

Этот гид покажет, как мигрировать с сервера self-managed ClickHouse в ClickHouse Cloud, а также как мигрировать между сервисами ClickHouse Cloud. Функция [`remoteSecure`](../../sql-reference/table-functions/remote.md) используется в `SELECT` и `INSERT` запросах для доступа к удаленным серверам ClickHouse, что делает миграцию таблиц такой же простой, как написание запроса `INSERT INTO` с встроенным `SELECT`.

## Миграция с Self-managed ClickHouse в ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<img src={self_managed_02} class="image" alt="Миграция Self-managed ClickHouse" style={{width: '30%', padding: '30px'}} />

:::note
Независимо от того, является ли ваша исходная таблица шардированной и/или реплицированной, в ClickHouse Cloud вам просто нужно создать целевую таблицу (вы можете опустить параметр Engine для этой таблицы, она будет автоматически таблицей ReplicatedMergeTree),
и ClickHouse Cloud автоматически позаботится о вертикальном и горизонтальном масштабировании. Вам не нужно беспокоиться о том, как реплицировать и шардировать таблицу.
:::

В этом примере сервер self-managed ClickHouse является *источником*, а сервис ClickHouse Cloud — *назначением*.

### Обзор {#overview}

Процесс включает в себя:

1. Добавьте пользователя только для чтения на исходном сервисе
1. Дублируйте структуру исходной таблицы на целевом сервисе
1. Перенесите данные из источника в назначение или отправьте данные из источника, в зависимости от доступности сети источника
1. Удалите исходный сервер из списка IP Access List на назначении (если применимо)
1. Удалите пользователя только для чтения с исходного сервиса

### Миграция таблиц из одной системы в другую: {#migration-of-tables-from-one-system-to-another}
Этот пример иллюстрирует миграцию одной таблицы с сервера self-managed ClickHouse в ClickHouse Cloud.

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
Измените ENGINE на ReplicatedMergeTree без каких-либо параметров, когда вы выполняете оператор CREATE. ClickHouse Cloud всегда реплицирует таблицы и предоставляет правильные параметры. Сохраняйте при этом клаузулы `ORDER BY`, `PRIMARY KEY`, `PARTITION BY`, `SAMPLE BY`, `TTL` и `SETTINGS`.
:::

```sql
CREATE TABLE db.table ...
```

- Используйте функцию `remoteSecure` для перетаскивания данных из self-managed источника

<img src={self_managed_03} class="image" alt="Миграция Self-managed ClickHouse" style={{width: '30%', padding: '30px'}} />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
Если исходная система недоступна из внешних сетей, вы можете отправить данные вместо того, чтобы перетаскивать их, поскольку функция `remoteSecure` работает как для выборок, так и для вставок. Смотрите следующий вариант.
:::

- Используйте функцию `remoteSecure` для отправки данных на сервис ClickHouse Cloud

<img src={self_managed_04} class="image" alt="Миграция Self-managed ClickHouse" style={{width: '30%', padding: '30px'}} />

:::tip Добавьте удаленную систему в свой список IP Access List ClickHouse Cloud
Для того чтобы функция `remoteSecure` могла подключиться к вашему сервису ClickHouse Cloud, IP-адрес удаленной системы должен быть разрешен в списке IP Access List. Раскройте **Управление вашим IP Access List** ниже этой подсказки для получения дополнительной информации.
:::

  <AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```

## Миграция между сервисами ClickHouse Cloud {#migrating-between-clickhouse-cloud-services}

<img src={self_managed_05} class="image" alt="Миграция Self-managed ClickHouse" style={{width: '80%', padding: '30px'}} />

Некоторые примеры использования для миграции данных между сервисами ClickHouse Cloud:
- Миграция данных из восстановленной резервной копии
- Копирование данных из сервиса разработки в сервис тестирования (или из тестирования на производственный)

В этом примере есть два сервиса ClickHouse Cloud, и они будут обозначены как *источник* и *назначение*. Данные будут перетаскиваться из источника в назначение. Хотя вы можете отправить данные, если хотите, перетаскивание показано, так как оно использует пользователя только для чтения.

<img src={self_managed_06} class="image" alt="Миграция Self-managed ClickHouse" style={{width: '80%', padding: '30px'}} />

В процессе миграции несколько шагов:
1. Определите один сервис ClickHouse Cloud как *источник*, а другой как *назначение*
1. Добавьте пользователя только для чтения на источник
1. Дублируйте структуру исходной таблицы на целевом сервисе
1. Временно разрешите доступ по IP к исходному сервису
1. Скопируйте данные из источника в назначение
1. Восстановите список IP Access List на назначении
1. Удалите пользователя только для чтения с исходного сервиса

#### Добавьте пользователя только для чтения на исходный сервис {#add-a-read-only-user-to-the-source-service}

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

#### Дублируйте структуру таблицы на целевом сервисе {#duplicate-the-table-structure-on-the-destination-service}

На целевом сервисе создайте базу данных, если она еще не существует:

- Создайте целевую базу данных:
  ```sql
  CREATE DATABASE db
  ```

- Используя оператор CREATE TABLE из источника, создайте назначение.

  На целевом сервисе создайте таблицу, используя вывод `select create_table_query...` из источника:

  ```sql
  CREATE TABLE db.table ...
  ```

#### Разрешите удаленный доступ к исходному сервису {#allow-remote-access-to-the-source-service}

Для того чтобы перетащить данные из источника на назначение, исходный сервис должен разрешать подключения. Временно отключите функциональность "IP Access List" на исходном сервисе.

:::tip
Если вы будете продолжать использовать исходный сервис ClickHouse Cloud, то экспортируйте существующий список IP Access List в файл JSON перед переключением на разрешение доступа откуда угодно; это позволит вам импортировать список доступа после миграции данных.
:::

Измените список разрешенных и временно разрешите доступ от **Любого места**. См. документацию [IP Access List](/cloud/security/setting-ip-filters) для получения дополнительных сведений.

#### Скопируйте данные из источника в назначение {#copy-the-data-from-source-to-destination}

- Используйте функцию `remoteSecure` для перетаскивания данных из исходного сервиса ClickHouse Cloud
  Подключитесь к назначению. Выполните эту команду на целевом сервисе ClickHouse Cloud:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- Проверьте данные в целевом сервисе

#### Восстановите список IP Access List на исходном {#re-establish-the-ip-access-list-on-the-source}

  Если вы ранее экспортировали список доступа, вы можете импортировать его снова, используя **Share**, в противном случае добавьте свои записи снова в список доступа.

#### Удалите пользователя только для чтения `exporter` {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- Переключите список IP Access List сервиса, чтобы ограничить доступ
