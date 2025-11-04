---
slug: '/operations/system-tables/merge_tree_settings'
description: 'Системная таблица, содержащая информацию о настройках для таблиц MergeTree.'
title: system.merge_tree_settings
keywords: ['системная таблица', 'merge_tree_settings']
doc_type: reference
---
# system.merge_tree_settings

Содержит информацию о настройках для таблиц `MergeTree`.

Столбцы:

- `name` ([String](../../sql-reference/data-types/string.md)) — Название настройки.
- `value` ([String](../../sql-reference/data-types/string.md)) — Значение настройки.
- `default` ([String](../../sql-reference/data-types/string.md)) — Значение по умолчанию для настройки.
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, была ли настройка явно определена в конфигурации или изменена.
- `description` ([String](../../sql-reference/data-types/string.md)) — Описание настройки.
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Минимальное значение настройки, если такое установлено через [constraints](/operations/settings/constraints-on-settings). Если у настройки нет минимального значения, содержит [NULL](/operations/settings/formats#input_format_null_as_default).
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Максимальное значение настройки, если такое установлено через [constraints](/operations/settings/constraints-on-settings). Если у настройки нет максимального значения, содержит [NULL](/operations/settings/formats#input_format_null_as_default).
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, может ли текущий пользователь изменять настройку:
  - `0` — Текущий пользователь может изменять настройку.
  - `1` — Текущий пользователь не может изменять настройку.
- `type` ([String](../../sql-reference/data-types/string.md)) — Тип настройки (строковое значение, специфичное для реализации).
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - Показывает, является ли настройка устаревшей.
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — Уровень поддержки для этой функции. Функции ClickHouse организованы по уровням, что зависит от текущего состояния их разработки и ожиданий, которые могут быть у пользователей. Значения:
  - `'Production'` — Функция стабильна, безопасна для использования и не имеет проблем взаимодействия с другими **производственными** функциями.
  - `'Beta'` — Функция стабильна и безопасна. Результат совместного использования с другими функциями неизвестен, и точность не гарантируется. Тестирование и отзывы приветствуются.
  - `'Experimental'` — Функция находится в разработке. Предназначена только для разработчиков и энтузиастов ClickHouse. Функция может или не может работать и может быть удалена в любое время.
  - `'Obsolete'` — Больше не поддерживается. Либо она уже была удалена, либо будет удалена в будущих релизах.

**Пример**
```sql
SELECT * FROM system.merge_tree_settings LIMIT 3 FORMAT Vertical;
```

```response
SELECT *
FROM system.merge_tree_settings
LIMIT 3
FORMAT Vertical

Query id: 2580779c-776e-465f-a90c-4b7630d0bb70

Row 1:
──────
name:        min_compress_block_size
value:       0
default:     0
changed:     0
description: When granule is written, compress the data in buffer if the size of pending uncompressed data is larger or equal than the specified threshold. If this setting is not set, the corresponding global setting is used.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

Row 2:
──────
name:        max_compress_block_size
value:       0
default:     0
changed:     0
description: Compress the pending uncompressed data in buffer if its size is larger or equal than the specified threshold. Block of data will be compressed even if the current granule is not finished. If this setting is not set, the corresponding global setting is used.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

Row 3:
──────
name:        index_granularity
value:       8192
default:     8192
changed:     0
description: How many rows correspond to one primary key value.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

3 rows in set. Elapsed: 0.001 sec. 
```