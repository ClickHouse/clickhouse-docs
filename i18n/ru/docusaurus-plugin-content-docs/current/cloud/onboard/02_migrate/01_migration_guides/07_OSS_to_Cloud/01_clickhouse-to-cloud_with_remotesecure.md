---
sidebar_label: 'Использование remoteSecure'
slug: /cloud/migration/clickhouse-to-cloud
title: 'Миграция между самоуправляемым ClickHouse и ClickHouse Cloud'
description: 'На этой странице описывается, как выполнять миграцию между самоуправляемым ClickHouse и ClickHouse Cloud'
doc_type: 'guide'
keywords: ['миграция', 'ClickHouse Cloud', 'OSS', 'Миграция самоуправляемого ClickHouse в Cloud']
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';
import CompatibilityNote from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/compatibility.mdx'


# Миграция между самоуправляемым ClickHouse и ClickHouse Cloud с использованием remoteSecure \{#migrating-between-self-managed-clickhouse-and-clickhouse-cloud-using-remotesecure\}

<Image img={self_managed_01} size='lg' alt='Миграция самоуправляемого ClickHouse'/>

В этом руководстве показано, как перенести данные с самоуправляемого сервера ClickHouse в ClickHouse Cloud, а также как выполнять миграцию между сервисами ClickHouse Cloud.
Функция [`remoteSecure`](/sql-reference/table-functions/remote) используется в запросах `SELECT` и `INSERT` для доступа к удалённым серверам ClickHouse, что делает миграцию таблиц такой же простой, как написание запроса `INSERT INTO` с вложенным `SELECT`.

## Миграция с самоуправляемого ClickHouse в ClickHouse Cloud \\{#migrating-from-self-managed-clickhouse-to-clickhouse-cloud\\}

<Image img={self_managed_02} size='lg' alt='Миграция самоуправляемого ClickHouse'  />

Независимо от того, сегментирована и/или реплицирована ли ваша исходная таблица, в ClickHouse Cloud вам нужно только создать целевую таблицу (для этой таблицы можно не указывать параметр Engine — в качестве движка автоматически будет выбран `SharedMergeTree`),
и ClickHouse Cloud автоматически позаботится о вертикальном и горизонтальном масштабировании.
Вам не нужно думать о том, как реплицировать и сегментировать таблицу.

В этом примере самоуправляемый сервер ClickHouse является *источником*, а сервис ClickHouse Cloud — *приёмником*.

### Обзор \\{#overview\\}

Процесс состоит из следующих шагов:

1. Добавьте пользователя с правами только на чтение в исходный сервис
1. Продублируйте структуру исходной таблицы на целевом сервисе
1. Перенесите данные из источника в целевой сервис или отправьте данные с источника, в зависимости от сетевой доступности источника
1. Удалите исходный сервер из списка контроля доступа по IP на целевом сервисе (если применимо)
1. Удалите пользователя с правами только на чтение из исходного сервиса

### Миграция таблиц с одной системы на другую: \\{#migration-of-tables-from-one-system-to-another\\}

В этом примере показан перенос одной таблицы с самоуправляемого сервера ClickHouse в ClickHouse Cloud.

<CompatibilityNote/>

### На исходной системе ClickHouse (системе, которая в данный момент содержит данные) \{#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data\}

* Добавьте пользователя с правами только на чтение, который сможет читать исходную таблицу (`db.table` в этом примере)

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

* Скопируйте структуру таблицы

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```


### На целевой системе ClickHouse Cloud: \{#on-the-destination-clickhouse-cloud-system\}

* Создайте базу данных назначения:

```sql
CREATE DATABASE db
```

* Используя оператор CREATE TABLE из исходного сервиса, создайте таблицу в целевом.

:::tip
При выполнении оператора CREATE измените ENGINE на ReplicatedMergeTree без указания каких-либо параметров. ClickHouse Cloud всегда реплицирует таблицы и задаёт корректные параметры. Тем не менее, сохраните выражения `ORDER BY`, `PRIMARY KEY`, `PARTITION BY`, `SAMPLE BY`, `TTL` и `SETTINGS`.
:::

```sql
CREATE TABLE db.table ...
```

* Используйте функцию `remoteSecure`, чтобы забрать данные из самоуправляемого источника

<Image img={self_managed_03} size="lg" alt="Миграция самоуправляемого экземпляра ClickHouse" />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
Если исходная система недоступна из внешних сетей, вы можете отправлять данные (push), а не забирать их (pull), так как функция `remoteSecure` работает как для операций SELECT, так и для операций INSERT. См. следующий вариант.
:::

* Используйте функцию `remoteSecure`, чтобы отправить данные в сервис ClickHouse Cloud

<Image img={self_managed_04} size="lg" alt="Миграция самоуправляемого ClickHouse" />

:::tip Добавьте удалённую систему в IP Access List вашего сервиса ClickHouse Cloud
Чтобы функция `remoteSecure` могла подключаться к вашему сервису ClickHouse Cloud, IP-адрес удалённой системы должен быть разрешён в IP Access List. Разверните раздел **Manage your IP Access List** ниже этой подсказки для получения дополнительной информации.
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```


## Миграция между сервисами ClickHouse Cloud \\{#migrating-between-clickhouse-cloud-services\\}

<Image img={self_managed_05} size='lg' alt='Миграция самоуправляемого ClickHouse'  />

Некоторые примеры использования миграции данных между сервисами ClickHouse Cloud:

- Миграция данных из восстановленной резервной копии
- Копирование данных с сервиса разработки на сервис стейджинга (или со стейджинга в продакшен)

В этом примере используются два сервиса ClickHouse Cloud, к которым далее будут обращаться как к *источнику* и *назначению*. Данные будут считываться с источника и загружаться в сервис назначения. Хотя при желании можно и отправлять данные из сервиса назначения в исходный, здесь рассматривается сценарий чтения из источника, так как он использует пользователя с доступом только для чтения.

<Image img={self_managed_06} size='lg' alt='Миграция самоуправляемого ClickHouse'  />

Миграция состоит из нескольких шагов:

1. Определите один сервис ClickHouse Cloud как *источник*, а другой — как *назначение*
1. Добавьте пользователя с доступом только для чтения на исходный сервис
1. Продублируйте структуру исходной таблицы на целевом сервисе
1. Временно разрешите доступ по IP к исходному сервису
1. Скопируйте данные с источника на сервис назначения
1. Восстановите список доступа по IP на целевом сервисе
1. Удалите пользователя с доступом только для чтения с исходного сервиса

#### Добавьте пользователя с доступом только на чтение в исходный сервис \\{#add-a-read-only-user-to-the-source-service\\}

- Добавьте пользователя с доступом только на чтение, который может читать исходную таблицу (`db.table` в этом примере)
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

#### Продублируйте структуру таблицы на целевом сервисе \\{#duplicate-the-table-structure-on-the-destination-service\\}

На целевом сервисе создайте базу данных, если она ещё не существует:

- Создайте целевую базу данных:
  ```sql
  CREATE DATABASE db
  ```

- Используя оператор CREATE TABLE с исходного сервиса, создайте объект назначения.

  На целевом сервисе создайте таблицу, используя результат `select create_table_query...` с исходного сервиса:

  ```sql
  CREATE TABLE db.table ...
  ```

#### Разрешить удаленный доступ к исходному сервису \\{#allow-remote-access-to-the-source-service\\}

Чтобы перенести данные с исходного сервиса на целевой, исходный сервис должен разрешать подключения. Временно отключите функцию **IP Access List** на исходном сервисе.

:::tip
Если вы планируете продолжать использовать исходный сервис ClickHouse Cloud, экспортируйте существующий IP Access List в JSON-файл перед тем, как переключиться на доступ откуда угодно; это позволит импортировать список доступа после завершения миграции данных.
:::

Измените список разрешений (allow list) и временно установите доступ из **Anywhere**. Подробности см. в документации по [IP Access List](/cloud/security/setting-ip-filters).

#### Скопируйте данные из источника в назначение \\{#copy-the-data-from-source-to-destination\\}

- Используйте функцию `remoteSecure`, чтобы извлечь данные из исходного сервиса ClickHouse Cloud.  
  Подключитесь к целевому сервису. Выполните следующую команду на целевом сервисе ClickHouse Cloud:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- Проверьте данные в целевом сервисе

#### Восстановите список доступа по IP на исходном сервисе \\{#re-establish-the-ip-access-list-on-the-source\\}

Если вы ранее экспортировали список доступа, вы можете повторно импортировать его с помощью **Share**, в противном случае заново добавьте необходимые записи в список доступа.

#### Удалите пользователя `exporter`, имеющего права только на чтение \{#remove-the-read-only-exporter-user\}

```sql
DROP USER exporter
```

* Измените список IP-адресов доступа к сервису, чтобы ограничить доступ
