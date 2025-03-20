---
description: 'Системная таблица, содержащая назначения ролей для пользователей и ролей.'
slug: /operations/system-tables/role-grants
title: 'system.role_grants'
keywords: ['системная таблица', 'role_grants']
---

Содержит назначения ролей для пользователей и ролей. Для добавления записей в эту таблицу используйте `GRANT role TO user`.

Колонки:

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя пользователя.

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя роли.

- `granted_role_name` ([String](../../sql-reference/data-types/string.md)) — Имя роли, назначенной роли `role_name`. Чтобы назначить одну роль другой, используйте `GRANT role1 TO role2`.

- `granted_role_is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, показывающий, является ли `granted_role` ролью по умолчанию. Возможные значения:
    - 1 — `granted_role` является ролью по умолчанию.
    - 0 — `granted_role` не является ролью по умолчанию.

- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Флаг, показывающий, является ли `granted_role` ролью с привилегией [ADMIN OPTION](/sql-reference/statements/grant#admin-option). Возможные значения:
    - 1 — Роль имеет привилегию `ADMIN OPTION`.
    - 0 — Роль без привилегии `ADMIN OPTION`.
