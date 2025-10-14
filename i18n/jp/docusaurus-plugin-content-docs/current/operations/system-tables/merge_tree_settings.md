---
'description': 'システムテーブルは、MergeTree テーブルの設定に関する情報を含みます。'
'keywords':
- 'system table'
- 'merge_tree_settings'
'slug': '/operations/system-tables/merge_tree_settings'
'title': 'system.merge_tree_settings'
'doc_type': 'reference'
---


# system.merge_tree_settings

`MergeTree` テーブルの設定に関する情報を含みます。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — 設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — 設定値。
- `default` ([String](../../sql-reference/data-types/string.md)) — 設定のデフォルト値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が明示的に構成で定義されたか、明示的に変更されたか。
- `description` ([String](../../sql-reference/data-types/string.md)) — 設定の説明。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最小値、[constraints](/operations/settings/constraints-on-settings)を介して設定されている場合。設定に最小値が設定されていない場合、[NULL](/operations/settings/formats#input_format_null_as_default)が含まれます。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最大値、[constraints](/operations/settings/constraints-on-settings)を介して設定されている場合。設定に最大値が設定されていない場合、[NULL](/operations/settings/formats#input_format_null_as_default)が含まれます。
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 現在のユーザーが設定を変更できるかどうかを示します:
  - `0` — 現在のユーザーは設定を変更できます。
  - `1` — 現在のユーザーは設定を変更できません。
- `type` ([String](../../sql-reference/data-types/string.md)) — 設定の種類 (実装特有の文字列値)。
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 設定が廃止されているかどうかを示します。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — この機能のサポートレベル。ClickHouse の機能は、現在の開発状況や使用時の期待に応じて異なるティアに整理されています。値:
  - `'Production'` — 機能は安定しており、安全に使用でき、他の **production** 機能との相互作用に問題はありません。
  - `'Beta'` — 機能は安定しており、安全です。他の機能と一緒に使用した場合の結果は不明で、正確性は保証されません。テストおよびレポートは歓迎されます。
  - `'Experimental'` — 機能は開発中です。開発者や ClickHouse 愛好者向けにのみ意図されています。機能は機能する場合もあれば、しない場合もあり、いつでも削除される可能性があります。
  - `'Obsolete'` — もはやサポートされていません。すでに削除されているか、今後のリリースで削除される予定です。

**例**
```sql
SELECT * FROM system.merge_tree_settings LIMIT 3 FORMAT Vertical;
```

```response
SELECT *
FROM system.merge_tree_settings
LIMIT 3
FORMAT Vertical

Query id: 2580779c-776e-465f-a90c-4b7630d0bb70

Row 1:
──────
name:        min_compress_block_size
value:       0
default:     0
changed:     0
description: When granule is written, compress the data in buffer if the size of pending uncompressed data is larger or equal than the specified threshold. If this setting is not set, the corresponding global setting is used.
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
description: Compress the pending uncompressed data in buffer if its size is larger or equal than the specified threshold. Block of data will be compressed even if the current granule is not finished. If this setting is not set, the corresponding global setting is used.
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
description: How many rows correspond to one primary key value.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

3 rows in set. Elapsed: 0.001 sec. 
```
