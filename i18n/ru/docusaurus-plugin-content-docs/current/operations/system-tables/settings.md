---
slug: '/operations/system-tables/settings'
description: 'Системная таблица, содержащая информацию о настройках сессии для текущего'
title: system.settings
keywords: ['системная таблица', 'настройки']
doc_type: reference
---
# system.settings

Содержит информацию о настройках сессии для текущего пользователя.

Столбцы:

- `name` ([String](../../sql-reference/data-types/string.md)) — Название настройки.
- `value` ([String](../../sql-reference/data-types/string.md)) — Значение настройки.
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, была ли настройка явно определена в конфигурации или явно изменена.
- `description` ([String](../../sql-reference/data-types/string.md)) — Краткое описание настройки.
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Минимальное значение настройки, если оно установлено через [constraints](/operations/settings/constraints-on-settings). Если у настройки нет минимального значения, содержит [NULL](/operations/settings/formats#input_format_null_as_default).
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Максимальное значение настройки, если оно установлено через [constraints](/operations/settings/constraints-on-settings). Если у настройки нет максимального значения, содержит [NULL](/operations/settings/formats#input_format_null_as_default).
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, может ли текущий пользователь изменить настройку:
  - `0` — Текущий пользователь может изменить настройку.
  - `1` — Текущий пользователь не может изменить настройку.
- `default` ([String](../../sql-reference/data-types/string.md)) — Значение по умолчанию для настройки.
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - Показывает, является ли настройка устаревшей.
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — Уровень поддержки для этой функции. Функции ClickHouse организованы по уровням, которые варьируются в зависимости от текущего состояния их разработки и ожиданий, которые могут возникнуть при их использовании. Значения:
  - `'Production'` — Функция стабильна, безопасна для использования и не имеет проблем взаимодействия с другими **производственными** функциями.
  - `'Beta'` — Функция стабильна и безопасна. Результат ее совместного использования с другими функциями неизвестен, и корректность не гарантируется. Тестирование и отчеты приветствуются.
  - `'Experimental'` — Функция находится в разработке. Предназначена только для разработчиков и энтузиастов ClickHouse. Функция может работать или не работать и может быть удалена в любой момент.
  - `'Obsolete'` — Больше не поддерживается. Либо она уже удалена, либо будет удалена в будущих релизах.

**Пример**

Следующий пример показывает, как получить информацию о настройках, название которых содержит `min_i`.

```sql
SELECT *
FROM system.settings
WHERE name LIKE '%min_insert_block_size_%'
FORMAT Vertical
```

```text
Row 1:
──────
name:        min_insert_block_size_rows
value:       1048449
changed:     0
description: Sets the minimum number of rows in the block that can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones.

Possible values:

- Positive integer.
- 0 — Squashing disabled.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     1048449
alias_for:   
is_obsolete: 0
tier:        Production

Row 2:
──────
name:        min_insert_block_size_bytes
value:       268402944
changed:     0
description: Sets the minimum number of bytes in the block which can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones.

Possible values:

- Positive integer.
- 0 — Squashing disabled.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     268402944
alias_for:   
is_obsolete: 0
tier:        Production

Row 3:
──────
name:        min_insert_block_size_rows_for_materialized_views
value:       0
changed:     0
description: Sets the minimum number of rows in the block which can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones. This setting is applied only for blocks inserted into [materialized view](../../sql-reference/statements/create/view.md). By adjusting this setting, you control blocks squashing while pushing to materialized view and avoid excessive memory usage.

Possible values:

- Any positive integer.
- 0 — Squashing disabled.

**See Also**

- [min_insert_block_size_rows](/operations/settings/settings#min_insert_block_size_rows)
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     0
alias_for:   
is_obsolete: 0
tier:        Production

Row 4:
──────
name:        min_insert_block_size_bytes_for_materialized_views
value:       0
changed:     0
description: Sets the minimum number of bytes in the block which can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones. This setting is applied only for blocks inserted into [materialized view](../../sql-reference/statements/create/view.md). By adjusting this setting, you control blocks squashing while pushing to materialized view and avoid excessive memory usage.

Possible values:

- Any positive integer.
- 0 — Squashing disabled.

**See also**

- [min_insert_block_size_bytes](/operations/settings/settings#min_insert_block_size_bytes)
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     0
alias_for:   
is_obsolete: 0
tier:        Production
```

Использование `WHERE changed` может быть полезным, например, когда вы хотите проверить:

- Загружены ли настройки из файлов конфигурации правильно и используются ли они.
- Настройки, которые изменились в текущей сессии.

<!-- -->

```sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
```

**См. также**

- [Настройки](/operations/system-tables/overview#system-tables-introduction)
- [Разрешения для запросов](/operations/settings/permissions-for-queries)
- [Ограничения на настройки](../../operations/settings/constraints-on-settings.md)
- Команда [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings)