---
'description': 'ClickHouseユーザーアカウントに付与された特権を示すシステムテーブル。'
'keywords':
- 'system table'
- 'grants'
'slug': '/operations/system-tables/grants'
'title': 'system.grants'
---



ClickHouse ユーザーアカウントに付与された権限。

カラム:
- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザー名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザーアカウントに割り当てられた役割。

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ClickHouse ユーザーアカウントのアクセスパラメータ。

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — データベースの名前。

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — テーブルの名前。

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — アクセスが付与されるカラムの名前。

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。いくつかの権限が取り消されたかどうかを示します。可能な値:
  - `0` — 行は付与を表します。
  - `1` — 行は部分的な取り消しを表します。

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 権限は `WITH GRANT OPTION` で付与されます。詳細は [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax) を参照してください。
