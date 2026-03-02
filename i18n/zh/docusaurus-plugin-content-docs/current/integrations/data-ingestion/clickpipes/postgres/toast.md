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

在将数据从 PostgreSQL 复制到 ClickHouse 时，理解 TOAST（The Oversized-Attribute Storage Technique，大型属性存储技术）列的限制和特殊注意事项非常重要。本指南将帮助您在复制过程中识别并正确处理 TOAST 列。

## 什么是 PostgreSQL 中的 TOAST 列？ \{#what-are-toast-columns-in-postgresql\}

TOAST（The Oversized-Attribute Storage Technique）是 PostgreSQL 用于处理大体积字段值的机制。当某一行超过最大行大小（通常为 2KB，但这可能会根据 PostgreSQL 版本和具体设置而变化）时，PostgreSQL 会自动将体积较大的字段值移动到单独的 TOAST 表中，并在主表中只存储一个指针。

需要注意的是，在 Change Data Capture（CDC，变更数据捕获）过程中，未发生变化的 TOAST 列不会被包含在复制数据流中。如果处理不当，这可能会导致数据复制不完整。

在初始加载（快照）期间，包括 TOAST 列在内的所有列值都会被正确复制，而不受其大小限制。本指南中描述的限制主要影响初始加载之后持续进行的 CDC 过程。

有关 TOAST 及其在 PostgreSQL 中实现的更多信息，请参阅：https://www.postgresql.org/docs/current/storage-toast.html

## 识别表中的 TOAST 列 \{#identifying-toast-columns-in-a-table\}

要判断某个表是否包含 TOAST 列，可以执行以下 SQL 查询：

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

此查询将返回可能会被 TOAST 处理的列的名称和数据类型。需要注意的是，此查询仅会根据列的数据类型和存储属性识别出具备 TOAST 存储条件的列。要确定这些列是否实际包含经过 TOAST 处理的数据，还需要考虑这些列中的值是否超过相应的大小阈值。数据是否真正发生 TOAST，取决于存储在这些列中的具体内容。


## 确保正确处理 TOAST 列 \{#ensuring-proper-handling-of-toast-columns\}

为确保在复制期间正确处理 TOAST 列，需要将表的 `REPLICA IDENTITY` 设置为 `FULL`。这会指示 PostgreSQL 在对 UPDATE 和 DELETE 操作写入 WAL 时包含完整的旧行数据，从而确保所有列值（包括 TOAST 列）都可用于复制。

可以使用以下 SQL 命令将 `REPLICA IDENTITY` 设置为 `FULL`：

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

有关在设置 `REPLICA IDENTITY FULL` 时的性能考虑，请参阅[这篇博客文章](https://xata.io/blog/replica-identity-full-performance)。


## 当未设置 REPLICA IDENTITY FULL 时的复制行为 \{#replication-behavior-when-replica-identity-full-is-not-set\}

如果未为包含 TOAST 列的表设置 `REPLICA IDENTITY FULL`，在复制到 ClickHouse 时可能会遇到以下问题：

1. 对于 INSERT 操作，所有列（包括 TOAST 列）都会被正确复制。

2. 对于 UPDATE 操作：
   - 如果某个 TOAST 列未被修改，其值在 ClickHouse 中会显示为 NULL 或为空。
   - 如果某个 TOAST 列被修改，则会被正确复制。

3. 对于 DELETE 操作，TOAST 列的值在 ClickHouse 中会显示为 NULL 或为空。

这些行为可能会导致 PostgreSQL 源端与 ClickHouse 目标端之间的数据不一致。因此，务必为包含 TOAST 列的表设置 `REPLICA IDENTITY FULL`，以确保数据复制的准确性和完整性。

## 结论 \{#conclusion\}

在从 PostgreSQL 复制数据到 ClickHouse 时，正确处理 TOAST 列对于维护数据完整性至关重要。通过识别 TOAST 列并设置合适的 `REPLICA IDENTITY`，可以确保数据被准确且完整地复制。