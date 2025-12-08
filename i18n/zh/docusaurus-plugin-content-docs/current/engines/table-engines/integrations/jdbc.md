---
description: '允许 ClickHouse 通过 JDBC 连接到外部数据库。'
sidebar_label: 'JDBC'
sidebar_position: 100
slug: /engines/table-engines/integrations/jdbc
title: 'JDBC 表引擎'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# JDBC 表引擎 {#jdbc-table-engine}

<CloudNotSupportedBadge/>

:::note
clickhouse-jdbc-bridge 包含实验性代码，且已不再受支持。它可能存在可靠性问题和安全漏洞，请自行承担使用风险。  
ClickHouse 推荐使用 ClickHouse 内置的表函数，作为临时（即席）查询场景（Postgres、MySQL、MongoDB 等）的更佳替代方案。
:::

允许 ClickHouse 通过 [JDBC](https://en.wikipedia.org/wiki/Java_Database_Connectivity) 连接到外部数据库。

为实现 JDBC 连接，ClickHouse 使用一个独立程序 [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge)，该程序应作为守护进程运行。

该引擎支持 [Nullable](../../../sql-reference/data-types/nullable.md) 数据类型。

## 创建数据表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    列列表...
)
ENGINE = JDBC(数据源名称, 外部数据库, 外部表)
```

**引擎参数**

* `datasource` — 外部 DBMS 的 URI 或名称。

  URI 格式：`jdbc:<driver_name>://<host_name>:<port>/?user=<username>&password=<password>`。
  MySQL 示例：`jdbc:mysql://localhost:3306/?user=root&password=root`。

* `external_database` — 外部 DBMS 中的数据库名称，或一个显式定义的表结构（参见示例）。

* `external_table` — 外部数据库中表的名称，或者形如 `select * from table1 where column1=1` 的查询语句。

* 这些参数也可以通过 [命名集合](operations/named-collections.md) 传递。

## 使用示例 {#usage-example}

使用 MySQL 的控制台客户端直接连接到服务器来创建一张表：

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

在 ClickHouse 服务器上创建表并查询其中的数据：

```sql
CREATE TABLE jdbc_table
(
    `int_id` Int32,
    `int_nullable` Nullable(Int32),
    `float` Float32,
    `float_nullable` Nullable(Float32)
)
ENGINE JDBC('jdbc:mysql://localhost:3306/?user=root&password=root', 'test', 'test')
```

```sql
SELECT *
FROM jdbc_table
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴────────────────┘
```

```sql
INSERT INTO jdbc_table(`int_id`, `float`)
SELECT toInt32(number), toFloat32(number * 1.0)
FROM system.numbers
```

## 另请参阅 {#see-also}

- [JDBC 表函数](../../../sql-reference/table-functions/jdbc.md)。
