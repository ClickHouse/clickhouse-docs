---
'description': '允许 ClickHouse 通过 ODBC 连接到外部数据库。'
'sidebar_label': 'ODBC'
'sidebar_position': 150
'slug': '/engines/table-engines/integrations/odbc'
'title': 'ODBC'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ODBC

<CloudNotSupportedBadge/>

允许 ClickHouse 通过 [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity) 连接到外部数据库。

为了安全地实现 ODBC 连接，ClickHouse 使用一个单独的程序 `clickhouse-odbc-bridge`。如果 ODBC 驱动程序是直接从 `clickhouse-server` 加载的，驱动程序问题可能会导致 ClickHouse 服务器崩溃。ClickHouse 会在需要时自动启动 `clickhouse-odbc-bridge`。ODBC 桥接程序与 `clickhouse-server` 在同一个软件包中安装。

此引擎支持 [Nullable](../../../sql-reference/data-types/nullable.md) 数据类型。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
)
ENGINE = ODBC(connection_settings, external_database, external_table)
```

查看 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细描述。

表结构可以与源表结构不同：

- 列名应与源表中的列名相同，但您可以仅使用这些列中的一部分，并且可以按任何顺序排列。
- 列类型可以与源表中的类型不同。ClickHouse 会尝试将值 [cast](/sql-reference/functions/type-conversion-functions#cast) 为 ClickHouse 数据类型。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 设置定义了如何处理 Nullable 列。默认值：1。如果为 0，表函数不创建 Nullable 列，而是插入默认值而不是 null。这同样适用于数组中的 NULL 值。

**引擎参数**

- `connection_settings` — `odbc.ini` 文件中连接设置的节名称。
- `external_database` — 外部 DBMS 中的数据库名称。
- `external_table` — `external_database` 中的表名称。

## 使用示例 {#usage-example}

**通过 ODBC 从本地 MySQL 安装中检索数据**

此示例已在 Ubuntu Linux 18.04 和 MySQL 服务器 5.7 中检查。

确保已安装 unixODBC 和 MySQL Connector。

默认情况下（如果是通过软件包安装），ClickHouse 作为用户 `clickhouse` 启动。因此，您需要在 MySQL 服务器中创建并配置此用户。

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'localhost' WITH GRANT OPTION;
```

然后在 `/etc/odbc.ini` 中配置连接。

```bash
$ cat /etc/odbc.ini
[mysqlconn]
DRIVER = /usr/local/lib/libmyodbc5w.so
SERVER = 127.0.0.1
PORT = 3306
DATABASE = test
USER = clickhouse
PASSWORD = clickhouse
```

您可以使用 unixODBC 安装中的 `isql` 实用程序检查连接。

```bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

MySQL 中的表：

```text
mysql> CREATE DATABASE test;
Query OK, 1 row affected (0,01 sec)

mysql> CREATE TABLE `test`.`test` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `int_nullable` INT NULL DEFAULT NULL,
    ->   `float` FLOAT NOT NULL,
    ->   `float_nullable` FLOAT NULL DEFAULT NULL,
    ->   PRIMARY KEY (`int_id`));
Query OK, 0 rows affected (0,09 sec)

mysql> insert into test.test (`int_id`, `float`) VALUES (1,2);
Query OK, 1 row affected (0,00 sec)

mysql> select * from test.test;
+------+----------+-----+----------+
| int_id | int_nullable | float | float_nullable |
+------+----------+-----+----------+
|      1 |         NULL |     2 |           NULL |
+------+----------+-----+----------+
1 row in set (0,00 sec)
```

ClickHouse 中的表，从 MySQL 表中检索数据：

```sql
CREATE TABLE odbc_t
(
    `int_id` Int32,
    `float_nullable` Nullable(Float32)
)
ENGINE = ODBC('DSN=mysqlconn', 'test', 'test')
```

```sql
SELECT * FROM odbc_t
```

```text
┌─int_id─┬─float_nullable─┐
│      1 │           ᴺᵁᴸᴸ │
└────────┴────────────────┘
```

## 另见 {#see-also}

- [ODBC 字典](/sql-reference/dictionaries#mysql)
- [ODBC 表函数](../../../sql-reference/table-functions/odbc.md)
