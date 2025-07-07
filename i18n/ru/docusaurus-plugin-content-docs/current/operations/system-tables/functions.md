---
description: 'Системная таблица, содержащая информацию о нормальных и агрегатных функциях.'
keywords: ['системная таблица', 'функции']
slug: /operations/system-tables/functions
title: 'system.functions'
---

Содержит информацию о нормальных и агрегатных функциях.

Колонки:

- `name` ([String](../../sql-reference/data-types/string.md)) – Имя функции.
- `is_aggregate` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Является ли функция агрегатной функцией.
- `case_insensitive`, ([UInt8](../../sql-reference/data-types/int-uint.md)) - Можно ли использовать имя функции без учета регистра.
- `alias_to`, ([String](../../sql-reference/data-types/string.md)) - Исходное имя функции, если имя функции является псевдонимом.
- `create_query`, ([String](../../sql-reference/data-types/enum.md)) - Не используется.
- `origin`, ([Enum8](../../sql-reference/data-types/string.md)) - Не используется.
- `description`, ([String](../../sql-reference/data-types/string.md)) - Общее описание того, что делает функция.
- `syntax`, ([String](../../sql-reference/data-types/string.md)) - Подпись функции.
- `arguments`, ([String](../../sql-reference/data-types/string.md)) - Какие аргументы принимает функция.
- `returned_value`, ([String](../../sql-reference/data-types/string.md)) - Что возвращает функция.
- `examples`, ([String](../../sql-reference/data-types/string.md)) - Пример использования функции.
- `introduced_in`, ([String](../../sql-reference/data-types/string.md)) - Версия ClickHouse, в которой функция была впервые представлена.
- `categories`, ([String](../../sql-reference/data-types/string.md)) - Категория функции.

**Пример**

```sql
 SELECT name, is_aggregate, is_deterministic, case_insensitive, alias_to FROM system.functions LIMIT 5;
```

```text
┌─name─────────────────────┬─is_aggregate─┬─is_deterministic─┬─case_insensitive─┬─alias_to─┐
│ BLAKE3                   │            0 │                1 │                0 │          │
│ sipHash128Reference      │            0 │                1 │                0 │          │
│ mapExtractKeyLike        │            0 │                1 │                0 │          │
│ sipHash128ReferenceKeyed │            0 │                1 │                0 │          │
│ mapPartialSort           │            0 │                1 │                0 │          │
└──────────────────────────┴──────────────┴──────────────────┴──────────────────┴──────────┘

5 строк в наборе. Время: 0.002 сек.
```
