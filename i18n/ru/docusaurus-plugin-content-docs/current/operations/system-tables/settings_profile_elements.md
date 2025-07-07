---
description: 'Системная таблица, которая описывает содержимое профиля настроек: ограничения, роли и пользователей, к которым относится настройка, родительские профили настроек.'
keywords: ['системная таблица', 'elements профиля настроек']
slug: /operations/system-tables/settings_profile_elements
title: 'system.settings_profile_elements'
---


# system.settings_profile_elements

Описывает содержимое профиля настроек:

- Ограничения.
- Роли и пользователи, к которым относится настройка.
- Родительские профили настроек.

Колонки:
- `profile_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя профиля настроек.

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя пользователя.

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя роли.

- `index` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Порядковый номер элемента профиля настроек.

- `setting_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя настройки.

- `value` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Значение настройки.

- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Минимальное значение настройки. `NULL`, если не установлено.

- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Максимальное значение настройки. `NULL`, если не установлено.

- `writability` ([Nullable](../../sql-reference/data-types/nullable.md)([Enum8](../../sql-reference/data-types/enum.md)('WRITABLE' = 0, 'CONST' = 1, 'CHANGEABLE_IN_READONLY' = 2))) — Устанавливает тип доступности записи ограничения настройки.

- `inherit_profile` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Родительский профиль для этого профиля настроек. `NULL`, если не установлено. Профиль настроек унаследует все значения и ограничения настройек (`min`, `max`, `readonly`) от своих родительских профилей.
