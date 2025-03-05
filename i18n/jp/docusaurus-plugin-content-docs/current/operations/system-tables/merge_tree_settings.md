---
description: "MergeTreeテーブルに関する設定情報を含むシステムテーブル。"
slug: /operations/system-tables/merge_tree_settings
title: "system.merge_tree_settings"
keywords: ["システムテーブル", "merge_tree_settings"]
---

`MergeTree`テーブルに関する設定情報を含みます。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 設定が構成ファイルで明示的に定義されたか、明示的に変更されたかどうか。
- `description` ([String](../../sql-reference/data-types/string.md)) — 設定の説明。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最小値（設定されている場合）。[constraints](../../operations/settings/constraints-on-settings.md#constraints-on-settings)を介して設定されている場合に限ります。最小値が設定されていない場合は、[NULL](/operations/settings/formats#input_format_null_as_default)が含まれます。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最大値（設定されている場合）。[constraints](../../operations/settings/constraints-on-settings.md#constraints-on-settings)を介して設定されている場合に限ります。最大値が設定されていない場合は、[NULL](/operations/settings/formats#input_format_null_as_default)が含まれます。
- `readonly` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 現在のユーザーが設定を変更できるかどうか：
    - `0` — 現在のユーザーは設定を変更できます。
    - `1` — 現在のユーザーは設定を変更できません。
- `type` ([String](../../sql-reference/data-types/string.md)) — 設定のタイプ（実装固有の文字列値）。
- `is_obsolete` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) - 設定が廃止されているかどうかを示します。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — この機能のサポートレベル。ClickHouseの機能は、開発の現在の状況と、使用する際の期待によって異なるティアに編成されています。値：
    - `'Production'` — 機能は安定しており、安全に使用でき、他の**製品**機能と相互作用する際に問題はありません。
    - `'Beta'` — 機能は安定しており、安全です。他の機能と一緒に使用した場合の結果は不明であり、正確性は保証されません。テストと報告を歓迎します。
    - `'Experimental'` — 機能は開発中です。開発者やClickHouse愛好者のためのものです。この機能は動作する場合もあれば、しない場合もあり、いつでも削除される可能性があります。
    - `'Obsolete'` — もはやサポートされていません。すでに削除されているか、将来のリリースで削除される予定です。

**例**
```sql
SELECT * FROM system.merge_tree_settings LIMIT 4 FORMAT Vertical;
```

```response
Row 1:
──────
name:        min_compress_block_size
value:       0
changed:     0
description: グラニュールが書き込まれるとき、保留中の非圧縮データのサイズが指定の閾値以上である場合、バッファ内のデータを圧縮します。この設定が設定されていない場合は、対応するグローバル設定が使用されます。
min:         ____
max:         ____
readonly:    0
type:        UInt64
is_obsolete: 0

Row 2:
──────
name:        max_compress_block_size
value:       0
changed:     0
description: 保留中の非圧縮データのサイズが指定の閾値以上である場合、バッファ内のデータを圧縮します。現在のグラニュールが終了していなくても、データブロックは圧縮されます。この設定が設定されていない場合は、対応するグローバル設定が使用されます。
min:         ____
max:         ____
readonly:    0
type:        UInt64
is_obsolete: 0

Row 3:
──────
name:        index_granularity
value:       8192
changed:     0
description: 1つの主キー値に対応する行数。
min:         ____
max:         ____
readonly:    0
type:        UInt64
is_obsolete: 0

Row 4:
──────
name:        max_digestion_size_per_segment
value:       268435456
changed:     0
description: GINインデックスを構築するためにセグメントごとに消化する最大バイト数。
min:         ____
max:         ____
readonly:    0
type:        UInt64
is_obsolete: 0

4行のセット。経過時間: 0.009秒。
```
