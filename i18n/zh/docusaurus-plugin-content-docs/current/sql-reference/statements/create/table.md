---
description: 'CREATE TABLE 语句文档'
keywords: ['compression', 'codec', 'schema', 'DDL']
sidebar_label: 'CREATE TABLE'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'CREATE TABLE'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

创建新表。根据具体用例，此查询可以采用多种语法形式。

默认情况下，表只会在当前服务器上创建。分布式 DDL 查询是通过 `ON CLUSTER` 子句实现的，该子句[单独说明](../../../sql-reference/distributed-ddl.md)。

## 语法形式 {#syntax-forms}

### 使用显式 Schema {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'comment for column'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'comment for column'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'comment for table']
```

在 `db` 数据库中创建名为 `table_name` 的表；如果未设置 `db`，则在当前数据库中创建。表的结构在括号中指定，并使用 `engine` 引擎。

表的结构由列描述、二级索引和约束的列表组成。如果引擎支持[主键](#primary-key)，则会在表引擎的参数中指定。

在最简单的情况下，一列的描述为 `name type`。示例：`RegionID UInt32`。

还可以为默认值定义表达式（见下文）。

如有需要，可以指定主键，使用一个或多个键表达式。

可以为列和表添加注释。

### 使用与其他表类似的表结构 {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

创建一个与另一张表结构相同的表。可以为该表指定不同的引擎。如果未指定引擎，则将使用与 `db2.name2` 表相同的引擎。

### 使用从另一张表克隆的表结构和数据 {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

创建一个与另一张表结构相同的表。可以为该表指定不同的引擎。如果未指定引擎，则将使用与 `db2.name2` 表相同的引擎。新表创建完成后，会将 `db2.name2` 中的所有分区附加到该表上。换句话说，在创建时，`db2.name2` 的数据会被克隆到 `db.table_name` 中。此查询等价于以下内容：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### 通过表函数 {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

创建一个表，其效果与指定的[表函数](/sql-reference/table-functions) 相同。创建的表在行为上也将与所指定的对应表函数一致。

### 通过 SELECT 查询 {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

创建一个表，其结构与 `SELECT` 查询的结果相同，使用 `engine` 引擎，并将 `SELECT` 的结果数据写入该表。你也可以显式指定列的定义。

如果表已存在并且指定了 `IF NOT EXISTS`，则查询不会执行任何操作。

在查询的 `ENGINE` 子句之后还可以包含其他子句。有关如何创建表的详细文档，请参阅[表引擎](/engines/table-engines)的说明。

**示例**

查询：

```sql
CREATE TABLE t1 (x String) ENGINE = Memory AS SELECT 1;
SELECT x, toTypeName(x) FROM t1;
```

结果：

```text
┌─x─┬─toTypeName(x)─┐
│ 1 │ String        │
└───┴───────────────┘
```

## NULL 或 NOT NULL 修饰符 {#null-or-not-null-modifiers}

在列定义中，可以在数据类型之后使用 `NULL` 和 `NOT NULL` 修饰符，用于指定该列是否可以为 [Nullable](/sql-reference/data-types/nullable) 类型。

如果类型本身不是 `Nullable`，并且指定了 `NULL`，则该类型会被视为 `Nullable`；如果指定了 `NOT NULL`，则不会。例如，`INT NULL` 等同于 `Nullable(INT)`。如果类型已经是 `Nullable`，却仍然指定了 `NULL` 或 `NOT NULL` 修饰符，则会抛出异常。

另请参阅 [data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable) 设置。

## 默认值 {#default_values}

列定义可以以 `DEFAULT expr`、`MATERIALIZED expr` 或 `ALIAS expr` 的形式指定默认值表达式。示例：`URLDomain String DEFAULT domain(URL)`。

表达式 `expr` 是可选的。如果省略该表达式，则必须显式指定列类型，并且默认值将为：数值列为 `0`，字符串列为 `''`（空字符串），数组列为 `[]`（空数组），日期列为 `1970-01-01`，Nullable 列为 `NULL`。

默认值列的列类型可以省略，此时会从 `expr` 的类型中推断类型。例如，列 `EventDate DEFAULT toDate(EventTime)` 的类型将是 Date。

如果同时指定了数据类型和默认值表达式，则会插入一个隐式类型转换函数，将该表达式转换为指定类型。示例：`Hits UInt32 DEFAULT 0` 在内部表示为 `Hits UInt32 DEFAULT toUInt32(0)`。

默认值表达式 `expr` 可以引用任意表列和常量。ClickHouse 会检查对表结构的修改不会在表达式计算中引入循环。对于 INSERT，会检查表达式是可解析的——即所有用于计算这些表达式的列所依赖的列在 INSERT 中都已提供。

### DEFAULT {#default}

`DEFAULT expr`

普通默认值。如果在 INSERT 查询中未指定此类列的值，则会根据 `expr` 计算该值。

示例：

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

物化表达式。在插入行时，此类列的值会根据指定的物化表达式自动计算。在执行 `INSERT` 时，不能显式指定这些值。

此外，此类型的默认值列不会包含在 `SELECT *` 的结果中。这样可以保持一个不变式：`SELECT *` 的结果始终可以通过 `INSERT` 重新插入到表中。可以通过设置 `asterisk_include_materialized_columns` 来禁用此行为。

示例：

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

临时列。此类型的列不会存储在表中，也无法在 `SELECT` 查询中引用。临时列的唯一用途是基于它们构建其他列的默认值表达式。

未显式指定列名的插入操作会跳过此类型的列。这样可以保持一个不变式：`SELECT *` 的结果总是可以通过 `INSERT` 重新插入表中。

示例：

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

第 1 行:
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
COMMENT '备注'
```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT 'The temporary table';
SELECT name, comment FROM system.tables WHERE name = 't1';
```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT '临时表';
SELECT name, comment FROM system.tables WHERE name = 't1';
```text
┌─name─┬─comment─────────────┐
│ t1   │ The temporary table │
└──────┴─────────────────────┘
```text
┌─name─┬─comment─────────┐
│ t1   │ 临时表          │
└──────┴─────────────────┘
```

## 相关内容 {#related-content}

- 博客：[使用表结构和编解码器优化 ClickHouse](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
