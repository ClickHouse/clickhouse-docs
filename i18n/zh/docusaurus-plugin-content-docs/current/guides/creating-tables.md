---
'sidebar_position': 1
'sidebar_label': '创建表'
'title': '在 ClickHouse 中创建表'
'slug': '/guides/creating-tables'
'description': '了解在 ClickHouse 中创建表'
'doc_type': 'guide'
---


# 在 ClickHouse 中创建表

与大多数数据库一样，ClickHouse 将表逻辑上分组到 **数据库** 中。使用 `CREATE DATABASE` 命令在 ClickHouse 中创建一个新数据库：

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

同样，使用 `CREATE TABLE` 定义一个新表。如果不指定数据库名称，则表将位于 `default` 数据库中。

以下名为 `my_first_table` 的表是在 `helloworld` 数据库中创建的：

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

在上述示例中，`my_first_table` 是一个 `MergeTree` 表，包含四列：

- `user_id`: 一个 32 位无符号整数
- `message`: `String` 数据类型，替代了其他数据库系统中的 `VARCHAR`、`BLOB`、`CLOB` 等类型
- `timestamp`: 一个 `DateTime` 值，表示一个时间点
- `metric`: 一个 32 位浮点数

:::note
表引擎决定：
- 数据是如何及存储在哪里
- 支持哪些查询
- 数据是否复制

可以选择多种引擎，但对于单节点 ClickHouse 服务器上的简单表而言，[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 是您可能的选择。
:::

## 对主键的简要介绍 {#a-brief-intro-to-primary-keys}

在继续之前，了解 ClickHouse 中主键的工作原理非常重要（主键的实现可能看起来有些意外！）：

- ClickHouse 中的主键对表中的每一行 **_不是唯一的_**

ClickHouse 表的主键决定了数据写入磁盘时的排序方式。每 8,192 行或 10MB 的数据（称为 **索引粒度**）在主键索引文件中创建一个条目。这个粒度概念创建了一个 **稀疏索引**，可以轻松适应内存，并且这些粒度表示在 `SELECT` 查询中处理的列数据的最小量条带。

可以使用 `PRIMARY KEY` 参数定义主键。如果您定义一个没有指定 `PRIMARY KEY` 的表，则主键将成为 `ORDER BY` 子句中指定的元组。如果同时指定 `PRIMARY KEY` 和 `ORDER BY`，则主键必须是排序顺序的前缀。

主键也是排序键，元组为 `(user_id, timestamp)`。因此，存储在每个列文件中的数据将按 `user_id` 排序，然后按 `timestamp` 排序。

:::tip
有关更多详细信息，请查看 ClickHouse 学院中的 [建模数据培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)。
:::
