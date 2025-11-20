---
title: '处理 TOAST 列'
description: '了解在将数据从 PostgreSQL 复制到 ClickHouse 时如何处理 TOAST 列。'
slug: /integrations/clickpipes/postgres/toast
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

在将数据从 PostgreSQL 复制到 ClickHouse 时，了解 TOAST（The Oversized-Attribute Storage Technique）列的限制和特殊注意事项非常重要。本文将帮助你在复制过程中识别并正确处理 TOAST 列。



## PostgreSQL 中的 TOAST 列是什么？ {#what-are-toast-columns-in-postgresql}

TOAST(The Oversized-Attribute Storage Technique,超大属性存储技术)是 PostgreSQL 处理大字段值的机制。当某行数据超过最大行大小(通常为 2KB,但会因 PostgreSQL 版本和具体配置而有所不同)时,PostgreSQL 会自动将大字段值移至单独的 TOAST 表中,而在主表中仅保留一个指针。

需要注意的是,在变更数据捕获(CDC)过程中,未发生变更的 TOAST 列不会包含在复制流中。如果处理不当,可能会导致数据复制不完整。

在初始加载(快照)阶段,所有列值(包括 TOAST 列)都会被正确复制,无论其大小如何。本指南中描述的限制主要影响初始加载完成后的持续 CDC 过程。

您可以在此处了解有关 TOAST 及其在 PostgreSQL 中实现的更多信息:https://www.postgresql.org/docs/current/storage-toast.html


## 识别表中的 TOAST 列 {#identifying-toast-columns-in-a-table}

要识别表中是否存在 TOAST 列,可以使用以下 SQL 查询:

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

此查询将返回可能被 TOAST 处理的列的名称和数据类型。但需要注意的是,此查询仅根据数据类型和存储属性识别符合 TOAST 存储条件的列。要确定这些列是否实际包含 TOAST 数据,还需要考虑这些列中的值是否超过了大小阈值。数据是否实际进行 TOAST 处理取决于这些列中存储的具体内容。


## 确保正确处理 TOAST 列 {#ensuring-proper-handling-of-toast-columns}

为确保在复制过程中正确处理 TOAST 列,应将表的 `REPLICA IDENTITY` 设置为 `FULL`。这将指示 PostgreSQL 在 WAL 中包含 UPDATE 和 DELETE 操作的完整旧行数据,从而确保所有列值(包括 TOAST 列)可用于复制。

您可以使用以下 SQL 命令将 `REPLICA IDENTITY` 设置为 `FULL`:

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

有关设置 `REPLICA IDENTITY FULL` 时的性能考量,请参阅[此博客文章](https://xata.io/blog/replica-identity-full-performance)。


## 未设置 REPLICA IDENTITY FULL 时的复制行为 {#replication-behavior-when-replica-identity-full-is-not-set}

如果未为包含 TOAST 列的表设置 `REPLICA IDENTITY FULL`,在复制到 ClickHouse 时可能会遇到以下问题:

1. 对于 INSERT 操作,所有列(包括 TOAST 列)都会被正确复制。

2. 对于 UPDATE 操作:
   - 如果 TOAST 列未被修改,其值在 ClickHouse 中将显示为 NULL 或空值。
   - 如果 TOAST 列被修改,则会被正确复制。

3. 对于 DELETE 操作,TOAST 列的值在 ClickHouse 中将显示为 NULL 或空值。

这些行为可能导致 PostgreSQL 源端与 ClickHouse 目标端之间出现数据不一致。因此,对于包含 TOAST 列的表,务必设置 `REPLICA IDENTITY FULL` 以确保数据复制的准确性和完整性。


## 结论 {#conclusion}

在从 PostgreSQL 向 ClickHouse 复制数据时,正确处理 TOAST 列对于保持数据完整性至关重要。通过识别 TOAST 列并设置适当的 `REPLICA IDENTITY`,可以确保数据被准确完整地复制。
