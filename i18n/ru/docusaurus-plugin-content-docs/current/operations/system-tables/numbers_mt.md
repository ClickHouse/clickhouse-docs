---
description: 'Системная таблица, аналогичная `system.numbers`, но чтение из неё выполняется параллельно,
  а числа могут возвращаться в произвольном порядке.'
keywords: ['system table', 'numbers_mt']
slug: /operations/system-tables/numbers_mt
title: 'system.numbers_mt'
doc_type: 'reference'
---

То же, что и [`system.numbers`](../../operations/system-tables/numbers.md), но чтение из неё выполняется параллельно. Числа могут возвращаться в произвольном порядке.

Используется для тестирования.

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

10 строк в наборе. Затрачено: 0.001 сек.
```
