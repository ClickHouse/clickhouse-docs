---
sidebar_position: 1
sidebar_label: '创建表'
title: '在 ClickHouse 中创建表'
slug: /guides/creating-tables
description: '了解如何在 ClickHouse 中创建表'
keywords: ['creating tables', 'CREATE TABLE', 'table creation', 'database guide', 'MergeTree engine']
doc_type: 'guide'
---



# 在 ClickHouse 中创建表

与大多数数据库一样，ClickHouse 会将表在逻辑上组织到**数据库**中。使用 `CREATE DATABASE` 命令在 ClickHouse 中创建一个新数据库：

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

类似地，使用 `CREATE TABLE` 来定义一个新表。如果未指定数据库名称，表将会创建在
`default` 数据库中。

下面这个名为 `my_first_table` 的表是在 `helloworld` 数据库中创建的：

```sql
CREATE TABLE helloworld.my_first_table
(
    user_id UInt32,
    message String,
    timestamp DateTime,
    metric Float32
)
ENGINE = MergeTree()
PRIMARY KEY (user_id, timestamp)
```

在上面的示例中，`my_first_table` 是一个包含四列的 `MergeTree` 表：

* `user_id`：一个 32 位无符号整数
* `message`：`String` 数据类型，用于替代其他数据库系统中的 `VARCHAR`、`BLOB`、`CLOB` 等类型
* `timestamp`：一个 `DateTime` 值，表示某一时间点
* `metric`：一个 32 位浮点数

:::note
表引擎决定：

* 数据如何以及存储在何处
* 支持哪些查询
* 数据是否进行复制

有许多引擎可供选择，但对于单节点 ClickHouse 服务器上的简单表，[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 很可能是你的首选。
:::


## 主键简介 {#a-brief-intro-to-primary-keys}

在继续之前,了解主键在 ClickHouse 中的工作原理非常重要(主键的实现方式可能出乎意料!):

- ClickHouse 中的主键对表中的每一行**_并不具有唯一性_**

ClickHouse 表的主键决定了数据写入磁盘时的排序方式。每 8,192 行或 10MB 的数据(称为**索引粒度**)会在主键索引文件中创建一个条目。这种粒度概念创建了一个可以轻松放入内存的**稀疏索引**,而这些粒度单元代表了在 `SELECT` 查询期间处理的最小列数据条带。

主键可以使用 `PRIMARY KEY` 参数定义。如果定义表时未指定 `PRIMARY KEY`,则主键将变为 `ORDER BY` 子句中指定的元组。如果同时指定了 `PRIMARY KEY` 和 `ORDER BY`,则主键必须是排序顺序的前缀。

主键也是排序键,它是一个 `(user_id, timestamp)` 元组。因此,存储在每个列文件中的数据将首先按 `user_id` 排序,然后按 `timestamp` 排序。

:::tip
有关更多详细信息,请查看 ClickHouse Academy 中的[数据建模培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)。
:::
