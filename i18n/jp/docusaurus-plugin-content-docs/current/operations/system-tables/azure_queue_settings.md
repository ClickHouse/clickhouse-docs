---
'description': 'システムテーブルは、AzureQueue テーブルの設定情報を含んでいます。サーバー バージョン `24.10` から使用可能です。'
'keywords':
- 'system table'
- 'azure_queue_settings'
'slug': '/operations/system-tables/azure_queue_settings'
'title': 'system.azure_queue_settings'
'doc_type': 'reference'
---

この情報は、[AzureQueue](../../engines/table-engines/integrations/azure-queue.md) テーブルの設定に関するものです。
`24.10` サーバーバージョンから利用可能です。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `table` ([String](../../sql-reference/data-types/string.md)) — データベース名。
- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が構成で明示的に定義されたか、明示的に変更されたか。
- `description` ([String](../../sql-reference/data-types/string.md)) — 設定の説明。
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が `ALTER TABLE ... MODIFY SETTING` によって変更可能かどうかを示します。
  - `0` — 現在のユーザーは設定を変更できます。
  - `1` — 現在のユーザーは設定を変更できません。
- `type` ([String](../../sql-reference/data-types/string.md)) — 設定の種類（実装に特有の文字列値）。
