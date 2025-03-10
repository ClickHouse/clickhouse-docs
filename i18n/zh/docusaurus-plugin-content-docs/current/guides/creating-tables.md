---
sidebar_position: 1
sidebar_label: 创建表
---


# 在 ClickHouse 中创建表

与大多数数据库一样，ClickHouse 将表逻辑上分组到 **数据库** 中。使用 `CREATE DATABASE` 命令在 ClickHouse 中创建一个新的数据库：

  ```sql
  CREATE DATABASE IF NOT EXISTS helloworld
  ```

同样，使用 `CREATE TABLE` 来定义一个新表。（如果您没有指定数据库名称，表将位于 `default` 数据库中。）以下表名为 `my_first_table` 的表位于 `helloworld` 数据库中：

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

在上面的示例中，`my_first_table` 是一个 `MergeTree` 表，具有四个列：

- `user_id`:  一个 32 位无符号整数
- `message`: 一种 `String` 数据类型，替代其他数据库系统中的 `VARCHAR`、`BLOB`、`CLOB` 等类型
- `timestamp`: 一个 `DateTime` 值，表示某一时刻
- `metric`: 一个 32 位浮点数

  :::note
  表引擎决定了：
   - 数据的存储方式和位置
   - 支持哪些查询
   - 数据是否复制

  有许多引擎可供选择，但对于单节点 ClickHouse 服务器上的简单表，[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 是您可能的选择。
  :::

## 主键简介 {#a-brief-intro-to-primary-keys}

在您进一步之前，理解 ClickHouse 中主键的工作原理是重要的（主键的实现可能会显得出乎意料！）：

  - ClickHouse 中的主键在表中对每一行 **_不是唯一的_**

ClickHouse 表的主键决定了数据在写入磁盘时的排序方式。每 8,192 行或 10MB 的数据（称为 **索引粒度**）会在主键索引文件中创建一个条目。这个粒度概念创建了一个 **稀疏索引**，可以轻松地适应内存，而粒度表示在 `SELECT` 查询中处理的最小列数据的一部分。

主键可以使用 `PRIMARY KEY` 参数定义。如果您定义一个表而没有指定 `PRIMARY KEY`，那么主键将成为 `ORDER BY` 子句中指定的元组。如果您同时指定 `PRIMARY KEY` 和 `ORDER BY`，则主键必须是排序顺序的前缀。

主键也是排序键，表示为 `(user_id, timestamp)` 的元组。因此，每个列文件中存储的数据将首先按 `user_id` 排序，然后按 `timestamp` 排序。

:::tip
有关更多详细信息，请查看 ClickHouse 学院中的 [建模数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)。
:::
