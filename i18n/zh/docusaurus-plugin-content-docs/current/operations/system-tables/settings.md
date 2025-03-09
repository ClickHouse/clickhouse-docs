---
description: '包含有关当前用户会话设置的信息的系统表。'
slug: /operations/system-tables/settings
title: 'system.settings'
keywords: ['system table', 'settings']
---

包含有关当前用户会话设置的信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 设置名称。
- `value` ([String](../../sql-reference/data-types/string.md)) — 设置值。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 指示设置是否在配置中被明确定义或明确更改。
- `description` ([String](../../sql-reference/data-types/string.md)) — 设置的简短描述。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置的最小值，如果通过 [constraints](/operations/settings/constraints-on-settings) 设置了最小值。如果设置没有最小值，则包含 [NULL](/operations/settings/formats#input_format_null_as_default)。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置的最大值，如果通过 [constraints](/operations/settings/constraints-on-settings) 设置了最大值。如果设置没有最大值，则包含 [NULL](/operations/settings/formats#input_format_null_as_default)。
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 指示当前用户是否可以更改该设置：
    - `0` — 当前用户可以更改该设置。
    - `1` — 当前用户无法更改该设置。
- `default` ([String](../../sql-reference/data-types/string.md)) — 设置的默认值。
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 指示设置是否已过时。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — 此功能的支持级别。ClickHouse 的功能按级别组织，级别因其开发的当前状态和使用时的预期而异。值：
    - `'Production'` — 该功能是稳定的，安全使用，并且与其他 **生产** 功能之间没有问题。
    - `'Beta'` — 该功能是稳定和安全的。与其他功能一起使用的结果未知，正确性无法保证。欢迎进行测试和反馈。
    - `'Experimental'` — 该功能正在开发中。仅面向开发者和 ClickHouse 爱好者。该功能可能正常工作，也可能不工作，随时可能被移除。
    - `'Obsolete'` — 不再支持。要么已经被移除，要么将在未来的版本中被移除。

**示例**

以下示例演示如何获取名称包含 `min_i` 的设置的信息。

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
description: 设置可以通过 `INSERT` 查询插入表的块中的行数的最小值。较小的块被合并成更大的块。

可能的值：

- 正整数。
- 0 — 禁用合并。
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
description: 设置可通过 `INSERT` 查询插入表的块中的字节数的最小值。较小的块被合并成更大的块。

可能的值：

- 正整数。
- 0 — 禁用合并。
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
description: 设置可以通过 `INSERT` 查询插入到表的块中的行数的最小值。较小的块被合并成更大的块。此设置仅适用于插入到 [物化视图](../../sql-reference/statements/create/view.md) 的块。通过调整此设置，您可以控制推送到物化视图时的块合并，避免过度使用内存。

可能的值：

- 任何正整数。
- 0 — 禁用合并。

**另见**

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
description: 设置可通过 `INSERT` 查询插入到表的块中的字节数的最小值。较小的块被合并成更大的块。此设置仅适用于插入到 [物化视图](../../sql-reference/statements/create/view.md) 的块。通过调整此设置，您可以控制推送到物化视图时的块合并，避免过度使用内存。

可能的值：

- 任何正整数。
- 0 — 禁用合并。

**另见**

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

使用 `WHERE changed` 可能是有用的，例如，当您想检查：

- 配置文件中的设置是否已正确加载并正在使用。
- 当前会话中更改的设置。

<!-- -->

``` sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
```

**另见**

- [设置](/operations/system-tables/overview#system-tables-introduction)
- [查询的权限](/operations/settings/permissions-for-queries)
- [设置的约束](../../operations/settings/constraints-on-settings.md)
- [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings) 语句
