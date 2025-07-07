---
'description': '允许 `SELECT` 和 `INSERT` 查询在存储在远程 PostgreSQL 服务器上的数据上执行。'
'sidebar_label': 'postgresql'
'sidebar_position': 160
'slug': '/sql-reference/table-functions/postgresql'
'title': 'postgresql'
---


# postgresql 表函数

允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。

## 语法 {#syntax}

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

## 参数 {#arguments}

| 参数         | 描述                                                                       |
|--------------|---------------------------------------------------------------------------|
| `host:port`  | PostgreSQL 服务器地址。                                                  |
| `database`   | 远程数据库名称。                                                          |
| `table`      | 远程表名称。                                                              |
| `user`       | PostgreSQL 用户。                                                        |
| `password`   | 用户密码。                                                                |
| `schema`     | 非默认表模式。可选。                                                     |
| `on_conflict`| 冲突解决策略。示例：`ON CONFLICT DO NOTHING`。可选。                     |

参数也可以使用 [命名集合](operations/named-collections.md) 传递。在这种情况下，`host` 和 `port` 应该单独指定。这种方法推荐用于生产环境。

## 返回值 {#returned_value}

具有与原始 PostgreSQL 表相同列的表对象。

:::note
在 `INSERT` 查询中，为了区分表函数 `postgresql(...)` 和表名（带列名列表），必须使用关键字 `FUNCTION` 或 `TABLE FUNCTION`。请参见下面的示例。
:::

## 实现细节 {#implementation-details}

PostgreSQL 端的 `SELECT` 查询作为 `COPY (SELECT ...) TO STDOUT` 在只读 PostgreSQL 事务中运行，每个 `SELECT` 查询后提交。

简单的 `WHERE` 子句，如 `=`、`!=`、`>`、`>=`、`<`、`<=` 和 `IN` 在 PostgreSQL 服务器上执行。

所有连接、聚合、排序、`IN [ array ]` 条件和 `LIMIT` 采样约束仅在查询到 PostgreSQL 完成后在 ClickHouse 中执行。

PostgreSQL 端的 `INSERT` 查询作为 `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` 在 PostgreSQL 事务中运行，每个 `INSERT` 语句后自动提交。

PostgreSQL 数组类型转换为 ClickHouse 数组。

:::note
请注意，在 PostgreSQL 中，像 Integer[] 这样的数组数据类型列可能在不同的行中包含不同维度的数组，但在 ClickHouse 中，所有行中仅允许具有相同维度的多维数组。
:::

支持多个副本，必须用 `|` 列出。例如：

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

或者

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

支持 PostgreSQL 字典源的副本优先级。映射中数字越大，优先级越低。最高优先级为 `0`。

## 示例 {#examples}

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

使用普通参数从 ClickHouse 中选择数据：

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

使用非默认架构：

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

## 相关 {#related}

- [PostgreSQL 表引擎](../../engines/table-engines/integrations/postgresql.md)
- [使用 PostgreSQL 作为字典源](/sql-reference/dictionaries#postgresql)

### 使用 PeerDB 复制或迁移 Postgres 数据 {#replicating-or-migrating-postgres-data-with-with-peerdb}

> 除了表函数，您还可以始终使用 [PeerDB](https://docs.peerdb.io/introduction) 来从 Postgres 到 ClickHouse 设置持续的数据管道。PeerDB 是一个专门设计用于通过变更数据捕获 (CDC) 将数据从 Postgres 复制到 ClickHouse 的工具。
