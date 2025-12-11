---
description: 'Системная таблица, содержащая все активные роли на текущий момент, включая текущую роль текущего пользователя и предоставленные роли для текущей роли'
keywords: ['system table', 'enabled_roles']
slug: /operations/system-tables/enabled_roles
title: 'system.enabled_roles'
doc_type: 'reference'
---

Содержит все активные роли на текущий момент, включая текущую роль текущего пользователя и предоставленные роли для текущей роли.

Столбцы:

- `role_name` ([String](../../sql-reference/data-types/string.md)) — Имя роли.
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, показывающий, что `enabled_role` является ролью с привилегией `ADMIN OPTION`.
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, показывающий, что `enabled_role` является текущей ролью текущего пользователя.
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, показывающий, что `enabled_role` является ролью по умолчанию.