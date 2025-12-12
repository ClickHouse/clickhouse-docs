---
description: 'Документация по таблице'
keywords: ['compression', 'codec', 'schema', 'DDL']
sidebar_label: 'TABLE'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'CREATE TABLE'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Создает новую таблицу. Синтаксис этого запроса может различаться в зависимости от сценария использования.

По умолчанию таблицы создаются только на текущем сервере. Распределенные DDL-запросы реализованы с помощью предложения `ON CLUSTER`, которое [описано отдельно](../../../sql-reference/distributed-ddl.md).

## Синтаксические формы {#syntax-forms}

### С явной схемой {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'comment for column'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'comment for column'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'comment for table']
```

Создаёт таблицу с именем `table_name` в базе данных `db` или в текущей базе данных, если `db` не задана, со структурой, указанной в скобках, и движком `engine`.
Структура таблицы — это список описаний столбцов, вторичных индексов и ограничений. Если движок поддерживает [primary key](#primary-key), он указывается как параметр движка таблицы.

В простейшем случае описание столбца — это `name type`. Пример: `RegionID UInt32`.

Для значений по умолчанию также можно задать выражения (см. ниже).

При необходимости может быть указан первичный ключ с одним или несколькими выражениями ключа.

Комментарии могут быть добавлены как для столбцов, так и для таблицы.

### Со схемой, аналогичной другой таблице {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

Создает таблицу с такой же структурой, как у другой таблицы. Вы можете указать для таблицы другой движок. Если движок не указан, используется тот же движок, что и для таблицы `db2.name2`.

### Со схемой и данными, клонированными из другой таблицы {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

Создаёт таблицу с той же структурой, что и другая таблица. Можно указать для неё другой движок. Если движок не указан, будет использован тот же, что и у таблицы `db2.name2`. После создания новой таблицы к ней присоединяются все партиции из `db2.name2`. Другими словами, данные из `db2.name2` клонируются в `db.table_name` при создании. Этот запрос эквивалентен следующему:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### Из табличной функции {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

Создаёт таблицу с тем же результатом, что и указанная [табличная функция](/sql-reference/table-functions). Созданная таблица также будет работать так же, как соответствующая табличная функция.

### Из запроса SELECT {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

Создаёт таблицу со структурой, соответствующей результату запроса `SELECT`, с движком `engine` и заполняет её данными из `SELECT`. Также вы можете явно задать описание столбцов.

Если таблица уже существует и указано `IF NOT EXISTS`, запрос ничего не выполнит.

После секции `ENGINE` в запросе могут следовать и другие секции. Подробную документацию по созданию таблиц см. в описаниях [движков таблиц](/engines/table-engines).

**Пример**

Запрос:

```sql
CREATE TABLE t1 (x String) ENGINE = Memory AS SELECT 1;
SELECT x, toTypeName(x) FROM t1;
```

Результат:

```text
┌─x─┬─toTypeName(x)─┐
│ 1 │ String        │
└───┴───────────────┘
```

## Модификаторы NULL и NOT NULL {#null-or-not-null-modifiers}

Модификаторы `NULL` и `NOT NULL` после типа данных в определении столбца соответственно разрешают или запрещают делать его [Nullable](/sql-reference/data-types/nullable).

Если тип не является `Nullable` и указано `NULL`, он будет интерпретироваться как `Nullable`; если указано `NOT NULL`, то нет. Например, `INT NULL` — то же самое, что `Nullable(INT)`. Если тип уже является `Nullable` и заданы модификаторы `NULL` или `NOT NULL`, будет сгенерировано исключение.

См. также настройку [data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable).

## Значения по умолчанию {#default_values}

Описание столбца может задавать выражение значения по умолчанию в виде `DEFAULT expr`, `MATERIALIZED expr` или `ALIAS expr`. Пример: `URLDomain String DEFAULT domain(URL)`.

Выражение `expr` является необязательным. Если оно опущено, тип столбца должен быть явно указан, а значение по умолчанию будет `0` для числовых столбцов, `''` (пустая строка) для строковых столбцов, `[]` (пустой массив) для столбцов‑массивов, `1970-01-01` для столбцов с типом дата или `NULL` для столбцов типа `Nullable`.

Тип столбца со значением по умолчанию можно не указывать, в этом случае он определяется из типа `expr`. Например, тип столбца `EventDate DEFAULT toDate(EventTime)` будет `Date`.

Если указаны и тип данных, и выражение значения по умолчанию, вставляется неявная функция приведения типа, которая преобразует выражение к указанному типу. Пример: `Hits UInt32 DEFAULT 0` внутренне представляется как `Hits UInt32 DEFAULT toUInt32(0)`.

Выражение значения по умолчанию `expr` может ссылаться на произвольные столбцы таблицы и константы. ClickHouse проверяет, что изменения структуры таблицы не приводят к появлению циклов в вычислении выражения. При выполнении INSERT проверяется, что выражения можно вычислить — что все столбцы, на основе которых они считаются, были переданы.

### DEFAULT {#default}

`DEFAULT expr`

Обычное значение по умолчанию. Если значение такого столбца не указано в запросе INSERT, оно вычисляется из `expr`.

Пример:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime DEFAULT now(),
    updated_at_date Date DEFAULT toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id) VALUES (1);

SELECT * FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:06:46 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```

### MATERIALIZED {#materialized}

`MATERIALIZED expr`

Материализованное выражение. Значения таких столбцов автоматически вычисляются в соответствии с заданным материализованным выражением при вставке строк. Значения не могут быть явно заданы при выполнении `INSERT`.

Кроме того, столбцы этого типа со значением по умолчанию не включаются в результат `SELECT *`. Это нужно для сохранения инварианта, согласно которому результат `SELECT *` всегда можно вставить обратно в таблицу с помощью `INSERT`. Это поведение можно отключить с помощью настройки `asterisk_include_materialized_columns`.

Пример:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime MATERIALIZED now(),
    updated_at_date Date MATERIALIZED toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1);

SELECT * FROM test;
┌─id─┐
│  1 │
└────┘

SELECT id, updated_at, updated_at_date FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘

SELECT * FROM test SETTINGS asterisk_include_materialized_columns=1;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```

### EPHEMERAL {#ephemeral}

`EPHEMERAL [expr]`

Эфемерный столбец. Столбцы этого типа не хранятся в таблице, и по ним нельзя выполнять SELECT. Единственное назначение эфемерных столбцов — использовать их при построении выражений значений по умолчанию для других столбцов.

При вставке без явного указания столбцов столбцы этого типа будут пропущены. Это сделано для сохранения инварианта, согласно которому результат `SELECT *` всегда может быть вставлен обратно в таблицу с помощью `INSERT`.

Пример:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    unhexed String EPHEMERAL,
    hexed FixedString(4) DEFAULT unhex(unhexed)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id, unhexed) VALUES (1, '5a90b714');

SELECT
    id,
    hexed,
    hex(hexed)
FROM test
FORMAT Vertical;

Row 1:
──────
id:         1
hexed:      Z��
hex(hexed): 5A90B714
```

Строка 1:
──────
id:         1
hexed:      Z��
hex(hexed): 5A90B714

````sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    size_bytes Int64,
    size String ALIAS formatReadableSize(size_bytes)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1, 4678899);

SELECT id, size_bytes, size FROM test;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘

SELECT * FROM test SETTINGS asterisk_include_alias_columns=1;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘
```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    size_bytes Int64,
    size String ALIAS formatReadableSize(size_bytes)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1, 4678899);

SELECT id, size_bytes, size FROM test;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘

SELECT * FROM test SETTINGS asterisk_include_alias_columns=1;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘
````sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```sql
CREATE TABLE users_a (
    uid Int16, 
    name String, 
    age Int16, 
    name_len UInt8 MATERIALIZED length(name), 
    CONSTRAINT c1 ASSUME length(name) = name_len
) 
ENGINE=MergeTree 
ORDER BY (name_len, name);
```sql
CREATE TABLE users_a (
    uid Int16, 
    name String, 
    age Int16, 
    name_len UInt8 MATERIALIZED length(name), 
    CONSTRAINT c1 ASSUME length(name) = name_len
) 
ENGINE=MergeTree 
ORDER BY (name_len, name);
```sql
CREATE TABLE codec_example
(
    dt Date CODEC(ZSTD),
    ts DateTime CODEC(LZ4HC),
    float_value Float32 CODEC(NONE),
    double_value Float64 CODEC(LZ4HC(9)),
    value Float32 CODEC(Delta, ZSTD)
)
ENGINE = <Engine>
...
```sql
CREATE TABLE codec_example
(
    dt Date CODEC(ZSTD),
    ts DateTime CODEC(LZ4HC),
    float_value Float32 CODEC(NONE),
    double_value Float64 CODEC(LZ4HC(9)),
    value Float32 CODEC(Delta, ZSTD)
)
ENGINE = <Engine>
...
```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```sql
CREATE TABLE mytable
(
    x String CODEC(AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```sql
CREATE TABLE mytable
(
    x String CODEC(AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```sql
CREATE TABLE mytable
(
    x String CODEC(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```sql
CREATE TABLE mytable
(
    x String CODEC(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```sql
CREATE [OR REPLACE] TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```sql
CREATE [OR REPLACE] TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```sql
CREATE DATABASE base 
ENGINE = Atomic;

CREATE OR REPLACE TABLE base.t1
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

┌─n─┬─s────┐
│ 1 │ test │
└───┴──────┘
```sql
    CREATE DATABASE base 
    ENGINE = Atomic;

    CREATE OR REPLACE TABLE base.t1
    (
        n UInt64,
        s String
    )
    ENGINE = MergeTree
    ORDER BY n;

    INSERT INTO base.t1 VALUES (1, 'test');

    SELECT * FROM base.t1;

    ┌─n─┬─s────┐
    │ 1 │ test │
    └───┴──────┘
    ```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

┌─n─┬─s──┐
│ 2 │ \N │
└───┴────┘
```sql
    CREATE OR REPLACE TABLE base.t1 
    (
        n UInt64,
        s Nullable(String)
    )
    ENGINE = MergeTree
    ORDER BY n;

    INSERT INTO base.t1 VALUES (2, null);

    SELECT * FROM base.t1;

    ┌─n─┬─s──┐
    │ 2 │ \N │
    └───┴────┘
    ```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

┌─n─┐
│ 3 │
└───┘
```sql
    REPLACE TABLE base.t1 (n UInt64) 
    ENGINE = MergeTree 
    ORDER BY n;

    INSERT INTO base.t1 VALUES (3);

    SELECT * FROM base.t1;

    ┌─n─┐
    │ 3 │
    └───┘
    ```sql
CREATE DATABASE base;

CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

1    test
```sql
    CREATE DATABASE base;

    CREATE OR REPLACE TABLE base.t1 
    (
        n UInt64,
        s String
    )
    ENGINE = MergeTree
    ORDER BY n;

    INSERT INTO base.t1 VALUES (1, 'test');

    SELECT * FROM base.t1;

    1    test
    ```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64, 
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

2    
```sql
    CREATE OR REPLACE TABLE base.t1 
    (
        n UInt64, 
        s Nullable(String)
    )
    ENGINE = MergeTree
    ORDER BY n;

    INSERT INTO base.t1 VALUES (2, null);

    SELECT * FROM base.t1;

    2    
    ```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

3
```sql
    REPLACE TABLE base.t1 (n UInt64) 
    ENGINE = MergeTree 
    ORDER BY n;

    INSERT INTO base.t1 VALUES (3);

    SELECT * FROM base.t1;

    3
    ```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'Comment'
```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'Comment'
```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT 'The temporary table';
SELECT name, comment FROM system.tables WHERE name = 't1';
```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT 'Временная таблица';
SELECT name, comment FROM system.tables WHERE name = 't1';
```text
┌─name─┬─comment─────────────┐
│ t1   │ The temporary table │
└──────┴─────────────────────┘
```text
┌─name─┬─comment──────────────┐
│ t1   │ Временная таблица    │
└──────┴──────────────────────┘
```

## Похожие материалы {#related-content}

- Блог: [Оптимизация ClickHouse с помощью схем и кодеков](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- Блог: [Работа с данными временных рядов в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
