---
description: 'ClickHouse ユーザーアカウントに付与されている権限を表示する system テーブル。'
keywords: ['system table', 'grants']
slug: /operations/system-tables/grants
title: 'system.grants'
doc_type: 'reference'
---

ClickHouse ユーザーアカウントに付与されている権限。

Columns:

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザー名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザーアカウントに割り当てられているロール。

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ClickHouse ユーザーアカウントに対するアクセス種別。

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — データベース名。

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — テーブル名。

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — アクセスが許可されているカラム名。

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。一部の権限が取り消されているかどうかを示します。取り得る値は次のとおりです:
- `0` — 行は付与（grant）を表します。
- `1` — 行は部分的な取り消し（partial revoke）を表します。

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 権限が `WITH GRANT OPTION` 付きで付与されていることを示します。詳細は [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax) を参照してください。