---
sidebar_label: 'ClickHouse OSS'
slug: /cloud/migration/clickhouse-to-cloud
title: 'Миграция между самоуправляемым ClickHouse и ClickHouse Cloud'
description: 'Страница, описывающая, как выполнить миграцию между самоуправляемым ClickHouse и ClickHouse Cloud'
doc_type: 'guide'
keywords: ['миграция', 'ClickHouse Cloud', 'OSS', 'Миграция с самоуправляемого на Cloud']
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

# Миграция между самоуправляемым ClickHouse и ClickHouse Cloud {#migrating-between-self-managed-clickhouse-and-clickhouse-cloud}

<Image img={self_managed_01} size='lg' alt='Миграция самоуправляемого ClickHouse'/>

В этом руководстве рассказывается, как выполнить миграцию с самоуправляемого сервера ClickHouse в ClickHouse Cloud, а также как выполнять миграцию между сервисами ClickHouse Cloud. Функция [`remoteSecure`](/sql-reference/table-functions/remote) используется в запросах `SELECT` и `INSERT` для доступа к удалённым серверам ClickHouse, что делает миграцию таблиц столь же простой, как написание запроса `INSERT INTO` с вложенным `SELECT`.

## Миграция с самоуправляемого ClickHouse на ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='lg' alt='Миграция с самоуправляемого ClickHouse'  />

Независимо от того, сегментирована и/или реплицирована ли ваша исходная таблица, в ClickHouse Cloud вам достаточно создать целевую таблицу (для этой таблицы можно опустить параметр Engine — в качестве движка таблицы автоматически будет выбран `SharedMergeTree`),
и ClickHouse Cloud автоматически позаботится о вертикальном и горизонтальном масштабировании.
Вам не нужно заботиться о том, как реплицировать и сегментировать таблицу.

В этом примере самоуправляемый сервер ClickHouse является *источником*, а сервис ClickHouse Cloud — *приёмником*.

### Обзор {#overview}

Процесс выглядит так:

1. Добавьте пользователя с правами только на чтение в исходный сервис
1. Продублируйте структуру исходной таблицы на целевом сервисе
1. Перенесите данные с исходного сервиса на целевой или отправьте данные с исходного сервиса, в зависимости от его сетевой доступности
1. Удалите исходный сервер из списка IP-доступа целевого сервиса (если применимо)
1. Удалите пользователя с правами только на чтение из исходного сервиса

### Миграция таблиц из одной системы в другую: {#migration-of-tables-from-one-system-to-another}

В этом примере переносится одна таблица с самоуправляемого сервера ClickHouse в ClickHouse Cloud.

<CompatibilityNote/>

### На исходной системе ClickHouse (системе, на которой сейчас находятся данные) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

* Добавьте пользователя с правами только на чтение, который может читать исходную таблицу (`db.table` в этом примере)

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
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

### На целевой системе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-system}

* Создайте базу данных назначения:

```sql
CREATE DATABASE db
```

* Используя оператор CREATE TABLE из исходного сервиса, создайте таблицу в целевом сервисе.

:::tip
Измените ENGINE на ReplicatedMergeTree без каких‑либо параметров при выполнении оператора CREATE TABLE. ClickHouse Cloud всегда реплицирует таблицы и задаёт корректные параметры. При этом сохраните клаузы `ORDER BY`, `PRIMARY KEY`, `PARTITION BY`, `SAMPLE BY`, `TTL` и `SETTINGS`.
:::

```sql
CREATE TABLE db.table ...
```

* Используйте функцию `remoteSecure`, чтобы получать данные из самоуправляемого источника

<Image img={self_managed_03} size="lg" alt="Перенос самоуправляемого ClickHouse" />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
Если исходная система недоступна из внешних сетей, вы можете отправлять данные (push), а не забирать их (pull), так как функция `remoteSecure` работает как для select-запросов, так и для insert-запросов. См. следующий вариант.
:::

* Используйте функцию `remoteSecure`, чтобы отправить данные в сервис ClickHouse Cloud

<Image img={self_managed_04} size="lg" alt="Миграция самоуправляемого ClickHouse" />

:::tip Добавьте удалённую систему в IP Access List вашего сервиса ClickHouse Cloud
Чтобы функция `remoteSecure` смогла подключиться к вашему сервису ClickHouse Cloud, IP-адрес удалённой системы должен быть разрешён в списке доступа по IP (IP Access List). Разверните раздел **Manage your IP Access List** ниже этой подсказки для получения дополнительной информации.
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```

## Миграция между сервисами ClickHouse Cloud {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt='Миграция самоуправляемого ClickHouse'  />

Некоторые примеры сценариев миграции данных между сервисами ClickHouse Cloud:

- Миграция данных из восстановленной резервной копии
- Копирование данных с сервиса разработки на staging-сервис (или со staging в production)

В этом примере используются два сервиса ClickHouse Cloud, и далее они будут называться *источник* и *назначение*. Данные будут считываться с источника и загружаться в сервис назначения. Хотя при желании можно реализовать и push-сценарий, здесь показан вариант с pull, так как он использует пользователя только для чтения.

<Image img={self_managed_06} size='lg' alt='Миграция самоуправляемого ClickHouse'  />

Миграция включает несколько шагов:

1. Определите один сервис ClickHouse Cloud как *источник*, а другой как *назначение*
1. Добавьте пользователя только для чтения на сервисе-источнике
1. Продублируйте структуру таблицы источника на сервисе-назначении
1. Временно разрешите IP-доступ к сервису-источнику
1. Скопируйте данные с источника на назначение
1. Повторно включите список доступа по IP (IP Access List) на сервисе-назначении
1. Удалите пользователя только для чтения с сервиса-источника

#### Добавьте пользователя только для чтения в исходном сервисе {#add-a-read-only-user-to-the-source-service}

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

#### Продублируйте структуру таблицы на целевом сервисе {#duplicate-the-table-structure-on-the-destination-service}

На целевом сервисе создайте базу данных, если она ещё не существует:

- Создайте целевую базу данных:
  ```sql
  CREATE DATABASE db
  ```

- Используя оператор CREATE TABLE с исходного сервиса, создайте целевую таблицу.

  На целевом сервисе создайте таблицу, используя результат запроса `select create_table_query...` на исходном сервисе:

  ```sql
  CREATE TABLE db.table ...
  ```

#### Разрешите удалённый доступ к исходному сервису {#allow-remote-access-to-the-source-service}

Чтобы передавать данные из исходного сервиса в целевой, исходный сервис должен разрешать подключения. Временно отключите функциональность «IP Access List» на исходном сервисе.

:::tip
Если вы планируете и дальше использовать исходный сервис ClickHouse Cloud, экспортируйте текущий IP Access List в файл JSON перед переключением на режим доступа из любого места; это позволит импортировать список доступа после завершения миграции данных.
:::

Измените IP Access List и временно разрешите доступ из **Anywhere**. Подробности см. в документации по [IP Access List](/cloud/security/setting-ip-filters).

#### Скопируйте данные из источника в целевой сервис {#copy-the-data-from-source-to-destination}

- Используйте функцию `remoteSecure`, чтобы получить данные из исходного сервиса ClickHouse Cloud. Подключитесь к целевому сервису и выполните в нём следующую команду:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- Проверьте данные в целевом сервисе

#### Повторно настройте список доступа по IP на исходном кластере {#re-establish-the-ip-access-list-on-the-source}

Если вы ранее экспортировали список доступа, вы можете импортировать его обратно с помощью **Share**, в противном случае заново добавьте свои записи в список доступа.

#### Удалить пользователя `exporter` с доступом только на чтение {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

* Переключите список IP-доступа сервиса, чтобы ограничить доступ
