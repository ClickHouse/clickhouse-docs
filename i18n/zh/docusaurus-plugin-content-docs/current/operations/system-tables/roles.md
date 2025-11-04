---
'description': '系统表，包含有关已配置角色的信息。'
'keywords':
- 'system table'
- 'roles'
'slug': '/operations/system-tables/roles'
'title': 'system.roles'
'doc_type': 'reference'
---


# system.roles

包含关于配置的 [roles](../../guides/sre/user-management/index.md#role-management) 的信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 角色名称。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 角色 ID。
- `storage` ([String](../../sql-reference/data-types/string.md)) — 角色存储的路径。配置在 `access_control_path` 参数中。

## 另见 {#see-also}

- [SHOW ROLES](/sql-reference/statements/show#show-roles)
