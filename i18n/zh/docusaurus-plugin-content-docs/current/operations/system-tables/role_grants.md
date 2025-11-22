---
description: '包含授予给用户和角色的角色信息的系统表。'
keywords: ['system table', 'role_grants']
slug: /operations/system-tables/role_grants
title: 'system.role_grants'
doc_type: 'reference'
---

# system.role_grants

包含用户和角色的角色授予信息。要向此表添加记录，请使用 `GRANT role TO user`。

列：

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 用户名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 角色名称。

- `granted_role_name` ([String](../../sql-reference/data-types/string.md)) — 授予给 `role_name` 角色的角色名称。要将一个角色授予另一个角色，请使用 `GRANT role1 TO role2`。

- `granted_role_is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 用于指示 `granted_role` 是否为默认角色的标记。可能的取值：
  - 1 — `granted_role` 是默认角色。
  - 0 — `granted_role` 不是默认角色。

- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 用于指示 `granted_role` 是否为具有 [ADMIN OPTION](/sql-reference/statements/grant#admin-option) 权限的角色的标记。可能的取值：
  - 1 — 该角色具有 `ADMIN OPTION` 权限。
  - 0 — 该角色不具有 `ADMIN OPTION` 权限。