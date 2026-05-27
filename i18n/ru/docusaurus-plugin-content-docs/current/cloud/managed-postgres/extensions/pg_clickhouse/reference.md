---
sidebar_label: 'Справочник'
description: 'Полная справочная документация по pg_clickhouse'
slug: '/cloud/managed-postgres/extensions/pg_clickhouse/reference'
title: 'Справочная документация по pg_clickhouse'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'обёртка внешних данных', 'pg_clickhouse', 'расширение']
---

## Описание \{#description\}

pg&#95;clickhouse — это расширение PostgreSQL, которое позволяет выполнять удалённые запросы
к базам данных ClickHouse, включая [обёртку внешних данных]. Оно поддерживает
PostgreSQL 13 и выше, а также ClickHouse 23 и выше.

## Начало работы \{#getting-started\}

Самый простой способ опробовать pg&#95;clickhouse — воспользоваться [Docker image], который представляет собой
стандартный Docker-образ PostgreSQL с расширениями pg&#95;clickhouse и [re2][re2
extension]:

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres
```

См. [руководство](tutorial.md), чтобы начать импорт таблиц ClickHouse и
выполнять запросы на стороне источника данных.

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

pg&#95;clickhouse придерживается [семантического версионирования] в своих публичных релизах.

* Основная версия увеличивается при изменениях API
* Дополнительная версия увеличивается при обратно совместимых изменениях SQL
* Патч-версия увеличивается при изменениях только в бинарном файле

После установки PostgreSQL отслеживает два варианта версии:

* Версия библиотеки (определяемая через `PG_MODULE_MAGIC` в PostgreSQL 18 и
  выше) включает полную семантическую версию; её можно увидеть в выводе
  функции `pgch_version()` или функции Postgres [`pg_get_loaded_modules()`].
* Версия расширения (определяемая в control-файле) включает только основную
  и дополнительную версии; они видны в таблице `pg_catalog.pg_extension`, в
  выводе функции `pg_available_extension_versions()` и в `\dx
  pg_clickhouse`.

На практике это означает, что релиз с увеличением патч-версии, например
с `v0.1.0` до `v0.1.1`, приносит пользу всем базам данных, в которых загружена `v0.1`, и
не требует выполнения `ALTER EXTENSION`, чтобы получить обновление.

Релиз с увеличением дополнительной или основной версии, напротив,
будет сопровождаться SQL-скриптами обновления, и все существующие базы данных, содержащие
расширение, должны выполнить `ALTER EXTENSION pg_clickhouse UPDATE`, чтобы получить
обновление.

## Справочник по SQL DDL \{#ddl-sql-reference\}

В следующих SQL-выражениях [DDL] используется pg&#95;clickhouse.

### CREATE EXTENSION \{#create-extension\}

Используйте [CREATE EXTENSION], чтобы добавить расширение pg&#95;clickhouse в базу данных:

```sql
CREATE EXTENSION pg_clickhouse;
```

Используйте `WITH SCHEMA`, чтобы установить расширение в определённую схему (рекомендуется):

```sql
CREATE SCHEMA ch;
CREATE EXTENSION pg_clickhouse WITH SCHEMA ch;
```

### ALTER EXTENSION \{#alter-extension\}

Используйте [ALTER EXTENSION], чтобы изменить расширение pg&#95;clickhouse. Примеры:

* После установки новой версии pg&#95;clickhouse используйте предложение `UPDATE`:

  ```sql
  ALTER EXTENSION pg_clickhouse UPDATE;
  ```

* Используйте `SET SCHEMA`, чтобы переместить расширение в новую схему:

  ```sql
  CREATE SCHEMA ch;
  ALTER EXTENSION pg_clickhouse SET SCHEMA ch;
  ```

### DROP EXTENSION \{#drop-extension\}

Чтобы удалить pg&#95;clickhouse из базы данных, используйте [DROP EXTENSION]:

```sql
DROP EXTENSION pg_clickhouse;
```

Эта команда завершится ошибкой, если есть объекты, зависящие от pg&#95;clickhouse. Используйте
клаузу `CASCADE`, чтобы удалить и их:

```sql
DROP EXTENSION pg_clickhouse CASCADE;
```

### CREATE SERVER \{#create-server\}

Используйте [CREATE SERVER], чтобы создать внешний сервер, подключающийся к серверу
ClickHouse. Пример:

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

Поддерживаются следующие параметры:

* `driver`: драйвер подключения ClickHouse: &quot;binary&quot; или
  &quot;http&quot;. **Обязательно.**
* `dbname`: база данных ClickHouse, используемая при подключении. По умолчанию —
  &quot;default&quot;.
* `fetch_size`: приблизительный размер батча в байтах для потоковой передачи по HTTP. Батчи
  разделяются по границам строк. Значение по умолчанию — `50000000` (50 MB). `0` отключает
  потоковую передачу и буферизует ответ целиком. Внешние таблицы могут переопределять это
  значение.
* `host`: имя хоста сервера ClickHouse. По умолчанию — &quot;localhost&quot;;
* `port`: порт для подключения к серверу ClickHouse. Значения по умолчанию
  следующие:
  * 9440, если `driver` — &quot;binary&quot;, а `host` — хост ClickHouse Cloud
  * 9004, если `driver` — &quot;binary&quot;, а `host` — не хост ClickHouse Cloud
  * 8443, если `driver` — &quot;http&quot;, а `host` — хост ClickHouse Cloud
  * 8123, если `driver` — &quot;http&quot;, а `host` — не хост ClickHouse Cloud

### ALTER SERVER \{#alter-server\}

Используйте [ALTER SERVER], чтобы изменить объект внешний сервер. Пример:

```sql
ALTER SERVER taxi_srv OPTIONS (SET driver 'http');
```

Параметры те же, что и для [CREATE SERVER](#create-server).

### DROP SERVER \{#drop-server\}

Используйте [DROP SERVER] для удаления внешнего сервера:

```sql
DROP SERVER taxi_srv;
```

Эта команда завершается ошибкой, если от сервера зависят какие-либо другие объекты. Используйте `CASCADE`, чтобы
удалить и эти зависимые объекты:

```sql
DROP SERVER taxi_srv CASCADE;
```

### CREATE USER MAPPING \{#create-user-mapping\}

Используйте [CREATE USER MAPPING], чтобы связать пользователя PostgreSQL с пользователем ClickHouse. Например,
чтобы связать текущего пользователя PostgreSQL с удалённым пользователем ClickHouse при
подключении через внешний сервер `taxi_srv`:

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'demo');
```

Поддерживаются следующие параметры:

* `user`: Имя пользователя ClickHouse. По умолчанию — &quot;default&quot;.
* `password`: Пароль пользователя ClickHouse.

### ALTER USER MAPPING \{#alter-user-mapping\}

Используйте [ALTER USER MAPPING], чтобы изменить определение пользовательского сопоставления:

```sql
ALTER USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (SET user 'default');
```

Параметры совпадают с [CREATE USER MAPPING](#create-user-mapping).

### DROP USER MAPPING \{#drop-user-mapping\}

Используйте [DROP USER MAPPING] для удаления сопоставления пользователя:

```sql
DROP USER MAPPING FOR CURRENT_USER SERVER taxi_srv;
```

### IMPORT FOREIGN SCHEMA \{#import-foreign-schema\}

Используйте [IMPORT FOREIGN SCHEMA], чтобы импортировать в схему PostgreSQL все таблицы, определённые в базе данных ClickHouse, как внешние таблицы:

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA demo FROM SERVER taxi_srv INTO taxi;
```

Используйте `LIMIT TO`, чтобы импортировать только указанные таблицы:

```sql
IMPORT FOREIGN SCHEMA demo LIMIT TO (trips) FROM SERVER taxi_srv INTO taxi;
```

Используйте `EXCEPT`, чтобы исключить таблицы:

```sql
IMPORT FOREIGN SCHEMA demo EXCEPT (users) FROM SERVER taxi_srv INTO taxi;
```

pg&#95;clickhouse получит список всех таблиц в указанной базе данных ClickHouse
(«demo» в примерах выше), получит определения столбцов для каждой из них
и выполнит команды [CREATE FOREIGN TABLE](#create-foreign-table) для создания
внешних таблиц. Столбцы будут определены с использованием [поддерживаемых типов
данных](#data-types) и, там, где это можно определить, параметров, поддерживаемых [CREATE
FOREIGN TABLE](#create-foreign-table).

:::tip Сохранение регистра импортируемых идентификаторов

`IMPORT FOREIGN SCHEMA` применяет `quote_identifier()` к именам импортируемых
таблиц и столбцов, заключая в двойные кавычки идентификаторы с символами в верхнем
регистре или пробелами. Поэтому такие имена таблиц и столбцов в запросах PostgreSQL
необходимо заключать в двойные кавычки. Имена, состоящие только из строчных букв и не
содержащие пробелов, заключать в кавычки не нужно.

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

`IMPORT FOREIGN SCHEMA` создает следующую внешнюю таблицу:

```sql
 CREATE TABLE test
 (
     id          BIGINT      NOT NULL,
     "Name"      TEXT        NOT NULL,
     "updatedAt" TIMESTAMPTZ NOT NULL
 );
```

Поэтому в запросах нужно правильно использовать кавычки, например,

```sql
 SELECT id, "Name", "updatedAt" FROM test;
```

Чтобы создавать объекты с другими именами или имена, состоящие только из строчных букв (то есть
регистронезависимые), используйте [CREATE FOREIGN TABLE](#create-foreign-table).
:::

### CREATE FOREIGN TABLE \{#create-foreign-table\}

Используйте [CREATE FOREIGN TABLE], чтобы создать внешнюю таблицу, позволяющую выполнять запросы к данным в базе данных ClickHouse:

```sql
CREATE FOREIGN TABLE acts (
    user_id    bigint NOT NULL,
    page_views int,
    duration   smallint,
    sign       smallint
) SERVER taxi_srv OPTIONS(
    table_name 'acts'
    engine 'CollapsingMergeTree'
);
```

Поддерживаются следующие параметры таблицы:

* `database`: Имя удалённой базы данных. По умолчанию используется база данных,
  заданная для внешнего сервера.
* `fetch_size`: Примерный размер батча в байтах для потоковой передачи по HTTP. Переопределяет
  серверный `fetch_size`. По умолчанию — `50000000` (50 MB). `0` отключает
  стриминг и буферизует полный ответ.
* `table_name`: Имя удалённой таблицы. По умолчанию используется имя,
  указанное для внешней таблицы.
* `engine`: [Движок таблицы], используемый таблицей ClickHouse. Для
  `CollapsingMergeTree()` и `AggregatingMergeTree()` pg&#95;clickhouse
  автоматически применяет параметры к функциональным выражениям, выполняемым
  над таблицей.

Используйте [тип данных](#data-types), соответствующий удалённому типу данных ClickHouse
для каждого столбца. Поддерживаются следующие параметры столбцов:

* `column_name`: Имя столбца на стороне ClickHouse, используемое
  вместо имени атрибута PostgreSQL при обратном преобразовании запросов и
  операций вставки. Полезно для сопоставления некавыченных имён столбцов PostgreSQL в нижнем регистре
  со столбцами ClickHouse, чувствительными к регистру, например:

  ```sql
  CREATE FOREIGN TABLE hits (
      watchid    bigint   OPTIONS(column_name 'WatchID'),
      javaenable smallint OPTIONS(column_name 'JavaEnable'),
      title      text     OPTIONS(column_name 'Title')
  ) SERVER taxi_srv OPTIONS(table_name 'hits');
  ```

* `AggregateFunction`: Имя агрегатной функции, применяемой к
  столбцу типа [AggregateFunction Type]. Сопоставьте тип данных с типом ClickHouse,
  передаваемым в функцию, и укажите имя агрегатной функции через
  соответствующий параметр столбца; тогда pg&#95;clickhouse автоматически добавит
  `Merge` к агрегатной функции, вычисляющей этот столбец.

  ```sql
  CREATE FOREIGN TABLE test (
      column1 bigint  OPTIONS(AggregateFunction 'uniq'),
      column2 integer OPTIONS(AggregateFunction 'anyIf'),
      column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
  ) SERVER clickhouse_srv;
  ```

* `SimpleAggregateFunction`: Имя агрегатной функции, применяемой к
  столбцу типа [SimpleAggregateFunction Type]. Сопоставьте тип данных с
  типом ClickHouse, передаваемым в функцию, и укажите имя
  агрегатной функции через соответствующий параметр столбца.

### ALTER FOREIGN TABLE \{#alter-foreign-table\}

Используйте [ALTER FOREIGN TABLE], чтобы изменить определение внешней таблицы:

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

Поддерживаемые параметры таблицы и столбца совпадают с параметрами для [CREATE FOREIGN
TABLE].

### DROP FOREIGN TABLE \{#drop-foreign-table\}

Чтобы удалить внешнюю таблицу, используйте [DROP FOREIGN TABLE]:

```sql
DROP FOREIGN TABLE acts;
```

Эта команда завершится ошибкой, если есть объекты, зависящие от внешней таблицы.
Используйте предложение `CASCADE`, чтобы удалить и их:

```sql
DROP FOREIGN TABLE acts CASCADE;
```

## Справочник по SQL DML \{#dml-sql-reference\}

В приведённых ниже DML-выражениях SQL может использоваться pg&#95;clickhouse. Примеры основаны на
следующих таблицах ClickHouse:

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

Команда [EXPLAIN] работает как и ожидается, но параметр `VERBOSE` вызывает
вывод запроса ClickHouse &quot;Remote SQL&quot;:

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

Этот запрос передаётся в ClickHouse через узел плана &quot;Foreign Scan&quot; — в виде
удалённого SQL-запроса.

### SELECT \{#select\}

Используйте оператор [SELECT], чтобы выполнять запросы к таблицам pg&#95;clickhouse так же, как и к любым другим таблицам:

```pgsql
try=# SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
          start_at          | duration |    resource
----------------------------+----------+----------------
 2025-12-05 15:07:32.944188 |      175 | /widgets/totem
(1 row)
```

pg&#95;clickhouse старается максимально переносить выполнение
запроса в ClickHouse, включая агрегатные функции. Используйте [EXPLAIN](#explain), чтобы определить
степень pushdown. Например, для приведенного выше запроса все выполнение переносится
в ClickHouse

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

pg&#95;clickhouse также передаёт выполнение JOIN для таблиц с одного и того же удалённого сервера:

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

При JOIN с локальной таблицей без
тщательной настройки запросы будут менее эффективными. В этом примере мы создаем локальную копию
таблицы `nodes` и выполняем JOIN с ней вместо удаленной таблицы:

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

В этом случае мы можем передать ClickHouse большую часть агрегации,
сгруппировав данные по `node_id` вместо локального столбца, а затем
позже выполнить JOIN со справочной таблицей:

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

Узел &quot;Foreign Scan&quot; теперь выполняет агрегацию по `node_id` на стороне источника, сокращая
количество строк, которые нужно вернуть в Postgres, с 1000 (то есть
всех строк) до всего 8 — по одной на каждый узел.

### PREPARE, EXECUTE, DEALLOCATE \{#prepare-execute-deallocate\}

Начиная с v0.1.2, pg&#95;clickhouse поддерживает параметризованные запросы, которые в основном создаются
с помощью команды [PREPARE]:

```pgsql
try=# PREPARE avg_durations_between_dates(date, date) AS
       SELECT date(start_at), round(avg(duration)) AS average_duration
         FROM logs
        WHERE date(start_at) BETWEEN $1 AND $2
        GROUP BY date(start_at)
        ORDER BY date(start_at);
PREPARE
```

Используйте [EXECUTE], как обычно, чтобы выполнить подготовленный оператор:

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

:::warning
При параметризованном выполнении [HTTP-драйвер](#create-server) не может
корректно преобразовывать часовые пояса DateTime в версиях ClickHouse до 25.8,
в которых [эта ошибка в основе проблемы] была [исправлена]. Обратите внимание:
иногда PostgreSQL использует параметризованный план запроса даже без `PREPARE`.
Для запросов, требующих точного преобразования часового пояса, если обновление
до 25.8 или более поздней версии невозможно, используйте [бинарный драйвер](#create-server).
:::

pg&#95;clickhouse, как обычно, выполняет агрегации на стороне ClickHouse, что видно в
подробном выводе [EXPLAIN](#explain):

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

Обратите внимание, что отправляются полные значения дат, а не плейсхолдеры параметров.
Так происходит для первых пяти запросов, как описано в PostgreSQL
[примечаниях о PREPARE]. При шестом выполнении ClickHouse отправляет
[параметры запроса] в стиле `{param:type}`:
parameters:

```pgsql
                                                                                                         QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=36)
   Output: (date(start_at)), (round(avg(duration), 0))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT date(start_at), round(avg(duration), 0) FROM "default".logs WHERE ((date(start_at) >= {p1:Date})) AND ((date(start_at) <= {p2:Date})) GROUP BY (date(start_at)) ORDER BY date(start_at) ASC NULLS LAST
(4 rows)
```

Используйте [DEALLOCATE] для освобождения подготовленного оператора:

```pgsql
try=# DEALLOCATE avg_durations_between_dates;
DEALLOCATE
```

### INSERT \{#insert\}

Используйте команду [INSERT], чтобы вставить значения в удалённую таблицу ClickHouse:

```pgsql
try=# INSERT INTO nodes(node_id, name, region, arch, os)
VALUES (9,  'Augustin Gamarra', 'us-west-2', 'amd64', 'Linux')
     , (10, 'Cerisier', 'us-east-2', 'amd64', 'Linux')
     , (11, 'Dewalt', 'use-central-1', 'arm64', 'macOS')
;
INSERT 0 3
```

### COPY \{#copy\}

Используйте команду [COPY], чтобы вставить батч строк в удалённую таблицу
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
> pg&#95;clickhouse пока не поддерживает батч-API вставки PostgreSQL FDW.
> Поэтому [COPY] в настоящее время использует команды [INSERT](#insert) для
> вставки записей. Это будет исправлено в одном из следующих выпусков.

### LOAD \{#load\}

Используйте [LOAD] для загрузки разделяемой библиотеки pg&#95;clickhouse:

```pgsql
try=# LOAD 'pg_clickhouse';
LOAD
```

Обычно нет необходимости использовать [LOAD], так как Postgres автоматически загрузит
pg&#95;clickhouse при первом использовании любой из его возможностей (функций, внешних
таблиц и т. д.).

Единственный случай, когда может быть полезно [LOAD] pg&#95;clickhouse, — это [SET](#set)
параметров pg&#95;clickhouse перед выполнением запросов, которые от них зависят.

### SET \{#set\}

Используйте [SET] для настройки пользовательских параметров конфигурации `pg_clickhouse`.

#### `pg_clickhouse.session_settings` \{#pg_clickhousesession_settings\}

Параметр `pg_clickhouse.session_settings` задаёт [настройки ClickHouse],
которые будут применяться к последующим запросам. Пример:

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

По умолчанию используется `join_use_nulls 1, group_by_use_nulls 1, final 1`. Укажите
пустую строку, чтобы использовать настройки сервера ClickHouse.

```sql
SET pg_clickhouse.session_settings = '';
```

Синтаксис — это список пар ключ/значение, разделённых запятыми и
одним или несколькими пробелами. Ключи должны соответствовать [настройкам ClickHouse]. Экранируйте пробелы,
запятые и символы обратной косой черты в значениях с помощью обратной косой черты:

```sql
SET pg_clickhouse.session_settings = 'join_algorithm grace_hash\,hash';
```

Или используйте значения в одинарных кавычках, чтобы не экранировать пробелы и запятые; также
можно использовать [dollar quoting], чтобы не приходилось удваивать двойные кавычки:

```sql
SET pg_clickhouse.session_settings = $$join_algorithm 'grace_hash,hash'$$;
```

Если для вас важна читаемость и нужно задать много настроек, записывайте их в нескольких
строках, например:

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

Некоторые настройки будут игнорироваться в случаях, когда они могут помешать
работе самого pg&#95;clickhouse. К ним относятся:

* `date_time_output_format`: HTTP-драйвер требует значение &quot;iso&quot;
* `format_tsv_null_representation`: HTTP-драйвер требует значение по умолчанию
* `output_format_tsv_crlf_end_of_line`: HTTP-драйвер требует значение по умолчанию

В остальных случаях pg&#95;clickhouse не проверяет настройки, а передаёт их в
ClickHouse для каждого запроса. Таким образом, он поддерживает все настройки каждой версии ClickHouse.

Обратите внимание: pg&#95;clickhouse должен быть загружен до установки
`pg_clickhouse.session_settings`; либо используйте [предварительную загрузку разделяемой библиотеки], либо
просто используйте один из объектов расширения, чтобы гарантировать его загрузку.

#### `pg_clickhouse.pushdown_regex` \{#pg_clickhousepushdown_regex\}

Параметр `pg_clickhouse.pushdown_regex` определяет, выполняет ли pg&#95;clickhouse
pushdown функций и операторов регулярных выражений. По умолчанию он включён;
установите для этого параметра значение false, чтобы отключить такой pushdown:

```sql
SET pg_clickhouse.pushdown_regex = 'false';
```

См. раздел [Регулярные выражения](#regular-expressions).

### ALTER ROLE \{#alter-role\}

Используйте команду `SET` в [ALTER ROLE] для [предварительной загрузки](#preloading) pg&#95;clickhouse
и/или [SET](#set) его параметров для отдельных ролей:

```pgsql
try=# ALTER ROLE CURRENT_USER SET session_preload_libraries = pg_clickhouse;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER SET pg_clickhouse.session_settings = 'final 1';
ALTER ROLE
```

Используйте команду `RESET` в [ALTER ROLE], чтобы сбросить предварительную загрузку pg&#95;clickhouse
и/или параметры:

```pgsql
try=# ALTER ROLE CURRENT_USER RESET session_preload_libraries;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER RESET pg_clickhouse.session_settings;
ALTER ROLE
```

## Предварительная загрузка \{#preloading\}

Если pg&#95;clickhouse нужен для каждого или почти каждого соединения с Postgres,
рассмотрите возможность использовать [предварительную загрузку разделяемой библиотеки], чтобы он загружался автоматически:

### `session_preload_libraries` \{#session_preload_libraries\}

Загружает разделяемую библиотеку при каждом новом подключении к PostgreSQL:

```ini
session_preload_libraries = pg_clickhouse
```

Полезно, если нужно применять обновления без перезапуска сервера: достаточно
переподключиться. Этот параметр также можно задать для конкретных пользователей или ролей через [ALTER
ROLE](#alter-role).

### `shared_preload_libraries` \{#shared_preload_libraries\}

Загружает разделяемую библиотеку в основной процесс PostgreSQL при запуске:

```ini
shared_preload_libraries = pg_clickhouse
```

Полезно для экономии памяти и снижения накладных расходов для каждого сеанса, но требует
перезапуска кластера при обновлении библиотеки.

## Типы данных \{#data-types\}

pg&#95;clickhouse сопоставляет следующие типы данных ClickHouse с типами данных PostgreSQL. При импорте столбцов [IMPORT FOREIGN SCHEMA](#import-foreign-schema) использует первый тип, указанный для столбца PostgreSQL; дополнительные типы можно использовать в командах [CREATE FOREIGN TABLE](#create-foreign-table):

| ClickHouse | PostgreSQL       | Примечания                          |
| ---------- | ---------------- | ----------------------------------- |
| Bool       | boolean          |                                     |
| Date       | date             |                                     |
| Date32     | date             |                                     |
| DateTime   | timestamptz      |                                     |
| Decimal    | numeric          |                                     |
| Float32    | real             |                                     |
| Float64    | double precision |                                     |
| IPv4       | inet             |                                     |
| IPv6       | inet             |                                     |
| Int16      | smallint         |                                     |
| Int32      | integer          |                                     |
| Int64      | bigint           |                                     |
| Int8       | smallint         |                                     |
| JSON       | jsonb, json      |                                     |
| String     | text, bytea      |                                     |
| UInt16     | integer          |                                     |
| UInt32     | bigint           |                                     |
| UInt64     | bigint           | Ошибка для значений &gt; BIGINT max |
| UInt8      | smallint         |                                     |
| UUID       | uuid             |                                     |

Ниже приведены дополнительные примечания и подробности.

### BYTEA \{#bytea\}

ClickHouse не предоставляет эквивалента типа PostgreSQL [BYTEA], однако
позволяет хранить произвольные байты в типе [String]. В общем случае строки ClickHouse
следует сопоставлять с типом PostgreSQL [TEXT], но при работе с бинарными данными используйте
тип [BYTEA]. Пример:

```sql
-- Create clickHouse table with String columns.
SELECT clickhouse_raw_query($$
    CREATE TABLE bytes (
        c1 Int8, c2 String, c3 String
    ) ENGINE = MergeTree ORDER BY (c1);
$$);

-- Create foreign table with BYTEA columns.
CREATE FOREIGN TABLE bytes (
    c1 int,
    c2 BYTEA,
    c3 BYTEA
) SERVER ch_srv OPTIONS( table_name 'bytes' );

-- Insert binary data into the foreign table.
INSERT INTO bytes
SELECT n, sha224(bytea('val'||n)), decode(md5('int'||n), 'hex')
  FROM generate_series(1, 4) n;

-- View the results.
SELECT * FROM bytes;
```

Этот последний запрос `SELECT` выведет:

```pgsql
 c1 |                             c2                             |                 c3
----+------------------------------------------------------------+------------------------------------
  1 | \x1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | \xae3b28cde02542f81acce8783245430d
  2 | \x5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | \x23e7c6cacb8383f878ad093b0027d72b
  3 | \x53ac2c1fa83c8f64603fe9568d883331007d6281de330a4b5e728f9e | \x7e969132fc656148b97b6a2ee8bc83c1
  4 | \x4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | \x8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

Обратите внимание: если в столбцах ClickHouse есть нулевые байты, внешняя
таблица, использующая столбцы [TEXT], не будет выводить корректные значения:

```sql
-- Create foreign table with TEXT columns.
CREATE FOREIGN TABLE texts (
    c1 int,
    c2 TEXT,
    c3 TEXT
) SERVER ch_srv OPTIONS( table_name 'bytes' );

-- Encode binary data as hex.
SELECT c1, encode(c2::bytea, 'hex'), encode(c3::bytea, 'hex') FROM texts ORDER BY c1;
```

Результат:

```pgsql
 c1 |                          encode                          |              encode
----+----------------------------------------------------------+----------------------------------
  1 | 1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | ae3b28cde02542f81acce8783245430d
  2 | 5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | 23e7c6cacb8383f878ad093b
  3 | 53ac2c1fa83c8f64603fe9568d883331                         | 7e969132fc656148b97b6a2ee8bc83c1
  4 | 4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | 8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

Обратите внимание, что строки два и три содержат усечённые значения. Это объясняется тем, что
PostgreSQL использует строки, завершаемые нулевым байтом, и не поддерживает нулевые байты внутри
строк.

Попытка вставки бинарных значений в столбцы [TEXT] завершится успешно и будет
работать как ожидается:

```sql
-- Insert via text columns:
TRUNCATE texts;
INSERT INTO texts
SELECT n, sha224(bytea('val'||n)), decode(md5('int'||n), 'hex')
  FROM generate_series(1, 4) n;

-- View the data.
SELECT c1, encode(c2::bytea, 'hex'), encode(c3::bytea, 'hex') FROM texts ORDER BY c1;
```

Текстовые столбцы будут корректными:

```pgsql

 c1 |                          encode                          |              encode
----+----------------------------------------------------------+----------------------------------
  1 | 1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | ae3b28cde02542f81acce8783245430d
  2 | 5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | 23e7c6cacb8383f878ad093b0027d72b
  3 | 53ac2c1fa83c8f64603fe9568d883331007d6281de330a4b5e728f9e | 7e969132fc656148b97b6a2ee8bc83c1
  4 | 4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | 8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

Но если читать их как [BYTEA], это не сработает:

```pgsql
# SELECT * FROM bytes;
 c1 |                                                           c2                                                           |                                   c3
----+------------------------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------
  1 | \x5c783162663766306363383231643331313738363136613535613865306335323637373733353339376364646536663431353361396664336437 | \x5c786165336232386364653032353432663831616363653837383332343534333064
  2 | \x5c783566366539653132636438353932373132653633383031366634623161326537333233306565343064623439386330663062316463383431 | \x5c783233653763366361636238333833663837386164303933623030323764373262
  3 | \x5c783533616332633166613833633866363436303366653935363864383833333331303037643632383164653333306134623565373238663965 | \x5c783765393639313332666336353631343862393762366132656538626338336331
  4 | \x5c783465336332653463623735343261343531373361386461633933396464633462633735323032653334326562633736396230663564613266 | \x5c783865663330663434633635343830643132623635306162366232623034323435
(4 rows)
```

:::tip
Как правило, столбцы [TEXT] следует использовать только для закодированных строк, а столбцы [BYTEA] — только для бинарных данных; никогда не используйте их взаимозаменяемо.
:::

## Справочник по функциям и операторам \{#function-and-operator-reference\}

### Функции \{#functions\}

Эти функции служат интерфейсом для выполнения запросов к базе данных ClickHouse.

#### `clickhouse_raw_query` \{#clickhouse_raw_query\}

```sql
SELECT clickhouse_raw_query(
    'CREATE TABLE t1 (x String) ENGINE = Memory',
    'host=localhost port=8123'
);
```

Подключитесь к сервису ClickHouse через его HTTP-интерфейс, выполните один
запрос и отключитесь. Необязательный второй аргумент задаёт строку
подключения, которая по умолчанию имеет значение `host=localhost port=8123`. Поддерживаемые параметры
подключения:

* `host`: Хост, к которому нужно подключиться; обязателен.
* `port`: HTTP-порт, к которому нужно подключиться; по умолчанию `8123`, если только `host` не является
  хостом ClickHouse Cloud — в этом случае по умолчанию используется `8443`
* `dbname`: Имя базы данных, к которой нужно подключиться.
* `username`: Имя пользователя для подключения; по умолчанию `default`
* `password`: Пароль для аутентификации; по умолчанию пароль не задан

По умолчанию ни одна роль не имеет права `EXECUTE` для этой функции; выдавайте
доступ только тем ролям, которым действительно нужно выполнять разовые запросы ClickHouse,
например, выделенной административной роли ClickHouse:

Полезно для запросов, которые не возвращают записей, но запросы, которые возвращают значения,
будут возвращены как одно текстовое значение:

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

`pg_clickhouse` поддерживает pushdown для части встроенных функций PostgreSQL, используемых
в условных выражениях (в секциях `HAVING` и `WHERE`). Это подмножество соответствует
следующим эквивалентам в ClickHouse:

* `abs`: [abs](https://clickhouse.com/docs/sql-reference/functions/arithmetic-functions#abs)
* `factorial`: [factorial](https://clickhouse.com/docs/sql-reference/functions/math-functions#factorial)
* `mod` (int2/int4/int8/numeric): [остаток от деления](https://clickhouse.com/docs/sql-reference/functions/arithmetic-functions#modulo)
* `pow` &amp; `power` (float8/numeric): [pow](https://clickhouse.com/docs/sql-reference/functions/math-functions#pow)
* `round`: [round](https://clickhouse.com/docs/sql-reference/functions/rounding-functions#round)
* `sin`, `cos`, `tan`, `atan`, `atan2`, `sinh`, `cosh`, `tanh`, `asinh`, `degrees`, `radians`, `pi`: [математические функции ClickHouse](https://clickhouse.com/docs/sql-reference/functions/math-functions)
  с теми же именами. `asin`, `acos`, `atanh`, `acosh` не передаются в CH: PG
  выдаёт ошибку для входных данных вне диапазона, тогда как CH возвращает `NaN`.
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
* `extract(field FROM source)`: те же соответствия, что и для `date_part`
* `date(timestamp)` &amp; `date(timestamptz)`: [toDate](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toDate)
  (при обратном разборе — как псевдоним CH `date`)
* `array_position`: [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)
* `array_cat`: [arrayConcat](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayConcat)
* `array_append`: [arrayPushBack](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayPushBack)
* `array_prepend`: [arrayPushFront](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayPushFront)
* `array_remove`: [arrayRemove](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayRemove)
* `array_length` &amp; `cardinality`: [длина](https://clickhouse.com/docs/sql-reference/functions/array-functions#length)
* `array_to_string`: [arrayStringConcat](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayStringConcat)
* `string_to_array`: [splitByString](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByString)
* `split_part`: [splitByString](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByString) + индекс массива
* `trim_array`: [arrayResize](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayResize)
* `array_fill`: [arrayWithConstant](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayWithConstant)
* `array_reverse`: [arrayReverse](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayReverse)
* `array_shuffle`: [arrayShuffle](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayShuffle)
* `array_sample`: [arrayRandomSample](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayRandomSample)
* `array_sort`: [arraySort](https://clickhouse.com/docs/sql-reference/functions/array-functions#arraySort) / [arrayReverseSort](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayReverseSort)
* `btrim`: [trimBoth](https://clickhouse.com/docs/sql-reference/functions/string-functions#trimboth)
* `ltrim`: [ltrim](https://clickhouse.com/docs/sql-reference/functions/string-functions#ltrim)
* `rtrim`: [rtrim](https://clickhouse.com/docs/sql-reference/functions/string-functions#rtrim)
* `concat_ws`: [concatWithSeparator](https://clickhouse.com/docs/sql-reference/functions/string-functions#concatwithseparator)
* `lower(text)`: [lowerUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#lowerutf8)
* `upper(text)`: [upperUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#upperutf8)
* `substring(text, ...)` &amp; `substr(text, ...)`: [substringUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#substringutf8)
* `substring(bytea, ...)` &amp; `substr(bytea, ...)`: [substring](https://clickhouse.com/docs/sql-reference/functions/string-functions#substring)
* `length(text)`: [lengthUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#lengthutf8)
* `length(bytea)` &amp; `octet_length`: [length](https://clickhouse.com/docs/sql-reference/functions/array-functions#length)
* `reverse(text)`: [reverseUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#reverseutf8)
* `reverse(bytea)`: [reverse](https://clickhouse.com/docs/sql-reference/functions/string-functions#reverse)
* `strpos`: [positionUTF8](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#positionutf8)
* `regexp_like`: [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `regexp_replace`: [replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpOne) или [replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpAll), если указан флаг `g`
* `regexp_split_to_array`: [splitByRegexp](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByRegexp)
* `md5`: [MD5](https://clickhouse.com/docs/sql-reference/functions/hash-functions#MD5)
* `json_extract_path_text`: [синтаксис субстолбцов](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `json_extract_path`: [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [синтаксис субстолбцов](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `jsonb_extract_path_text`: [синтаксис вложенных столбцов](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `jsonb_extract_path`: [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [синтаксис подстолбцов](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `bit_count(bytea)`: [bitCount](https://clickhouse.com/docs/sql-reference/functions/bit-functions#bitcount)
* `to_timestamp(float8)`: [fromUnixTimestamp](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#fromUnixTimestamp)
* `to_char(timestamp[tz], fmt)`: [formatDateTime](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#formatDateTime)
  если `fmt` — строковая константа, и для каждого её ключевого слова есть точный
  эквивалент в ClickHouse. Поддерживаемые ключевые слова см. в разделе [to&#95;char()](#to_char) в примечаниях
  по совместимости. В противном случае функция вычисляется
  локально в PostgreSQL.
* `statement_timestamp`, `transaction_timestamp`, &amp; `clock_timestamp`:
  [nowInBlock64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#nowInBlock64)
  (`nowInBlock64(9, $session_timezone)`)
* `CURRENT_DATE`:
  [now](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now) и
  [toDate](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toDate)
  (`toDate(now($session_timezone))`)
* `now`, `CURRENT_TIMESTAMP`, &amp; `LOCALTIMESTAMP`:
  [now64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now64)
  (`now64(9, $session_timezone)`)
* `CURRENT_TIMESTAMP(n)` &amp; `LOCALTIMESTAMP(n)`:
  [now64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now64)
  (`now64(n, $session_timezone)`)
* `CURRENT_DATABASE`: Передаётся в качестве значения из функции PostgreSQL.
* `CURRENT_SCHEMA`: Передаётся в качестве значения из функции PostgreSQL.
* `CURRENT_CATALOG`: Передаётся в качестве значения из функции PostgreSQL.
* `CURRENT_USER`: Передаётся как значение, возвращаемое функцией PostgreSQL.
* `USER`: Передаётся в качестве значения из функции PostgreSQL.
* `CURRENT_ROLE`: передаётся в качестве значения из функции PostgreSQL.
* `SESSION_USER`: передаётся в качестве значения из функции PostgreSQL.

### Операторы pushdown \{#pushdown-operators\}

* Срез массива (`arr[L:U]`): [arraySlice](https://clickhouse.com/docs/sql-reference/functions/array-functions#arraySlice)
* `@>` (массив содержит): [hasAll](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAll)
* `<@` (массив содержится в): [hasAll](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAll)
* `&&` (массивы пересекаются): [hasAny](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAny)
* `~` (совпадение с регулярным выражением): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `!~` (нет совпадения с регулярным выражением): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `~*` (регистронезависимое регулярное выражение без совпадения): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `!~*` (регистронезависимое регулярное выражение без совпадения): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `->>` (извлечение элемента JSON/JSONB в виде текста): [sub-column syntax](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `->` (извлечение из JSON/JSONB): [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [sub-column syntax](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)

### Пользовательские функции \{#custom-functions\}

Эти пользовательские функции, созданные `pg_clickhouse`, обеспечивают
pushdown внешних запросов при использовании некоторых функций ClickHouse,
для которых в PostgreSQL нет эквивалентов. Если какую-либо из этих функций
нельзя выполнить через pushdown, будет сгенерировано исключение.

* [dictGet](https://clickhouse.com/docs/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)

### Pushdown для расширений \{#extension-pushdown\}

pg&#95;clickhouse распознает функции из некоторых основных и сторонних
расширений и переносит их выполнение на соответствующие эквиваленты в ClickHouse.

#### re2 \{#re2\}

Все функции [расширения re2] проталкиваются в ClickHouse один к одному:

* `re2match` → [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `re2extract` → [extract](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#extract)
* `re2extractall` → [extractAll](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#extractAll)
* `re2regexpextract` → [regexpExtract](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#regexpExtract)
* `re2extractgroups` → [extractGroups](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#extractGroups)
* `re2replaceregexpone` → [replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpOne)
* `re2replaceregexpall` → [replaceRegexpAll](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpAll)
* `re2countmatches` → [countMatches](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#countMatches)
* `re2countmatchescaseinsensitive` → [countMatchesCaseInsensitive](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#countMatchesCaseInsensitive)
* `re2multimatchany` → [multiMatchAny](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#multiMatchAny)
* `re2multimatchanyindex` → [multiMatchAnyIndex](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#multiMatchAnyIndex)
* `re2multimatchallindices` → [multiMatchAllIndices](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#multiMatchAllIndices)

#### intarray \{#intarray\}

Одна функция из [intarray] делегируется ClickHouse:

* `idx` → [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)

#### fuzzystrmatch \{#fuzzystrmatch\}

В ClickHouse проталкиваются две функции [fuzzystrmatch]:

* `soundex`: [soundex](https://clickhouse.com/docs/sql-reference/functions/string-functions#soundex)
* `levenshtein` (2-arg): [editDistanceUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#editDistanceUTF8)

### Pushdown-приведения типов \{#pushdown-casts\}

pg&#95;clickhouse выполняет pushdown приведений типов, таких как `CAST(x AS bigint)`, для совместимых
типов данных. Для несовместимых типов pushdown завершится ошибкой; если `x` в этом
примере имеет тип ClickHouse `UInt64`, ClickHouse откажется приводить это значение.

Чтобы выполнять pushdown приведений к несовместимым типам данных, pg&#95;clickhouse предоставляет
следующие функции. Они вызывают исключение в PostgreSQL, если не были
протолкнуты.

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### Агрегатные функции с Pushdown \{#pushdown-aggregates\}

Эти агрегатные функции PostgreSQL выполняются с pushdown в ClickHouse.

* [array&#95;agg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/grouparray)
* [avg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/avg)
* [bit&#95;and](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitand)
* [bit&#95;or](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitor)
* [bit&#95;xor](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitxor)
* [bool&#95;and / every](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitand)
* [bool&#95;or](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitor)
* [count](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count)
* [min](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/min)
* [max](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/max)
* [string&#95;agg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupconcat)
* [sum](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/sum)

### Пользовательские агрегатные функции \{#custom-aggregates\}

Эти пользовательские агрегатные функции, созданные в `pg_clickhouse`, обеспечивают
pushdown запросов к внешнему источнику для некоторых агрегатных функций ClickHouse,
не имеющих эквивалентов в PostgreSQL. Если какую-либо из этих функций не удаётся
передать через pushdown, будет вызвано исключение.

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

### Pushdown для агрегатов ordered set \{#pushdown-ordered-set-aggregates\}

Эти [агрегатные функции ordered set] сопоставляются с [параметрическими агрегатными функциями] ClickHouse: *прямой аргумент* передаётся как параметр, а выражения `ORDER BY` — как аргументы. Например, следующий запрос PostgreSQL:

```sql
SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY a) FROM t1;
```

Соответствует следующему запросу к ClickHouse:

```sql
SELECT quantile(0.25)(a) FROM t1;
```

Обратите внимание: суффиксы `ORDER BY`, отличные от используемого по умолчанию, — `DESC` и `NULLS FIRST` —
не поддерживаются и приводят к ошибке.

* `percentile_cont(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantile(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantileExact(double)`: [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)

### Pushdown оконных функций \{#pushdown-window-functions\}

Эти [оконные функции] PostgreSQL поддерживают pushdown в ClickHouse с секцией `OVER
(PARTITION BY ... ORDER BY ...)`, включая спецификации рамки окна там, где это
применимо.

* [row&#95;number](https://clickhouse.com/docs/sql-reference/window-functions#row_number)
* [rank](https://clickhouse.com/docs/sql-reference/window-functions#rank)
* [dense&#95;rank](https://clickhouse.com/docs/sql-reference/window-functions#dense_rank)
* [ntile](https://clickhouse.com/docs/sql-reference/window-functions#ntile)
* [cume&#95;dist](https://clickhouse.com/docs/sql-reference/window-functions#cume_dist)
* [percent&#95;rank](https://clickhouse.com/docs/sql-reference/window-functions#percent_rank)
* [lead](https://clickhouse.com/docs/sql-reference/window-functions#lead)
* [lag](https://clickhouse.com/docs/sql-reference/window-functions#lag)
* [first&#95;value](https://clickhouse.com/docs/sql-reference/window-functions#first_value)
* [last&#95;value](https://clickhouse.com/docs/sql-reference/window-functions#last_value)
* [nth&#95;value](https://clickhouse.com/docs/sql-reference/window-functions#nth_value)
* `min` / `max` (с секцией `OVER`)

Для функций ранжирования (`row_number`, `rank`, `dense_rank`, `ntile`, `cume_dist`,
`percent_rank`) при pushdown секция рамки окна опускается, поскольку ClickHouse
не поддерживает спецификации рамки окна для этих функций.

## Примечания о совместимости \{#compatibility-notes\}

### Регулярные выражения \{#regular-expressions\}

Хотя pg&#95;clickhouse выполняет pushdown регулярных выражений в эквивалентные выражения ClickHouse,
когда [pg&#95;clickhouse.pushdown&#95;regex](#pg_clickhousepushdown_regex) имеет значение true (это
значение по умолчанию), и старается обеспечить базовый уровень совместимости, следует
учитывать различия между ними и то, как pg&#95;clickhouse их обрабатывает.

* PostgreSQL поддерживает [POSIX Regular Expressions], а ClickHouse поддерживает
  [RE2 Regular Expressions][RE2]. Учитывайте различия в поведении: используйте RE2,
  когда регулярное выражение будет вычисляться в ClickHouse (например, в
  предложении `WHERE`), и POSIX — когда оно будет вычисляться в Postgres (например, в
  предложении `SELECT`).

* pg&#95;clickhouse выполняет pushdown флагов [Regex flags] из Postgres, добавляя их в начало
  регулярного выражения ClickHouse внутри `(?)`. Например:

  ```sql
  regexp_like(val, '^VAL\d', 'i')
  ```

  Превращается в

  ```sql
  match(val, concat('(?i-s)', '^VAL\\d'))
  ```

  Обратите внимание на добавление `-s`; это приводит поведение в соответствие с регулярными
  выражениями Postgres за счёт отключения `s`, который в ClickHouse включён по умолчанию.
  pg&#95;clickhouse не будет добавлять `-s`, если флаги в вызове функции Postgres
  содержат `s`. К сожалению, такое поведение нарушает совместимость некоторых
  регулярных выражений в PostgreSQL 24 и более ранних версиях.

* Единственные флаги, которые поддерживаются и PostgreSQL, и ClickHouse и, следовательно, могут
  использоваться при вычислении в ClickHouse:

  * `i`: регистронезависимый
  * `m`: многострочный режим:
  * `s`: позволяет `.` соответствовать `\n`
  * `p`: частичное сопоставление с учётом перевода строки (обрабатывается так же, как `s`)
  * `t`: строгий синтаксис (по умолчанию, удаляется pg&#95;clickhouse)

  RE2 поддерживает только эти флаги; не используйте никакие другие [Postgres flags]

* Любые другие флаги, переданные функциям регулярных выражений, приведут к тому, что
  функция не будет отправлена через pushdown.

* Исключением является `regexp_replace()`, которая также поддерживает флаг `g`. Когда
  установлен `g`, pg&#95;clickhouse использует `replaceRegexpAll()` вместо
  `replaceRegexpOne()` и удаляет этот флаг перед добавлением остальных флагов в начало.

* Аргумент замены в Postgres `regexp_replace()` поддерживает `\&` для
  ссылки на полное совпадение, тогда как в ClickHouse для полного
  совпадения используется `\0`. Обязательно используйте `\0`, когда функция отправляется через pushdown в ClickHouse.

Чтобы полностью избежать неоднозначности, рассмотрите возможность установки
[pg&#95;clickhouse.pushdown&#95;regex](#pg_clickhousepushdown_regex), чтобы предотвратить
pushdown регулярных выражений Postgres в ClickHouse, и используйте
[re2 extension], для которого pg&#95;clickhouse поддерживает [direct pushdown](#re2)
совместимых с ClickHouse регулярных выражений [RE2].

### `to_char()` \{#to_char\}

PostgreSQL [`to_char()`] для `timestamp` и `timestamp with time zone`
проталкивается в ClickHouse [formatDateTime] только в том случае, если аргумент формата
представляет собой строковую константу, отличную от NULL, и каждому ключевому слову PostgreSQL
соответствует побайтно идентичный эквивалент в ClickHouse. Если формат динамический
(не `Const`) или содержит неподдерживаемое ключевое слово либо модификатор,
вызов переключается на локальное вычисление в PostgreSQL — частичный pushdown
никогда не применяется, поэтому вывод остаётся совместимым с PG.

Формы `to_char()` с двумя аргументами для `numeric`, `interval` и других
типов, отличных от `timestamp`, никогда не проталкиваются; ClickHouse [formatDateTime] лишь
форматирует значения даты и времени.

#### Преобразованные ключевые слова \{#translated-keywords\}

| PostgreSQL                 | ClickHouse | Значение                                         |
| -------------------------- | ---------- | ------------------------------------------------ |
| `YYYY`, `yyyy`             | `%Y`       | 4-значный год                                    |
| `YY`, `yy`                 | `%y`       | 2-значный год                                    |
| `MM`, `mm`                 | `%m`       | месяц с ведущим нулём (01–12)                    |
| `DD`, `dd`                 | `%d`       | день месяца с ведущим нулём (01–31)              |
| `DDD`, `ddd`               | `%j`       | день года с ведущим нулём (001–366)              |
| `HH24`, `hh24`             | `%H`       | час в 24-часовом формате с ведущим нулём (00–23) |
| `HH`, `hh`, `HH12`, `hh12` | `%I`       | час в 12-часовом формате с ведущим нулём (01–12) |
| `MI`, `mi`                 | `%i`       | минуты с ведущим нулём (00–59)                   |
| `SS`, `ss`                 | `%S`       | секунды с ведущим нулём (00–59)                  |
| `Q`, `q`                   | `%Q`       | квартал (1–4)                                    |
| `Mon`                      | `%b`       | сокращённое название месяца, например `Oct`      |
| `Dy`                       | `%a`       | сокращённое название дня недели, например `Mon`  |
| `AM`, `PM`                 | `%p`       | индикатор AM/PM, всегда в верхнем регистре       |

#### Текст в кавычках и литералы \{#quoted-text-and-literals\}

Текст в `"..."` передаётся дословно, при этом любой литеральный символ `%`
удваивается до `%%`, чтобы экранировать префикс спецификатора ClickHouse. `\"` вне
кавычек также передаётся как литеральный `"`. Внутри `"..."` обратная косая черта
экранирует только `"`; другие последовательности с обратной косой чертой трактуются как литеральный текст.

## Авторы \{#authors\}

[David E. Wheeler](https://justatheory.com/)

## Авторские права \{#copyright\}

Авторские права (c) 2025-2026, ClickHouse

[foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html "Документация PostgreSQL: написание Foreign Data Wrapper"

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "Последняя версия на Docker Hub"

[ClickHouse]: https://clickhouse.com/clickhouse

[Semantic Versioning]: https://semver.org/spec/v2.0.0.html "Semantic Versioning 2.0.0"

[`pg_get_loaded_modules()`]: https://pgpedia.info/g/pg_get_loaded_modules.html "pgPedia: pg_get_loaded_modules()"

[DDL]: https://en.wikipedia.org/wiki/Data_definition_language "Wikipedia: язык определения данных"

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

[table engine]: https://clickhouse.com/docs/engines/table-engines "Документация ClickHouse: движок таблицы"

[AggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/aggregatefunction "Документация ClickHouse: тип AggregateFunction"

[SimpleAggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/simpleaggregatefunction "Документация ClickHouse: тип SimpleAggregateFunction"

[ALTER FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-alterforeigntable.html "Документация PostgreSQL: ALTER FOREIGN TABLE"

[DROP FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-dropforeigntable.html "Документация PostgreSQL: DROP FOREIGN TABLE"

[DML]: https://en.wikipedia.org/wiki/Data_manipulation_language "Wikipedia: язык манипулирования данными"

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

[shared library preloading]: https://www.postgresql.org/docs/current/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD "Документация PostgreSQL: предварительная загрузка разделяемых библиотек"

[агрегатные функции ordered set]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE

[параметрические агрегатные функции]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions

[ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings "Документация ClickHouse: настройки сеанса"

[dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING "Документация PostgreSQL: строковые константы с dollar quoting"

[PREPARE notes]: https://www.postgresql.org/docs/current/sql-prepare.html#SQL-PREPARE-NOTES "Документация PostgreSQL: примечания к PREPARE"

[query parameters]: https://clickhouse.com/docs/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse "Документация ClickHouse: альтернативы подготовленным операторам в ClickHouse"

[underlying bug]: https://github.com/ClickHouse/ClickHouse/issues/85847 "ClickHouse/ClickHouse#85847 Некоторые запросы в multipart-формах не считывают настройки"

[fixed]: https://github.com/ClickHouse/ClickHouse/pull/85570 "ClickHouse/ClickHouse#85570 исправление для HTTP с multipart"

[BYTEA]: https://www.postgresql.org/docs/current/datatype-binary.html "Документация PostgreSQL: двоичные типы данных"

[GRANT]: https://www.postgresql.org/docs/current/sql-grant.html "Документация PostgreSQL: GRANT"

[String]: https://clickhouse.com/docs/sql-reference/data-types/string "Документация ClickHouse: String"

[TEXT]: https://www.postgresql.org/docs/current/datatype-character.html "Документация PostgreSQL: символьные типы"

[window functions]: https://www.postgresql.org/docs/current/functions-window.html "Документация PostgreSQL: оконные функции"

[POSIX Regular Expressions]: https://www.postgresql.org/docs/18/functions-matching.html#FUNCTIONS-POSIX-REGEXP "Документация PostgreSQL: регулярные выражения POSIX"

[Postgres flags]: https://www.postgresql.org/docs/18/functions-matching.html#POSIX-EMBEDDED-OPTIONS-TABLE "Документация PostgreSQL: буквы встроенных параметров ARE"

[RE2]: https://github.com/google/re2/wiki/Syntax "Синтаксис RE2"

[re2 extension]: https://github.com/ClickHouse/pg_re2 "pg_re2: совместимые с ClickHouse функции регулярных выражений на основе RE2"

[intarray]: https://www.postgresql.org/docs/current/intarray.html "Документация PostgreSQL: intarray"

[fuzzystrmatch]: https://www.postgresql.org/docs/current/fuzzystrmatch.html "Документация PostgreSQL: fuzzystrmatch"

[`to_char()`]: https://www.postgresql.org/docs/current/functions-formatting.html "Документация PostgreSQL: функции форматирования типов данных"

[formatDateTime]: https://clickhouse.com/docs/sql-reference/functions/date-time-functions#formatDateTime "Документация ClickHouse: formatDateTime"