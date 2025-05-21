---
description: 'ClickHouseユーザーアカウントに付与された権限を示すシステムテーブル。'
keywords: ['システムテーブル', 'グラント']
slug: /operations/system-tables/grants
title: 'system.grants'
---

ClickHouseユーザーアカウントに付与された権限。

カラム:
- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザー名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザーアカウントに割り当てられたロール。

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ClickHouseユーザーアカウントのアクセスパラメータ。

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — データベースの名前。

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — テーブルの名前。

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — アクセスが付与されたカラムの名前。

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。いくつかの権限が取り消されたかどうかを示します。可能な値:
  - `0` — 行はグラントを説明しています。
  - `1` — 行は部分的な取り消しを説明しています。

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 権限が `WITH GRANT OPTION` で付与されています。詳細は [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax) を参照してください。
