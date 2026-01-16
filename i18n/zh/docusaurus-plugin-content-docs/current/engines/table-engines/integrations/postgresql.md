---
description: 'PostgreSQL 引擎允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。'
sidebar_label: 'PostgreSQL'
sidebar_position: 160
slug: /engines/table-engines/integrations/postgresql
title: 'PostgreSQL 表引擎'
doc_type: '指南'
---

# PostgreSQL 表引擎 \\{#postgresql-table-engine\\}

PostgreSQL 引擎允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。

:::note
当前仅支持 PostgreSQL 12 及以上版本。
:::

:::tip
建议 ClickHouse Cloud 用户使用 [ClickPipes](/integrations/clickpipes) 以流式方式将 PostgreSQL 数据导入 ClickHouse。该方式原生支持高性能插入，并通过可分别扩展摄取和集群资源，实现清晰的职责划分。
:::

## 创建数据表 \\{#creating-a-table\\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 type1 [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 type2 [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = PostgreSQL({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细说明。

表结构可以与原始 PostgreSQL 表结构不同：

* 列名应当与原始 PostgreSQL 表中的列名相同，但可以只使用其中部分列，并按任意顺序排列。
* 列类型可以与原始 PostgreSQL 表中的类型不同。ClickHouse 会尝试将值[转换](../../../engines/database-engines/postgresql.md#data_types-support)为 ClickHouse 的数据类型。
* [external&#95;table&#95;functions&#95;use&#95;nulls](/operations/settings/settings#external_table_functions_use_nulls) 设置定义了如何处理 Nullable 列。默认值：1。当为 0 时，表函数不会创建 Nullable 列，而是插入默认值来替代 null。这同样适用于数组中的 NULL 值。

**引擎参数**

* `host:port` — PostgreSQL 服务器地址。
* `database` — 远程数据库名称。
* `table` — 远程表名称。
* `user` — PostgreSQL 用户。
* `password` — 用户密码。
* `schema` — 非默认表的 schema。可选。
* `on_conflict` — 冲突解决策略。例如：`ON CONFLICT DO NOTHING`。可选。注意：添加此选项会降低插入效率。

[Named collections](/operations/named-collections.md)（自 21.11 版本起可用）推荐在生产环境中使用。示例如下：

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

可以通过键值对参数来覆盖某些参数：

```sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```

## 实现细节 \\{#implementation-details\\}

PostgreSQL 端的 `SELECT` 查询在只读 PostgreSQL 事务中以 `COPY (SELECT ...) TO STDOUT` 的形式运行，每个 `SELECT` 查询结束后都会提交事务。

诸如 `=`, `!=`, `>`, `>=`, `<`, `<=` 和 `IN` 这类简单的 `WHERE` 子句在 PostgreSQL 服务器上执行。

所有连接、聚合、排序、`IN [ array ]` 条件以及 `LIMIT` 采样约束，都会在对 PostgreSQL 的查询完成之后，仅在 ClickHouse 中执行。

PostgreSQL 端的 `INSERT` 查询在 PostgreSQL 事务中以 `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` 的形式运行，并在每条 `INSERT` 语句之后自动提交。

PostgreSQL 的 `Array` 类型会被转换为 ClickHouse 的数组。

:::note
请注意：在 PostgreSQL 中，以 `type_name[]` 创建的数组数据，在同一列的不同表行中，可能包含维度不同的多维数组。但在 ClickHouse 中，同一列的所有表行中的多维数组维度必须相同。
:::

支持多个副本，副本之间需要用 `|` 分隔。例如：

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

PostgreSQL 字典源支持副本优先级。映射中的数字越大，优先级越低。最高优先级为 `0`。

在下面的示例中，副本 `example01-1` 具有最高优先级：

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

## 使用示例 \\{#usage-example\\}

### PostgreSQL 中的表 \\{#table-in-postgresql\\}

```text
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

### 在 ClickHouse 中创建表并连接到上文创建的 PostgreSQL 表 \\{#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above\\}

此示例使用 [PostgreSQL 表引擎](/engines/table-engines/integrations/postgresql.md)，将 ClickHouse 表连接到 PostgreSQL 表，并在 PostgreSQL 数据库上同时执行 SELECT 和 INSERT 查询：

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### 使用 SELECT 查询将 PostgreSQL 表中的初始数据插入到 ClickHouse 表中 \\{#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query\\}

[postgresql table function](/sql-reference/table-functions/postgresql.md) 会将数据从 PostgreSQL 复制到 ClickHouse，通常用于在 ClickHouse 而非 PostgreSQL 中执行查询或分析，从而提升数据的查询性能，也可用于将数据从 PostgreSQL 迁移到 ClickHouse。由于我们将数据从 PostgreSQL 复制到 ClickHouse，因此会在 ClickHouse 中使用 MergeTree 表引擎，并将其命名为 postgresql&#95;copy：

```sql
CREATE TABLE default.postgresql_copy
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = MergeTree
ORDER BY (int_id);
```

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### 将 PostgreSQL 表中的增量数据插入到 ClickHouse 表中 \\{#inserting-incremental-data-from-postgresql-table-into-clickhouse-table\\}

如果在初始插入之后，随后需要在 PostgreSQL 表和 ClickHouse 表之间执行持续同步，可以在 ClickHouse 中使用 WHERE 子句，根据时间戳或唯一序列 ID，仅插入新增到 PostgreSQL 的数据。

这需要跟踪之前已插入的最大 ID 或时间戳，例如：

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

然后从 PostgreSQL 表中插入大于当前最大值的记录

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### 从生成的 ClickHouse 表中查询数据 \\{#selecting-data-from-the-resulting-clickhouse-table\\}

```sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

```text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### 使用非默认模式 \\{#using-non-default-schema\\}

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

**另请参阅**

* [`postgresql` 表函数](../../../sql-reference/table-functions/postgresql.md)
* [将 PostgreSQL 用作字典源](/sql-reference/dictionaries#mysql)

## 相关内容 \\{#related-content\\}

- 博客：[ClickHouse 和 PostgreSQL——数据界的天作之合（第一部分）](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- 博客：[ClickHouse 和 PostgreSQL——数据界的天作之合（第二部分）](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
