---
description: '允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。'
sidebar_label: 'postgresql'
sidebar_position: 160
slug: /sql-reference/table-functions/postgresql
title: 'postgresql'
doc_type: 'reference'
---

# postgresql 表函数 \{#postgresql-table-function\}

允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。

## 语法 \{#syntax\}

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

## 参数 \{#arguments\}

| 参数          | 描述                                                                         |
|---------------|------------------------------------------------------------------------------|
| `host:port`   | PostgreSQL 服务器地址。                                                      |
| `database`    | 远程数据库名称。                                                             |
| `table`       | 远程表名称。                                                                 |
| `user`        | PostgreSQL 用户。                                                            |
| `password`    | 用户密码。                                                                   |
| `schema`      | 非默认表模式（schema）。可选。                                               |
| `on_conflict` | 冲突解决策略。例如：`ON CONFLICT DO NOTHING`。可选。                         |

参数也可以通过[命名集合](operations/named-collections.md)传递。在这种情况下，应分别指定 `host` 和 `port`。此方式推荐用于生产环境。

## 返回值 \{#returned_value\}

一个表对象，其列与原始 PostgreSQL 表相同。

:::note
在 `INSERT` 语句中，为了将表函数 `postgresql(...)` 与后面带列名列表的表名区分开来，必须使用关键字 `FUNCTION` 或 `TABLE FUNCTION`。请参见下方示例。
:::

## 实现细节 \{#implementation-details\}

PostgreSQL 端的 `SELECT` 查询以 `COPY (SELECT ...) TO STDOUT` 的形式在只读 PostgreSQL 事务中运行，每个 `SELECT` 查询结束后提交事务。

诸如 `=`, `!=`, `>`, `>=`, `<`, `<=` 和 `IN` 等简单的 `WHERE` 子句在 PostgreSQL 服务器上执行。

所有 JOIN、聚合、排序、`IN [ array ]` 条件以及 `LIMIT` 采样限制都仅在对 PostgreSQL 的查询完成之后，由 ClickHouse 执行。

PostgreSQL 端的 `INSERT` 查询以 `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` 的形式在 PostgreSQL 事务中运行，并在每条 `INSERT` 语句之后自动提交。

PostgreSQL 的数组类型会被转换为 ClickHouse 的数组。

:::note
请注意，在 PostgreSQL 中，像 Integer[] 这样的数组类型列可以在不同行中包含不同维度的数组，但在 ClickHouse 中，只允许所有行中的多维数组具有相同的维度。
:::

支持多个副本，必须使用 `|` 分隔。例如：

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

或

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

支持为 PostgreSQL 字典数据源设置副本优先级。`map` 中数值越大，优先级越低，最高优先级为 `0`。

## 示例 \{#examples\}

PostgreSQL 中的表：

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

使用普通参数从 ClickHouse 中查询数据：

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

或者使用 [命名集合](operations/named-collections.md)：

```sql
CREATE NAMED COLLECTION mypg AS
        host = 'localhost',
        port = 5432,
        database = 'test',
        user = 'postgresql_user',
        password = 'password';
SELECT * FROM postgresql(mypg, table='test') WHERE str IN ('test');
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

插入：

```sql
INSERT INTO TABLE FUNCTION postgresql('localhost:5432', 'test', 'test', 'postgrsql_user', 'password') (int_id, float) VALUES (2, 3);
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password');
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
│      2 │         ᴺᵁᴸᴸ │     3 │      │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

使用非默认 Schema：

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

## 相关 \{#related\}

- [PostgreSQL 表引擎](../../engines/table-engines/integrations/postgresql.md)
- [将 PostgreSQL 用作字典源](/sql-reference/dictionaries#postgresql)

### 使用 PeerDB 复制或迁移 Postgres 数据 \{#replicating-or-migrating-postgres-data-with-with-peerdb\}

> 除了表函数之外，您还可以使用 ClickHouse 的 [PeerDB](https://docs.peerdb.io/introduction) 来搭建一条从 Postgres 到 ClickHouse 的持续数据管道。PeerDB 是一款专门为基于变更数据捕获（CDC）机制，将数据从 Postgres 复制到 ClickHouse 而设计的工具。
