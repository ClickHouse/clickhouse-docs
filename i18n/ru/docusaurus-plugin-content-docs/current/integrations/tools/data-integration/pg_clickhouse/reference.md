---
sidebar_label: 'Справочник'
description: 'Полная справочная документация по pg_clickhouse'
slug: '/integrations/pg_clickhouse/reference'
title: 'Справочная документация по pg_clickhouse'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'foreign data wrapper', 'pg_clickhouse', 'extension']
---

# Справочная документация по pg_clickhouse \{#pg_clickhouse-reference-documentation\}

## Описание \{#description\}

pg_clickhouse — это расширение PostgreSQL, позволяющее удалённо выполнять запросы
к базам данных ClickHouse, включая реализацию [обёртки внешних данных (foreign data wrapper)]. Оно поддерживает
PostgreSQL 13 и новее и ClickHouse 23 и новее.

## Начало работы \{#getting-started\}

Самый простой способ попробовать pg&#95;clickhouse — использовать [образ Docker], который содержит
стандартный образ PostgreSQL с расширением pg&#95;clickhouse:

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres
```

См. [руководство](tutorial.md), чтобы начать импортировать таблицы ClickHouse и пробрасывать запросы.


## Использование \{#usage\}

```sql
CREATE EXTENSION pg_clickhouse;
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'default');
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA taxi FROM SERVER taxi_srv INTO taxi;
```


## Политика версионирования \{#versioning-policy\}

pg_clickhouse следует [Семантическому версионированию] для своих публичных релизов.

* Старшая версия увеличивается при изменениях API
* Младшая версия увеличивается при обратно совместимых изменениях SQL
* Патч-версия увеличивается при изменениях только на уровне бинарных файлов

После установки PostgreSQL отслеживает два варианта номера версии:

* Версия библиотеки (определяется `PG_MODULE_MAGIC` в PostgreSQL 18 и
    выше) включает полную семантическую версию, видимую в выводе функции
    `pg_get_loaded_modules()`.
* Версия расширения (определяется в control-файле) включает только старшую
    и младшую версии, видимую в таблице `pg_catalog.pg_extension`, в выводе
    функции `pg_available_extension_versions()` и в `\dx
    pg_clickhouse`.

На практике это означает, что релиз, который увеличивает патч-версию, например
с `v0.1.0` до `v0.1.1`, применяется ко всем базам данных, которые загрузили
`v0.1`, и им не нужно выполнять `ALTER EXTENSION`, чтобы получить преимущества
обновления.

Релиз, который увеличивает младшую или старшую версии, напротив, будет
сопровождаться SQL-скриптами обновления, и все существующие базы данных,
в которых установлено это расширение, должны выполнить `ALTER EXTENSION pg_clickhouse UPDATE`,
чтобы получить преимущества обновления.

## Справочник по SQL DDL \{#ddl-sql-reference\}

В следующих SQL-выражениях [DDL] используется pg_clickhouse.

### CREATE EXTENSION \{#create-extension\}

Используйте [CREATE EXTENSION], чтобы добавить pg&#95;clickhouse в базу данных:

```sql
CREATE EXTENSION pg_clickhouse;
```

Используйте `WITH SCHEMA`, чтобы установить его в конкретную схему (рекомендуется):

```sql
CREATE SCHEMA ch;
CREATE EXTENSION pg_clickhouse WITH SCHEMA ch;
```


### ALTER EXTENSION \{#alter-extension\}

Используйте [ALTER EXTENSION], чтобы изменить расширение pg_clickhouse. Примеры:

* После установки новой версии pg_clickhouse используйте оператор `UPDATE`:

    ```sql
    ALTER EXTENSION pg_clickhouse UPDATE;
    ```

* Используйте `SET SCHEMA`, чтобы перенести расширение в другую схему:

    ```sql
    CREATE SCHEMA ch;
    ALTER EXTENSION pg_clickhouse SET SCHEMA ch;
    ```

### DROP EXTENSION \{#drop-extension\}

Используйте [DROP EXTENSION], чтобы удалить расширение pg&#95;clickhouse из базы данных:

```sql
DROP EXTENSION pg_clickhouse;
```

Эта команда завершится с ошибкой, если существуют какие-либо объекты, зависящие от pg&#95;clickhouse. Используйте
предложение `CASCADE`, чтобы удалить и их:

```sql
DROP EXTENSION pg_clickhouse CASCADE;
```


### CREATE SERVER \{#create-server\}

Используйте [CREATE SERVER], чтобы создать внешний сервер для подключения к серверу ClickHouse. Пример:

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

Поддерживаемые параметры:

* `driver`: драйвер подключения к ClickHouse, который следует использовать — либо &quot;binary&quot;, либо
  &quot;http&quot;. **Обязательный.**
* `dbname`: база данных ClickHouse, которая будет использоваться при подключении. По умолчанию
  &quot;default&quot;.
* `host`: имя хоста сервера ClickHouse. По умолчанию &quot;localhost&quot;.
* `port`: порт для подключения к серверу ClickHouse. Значения по умолчанию:
  * 9440, если `driver` — &quot;binary&quot; и `host` является хостом ClickHouse Cloud
  * 9004, если `driver` — &quot;binary&quot; и `host` не является хостом ClickHouse Cloud
  * 8443, если `driver` — &quot;http&quot; и `host` является хостом ClickHouse Cloud
  * 8123, если `driver` — &quot;http&quot; и `host` не является хостом ClickHouse Cloud


### ALTER SERVER \{#alter-server\}

Используйте оператор [ALTER SERVER], чтобы изменить внешний сервер. Пример:

```sql
ALTER SERVER taxi_srv OPTIONS (SET driver 'http');
```

Параметры те же, что и для [CREATE SERVER](#create-server).


### DROP SERVER \{#drop-server\}

Используйте [DROP SERVER] для удаления внешнего сервера:

```sql
DROP SERVER taxi_srv;
```

Эта команда приведёт к ошибке, если от сервера зависят какие-либо другие объекты. Используйте `CASCADE`,
чтобы также удалить эти зависимости:

```sql
DROP SERVER taxi_srv CASCADE;
```


### CREATE USER MAPPING \{#create-user-mapping\}

Используйте [CREATE USER MAPPING], чтобы сопоставить пользователя PostgreSQL с пользователем ClickHouse. Например, чтобы сопоставить текущего пользователя PostgreSQL с удалённым пользователем ClickHouse при подключении к внешнему серверу `taxi_srv`:

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'demo');
```

Поддерживаемые параметры:

* `user`: Имя пользователя ClickHouse. По умолчанию — &quot;default&quot;.
* `password`: Пароль пользователя ClickHouse.


### ALTER USER MAPPING \{#alter-user-mapping\}

Используйте [ALTER USER MAPPING], чтобы изменить определение сопоставления пользователя:

```sql
ALTER USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (SET user 'default');
```

Параметры совпадают с параметрами для [CREATE USER MAPPING](#create-user-mapping).


### DROP USER MAPPING \{#drop-user-mapping\}

Используйте [DROP USER MAPPING] для удаления сопоставления пользователя:

```sql
DROP USER MAPPING FOR CURRENT_USER SERVER taxi_srv;
```


### IMPORT FOREIGN SCHEMA \{#import-foreign-schema\}

Используйте [IMPORT FOREIGN SCHEMA], чтобы импортировать все таблицы, определённые в базе данных ClickHouse, в качестве внешних таблиц в схему PostgreSQL:

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA demo FROM SERVER taxi_srv INTO taxi;
```

Используйте `LIMIT TO`, чтобы импортировать только определённые таблицы:

```sql
IMPORT FOREIGN SCHEMA demo LIMIT TO (trips) FROM SERVER taxi_srv INTO taxi;
```

Используйте `EXCEPT` для исключения таблиц:

```sql
IMPORT FOREIGN SCHEMA demo EXCEPT (users) FROM SERVER taxi_srv INTO taxi;
```

pg&#95;clickhouse получит список всех таблиц в указанной базе данных ClickHouse
(«demo» в приведённых выше примерах), получит определения столбцов для каждой
из них и выполнит команды [CREATE FOREIGN TABLE](#create-foreign-table) для создания
внешних таблиц. Столбцы будут определены с использованием [поддерживаемых типов
данных](#data-types) и, где это можно определить, опций, поддерживаемых [CREATE
FOREIGN TABLE](#create-foreign-table).

:::tip Imported Identifier Case Preservation

`IMPORT FOREIGN SCHEMA` выполняет `quote_identifier()` для импортируемых имён
таблиц и столбцов, что приводит к заключению в двойные кавычки идентификаторов
с прописными буквами или пробелами. Такие имена таблиц и столбцов, соответственно,
должны указываться в двойных кавычках в запросах PostgreSQL. Имена, состоящие
только из строчных букв и не содержащие пробелов, не нужно заключать в кавычки.

Например, для следующей таблицы ClickHouse:

```sql
 CREATE OR REPLACE TABLE test
 (
     id UInt64,
     Name TEXT,
     updatedAt DateTime DEFAULT now()
 )
 ENGINE = MergeTree
 ORDER BY id;
```

`IMPORT FOREIGN SCHEMA` создаёт следующую внешнюю таблицу:

```sql
 CREATE TABLE test
 (
     id          BIGINT      NOT NULL,
     "Name"      TEXT        NOT NULL,
     "updatedAt" TIMESTAMPTZ NOT NULL
 );
```

Поэтому в запросах такие имена нужно правильно заключать в кавычки, например:

```sql
 SELECT id, "Name", "updatedAt" FROM test;
```

Чтобы создать объекты с другими именами или именами целиком в нижнем регистре (а значит, нечувствительными к регистру), используйте [CREATE FOREIGN TABLE](#create-foreign-table).
:::


### CREATE FOREIGN TABLE \{#create-foreign-table\}

Используйте [CREATE FOREIGN TABLE], чтобы создать внешнюю таблицу, которая может выполнять запросы к данным в базе данных ClickHouse:

```sql
CREATE FOREIGN TABLE uact (
    user_id    bigint NOT NULL,
    page_views int,
    duration   smallint,
    sign       smallint
) SERVER taxi_srv OPTIONS(
    table_name 'uact'
    engine 'CollapsingMergeTree'
);
```

Поддерживаемые параметры таблицы:

* `database`: Имя удалённой базы данных. По умолчанию используется база данных,
  определённая для внешнего сервера.
* `table_name`: Имя удалённой таблицы. По умолчанию используется имя,
  указанное для внешней таблицы.
* `engine`: [Движок таблицы], используемый таблицей ClickHouse. Для
  `CollapsingMergeTree()` и `AggregatingMergeTree()` pg&#95;clickhouse
  автоматически применяет параметры к функциональным выражениям,
  выполняемым над таблицей.

Используйте [тип данных](#data-types), соответствующий удалённому типу данных
ClickHouse для каждого столбца. Для столбцов типа [AggregateFunction Type] и
[SimpleAggregateFunction Type] сопоставьте тип данных с типом ClickHouse,
передаваемым в функцию, и укажите имя агрегатной функции через соответствующий
параметр столбца:

* `AggregateFunction`: Имя агрегатной функции, применённой к столбцу
  типа [AggregateFunction Type]
* `SimpleAggregateFunction`: Имя агрегатной функции, применённой к
  столбцу типа [SimpleAggregateFunction Type]

Пример:

(aggregatefunction &#39;sum&#39;)

```sql
CREATE FOREIGN TABLE test (
    column1 bigint  OPTIONS(AggregateFunction 'uniq'),
    column2 integer OPTIONS(AggregateFunction 'anyIf'),
    column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
) SERVER clickhouse_srv;
```

Для столбцов с типом `AggregateFunction` pg&#95;clickhouse автоматически добавит `Merge` к агрегатной функции, применяемой к этому столбцу.


### ALTER FOREIGN TABLE \{#alter-foreign-table\}

Используйте команду [ALTER FOREIGN TABLE], чтобы изменить определение внешней таблицы:

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

Поддерживаемые параметры таблиц и столбцов совпадают с параметрами для [CREATE FOREIGN
TABLE].


### DROP FOREIGN TABLE \{#drop-foreign-table\}

Используйте оператор [DROP FOREIGN TABLE] для удаления внешней таблицы:

```sql
DROP FOREIGN TABLE uact;
```

Эта команда завершится с ошибкой, если существуют какие-либо объекты, зависящие от внешней таблицы.
Используйте ключевое слово `CASCADE`, чтобы удалить и их:

```sql
DROP FOREIGN TABLE uact CASCADE;
```


## Справочник по SQL DML \{#dml-sql-reference\}

SQL-выражения [DML], приведённые ниже, могут использовать pg&#95;clickhouse. Примеры зависят от следующих таблиц ClickHouse, созданных скриптом [make-logs.sql]:

```sql
CREATE TABLE logs (
    req_id    Int64 NOT NULL,
    start_at   DateTime64(6, 'UTC') NOT NULL,
    duration  Int32 NOT NULL,
    resource  Text  NOT NULL,
    method    Enum8('GET' = 1, 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH', 'QUERY') NOT NULL,
    node_id   Int64 NOT NULL,
    response  Int32 NOT NULL
) ENGINE = MergeTree
  ORDER BY start_at;

CREATE TABLE nodes (
    node_id Int64 NOT NULL,
    name    Text  NOT NULL,
    region  Text  NOT NULL,
    arch    Text  NOT NULL,
    os      Text  NOT NULL
) ENGINE = MergeTree
  PRIMARY KEY node_id;
```


### EXPLAIN \{#explain\}

Команда [EXPLAIN] работает как и ожидается, но опция `VERBOSE` приводит к тому, что выполняется запрос ClickHouse &quot;Remote SQL&quot;:

```pgsql
try=# EXPLAIN (VERBOSE)
       SELECT resource, avg(duration) AS average_duration
         FROM logs
        GROUP BY resource;
                                     QUERY PLAN
------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=64)
   Output: resource, (avg(duration))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT resource, avg(duration) FROM "default".logs GROUP BY resource
(4 rows)
```

Этот запрос пробрасывается в ClickHouse в виде
удалённого SQL через плановый узел &quot;Foreign Scan&quot;.


### SELECT \{#select\}

Используйте оператор [SELECT] для выполнения запросов к таблицам pg&#95;clickhouse аналогично любым другим таблицам:

```pgsql
try=# SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
          start_at          | duration |    resource
----------------------------+----------+----------------
 2025-12-05 15:07:32.944188 |      175 | /widgets/totam
(1 row)
```

pg&#95;clickhouse работает таким образом, чтобы по возможности передавать выполнение запроса в ClickHouse, включая агрегатные функции. Используйте [EXPLAIN](#explain), чтобы определить степень такого делегирования. Для приведённого выше запроса, например, всё выполнение полностью передаётся в ClickHouse.

```pgsql
try=# EXPLAIN (VERBOSE, COSTS OFF)
       SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
                                             QUERY PLAN
-----------------------------------------------------------------------------------------------------
 Foreign Scan on public.logs
   Output: start_at, duration, resource
   Remote SQL: SELECT start_at, duration, resource FROM "default".logs WHERE ((req_id = 4117909262))
(3 rows)
```

pg&#95;clickhouse также проталкивает выполнение операций JOIN к таблицам, расположенным на том же удалённом сервере:

```pgsql
try=# EXPLAIN (ANALYZE, VERBOSE)
       SELECT name, count(*), round(avg(duration))
         FROM logs
         LEFT JOIN nodes on logs.node_id = nodes.node_id
        GROUP BY name;
                                                                                  QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=72) (actual time=3.201..3.221 rows=8.00 loops=1)
   Output: nodes.name, (count(*)), (round(avg(logs.duration), 0))
   Relations: Aggregate on ((logs) LEFT JOIN (nodes))
   Remote SQL: SELECT r2.name, count(*), round(avg(r1.duration), 0) FROM  "default".logs r1 ALL LEFT JOIN "default".nodes r2 ON (((r1.node_id = r2.node_id))) GROUP BY r2.name
   FDW Time: 0.086 ms
 Planning Time: 0.335 ms
 Execution Time: 3.261 ms
(7 rows)
```

Выполнение JOIN с локальной таблицей приводит к менее эффективным запросам без
тщательной настройки. В этом примере мы создаём локальную копию таблицы
`nodes` и выполняем соединение с ней вместо удалённой таблицы:


```pgsql
try=# CREATE TABLE local_nodes AS SELECT * FROM nodes;
SELECT 8

try=# EXPLAIN (ANALYZE, VERBOSE)
       SELECT name, count(*), round(avg(duration))
         FROM logs
         LEFT JOIN local_nodes on logs.node_id = local_nodes.node_id
        GROUP BY name;
                                                             QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------------------
 HashAggregate  (cost=147.65..150.65 rows=200 width=72) (actual time=6.215..6.235 rows=8.00 loops=1)
   Output: local_nodes.name, count(*), round(avg(logs.duration), 0)
   Group Key: local_nodes.name
   Batches: 1  Memory Usage: 32kB
   Buffers: shared hit=1
   ->  Hash Left Join  (cost=31.02..129.28 rows=2450 width=36) (actual time=2.202..5.125 rows=1000.00 loops=1)
         Output: local_nodes.name, logs.duration
         Hash Cond: (logs.node_id = local_nodes.node_id)
         Buffers: shared hit=1
         ->  Foreign Scan on public.logs  (cost=10.00..20.00 rows=1000 width=12) (actual time=2.089..3.779 rows=1000.00 loops=1)
               Output: logs.req_id, logs.start_at, logs.duration, logs.resource, logs.method, logs.node_id, logs.response
               Remote SQL: SELECT duration, node_id FROM "default".logs
               FDW Time: 1.447 ms
         ->  Hash  (cost=14.90..14.90 rows=490 width=40) (actual time=0.090..0.091 rows=8.00 loops=1)
               Output: local_nodes.name, local_nodes.node_id
               Buckets: 1024  Batches: 1  Memory Usage: 9kB
               Buffers: shared hit=1
               ->  Seq Scan on public.local_nodes  (cost=0.00..14.90 rows=490 width=40) (actual time=0.069..0.073 rows=8.00 loops=1)
                     Output: local_nodes.name, local_nodes.node_id
                     Buffers: shared hit=1
 Planning:
   Buffers: shared hit=14
 Planning Time: 0.551 ms
 Execution Time: 6.589 ms
```

В этом случае мы можем переложить больше работы по агрегации на ClickHouse,
выполняя группировку по `node_id` вместо локального столбца, а затем
выполнить JOIN с таблицей соответствия:


```sql
try=# EXPLAIN (ANALYZE, VERBOSE)
       WITH remote AS (
           SELECT node_id, count(*), round(avg(duration))
             FROM logs
            GROUP BY node_id
       )
       SELECT name, remote.count, remote.round
         FROM remote
         JOIN local_nodes
           ON remote.node_id = local_nodes.node_id
        ORDER BY name;
                                                          QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------------
 Sort  (cost=65.68..66.91 rows=490 width=72) (actual time=4.480..4.484 rows=8.00 loops=1)
   Output: local_nodes.name, remote.count, remote.round
   Sort Key: local_nodes.name
   Sort Method: quicksort  Memory: 25kB
   Buffers: shared hit=4
   ->  Hash Join  (cost=27.60..43.79 rows=490 width=72) (actual time=4.406..4.422 rows=8.00 loops=1)
         Output: local_nodes.name, remote.count, remote.round
         Inner Unique: true
         Hash Cond: (local_nodes.node_id = remote.node_id)
         Buffers: shared hit=1
         ->  Seq Scan on public.local_nodes  (cost=0.00..14.90 rows=490 width=40) (actual time=0.010..0.016 rows=8.00 loops=1)
               Output: local_nodes.node_id, local_nodes.name, local_nodes.region, local_nodes.arch, local_nodes.os
               Buffers: shared hit=1
         ->  Hash  (cost=15.10..15.10 rows=1000 width=48) (actual time=4.379..4.381 rows=8.00 loops=1)
               Output: remote.count, remote.round, remote.node_id
               Buckets: 1024  Batches: 1  Memory Usage: 9kB
               ->  Subquery Scan on remote  (cost=1.00..15.10 rows=1000 width=48) (actual time=4.337..4.360 rows=8.00 loops=1)
                     Output: remote.count, remote.round, remote.node_id
                     ->  Foreign Scan  (cost=1.00..5.10 rows=1000 width=48) (actual time=4.330..4.349 rows=8.00 loops=1)
                           Output: logs.node_id, (count(*)), (round(avg(logs.duration), 0))
                           Relations: Aggregate on (logs)
                           Remote SQL: SELECT node_id, count(*), round(avg(duration), 0) FROM "default".logs GROUP BY node_id
                           FDW Time: 0.055 ms
 Planning:
   Buffers: shared hit=5
 Planning Time: 0.319 ms
 Execution Time: 4.562 ms
```

Узел &quot;Foreign Scan&quot; теперь выполняет агрегацию по `node_id` на удалённой стороне, уменьшая
количество строк, которые нужно вернуть в Postgres, с 1000 (всех)
до всего лишь 8, по одной на каждый узел.


### PREPARE, EXECUTE, DEALLOCATE \{#prepare-execute-deallocate\}

Начиная с версии v0.1.2, pg&#95;clickhouse поддерживает параметризованные запросы, как правило создаваемые командой [PREPARE]:

```pgsql
try=# PREPARE avg_durations_between_dates(date, date) AS
       SELECT date(start_at), round(avg(duration)) AS average_duration
         FROM logs
        WHERE date(start_at) BETWEEN $1 AND $2
        GROUP BY date(start_at)
        ORDER BY date(start_at);
PREPARE
```

Используйте [EXECUTE] как обычно, чтобы выполнить подготовленный запрос:

```pgsql
try=# EXECUTE avg_durations_between_dates('2025-12-09', '2025-12-13');
    date    | average_duration
------------+------------------
 2025-12-09 |              190
 2025-12-10 |              194
 2025-12-11 |              197
 2025-12-12 |              190
 2025-12-13 |              195
(5 rows)
```

pg&#95;clickhouse, как и обычно, проталкивает агрегации на нижележащий уровень, что видно из подробного вывода [EXPLAIN](#explain):

```pgsql
try=# EXPLAIN (VERBOSE) EXECUTE avg_durations_between_dates('2025-12-09', '2025-12-13');
                                                                                                            QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=36)
   Output: (date(start_at)), (round(avg(duration), 0))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT date(start_at), round(avg(duration), 0) FROM "default".logs WHERE ((date(start_at) >= '2025-12-09')) AND ((date(start_at) <= '2025-12-13')) GROUP BY (date(start_at)) ORDER BY date(start_at) ASC NULLS LAST
(4 rows)
```

Обратите внимание, что отправлены полные значения дат, а не шаблоны параметров.
Это справедливо для первых пяти запросов, как описано в PostgreSQL
[PREPARE notes]. При шестом выполнении он отправляет в ClickHouse
параметры запроса в формате `{param:type}`:
параметры:

```pgsql
                                                                                                         QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=36)
   Output: (date(start_at)), (round(avg(duration), 0))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT date(start_at), round(avg(duration), 0) FROM "default".logs WHERE ((date(start_at) >= {p1:Date})) AND ((date(start_at) <= {p2:Date})) GROUP BY (date(start_at)) ORDER BY date(start_at) ASC NULLS LAST
(4 rows)
```

Используйте [DEALLOCATE], чтобы освободить подготовленный запрос:

```pgsql
try=# DEALLOCATE avg_durations_between_dates;
DEALLOCATE
```


### INSERT \{#insert\}

Используйте команду [INSERT], чтобы вставлять значения в удалённую таблицу ClickHouse:

```pgsql
try=# INSERT INTO nodes(node_id, name, region, arch, os)
VALUES (9,  'Augustin Gamarra', 'us-west-2', 'amd64', 'Linux')
     , (10, 'Cerisier', 'us-east-2', 'amd64', 'Linux')
     , (11, 'Dewalt', 'use-central-1', 'arm64', 'macOS')
;
INSERT 0 3
```


### COPY \{#copy\}

Используйте команду [COPY], чтобы вставить пакет строк в удалённую таблицу
ClickHouse:

```pgsql
try=# COPY logs FROM stdin CSV;
4285871863,2025-12-05 11:13:58.360760,206,/widgets,POST,8,401
4020882978,2025-12-05 11:33:48.248450,199,/users/1321945,HEAD,3,200
3231273177,2025-12-05 12:20:42.158575,220,/search,GET,2,201
\.
>> COPY 3
```

> **⚠️ Ограничения Batch API**
>
> В pg&#95;clickhouse ещё не реализована поддержка PostgreSQL FDW Batch Insert API.
> Поэтому [COPY] в настоящее время использует команды [INSERT](#insert) для
> вставки записей. Это будет улучшено в одном из следующих релизов.


### LOAD \{#load\}

Используйте [LOAD], чтобы загрузить общую библиотеку pg&#95;clickhouse:

```pgsql
try=# LOAD 'pg_clickhouse';
LOAD
```

Обычно нет необходимости использовать [LOAD], так как Postgres автоматически загружает
pg&#95;clickhouse при первом использовании любой из его возможностей (функции, внешние
таблицы и т. д.).

Единственный случай, когда может быть полезно выполнить [LOAD] для pg&#95;clickhouse, — это задать с помощью [SET](#set)
параметры pg&#95;clickhouse перед выполнением зависящих от них запросов.


### SET \{#set\}

Используйте [SET], чтобы задать параметр времени выполнения `pg_clickhouse.session_settings`.
Этот параметр настраивает [параметры ClickHouse], которые будут применены к последующим
запросам. Пример:

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

По умолчанию — `join_use_nulls 1`. Установите пустую строку, чтобы перейти к использованию настроек сервера ClickHouse.

```sql
SET pg_clickhouse.session_settings = '';
```

Синтаксис: список пар ключ/значение, разделённых запятыми; ключ и значение в паре разделяются одним или несколькими пробелами. Ключи должны соответствовать [настройкам ClickHouse]. В значениях экранируйте пробелы, запятые и обратные косые черты с помощью обратной косой черты:

```sql
SET pg_clickhouse.session_settings = 'join_algorithm grace_hash\,hash';
```

Или используйте значения в одинарных кавычках, чтобы избежать экранирования пробелов и запятых; рассмотрите возможность использования [dollar quoting], чтобы избежать необходимости двойного заключения в кавычки:

```sql
SET pg_clickhouse.session_settings = $$join_algorithm 'grace_hash,hash'$$;
```

Если для вас важна читаемость и нужно задать много параметров, используйте несколько строк, например:

```sql
SET pg_clickhouse.session_settings TO $$
    connect_timeout 2,
    count_distinct_implementation uniq,
    final 1,
    group_by_use_nulls 1,
    join_algorithm 'prefer_partial_merge',
    join_use_nulls 1,
    log_queries_min_type QUERY_FINISH,
    max_block_size 32768,
    max_execution_time 45,
    max_result_rows 1024,
    metrics_perf_events_list 'this,that',
    network_compression_method ZSTD,
    poll_interval 5,
    totals_mode after_having_auto
$$;
```

pg&#95;clickhouse не проверяет настройки, а передаёт их в ClickHouse
для каждого запроса. Тем самым он поддерживает все настройки для каждой версии ClickHouse.

Обратите внимание, что pg&#95;clickhouse должен быть загружен до задания
`pg_clickhouse.session_settings`; либо используйте [предзагрузку общей библиотеки], либо
просто используйте один из объектов расширения, чтобы гарантировать его загрузку.


### ALTER ROLE \{#alter-role\}

Используйте команду `SET` оператора [ALTER ROLE] для [предварительной загрузки](#preloading) pg&#95;clickhouse
и/или [настройки](#set) его параметров для определённых ролей:

```pgsql
try=# ALTER ROLE CURRENT_USER SET session_preload_libraries = pg_clickhouse;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER SET pg_clickhouse.session_settings = 'final 1';
ALTER ROLE
```

Используйте команду `RESET` оператора [ALTER ROLE], чтобы сбросить предзагрузку pg&#95;clickhouse и/или его параметры:

```pgsql
try=# ALTER ROLE CURRENT_USER RESET session_preload_libraries;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER RESET pg_clickhouse.session_settings;
ALTER ROLE
```


## Предварительная загрузка \{#preloading\}

Если каждому или почти каждому подключению к Postgres нужно использовать pg_clickhouse,
рассмотрите возможность использования [предварительной загрузки общих библиотек], чтобы он загружался автоматически:

### `session_preload_libraries` \{#session_preload_libraries\}

Загружает разделяемую библиотеку для каждого нового соединения с PostgreSQL:

```ini
session_preload_libraries = pg_clickhouse
```

Полезно, чтобы применять обновления без перезапуска сервера: достаточно
просто переподключиться. Этот параметр также можно задать для отдельных пользователей или ролей с помощью [ALTER
ROLE](#alter-role).


### `shared_preload_libraries` \{#shared_preload_libraries\}

Загружает общую библиотеку в родительский процесс PostgreSQL при запуске:

```ini
shared_preload_libraries = pg_clickhouse
```

Полезно для экономии памяти и снижения накладных расходов на загрузку в каждом сеансе, но при обновлении библиотеки требуется перезапуск кластера.


## Справочник функций и операторов \{#function-and-operator-reference\}

### Типы данных \{#data-types\}

pg_clickhouse сопоставляет следующие типы данных ClickHouse с типами данных
PostgreSQL:

| ClickHouse |    PostgreSQL    |                   Примечания                    |
| -----------|------------------|-------------------------------------------------|
| Bool       | boolean          |                                                 |
| Date       | date             |                                                 |
| Date32     | date             |                                                 |
| DateTime   | timestamp        |                                                 |
| Decimal    | numeric          |                                                 |
| Float32    | real             |                                                 |
| Float64    | double precision |                                                 |
| IPv4       | inet             |                                                 |
| IPv6       | inet             |                                                 |
| Int16      | smallint         |                                                 |
| Int32      | integer          |                                                 |
| Int64      | bigint           |                                                 |
| Int8       | smallint         |                                                 |
| JSON       | jsonb            | только для HTTP-движка                         |
| String     | text             |                                                 |
| UInt16     | integer          |                                                 |
| UInt32     | bigint           |                                                 |
| UInt64     | bigint           | Ошибка для значений > максимального значения BIGINT |
| UInt8      | smallint         |                                                 |
| UUID       | uuid             |                                                 |

### Функции \{#functions\}

Эти функции предоставляют интерфейс для выполнения запросов к базе данных ClickHouse.

#### `clickhouse_raw_query` \{#clickhouse_raw_query\}

```sql
SELECT clickhouse_raw_query(
    'CREATE TABLE t1 (x String) ENGINE = Memory',
    'host=localhost port=8123'
);
```

Подключается к серверу ClickHouse через его HTTP‑интерфейс, выполняет один
запрос и отключается. Необязательный второй аргумент задаёт строку
подключения, по умолчанию `host=localhost port=8123`. Поддерживаемые
параметры подключения:

* `host`: Хост, к которому выполняется подключение; обязательный параметр.
* `port`: HTTP‑порт для подключения; по умолчанию `8123`, если только `host`
  не является хостом ClickHouse Cloud, — в этом случае по умолчанию используется `8443`
* `dbname`: Имя базы данных, к которой выполняется подключение.
* `username`: Имя пользователя, под которым выполняется подключение; по
  умолчанию `default`
* `password`: Пароль, используемый для аутентификации; по умолчанию пароль
  не используется

Полезно для запросов, которые не возвращают записей; результаты запросов,
которые возвращают значения, возвращаются в виде одного текстового значения:

```sql
SELECT clickhouse_raw_query(
    'SELECT schema_name, schema_owner from information_schema.schemata',
    'host=localhost port=8123'
);
```

```sql
      clickhouse_raw_query
---------------------------------
 INFORMATION_SCHEMA      default+
 default default                +
 git     default                +
 information_schema      default+
 system  default                +

(1 row)
```


### Функции pushdown \{#pushdown-functions\}

Все встроенные функции PostgreSQL, используемые в условных выражениях (предложения `HAVING` и `WHERE`)
для выполнения запросов к внешним таблицам ClickHouse, автоматически передаются на выполнение в ClickHouse
с теми же именами и сигнатурами. Однако у некоторых функций другие
имена или сигнатуры, и их необходимо сопоставить с их эквивалентами в ClickHouse. `pg_clickhouse`
сопоставляет следующие функции:

* `date_part`:
  * `date_part('day')`: [toDayOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfMonth)
  * `date_part('doy')`: [toDayOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfYear)
  * `date_part('dow')`: [toDayOfWeek](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfWeek)
  * `date_part('year')`: [toYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toYear)
  * `date_part('month')`: [toMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonth)
  * `date_part('hour')`: [toHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toHour)
  * `date_part('minute')`: [toMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMinute)
  * `date_part('second')`: [toSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toSecond)
  * `date_part('quarter')`: [toQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toQuarter)
  * `date_part('isoyear')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOYear)
  * `date_part('week')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOWeek)
  * `date_part('epoch')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toUnixTimestamp)
* `date_trunc`:
  * `date_trunc('week')`: [toMonday](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonday)
  * `date_trunc('second')`: [toStartOfSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfSecond)
  * `date_trunc('minute')`: [toStartOfMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMinute)
  * `date_trunc('hour')`: [toStartOfHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfHour)
  * `date_trunc('day')`: [toStartOfDay](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfDay)
  * `date_trunc('month')`: [toStartOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMonth)
  * `date_trunc('quarter')`: [toStartOfQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfQuarter)
  * `date_trunc('year')`: [toStartOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfYear)
* `array_position`: [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)
* `btrim`: [trimBoth](https://clickhouse.com/docs/sql-reference/functions/string-functions#trimboth)
* `strpos`: [position](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#position)
* `regexp_like`: [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)

### Пользовательские функции \{#custom-functions\}

Эти пользовательские функции, созданные `pg_clickhouse`, обеспечивают проталкивание (pushdown) удалённых запросов для отдельных функций ClickHouse, не имеющих эквивалентов в PostgreSQL. Если какую-либо из этих функций нельзя протолкнуть, будет возбуждено исключение.

* [dictGet](https://clickhouse.com/docs/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)

### Pushdown-приведения типов \{#pushdown-casts\}

pg_clickhouse проталкивает приведения типов, такие как `CAST(x AS bigint)`, для совместимых
типов данных. Для несовместимых типов операция pushdown завершится ошибкой; если `x` в этом
примере — ClickHouse `UInt64`, ClickHouse откажется выполнять такое приведение.

Для того чтобы выполнять pushdown-приведения к несовместимым типам данных, pg_clickhouse предоставляет
следующие функции. Они вызывают исключение в PostgreSQL, если приведение не было протолкнуто в ClickHouse.

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### Pushdown-агрегаты \{#pushdown-aggregates\}

Эти агрегатные функции PostgreSQL выполняются в ClickHouse посредством pushdown.

* [array_agg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/grouparray)
* [avg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/avg)
* [count](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count)
* [min](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/min)
* [max](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/max)

### Пользовательские агрегаты \{#custom-aggregates\}

Эти пользовательские агрегатные функции, созданные `pg_clickhouse`, обеспечивают проталкивание удалённых запросов (foreign query pushdown) для отдельных агрегатных функций ClickHouse, не имеющих эквивалентов в PostgreSQL. Если какую-либо из этих функций невозможно протолкнуть, будет сгенерировано исключение.

* [argMax](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmax)
* [argMin](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmin)
* [uniq](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqHLL12](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqTheta](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqthetasketch)
* [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)

### Pushdown Ordered Set Aggregates \{#pushdown-ordered-set-aggregates\}

Эти [ordered-set aggregate functions] сопоставляются с [Parametric aggregate functions] в ClickHouse: их *прямой аргумент* передается как параметр, а выражения `ORDER BY` — как аргументы. Например, этот запрос PostgreSQL:

```sql
SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY a) FROM t1;
```

Соответствует следующему запросу ClickHouse:

```sql
SELECT quantile(0.25)(a) FROM t1;
```

Учтите, что явные суффиксы `ORDER BY` `DESC` и `NULLS FIRST`
не поддерживаются и приведут к ошибке.

* `percentile_cont(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantile(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantileExact(double)`: [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)


## Автор \{#authors\}

[David E. Wheeler](https://justatheory.com/)

## Авторские права \{#copyright\}

Copyright (c) 2025-2026, ClickHouse

[foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html "Документация PostgreSQL: Написание обёртки для внешних данных"

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "Последняя версия в Docker Hub"

[ClickHouse]: https://clickhouse.com/clickhouse

[Semantic Versioning]: https://semver.org/spec/v2.0.0.html "Семантическое версионирование 2.0.0"

[DDL]: https://en.wikipedia.org/wiki/Data_definition_language "Википедия: язык описания данных"

[CREATE EXTENSION]: https://www.postgresql.org/docs/current/sql-createextension.html "Документация PostgreSQL: CREATE EXTENSION"

[ALTER EXTENSION]: https://www.postgresql.org/docs/current/sql-alterextension.html "Документация PostgreSQL: ALTER EXTENSION"

[DROP EXTENSION]: https://www.postgresql.org/docs/current/sql-dropextension.html "Документация PostgreSQL: DROP EXTENSION"

[CREATE SERVER]: https://www.postgresql.org/docs/current/sql-createserver.html "Документация PostgreSQL: CREATE SERVER"

[ALTER SERVER]: https://www.postgresql.org/docs/current/sql-alterserver.html "Документация PostgreSQL: ALTER SERVER"

[DROP SERVER]: https://www.postgresql.org/docs/current/sql-dropserver.html "Документация PostgreSQL: DROP SERVER"

[CREATE USER MAPPING]: https://www.postgresql.org/docs/current/sql-createusermapping.html "Документация PostgreSQL: CREATE USER MAPPING"

[ALTER USER MAPPING]: https://www.postgresql.org/docs/current/sql-alterusermapping.html "Документация PostgreSQL: ALTER USER MAPPING"

[DROP USER MAPPING]: https://www.postgresql.org/docs/current/sql-dropusermapping.html "Документация PostgreSQL: DROP USER MAPPING"

[IMPORT FOREIGN SCHEMA]: https://www.postgresql.org/docs/current/sql-importforeignschema.html "Документация PostgreSQL: IMPORT FOREIGN SCHEMA"

[CREATE FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-createforeigntable.html "Документация PostgreSQL: CREATE FOREIGN TABLE"

[table engine]: https://clickhouse.com/docs/engines/table-engines "Документация ClickHouse: Движки таблиц"

[AggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/aggregatefunction "Документация ClickHouse: тип AggregateFunction"

[SimpleAggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/simpleaggregatefunction "Документация ClickHouse: тип SimpleAggregateFunction"

[ALTER FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-alterforeigntable.html "Документация PostgreSQL: ALTER FOREIGN TABLE"

[DROP FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-dropforeigntable.html "Документация PostgreSQL: DROP FOREIGN TABLE"

[DML]: https://en.wikipedia.org/wiki/Data_manipulation_language "Wikipedia: Data manipulation language"

[make-logs.sql]: https://github.com/ClickHouse/pg_clickhouse/blob/main/doc/make-logs.sql

[EXPLAIN]: https://www.postgresql.org/docs/current/sql-explain.html "Документация PostgreSQL: EXPLAIN"

[SELECT]: https://www.postgresql.org/docs/current/sql-select.html "Документация PostgreSQL: SELECT"

[PREPARE]: https://www.postgresql.org/docs/current/sql-prepare.html "Документация PostgreSQL: PREPARE"

[EXECUTE]: https://www.postgresql.org/docs/current/sql-execute.html "Документация PostgreSQL: EXECUTE"

[DEALLOCATE]: https://www.postgresql.org/docs/current/sql-deallocate.html "Документация PostgreSQL: DEALLOCATE"

[PREPARE]: https://www.postgresql.org/docs/current/sql-prepare.html "Документация PostgreSQL: PREPARE"

[INSERT]: https://www.postgresql.org/docs/current/sql-insert.html "Документация PostgreSQL: INSERT"

[COPY]: https://www.postgresql.org/docs/current/sql-copy.html "Документация PostgreSQL: COPY"

[LOAD]: https://www.postgresql.org/docs/current/sql-load.html "Документация PostgreSQL: LOAD"

[SET]: https://www.postgresql.org/docs/current/sql-set.html "Документация PostgreSQL: SET"

[ALTER ROLE]: https://www.postgresql.org/docs/current/sql-alterrole.html "Документация PostgreSQL: ALTER ROLE"

[агрегатные функции упорядоченного набора]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE

[Параметрические агрегатные функции]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions

[ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings
    "Документация ClickHouse: параметры сессии"

[dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
    "Документация PostgreSQL: строковые константы в долларовых кавычках"

[library preloading]: https://www.postgresql.org/docs/18/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD

"Документация PostgreSQL: предварительная загрузка разделяемых библиотек
  [PREPARE notes]: https://www.postgresql.org/docs/current/sql-prepare.html#SQL-PREPARE-NOTES
    "Документация PostgreSQL: примечания к PREPARE"
  [query parameters]: https://clickhouse.com/docs/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse
    "Документация ClickHouse: альтернативы подготовленным запросам в ClickHouse"