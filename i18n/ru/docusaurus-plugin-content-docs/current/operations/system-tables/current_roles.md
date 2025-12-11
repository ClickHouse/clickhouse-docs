---
description: 'Системная таблица, содержащая активные роли текущего пользователя.'
keywords: ['system table', 'current_roles']
slug: /operations/system-tables/current_roles
title: 'system.current_roles'
doc_type: 'reference'
---

Содержит активные роли текущего пользователя. Команда `SET ROLE` изменяет содержимое этой таблицы.

Столбцы:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — Имя роли.
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, показывающий, имеет ли `current_role` привилегию `ADMIN OPTION`.
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, показывающий, является ли `current_role` ролью по умолчанию.