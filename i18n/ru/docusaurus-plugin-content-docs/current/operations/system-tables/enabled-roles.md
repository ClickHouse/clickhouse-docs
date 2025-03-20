---
description: 'Системная таблица, содержащая все активные роли на данный момент, включая текущую роль текущего пользователя и выданные роли для текущей роли'
slug: /operations/system-tables/enabled-roles
title: 'system.enabled_roles'
keywords: ['системная таблица', 'enabled_roles']
---

Содержит все активные роли на данный момент, включая текущую роль текущего пользователя и выданные роли для текущей роли.

Колонки:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — Название роли.
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, показывающий, является ли `enabled_role` ролью с привилегией `ADMIN OPTION`.
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, показывающий, является ли `enabled_role` текущей ролью текущего пользователя.
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, показывающий, является ли `enabled_role` ролью по умолчанию.
