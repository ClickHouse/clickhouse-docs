---
description: 'Системная таблица, содержащая активные роли для текущего пользователя.'
keywords: ['системная таблица', 'current_roles']
slug: /operations/system-tables/current_roles
title: 'system.current_roles'
doc_type: 'reference'
---

Содержит активные роли текущего пользователя. Команда `SET ROLE` изменяет содержимое этой таблицы.

Столбцы:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — имя роли.
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — флаг, показывающий, является ли `current_role` ролью с привилегией `ADMIN OPTION`.
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — флаг, показывающий, является ли `current_role` ролью по умолчанию.