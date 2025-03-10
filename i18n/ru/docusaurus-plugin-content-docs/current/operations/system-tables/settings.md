---
description: 'Системная таблица, содержащая информацию о настройках сессии для текущего пользователя.'
slug: /operations/system-tables/settings
title: 'system.settings'
keywords: ['system table', 'settings']
---

Содержит информацию о настройках сессии для текущего пользователя.

Колонки:

- `name` ([String](../../sql-reference/data-types/string.md)) — Имя настройки.
- `value` ([String](../../sql-reference/data-types/string.md)) — Значение настройки.
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, была ли настройка явно определена в конфигурации или явно изменена.
- `description` ([String](../../sql-reference/data-types/string.md)) — Краткое описание настройки.
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Минимальное значение настройки, если оно задано через [constraints](/operations/settings/constraints-on-settings). Если у настройки нет минимального значения, содержит [NULL](/operations/settings/formats#input_format_null_as_default).
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Максимальное значение настройки, если оно задано через [constraints](/operations/settings/constraints-on-settings). Если у настройки нет максимального значения, содержит [NULL](/operations/settings/formats#input_format_null_as_default).
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, может ли текущий пользователь изменить настройку:
    - `0` — Текущий пользователь может изменить настройку.
    - `1` — Текущий пользователь не может изменить настройку.
- `default` ([String](../../sql-reference/data-types/string.md)) — Значение по умолчанию настройки.
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - Показывает, является ли настройка устаревшей.
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — Уровень поддержки для этой функции. Функции ClickHouse организованы по уровням, которые варьируются в зависимости от текущего состояния их разработки и ожиданий, которые могут быть у пользователей. Значения:
    - `'Production'` — Функция стабильна, безопасна для использования и не имеет проблем во взаимодействии с другими **производственными** функциями.
    - `'Beta'` — Функция стабильна и безопасна. Результат её использования вместе с другими функциями неизвестен, и точность не гарантируется. Тестирование и отчеты приветствуются.
    - `'Experimental'` — Функция находится в разработке. Предназначена только для разработчиков и энтузиастов ClickHouse. Функция может работать или не работать и может быть удалена в любое время.
    - `'Obsolete'` — Больше не поддерживается. Либо она уже удалена, либо будет удалена в будущих релизах.

**Пример**

Следующий пример показывает, как получить информацию о настройках, имена которых содержат `min_i`.

``` sql
SELECT *
FROM system.settings
WHERE name LIKE '%min_insert_block_size_%'
FORMAT Vertical
```

``` text
Строка 1:
──────
name:        min_insert_block_size_rows
value:       1048449
changed:     0
description: Устанавливает минимальное количество строк в блоке, которые можно вставить в таблицу с помощью запроса `INSERT`. Более мелкие блоки объединяются в более крупные.

Возможные значения:

- Положительное целое число.
- 0 — Объединение отключено.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     1048449
alias_for:   
is_obsolete: 0
tier:        Production

Строка 2:
──────
name:        min_insert_block_size_bytes
value:       268402944
changed:     0
description: Устанавливает минимальное количество байт в блоке, которые можно вставить в таблицу с помощью запроса `INSERT`. Более мелкие блоки объединяются в более крупные.

Возможные значения:

- Положительное целое число.
- 0 — Объединение отключено.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     268402944
alias_for:   
is_obsolete: 0
tier:        Production

Строка 3:
──────
name:        min_insert_block_size_rows_for_materialized_views
value:       0
changed:     0
description: Устанавливает минимальное количество строк в блоке, которые можно вставить в таблицу с помощью запроса `INSERT`. Более мелкие блоки объединяются в более крупные. Эта настройка применяется только для блоков, вставляемых в [материализованное представление](../../sql-reference/statements/create/view.md). Регулируя эту настройку, вы контролируете объединение блоков при их отправке в материализованное представление и избегаете чрезмерного использования памяти.

Возможные значения:

- Любое положительное целое число.
- 0 — Объединение отключено.

**См. также**

- [min_insert_block_size_rows](/operations/settings/settings#min_insert_block_size_rows)
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     0
alias_for:   
is_obsolete: 0
tier:        Production

Строка 4:
──────
name:        min_insert_block_size_bytes_for_materialized_views
value:       0
changed:     0
description: Устанавливает минимальное количество байт в блоке, которые можно вставить в таблицу с помощью запроса `INSERT`. Более мелкие блоки объединяются в более крупные. Эта настройка применяется только для блоков, вставляемых в [материализованное представление](../../sql-reference/statements/create/view.md). Регулируя эту настройку, вы контролируете объединение блоков при их отправке в материализованное представление и избегаете чрезмерного использования памяти.

Возможные значения:

- Любое положительное целое число.
- 0 — Объединение отключено.

**См. также**

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

- Загружены ли настройки из конфигурационных файлов правильно и используются ли они.
- Настройки, которые изменились в текущей сессии.

<!-- -->

``` sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
```

**См. также**

- [Настройки](/operations/system-tables/overview#system-tables-introduction)
- [Права доступа для запросов](/operations/settings/permissions-for-queries)
- [Ограничения на настройки](../../operations/settings/constraints-on-settings.md)
- Инструкция [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings)
