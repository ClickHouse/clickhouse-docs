---
description: 'Системная таблица, содержащая информацию о существующих проекциях во всех таблицах.'
keywords: ['системная таблица', 'проекции']
slug: /operations/system-tables/projections
title: 'system.projections'
---


# system.projections

Содержит информацию о существующих проекциях во всех таблицах.

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных.
- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя проекции.
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — Тип проекции ('Normal' = 0, 'Aggregate' = 1).
- `sorting_key` ([Array(String)](../../sql-reference/data-types/array.md)) — Ключ сортировки проекции.
- `query` ([String](../../sql-reference/data-types/string.md)) — Запрос проекции.

**Пример**

```sql
SELECT * FROM system.projections LIMIT 2 FORMAT Vertical;
```

```text
Row 1:
──────
database:    default
table:       landing
name:        improved_sorting_key
type:        Normal
sorting_key: ['user_id','date']
query:       SELECT * ORDER BY user_id, date

Row 2:
──────
database:    default
table:       landing
name:        agg_no_key
type:        Aggregate
sorting_key: []
query:       SELECT count()
```
