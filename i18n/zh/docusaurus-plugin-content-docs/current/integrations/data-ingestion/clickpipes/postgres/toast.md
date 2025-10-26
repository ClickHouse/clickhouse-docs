---
'title': '处理 TOAST 列'
'description': '学习如何在将数据从 PostgreSQL 复制到 ClickHouse 时处理 TOAST 列。'
'slug': '/integrations/clickpipes/postgres/toast'
'doc_type': 'guide'
---

当从 PostgreSQL 复制数据到 ClickHouse 时，了解 TOAST (超大属性存储技术) 列的限制和特殊考虑非常重要。本指南将帮助您识别并正确处理复制过程中的 TOAST 列。

## PostgreSQL 中的 TOAST 列是什么？ {#what-are-toast-columns-in-postgresql}

TOAST (超大属性存储技术) 是 PostgreSQL 用于处理大字段值的机制。当一行超过最大行大小（通常为 2KB，但这可能会根据 PostgreSQL 版本和确切设置有所不同）时，PostgreSQL 会自动将大字段值移动到单独的 TOAST 表中，并仅在主表中存储一个指针。

需要注意的是，在变更数据捕获 (CDC) 过程中，未更改的 TOAST 列不会包含在复制流中。如果处理不当，这可能导致数据复制不完整。

在初始加载（快照）期间，所有列的值，包括 TOAST 列，将正确复制，而不考虑它们的大小。本指南中描述的限制主要影响在初始加载后的持续 CDC 过程。

您可以在此处阅读有关 TOAST 及其在 PostgreSQL 中实现的更多信息：https://www.postgresql.org/docs/current/storage-toast.html

## 在表中识别 TOAST 列 {#identifying-toast-columns-in-a-table}

要识别一个表是否具有 TOAST 列，您可以使用以下 SQL 查询：

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

该查询将返回可能被 TOAST 存储的列的名称和数据类型。然而，需要注意的是，此查询仅识别根据其数据类型和存储属性符合 TOAST 存储条件的列。要确定这些列是否实际包含 TOAST 数据，您需要考虑这些列中的值是否超过了大小。数据的实际 TOAST化取决于存储在这些列中的具体内容。

## 确保正确处理 TOAST 列 {#ensuring-proper-handling-of-toast-columns}

为了确保在复制过程中正确处理 TOAST 列，您应该将表的 `REPLICA IDENTITY` 设置为 `FULL`。这告诉 PostgreSQL 在 UPDATE 和 DELETE 操作中将完整的旧行包含在 WAL 中，确保所有列值（包括 TOAST 列）可用于复制。

您可以使用以下 SQL 命令将 `REPLICA IDENTITY` 设置为 `FULL`：

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

有关设置 `REPLICA IDENTITY FULL` 时性能考虑的更多信息，请参考 [这篇博客文章](https://xata.io/blog/replica-identity-full-performance)。

## 当未设置 REPLICA IDENTITY FULL 时的复制行为 {#replication-behavior-when-replica-identity-full-is-not-set}

如果对于具有 TOAST 列的表未设置 `REPLICA IDENTITY FULL`，在复制到 ClickHouse 时，您可能会遇到以下问题：

1. 对于 INSERT 操作，所有列（包括 TOAST 列）将被正确复制。

2. 对于 UPDATE 操作：
   - 如果 TOAST 列未被修改，其值将在 ClickHouse 中显示为 NULL 或空。
   - 如果 TOAST 列被修改，它将被正确复制。

3. 对于 DELETE 操作，TOAST 列的值将在 ClickHouse 中显示为 NULL 或空。

这些行为可能导致 PostgreSQL 源和 ClickHouse 目标之间的数据不一致。因此，对于具有 TOAST 列的表，设置 `REPLICA IDENTITY FULL` 以确保准确和完整的数据复制至关重要。

## 结论 {#conclusion}

正确处理 TOAST 列对于在从 PostgreSQL 复制到 ClickHouse 时维护数据完整性至关重要。通过识别 TOAST 列并设置适当的 `REPLICA IDENTITY`，您可以确保数据准确完整地复制。
