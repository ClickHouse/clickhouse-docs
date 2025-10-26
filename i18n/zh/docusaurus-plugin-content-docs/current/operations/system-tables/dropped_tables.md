---
'description': '系统表，包含有关执行 DROP TABLE 的表的信息，但尚未进行数据清理'
'keywords':
- 'system table'
- 'dropped_tables'
'slug': '/operations/system-tables/dropped_tables'
'title': 'system.dropped_tables'
'doc_type': 'reference'
---

包含有关已执行 DROP TABLE 操作但尚未进行数据清理的表的信息。

列：

- `index` ([UInt32](../../sql-reference/data-types/int-uint.md)) — marked_dropped_tables 队列中的索引。
- `database` ([String](../../sql-reference/data-types/string.md)) — 数据库。
- `table` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 表的 uuid。
- `engine` ([String](../../sql-reference/data-types/string.md)) — 表的引擎名称。
- `metadata_dropped_path` ([String](../../sql-reference/data-types/string.md)) — 在 metadata_dropped 目录中表元数据文件的路径。
- `table_dropped_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 下次计划删除表数据的时间。通常是表被删除时加上 `database_atomic_delay_before_drop_table_sec`。

**示例**

以下示例展示了如何获取有关 `dropped_tables` 的信息。

```sql
SELECT *
FROM system.dropped_tables\G
```

```text
Row 1:
──────
index:                 0
database:              default
table:                 test
uuid:                  03141bb2-e97a-4d7c-a172-95cc066bb3bd
engine:                MergeTree
metadata_dropped_path: /data/ClickHouse/build/programs/data/metadata_dropped/default.test.03141bb2-e97a-4d7c-a172-95cc066bb3bd.sql
table_dropped_time:    2023-03-16 23:43:31
```
