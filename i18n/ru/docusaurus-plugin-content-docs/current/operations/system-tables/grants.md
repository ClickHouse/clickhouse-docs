---
description: 'Системная таблица, содержащая сведения о привилегиях, предоставленных учетным записям пользователей ClickHouse.'
keywords: ['system table', 'grants']
slug: /operations/system-tables/grants
title: 'system.grants'
doc_type: 'reference'
---

Привилегии, предоставленные учетным записям пользователей ClickHouse.

Столбцы:

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя пользователя.

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Роль, назначенная учетной записи пользователя.

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип привилегии доступа для учетной записи пользователя ClickHouse.

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя базы данных.

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя таблицы.

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя столбца, к которому предоставлен доступ.

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Логическое значение. Показывает, были ли отозваны некоторые привилегии. Возможные значения:
- `0` — Строка описывает операцию выдачи привилегий (grant).
- `1` — Строка описывает операцию частичного отзыва привилегий (partial revoke).

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Разрешение выдано с опцией `WITH GRANT OPTION`, см. [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax).