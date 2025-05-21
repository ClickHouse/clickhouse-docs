---
description: 'AzureQueue テーブルの設定に関する情報を含むシステムテーブルです。
  サーバーのバージョン `24.10` から利用可能です。'
keywords: ['system table', 'azure_queue_settings']
slug: /operations/system-tables/azure_queue_settings
title: 'system.azure_queue_settings'
---

[AzureQueue](../../engines/table-engines/integrations/azure-queue.md) テーブルの設定に関する情報を含みます。
サーバーのバージョン `24.10` から利用可能です。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `table` ([String](../../sql-reference/data-types/string.md)) — データベース名。
- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定がコンフィグで明示的に定義されたか、明示的に変更されたか。
- `description` ([String](../../sql-reference/data-types/string.md)) — 設定の説明。
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `ALTER TABLE ... MODIFY SETTING` を介して設定を変更できるかどうかを示します。
    - `0` — 現在のユーザーは設定を変更できます。
    - `1` — 現在のユーザーは設定を変更できません。
- `type` ([String](../../sql-reference/data-types/string.md)) — 設定の種類（実装に特有の文字列値）。
