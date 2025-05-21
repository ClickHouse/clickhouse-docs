---
'description': '系统表，包含关于MergeTree表设置的信息。'
'keywords':
- 'system table'
- 'merge_tree_settings'
'slug': '/operations/system-tables/merge_tree_settings'
'title': '系统.merge_tree_settings'
---




# system.merge_tree_settings

包含有关 `MergeTree` 表设置的信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 设置名称。
- `value` ([String](../../sql-reference/data-types/string.md)) — 设置值。
- `default` ([String](../../sql-reference/data-types/string.md)) — 设置默认值。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 设置是否在配置中显式定义或显式更改。
- `description` ([String](../../sql-reference/data-types/string.md)) — 设置描述。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置的最小值，如果通过 [constraints](/operations/settings/constraints-on-settings) 设置了最小值。如果设置没有最小值，则包含 [NULL](/operations/settings/formats#input_format_null_as_default)。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置的最大值，如果通过 [constraints](/operations/settings/constraints-on-settings) 设置了最大值。如果设置没有最大值，则包含 [NULL](/operations/settings/formats#input_format_null_as_default)。
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示当前用户是否可以更改设置：
    - `0` — 当前用户可以更改设置。
    - `1` — 当前用户无法更改设置。
- `type` ([String](../../sql-reference/data-types/string.md)) — 设置类型（特定实现的字符串值）。
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 显示设置是否过时。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — 此功能的支持级别。ClickHouse 功能按级别组织，具体取决于其开发的当前状态和使用时的预期。值：
    - `'Production'` — 功能稳定，安全使用，并且与其他 **生产** 功能的交互没有问题。
    - `'Beta'` — 功能稳定且安全。与其他功能一起使用的结果未知，正确性无法保证。欢迎测试和反馈。
    - `'Experimental'` — 功能正在开发中。仅供开发人员和 ClickHouse 爱好者使用。该功能可能工作或可能无法工作，并可能随时被移除。
    - `'Obsolete'` — 不再支持。要么已经被移除，要么将在未来的版本中被移除。

**示例**
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

Row 4:
──────
name:        max_digestion_size_per_segment
value:       268435456
default:     268435456
changed:     0
description: Max number of bytes to digest per segment to build GIN index.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

4 rows in set. Elapsed: 0.001 sec. 
```
