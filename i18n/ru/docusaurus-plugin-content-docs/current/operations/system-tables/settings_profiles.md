---
slug: '/operations/system-tables/settings_profiles'
description: 'Системная таблица, которая содержит свойства настроенных профилей'
title: system.settings_profiles
keywords: ['системная таблица', 'настройки_профилей']
doc_type: reference
---
# system.settings_profiles

Содержит свойства настроенных профилей настроек.

Столбцы:
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя профиля настроек.

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — ID профиля настроек.

- `storage` ([String](../../sql-reference/data-types/string.md)) — Путь к хранилищу профилей настроек. Настраивается в параметре `access_control_path`.

- `num_elements` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество элементов для этого профиля в таблице `system.settings_profile_elements`.

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, что профиль настроек установлен для всех ролей и/или пользователей.

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Список ролей и/или пользователей, к которым применяется профиль настроек.

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Профиль настроек применяется ко всем ролям и/или пользователям, за исключением указанных в списке.

## See Also {#see-also}

- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)