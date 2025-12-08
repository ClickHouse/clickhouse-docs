---
slug: /integrations/postgresql/connecting-to-postgresql
title: 'Подключение к PostgreSQL'
keywords: ['clickhouse', 'postgres', 'postgresql', 'connect', 'integrate', 'table', 'engine']
description: 'Страница с описанием различных способов подключения PostgreSQL к ClickHouse'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# Подключение ClickHouse к PostgreSQL {#connecting-clickhouse-to-postgresql}

На этой странице рассматриваются следующие варианты интеграции PostgreSQL с ClickHouse:

* использование движка таблиц `PostgreSQL` для чтения данных из таблицы PostgreSQL
* использование экспериментального движка баз данных `MaterializedPostgreSQL` для синхронизации базы данных в PostgreSQL с базой данных в ClickHouse

:::tip
Мы рекомендуем использовать [ClickPipes](/integrations/clickpipes/postgres) — управляемый сервис интеграции для ClickHouse Cloud на базе PeerDB.
В качестве альтернативы [PeerDB](https://github.com/PeerDB-io/peerdb) доступен как open-source CDC‑инструмент, специально разработанный для репликации базы данных PostgreSQL как в самостоятельно развернутый ClickHouse, так и в ClickHouse Cloud.
:::

## Использование табличного движка PostgreSQL {#using-the-postgresql-table-engine}

Табличный движок `PostgreSQL` позволяет выполнять операции **SELECT** и **INSERT** над данными, хранящимися на удалённом сервере PostgreSQL, из ClickHouse.
В этой статье иллюстрируются базовые способы интеграции на примере одной таблицы.

### 1. Настройка PostgreSQL {#1-setting-up-postgresql}

1. В `postgresql.conf` добавьте следующую запись, чтобы разрешить PostgreSQL прослушивать сетевые интерфейсы:

```text
listen_addresses = '*'
```

2. Создайте пользователя для подключения из ClickHouse. Для демонстрации в этом примере ему назначаются полные права суперпользователя.

```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

3. Создайте новую базу данных в PostgreSQL:

```sql
CREATE DATABASE db_in_psg;
```

4. Создайте новую таблицу:

```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

5. Добавим несколько строк для тестирования:

```sql
INSERT INTO table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def');
```

6. Чтобы настроить PostgreSQL на разрешение подключений к новой базе данных от нового пользователя для репликации, добавьте следующую запись в файл `pg_hba.conf`. Обновите строку с адресом, указав подсеть или IP-адрес вашего сервера PostgreSQL:

```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db_in_psg             clickhouse_user 192.168.1.0/24          password
```

7. Перезагрузите конфигурацию `pg_hba.conf` (скорректируйте эту команду в соответствии с используемой версией PostgreSQL):

```text
/usr/pgsql-12/bin/pg_ctl reload
```

8. Убедитесь, что новый пользователь `clickhouse_user` может подключиться:

```text
psql -U clickhouse_user -W -d db_in_psg -h <ваш_хост_postgresql>
```

:::note
Если вы используете эту возможность в ClickHouse Cloud, возможно, вам потребуется разрешить IP-адресам ClickHouse Cloud доступ к вашему экземпляру PostgreSQL.
Обратитесь к ClickHouse [Cloud Endpoints API](/cloud/get-started/query-endpoints), чтобы получить сведения об исходящем трафике.
:::

### 2. Определите таблицу в ClickHouse {#2-define-a-table-in-clickhouse}

1. Подключитесь к `clickhouse-client`:

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. Создайте новую базу данных:

```sql
CREATE DATABASE db_in_ch;
```

3. Создайте таблицу, использующую `PostgreSQL`:

```sql
CREATE TABLE db_in_ch.table1
(
    id UInt64,
    column1 String
)
ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
```

Минимально необходимые параметры:

| parameter | Description                                   | example                       |
| --------- | --------------------------------------------- | ----------------------------- |
| host:port | имя хоста или IP и порт                       | postgres-host.domain.com:5432 |
| database  | имя базы данных PostgreSQL                    | db&#95;in&#95;psg             |
| user      | имя пользователя для подключения к PostgreSQL | clickhouse&#95;user           |
| password  | пароль для подключения к PostgreSQL           | ClickHouse&#95;123            |

:::note
См. страницу документации [PostgreSQL table engine](/engines/table-engines/integrations/postgresql) для полного списка параметров.
:::

### 3 Тестирование интеграции {#3-test-the-integration}

1. В ClickHouse просмотрите несколько первых строк:

```sql
SELECT * FROM db_in_ch.table1
```

Таблица ClickHouse должна автоматически заполниться двумя строками, которые уже существовали в таблице PostgreSQL:

```response
ID запроса: 34193d31-fe21-44ac-a182-36aaefbd78bf

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘
```

2. Вернитесь в PostgreSQL и добавьте несколько записей в таблицу:

```sql
INSERT INTO table1
  (id, column1)
VALUES
  (3, 'ghi'),
  (4, 'jkl');
```

4. Эти две новые строки должны появиться в вашей таблице ClickHouse:

```sql
SELECT * FROM db_in_ch.table1
```

Ответ должен выглядеть следующим образом:

```response
Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘
```

5. Давайте посмотрим, что произойдёт при добавлении строк в таблицу ClickHouse:

```sql
INSERT INTO db_in_ch.table1
  (id, column1)
VALUES
  (5, 'mno'),
  (6, 'pqr');
```

6. Строки, добавленные в ClickHouse, должны появиться в таблице PostgreSQL:

```sql
db_in_psg=# SELECT * FROM table1;
id | column1
----+---------
  1 | abc
  2 | def
  3 | ghi
  4 | jkl
  5 | mno
  6 | pqr
(6 rows)
```

В этом примере была продемонстрирована базовая интеграция между PostgreSQL и ClickHouse с использованием движка таблицы `PostrgeSQL`.
Ознакомьтесь с [документацией по движку таблицы PostgreSQL](/engines/table-engines/integrations/postgresql), чтобы узнать о дополнительных возможностях, таких как указание схем, возврат только подмножества столбцов и подключение к нескольким репликам. Также рекомендуем ознакомиться с записью в блоге [ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres).

## Использование движка базы данных MaterializedPostgreSQL {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />

<ExperimentalBadge />

Движок базы данных PostgreSQL использует возможности репликации PostgreSQL для создания реплики базы данных со всеми или частью схем и таблиц.
В этой статье показаны базовые методы интеграции на примере одной базы данных, одной схемы и одной таблицы.

***В описанных ниже процедурах используются PostgreSQL CLI (psql) и ClickHouse CLI (clickhouse-client). Сервер PostgreSQL установлен на Linux. Далее приведены минимальные настройки для новой тестовой установки базы данных PostgreSQL.***

### 1. В PostgreSQL {#1-in-postgresql}

1. В `postgresql.conf` установите минимальные параметры прослушивания, уровень WAL для репликации и слоты репликации:

добавьте следующие записи:

```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```

**ClickHouse требует минимальный уровень WAL `logical` и как минимум `2` слота репликации*

2. Используя учетную запись администратора, создайте пользователя для подключения из ClickHouse:

```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

**В демонстрационных целях предоставлены полные права суперпользователя.*

3. Создайте новую базу данных:

```sql
CREATE DATABASE db1;
```

4. подключитесь к новой базе данных через `psql`:

```text
\connect db1
```

5. Создайте новую таблицу:

```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

6. добавьте первые записи:

```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. Настройте PostgreSQL так, чтобы он разрешал подключения к новой базе данных новому пользователю для репликации. Ниже приведена минимально необходимая запись, которую нужно добавить в файл `pg_hba.conf`:

```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```

**для демонстрации здесь используется метод аутентификации с паролем в открытом виде. Обновите строку с адресом, указав либо подсеть, либо адрес сервера в соответствии с документацией PostgreSQL*

8. Перезагрузите конфигурацию `pg_hba.conf` с помощью команды вроде этой (с учетом вашей версии):

```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. Проверьте вход под новым пользователем `clickhouse_user`:

```text
 psql -U clickhouse_user -W -d db1 -h <ваш_хост_postgresql>
```

### 2. В ClickHouse {#2-in-clickhouse}

1. подключитесь к CLI ClickHouse

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. Включите экспериментальную поддержку PostgreSQL в движке базы данных:

```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. Создайте новую базу данных для репликации и создайте в ней начальную таблицу:

```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```

минимальные параметры:

| parameter | Описание                                      | пример                                                             |
| --------- | --------------------------------------------- | ------------------------------------------------------------------ |
| host:port | имя хоста или IP и порт                       | postgres-host.domain.com:5432                                      |
| database  | имя базы данных PostgreSQL                    | db1                                                                |
| user      | имя пользователя для подключения к PostgreSQL | clickhouse&#95;user                                                |
| password  | пароль для подключения к PostgreSQL           | ClickHouse&#95;123                                                 |
| settings  | дополнительные настройки для движка           | materialized&#95;postgresql&#95;tables&#95;list = &#39;table1&#39; |

:::info
Полное руководство по движку базы данных PostgreSQL см. в разделе [https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings](https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings)
:::

4. Убедитесь, что в исходной таблице есть данные:

```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: df2381ac-4e30-4535-b22e-8be3894aaafc

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 3. Проверьте базовую репликацию {#2-in-clickhouse}

1. В PostgreSQL добавьте новые строки:

```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. В ClickHouse проверьте, что новые строки видны:

```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: b0729816-3917-44d3-8d1a-fed912fb59ce

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  4 │ jkl     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 4. Итоги {#3-test-basic-replication}

В данном руководстве по интеграции был рассмотрен простой пример репликации базы данных с одной таблицей, однако существуют и более продвинутые варианты, включая репликацию всей базы данных или добавление новых таблиц и схем к уже настроенным репликациям. Хотя DDL-команды не поддерживаются в этой схеме репликации, движок можно настроить на обнаружение изменений и перезагрузку таблиц при внесении структурных изменений.

:::info
Для получения информации о расширенных возможностях см. [справочную документацию](/engines/database-engines/materialized-postgresql).
:::
