---
description: 'Системная таблица, содержащая свойства настроенных профилей настроек.'
slug: /operations/system-tables/settings_profiles
title: 'system.settings_profiles'
keywords: ['системная таблица', 'settings_profiles']
---

Содержит свойства настроенных профилей настроек.

Колонки:
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя профиля настроек.

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — Идентификатор профиля настроек.

- `storage` ([String](../../sql-reference/data-types/string.md)) — Путь к хранилищу профилей настроек. Настраивается с помощью параметра `access_control_path`.

- `num_elements` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество элементов для этого профиля в таблице `system.settings_profile_elements`.

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Указывает, что профиль настроек установлен для всех ролей и/или пользователей.

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Список ролей и/или пользователей, к которым применяется профиль настроек.

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Профиль настроек применяется ко всем ролям и/или пользователям, кроме указанных в списке.

## See Also {#see-also}

- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)
