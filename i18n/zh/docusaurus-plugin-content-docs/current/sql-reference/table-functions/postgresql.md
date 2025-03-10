---
slug: /sql-reference/table-functions/postgresql
sidebar_position: 160
sidebar_label: postgresql
title: 'postgresql'
description: '允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。'
---


# postgresql 表函数

允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。

**语法**

``` sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

**参数**

- `host:port` — PostgreSQL 服务器地址。
- `database` — 远程数据库名称。
- `table` — 远程表名称。
- `user` — PostgreSQL 用户。
- `password` — 用户密码。
- `schema` — 非默认表模式。可选。
- `on_conflict` — 冲突解决策略。示例：`ON CONFLICT DO NOTHING`。可选。

参数也可以使用 [命名集合](operations/named-collections.md) 传递。在这种情况下，`host` 和 `port` 应单独指定。此方法建议用于生产环境。

**返回值**

一个具有与原 PostgreSQL 表相同列的表对象。

:::note
在 `INSERT` 查询中，为了区分表函数 `postgresql(...)` 与列名列表的表名，您必须使用关键字 `FUNCTION` 或 `TABLE FUNCTION`。请参见下面的示例。
:::

## 实现细节 {#implementation-details}

在 PostgreSQL 侧，`SELECT` 查询以 `COPY (SELECT ...) TO STDOUT` 形式在只读 PostgreSQL 事务中运行，并在每个 `SELECT` 查询后提交。

简单的 `WHERE` 子句，如 `=`、`!=`、`>`、`>=`、`<`、`<=` 和 `IN` 在 PostgreSQL 服务器上执行。

所有连接、聚合、排序、`IN [ array ]` 条件和 `LIMIT` 采样约束在 ClickHouse 侧仅在查询到 PostgreSQL 完成后执行。

在 PostgreSQL 侧，`INSERT` 查询以 `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` 形式在 PostgreSQL 事务中运行，并在每个 `INSERT` 语句后自动提交。

PostgreSQL 数组类型转换为 ClickHouse 数组。

:::note
请注意，在 PostgreSQL 中，像 Integer[] 这样的数组数据类型列可能在不同的行中包含不同维度的数组，但在 ClickHouse 中，仅允许在所有行中具有相同维度的多维数组。
:::

支持多个副本，必须用 `|` 列出。例如：

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

或

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

支持 PostgreSQL 字典源的副本优先级。映射中数字越大，优先级越低。最高优先级为 `0`。

**示例**

PostgreSQL 中的表：

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

使用普通参数从 ClickHouse 选择数据：

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

或使用 [命名集合](operations/named-collections.md)：

```sql
CREATE NAMED COLLECTION mypg AS
        host = 'localhost',
        port = 5432,
        database = 'test',
        user = 'postgresql_user',
        password = 'password';
SELECT * FROM postgresql(mypg, table='test') WHERE str IN ('test');
```

``` text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

插入：

```sql
INSERT INTO TABLE FUNCTION postgresql('localhost:5432', 'test', 'test', 'postgrsql_user', 'password') (int_id, float) VALUES (2, 3);
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password');
```

``` text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
│      2 │         ᴺᵁᴸᴸ │     3 │      │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

使用非默认模式：

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

- [PostgreSQL 表引擎](../../engines/table-engines/integrations/postgresql.md)
- [将 PostgreSQL 用作字典源](/sql-reference/dictionaries#postgresql)

## 相关内容 {#related-content}

- 博客：[ClickHouse 和 PostgreSQL - 数据天堂的完美结合 - 第 1 部分](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- 博客：[ClickHouse 和 PostgreSQL - 数据天堂的完美结合 - 第 2 部分](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)

### 使用 PeerDB 复制或迁移 Postgres 数据 {#replicating-or-migrating-postgres-data-with-with-peerdb}

> 除了表函数，您可以随时使用 [PeerDB](https://docs.peerdb.io/introduction) 通过 ClickHouse 从 Postgres 设置一个持续的数据管道到 ClickHouse。PeerDB 是一个专门设计用于使用变更数据捕获 (CDC) 从 Postgres 复制数据到 ClickHouse 的工具。
