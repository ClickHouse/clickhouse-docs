---
description: 'StripeLog 表引擎文档'
slug: /engines/table-engines/log-family/stripelog
toc_priority: 32
toc_title: 'StripeLog'
title: 'StripeLog 表引擎'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# StripeLog 表引擎

<CloudNotSupportedBadge/>

此引擎属于 Log 引擎家族。有关 Log 引擎的通用属性及其差异，请参阅 [Log 引擎家族](../../../engines/table-engines/log-family/index.md) 一文。

在需要写入大量表、且每个表数据量都很小（少于 100 万行）的场景中使用此引擎。例如，该表可以用于存储需要进行转换、并要求对其进行原子处理的传入数据批次。ClickHouse 服务器可以运行 10 万个此类表的实例。当需要大量表时，应优先选择此表引擎而不是 [Log](./log.md)，代价是读取效率会有所降低。



## 创建表 {#table_engines-stripelog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

详细说明请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询。


## 写入数据 {#table_engines-stripelog-writing-the-data}

`StripeLog` 引擎将所有列存储在一个文件中。对于每个 `INSERT` 查询,ClickHouse 会将数据块追加到表文件的末尾,按列逐一写入。

对于每个表,ClickHouse 会写入以下文件:

- `data.bin` — 数据文件。
- `index.mrk` — 标记文件。标记包含每个已插入数据块中各列的偏移量。

`StripeLog` 引擎不支持 `ALTER UPDATE` 和 `ALTER DELETE` 操作。


## 读取数据 {#table_engines-stripelog-reading-the-data}

标记文件使 ClickHouse 能够并行读取数据。这意味着 `SELECT` 查询返回的行顺序是不确定的。如需对行进行排序,请使用 `ORDER BY` 子句。


## 使用示例 {#table_engines-stripelog-example-of-use}

创建表:

```sql
CREATE TABLE stripe_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = StripeLog
```

插入数据:

```sql
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

我们使用了两个 `INSERT` 查询在 `data.bin` 文件中创建了两个数据块。

ClickHouse 在查询数据时使用多线程。每个线程读取一个单独的数据块,并在完成时独立返回结果行。因此,在大多数情况下,输出中行块的顺序与输入中相同块的顺序不一致。例如:

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

对结果进行排序(默认为升序):

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
