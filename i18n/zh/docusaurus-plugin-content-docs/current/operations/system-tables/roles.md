---
description: '包含有关配置角色的信息的系统表。'
slug: /operations/system-tables/roles
title: 'system.roles'
keywords: ['系统表', '角色']
---

包含有关配置的 [角色](../../guides/sre/user-management/index.md#role-management) 的信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 角色名称。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 角色 ID。
- `storage` ([String](../../sql-reference/data-types/string.md)) — 角色存储的路径。在 `access_control_path` 参数中配置。

## 另请参见 {#see-also}

- [SHOW ROLES](/sql-reference/statements/show#show-roles)
