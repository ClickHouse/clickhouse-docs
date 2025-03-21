---
description: 'Системная таблица, содержащая информацию о настроенных ролях.'
slug: /operations/system-tables/roles
title: 'system.roles'
keywords: ['системная таблица', 'роли']
---

Содержит информацию о настроенных [ролях](../../guides/sre/user-management/index.md#role-management).

Колонки:

- `name` ([String](../../sql-reference/data-types/string.md)) — Имя роли.
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — Идентификатор роли.
- `storage` ([String](../../sql-reference/data-types/string.md)) — Путь к хранилищу ролей. Настраивается в параметре `access_control_path`.

## See Also {#see-also}

- [SHOW ROLES](/sql-reference/statements/show#show-roles)
