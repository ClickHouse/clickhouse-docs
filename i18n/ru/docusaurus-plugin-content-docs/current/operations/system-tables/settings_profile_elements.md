---
description: 'Системная таблица, которая описывает содержание профиля настроек: ограничения, роли и пользователи, к которым применяется настройка, родительские профили настроек.'
keywords: ['системная таблица', 'elements_profile_elements']
slug: /operations/system-tables/settings_profile_elements
title: 'system.settings_profile_elements'
---


# system.settings_profile_elements

Описывает содержание профиля настроек:

- Ограничения.
- Роли и пользователи, к которым применяется настройка.
- Родительские профили настроек.

Столбцы:
- `profile_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя профиля настроек.

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя пользователя.

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя роли.

- `index` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Последовательный номер элемента профиля настроек.

- `setting_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя настройки.

- `value` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Значение настройки.

- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Минимальное значение настройки. `NULL`, если не задано.

- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Максимальное значение настройки. `NULL`, если не задано.

- `writability` ([Nullable](../../sql-reference/data-types/nullable.md)([Enum8](../../sql-reference/data-types/enum.md)('WRITABLE' = 0, 'CONST' = 1, 'CHANGEABLE_IN_READONLY' = 2))) — Устанавливает вид ограничения записываемости настроек.

- `inherit_profile` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Родительский профиль для этого профиля настроек. `NULL`, если не задано. Профиль настроек унаследует все значения и ограничения настроек (`min`, `max`, `readonly`) от своих родительских профилей.
