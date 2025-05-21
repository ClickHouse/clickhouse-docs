---
description: 'S3Queueテーブルの設定に関する情報を含むシステムテーブルです。
  サーバーバージョン`24.10`から使用可能です。'
keywords: ['system table', 's3_queue_settings']
slug: /operations/system-tables/s3_queue_settings
title: 'system.s3_queue_settings'
---


# system.s3_queue_settings

[S3Queue](../../engines/table-engines/integrations/s3queue.md)テーブルの設定に関する情報を含みます。サーバーバージョン`24.10`から使用可能です。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `table` ([String](../../sql-reference/data-types/string.md)) — データベース名。
- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が設定ファイルで明示的に定義されたか、明示的に変更されたかどうか。
- `description` ([String](../../sql-reference/data-types/string.md)) — 設定の説明。
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が`ALTER TABLE ... MODIFY SETTING`によって変更可能かどうかを示します。
    - `0` — 現在のユーザーは設定を変更できます。
    - `1` — 現在のユーザーは設定を変更できません。
- `type` ([String](../../sql-reference/data-types/string.md)) — 設定の種類（実装固有の文字列値）。
