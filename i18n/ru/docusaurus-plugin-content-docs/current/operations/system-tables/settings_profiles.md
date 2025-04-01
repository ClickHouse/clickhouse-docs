---
description: 'Системная таблица, содержащая свойства настроенных профилей настройек.'
keywords: ['системная таблица', 'настройки_профилей']
slug: /operations/system-tables/settings_profiles
title: 'system.settings_profiles'
---


# system.settings_profiles

Содержит свойства настроенных профилей настройек.

Столбцы:
- `name` ([String](../../sql-reference/data-types/string.md)) — Название профиля настройек.

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — ID профиля настройек.

- `storage` ([String](../../sql-reference/data-types/string.md)) — Путь к хранилищу профилей настройек. Настраивается в параметре `access_control_path`.

- `num_elements` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество элементов для этого профиля в таблице `system.settings_profile_elements`.

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, что профиль настройек установлен для всех ролей и/или пользователей.

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Список ролей и/или пользователей, к которым применяется профиль настройек.

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Профиль настройек применяется ко всем ролям и/или пользователям, за исключением перечисленных.

## See Also {#see-also}

- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)
