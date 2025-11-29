---
description: '用于连接远程 PostgreSQL 服务器上的数据库。'
sidebar_label: 'PostgreSQL'
sidebar_position: 40
slug: /engines/database-engines/postgresql
title: 'PostgreSQL'
doc_type: 'guide'
---



# PostgreSQL {#postgresql}

允许连接到远程 [PostgreSQL](https://www.postgresql.org) 服务器上的数据库。支持读写操作（`SELECT` 和 `INSERT` 查询），用于在 ClickHouse 和 PostgreSQL 之间交换数据。

通过 `SHOW TABLES` 和 `DESCRIBE TABLE` 查询，可以实时访问远程 PostgreSQL 的表列表和表结构。

支持表结构修改（`ALTER TABLE ... ADD|DROP COLUMN`）。如果将 `use_table_cache` 参数（参见下文的引擎参数）设置为 `1`，则表结构会被缓存且不会检查是否发生了修改，但可以通过 `DETACH` 和 `ATTACH` 查询进行更新。



## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE test_database
ENGINE = PostgreSQL('host:port', 'database', 'user', 'password'[, `schema`, `use_table_cache`]);
```

**引擎参数**

* `host:port` — PostgreSQL 服务器地址。
* `database` — 远程数据库名称。
* `user` — PostgreSQL 用户。
* `password` — 用户密码。
* `schema` — PostgreSQL 模式（schema）。
* `use_table_cache` — 定义是否对数据库表结构启用缓存。可选。默认值：`0`。


## 支持的数据类型 {#data_types-support}

| PostgreSQL       | ClickHouse                                                   |
|------------------|--------------------------------------------------------------|
| DATE             | [Date](../../sql-reference/data-types/date.md)               |
| TIMESTAMP        | [DateTime](../../sql-reference/data-types/datetime.md)       |
| REAL             | [Float32](../../sql-reference/data-types/float.md)           |
| DOUBLE           | [Float64](../../sql-reference/data-types/float.md)           |
| DECIMAL, NUMERIC | [Decimal](../../sql-reference/data-types/decimal.md)         |
| SMALLINT         | [Int16](../../sql-reference/data-types/int-uint.md)          |
| INTEGER          | [Int32](../../sql-reference/data-types/int-uint.md)          |
| BIGINT           | [Int64](../../sql-reference/data-types/int-uint.md)          |
| SERIAL           | [UInt32](../../sql-reference/data-types/int-uint.md)         |
| BIGSERIAL        | [UInt64](../../sql-reference/data-types/int-uint.md)         |
| TEXT, CHAR       | [String](../../sql-reference/data-types/string.md)           |
| INTEGER          | Nullable([Int32](../../sql-reference/data-types/int-uint.md))|
| ARRAY            | [Array](../../sql-reference/data-types/array.md)             |



## 使用示例 {#examples-of-use}

与 PostgreSQL 服务器进行数据交换的 ClickHouse 数据库：

```sql
CREATE DATABASE test_database
ENGINE = PostgreSQL('postgres1:5432', 'test_database', 'postgres', 'mysecretpassword', 'schema_name',1);
```

```sql
SHOW DATABASES;
```

```text
┌─name──────────┐
│ default       │
│ test_database │
│ system        │
└───────────────┘
```

```sql
SHOW TABLES FROM test_database;
```

```text
┌─name───────┐
│ test_table │
└────────────┘
```

从 PostgreSQL 表读取数据：

```sql
SELECT * FROM test_database.test_table;
```

```text
┌─id─┬─value─┐
│  1 │     2 │
└────┴───────┘
```

将数据写入 PostgreSQL 表：

```sql
INSERT INTO test_database.test_table VALUES (3,4);
SELECT * FROM test_database.test_table;
```

```text
┌─int_id─┬─value─┐
│      1 │     2 │
│      3 │     4 │
└────────┴───────┘
```

假设已在 PostgreSQL 中修改了表结构：

```sql
postgre> ALTER TABLE test_table ADD COLUMN data Text
```

由于在创建数据库时将 `use_table_cache` 参数设置为 `1`，ClickHouse 中的表结构已被缓存，因此未被修改：

```sql
DESCRIBE TABLE test_database.test_table;
```

```text
┌─name───┬─type──────────────┐
│ id     │ Nullable(Integer) │
│ value  │ Nullable(Integer) │
└────────┴───────────────────┘
```

在将该表分离并重新附加之后，表结构已更新：

```sql
DETACH TABLE test_database.test_table;
ATTACH TABLE test_database.test_table;
DESCRIBE TABLE test_database.test_table;
```

```text
┌─name───┬─type──────────────┐
│ id     │ Nullable(Integer) │
│ value  │ Nullable(Integer) │
│ data   │ Nullable(String)  │
└────────┴───────────────────┘
```


## 相关内容 {#related-content}

- 博客：[ClickHouse 与 PostgreSQL：数据界的天作之合（第 1 篇）](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- 博客：[ClickHouse 与 PostgreSQL：数据界的天作之合（第 2 篇）](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
