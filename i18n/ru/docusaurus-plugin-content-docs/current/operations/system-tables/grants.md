---
description: 'Системная таблица, показывающая, какие привилегии предоставлены учетным записям пользователей ClickHouse.'
keywords: ['системная таблица', 'предоставления']
slug: /operations/system-tables/grants
title: 'system.grants'
---

Привилегии, предоставленные учетным записям пользователей ClickHouse.

Столбцы:
- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя пользователя.

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Роль, назначенная учетной записи пользователя.

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Параметры доступа для учетной записи пользователя ClickHouse.

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Название базы данных.

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Название таблицы.

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Название столбца, к которому предоставлен доступ.

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Логическое значение. Показывает, были ли отозваны некоторые привилегии. Возможные значения:
  - `0` — Строка описывает предоставление.
  - `1` — Строка описывает частичный отзыв.

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Разрешение предоставлено `WITH GRANT OPTION`, см. [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax).
