---
slug: '/operations/system-tables/roles'
description: 'Системная таблица, содержащая информацию о настроенных ролях.'
title: system.roles
keywords: ['системная таблица', 'роли']
doc_type: reference
---
# system.roles

Содержит информацию о сконфигурированных [ролях](../../guides/sre/user-management/index.md#role-management).

Столбцы:

- `name` ([String](../../sql-reference/data-types/string.md)) — Название роли.
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — ID роли.
- `storage` ([String](../../sql-reference/data-types/string.md)) — Путь к хранилищу ролей. Настраивается в параметре `access_control_path`.

## See Also {#see-also}

- [SHOW ROLES](/sql-reference/statements/show#show-roles)