---
slug: /engines/table-engines/integrations/mysql
sidebar_position: 138
sidebar_label: MySQL
title: "MySQL引擎允许您对存储在远程MySQL服务器上的数据执行`SELECT`和`INSERT`查询。"
---


# MySQL表引擎

MySQL引擎允许您对存储在远程MySQL服务器上的数据执行`SELECT`和`INSERT`查询。

## 创建表 {#creating-a-table}

``` sql
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

有关[CREATE TABLE](https://clickhouse.com/sql-reference/statements/create/table)查询的详细描述，请参见。

表结构可以与原始MySQL表结构不同：

- 列名应该与原始MySQL表中的相同，但您可以只使用其中的一些列并且顺序可以任意。
- 列类型可能与原始MySQL表中的不同。ClickHouse努力将值[强制转换](../../../engines/database-engines/mysql.md#data_types-support)为ClickHouse数据类型。
- [external_table_functions_use_nulls](https://clickhouse.com/operations/settings/settings#external_table_functions_use_nulls)设置定义如何处理Nullable列。默认值：1。如果为0，表函数不会生成Nullable列，而是插入默认值而不是null。这也适用于数组中的NULL值。

:::note
MySQL表引擎目前在MacOS的ClickHouse构建中不可用（[issue](https://github.com/ClickHouse/ClickHouse/issues/21191)）
:::

**引擎参数**

- `host:port` — MySQL服务器地址。
- `database` — 远程数据库名称。
- `table` — 远程表名称。
- `user` — MySQL用户。
- `password` — 用户密码。
- `replace_query` — 将`INSERT INTO`查询转换为`REPLACE INTO`的标志。如果`replace_query=1`，则替换该查询。
- `on_duplicate_clause` — 被添加到`INSERT`查询中的`ON DUPLICATE KEY on_duplicate_clause`表达式。
    示例：`INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1`，其中`on_duplicate_clause`为`UPDATE c2 = c2 + 1`。请参见[MySQL文档](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html)，以了解您可以与`ON DUPLICATE KEY`子句结合使用的`on_duplicate_clause`。
    要指定`on_duplicate_clause`，您需要将`0`传递给`replace_query`参数。如果同时传递`replace_query = 1`和`on_duplicate_clause`，ClickHouse将生成异常。

参数也可以使用[命名集合](https://clickhouse.com/operations/named-collections.md)传递。在这种情况下，`host`和`port`应分别指定。该方法建议用于生产环境。

简单的`WHERE`子句，如`=, !=, >, >=, <, <=`在MySQL服务器上执行。

其余条件和`LIMIT`采样约束在查询到MySQL完成后仅在ClickHouse中执行。

支持多个副本，必须用`|`列出。例如：

```sql
CREATE TABLE test_replicas (id UInt32, name String, age UInt32, money UInt32) ENGINE = MySQL(`mysql{2|3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

## 使用示例 {#usage-example}

在MySQL中创建表：

``` text
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

在ClickHouse中使用纯参数创建表：

``` sql
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL('localhost:3306', 'test', 'test', 'bayonet', '123')
```

或使用[命名集合](https://clickhouse.com/operations/named-collections.md)：

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

从MySQL表中检索数据：

``` sql
SELECT * FROM mysql_table
```

``` text
┌─float_nullable─┬─int_id─┐
│           ᴺᵁᴸᴸ │      1 │
└────────────────┴────────┘
```

## 设置 {#mysql-settings}

默认设置效率不高，因为它们甚至不重用连接。这些设置可以让您增加服务器每秒执行的查询数量。

### connection_auto_close {#connection-auto-close}

允许在查询执行后自动关闭连接，即禁用连接重用。

可能的值：

- 1 — 允许自动关闭连接，因此禁用了连接重用
- 0 — 不允许自动关闭连接，因此启用了连接重用

默认值：`1`。

### connection_max_tries {#connection-max-tries}

设置故障转移池的重试次数。

可能的值：

- 正整数。
- 0 — 对于故障转移池没有重试。

默认值：`3`。

### connection_pool_size {#connection-pool-size}

连接池大小（如果所有连接都在使用中，则查询将等待直到某些连接被释放）。

可能的值：

- 正整数。

默认值：`16`。

### connection_wait_timeout {#connection-wait-timeout}

等待可用连接的超时（以秒为单位）（如果有`connection_pool_size`个活动连接），0 - 不等待。

可能的值：

- 正整数。

默认值：`5`。

### connect_timeout {#connect-timeout}

连接超时（以秒为单位）。

可能的值：

- 正整数。

默认值：`10`。

### read_write_timeout {#read-write-timeout}

读/写超时（以秒为单位）。

可能的值：

- 正整数。

默认值：`300`。

## 参见 {#see-also}

- [MySQL表函数](../../../sql-reference/table-functions/mysql.md)
- [将MySQL作为字典源使用](https://clickhouse.com/sql-reference/dictionaries#mysql)
