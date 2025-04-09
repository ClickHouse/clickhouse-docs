---
description: 'Системная таблица, аналогичная `system.numbers`, но чтения параллелизованы и числа могут возвращаться в любом порядке.'
keywords: ['системная таблица', 'numbers_mt']
slug: /operations/system-tables/numbers_mt
title: 'system.numbers_mt'
---

То же самое, что и [`system.numbers`](../../operations/system-tables/numbers.md), но чтения параллелизованы. Числа могут возвращаться в любом порядке.

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

10 rows in set. Elapsed: 0.001 sec.
```
