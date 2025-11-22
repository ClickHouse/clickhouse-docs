---
description: 'PostgreSQL 引擎允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。'
sidebar_label: 'PostgreSQL'
sidebar_position: 160
slug: /engines/table-engines/integrations/postgresql
title: 'PostgreSQL 表引擎'
doc_type: 'guide'
---



# PostgreSQL 表引擎

PostgreSQL 引擎支持对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。

:::note
当前仅支持 PostgreSQL 12 及以上版本。
:::

:::tip
建议 ClickHouse Cloud 用户使用 [ClickPipes](/integrations/clickpipes) 将 PostgreSQL 数据以流式方式写入 ClickHouse。它原生支持高性能插入，同时通过能够独立扩展数据摄取与集群资源，实现关注点分离。
:::



## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 type1 [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 type2 [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = PostgreSQL({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

详细说明请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询。

表结构可以与原始 PostgreSQL 表结构不同：

- 列名应与原始 PostgreSQL 表中的列名相同，但可以只使用部分列，且顺序可以任意。
- 列类型可以与原始 PostgreSQL 表中的列类型不同。ClickHouse 会尝试将值[转换](../../../engines/database-engines/postgresql.md#data_types-support)为 ClickHouse 数据类型。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 设置定义了如何处理 Nullable 列。默认值为 1。如果设置为 0，表函数不会创建 Nullable 列，而是插入默认值来代替 null。这同样适用于数组内的 NULL 值。

**引擎参数**

- `host:port` — PostgreSQL 服务器地址。
- `database` — 远程数据库名称。
- `table` — 远程表名称。
- `user` — PostgreSQL 用户。
- `password` — 用户密码。
- `schema` — 非默认表模式。可选。
- `on_conflict` — 冲突解决策略。示例：`ON CONFLICT DO NOTHING`。可选。注意：添加此选项会降低插入效率。

建议在生产环境中使用[命名集合](/operations/named-collections.md)（自版本 21.11 起可用）。示例如下：

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

```sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```


## 实现细节 {#implementation-details}

PostgreSQL 端的 `SELECT` 查询在只读 PostgreSQL 事务中以 `COPY (SELECT ...) TO STDOUT` 的形式运行,每次 `SELECT` 查询后执行提交。

简单的 `WHERE` 子句(如 `=`、`!=`、`>`、`>=`、`<`、`<=` 和 `IN`)在 PostgreSQL 服务器上执行。

所有连接、聚合、排序、`IN [ array ]` 条件和 `LIMIT` 采样约束仅在 PostgreSQL 查询完成后才在 ClickHouse 中执行。

PostgreSQL 端的 `INSERT` 查询在 PostgreSQL 事务中以 `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` 的形式运行,每条 `INSERT` 语句后自动提交。

PostgreSQL 的 `Array` 类型会转换为 ClickHouse 数组。

:::note
请注意 - 在 PostgreSQL 中,以 `type_name[]` 形式创建的数组数据可能在同一列的不同表行中包含不同维度的多维数组。但在 ClickHouse 中,同一列的所有表行只允许具有相同维度数的多维数组。
:::

支持多个副本,必须使用 `|` 分隔列出。例如:

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

支持 PostgreSQL 字典源的副本优先级。映射中的数字越大,优先级越低。最高优先级为 `0`。

在下面的示例中,副本 `example01-1` 具有最高优先级:

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

### 在 ClickHouse 中创建表并连接到上面创建的 PostgreSQL 表 {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

此示例使用 [PostgreSQL 表引擎](/engines/table-engines/integrations/postgresql.md) 将 ClickHouse 表连接到 PostgreSQL 表,并对 PostgreSQL 数据库执行 SELECT 和 INSERT 语句:

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### 使用 SELECT 查询将 PostgreSQL 表中的初始数据插入 ClickHouse 表 {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

[postgresql 表函数](/sql-reference/table-functions/postgresql.md) 将数据从 PostgreSQL 复制到 ClickHouse,通常用于通过在 ClickHouse 而非 PostgreSQL 中执行查询或分析来提升数据查询性能,也可用于将数据从 PostgreSQL 迁移到 ClickHouse。由于我们将从 PostgreSQL 复制数据到 ClickHouse,因此将在 ClickHouse 中使用 MergeTree 表引擎,并将其命名为 postgresql_copy:

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

### 将 PostgreSQL 表中的增量数据插入 ClickHouse 表 {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

如果在初始插入后需要在 PostgreSQL 表和 ClickHouse 表之间执行持续同步,可以在 ClickHouse 中使用 WHERE 子句,仅插入基于时间戳或唯一序列 ID 新增到 PostgreSQL 的数据。

这需要跟踪之前添加的最大 ID 或时间戳,例如:

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

然后从 PostgreSQL 表中插入大于最大值的数据

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### 从生成的 ClickHouse 表中查询数据 {#selecting-data-from-the-resulting-clickhouse-table}

```sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

```text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### 使用非默认模式 {#using-non-default-schema}

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

- [`postgresql` 表函数](../../../sql-reference/table-functions/postgresql.md)
- [使用 PostgreSQL 作为字典源](/sql-reference/dictionaries#mysql)


## 相关内容 {#related-content}

- 博客：[ClickHouse 与 PostgreSQL - 数据领域的完美搭档 - 第 1 部分](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- 博客：[ClickHouse 与 PostgreSQL - 数据领域的完美搭档 - 第 2 部分](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
