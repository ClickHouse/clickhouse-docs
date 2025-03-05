---
description: "現在のユーザーのセッション設定に関する情報を含むシステムテーブル。"
slug: /operations/system-tables/settings
title: "system.settings"
keywords: ["system table", "settings"]
---

現在のユーザーのセッション設定に関する情報を含みます。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 設定が設定ファイルで明示的に定義されたか、明示的に変更されたかを示します。
- `description` ([String](../../sql-reference/data-types/string.md)) — 設定の短い説明。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最小値（もし [constraints](../../operations/settings/constraints-on-settings.md#constraints-on-settings) を介して設定されている場合）。設定に最小値がない場合は、[NULL](/operations/settings/formats#input_format_null_as_default)を含みます。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最大値（もし [constraints](../../operations/settings/constraints-on-settings.md#constraints-on-settings) を介して設定されている場合）。設定に最大値がない場合は、[NULL](/operations/settings/formats#input_format_null_as_default)を含みます。
- `readonly` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 現在のユーザーが設定を変更できるかを示します：
    - `0` — 現在のユーザーは設定を変更できます。
    - `1` — 現在のユーザーは設定を変更できません。
- `default` ([String](../../sql-reference/data-types/string.md)) — 設定のデフォルト値。
- `is_obsolete` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) - 設定が廃止されているかどうかを示します。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — この機能のサポートレベル。ClickHouseの機能は、開発の現在の状態とそれを使用する際に持つかもしれない期待に応じて、ティアに整理されています。値：
    - `'Production'` — 機能は安定しており、安全に使用でき、他の**プロダクション**機能と相互作用する際に問題がありません。
    - `'Beta'` — 機能は安定しており、安全です。他の機能と組み合わせた場合の結果は不明であり、正確性は保証されていません。テストや報告は歓迎されます。
    - `'Experimental'` — 機能は開発中です。開発者やClickHouse愛好者向けにのみ意図されています。この機能は動作する場合もあれば、しない場合もあり、いつでも削除される可能性があります。
    - `'Obsolete'` — もはやサポートされていません。すでに削除されたか、将来のリリースで削除される予定です。

**例**

以下の例は、名前に `min_i` を含む設定に関する情報を取得する方法を示しています。

``` sql
SELECT *
FROM system.settings
WHERE name LIKE '%min_insert_block_size_%'
FORMAT Vertical
```

``` text
行 1:
──────
name:        min_insert_block_size_rows
value:       1048449
changed:     0
description: `INSERT` クエリを使用してテーブルに挿入できるブロック内の行の最小数を設定します。小さいサイズのブロックは大きいブロックに圧縮されます。

可能な値:

- 正の整数。
- 0 — 圧縮無効。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     1048449
alias_for:   
is_obsolete: 0
tier:        Production

行 2:
──────
name:        min_insert_block_size_bytes
value:       268402944
changed:     0
description: `INSERT` クエリを使用してテーブルに挿入できるブロック内のバイト数の最小値を設定します。小さいサイズのブロックは大きいブロックに圧縮されます。

可能な値:

- 正の整数。
- 0 — 圧縮無効。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     268402944
alias_for:   
is_obsolete: 0
tier:        Production

行 3:
──────
name:        min_insert_block_size_rows_for_materialized_views
value:       0
changed:     0
description: `INSERT` クエリを使用してテーブルに挿入できるブロック内の行の最小数を設定します。この設定は [materialized view](../../sql-reference/statements/create/view.md) に挿入されるブロックのみに適用されます。この設定を調整することにより、マテリアライズドビューにプッシュする際のブロックの圧縮を制御し、過剰なメモリ使用を避けることができます。

可能な値:

- 任意の正の整数。
- 0 — 圧縮無効。

**関連情報**

- [min_insert_block_size_rows](/operations/settings/settings#min_insert_block_size_rows)
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     0
alias_for:   
is_obsolete: 0
tier:        Production

行 4:
──────
name:        min_insert_block_size_bytes_for_materialized_views
value:       0
changed:     0
description: `INSERT` クエリを使用してテーブルに挿入できるブロック内のバイト数の最小値を設定します。この設定は [materialized view](../../sql-reference/statements/create/view.md) に挿入されるブロックのみに適用されます。この設定を調整することにより、マテリアライズドビューにプッシュする際のブロックの圧縮を制御し、過剰なメモリ使用を避けることができます。

可能な値:

- 任意の正の整数。
- 0 — 圧縮無効。

**関連情報**

- [min_insert_block_size_bytes](/operations/settings/settings#min_insert_block_size_bytes)
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     0
alias_for:   
is_obsolete: 0
tier:        Production
 ```

`WHERE changed` の使用は、次のような場合に便利です：

- 設定ファイルの設定が正しく読み込まれ、使用されているかを確認したい場合。
- 現在のセッションで変更された設定。

<!-- -->

``` sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
```

**関連情報**

- [Settings](/operations/system-tables/overview#system-tables-introduction)
- [Permissions for Queries](../../operations/settings/permissions-for-queries.md#settings_readonly)
- [Constraints on Settings](../../operations/settings/constraints-on-settings.md)
- [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings) ステートメント
