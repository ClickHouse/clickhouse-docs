
# system.settings

包含当前用户的会话设置的信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 设置名称。
- `value` ([String](../../sql-reference/data-types/string.md)) — 设置值。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示设置是否在配置中明确定义或被明确更改。
- `description` ([String](../../sql-reference/data-types/string.md)) — 设置的简短描述。
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置的最小值，如果通过 [constraints](/operations/settings/constraints-on-settings) 设置了最小值。 如果设置没有最小值，包含 [NULL](/operations/settings/formats#input_format_null_as_default)。
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置的最大值，如果通过 [constraints](/operations/settings/constraints-on-settings) 设置了最大值。 如果设置没有最大值，包含 [NULL](/operations/settings/formats#input_format_null_as_default)。
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示当前用户是否可以更改该设置：
    - `0` — 当前用户可以更改该设置。
    - `1` — 当前用户无法更改该设置。
- `default` ([String](../../sql-reference/data-types/string.md)) — 设置的默认值。
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 显示该设置是否过时。
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — 此功能的支持级别。 ClickHouse 功能按层次结构组织，具体取决于其开发的当前状态以及使用时可能的期望。值：
    - `'Production'` — 该功能稳定、安全使用，并且与其他 **production** 功能交互时没有问题。
    - `'Beta'` — 该功能稳定且安全。 与其他功能一起使用的结果未知，且正确性无法保证。欢迎测试和反馈。
    - `'Experimental'` — 该功能正在开发中。仅供开发人员和 ClickHouse 爱好者使用。该功能可能会或可能不会工作，并且可能随时被删除。
    - `'Obsolete'` — 不再支持。 可能已经被删除，或将在未来版本中删除。

**示例**

以下示例演示如何获取名称包含 `min_i` 的设置的信息。

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

使用 `WHERE changed` 可能会很有用，例如，当您想检查：

- 配置文件中的设置是否正确加载并被使用。
- 当前会话中更改的设置。

<!-- -->

```sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
```

**另请参见**

- [Settings](/operations/system-tables/overview#system-tables-introduction)
- [Permissions for Queries](/operations/settings/permissions-for-queries)
- [Constraints on Settings](../../operations/settings/constraints-on-settings.md)
- [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings) 语句
