---
description: '包含有关 MergeTree 表设置的信息的系统表。'
slug: /operations/system-tables/merge_tree_settings
title: 'system.merge_tree_settings'
keywords: ['system table', 'merge_tree_settings']
---

包含有关 `MergeTree` 表设置的信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 设置名称。
- `value` ([String](../../sql-reference/data-types/string.md)) — 设置值。
- `default` ([String](../../sql-reference/data-types/string.md)) — 设置默认值。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 设置是否在配置中显式定义或显式更改。
- `description` ([String](../../sql-reference/data-types/string.md)) — 设置描述。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置的最小值，如果通过 [constraints](/operations/settings/constraints-on-settings) 设置了最小值。如果设置没有最小值，则包含 [NULL](/operations/settings/formats#input_format_null_as_default)。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置的最大值，如果通过 [constraints](/operations/settings/constraints-on-settings) 设置了最大值。如果设置没有最大值，则包含 [NULL](/operations/settings/formats#input_format_null_as_default)。
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示当前用户是否可以更改该设置：
    - `0` — 当前用户可以更改该设置。
    - `1` — 当前用户无法更改该设置。
- `type` ([String](../../sql-reference/data-types/string.md)) — 设置类型（特定于实现的字符串值）。
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 显示设置是否已过时。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — 此功能的支持级别。ClickHouse 功能按级别组织，具体取决于其开发的当前状态以及使用时可能会有的期望。值：
    - `'Production'` — 该功能稳定、安全使用，并且与其他 **生产** 功能的交互没有问题。
    - `'Beta'` — 该功能稳定且安全。与其他功能一起使用的结果未知，并且不保证正确性。欢迎测试和报告。
    - `'Experimental'` — 该功能正在开发中。仅面向开发人员和 ClickHouse 爱好者。该功能可能会或可能不会工作，并且可能随时被删除。
    - `'Obsolete'` — 不再受支持。要么它已被删除，要么将在未来发布中删除。

**示例**
```sql
SELECT * FROM system.merge_tree_settings LIMIT 4 FORMAT Vertical;
```

```response
SELECT *
FROM system.merge_tree_settings
LIMIT 4
FORMAT Vertical

查询ID: 2580779c-776e-465f-a90c-4b7630d0bb70

行 1:
──────
name:        min_compress_block_size
value:       0
default:     0
changed:     0
description: 当 granule 被写入时，当待处理的未压缩数据的大小大于或等于指定阈值时，压缩缓冲区中的数据。如果未设置此选项，则使用相应的全局设置。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

行 2:
──────
name:        max_compress_block_size
value:       0
default:     0
changed:     0
description: 如果待处理的未压缩数据的大小大于或等于指定阈值，则压缩缓冲区中的未压缩数据。数据块将会被压缩，即使当前 granule 尚未完成。如果未设置此选项，则使用相应的全局设置。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

行 3:
──────
name:        index_granularity
value:       8192
default:     8192
changed:     0
description: 对应一个主键值的行数。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

行 4:
──────
name:        max_digestion_size_per_segment
value:       268435456
default:     268435456
changed:     0
description: 构建 GIN 索引时，每个分段最大要处理的字节数。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

共有 4 行。耗时：0.001 秒。 
```
