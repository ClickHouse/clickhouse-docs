---
'description': 'StripeLog 的文档'
'slug': '/engines/table-engines/log-family/stripelog'
'toc_priority': 32
'toc_title': 'StripeLog'
'title': 'StripeLog'
'doc_type': 'reference'
---


# StripeLog

此引擎属于日志引擎系列。有关日志引擎的共同属性及其在 [Log Engine Family](../../../engines/table-engines/log-family/index.md) 文章中的区别，请参见相关内容。

在需要写入多个数据量小（少于 1 百万行）的表的场景中使用此引擎。例如，此表可用于存储需要进行原子处理的传入数据批次。此类型的表可以在 ClickHouse 服务器上并存 100k 个实例。在需要大量表时，应优先选择此表引擎，而不是 [Log](./log.md)，尽管这样做会牺牲读取效率。

## 创建表 {#table_engines-stripelog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

请参见 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细描述。

## 写入数据 {#table_engines-stripelog-writing-the-data}

`StripeLog` 引擎将所有列存储在一个文件中。对于每个 `INSERT` 查询，ClickHouse 会将数据块附加到表文件的末尾，逐列写入数据。

对于每个表，ClickHouse 写入文件：

- `data.bin` — 数据文件。
- `index.mrk` — 带有标记的文件。标记包含每个插入的数据块每列的偏移量。

`StripeLog` 引擎不支持 `ALTER UPDATE` 和 `ALTER DELETE` 操作。

## 读取数据 {#table_engines-stripelog-reading-the-data}

带有标记的文件允许 ClickHouse 并行读取数据。这意味着 `SELECT` 查询以不可预测的顺序返回行。使用 `ORDER BY` 子句对行进行排序。

## 使用示例 {#table_engines-stripelog-example-of-use}

创建表：

```sql
CREATE TABLE stripe_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = StripeLog
```

插入数据：

```sql
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

我们使用了两个 `INSERT` 查询在 `data.bin` 文件中创建了两个数据块。

ClickHouse 在选择数据时使用多个线程。每个线程独立读取一个数据块，并在完成后返回结果行。因此，输出中的行块顺序在大多数情况下与输入中的同一块顺序不匹配。例如：

```sql
SELECT * FROM stripe_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message │
└─────────────────────┴──────────────┴───────────────────────────┘
```

对结果进行排序（默认按升序）：

```sql
SELECT * FROM stripe_log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
