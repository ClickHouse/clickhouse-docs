---
'description': '系统表包含有关MergeTree表设置的信息。'
'keywords':
- 'system table'
- 'merge_tree_settings'
'slug': '/operations/system-tables/merge_tree_settings'
'title': 'system.merge_tree_settings'
---


# system.merge_tree_settings

包含有关 `MergeTree` 表设置的信息。

列：

- `name` ([字符串](../../sql-reference/data-types/string.md)) — 设置名称。
- `value` ([字符串](../../sql-reference/data-types/string.md)) — 设置值。
- `default` ([字符串](../../sql-reference/data-types/string.md)) — 设置默认值。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 设置是否在配置中明确指定或明确更改。
- `description` ([字符串](../../sql-reference/data-types/string.md)) — 设置描述。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([字符串](../../sql-reference/data-types/string.md))) — 设置的最小值，如果通过 [constraints](/operations/settings/constraints-on-settings) 设置了值。如果设置没有最小值，则包含 [NULL](/operations/settings/formats#input_format_null_as_default)。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([字符串](../../sql-reference/data-types/string.md))) — 设置的最大值，如果通过 [constraints](/operations/settings/constraints-on-settings) 设置了值。如果设置没有最大值，则包含 [NULL](/operations/settings/formats#input_format_null_as_default)。
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示当前用户是否可以更改该设置：
    - `0` — 当前用户可以更改该设置。
    - `1` — 当前用户无法更改该设置。
- `type` ([字符串](../../sql-reference/data-types/string.md)) — 设置类型（实现特定的字符串值）。
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 显示设置是否已过时。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — 该功能的支持级别。ClickHouse 的功能按层级组织，具体取决于其开发的当前状态和使用时的期望。值：
    - `'Production'` — 该功能稳定、安全可用，并且与其他 **生产** 特性之间没有问题。
    - `'Beta'` — 该功能稳定且安全。与其他特性一起使用的结果未知，且正确性不能保证。欢迎进行测试和报告。
    - `'Experimental'` — 该功能正在开发中。仅适用于开发者和 ClickHouse 爱好者。该功能可能有效也可能无效，并且可能随时被移除。
    - `'Obsolete'` — 不再支持。要么已被移除，要么将在未来版本中被移除。

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
