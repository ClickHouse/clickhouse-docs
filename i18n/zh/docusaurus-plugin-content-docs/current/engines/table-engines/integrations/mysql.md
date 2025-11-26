---
description: 'MySQL 表引擎文档'
sidebar_label: 'MySQL'
sidebar_position: 138
slug: /engines/table-engines/integrations/mysql
title: 'MySQL 表引擎'
doc_type: 'reference'
---



# MySQL 表引擎

MySQL 引擎允许对存储在远程 MySQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。



## 创建表

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = MySQL({host:port, database, table, user, password[, replace_query, on_duplicate_clause] | named_collection[, option=value [,..]]})
SETTINGS
    [ connection_pool_size=16, ]
    [ connection_max_tries=3, ]
    [ connection_wait_timeout=5, ]
    [ connection_auto_close=true, ]
    [ connect_timeout=10, ]
    [ read_write_timeout=300 ]
;
```

参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细说明。

表结构可以与原始 MySQL 表结构不同：

* 列名应与原始 MySQL 表中的列名相同，但可以只使用其中部分列，且顺序可以任意。
* 列类型可以与原始 MySQL 表中的类型不同。ClickHouse 会尝试将值[转换](../../../engines/database-engines/mysql.md#data_types-support)为 ClickHouse 数据类型。
* [external&#95;table&#95;functions&#95;use&#95;nulls](/operations/settings/settings#external_table_functions_use_nulls) 设置定义如何处理 Nullable 列。默认值：1。若为 0，则表函数不会创建 Nullable 列，而是插入默认值来代替 null。这同样适用于数组内部的 NULL 值。

**引擎参数**

* `host:port` — MySQL 服务器地址。
* `database` — 远程数据库名称。
* `table` — 远程表名称。
* `user` — MySQL 用户。
* `password` — 用户密码。
* `replace_query` — 将 `INSERT INTO` 查询转换为 `REPLACE INTO` 的标志。若 `replace_query=1`，则会替换该查询。
* `on_duplicate_clause` — 添加到 `INSERT` 查询中的 `ON DUPLICATE KEY on_duplicate_clause` 表达式。
  例如：`INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1`，其中 `on_duplicate_clause` 为 `UPDATE c2 = c2 + 1`。参阅 [MySQL 文档](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html) 了解可以与 `ON DUPLICATE KEY` 子句一起使用哪些 `on_duplicate_clause`。
  要指定 `on_duplicate_clause`，需要将 `0` 传递给 `replace_query` 参数。如果同时传递 `replace_query = 1` 和 `on_duplicate_clause`，ClickHouse 会产生异常。

参数也可以通过 [named collections](/operations/named-collections.md) 进行传递。在这种情况下，必须单独指定 `host` 和 `port`。建议在生产环境中采用此方式。

简单的 `WHERE` 子句（如 `=, !=, >, >=, <, <=`）会在 MySQL 服务器上执行。

其余条件以及 `LIMIT` 采样限制仅在对 MySQL 的查询完成后才会在 ClickHouse 中执行。

支持使用 `|` 列出多个副本。例如：

```sql
CREATE TABLE test_replicas (id UInt32, name String, age UInt32, money UInt32) ENGINE = MySQL(`mysql{2|3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```


## 使用示例

在 MySQL 中创建表：

```text
mysql> CREATE TABLE `test`.`test` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `int_nullable` INT NULL DEFAULT NULL,
    ->   `float` FLOAT NOT NULL,
    ->   `float_nullable` FLOAT NULL DEFAULT NULL,
    ->   PRIMARY KEY (`int_id`));
Query OK, 0 rows affected (0,09 sec)

mysql> insert into test (`int_id`, `float`) VALUES (1,2);
Query OK, 1 row affected (0,00 sec)

mysql> select * from test;
+------+----------+-----+----------+
| int_id | int_nullable | float | float_nullable |
+------+----------+-----+----------+
|      1 |         NULL |     2 |           NULL |
+------+----------+-----+----------+
1 row in set (0,00 sec)
```

使用常规参数在 ClickHouse 中创建表：

```sql
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL('localhost:3306', 'test', 'test', 'bayonet', '123')
```

或者使用 [命名集合](/operations/named-collections.md)：

```sql
CREATE NAMED COLLECTION creds AS
        host = 'localhost',
        port = 3306,
        database = 'test',
        user = 'bayonet',
        password = '123';
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL(creds, table='test')
```

从 MySQL 表中获取数据：

```sql
SELECT * FROM mysql_table
```

```text
┌─float_nullable─┬─int_id─┐
│           ᴺᵁᴸᴸ │      1 │
└────────────────┴────────┘
```


## 设置 {#mysql-settings}

默认设置的效率不高，因为它们甚至不会复用连接。可以通过这些设置来提升服务器每秒可执行的查询数量。

### `connection_auto_close` {#connection-auto-close}

允许在查询执行后自动关闭连接，即禁用连接复用。

可能的取值：

- 1 — 允许自动关闭连接，因此禁用连接复用
- 0 — 不允许自动关闭连接，因此启用连接复用

默认值：`1`。

### `connection_max_tries` {#connection-max-tries}

设置带故障转移的连接池的重试次数。

可能的取值：

- 正整数。
- 0 — 带故障转移的连接池不进行重试。

默认值：`3`。

### `connection_pool_size` {#connection-pool-size}

连接池大小（如果所有连接都在使用中，查询将等待，直到有连接被释放）。

可能的取值：

- 正整数。

默认值：`16`。

### `connection_wait_timeout` {#connection-wait-timeout}

等待空闲连接的超时时间（秒）（如果已存在 `connection_pool_size` 个活动连接），0 表示不等待。

可能的取值：

- 正整数。

默认值：`5`。

### `connect_timeout` {#connect-timeout}

连接超时时间（秒）。

可能的取值：

- 正整数。

默认值：`10`。

### `read_write_timeout` {#read-write-timeout}

读/写超时时间（秒）。

可能的取值：

- 正整数。

默认值：`300`。



## 另请参阅 {#see-also}

- [MySQL 表函数](../../../sql-reference/table-functions/mysql.md)
- [将 MySQL 用作字典源](/sql-reference/dictionaries#mysql)
