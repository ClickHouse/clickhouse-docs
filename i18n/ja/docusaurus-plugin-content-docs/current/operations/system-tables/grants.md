---
description: "ClickHouseユーザーアカウントに付与された権限を示すシステムテーブル。"
slug: /operations/system-tables/grants
title: "grants"
keywords: ["システムテーブル", "権限"]
---

ClickHouseユーザーアカウントに付与された権限。

カラム:
- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザー名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザーアカウントに割り当てられたロール。

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ClickHouseユーザーアカウントのアクセスパラメータ。

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — データベースの名前。

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — テーブルの名前。

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — アクセスが付与されたカラムの名前。

- `is_partial_revoke` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 論理値。一部の権限が取り消されたかどうかを示します。可能な値:
  - `0` — 行は付与を説明しています。
  - `1` — 行は一部の取り消しを説明しています。

- `grant_option` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 権限が `WITH GRANT OPTION` として付与されています。詳細は [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax) を参照してください。
