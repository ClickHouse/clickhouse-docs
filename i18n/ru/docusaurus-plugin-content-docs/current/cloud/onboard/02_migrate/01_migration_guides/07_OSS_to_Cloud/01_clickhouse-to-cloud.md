---
sidebar_label: 'ClickHouse OSS'
slug: /cloud/migration/clickhouse-to-cloud
title: 'Миграция между самостоятельно управляемым ClickHouse и ClickHouse Cloud'
description: 'Страница, описывающая, как выполнять миграцию между самостоятельно управляемым ClickHouse и ClickHouse Cloud'
doc_type: 'guide'
keywords: ['миграция', 'ClickHouse Cloud', 'OSS', 'миграция самостоятельно управляемого ClickHouse в Cloud']
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';

# Миграция между самостоятельно управляемым ClickHouse и ClickHouse Cloud {#migrating-between-self-managed-clickhouse-and-clickhouse-cloud}

<Image img={self_managed_01} size="md" alt="Миграция самостоятельно управляемого ClickHouse" background="white" />

В этом руководстве показано, как выполнить миграцию с самостоятельно управляемого сервера ClickHouse в ClickHouse Cloud, а также как выполнять миграцию между сервисами ClickHouse Cloud. Функция [`remoteSecure`](/sql-reference/table-functions/remote) используется в запросах `SELECT` и `INSERT` для обеспечения доступа к удалённым серверам ClickHouse, что делает миграцию таблиц настолько же простой, как написание запроса `INSERT INTO` с вложенным `SELECT`.

## Миграция с самостоятельно управляемого ClickHouse в ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size="sm" alt="Migrating Self-managed ClickHouse" background="white" />

:::note
Независимо от того, шардирована и/или реплицирована ваша исходная таблица, в ClickHouse Cloud вы просто создаёте целевую таблицу (для этой таблицы можно опустить параметр Engine — по умолчанию будет использована таблица ReplicatedMergeTree),
и ClickHouse Cloud автоматически позаботится о вертикальном и горизонтальном масштабировании. Вам не нужно думать о том, как реплицировать и шардировать таблицу.
:::

В этом примере самостоятельно управляемый сервер ClickHouse является *источником*, а сервис ClickHouse Cloud — *приёмником*.

### Обзор {#overview}

Процесс выглядит следующим образом:

1. Добавить пользователя с правами только на чтение в исходный сервис
2. Продублировать структуру исходной таблицы в целевом сервисе
3. Перенести данные из источника в приёмник (pull) или отправить данные из источника (push) в зависимости от сетевой доступности источника
4. Удалить исходный сервер из IP Access List на целевой стороне (если применимо)
5. Удалить пользователя с правами только на чтение из исходного сервиса

### Миграция таблиц из одной системы в другую: {#migration-of-tables-from-one-system-to-another}

Этот пример переносит одну таблицу с самостоятельно управляемого сервера ClickHouse в ClickHouse Cloud.

### На исходной системе ClickHouse (системе, которая в данный момент хранит данные) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

* Добавьте пользователя с правами только на чтение, который может читать исходную таблицу (`db.table` в этом примере)

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'здесь-ваш-пароль'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

* Скопируйте описание таблицы

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

### В целевой системе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-system}

* Создайте целевую базу данных:

```sql
CREATE DATABASE db
```

* Используя оператор CREATE TABLE из исходной базы данных, создайте таблицу в целевой базе данных.

:::tip
Измените ENGINE на ReplicatedMergeTree без каких-либо параметров при выполнении оператора CREATE. ClickHouse Cloud всегда реплицирует таблицы и задаёт корректные параметры. При этом сохраните клаузы `ORDER BY`, `PRIMARY KEY`, `PARTITION BY`, `SAMPLE BY`, `TTL` и `SETTINGS`.
:::

```sql
CREATE TABLE db.table ...
```

* Используйте функцию `remoteSecure`, чтобы получить данные из самостоятельно управляемого источника

<Image img={self_managed_03} size="sm" alt="Миграция самостоятельно управляемого ClickHouse" background="white" />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
Если исходная система недоступна из внешних сетей, вы можете отправлять данные (push), а не забирать их (pull), так как функция `remoteSecure` работает как для выборок (select), так и для вставок (insert). См. следующий вариант.
:::

* Используйте функцию `remoteSecure`, чтобы отправить данные в сервис ClickHouse Cloud

<Image img={self_managed_04} size="sm" alt="Миграция самоуправляемого ClickHouse" background="white" />

:::tip Добавьте удалённую систему в список IP-доступа вашего сервиса ClickHouse Cloud
Чтобы функция `remoteSecure` могла подключиться к вашему сервису ClickHouse Cloud, IP-адрес удалённой системы должен быть разрешён в списке IP-доступа. Разверните раздел **Управление списком IP-доступа** ниже для получения дополнительной информации.
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```

## Миграция между сервисами ClickHouse Cloud {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size="lg" alt="Миграция самоуправляемого ClickHouse" background="white" />

Некоторые примеры использования миграции данных между сервисами ClickHouse Cloud:

* Миграция данных из восстановленной резервной копии
* Копирование данных из сервиса разработки в сервис промежуточного тестирования (или из промежуточного тестирования в production)

В этом примере используются два сервиса ClickHouse Cloud, которые далее называются *source* и *destination*. Данные будут копироваться из source в destination. Хотя вы при желании можете и «толкать» данные (push), здесь показан вариант с выборкой (pull), так как он использует пользователя только для чтения.

<Image img={self_managed_06} size="lg" alt="Миграция самоуправляемого ClickHouse" background="white" />

Миграция состоит из нескольких шагов:

1. Определите один сервис ClickHouse Cloud как *source*, а другой как *destination*
2. Добавьте пользователя только для чтения в сервис source
3. Продублируйте структуру таблицы source в сервисе destination
4. Временно разрешите доступ по IP к сервису source
5. Скопируйте данные из source в destination
6. Восстановите IP Access List на сервисе destination
7. Удалите пользователя только для чтения из сервиса source

#### Добавьте пользователя только для чтения в сервис source {#add-a-read-only-user-to-the-source-service}

* Добавьте пользователя только для чтения, который может читать таблицу source (`db.table` в этом примере)

  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

* Скопируйте определение таблицы
  ```sql
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

#### Продублируйте структуру таблицы в сервисе destination {#duplicate-the-table-structure-on-the-destination-service}

В сервисе destination создайте базу данных, если её ещё нет:

* Создайте базу данных destination:
  ```sql
  CREATE DATABASE db
  ```

* Используя оператор CREATE TABLE из source, создайте таблицу в destination.

  В сервисе destination создайте таблицу, используя вывод `select create_table_query...` из source:

  ```sql
  CREATE TABLE db.table ...
  ```

#### Разрешите удалённый доступ к сервису source {#allow-remote-access-to-the-source-service}

Чтобы забирать данные из source в destination, сервис source должен разрешать подключения. Временно отключите функциональность &quot;IP Access List&quot; на сервисе source.

:::tip
Если вы планируете продолжать использовать сервис ClickHouse Cloud source, то предварительно экспортируйте существующий IP Access List в JSON-файл перед переключением на доступ отовсюду; это позволит импортировать список доступа после завершения миграции данных.
:::

Измените allow list и временно разрешите доступ из **Anywhere**. Подробности см. в документации по [IP Access List](/cloud/security/setting-ip-filters).

#### Скопируйте данные из source в destination {#copy-the-data-from-source-to-destination}

* Используйте функцию `remoteSecure` для получения данных из сервиса ClickHouse Cloud source.
  Подключитесь к destination. Выполните эту команду в сервисе ClickHouse Cloud destination:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

* Проверьте данные в сервисе destination

#### Восстановите IP Access List на сервисе source {#re-establish-the-ip-access-list-on-the-source}

Если вы ранее экспортировали список доступа, то можете повторно импортировать его с помощью **Share**, иначе заново добавьте свои записи в список доступа.

#### Удалите пользователя только для чтения `exporter` {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

* Измените список IP‑адресов доступа к сервису, чтобы ограничить доступ
