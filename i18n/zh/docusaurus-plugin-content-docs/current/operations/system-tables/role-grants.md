---
'description': '系统表包含用户和角色的角色授予。'
'keywords':
- 'system table'
- 'role_grants'
'slug': '/operations/system-tables/role-grants'
'title': 'system.role_grants'
'doc_type': 'reference'
---


# system.role_grants

包含用户和角色的角色授权。要向此表添加条目，请使用 `GRANT role TO user`。

列：

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 用户名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 角色名称。

- `granted_role_name` ([String](../../sql-reference/data-types/string.md)) — 授予给 `role_name` 角色的角色名称。要将一个角色授予另一个角色，使用 `GRANT role1 TO role2`。

- `granted_role_is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 表示 `granted_role` 是否是默认角色的标志。可能的值：
  - 1 — `granted_role` 是默认角色。
  - 0 — `granted_role` 不是默认角色。

- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 表示 `granted_role` 是否是具有 [ADMIN OPTION](/sql-reference/statements/grant#admin-option) 特权的角色的标志。可能的值：
  - 1 — 角色具有 `ADMIN OPTION` 特权。
  - 0 — 角色没有 `ADMIN OPTION` 特权。
