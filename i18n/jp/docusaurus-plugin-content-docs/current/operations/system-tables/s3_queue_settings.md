---
'description': 'システムテーブルは S3Queue テーブルの設定に関する情報を含んでいます。サーバーバージョン `24.10` から利用可能です。'
'keywords':
- 'system table'
- 's3_queue_settings'
'slug': '/operations/system-tables/s3_queue_settings'
'title': 'system.s3_queue_settings'
'doc_type': 'reference'
---


# system.s3_queue_settings

[S3Queue](../../engines/table-engines/integrations/s3queue.md) テーブルの設定に関する情報を含んでいます。サーバーバージョン `24.10` から利用可能です。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `table` ([String](../../sql-reference/data-types/string.md)) — データベース名。
- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が明示的に構成で定義されたか、または明示的に変更されたかどうか。
- `description` ([String](../../sql-reference/data-types/string.md)) — 設定の説明。
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `ALTER TABLE ... MODIFY SETTING` を介して設定を変更できるかどうかを示します。
  - `0` — 現在のユーザーは設定を変更できます。
  - `1` — 現在のユーザーは設定を変更できません。
- `type` ([String](../../sql-reference/data-types/string.md)) — 設定のタイプ（実装固有の文字列値）。
