---
description: '包含当前用户会话设置信息的系统表。'
keywords: ['系统表', '设置']
slug: /operations/system-tables/settings
title: 'system.settings'
doc_type: 'reference'
---



# system.settings

包含当前用户会话参数设置信息。

列：

* `name` ([String](../../sql-reference/data-types/string.md)) — 设置名称。
* `value` ([String](../../sql-reference/data-types/string.md)) — 设置值。
* `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 指示该设置是否在配置中被显式定义或被显式更改。
* `description` ([String](../../sql-reference/data-types/string.md)) — 设置的简要说明。
* `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 通过[约束](/operations/settings/constraints-on-settings)为该设置指定的最小值（如果有）。如果设置没有最小值，则为 [NULL](/operations/settings/formats#input_format_null_as_default)。
* `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 通过[约束](/operations/settings/constraints-on-settings)为该设置指定的最大值（如果有）。如果设置没有最大值，则为 [NULL](/operations/settings/formats#input_format_null_as_default)。
* `disallowed_values` ([Array](/sql-reference/data-types/array)([String](../../sql-reference/data-types/string.md))) — 不允许的取值列表。
* `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 指示当前用户是否可以更改该设置：
  * `0` — 当前用户可以更改该设置。
  * `1` — 当前用户不能更改该设置。
* `default` ([String](../../sql-reference/data-types/string.md)) — 设置的默认值。
* `alias_for` ([String](../../sql-reference/data-types/string.md)) — 如果该设置是其他设置的别名，则为原始设置的名称。
* `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 指示该设置是否已废弃。
* `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — 此功能的支持级别。ClickHouse 的功能按层次组织，这些层次会根据当前的开发状态以及用户在使用它们时可以预期的行为而变化。取值：
  * `'Production'` — 功能稳定、安全可用，并且与其他**生产级**功能交互时不存在问题。
  * `'Beta'` — 功能稳定且安全。但与其他功能一起使用时的结果未知，不保证正确性。欢迎测试和反馈。
  * `'Experimental'` — 功能仍在开发中。仅面向开发人员和 ClickHouse 爱好者。该功能可能有效也可能无效，并且可能在任何时候被移除。
  * `'Obsolete'` — 不再受支持。要么已经被移除，要么将在未来版本中移除。

**示例**

下面的示例展示如何获取名称包含 `min_i` 的设置的信息。

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
description: 设置通过 `INSERT` 查询插入表中的数据块的最小行数。较小的数据块将被合并成较大的数据块。

可能的值:

- 正整数。
- 0 — 禁用合并。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     1048449
alias_for:   
is_obsolete: 0
tier:        生产环境

Row 2:
──────
name:        min_insert_block_size_bytes
value:       268402944
changed:     0
description: 设置通过 `INSERT` 查询插入表中的数据块的最小字节数。较小的数据块将被合并成较大的数据块。

可能的值:

- 正整数。
- 0 — 禁用合并。
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     268402944
alias_for:   
is_obsolete: 0
tier:        生产环境
```


Row 3:
──────
name:        min&#95;insert&#95;block&#95;size&#95;rows&#95;for&#95;materialized&#95;views
value:       0
changed:     0
description: 设置可通过 `INSERT` 查询插入到表中的数据块的最小行数。更小的数据块会被合并成更大的数据块。此设置仅对插入到[物化视图](../../sql-reference/statements/create/view.md)中的数据块生效。通过调整此设置，可以在向物化视图写入时控制数据块合并行为，并避免过度的内存使用。

Possible values:

* 任意正整数。
* 0 — 禁用合并。

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
description: 设置可通过 `INSERT` 查询插入到表中的数据块的最小字节数。更小的数据块会被合并成更大的数据块。此设置仅对插入到[物化视图](../../sql-reference/statements/create/view.md)中的数据块生效。通过调整此设置，可以在向物化视图写入时控制数据块合并行为，并避免过度的内存使用。

Possible values:

* 任意正整数。
* 0 — 禁用合并。

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

使用 `WHERE changed` 在以下场景中很有用,例如需要检查:

- 配置文件中的设置是否已正确加载并生效。
- 当前会话中已变更的设置。

<!-- -->

```sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
````

**另请参阅**

* [设置](/operations/system-tables/overview#system-tables-introduction)
* [查询权限](/operations/settings/permissions-for-queries)
* [设置限制](../../operations/settings/constraints-on-settings.md)
* [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings) 语句
