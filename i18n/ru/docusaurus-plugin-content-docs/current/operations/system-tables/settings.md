---
description: 'Системная таблица, содержащая информацию о настройках сеанса для текущего пользователя.'
keywords: ['системная таблица', 'настройки']
slug: /operations/system-tables/settings
title: 'system.settings'
doc_type: 'reference'
---

# system.settings {#systemsettings}

Содержит информацию о настройках сессии для текущего пользователя.

Столбцы:

* `name` ([String](../../sql-reference/data-types/string.md)) — Имя настройки.
* `value` ([String](../../sql-reference/data-types/string.md)) — Значение настройки.
* `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, была ли настройка явно задана в конфигурации или явно изменена.
* `description` ([String](../../sql-reference/data-types/string.md)) — Краткое описание настройки.
* `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Минимальное значение настройки, если оно задано через [constraints](/operations/settings/constraints-on-settings). Если для настройки не задано минимальное значение, содержит [NULL](/operations/settings/formats#input_format_null_as_default).
* `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Максимальное значение настройки, если оно задано через [constraints](/operations/settings/constraints-on-settings). Если для настройки не задано максимальное значение, содержит [NULL](/operations/settings/formats#input_format_null_as_default).
* `disallowed_values` ([Array](/sql-reference/data-types/array)([String](../../sql-reference/data-types/string.md))) — Список недопустимых значений.
* `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, может ли текущий пользователь изменять настройку:
  * `0` — Текущий пользователь может изменить настройку.
  * `1` — Текущий пользователь не может изменить настройку.
* `default` ([String](../../sql-reference/data-types/string.md)) — Значение настройки по умолчанию.
* `alias_for` ([String](../../sql-reference/data-types/string.md)) — Имя исходной настройки, если данная настройка является псевдонимом другой настройки.
* `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Показывает, является ли настройка устаревшей.
* `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — Уровень поддержки этой возможности. Возможности ClickHouse организованы по уровням, которые различаются в зависимости от текущего статуса их разработки и ожидаемого поведения при их использовании. Значения:
  * `'Production'` — Функция стабильна, безопасна в использовании и не имеет проблем во взаимодействии с другими **production**‑функциями.
  * `'Beta'` — Функция стабильна и безопасна. Результат её совместного использования с другими функциями неизвестен и корректность не гарантируется. Тестирование и отчёты приветствуются.
  * `'Experimental'` — Функция находится в разработке. Предназначена только для разработчиков и энтузиастов ClickHouse. Функция может как работать, так и не работать и может быть удалена в любой момент.
  * `'Obsolete'` — Больше не поддерживается. Либо уже удалена, либо будет удалена в будущих релизах.

**Пример**

В следующем примере показано, как получить информацию о настройках, имя которых содержит `min_i`.

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

Использование `WHERE changed` может быть полезно, например, для проверки:

- Корректно ли загружены настройки из конфигурационных файлов и применяются ли они.
- Настроек, которые изменились в текущей сессии.

<!-- -->

**См. также**

* [Настройки](/operations/system-tables/overview#system-tables-introduction)
* [Права на выполнение запросов](/operations/settings/permissions-for-queries)
* [Ограничения для настроек](../../operations/settings/constraints-on-settings.md)
* Оператор [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings)
