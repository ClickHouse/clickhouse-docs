---
description: 'StripeLog 表引擎文档'
slug: /engines/table-engines/log-family/stripelog
toc_priority: 32
toc_title: 'StripeLog'
title: 'StripeLog 表引擎'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# StripeLog 表引擎 {#stripelog-table-engine}

<CloudNotSupportedBadge/>

此引擎属于 Log 引擎系列。关于 Log 引擎的通用属性及其差异，请参见[Log 引擎系列](../../../engines/table-engines/log-family/index.md)一文。

在需要使用大量表且每个表只包含少量数据（少于 100 万行）时，可以使用此引擎。例如，该表可用于存储待转换的传入数据批次，并要求对其进行原子处理。对于单个 ClickHouse 服务器，此类型表最多可支持 10 万个实例。当需要大量表时，应优先选择此表引擎而不是 [Log](./log.md)，其代价是读取效率会有所下降。

## 创建数据表 {#table_engines-stripelog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细说明。

## 写入数据 {#table_engines-stripelog-writing-the-data}

`StripeLog` 引擎将所有列存储在同一个文件中。对于每个 `INSERT` 查询，ClickHouse 会将数据块追加到表文件末尾，按列依次写入。

对于每个表，ClickHouse 会写入以下文件：

- `data.bin` — 数据文件。
- `index.mrk` — 标记文件。标记包含插入的每个数据块中各列的偏移量。

`StripeLog` 引擎不支持 `ALTER UPDATE` 和 `ALTER DELETE` 操作。

## 读取数据 {#table_engines-stripelog-reading-the-data}

包含标记的文件使 ClickHouse 能够并行读取数据。这意味着 `SELECT` 查询返回的行顺序是不可预测的。使用 `ORDER BY` 子句对行进行排序。

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
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','第一条常规消息')
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','第二条常规消息'),(now(),'WARNING','第一条警告消息')
```

我们使用两个 `INSERT` 查询在 `data.bin` 文件中创建了两个数据块。

ClickHouse 在执行数据查询时会使用多个线程。每个线程读取一个单独的数据块，并在完成后独立返回对应的结果行。因此，在大多数情况下，输出中各数据块的行顺序与输入中相同数据块的顺序并不一致。例如：

```sql
SELECT * FROM stripe_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ 第二条常规消息 │
│ 2019-01-18 14:34:53 │ WARNING      │ 第一条警告消息  │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ 第一条常规消息 │
└─────────────────────┴──────────────┴───────────────────────────┘
```

对结果进行排序（默认为升序）：

```sql
SELECT * FROM stripe_log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ 第一条常规消息  │
│ 2019-01-18 14:27:32 │ REGULAR      │ 第二条常规消息 │
│ 2019-01-18 14:34:53 │ WARNING      │ 第一条警告消息  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
