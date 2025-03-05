---
description: "MergeTreeテーブルの設定に関する情報を含むシステムテーブル。"
slug: /operations/system-tables/merge_tree_settings
title: "system.merge_tree_settings"
keywords: ["システムテーブル", "merge_tree_settings"]
---

`MergeTree`テーブルの設定に関する情報を含みます。

カラム：

- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が明示的にコンフィグで定義されているか、明示的に変更されたかどうか。
- `description` ([String](../../sql-reference/data-types/string.md)) — 設定の説明。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最小値。これは [constraints](/operations/settings/constraints-on-settings) を通じて設定されている場合のみです。この設定に最小値が設定されていない場合、[NULL](/operations/settings/formats#input_format_null_as_default) が含まれます。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最大値。これは [constraints](/operations/settings/constraints-on-settings) を通じて設定されている場合のみです。この設定に最大値が設定されていない場合、[NULL](/operations/settings/formats#input_format_null_as_default) が含まれます。
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 現在のユーザーが設定を変更できるかどうかを示します：
    - `0` — 現在のユーザーは設定を変更できます。
    - `1` — 現在のユーザーは設定を変更できません。
- `type` ([String](../../sql-reference/data-types/string.md)) — 設定の種類（実装に特有の文字列値）。
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 設定が廃止されているかどうかを示します。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — この機能のサポートレベル。ClickHouseの機能は、開発の現在の状況や使用時の期待に応じて異なるティアに整理されます。値：
    - `'Production'` — 機能は安定しており、安全に使用でき、他の **production** 機能との相互作用に問題はありません。
    - `'Beta'` — 機能は安定しており、安全です。他の機能と併用した場合の結果は未知で、正確さは保証されません。テストと報告は歓迎します。
    - `'Experimental'` — 機能は開発中です。開発者やClickHouse愛好者のためにのみ意図されています。この機能は動作する場合もあれば、しない場合もあり、いつでも削除される可能性があります。
    - `'Obsolete'` — もはやサポートされていません。すでに削除されているか、将来のリリースで削除される予定です。

**例**
```sql
SELECT * FROM system.merge_tree_settings LIMIT 4 FORMAT Vertical;
```

```response
行 1:
──────
name:        min_compress_block_size
value:       0
changed:     0
description: グラニュールが書き込まれるとき、保留中の未圧縮データのサイズが指定されたしきい値以上である場合、バッファ内のデータを圧縮します。この設定が未設定の場合、対応するグローバル設定が使用されます。
min:         ____
max:         ____
readonly:    0
type:        UInt64
is_obsolete: 0

行 2:
──────
name:        max_compress_block_size
value:       0
changed:     0
description: 保留中の未圧縮データのサイズが指定されたしきい値以上である場合、バッファ内のデータを圧縮します。現在のグラニュールが完了していなくても、データブロックは圧縮されます。この設定が未設定の場合、対応するグローバル設定が使用されます。
min:         ____
max:         ____
readonly:    0
type:        UInt64
is_obsolete: 0

行 3:
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

行 4:
──────
name:        max_digestion_size_per_segment
value:       268435456
changed:     0
description: GINインデックスを構築するためにセグメントあたり消化する最大バイト数。
min:         ____
max:         ____
readonly:    0
type:        UInt64
is_obsolete: 0

4 行がセットにあります。経過時間: 0.009 秒。
```
