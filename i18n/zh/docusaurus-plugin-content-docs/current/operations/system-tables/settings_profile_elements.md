---
'description': '系统表，描述设置配置文件的内容：约束、角色和适用该设置的用户，父设置配置文件。'
'keywords':
- 'system table'
- 'settings_profile_elements'
'slug': '/operations/system-tables/settings_profile_elements'
'title': 'system.settings_profile_elements'
---


# system.settings_profile_elements

描述设置配置文件的内容：

- 约束。
- 适用该设置的角色和用户。
- 父设置配置文件。

列：
- `profile_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置配置文件名称。

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 用户名称。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 角色名称。

- `index` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 设置配置文件元素的顺序编号。

- `setting_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置名称。

- `value` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置值。

- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置的最小值。 如果未设置则为 `NULL`。

- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 设置的最大值。 如果未设置则为 NULL。

- `writability` ([Nullable](../../sql-reference/data-types/nullable.md)([Enum8](../../sql-reference/data-types/enum.md)('WRITABLE' = 0, 'CONST' = 1, 'CHANGEABLE_IN_READONLY' = 2))) — 设置约束可写性类型。

- `inherit_profile` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 此设置配置文件的父配置文件。 如果未设置则为 `NULL`。 设置配置文件将从其父配置文件继承所有设置值和约束（`min`、`max`、`readonly`）。
