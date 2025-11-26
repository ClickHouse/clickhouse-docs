---
description: 'TinyLog 表引擎文档'
slug: /engines/table-engines/log-family/tinylog
toc_priority: 34
toc_title: 'TinyLog'
title: 'TinyLog 表引擎'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TinyLog 表引擎

<CloudNotSupportedBadge/>

该引擎属于 Log 引擎族。有关 Log 引擎的通用属性及其差异，参见 [Log 引擎族](../../../engines/table-engines/log-family/index.md)。

此表引擎通常采用“一次写入、多次读取”的方式使用：数据写入一次后，可根据需要多次读取。例如，可以将 `TinyLog` 类型的表用于以小批量处理的中间数据。请注意，将数据存储在大量小表中效率较低。

查询以单一数据流方式执行。换句话说，该引擎适用于相对较小的表（大约不超过 1,000,000 行）。如果存在大量小表，使用此表引擎是一个合理的选择，因为它比 [Log](../../../engines/table-engines/log-family/log.md) 引擎更简单（需要打开的文件更少）。



## 特性 {#characteristics}

- **更简单的结构**：与 Log 引擎不同，TinyLog 不使用标记文件（mark files）。这降低了复杂性，但也限制了在大数据集上的性能优化空间。
- **单流查询**：对 TinyLog 表的查询在单个流中执行，适用于相对较小的表，通常行数不超过约 1,000,000 行。
- **适用于小表的高效性**：TinyLog 引擎的简单性在管理大量小表时具有优势，因为与 Log 引擎相比，它需要进行的文件操作更少。

与 Log 引擎不同，TinyLog 不使用标记文件（mark files）。这降低了复杂性，但也限制了在大型数据集上的性能优化空间。



## 创建表

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细说明。


## 写入数据 {#table_engines-tinylog-writing-the-data}

`TinyLog` 引擎将所有列存储在同一个文件中。每执行一次 `INSERT` 查询，ClickHouse 都会将数据块追加到表文件末尾，并按列依次写入。

对于每个表，ClickHouse 会写入以下文件：

- `<column>.bin`：每一列对应的数据文件，包含序列化并压缩的数据。

`TinyLog` 引擎不支持 `ALTER UPDATE` 和 `ALTER DELETE` 操作。



## 示例用法

创建表：

```sql
CREATE TABLE tiny_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = TinyLog
```

写入数据：

```sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','第一条常规消息')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','第二条常规消息'),(now(),'WARNING','第一条警告消息')
```

我们使用了两个 `INSERT` 查询，在 `<column>.bin` 文件中创建了两个数据块。

ClickHouse 使用单一数据流来读取数据。因此，输出中各行块的顺序与输入中相应块的顺序一致。例如：

```sql
SELECT * FROM tiny_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2024-12-10 13:11:58 │ REGULAR      │ 第一条常规消息  │
│ 2024-12-10 13:12:12 │ REGULAR      │ 第二条常规消息 │
│ 2024-12-10 13:12:12 │ WARNING      │ 第一条警告消息  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
