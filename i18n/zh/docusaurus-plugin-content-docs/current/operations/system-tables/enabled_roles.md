---
description: '系统表，包含当前所有已启用的角色，包括当前用户的当前角色以及为当前角色授予的角色'
keywords: ['system table', 'enabled_roles']
slug: /operations/system-tables/enabled_roles
title: 'system.enabled_roles'
doc_type: 'reference'
---

包含当前所有已启用的角色，包括当前用户的当前角色以及为当前角色授予的角色。

列：

- `role_name` ([String](../../sql-reference/data-types/string.md))) — 角色名称。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 标志位，指示 `enabled_role` 是否为具有 `ADMIN OPTION` 权限的角色。
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 标志位，指示 `enabled_role` 是否为当前用户的当前角色。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 标志位，指示 `enabled_role` 是否为默认角色。