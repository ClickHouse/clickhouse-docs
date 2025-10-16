---
'description': '系统表包含当前时刻所有活动角色，包括当前用户的当前角色和为当前角色授予的角色'
'keywords':
- 'system table'
- 'enabled_roles'
'slug': '/operations/system-tables/enabled_roles'
'title': 'system.enabled_roles'
'doc_type': 'reference'
---

包含所有当前活动的角色，包括当前用户的当前角色和当前角色授予的角色。

列：

- `role_name` ([String](../../sql-reference/data-types/string.md))) — 角色名称。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) —指示 `enabled_role` 是否具有 `ADMIN OPTION` 特权的标志。
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) —指示 `enabled_role` 是否为当前用户的当前角色的标志。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) —指示 `enabled_role` 是否为默认角色的标志。
