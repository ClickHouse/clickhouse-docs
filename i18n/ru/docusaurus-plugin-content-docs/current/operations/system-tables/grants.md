---
slug: '/operations/system-tables/grants'
description: 'Системная таблица, показывающая, какие привилегии предоставлены учетным'
title: system.grants
keywords: ['системная таблица', 'предоставления']
doc_type: reference
---
Привилегии, предоставленные учетным записям пользователей ClickHouse.

Столбцы:
- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя пользователя.

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Роль, назначенная учетной записи пользователя.

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Параметры доступа для учетной записи пользователя ClickHouse.

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя базы данных.

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя таблицы.

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя колонки, к которой предоставлен доступ.

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Логическое значение. Показывает, были ли отозваны какие-либо привилегии. Возможные значения:
  - `0` — Строка описывает предоставление.
  - `1` — Строка описывает частичное отозвание.

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Разрешение предоставлено `WITH GRANT OPTION`, см. [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax).