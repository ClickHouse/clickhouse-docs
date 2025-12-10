---
description: 'Log 表引擎文档'
slug: /engines/table-engines/log-family/log
toc_priority: 33
toc_title: 'Log'
title: 'Log 表引擎'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Log 表引擎 {#log-table-engine}

<CloudNotSupportedBadge/>

该引擎属于 `Log` 引擎系列。关于 `Log` 引擎的通用属性及其差异，请参阅 [Log Engine Family](../../../engines/table-engines/log-family/index.md) 一文。

`Log` 与 [TinyLog](../../../engines/table-engines/log-family/tinylog.md) 的不同之处在于，列文件旁还会存放一个较小的“标记（marks）”文件。这些标记会在每个数据块写入，包含偏移量，用于指示在跳过指定行数时应从文件的何处开始读取。由此可以在多个线程中读取表数据。
对于并发数据访问，多个读操作可以同时执行，而写操作会阻塞读操作以及其他写操作。
`Log` 引擎不支持索引。同样地，如果向表写入失败，表就会损坏，此时从表中读取会返回错误。`Log` 引擎适用于临时数据、只写一次的表，以及测试或演示用途。

## 创建表 {#table_engines-log-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Log
```

请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细说明。

## 写入数据 {#table_engines-log-writing-the-data}

`Log` 引擎通过将每一列写入各自独立的文件来高效存储数据。对于每个表，Log 引擎会在指定的存储路径下写入以下文件：

- `<column>.bin`：每一列对应的数据文件，包含序列化并压缩后的数据。
- `__marks.mrk`：标记文件，存储每个插入数据块的偏移量和行数。标记用于在读取时帮助引擎跳过无关的数据块，从而提升查询执行效率。

### 写入过程 {#writing-process}

当数据写入到 `Log` 表时：

1.    数据会被序列化并压缩成数据块。
2.    对于每一列，压缩后的数据会追加写入对应的 `<column>.bin` 文件。
3.    在 `__marks.mrk` 文件中添加相应条目，用于记录新插入数据的偏移量和行数。

## 读取数据 {#table_engines-log-reading-the-data}

带有标记的文件使得 ClickHouse 能够并行读取数据。这意味着 `SELECT` 查询会以不可预测的顺序返回行。使用 `ORDER BY` 子句对结果进行排序。

## 使用示例 {#table_engines-log-example-of-use}

创建表：

```sql
CREATE TABLE log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = Log
```

写入数据：

```sql
INSERT INTO log_table VALUES (now(),'REGULAR','第一条普通消息')
INSERT INTO log_table VALUES (now(),'REGULAR','第二条普通消息'),(now(),'WARNING','第一条警告消息')
```

我们使用了两个 `INSERT` 查询，在 `<column>.bin` 文件中创建了两个数据块。

ClickHouse 在执行查询时会使用多个线程来读取数据。每个线程读取一个独立的数据块，并在完成后各自返回结果行。因此，输出中数据块（及其中行）的顺序可能与输入中相应数据块的顺序不一致。例如：

```sql
SELECT * FROM log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ 第二条普通消息 │
│ 2019-01-18 14:34:53 │ WARNING      │ 第一条警告消息  │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ 第一条普通消息 │
└─────────────────────┴──────────────┴───────────────────────────┘
```

对结果进行排序（默认按升序排列）：

```sql
SELECT * FROM log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ 普通         │ 第一条普通消息              │
│ 2019-01-18 14:27:32 │ 普通         │ 第二条普通消息              │
│ 2019-01-18 14:34:53 │ 警告         │ 第一条警告消息              │
└─────────────────────┴──────────────┴────────────────────────────┘
```
