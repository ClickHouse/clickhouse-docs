---
description: '包含当前用户当前启用角色的系统表。'
keywords: ['system table', 'current_roles']
slug: /operations/system-tables/current_roles
title: 'system.current_roles'
doc_type: 'reference'
---

包含当前用户当前启用的角色。`SET ROLE` 会改变此表的内容。

列：

- `role_name` ([String](../../sql-reference/data-types/string.md))) — 角色名称。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 标志位，表示 `current_role` 是否为具有 `ADMIN OPTION` 权限的角色。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 标志位，表示 `current_role` 是否为默认角色。