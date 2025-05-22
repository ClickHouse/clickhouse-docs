
# mysql 表函数

允许对存储在远程 MySQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。

## 语法 {#syntax}

```sql
mysql({host:port, database, table, user, password[, replace_query, on_duplicate_clause] | named_collection[, option=value [,..]]})
```

## 参数 {#arguments}

| 参数                 | 描述                                                                                                                                                                                                                                                            |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host:port`          | MySQL 服务器地址。                                                                                                                                                                                                                                              |
| `database`           | 远程数据库名称。                                                                                                                                                                                                                                                  |
| `table`              | 远程表名称。                                                                                                                                                                                                                                                     |
| `user`               | MySQL 用户。                                                                                                                                                                                                                                                      |
| `password`           | 用户密码。                                                                                                                                                                                                                                                       |
| `replace_query`      | 将 `INSERT INTO` 查询转换为 `REPLACE INTO` 的标志。可能的值：<br/>    - `0` - 查询作为 `INSERT INTO` 执行。<br/>    - `1` - 查询作为 `REPLACE INTO` 执行。                                                                                                         |
| `on_duplicate_clause` | 添加到 `INSERT` 查询中的 `ON DUPLICATE KEY on_duplicate_clause` 表达式。仅在 `replace_query = 0` 时可以指定（如果同时传递 `replace_query = 1` 和 `on_duplicate_clause`，ClickHouse 会生成异常）。<br/>    示例：`INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1;`<br/>    `on_duplicate_clause` 这里是 `UPDATE c2 = c2 + 1`。请参阅 MySQL 文档以查找可以与 `ON DUPLICATE KEY` 子句一起使用的 `on_duplicate_clause`。 |

参数也可以使用 [命名集合](operations/named-collections.md) 传递。在这种情况下，`host` 和 `port` 应该分开指定。此方法推荐用于生产环境。

简单的 `WHERE` 子句如 `=, !=, >, >=, <, <=` 目前在 MySQL 服务器上执行。

其余条件和 `LIMIT` 采样约束仅在 MySQL 查询完成后在 ClickHouse 中执行。

支持多个副本，必须通过 `|` 列出。例如：

```sql
SELECT name FROM mysql(`mysql{1|2|3}:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```

或

```sql
SELECT name FROM mysql(`mysql1:3306|mysql2:3306|mysql3:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```

## 返回值 {#returned_value}

具有与原始 MySQL 表相同列的表对象。

:::note
一些 MySQL 数据类型可以映射到不同的 ClickHouse 类型 - 这是通过查询级别设置 [mysql_datatypes_support_level](operations/settings/settings.md#mysql_datatypes_support_level) 解决的。
:::

:::note
在 `INSERT` 查询中，为了区分表函数 `mysql(...)` 与带有列名列表的表名，必须使用关键字 `FUNCTION` 或 `TABLE FUNCTION`。请参阅以下示例。
:::

## 示例 {#examples}

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

从 ClickHouse 选择数据：

```sql
SELECT * FROM mysql('localhost:3306', 'test', 'test', 'bayonet', '123');
```

或使用 [命名集合](operations/named-collections.md)：

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

替换并插入：

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

或者，如果仅基于最大当前 ID 从 MySQL 复制增量批次：

```sql
INSERT INTO mysql_copy
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password')
WHERE id > (SELECT max(id) from mysql_copy);
```

## 相关 {#related}

- [‘MySQL’ 表引擎](../../engines/table-engines/integrations/mysql.md)
- [使用 MySQL 作为字典源](/sql-reference/dictionaries#mysql)
- [mysql_datatypes_support_level](operations/settings/settings.md#mysql_datatypes_support_level)
- [mysql_map_fixed_string_to_text_in_show_columns](operations/settings/settings.md#mysql_map_fixed_string_to_text_in_show_columns)
- [mysql_map_string_to_text_in_show_columns](operations/settings/settings.md#mysql_map_string_to_text_in_show_columns)
- [mysql_max_rows_to_insert](operations/settings/settings.md#mysql_max_rows_to_insert)
