---
'description': '系统表，包含已配置设置配置文件的属性。'
'keywords':
- 'system table'
- 'settings_profiles'
'slug': '/operations/system-tables/settings_profiles'
'title': 'system.settings_profiles'
---


# system.settings_profiles

包含配置设置配置文件的属性。

列：
- `name` ([String](../../sql-reference/data-types/string.md)) — 设置配置文件名称。

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 设置配置文件ID。

- `storage` ([String](../../sql-reference/data-types/string.md)) — 设置配置文件的存储路径。在 `access_control_path` 参数中配置。

- `num_elements` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 此配置文件在 `system.settings_profile_elements` 表中的元素数量。

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 表示设置配置文件适用于所有角色和/或用户。

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 应用设置配置文件的角色和/或用户名单。

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 设置配置文件适用于所有角色和/或用户，除了列出的那些。

## See Also {#see-also}

- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)
