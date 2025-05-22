
# 在 ClickHouse 中创建表

与大多数数据库一样，ClickHouse 将表逻辑上分组到 **数据库** 中。使用 `CREATE DATABASE` 命令在 ClickHouse 中创建新数据库：

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

同样，使用 `CREATE TABLE` 定义新表。如果您未指定数据库名称，则表将位于 `default` 数据库中。

以下名为 `my_first_table` 的表在 `helloworld` 数据库中创建：

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
- `message`: 一个 `String` 数据类型，替代其他数据库系统中的 `VARCHAR`、`BLOB`、`CLOB` 等类型
- `timestamp`: 一个 `DateTime` 值，表示时间瞬间
- `metric`: 一个 32 位浮点数

:::note
表引擎决定：
- 数据如何以及存储在哪里
- 支持哪些查询
- 数据是否被复制

有许多引擎可供选择，但对于单节点 ClickHouse 服务器上的简单表，[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 可能是您的最佳选择。
:::

## 主键简介 {#a-brief-intro-to-primary-keys}

在继续之前，了解 ClickHouse 中主键的工作原理非常重要（主键的实现可能令人意外！）：

- ClickHouse 中的主键是 **_不唯一的_**，对于表中的每一行

ClickHouse 表的主键决定了数据写入磁盘时的排序方式。每 8,192 行或 10MB 数据（称为 **索引粒度**）在主键索引文件中创建一个条目。这个粒度概念创建了一个 **稀疏索引**，可以轻松适应内存，而这些粒度表示在 `SELECT` 查询中处理的最小列数据条带。

主键可以使用 `PRIMARY KEY` 参数定义。如果您在定义表时未指定 `PRIMARY KEY`，那么主键将成为 `ORDER BY` 子句中指定的元组。如果您同时指定了 `PRIMARY KEY` 和 `ORDER BY`，则主键必须是排序顺序的前缀。

主键也是排序键，它是一个元组 `(user_id, timestamp)`。因此，存储在每个列文件中的数据将按 `user_id` 排序，然后按 `timestamp` 排序。

:::tip
有关更多详细信息，请查看 ClickHouse Academy 中的 [数据建模培训模块](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)。
:::
