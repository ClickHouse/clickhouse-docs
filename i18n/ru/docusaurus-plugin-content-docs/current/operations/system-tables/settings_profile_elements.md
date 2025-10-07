---
slug: '/operations/system-tables/settings_profile_elements'
description: 'Системная таблица, которая описывает содержание профиля настроек:'
title: system.settings_profile_elements
keywords: ['системная таблица', 'elements профиля настроек']
doc_type: reference
---
# system.settings_profile_elements

Описание содержания профиля настроек:

- Ограничения.
- Роли и пользователи, к которым применяется настройка.
- Родительские профили настроек.

Столбцы:
- `profile_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Название профиля настроек.

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя пользователя.

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Название роли.

- `index` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Последовательный номер элемента профиля настроек.

- `setting_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Название настройки.

- `value` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Значение настройки.

- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Минимальное значение настройки. `NULL`, если не задано.

- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Максимальное значение настройки. NULL, если не задано.

- `writability` ([Nullable](../../sql-reference/data-types/nullable.md)([Enum8](../../sql-reference/data-types/enum.md)('WRITABLE' = 0, 'CONST' = 1, 'CHANGEABLE_IN_READONLY' = 2))) — Устанавливает тип изменяемости ограничений настройки.

- `inherit_profile` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Родительский профиль для этого профиля настроек. `NULL`, если не задано. Профиль настроек будет наследовать все значения и ограничения настройки (`min`, `max`, `readonly`) от своих родительских профилей.