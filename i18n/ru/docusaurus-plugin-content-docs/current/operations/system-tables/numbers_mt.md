---
description: 'Системная таблица, аналогичная `system.numbers`, но с параллельным чтением, при котором числа могут возвращаться в любом порядке.'
keywords: ['system table', 'numbers_mt']
slug: /operations/system-tables/numbers_mt
title: 'system.numbers_mt'
doc_type: 'reference'
---

То же, что и [`system.numbers`](../../operations/system-tables/numbers.md), но с параллельным чтением. Числа могут возвращаться в любом порядке.

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

Получено 10 строк. Затрачено: 0,001 сек.
```
