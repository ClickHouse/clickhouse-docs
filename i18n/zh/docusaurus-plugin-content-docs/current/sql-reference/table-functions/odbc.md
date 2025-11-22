---
description: '返回通过 ODBC 连接的表。'
sidebar_label: 'odbc'
sidebar_position: 150
slug: /sql-reference/table-functions/odbc
title: 'odbc'
doc_type: 'reference'
---



# odbc 表函数

返回一个通过 [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity) 连接的数据表。



## 语法 {#syntax}

```sql
odbc(datasource, external_database, external_table)
odbc(datasource, external_table)
odbc(named_collection)
```


## 参数 {#arguments}

| 参数                | 描述                                                                  |
| ------------------- | -------------------------------------------------------------------- |
| `datasource`        | `odbc.ini` 文件中连接设置所在的节名称。                                |
| `external_database` | 外部 DBMS 中的数据库名称。                                             |
| `external_table`    | `external_database` 中的表名称。                                       |

这些参数也可以通过[命名集合](operations/named-collections.md)传递。

为了安全地实现 ODBC 连接,ClickHouse 使用独立程序 `clickhouse-odbc-bridge`。如果 ODBC 驱动程序直接从 `clickhouse-server` 加载,驱动程序问题可能导致 ClickHouse 服务器崩溃。ClickHouse 会在需要时自动启动 `clickhouse-odbc-bridge`。ODBC 桥接程序与 `clickhouse-server` 安装在同一软件包中。

外部表中值为 `NULL` 的字段将被转换为基础数据类型的默认值。例如,如果远程 MySQL 表字段的类型为 `INT NULL`,则会被转换为 0(ClickHouse `Int32` 数据类型的默认值)。


## 使用示例 {#usage-example}

**通过 ODBC 从本地 MySQL 获取数据**

此示例已在 Ubuntu Linux 18.04 和 MySQL server 5.7 上验证。

确保已安装 unixODBC 和 MySQL Connector。

默认情况下(如果从软件包安装),ClickHouse 以 `clickhouse` 用户身份启动。因此您需要在 MySQL 服务器中创建并配置此用户。

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'clickhouse' WITH GRANT OPTION;
```

然后在 `/etc/odbc.ini` 中配置连接。

```bash
$ cat /etc/odbc.ini
[mysqlconn]
DRIVER = /usr/local/lib/libmyodbc5w.so
SERVER = 127.0.0.1
PORT = 3306
DATABASE = test
USERNAME = clickhouse
PASSWORD = clickhouse
```

您可以使用 unixODBC 安装中的 `isql` 工具检查连接。

```bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

MySQL 中的表:

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

在 ClickHouse 中从 MySQL 表检索数据:

```sql
SELECT * FROM odbc('DSN=mysqlconn', 'test', 'test')
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─float_nullable─┐
│      1 │            0 │     2 │              0 │
└────────┴──────────────┴───────┴────────────────┘
```


## 相关内容 {#see-also}

- [ODBC 字典](/sql-reference/dictionaries#dbms)
- [ODBC 表引擎](/engines/table-engines/integrations/odbc)。
