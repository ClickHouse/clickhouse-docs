---
description: '現在のユーザーのセッション設定情報を含む system テーブル。'
keywords: ['system テーブル', '設定']
slug: /operations/system-tables/settings
title: 'system.settings'
doc_type: 'reference'
---

# system.settings {#systemsettings}

現在のユーザーのセッション設定に関する情報を含みます。

列:

* `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
* `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
* `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が構成ファイルで明示的に定義されたか、または明示的に変更されたかどうかを示します。
* `description` ([String](../../sql-reference/data-types/string.md)) — 設定の簡潔な説明。
* `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — この設定に対して [constraints](/operations/settings/constraints-on-settings) によって最小値が設定されている場合、その最小値。設定に最小値がない場合は [NULL](/operations/settings/formats#input_format_null_as_default) を含みます。
* `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — この設定に対して [constraints](/operations/settings/constraints-on-settings) によって最大値が設定されている場合、その最大値。設定に最大値がない場合は [NULL](/operations/settings/formats#input_format_null_as_default) を含みます。
* `disallowed_values` ([Array](/sql-reference/data-types/array)([String](../../sql-reference/data-types/string.md))) — 許可されない値の一覧。
* `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 現在のユーザーが設定を変更できるかどうかを示します:
  * `0` — 現在のユーザーは設定を変更できます。
  * `1` — 現在のユーザーは設定を変更できません。
* `default` ([String](../../sql-reference/data-types/string.md)) — 設定のデフォルト値。
* `alias_for` ([String](../../sql-reference/data-types/string.md)) — この設定が他の設定のエイリアスである場合、その元の設定名。
* `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 設定が廃止済みかどうかを示します。
* `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — この機能のサポートレベル。ClickHouse の機能は、その開発の現在の状況および使用時に期待できる安定性に応じて階層化されています。値:
  * `'Production'` — 機能は安定しており、安全に使用でき、他の **本番** 機能との相互作用にも問題がありません。
  * `'Beta'` — 機能は安定しており安全です。他の機能と組み合わせて使用した場合の結果は不明であり、正しさは保証されません。テストおよびレポートを歓迎します。
  * `'Experimental'` — 機能は開発中です。開発者および ClickHouse の愛好家のみを対象としています。機能が動作するかどうかは不明であり、いつでも削除される可能性があります。
  * `'Obsolete'` — もはやサポートされていません。すでに削除されたか、今後のリリースで削除される予定です。

**例**

次の例は、名前に `min_i` を含む設定に関する情報を取得する方法を示しています。

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
description: Sets the minimum number of rows in the block that can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones.

Possible values:

- Positive integer.
- 0 — Squashing disabled.
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
description: Sets the minimum number of bytes in the block which can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones.

Possible values:

- Positive integer.
- 0 — Squashing disabled.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     268402944
alias_for:   
is_obsolete: 0
tier:        Production

Row 3:
──────
name:        min_insert_block_size_rows_for_materialized_views
value:       0
changed:     0
description: Sets the minimum number of rows in the block which can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones. This setting is applied only for blocks inserted into [materialized view](../../sql-reference/statements/create/view.md). By adjusting this setting, you control blocks squashing while pushing to materialized view and avoid excessive memory usage.

Possible values:

- Any positive integer.
- 0 — Squashing disabled.

**See Also**

- [min_insert_block_size_rows](/operations/settings/settings#min_insert_block_size_rows)
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     0
alias_for:   
is_obsolete: 0
tier:        Production

Row 4:
──────
name:        min_insert_block_size_bytes_for_materialized_views
value:       0
changed:     0
description: Sets the minimum number of bytes in the block which can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones. This setting is applied only for blocks inserted into [materialized view](../../sql-reference/statements/create/view.md). By adjusting this setting, you control blocks squashing while pushing to materialized view and avoid excessive memory usage.

Possible values:

- Any positive integer.
- 0 — Squashing disabled.

**See also**

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

`WHERE changed` は、例えば以下を確認する際に有用です：

- 設定ファイルの設定が正しく読み込まれ、使用されているか
- 現在のセッションで変更された設定

<!-- -->

```sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
````

**関連項目**

* [設定](/operations/system-tables/overview#system-tables-introduction)
* [クエリの権限](/operations/settings/permissions-for-queries)
* [設定の制約](../../operations/settings/constraints-on-settings.md)
* [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings) ステートメント
