---
'description': 'PostgreSQL 引擎允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。'
'sidebar_label': 'PostgreSQL'
'sidebar_position': 160
'slug': '/engines/table-engines/integrations/postgresql'
'title': 'PostgreSQL 表引擎'
'doc_type': 'guide'
---

The PostgreSQL engine allows `SELECT` and `INSERT` queries on data stored on a remote PostgreSQL server.

:::note
当前，仅支持 PostgreSQL 版本 12 及以上。
:::

:::note
建议 ClickHouse Cloud 用户使用 [ClickPipes](/integrations/clickpipes) 将 Postgres 数据流式传输到 ClickHouse。这原生支持高性能插入，同时确保关注点分离，并能够独立扩展数据摄取和集群资源。
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

查看 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细描述。

表结构可以与原始 PostgreSQL 表结构不同：

- 列名称应与原始 PostgreSQL 表中的名称相同，但您可以只使用其中的一些列，并按任意顺序排列。
- 列类型可能与原始 PostgreSQL 表中的类型不同。ClickHouse 会尝试将值转换为 ClickHouse 数据类型，见 [cast](../../../engines/database-engines/postgresql.md#data_types-support)。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 设置定义了如何处理 Nullable 列。默认值：1。如果为 0，则表函数不会创建 Nullable 列，并插入默认值而不是空值。这同样适用于数组内部的 NULL 值。

**引擎参数**

- `host:port` — PostgreSQL 服务器地址。
- `database` — 远程数据库名称。
- `table` — 远程表名称。
- `user` — PostgreSQL 用户。
- `password` — 用户密码。
- `schema` — 非默认表架构。可选。
- `on_conflict` — 冲突解决策略。例如：`ON CONFLICT DO NOTHING`。可选。注意：添加此选项会使插入效率降低。

建议在生产环境中使用 [命名集合](/operations/named-collections.md)（自版本 21.11 起可用）。以下是一个示例：

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

在 PostgreSQL 端的 `SELECT` 查询作为 `COPY (SELECT ...) TO STDOUT` 在只读 PostgreSQL 事务内运行，并在每个 `SELECT` 查询后提交。

简单的 `WHERE` 子句，例如 `=`、`!=`、`>`、`>=`、`<`、`<=` 和 `IN` 在 PostgreSQL 服务器上执行。

所有连接、聚合、排序、`IN [ array ]` 条件和 `LIMIT` 抽样限制仅在查询 PostgreSQL 完成后在 ClickHouse 中执行。

在 PostgreSQL 端的 `INSERT` 查询作为 `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` 在 PostgreSQL 事务内运行，并在每个 `INSERT` 语句后自动提交。

PostgreSQL 的 `Array` 类型被转换为 ClickHouse 数组。

:::note
要小心 - 在 PostgreSQL 中，创建为 `type_name[]` 的数组数据可以在同一列的不同表行中包含不同维度的多维数组。但在 ClickHouse 中，只允许在同一列的所有表行中具有相同维数的多维数组。
:::

支持多个副本，必须用 `|` 列出。例如：

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

支持 PostgreSQL 字典源的副本优先级。映射中数字越大，优先级越低。最高优先级为 `0`。

在下面的示例中，副本 `example01-1` 拥有最高优先级：

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

### 在 ClickHouse 中创建表，并连接到上面创建的 PostgreSQL 表 {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

此示例使用 [PostgreSQL 表引擎](/engines/table-engines/integrations/postgresql.md) 将 ClickHouse 表连接到 PostgreSQL 表，并使用 SELECT 和 INSERT 语句访问 PostgreSQL 数据库：

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### 使用 SELECT 查询将初始数据从 PostgreSQL 表插入 ClickHouse 表 {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

[postgresql 表函数](/sql-reference/table-functions/postgresql.md) 将数据从 PostgreSQL 复制到 ClickHouse，这通常用于通过在 ClickHouse 中查询或进行分析来提高数据的查询性能，而不是在 PostgreSQL 中使用，或者也可以用于将数据从 PostgreSQL 迁移到 ClickHouse。由于我们将从 PostgreSQL 向 ClickHouse 复制数据，我们将在 ClickHouse 中使用一个 MergeTree 表引擎并将其命名为 postgresql_copy：

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

### 从 PostgreSQL 表向 ClickHouse 表插入增量数据 {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

如果在初始插入后需要在 PostgreSQL 表和 ClickHouse 表之间进行持续同步，可以在 ClickHouse 中使用 WHERE 子句仅插入根据时间戳或唯一序列 ID 添加到 PostgreSQL 的数据。

这将需要跟踪之前添加的最大 ID 或时间戳，例如以下内容：

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

然后插入来自 PostgreSQL 表大于最大值的值：

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### 从结果 ClickHouse 表中选择数据 {#selecting-data-from-the-resulting-clickhouse-table}

```sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

```text
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

**另请参见**

- [postgresql 表函数](../../../sql-reference/table-functions/postgresql.md)
- [将 PostgreSQL 用作字典源](/sql-reference/dictionaries#mysql)

## 相关内容 {#related-content}

- 博客: [ClickHouse 和 PostgreSQL - 数据天作之合 - 第 1 部分](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- 博客: [ClickHouse 和 PostgreSQL - 数据天作之合 - 第 2 部分](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
