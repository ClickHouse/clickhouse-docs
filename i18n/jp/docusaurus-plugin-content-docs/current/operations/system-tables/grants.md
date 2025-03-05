---
description: "ClickHouse ユーザーアカウントに付与された権限を表示するシステムテーブル。"
slug: /operations/system-tables/grants
title: "system.grants"
keywords: ["システムテーブル", "権限"]
---

ClickHouse ユーザーアカウントに付与された権限。

カラム:
- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザー名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザーアカウントに割り当てられたロール。

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ClickHouse ユーザーアカウントのアクセスパラメータ。

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — データベースの名前。

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — テーブルの名前。

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — アクセスが付与されたカラムの名前。

- `is_partial_revoke` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 論理値。いくつかの権限が取り消されたかどうかを示す。可能な値:
  - `0` — 行は付与を記述しています。
  - `1` — 行は部分的な取り消しを記述しています。

- `grant_option` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 権限が `WITH GRANT OPTION` で付与されている、参照: [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax)。
