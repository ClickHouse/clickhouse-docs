---
'description': '系统表包含关于已配置角色的信息。'
'keywords':
- 'system table'
- 'roles'
'slug': '/operations/system-tables/roles'
'title': 'system.roles'
---


# system.roles

包含有关配置的 [roles](../../guides/sre/user-management/index.md#role-management) 的信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 角色名称。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 角色 ID。
- `storage` ([String](../../sql-reference/data-types/string.md)) — 角色存储的路径。 在 `access_control_path` 参数中配置。

## 另请参阅 {#see-also}

- [SHOW ROLES](/sql-reference/statements/show#show-roles)
