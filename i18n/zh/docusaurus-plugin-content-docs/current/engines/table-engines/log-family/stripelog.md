---
slug: /engines/table-engines/log-family/stripelog
toc_priority: 32
toc_title: StripeLog
---


# StripeLog

此引擎属于日志引擎家族。请参见 [日志引擎家族](../../../engines/table-engines/log-family/index.md) 文章中的日志引擎的共同属性及其差异。

在需要写入许多小数据量（少于 100 万行）表的场景中使用此引擎。例如，此表可用于存储需要原子处理的传入数据批次。此类型表可在 ClickHouse 服务器上存储 100k 实例。此表引擎在需要大量表时应优先于 [Log](./log.md)，尽管这会牺牲读取效率。

## 创建表 {#table_engines-stripelog-creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

请参见 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细描述。

## 写入数据 {#table_engines-stripelog-writing-the-data}

`StripeLog` 引擎将所有列存储在一个文件中。对于每个 `INSERT` 查询，ClickHouse 会将数据块追加到表文件的末尾，一列一列地写入。

对于每个表，ClickHouse 编写以下文件：

- `data.bin` — 数据文件。
- `index.mrk` — 带有标记的文件。标记包含每个数据块中每列的偏移量。

`StripeLog` 引擎不支持 `ALTER UPDATE` 和 `ALTER DELETE` 操作。

## 读取数据 {#table_engines-stripelog-reading-the-data}

带有标记的文件允许 ClickHouse 并行读取数据。这意味着 `SELECT` 查询以不可预测的顺序返回行。使用 `ORDER BY` 子句对行进行排序。

## 使用示例 {#table_engines-stripelog-example-of-use}

创建表：

``` sql
CREATE TABLE stripe_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = StripeLog
```

插入数据：

``` sql
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

我们使用了两个 `INSERT` 查询在 `data.bin` 文件中创建了两个数据块。

ClickHouse 在选择数据时使用多个线程。每个线程独立读取一个单独的数据块，并在完成时返回结果行。因此，输出中行块的顺序在大多数情况下与输入中相同块的顺序不匹配。例如：

``` sql
SELECT * FROM stripe_log_table
```

``` text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message │
└─────────────────────┴──────────────┴───────────────────────────┘
```

对结果进行排序（默认按升序）：

``` sql
SELECT * FROM stripe_log_table ORDER BY timestamp
```

``` text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
