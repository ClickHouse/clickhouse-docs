---
slug: '/operations/system-tables/current-roles'
description: 'Системная таблица, содержащая активные роли для текущего пользователя.'
title: system.current_roles
keywords: ['системная таблица', 'текущие роли']
doc_type: reference
---
Содержит активные роли текущего пользователя. `SET ROLE` изменяет содержимое этой таблицы.

Колонки:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — Имя роли.
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, который показывает, является ли `current_role` ролью с привилегией `ADMIN OPTION`.
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, который показывает, является ли `current_role` ролью по умолчанию.