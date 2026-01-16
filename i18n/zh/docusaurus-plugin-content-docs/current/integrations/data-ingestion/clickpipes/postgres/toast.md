---
title: '处理 TOAST 列'
description: '了解在将数据从 PostgreSQL 复制到 ClickHouse 时如何处理 TOAST 列。'
slug: /integrations/clickpipes/postgres/toast
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

在将 PostgreSQL 数据复制到 ClickHouse 时，了解 TOAST（The Oversized-Attribute Storage Technique，超大属性存储技术）列的限制和特殊注意事项非常重要。本指南将帮助您在复制过程中识别并正确处理 TOAST 列。

## PostgreSQL 中的 TOAST 列是什么？ \{#what-are-toast-columns-in-postgresql\}

TOAST（The Oversized-Attribute Storage Technique，超大属性存储技术）是 PostgreSQL 用于处理大体积字段值的机制。当一行数据超过最大行大小（通常为 2KB，但这会根据 PostgreSQL 版本和具体设置而有所不同）时，PostgreSQL 会自动将较大的字段值移入单独的 TOAST 表中，并在主表中仅存储一个指针。

需要注意的是，在进行 CDC（变更数据捕获）时，未发生变化的 TOAST 列不会包含在复制流中。如果处理不当，这可能会导致数据复制不完整。

在初始加载（快照）阶段，所有列值（包括 TOAST 列）都会被正确复制，不受其大小限制。本指南中描述的限制主要影响初始加载之后持续进行的 CDC 过程。

可以在此处阅读更多关于 TOAST 及其在 PostgreSQL 中实现的内容：https://www.postgresql.org/docs/current/storage-toast.html

## 确定表中的 TOAST 列 \{#identifying-toast-columns-in-a-table\}

要判断某个表是否包含 TOAST 列，可以使用以下 SQL 查询：

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

此查询将返回可能会被 TOAST 处理的列的名称和数据类型。不过需要注意的是，此查询仅根据列的数据类型和存储属性来识别具备使用 TOAST 存储条件的列。要判断这些列中是否实际包含已 TOAST 的数据，还需要考虑这些列中的值是否超过相应的大小阈值。数据是否真正会被 TOAST，取决于这些列中存储的具体内容。


## 确保正确处理 TOAST 列 \{#ensuring-proper-handling-of-toast-columns\}

为确保在复制过程中正确处理 TOAST 列，你应当将表的 `REPLICA IDENTITY` 设置为 `FULL`。这会告诉 PostgreSQL 在执行 UPDATE 和 DELETE 操作时，在 WAL 中包含完整的旧行，从而确保所有列值（包括 TOAST 列）都可用于复制。

你可以使用以下 SQL 命令将 `REPLICA IDENTITY` 设置为 `FULL`：

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

有关在设置 `REPLICA IDENTITY FULL` 时的性能方面考虑，请参阅[这篇博客文章](https://xata.io/blog/replica-identity-full-performance)。


## 未设置 REPLICA IDENTITY FULL 时的复制行为 \{#replication-behavior-when-replica-identity-full-is-not-set\}

如果在带有 TOAST 列的表上未设置 `REPLICA IDENTITY FULL`，在复制到 ClickHouse 时可能会遇到以下问题：

1. 对于 INSERT 操作，所有列（包括 TOAST 列）都会被正确复制。

2. 对于 UPDATE 操作：
   - 如果某个 TOAST 列没有被修改，其值在 ClickHouse 中会显示为 NULL 或空值。
   - 如果某个 TOAST 列被修改，则会被正确复制。

3. 对于 DELETE 操作，TOAST 列的值在 ClickHouse 中会显示为 NULL 或空值。

这些行为会导致 PostgreSQL 源端与 ClickHouse 目标端之间的数据不一致。因此，必须为包含 TOAST 列的表设置 `REPLICA IDENTITY FULL`，以确保数据复制的准确性和完整性。

## 结论 \{#conclusion\}

在从 PostgreSQL 复制到 ClickHouse 的过程中，正确处理 TOAST 列对于维护数据完整性至关重要。通过识别 TOAST 列并设置合适的 `REPLICA IDENTITY`，您就可以确保数据得以准确、完整地复制。