---
'sidebar_label': 'ClickHouse OSS'
'slug': '/cloud/migration/clickhouse-to-cloud'
'title': 'Миграция между самоуправляемым ClickHouse и ClickHouse Cloud'
'description': 'Страница, описывающая, как мигрировать между самоуправляемым ClickHouse
  и ClickHouse Cloud'
'doc_type': 'guide'
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

<Image img={self_managed_01} size='md' alt='Migrating Self-managed ClickHouse' background='white' />

В этом руководстве показано, как мигрировать с самоуправляемого сервера ClickHouse в ClickHouse Cloud, а также как мигрировать между сервисами ClickHouse Cloud. Функция [`remoteSecure`](/sql-reference/table-functions/remote) используется в запросах `SELECT` и `INSERT`, чтобы предоставить доступ к удалённым серверам ClickHouse, что делает миграцию таблиц такой же простой, как написание запроса `INSERT INTO` с встроенным `SELECT`.

## Миграция с самоуправляемого ClickHouse в ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='sm' alt='Migrating Self-managed ClickHouse' background='white' />

:::note
Независимо от того, является ли ваша исходная таблица шардированной и/или реплицированной, в ClickHouse Cloud вы просто создаёте целевую таблицу (вы можете не указывать параметр Engine для этой таблицы, она автоматически станет таблицей ReplicatedMergeTree),
и ClickHouse Cloud автоматически позаботится о вертикальном и горизонтальном масштабировании. Вам не нужно думать о том, как реплицировать и шардировать таблицу.
:::

В этом примере самоуправляемый сервер ClickHouse является *источником*, а сервис ClickHouse Cloud — *назначением*.

### Обзор {#overview}

Процесс следующий:

1. Добавьте пользователя с правами только для чтения в исходный сервис
1. Дублируйте структуру исходной таблицы в целевом сервисе
1. Перенесите данные из источника в назначение или отправьте данные из источника, в зависимости от доступности сети источника
1. Удалите исходный сервер из списка управления доступом по IP на целевом сервисе (если применимо)
1. Удалите пользователя с правами только для чтения из исходного сервиса

### Миграция таблиц из одной системы в другую: {#migration-of-tables-from-one-system-to-another}
В этом примере мигрирует одна таблица с самоуправляемого сервера ClickHouse в ClickHouse Cloud.

### В исходной системе ClickHouse (системе, которая в настоящее время хранит данные) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- Добавьте пользователя с правами только для чтения, который может читать исходную таблицу (`db.table` в этом примере)
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
Измените ENGINE на ReplicatedMergeTree без каких-либо параметров, когда вы выполняете оператор CREATE. ClickHouse Cloud всегда реплицирует таблицы и предоставляет правильные параметры. Тем не менее, сохраните ключи `ORDER BY`, `PRIMARY KEY`, `PARTITION BY`, `SAMPLE BY`, `TTL` и `SETTINGS`.
:::

```sql
CREATE TABLE db.table ...
```

- Используйте функцию `remoteSecure`, чтобы загрузить данные из самоуправляемого источника

<Image img={self_managed_03} size='sm' alt='Migrating Self-managed ClickHouse' background='white' />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
Если исходная система недоступна из внешних сетей, вы можете отправить данные, а не загрузить их, так как функция `remoteSecure` работает как для выборок, так и для вставок. Посмотрите следующий вариант.
:::

- Используйте функцию `remoteSecure`, чтобы отправить данные в сервис ClickHouse Cloud

<Image img={self_managed_04} size='sm' alt='Migrating Self-managed ClickHouse' background='white' />

:::tip Добавьте удалённую систему в список управления доступом по IP вашего сервиса ClickHouse Cloud
Для того чтобы функция `remoteSecure` могла подключиться к вашему сервису ClickHouse Cloud, IP-адрес удалённой системы должен быть разрешен списком управления доступом по IP. Раскройте **Управление списком доступа по IP** ниже этого совета для получения дополнительной информации.
:::

  <AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```

## Миграция между сервисами ClickHouse Cloud {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt='Migrating Self-managed ClickHouse' background='white' />

Некоторые примеры использования для миграции данных между сервисами ClickHouse Cloud:
- Миграция данных из восстановленной резервной копии
- Копирование данных из сервиса разработки в сервис предварительной проверки (или из предварительной проверки в производство)

В этом примере есть два сервиса ClickHouse Cloud, и они будут называться *источником* и *назначением*. Данные будут перенесены с источника на назначение. Хотя вы можете отправить данные, если хотите, показан способ загрузки, так как он использует пользователя с правами только для чтения.

<Image img={self_managed_06} size='lg' alt='Migrating Self-managed ClickHouse' background='white' />

В миграции несколько шагов:
1. Определите один сервис ClickHouse Cloud как *источник*, а другой как *назначение*
1. Добавьте пользователя с правами только для чтения в исходный сервис
1. Дублируйте структуру исходной таблицы в целевом сервисе
1. Временно разрешите IP-доступ к источнику
1. Скопируйте данные из источника на назначение
1. Восстановите список управления доступом по IP на назначении
1. Удалите пользователя с правами только для чтения из исходного сервиса

#### Добавьте пользователя с правами только для чтения в исходный сервис {#add-a-read-only-user-to-the-source-service}

- Добавьте пользователя с правами только для чтения, который может читать исходную таблицу (`db.table` в этом примере)
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

  На целевом сервисе создайте таблицу, используя вывод `select create_table_query...` из источника:

```sql
CREATE TABLE db.table ...
```

#### Разрешите удалённый доступ к исходному сервису {#allow-remote-access-to-the-source-service}

Чтобы переносить данные из источника на назначение, исходный сервис должен разрешить подключения. Временно отключите функциональность "IP Access List" на исходном сервисе.

:::tip
Если вы будете продолжать использовать исходный сервис ClickHouse Cloud, экспортируйте существующий список управления доступом по IP в файл JSON перед переключением на разрешение доступа откуда угодно; это позволит вам импортировать список доступа после миграции данных.
:::

Измените список разрешений и временно разрешите доступ от **Anywhere**. См. документацию по [IP Access List](/cloud/security/setting-ip-filters) для получения подробной информации.

#### Скопируйте данные из источника на назначение {#copy-the-data-from-source-to-destination}

- Используйте функцию `remoteSecure`, чтобы получить данные из сервиса ClickHouse Cloud источника
  Подключитесь к назначению. Выполните эту команду на целевом сервисе ClickHouse Cloud:

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

- Проверьте данные в целевом сервисе

#### Восстановите список управления доступом по IP на источнике {#re-establish-the-ip-access-list-on-the-source}

  Если вы ранее экспортировали список доступа, вы можете импортировать его снова с помощью **Share**, иначе повторно добавьте ваши записи в список доступа.

#### Удалите пользователя с правами только для чтения `exporter` {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- Измените список управления доступом по IP сервиса, чтобы ограничить доступ
