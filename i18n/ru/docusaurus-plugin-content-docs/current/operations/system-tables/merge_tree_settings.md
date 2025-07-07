---
description: 'Системная таблица, содержащая информацию о настройках для таблиц MergeTree.'
keywords: ['системная таблица', 'merge_tree_settings']
slug: /operations/system-tables/merge_tree_settings
title: 'system.merge_tree_settings'
---


# system.merge_tree_settings

Содержит информацию о настройках для таблиц `MergeTree`.

Столбцы:

- `name` ([String](../../sql-reference/data-types/string.md)) — Название настройки.
- `value` ([String](../../sql-reference/data-types/string.md)) — Значение настройки.
- `default` ([String](../../sql-reference/data-types/string.md)) — Значение по умолчанию настройки.
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Определено ли значение настройки явно в конфигурации или было явно изменено.
- `description` ([String](../../sql-reference/data-types/string.md)) — Описание настройки.
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Минимальное значение настройки, если такое задано через [constraints](/operations/settings/constraints-on-settings). Если у настройки нет минимального значения, содержит [NULL](/operations/settings/formats#input_format_null_as_default).
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Максимальное значение настройки, если такое задано через [constraints](/operations/settings/constraints-on-settings). Если у настройки нет максимального значения, содержит [NULL](/operations/settings/formats#input_format_null_as_default).
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, может ли текущий пользователь изменить настройку:
    - `0` — Текущий пользователь может изменить настройку.
    - `1` — Текущий пользователь не может изменить настройку.
- `type` ([String](../../sql-reference/data-types/string.md)) — Тип настройки (строковое значение, специфичное для реализации).
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - Показывает, устарела ли настройка.
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — Уровень поддержки для этой функции. Функции ClickHouse организованы по уровням, которые варьируются в зависимости от текущего статуса их разработки и ожиданий, которые могут возникнуть при их использовании. Значения:
    - `'Production'` — Функция стабильна, безопасна для использования и не имеет проблем с взаимодействием с другими **производственными** функциями.
    - `'Beta'` — Функция стабильна и безопасна. Результат использования ее вместе с другими функциями не известен, и корректность не гарантируется. Тестирование и отчеты приветствуются.
    - `'Experimental'` — Функция находится в разработке. Предназначена только для разработчиков и энтузиастов ClickHouse. Функция может как работать, так и не работать, и может быть удалена в любое время.
    - `'Obsolete'` — Больше не поддерживается. Либо она уже удалена, либо будет удалена в будущих релизах.

**Пример**
```sql
SELECT * FROM system.merge_tree_settings LIMIT 4 FORMAT Vertical;
```

```response
SELECT *
FROM system.merge_tree_settings
LIMIT 4
FORMAT Vertical

Query id: 2580779c-776e-465f-a90c-4b7630d0bb70

Row 1:
──────
name:        min_compress_block_size
value:       0
default:     0
changed:     0
description: Когда гранула записывается, сжать данные в буфере, если размер ожидаемых несжатых данных больше или равен указанному порогу. Если эта настройка не задана, используется соответствующая глобальная настройка.
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
description: Сжать ожидаемые несжатые данные в буфере, если их размер больше или равен указанному порогу. Блок данных будет сжат даже если текущая гранула не завершена. Если эта настройка не задана, используется соответствующая глобальная настройка.
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
description: Сколько строк соответствует одному значению первичного ключа.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

Row 4:
──────
name:        max_digestion_size_per_segment
value:       268435456
default:     268435456
changed:     0
description: Максимальное количество байтов для обработки на сегмент для построения индекса GIN.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
is_obsolete: 0
tier:        Production

4 rows in set. Elapsed: 0.001 sec. 
```
