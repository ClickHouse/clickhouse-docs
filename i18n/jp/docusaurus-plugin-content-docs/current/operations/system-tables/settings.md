---
description: '現在のユーザーのセッション設定情報を含むシステムテーブル。'
keywords: ['system table', 'settings']
slug: /operations/system-tables/settings
title: 'system.settings'
doc_type: 'reference'
---



# system.settings

現在のユーザーのセッション設定に関する情報を保持します。

Columns:

* `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
* `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
* `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が設定ファイルで明示的に定義されたか、または明示的に変更されたかどうかを示します。
* `description` ([String](../../sql-reference/data-types/string.md)) — 設定の簡潔な説明。
* `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — [constraints](/operations/settings/constraints-on-settings) によって最小値が設定されている場合、その最小値。設定に最小値がない場合は [NULL](/operations/settings/formats#input_format_null_as_default) を含みます。
* `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — [constraints](/operations/settings/constraints-on-settings) によって最大値が設定されている場合、その最大値。設定に最大値がない場合は [NULL](/operations/settings/formats#input_format_null_as_default) を含みます。
* `disallowed_values` ([Array](/sql-reference/data-types/array)([String](../../sql-reference/data-types/string.md))) — 許可されていない値のリスト。
* `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 現在のユーザーが設定を変更できるかどうかを示します:
  * `0` — 現在のユーザーは設定を変更できます。
  * `1` — 現在のユーザーは設定を変更できません。
* `default` ([String](../../sql-reference/data-types/string.md)) — 設定のデフォルト値。
* `alias_for` ([String](../../sql-reference/data-types/string.md)) — この設定が別の設定のエイリアスである場合、その元の設定名。
* `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 設定が廃止済みかどうかを示します。
* `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — この機能のサポートレベル。ClickHouse の機能は階層 (tier) ごとに整理されており、それぞれは現在の開発状況と、利用時に期待できる内容が異なります。値:
  * `'Production'` — 機能は安定しており、安全に使用でき、他の **本番** 機能との相互作用にも問題がありません。
  * `'Beta'` — 機能は安定しており安全です。他の機能と組み合わせて使用した場合の結果は未知であり、正しさは保証されません。テストとフィードバックを歓迎します。
  * `'Experimental'` — 機能は開発中です。開発者および ClickHouse 愛好家のみを対象とします。機能が動作するかどうかは不明であり、いつでも削除される可能性があります。
  * `'Obsolete'` — もはやサポートされていません。すでに削除されているか、今後のリリースで削除される予定です。

**Example**

次の例は、名前に `min_i` を含む設定に関する情報を取得する方法を示します。

```sql
SELECT *
FROM system.settings
WHERE name LIKE '%min_insert_block_size_%'
FORMAT Vertical
```

```text
Row 1:
──────
name:        min_insert_block_size_rows
value:       1048449
changed:     0
description: `INSERT`クエリでテーブルに挿入可能なブロック内の最小行数を設定します。小さいブロックは大きなブロックに統合されます。

設定可能な値:

- 正の整数。
- 0 — 統合無効。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     1048449
alias_for:   
is_obsolete: 0
tier:        Production

Row 2:
──────
name:        min_insert_block_size_bytes
value:       268402944
changed:     0
description: `INSERT`クエリでテーブルに挿入可能なブロック内の最小バイト数を設定します。小さいブロックは大きなブロックに統合されます。

設定可能な値:

- 正の整数。
- 0 — 統合無効。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     268402944
alias_for:   
is_obsolete: 0
tier:        Production
```


Row 3:
──────
name:        min&#95;insert&#95;block&#95;size&#95;rows&#95;for&#95;materialized&#95;views
value:       0
changed:     0
description: `INSERT` クエリでテーブルに挿入されるブロックの最小行数を設定します。より小さいブロックは、より大きなブロックにまとめられます。この設定は、[マテリアライズドビュー](../../sql-reference/statements/create/view.md) に挿入されるブロックに対してのみ適用されます。この設定を調整することで、マテリアライズドビューへの書き込み時のブロックのまとめ方を制御し、過剰なメモリ使用を回避できます。

Possible values:

* 任意の正の整数。
* 0 — ブロックのまとめを無効化。

**See Also**

* [min&#95;insert&#95;block&#95;size&#95;rows](/operations/settings/settings#min_insert_block_size_rows)
  min:         ᴺᵁᴸᴸ
  max:         ᴺᵁᴸᴸ
  readonly:    0
  type:        UInt64
  default:     0
  alias&#95;for:\
  is&#95;obsolete: 0
  tier:        Production

Row 4:
──────
name:        min&#95;insert&#95;block&#95;size&#95;bytes&#95;for&#95;materialized&#95;views
value:       0
changed:     0
description: `INSERT` クエリでテーブルに挿入されるブロックの最小バイト数を設定します。より小さいブロックは、より大きなブロックにまとめられます。この設定は、[マテリアライズドビュー](../../sql-reference/statements/create/view.md) に挿入されるブロックに対してのみ適用されます。この設定を調整することで、マテリアライズドビューへの書き込み時のブロックのまとめ方を制御し、過剰なメモリ使用を回避できます。

Possible values:

* 任意の正の整数。
* 0 — ブロックのまとめを無効化。

**See also**

* [min&#95;insert&#95;block&#95;size&#95;bytes](/operations/settings/settings#min_insert_block_size_bytes)
  min:         ᴺᵁᴸᴸ
  max:         ᴺᵁᴸᴸ
  readonly:    0
  type:        UInt64
  default:     0
  alias&#95;for:\
  is&#95;obsolete: 0
  tier:        Production

````

`WHERE changed` は、例えば以下を確認する際に有用です:

- 設定ファイルの設定が正しく読み込まれ、使用されているか
- 現在のセッションで変更された設定

<!-- -->

```sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
````

**関連項目**

* [設定](/operations/system-tables/overview#system-tables-introduction)
* [クエリに対する権限](/operations/settings/permissions-for-queries)
* [設定の制約](../../operations/settings/constraints-on-settings.md)
* [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings) ステートメント
