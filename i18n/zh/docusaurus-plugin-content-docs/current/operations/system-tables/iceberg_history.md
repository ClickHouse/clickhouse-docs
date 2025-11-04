---
'description': '系统 iceberg 快照历史'
'keywords':
- 'system iceberg_history'
'slug': '/operations/system-tables/iceberg_history'
'title': 'system.iceberg_history'
'doc_type': 'reference'
---


# system.iceberg_history

这个系统表包含了存在于 ClickHouse 中的 Iceberg 表的快照历史。如果您在 ClickHouse 中没有任何 Iceberg 表，则该表将为空。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。

- `table` ([String](../../sql-reference/data-types/string.md)) — 表名。

- `made_current_at` ([DateTime](../../sql-reference/data-types/uuid.md)) — 快照变为当前快照的时间。

- `snapshot_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 快照 ID。

- `parent_id` ([Int64](../../sql-reference/data-types/int-uint.md)) - 父快照的快照 ID。

- `is_current_ancestor` ([Bool](../../sql-reference/data-types/boolean.md)) - 指示该快照是否为当前快照的祖先的标志。
