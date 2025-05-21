---
description: 'MergeTree テーブルの設定に関する情報を含むシステムテーブルです。'
keywords: ['system table', 'merge_tree_settings']
slug: /operations/system-tables/merge_tree_settings
title: 'system.merge_tree_settings'
---


# system.merge_tree_settings

`MergeTree` テーブルの設定に関する情報を含みます。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `default` ([String](../../sql-reference/data-types/string.md)) — 設定のデフォルト値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が構成で明示的に定義されているか、明示的に変更されたかどうか。
- `description` ([String](../../sql-reference/data-types/string.md)) — 設定の説明。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最小値。もし [constraints](/operations/settings/constraints-on-settings) によって設定されている場合。設定に最小値がない場合は、[NULL](/operations/settings/formats#input_format_null_as_default)が含まれます。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最大値。もし [constraints](/operations/settings/constraints-on-settings) によって設定されている場合。設定に最大値がない場合は、[NULL](/operations/settings/formats#input_format_null_as_default)が含まれます。
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 現在のユーザーが設定を変更できるかどうかを示します:
    - `0` — 現在のユーザーは設定を変更できます。
    - `1` — 現在のユーザーは設定を変更できません。
- `type` ([String](../../sql-reference/data-types/string.md)) — 設定のタイプ（実装特有の文字列値）。
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 設定が廃止されているかどうかを示します。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — この機能のサポートレベル。ClickHouse の機能は、開発の現在の状態と使用時の期待に応じて複数のティアに整理されています。値:
    - `'Production'` — 機能は安定しており、安全に使用でき、他の **production** 機能と相互作用する際に問題はありません。
    - `'Beta'` — 機能は安定しており、安全です。他の機能と一緒に使用する結果は不明であり、正確性は保証されません。テストと報告は歓迎です。
    - `'Experimental'` — 機能は開発中です。開発者や ClickHouse の愛好者向けのみです。この機能は動作する場合もあれば、しない場合もあり、いつでも削除される可能性があります。
    - `'Obsolete'` — もはやサポートされていません。すでに削除されているか、今後のリリースで削除される予定です。

**例**
```sql
SELECT * FROM system.merge_tree_settings LIMIT 4 FORMAT Vertical;
```

```response
SELECT *
FROM system.merge_tree_settings
LIMIT 4
FORMAT Vertical

Query id: 2580779c-776e-465f-a90c-4b7630d0bb70

Row 1:
──────
name:        min_compress_block_size
value:       0
default:     0
changed:     0
description: グラニュールが書き込まれるとき、保留中の未圧縮データのサイズが指定されたしきい値以上または等しい場合、バッファ内のデータを圧縮します。この設定が設定されていない場合、対応するグローバル設定が使用されます。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

Row 2:
──────
name:        max_compress_block_size
value:       0
default:     0
changed:     0
description: 保留中の未圧縮データのサイズが指定されたしきい値以上または等しい場合、バッファ内のデータを圧縮します。現在のグラニュールが終了していなくてもデータのブロックは圧縮されます。この設定が設定されていない場合、対応するグローバル設定が使用されます。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

Row 3:
──────
name:        index_granularity
value:       8192
default:     8192
changed:     0
description: 1つの主キー値に対応する行の数。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

Row 4:
──────
name:        max_digestion_size_per_segment
value:       268435456
default:     268435456
changed:     0
description: GIN インデックスを構築するためのセグメントあたりの最大バイト数。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

4 行がセットに含まれています。経過時間: 0.001 秒。 
```
