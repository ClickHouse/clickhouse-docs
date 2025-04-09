---
description: 'Системная таблица, содержащая активные роли для текущего пользователя.'
keywords: ['системная таблица', 'текущие роли']
slug: /operations/system-tables/current-roles
title: 'system.current_roles'
---

Содержит активные роли текущего пользователя. `SET ROLE` изменяет содержимое этой таблицы.

Колонки:

 - `role_name` ([String](../../sql-reference/data-types/string.md))) — Название роли.
 - `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, который показывает, является ли `current_role` ролью с привилегией `ADMIN OPTION`.
 - `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, который показывает, является ли `current_role` ролью по умолчанию.
