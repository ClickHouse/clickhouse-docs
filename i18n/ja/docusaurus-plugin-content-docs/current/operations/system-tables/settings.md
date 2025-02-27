---
description: "現在のユーザーのセッション設定に関する情報を含むシステムテーブル。"
slug: /operations/system-tables/settings
title: "settings"
keywords: ["システムテーブル", "設定"]
---

現在のユーザーのセッション設定に関する情報を含みます。

カラム：

- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 設定が構成ファイルで明示的に定義されたか、または明示的に変更されたかを示します。
- `description` ([String](../../sql-reference/data-types/string.md)) — 設定の簡単な説明。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最小値（もし制約が設定されている場合は）。設定に最小値がない場合は、[NULL](../../sql-reference/syntax.md#null-literal)を含みます。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最大値（もし制約が設定されている場合は）。設定に最大値がない場合は、[NULL](../../sql-reference/syntax.md#null-literal)を含みます。
- `readonly` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 現在のユーザーが設定を変更できるかどうかを示します：
    - `0` — 現在のユーザーは設定を変更できます。
    - `1` — 現在のユーザーは設定を変更できません。
- `default` ([String](../../sql-reference/data-types/string.md)) — 設定のデフォルト値。
- `is_obsolete` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) - 設定が廃止されているかどうかを示します。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — この機能のサポートレベル。ClickHouseの機能は、開発の現在のステータスとそれを使用する際の期待に応じて、ティアに組織されています。値：
    - `'Production'` — 機能は安定しており、安全に使用でき、他の**本番**機能との相互作用に問題はありません。
    - `'Beta'` — 機能は安定しており、安全です。他の機能と一緒に使用したときの結果は不明であり、正確性は保証されません。テストとレポートは歓迎されます。
    - `'Experimental'` — 機能は開発中です。開発者とClickHouse愛好者のためのもののみです。この機能は動作する場合もあればしない場合もあり、いつでも削除される可能性があります。
    - `'Obsolete'` — もはやサポートされていません。すでに削除されたか、将来のリリースで削除される予定です。

**例**

次の例では、名前に `min_i` を含む設定についての情報を取得する方法を示します。

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
description: `INSERT` クエリを使用してテーブルに挿入できるブロック内の最小行数を設定します。小さなサイズのブロックは、大きなものに圧縮されます。

可能な値：

- 正の整数。
- 0 — 圧縮を無効にします。
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
description: `INSERT` クエリを使用してテーブルに挿入できるブロック内の最小バイト数を設定します。小さなサイズのブロックは、大きなものに圧縮されます。

可能な値：

- 正の整数。
- 0 — 圧縮を無効にします。
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
description: `INSERT` クエリを使用してテーブルに挿入できるブロック内の最小行数を設定します。小さなサイズのブロックは、大きなものに圧縮されます。この設定は、[マテリアライズドビュ](../../sql-reference/statements/create/view.md)に挿入されるブロックにのみ適用されます。この設定を調整することにより、マテリアライズドビュにプッシュする際のブロック圧縮を制御し、過剰なメモリ使用を回避します。

可能な値：

- 任意の正の整数。
- 0 — 圧縮を無効にします。

**関連情報**

- [min_insert_block_size_rows](#min-insert-block-size-rows)
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
description: `INSERT` クエリを使用してテーブルに挿入できるブロック内の最小バイト数を設定します。小さなサイズのブロックは、大きなものに圧縮されます。この設定は、[マテリアライズドビュ](../../sql-reference/statements/create/view.md)に挿入されるブロックにのみ適用されます。この設定を調整することにより、マテリアライズドビュにプッシュする際のブロック圧縮を制御し、過剰なメモリ使用を回避します。

可能な値：

- 任意の正の整数。
- 0 — 圧縮を無効にします。

**関連情報**

- [min_insert_block_size_bytes](#min-insert-block-size-bytes)
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     0
alias_for:   
is_obsolete: 0
tier:        Production
```

`WHERE changed` の使用は、例えば以下のような状況で便利です：

- 構成ファイルの設定が正しく読み込まれていて、使用されているかどうかを確認するため。
- 現在のセッションで変更された設定。

<!-- -->

``` sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
```

**関連情報**

- [Settings](../../operations/settings/overview#session-settings-intro)
- [クエリの権限](../../operations/settings/permissions-for-queries.md#settings_readonly)
- [設定の制約](../../operations/settings/constraints-on-settings.md)
- [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings) ステートメント
