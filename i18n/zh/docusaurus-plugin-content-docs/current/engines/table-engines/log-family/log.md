---
description: 'Log 表引擎文档'
slug: /engines/table-engines/log-family/log
toc_priority: 33
toc_title: 'Log'
title: 'Log 表引擎'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Log 表引擎

<CloudNotSupportedBadge/>

该引擎属于 `Log` 引擎家族。有关 `Log` 引擎的通用属性及其之间的差异，请参阅 [Log 引擎家族](../../../engines/table-engines/log-family/index.md) 一文。

`Log` 与 [TinyLog](../../../engines/table-engines/log-family/tinylog.md) 的区别在于，在列文件旁会存放一个小型的 “marks” 文件。每个数据块都会写入这些标记，它们包含偏移量，用于指示在跳过指定行数后应从文件的哪个位置开始读取。借此可以在多线程中读取表数据。
在并发数据访问场景下，读取操作可以并行执行，而写入操作会阻塞读取以及其他写入。
`Log` 引擎不支持索引。同样地，如果向表写入失败，表会损坏，之后从中读取将返回错误。`Log` 引擎适用于临时数据、只写一次的表，以及测试或演示用途。



## 创建表 {#table_engines-log-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Log
```

详细说明请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询。


## 写入数据 {#table_engines-log-writing-the-data}

`Log` 引擎通过将每列写入独立文件来高效存储数据。对于每个表,Log 引擎会在指定的存储路径下写入以下文件:

- `<column>.bin`:每列的数据文件,包含序列化和压缩后的数据。
- `__marks.mrk`:标记文件,存储每个插入数据块的偏移量和行数。标记用于在读取时允许引擎跳过无关的数据块,从而提高查询执行效率。

### 写入过程 {#writing-process}

当数据写入 `Log` 表时:

1.  数据被序列化并压缩成块。
2.  对于每列,压缩后的数据被追加到其对应的 `<column>.bin` 文件中。
3.  相应的条目被添加到 `__marks.mrk` 文件中,以记录新插入数据的偏移量和行数。


## 读取数据 {#table_engines-log-reading-the-data}

标记文件使 ClickHouse 能够并行读取数据。这意味着 `SELECT` 查询返回的行顺序是不确定的。如需对行进行排序,请使用 `ORDER BY` 子句。


## 使用示例 {#table_engines-log-example-of-use}

创建表:

```sql
CREATE TABLE log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = Log
```

插入数据:

```sql
INSERT INTO log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

我们使用了两个 `INSERT` 查询在 `<column>.bin` 文件中创建了两个数据块。

ClickHouse 在查询数据时使用多线程。每个线程读取一个独立的数据块,并在完成时独立返回结果行。因此,输出中行块的顺序可能与输入中相同块的顺序不一致。例如:

```sql
SELECT * FROM log_table
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

对结果进行排序(默认为升序):

```sql
SELECT * FROM log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
