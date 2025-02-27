---
description: "S3Queue テーブルの設定に関する情報を含むシステムテーブル。サーバーバージョン `24.10` から利用可能。"
slug: /operations/system-tables/s3_queue_settings
title: "s3_queue_settings"
keywords: ["システムテーブル", "s3_queue_settings"]
---

[S3Queue](../../engines/table-engines/integrations/s3queue.md) テーブルの設定に関する情報を含みます。サーバーバージョン `24.10` から利用可能です。

カラム:

- `database` ([文字列](../../sql-reference/data-types/string.md)) — テーブル名。
- `table` ([文字列](../../sql-reference/data-types/string.md)) — データベース名。
- `name` ([文字列](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([文字列](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 設定が設定ファイルで明示的に定義されたか、または明示的に変更されたかどうか。
- `description` ([文字列](../../sql-reference/data-types/string.md)) — 設定の説明。
- `alterable` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 設定が `ALTER TABLE ... MODIFY SETTING` を通じて変更できるかどうかを示します。
    - `0` — 現在のユーザーは設定を変更できます。
    - `1` — 現在のユーザーは設定を変更できません。
- `type` ([文字列](../../sql-reference/data-types/string.md)) — 設定タイプ（実装特有の文字列値）。
