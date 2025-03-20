---
slug: /engines/table-engines/integrations/postgresql
title: 'PostgreSQL 表引擎'
sidebar_position: 160
sidebar_label: PostgreSQL
description: 'PostgreSQL 引擎允许在远程 PostgreSQL 服务器上对存储的数据执行 `SELECT` 和 `INSERT` 查询。'
---

PostgreSQL 引擎允许在远程 PostgreSQL 服务器上对存储的数据执行 `SELECT` 和 `INSERT` 查询。

:::note
目前，仅支持 PostgreSQL 版本 12 及以上。
:::

:::note 通过 PeerDB 复制或迁移 PostgreSQL 数据
> 除了 PostgreSQL 表引擎，您还可以使用 [PeerDB](https://docs.peerdb.io/introduction) 来设置从 PostgreSQL 到 ClickHouse 的持续数据管道。PeerDB 是一个专门设计用于通过变更数据捕获 (CDC) 将数据从 PostgreSQL 复制到 ClickHouse 的工具。
:::

## 创建表 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 type1 [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 type2 [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = PostgreSQL({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

详细描述请参见 [CREATE TABLE](/sql-reference/statements/create/table) 查询。

表结构可以与原始 PostgreSQL 表结构不同：

- 列名应与原始 PostgreSQL 表中的列相同，但您可以只使用这些列中的一些，并按任意顺序排列。
- 列类型可以与原始 PostgreSQL 表中的类型不同。ClickHouse 会尝试将值 [转换](../../../engines/database-engines/postgresql.md#data_types-support) 为 ClickHouse 数据类型。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 设置定义如何处理 Nullable 列。默认值：1。如果设置为 0 ，则表函数不生成 Nullable 列，而是插入默认值来替代 null。这同样适用于数组中的 NULL 值。

**引擎参数**

- `host:port` — PostgreSQL 服务器地址。
- `database` — 远程数据库名称。
- `table` — 远程表名称。
- `user` — PostgreSQL 用户。
- `password` — 用户密码。
- `schema` — 非默认表架构。可选。
- `on_conflict` — 冲突解决策略。示例：`ON CONFLICT DO NOTHING`。可选。注意：添加此选项将使插入效率降低。

推荐在生产环境中使用 [命名集合](/operations/named-collections.md) （自版本 21.11 起可用）。以下是一个示例：

```xml
<named_collections>
    <postgres_creds>
        <host>localhost</host>
        <port>5432</port>
        <user>postgres</user>
        <password>****</password>
        <schema>schema1</schema>
    </postgres_creds>
</named_collections>
```

某些参数可以通过键值参数覆盖：
``` sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```

## 实现细节 {#implementation-details}

PostgreSQL 端的 `SELECT` 查询以 `COPY (SELECT ...) TO STDOUT` 的形式在只读 PostgreSQL 事务中运行，每个 `SELECT` 查询后都会提交。

简单的 `WHERE` 子句例如 `=`、`!=`、`>`、`>=`、`<`、`<=` 和 `IN` 在 PostgreSQL 服务器上执行。

所有的连接、聚合、排序、`IN [ array ]` 条件和 `LIMIT` 采样约束都仅在查询向 PostgreSQL 完成后在 ClickHouse 中执行。

PostgreSQL 端的 `INSERT` 查询以 `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` 的形式在 PostgreSQL 事务中运行，并在每个 `INSERT` 语句后自动提交。

PostgreSQL 的 `Array` 类型会转换为 ClickHouse 的数组。

:::note
请注意 - 在 PostgreSQL 中，以 `type_name[]` 创建的数组数据可能包含同一列中不同表行的不同维度的多维数组。但在 ClickHouse 中，仅允许在同一列中具有相同维度数的多维数组。
:::

支持多个副本，副本必须用 `|` 列出。例如：

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

支持 PostgreSQL 字典源的副本优先级。映射中数字越大，优先级越低。最高优先级为 `0`。

以下示例中，副本 `example01-1` 具有最高优先级：

```xml
<postgresql>
    <port>5432</port>
    <user>clickhouse</user>
    <password>qwerty</password>
    <replica>
        <host>example01-1</host>
        <priority>1</priority>
    </replica>
    <replica>
        <host>example01-2</host>
        <priority>2</priority>
    </replica>
    <db>db_name</db>
    <table>table_name</table>
    <where>id=10</where>
    <invalidate_query>SQL_QUERY</invalidate_query>
</postgresql>
</source>
```

## 使用示例 {#usage-example}

### PostgreSQL 中的表 {#table-in-postgresql}

``` text
postgres=# CREATE TABLE "public"."test" (
"int_id" SERIAL,
"int_nullable" INT NULL DEFAULT NULL,
"float" FLOAT NOT NULL,
"str" VARCHAR(100) NOT NULL DEFAULT '',
"float_nullable" FLOAT NULL DEFAULT NULL,
PRIMARY KEY (int_id));

CREATE TABLE

postgres=# INSERT INTO test (int_id, str, "float") VALUES (1,'test',2);
INSERT 0 1

postgresql> SELECT * FROM test;
  int_id | int_nullable | float | str  | float_nullable
 --------+--------------+-------+------+----------------
       1 |              |     2 | test |
 (1 row)
```

### 在 ClickHouse 中创建表，并连接到上面创建的 PostgreSQL 表 {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

此示例使用 [PostgreSQL 表引擎](/engines/table-engines/integrations/postgresql.md) 将 ClickHouse 表连接到 PostgreSQL 表，并使用 SELECT 和 INSERT 语句操作 PostgreSQL 数据库：

``` sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
```

### 从 PostgreSQL 表插入初始数据到 ClickHouse 表，使用 SELECT 查询 {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

[postgresql 表函数](/sql-reference/table-functions/postgresql.md) 会将数据从 PostgreSQL 复制到 ClickHouse，这通常用于提高通过 ClickHouse 查询或进行分析的性能，而不是在 PostgreSQL 中执行，或也可用于将数据从 PostgreSQL 迁移到 ClickHouse。由于我们将从 PostgreSQL 复制数据到 ClickHouse，因此我们将在 ClickHouse 中使用 MergeTree 表引擎，并将其命名为 postgresql_copy：

``` sql
CREATE TABLE default.postgresql_copy
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = MergeTree
ORDER BY (int_id);
```

``` sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
```

### 从 PostgreSQL 表插入增量数据到 ClickHouse 表 {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

如果在初始插入后需要在 PostgreSQL 表和 ClickHouse 表之间持续同步，可以在 ClickHouse 中使用 WHERE 子句，仅插入基于时间戳或唯一序列 ID 新增的数据。

这需要跟踪之前添加的最大 ID 或时间戳，例如：

``` sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

然后插入 PostgreSQL 表中大于最大 ID 的值：

``` sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### 从结果 ClickHouse 表中选择数据 {#selecting-data-from-the-resulting-clickhouse-table}

``` sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

``` text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### 使用非默认架构 {#using-non-default-schema}

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

**另见**

- [`postgresql` 表函数](../../../sql-reference/table-functions/postgresql.md)
- [使用 PostgreSQL 作为字典源](/sql-reference/dictionaries#mysql)

## 相关内容 {#related-content}

- 博客: [ClickHouse 和 PostgreSQL - 数据天堂的完美结合 - 第 1 部分](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- 博客: [ClickHouse 和 PostgreSQL - 数据天堂的完美结合 - 第 2 部分](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
