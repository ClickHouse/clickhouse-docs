---
'description': 'システムテーブルは、現在のユーザーのセッション設定に関する情報を含んでいます。'
'keywords':
- 'system table'
- 'settings'
'slug': '/operations/system-tables/settings'
'title': 'system.settings'
'doc_type': 'reference'
---


# system.settings

現在のユーザーのセッション設定に関する情報が含まれています。

Columns:

- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が構成ファイルで明示的に定義されているか、明示的に変更されたかを示します。
- `description` ([String](../../sql-reference/data-types/string.md)) — 短い設定の説明。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最小値。もし [constraints](/operations/settings/constraints-on-settings) を介して設定されている場合。設定に最小値がない場合、[NULL](/operations/settings/formats#input_format_null_as_default) を含みます。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最大値。もし [constraints](/operations/settings/constraints-on-settings) を介して設定されている場合。設定に最大値がない場合、[NULL](/operations/settings/formats#input_format_null_as_default) を含みます。
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 現在のユーザーが設定を変更できるかどうかを示します：
  - `0` — 現在のユーザーは設定を変更できます。
  - `1` — 現在のユーザーは設定を変更できません。
- `default` ([String](../../sql-reference/data-types/string.md)) — 設定のデフォルト値。
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が廃止されているかどうかを示します。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — この機能のサポートレベル。ClickHouseの機能は、開発の進捗や使用時の期待に応じて、異なるティアに整理されています。値：
  - `'Production'` — 機能は安定しており、安全に使用でき、他の **production** 機能と相互作用する際に問題はありません。
  - `'Beta'` — 機能は安定しており、安全です。他の機能と一緒に使用した場合の結果は不明であり、正確性は保証されていません。テストと報告は歓迎します。
  - `'Experimental'` — 機能は開発中です。開発者やClickHouseの愛好者向けにのみ意図されています。この機能は動作する場合もあれば、しない場合もあり、いつでも削除される可能性があります。
  - `'Obsolete'` — もはやサポートされていません。既に削除されたか、将来のリリースで削除される予定です。

**例**

以下の例では、名前に `min_i` を含む設定に関する情報を取得する方法を示します。

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

`WHERE changed` の使用は、例えば以下の確認を行いたい場合に便利です：

- 構成ファイルの設定が正しくロードされ、使用されているかどうか。
- 現在のセッションで変更された設定。

<!-- -->

```sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
```

**関連情報**

- [Settings](/operations/system-tables/overview#system-tables-introduction)
- [Permissions for Queries](/operations/settings/permissions-for-queries)
- [Constraints on Settings](../../operations/settings/constraints-on-settings.md)
- [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings) 文
