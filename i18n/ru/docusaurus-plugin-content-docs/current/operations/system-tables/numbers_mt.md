---
description: 'Системная таблица, аналогичная `system.numbers`, но чтение параллелизовано, и числа могут возвращаться в любом порядке.'
slug: /operations/system-tables/numbers_mt
title: 'system.numbers_mt'
keywords: ['system table', 'numbers_mt']
---

То же самое, что и [`system.numbers`](../../operations/system-tables/numbers.md), но чтение параллелизовано. Числа могут возвращаться в любом порядке.

Используется для тестов.

**Пример**

```sql
SELECT * FROM system.numbers_mt LIMIT 10;
```

```response
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘

10 строк в наборе. Время затрачено: 0.001 сек.
```
