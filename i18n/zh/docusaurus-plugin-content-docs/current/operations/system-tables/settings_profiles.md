---
'description': '包含配置设置文件属性的系统表。'
'keywords':
- 'system table'
- 'settings_profiles'
'slug': '/operations/system-tables/settings_profiles'
'title': '系统设置文件'
---




# system.settings_profiles

包含已配置的设置配置文件属性。

列：
- `name` ([String](../../sql-reference/data-types/string.md)) — 设置配置文件名称。

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 设置配置文件 ID。

- `storage` ([String](../../sql-reference/data-types/string.md)) — 设置配置文件存储的路径。 在 `access_control_path` 参数中配置。

- `num_elements` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 在 `system.settings_profile_elements` 表中该配置文件的元素数量。

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示设置配置文件适用于所有角色和/或用户。

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 设置配置文件应用的角色和/或用户列表。

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 设置配置文件应用于所有角色和/或用户，但列出的角色和/或用户除外。

## 另请参阅 {#see-also}

- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)
