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

该引擎属于日志引擎系列。有关日志引擎的通用属性及其差异，请参阅 [Log 引擎系列](../../../engines/table-engines/log-family/index.md)。

此表引擎通常采用只写一次的方式：数据只写入一次，然后按需多次读取。比如，可以将 `TinyLog` 类型的表用于以小批次处理的中间数据。请注意，将数据存储在大量小表中是低效的。

查询在单一数据流中执行。换句话说，该引擎适用于相对较小的表（最多约 1,000,000 行）。如果存在大量小表，使用此表引擎是有意义的，因为它比 [Log](../../../engines/table-engines/log-family/log.md) 引擎更简单（需要打开的文件更少）。



## 特性 {#characteristics}

- **结构更简单**:与 Log 引擎不同,TinyLog 不使用标记文件。这降低了复杂性,但也限制了大数据集的性能优化能力。
- **单流查询**:TinyLog 表的查询在单个流中执行,因此适用于相对较小的表,通常不超过 1,000,000 行。
- **小表处理高效**:TinyLog 引擎的简单性使其在管理大量小表时具有优势,因为与 Log 引擎相比,它需要的文件操作更少。

与 Log 引擎不同,TinyLog 不使用标记文件。这降低了复杂性,但也限制了大数据集的性能优化能力。


## 创建表 {#table_engines-tinylog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

详细说明请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询。


## 写入数据 {#table_engines-tinylog-writing-the-data}

`TinyLog` 引擎将所有列存储在一个文件中。对于每个 `INSERT` 查询,ClickHouse 会将数据块追加到表文件的末尾,按列逐一写入。

对于每个表,ClickHouse 会写入以下文件:

- `<column>.bin`:每列对应的数据文件,包含序列化和压缩后的数据。

`TinyLog` 引擎不支持 `ALTER UPDATE` 和 `ALTER DELETE` 操作。


## 使用示例 {#table_engines-tinylog-example-of-use}

创建表:

```sql
CREATE TABLE tiny_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = TinyLog
```

插入数据:

```sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

我们使用了两个 `INSERT` 查询,在 `<column>.bin` 文件中创建了两个数据块。

ClickHouse 使用单个数据流来选择数据。因此,输出中数据块的顺序与输入中相同数据块的顺序保持一致。例如:

```sql
SELECT * FROM tiny_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2024-12-10 13:11:58 │ REGULAR      │ The first regular message  │
│ 2024-12-10 13:12:12 │ REGULAR      │ The second regular message │
│ 2024-12-10 13:12:12 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
