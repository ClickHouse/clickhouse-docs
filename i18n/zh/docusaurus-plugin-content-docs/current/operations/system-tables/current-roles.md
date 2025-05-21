---
'description': 'System table containing active roles for the current user.'
'keywords':
- 'system table'
- 'current_roles'
'slug': '/operations/system-tables/current-roles'
'title': 'system.current_roles'
---



包含当前用户的活动角色。 `SET ROLE` 更改此表的内容。

列：

 - `role_name` ([String](../../sql-reference/data-types/string.md))) — 角色名称。
 - `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示 `current_role` 是否为具有 `ADMIN OPTION` 权限的角色的标志。
 - `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示 `current_role` 是否为默认角色的标志。
