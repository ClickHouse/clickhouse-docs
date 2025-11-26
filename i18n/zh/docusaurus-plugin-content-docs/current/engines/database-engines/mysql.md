---
description: '允许连接到远程 MySQL 服务器上的数据库，并执行
  `INSERT` 和 `SELECT` 查询，用于在 ClickHouse 与 MySQL 之间交换数据。'
sidebar_label: 'MySQL'
sidebar_position: 50
slug: /engines/database-engines/mysql
title: 'MySQL'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MySQL 数据库引擎

<CloudNotSupportedBadge />

用于连接远程 MySQL 服务器上的数据库，并执行 `INSERT` 和 `SELECT` 查询，在 ClickHouse 和 MySQL 之间交换数据。

`MySQL` 数据库引擎会将查询转换后发送到 MySQL 服务器，因此可以执行诸如 `SHOW TABLES` 或 `SHOW CREATE TABLE` 等操作。

无法执行以下查询：

- `RENAME`
- `CREATE TABLE`
- `ALTER`



## 创建数据库

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MySQL('host:port', ['database' | database], 'user', 'password')
```

**引擎参数**

* `host:port` — MySQL 服务器地址。
* `database` — 远程数据库名称。
* `user` — MySQL 用户。
* `password` — 用户密码。


## 数据类型支持 {#data_types-support}

| MySQL                            | ClickHouse                                                   |
|----------------------------------|--------------------------------------------------------------|
| UNSIGNED TINYINT                 | [UInt8](../../sql-reference/data-types/int-uint.md)          |
| TINYINT                          | [Int8](../../sql-reference/data-types/int-uint.md)           |
| UNSIGNED SMALLINT                | [UInt16](../../sql-reference/data-types/int-uint.md)         |
| SMALLINT                         | [Int16](../../sql-reference/data-types/int-uint.md)          |
| UNSIGNED INT, UNSIGNED MEDIUMINT | [UInt32](../../sql-reference/data-types/int-uint.md)         |
| INT, MEDIUMINT                   | [Int32](../../sql-reference/data-types/int-uint.md)          |
| UNSIGNED BIGINT                  | [UInt64](../../sql-reference/data-types/int-uint.md)         |
| BIGINT                           | [Int64](../../sql-reference/data-types/int-uint.md)          |
| FLOAT                            | [Float32](../../sql-reference/data-types/float.md)           |
| DOUBLE                           | [Float64](../../sql-reference/data-types/float.md)           |
| DATE                             | [Date](../../sql-reference/data-types/date.md)               |
| DATETIME, TIMESTAMP              | [DateTime](../../sql-reference/data-types/datetime.md)       |
| BINARY                           | [FixedString](../../sql-reference/data-types/fixedstring.md) |

所有其他 MySQL 数据类型都转换为 [String](../../sql-reference/data-types/string.md)。

支持 [Nullable](../../sql-reference/data-types/nullable.md)。



## 全局变量支持

为提高兼容性，可以使用 MySQL 风格来引用全局变量，即 `@@identifier`。

当前支持以下变量：

* `version`
* `max_allowed_packet`

:::note
目前这些变量只是占位符，并未实际对应到任何内容。
:::

示例：

```sql
SELECT @@version;
```


## 使用示例

在 MySQL 中的表：

```text
mysql> USE test;
数据库已更改

mysql> CREATE TABLE `mysql_table` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `float` FLOAT NOT NULL,
    ->   PRIMARY KEY (`int_id`));
查询成功，影响了 0 行 (0,09 秒)

mysql> insert into mysql_table (`int_id`, `float`) VALUES (1,2);
查询成功，影响了 1 行 (0,00 秒)

mysql> select * from mysql_table;
+------+-----+
| int_id | value |
+------+-----+
|      1 |     2 |
+------+-----+
结果集中有 1 行 (0,00 秒)
```

位于 ClickHouse 中、与 MySQL 服务器进行数据交换的数据库：

```sql
CREATE DATABASE mysql_db ENGINE = MySQL('localhost:3306', 'test', 'my_user', 'user_password') SETTINGS read_write_timeout=10000, connect_timeout=100;
```

```sql
SHOW DATABASES
```

```text
┌─name─────┐
│ default  │
│ mysql_db │
│ system   │
└──────────┘
```

```sql
SHOW TABLES FROM mysql_db
```

```text
┌─name─────────┐
│  mysql_table │
└──────────────┘
```

```sql
SELECT * FROM mysql_db.mysql_table
```

```text
┌─int_id─┬─value─┐
│      1 │     2 │
└────────┴───────┘
```

```sql
INSERT INTO mysql_db.mysql_table VALUES (3,4)
```

```sql
SELECT * FROM mysql_db.mysql_table
```

```text
┌─int_id─┬─value─┐
│      1 │     2 │
│      3 │     4 │
└────────┴───────┘
```
