---
sidebar_position: 1
sidebar_label: '创建表'
title: '在 ClickHouse 中创建表'
slug: /guides/creating-tables
description: '学习在 ClickHouse 中创建表'
keywords: ['创建表', 'CREATE TABLE', '表创建', '数据库指南', 'MergeTree 引擎']
doc_type: 'guide'
---

# 在 ClickHouse 中创建表 \\{#creating-tables-in-clickhouse\\}

与大多数数据库一样，ClickHouse 会将表按逻辑分组到**数据库**中。使用 `CREATE DATABASE` 命令在 ClickHouse 中创建一个新数据库：

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

同样地，使用 `CREATE TABLE` 来定义一张新表。如果未指定数据库名称，则会在
`default` 数据库中创建该表。

下面名为 `my_first_table` 的表创建在 `helloworld` 数据库中：

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

* `user_id`：32 位无符号整数
* `message`：`String` 数据类型，用于替代其他数据库系统中的 `VARCHAR`、`BLOB`、`CLOB` 等类型
* `timestamp`：`DateTime` 值，表示某一时间点
* `metric`：32 位浮点数

:::note
表引擎决定：

* 数据如何存储以及存储在何处
* 支持哪些查询
* 数据是否进行复制

可以选择的引擎有很多，但对于单节点 ClickHouse 服务器上的简单表，[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 通常是首选。
:::

## 主键简介 \\{#a-brief-intro-to-primary-keys\\}

在继续之前，理解 ClickHouse 中主键的工作方式非常重要（主键的实现方式可能会出乎意料！）：

- 在 ClickHouse 中，表中每一行的主键**_不要求唯一_**

ClickHouse 表的主键决定数据在写入磁盘时的排序方式。每 8,192 行或 10MB 的数据（称为**索引粒度**）会在主键索引文件中创建一条条目。这个粒度概念形成了一个**稀疏索引**，可以轻松放入内存中，而每个粒度表示在执行 `SELECT` 查询时需要处理的最小列数据带。

可以使用 `PRIMARY KEY` 参数来定义主键。如果在定义表时没有显式指定 `PRIMARY KEY`，那么主键将是 `ORDER BY` 子句中指定的元组。如果同时指定了 `PRIMARY KEY` 和 `ORDER BY`，则主键必须是排序键的前缀。

主键同时也是排序键，在此示例中是一个 `(user_id, timestamp)` 元组。因此，每个列文件中存储的数据都会先按 `user_id` 排序，然后按 `timestamp` 排序。

:::tip
如需了解更多细节，请查看 ClickHouse Academy 中的 [Modeling Data 培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)。
:::
