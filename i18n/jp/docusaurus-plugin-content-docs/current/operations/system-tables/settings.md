---
'description': 'System table containing information about session settings for current
  user.'
'keywords':
- 'system table'
- 'settings'
'slug': '/operations/system-tables/settings'
'title': 'system.settings'
---




# system.settings

現在のユーザーのセッション設定に関する情報が含まれています。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が構成で明示的に定義されているか、明示的に変更されたかを示します。
- `description` ([String](../../sql-reference/data-types/string.md)) — 短い設定の説明。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最小値。もし[constraints](/operations/settings/constraints-on-settings)を通じて設定されている場合。設定に最小値がない場合、[NULL](/operations/settings/formats#input_format_null_as_default)を含みます。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最大値。もし[constraints](/operations/settings/constraints-on-settings)を通じて設定されている場合。設定に最大値がない場合、[NULL](/operations/settings/formats#input_format_null_as_default)を含みます。
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 現在のユーザーが設定を変更できるかどうかを示します：
    - `0` — 現在のユーザーが設定を変更できます。
    - `1` — 現在のユーザーが設定を変更できません。
- `default` ([String](../../sql-reference/data-types/string.md)) — 設定のデフォルト値。
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が廃止されているかどうかを示します。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — この機能のサポートレベル。ClickHouseの機能は、開発の現在の状況や使用時に持つべき期待に応じて、ティアに整理されています。値：
    - `'Production'` — 機能は安定しており、安全に使用でき、他の **production** 機能との相互作用に問題はありません。
    - `'Beta'` — 機能は安定しており、安全です。他の機能との組み合わせの結果は不明で、正確性は保証されません。テストと報告は歓迎します。
    - `'Experimental'` — 機能は開発中です。開発者及びClickHouse愛好者のためのものです。この機能は、動作する場合もあれば、しない場合もあり、いつでも削除される可能性があります。
    - `'Obsolete'` — もはやサポートされていません。既に削除されているか、今後のリリースで削除される予定です。

**例**

以下の例は、`min_i` を含む設定に関する情報を取得する方法を示しています。

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
description: `INSERT` クエリによってテーブルに挿入できるブロック内の最小行数を設定します。サイズの小さいブロックは大きいブロックに圧縮されます。

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

Row 2:
──────
name:        min_insert_block_size_bytes
value:       268402944
changed:     0
description: `INSERT` クエリによってテーブルに挿入できるブロック内の最小バイト数を設定します。サイズの小さいブロックは大きいブロックに圧縮されます。

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

Row 3:
──────
name:        min_insert_block_size_rows_for_materialized_views
value:       0
changed:     0
description: `INSERT` クエリによってテーブルに挿入できるブロック内の最小行数を設定します。サイズの小さいブロックは大きいブロックに圧縮されます。この設定は、[materialized view](../../sql-reference/statements/create/view.md) に挿入されるブロックにのみ適用されます。この設定を調整することで、マテリアライズドビューにプッシュする際のブロックの圧縮を管理し、過剰なメモリ使用を避けることができます。

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

Row 4:
──────
name:        min_insert_block_size_bytes_for_materialized_views
value:       0
changed:     0
description: `INSERT` クエリによってテーブルに挿入できるブロック内の最小バイト数を設定します。サイズの小さいブロックは大きいブロックに圧縮されます。この設定は、[materialized view](../../sql-reference/statements/create/view.md) に挿入されるブロックにのみ適用されます。この設定を調整することで、マテリアライズドビューにプッシュする際のブロックの圧縮を管理し、過剰なメモリ使用を避けることができます。

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

`WHERE changed` の使用は、例えば、次のことを確認する際に便利です：

- 構成ファイルで設定が正しくロードされているか、使用されているか。
- 現在のセッションで変更された設定。

<!-- -->

```sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
```

**関連情報**

- [Settings](/operations/system-tables/overview#system-tables-introduction)
- [Permissions for Queries](/operations/settings/permissions-for-queries)
- [Constraints on Settings](../../operations/settings/constraints-on-settings.md)
- [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings) ステートメント
