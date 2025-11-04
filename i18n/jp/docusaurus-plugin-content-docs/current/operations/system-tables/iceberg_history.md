---
'description': 'システムアイスバーグスナップショットの履歴'
'keywords':
- 'system iceberg_history'
'slug': '/operations/system-tables/iceberg_history'
'title': 'system.iceberg_history'
'doc_type': 'reference'
---


# system.iceberg_history

このシステムテーブルは、ClickHouseに存在するIcebergテーブルのスナップショット履歴を含みます。ClickHouseにIcebergテーブルがない場合、これは空になります。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。

- `made_current_at` ([DateTime](../../sql-reference/data-types/uuid.md)) — スナップショットが現在のスナップショットとして作成された日時。

- `snapshot_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — スナップショットID。

- `parent_id` ([Int64](../../sql-reference/data-types/int-uint.md)) - 親スナップショットのスナップショットID。

- `is_current_ancestor` ([Bool](../../sql-reference/data-types/boolean.md)) - このスナップショットが現在のスナップショットの祖先であるかどうかを示すフラグ。
