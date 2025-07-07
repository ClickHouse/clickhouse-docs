---
'description': 'System table containing information about tables that drop table has
  been executed on but for which data cleanup has not yet been performed'
'keywords':
- 'system table'
- 'dropped_tables'
'slug': '/operations/system-tables/dropped_tables'
'title': 'system.dropped_tables'
---



Contains information about tables that drop table has been executed on but for which data cleanup has not yet been performed.

Columns:

- `index` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マークされた削除テーブルキュー内のインデックス。
- `database` ([String](../../sql-reference/data-types/string.md)) — データベース。
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — テーブルのUUID。
- `engine` ([String](../../sql-reference/data-types/string.md)) — テーブルエンジン名。
- `metadata_dropped_path` ([String](../../sql-reference/data-types/string.md)) — metadata_droppedディレクトリ内のテーブルのメタデータファイルのパス。
- `table_dropped_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — テーブルのデータが削除される次の試行が予定されている時間。通常、テーブルが削除されたときに追加される `database_atomic_delay_before_drop_table_sec` によってテーブルの削除時間が決定されます。

**Example**

The following example shows how to get information about `dropped_tables`.

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
