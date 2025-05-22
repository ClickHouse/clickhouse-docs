---
'description': '系统冰山快照历史'
'keywords':
- 'system iceberg_history'
'slug': '/operations/system-tables/iceberg_history'
'title': 'system.iceberg_history'
---


# system.iceberg_history

包含冰山表的快照历史记录。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。

- `name` ([String](../../sql-reference/data-types/string.md)) — 表名称。

- `made_current_at` ([DateTime](../../sql-reference/data-types/uuid.md)) — 快照成为当前快照的时间。

- `snapshot_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 快照ID。

- `parent_id` ([Int64](../../sql-reference/data-types/int-uint.md)) - 父快照的快照ID。

- `is_current_ancestor` ([Bool](../../sql-reference/data-types/boolean.md)) - 指示此快照是否为当前快照的祖先的标志。
