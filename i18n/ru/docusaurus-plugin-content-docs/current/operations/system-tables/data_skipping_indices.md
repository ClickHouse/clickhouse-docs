---
slug: '/operations/system-tables/data_skipping_indices'
description: 'Системная таблица, содержащая информацию о существующих INDEX пропуска'
title: system.data_skipping_indices
keywords: ['системная таблица', 'индексы_пропуска_данных']
doc_type: reference
---
Содержит информацию о существующих индексах пропуска данных во всех таблицах.

Колонки:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных.
- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя индекса.
- `type` ([String](../../sql-reference/data-types/string.md)) — Тип индекса.
- `type_full` ([String](../../sql-reference/data-types/string.md)) — Полное выражение типа индекса из оператора создания.
- `expr` ([String](../../sql-reference/data-types/string.md)) — Выражение для вычисления индекса.
- `granularity` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество гранул в блоке.
- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер сжатых данных в байтах.
- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер декомпрессированных данных в байтах.
- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер меток в байтах.

**Пример**

```sql
SELECT * FROM system.data_skipping_indices LIMIT 2 FORMAT Vertical;
```

```text
Row 1:
──────
database:    default
table:       user_actions
name:        clicks_idx
type:        minmax
type_full:   minmax
expr:        clicks
granularity: 1
data_compressed_bytes:   58
data_uncompressed_bytes: 6
marks_bytes:             48

Row 2:
──────
database:    default
table:       users
name:        contacts_null_idx
type:        minmax
type_full:   minmax
expr:        assumeNotNull(contacts_null)
granularity: 1
data_compressed_bytes:   58
data_uncompressed_bytes: 6
marks_bytes:             48
```