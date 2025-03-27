---
description: 'Системная таблица, содержащая активные роли для текущего пользователя.'
keywords: ['системная таблица', 'текущие роли']
slug: /operations/system-tables/current-roles
title: 'system.current_roles'
---

Содержит активные роли текущего пользователя. `SET ROLE` изменяет содержимое этой таблицы.

Столбцы:

 - `role_name` ([String](../../sql-reference/data-types/string.md))) — Имя роли.
 - `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, указывающий, является ли `current_role` ролью с привилегией `ADMIN OPTION`.
 - `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, показывающий, является ли `current_role` ролью по умолчанию.
