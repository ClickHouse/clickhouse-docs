---
slug: '/operations/system-tables/enabled-roles'
description: 'Системная таблица, содержащая все активные роли в данный момент, включая'
title: system.enabled_roles
keywords: ['системная таблица', 'enabled_roles']
doc_type: reference
---
Содержит все активные роли на данный момент, включая текущую роль текущего пользователя и предоставленные роли для текущей роли.

Колонки:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — Название роли.
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, который показывает, является ли `enabled_role` ролью с правом `ADMIN OPTION`.
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, который показывает, является ли `enabled_role` текущей ролью текущего пользователя.
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, который показывает, является ли `enabled_role` ролью по умолчанию.