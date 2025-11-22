---
description: 'Системная таблица, показывающая, какие привилегии предоставлены учетным записям пользователей ClickHouse.'
keywords: ['system table', 'grants']
slug: /operations/system-tables/grants
title: 'system.grants'
doc_type: 'reference'
---

Привилегии, предоставленные учетным записям пользователей ClickHouse.

Столбцы:

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя пользователя.

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Роль, назначенная учетной записи пользователя.

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип привилегии для учетной записи пользователя ClickHouse.

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя базы данных.

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя таблицы.

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя столбца, к которому предоставлен доступ.

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Логическое значение. Показывает, были ли отозваны некоторые привилегии. Возможные значения:
- `0` — Строка описывает предоставление привилегий.
- `1` — Строка описывает частичный отзыв привилегий.

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Разрешение предоставлено с опцией `WITH GRANT OPTION`, см. [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax).