---
'description': 'System iceberg snapshot history'
'keywords':
- 'system iceberg_history'
'slug': '/operations/system-tables/iceberg_history'
'title': 'system.iceberg_history'
---




# system.iceberg_history

アイスバーグテーブルのスナップショット履歴を含みます。

カラム：

- `database` ([String](../../sql-reference/data-types/string.md)) — テーブルがあるデータベースの名前。

- `name` ([String](../../sql-reference/data-types/string.md)) — テーブル名。

- `made_current_at` ([DateTime](../../sql-reference/data-types/uuid.md)) — スナップショットが最新スナップショットになった時間。

- `snapshot_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — スナップショットID。

- `parent_id` ([Int64](../../sql-reference/data-types/int-uint.md)) - 親スナップショットのスナップショットID。

- `is_current_ancestor` ([Bool](../../sql-reference/data-types/boolean.md)) - このスナップショットが現在のスナップショットの祖先であるかどうかを示すフラグ。
