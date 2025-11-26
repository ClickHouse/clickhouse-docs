---
description: '允许对存储在远程 MySQL 服务器中的数据执行 `SELECT` 和 `INSERT` 查询。'
sidebar_label: 'mysql'
sidebar_position: 137
slug: /sql-reference/table-functions/mysql
title: 'mysql'
doc_type: 'reference'
---



# MySQL 表函数

允许对存储在远程 MySQL 服务器中的数据执行 `SELECT` 和 `INSERT` 查询。



## 语法

```sql
mysql({host:port, database, table, user, password[, replace_query, on_duplicate_clause] | named_collection[, option=value [,..]]})
```


## 参数

| Argument              | Description                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host:port`           | MySQL 服务器地址。                                                                                                                                                                                                                                                                                                                                                                           |
| `database`            | 远程数据库名称。                                                                                                                                                                                                                                                                                                                                                                               |
| `table`               | 远程表名称。                                                                                                                                                                                                                                                                                                                                                                                 |
| `user`                | MySQL 用户。                                                                                                                                                                                                                                                                                                                                                                              |
| `password`            | 用户密码。                                                                                                                                                                                                                                                                                                                                                                                  |
| `replace_query`       | 将 `INSERT INTO` 查询转换为 `REPLACE INTO` 的开关参数。可选值：<br />    - `0` - 按 `INSERT INTO` 执行查询。<br />    - `1` - 按 `REPLACE INTO` 执行查询。                                                                                                                                                                                                                                                         |
| `on_duplicate_clause` | 添加到 `INSERT` 查询中的 `ON DUPLICATE KEY on_duplicate_clause` 表达式。仅可在 `replace_query = 0` 时指定（如果同时传入 `replace_query = 1` 和 `on_duplicate_clause`，ClickHouse 会抛出异常）。<br />    示例：`INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1;`<br />    此处的 `on_duplicate_clause` 为 `UPDATE c2 = c2 + 1`。请参阅 MySQL 文档，了解在 `ON DUPLICATE KEY` 子句中可以使用哪些 `on_duplicate_clause`。 |

参数也可以通过[命名集合](operations/named-collections.md)传递。在这种情况下，`host` 和 `port` 需要分别单独指定。建议在生产环境中使用这种方式。

简单的 `WHERE` 子句（如 `=, !=, >, >=, <, <=`）目前在 MySQL 服务器上执行。

其余条件以及 `LIMIT` 采样约束仅在对 MySQL 的查询完成后才会在 ClickHouse 中执行。

支持多个副本，通过 `|` 分隔列出。例如：

```sql
SELECT name FROM mysql(`mysql{1|2|3}:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```

或

```sql
SELECT name FROM mysql(`mysql1:3306|mysql2:3306|mysql3:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```


## 返回值 {#returned_value}

一个表对象，其列与原始 MySQL 表相同。

:::note
某些 MySQL 数据类型可以映射到不同的 ClickHouse 类型 —— 这可以通过查询级别的设置 [mysql_datatypes_support_level](operations/settings/settings.md#mysql_datatypes_support_level) 来处理。
:::

:::note
在 `INSERT` 查询中，为了区分表函数 `mysql(...)` 与带列名列表的表名，必须使用关键字 `FUNCTION` 或 `TABLE FUNCTION`。见下方示例。
:::



## 示例

MySQL 中的表：

```text
mysql> CREATE TABLE `test`.`test` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `float` FLOAT NOT NULL,
    ->   PRIMARY KEY (`int_id`));

mysql> INSERT INTO test (`int_id`, `float`) VALUES (1,2);

mysql> SELECT * FROM test;
+--------+-------+
| int_id | float |
+--------+-------+
|      1 |     2 |
+--------+-------+
```

从 ClickHouse 中查询数据：

```sql
SELECT * FROM mysql('localhost:3306', 'test', 'test', 'bayonet', '123');
```

或者使用[命名集合](operations/named-collections.md)：

```sql
CREATE NAMED COLLECTION creds AS
        host = 'localhost',
        port = 3306,
        database = 'test',
        user = 'bayonet',
        password = '123';
SELECT * FROM mysql(creds, table='test');
```

```text
┌─int_id─┬─float─┐
│      1 │     2 │
└────────┴───────┘
```

替换与插入：

```sql
INSERT INTO FUNCTION mysql('localhost:3306', 'test', 'test', 'bayonet', '123', 1) (int_id, float) VALUES (1, 3);
INSERT INTO TABLE FUNCTION mysql('localhost:3306', 'test', 'test', 'bayonet', '123', 0, 'UPDATE int_id = int_id + 1') (int_id, float) VALUES (1, 4);
SELECT * FROM mysql('localhost:3306', 'test', 'test', 'bayonet', '123');
```

```text
┌─int_id─┬─float─┐
│      1 │     3 │
│      2 │     4 │
└────────┴───────┘
```

从 MySQL 表复制数据到 ClickHouse 表：

```sql
CREATE TABLE mysql_copy
(
   `id` UInt64,
   `datetime` DateTime('UTC'),
   `description` String,
)
ENGINE = MergeTree
ORDER BY (id,datetime);

INSERT INTO mysql_copy
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');
```

或者，如果仅根据当前最大 id 从 MySQL 复制一批增量数据：

```sql
INSERT INTO mysql_copy
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password')
WHERE id > (SELECT max(id) FROM mysql_copy);
```


## 相关内容 {#related}

- [`MySQL` 表引擎](../../engines/table-engines/integrations/mysql.md)
- [将 MySQL 用作字典源](/sql-reference/dictionaries#mysql)
- [mysql_datatypes_support_level](operations/settings/settings.md#mysql_datatypes_support_level)
- [mysql_map_fixed_string_to_text_in_show_columns](operations/settings/settings.md#mysql_map_fixed_string_to_text_in_show_columns)
- [mysql_map_string_to_text_in_show_columns](operations/settings/settings.md#mysql_map_string_to_text_in_show_columns)
- [mysql_max_rows_to_insert](operations/settings/settings.md#mysql_max_rows_to_insert)
