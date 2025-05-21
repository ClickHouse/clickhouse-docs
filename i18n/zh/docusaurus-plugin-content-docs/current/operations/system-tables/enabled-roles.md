---
'description': '系统表，包含当前所有活跃角色，包括当前用户的当前角色以及当前角色的授权角色'
'keywords':
- 'system table'
- 'enabled_roles'
'slug': '/operations/system-tables/enabled-roles'
'title': 'system.enabled_roles'
---



包含当前所有活动角色，包括当前用户的当前角色和为当前角色授予的角色。

列：

- `role_name` ([String](../../sql-reference/data-types/string.md))) — 角色名称。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示 `enabled_role` 是否为具有 `ADMIN OPTION` 权限的角色的标志。
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示 `enabled_role` 是否为当前用户的当前角色的标志。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示 `enabled_role` 是否为默认角色的标志。
