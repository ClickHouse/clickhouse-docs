---
description: "AzureQueue テーブルの設定に関する情報を含むシステムテーブル。サーバーバージョン `24.10` から利用可能。"
slug: /operations/system-tables/azure_queue_settings
title: "system.azure_queue_settings"
keywords: ["システムテーブル", "azure_queue_settings"]
---

[AzureQueue](../../engines/table-engines/integrations/azure-queue.md) テーブルの設定に関する情報を含みます。
サーバーバージョン `24.10` から利用可能です。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `table` ([String](../../sql-reference/data-types/string.md)) — データベース名。
- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が構成ファイルで明示的に定義されたか、明示的に変更されたか。
- `description` ([String](../../sql-reference/data-types/string.md)) — 設定の説明。
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が `ALTER TABLE ... MODIFY SETTING` を介して変更可能かどうかを示します。
    - `0` — 現在のユーザーは設定を変更できます。
    - `1` — 現在のユーザーは設定を変更できません。
- `type` ([String](../../sql-reference/data-types/string.md)) — 設定のタイプ（実装固有の文字列値）。
