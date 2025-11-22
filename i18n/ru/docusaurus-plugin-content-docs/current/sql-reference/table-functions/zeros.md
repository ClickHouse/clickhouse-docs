---
description: 'Используется для тестирования как наиболее быстрый способ сгенерировать большое количество строк.
  Аналогична системным таблицам `system.zeros` и `system.zeros_mt`.'
sidebar_label: 'zeros'
sidebar_position: 145
slug: /sql-reference/table-functions/zeros
title: 'zeros'
doc_type: 'reference'
---

# Табличная функция zeros

* `zeros(N)` – Возвращает таблицу с единственным столбцом `zero` (UInt8), который содержит значение 0 `N` раз.
* `zeros_mt(N)` – То же, что и `zeros`, но использует несколько потоков.

Эта функция используется для тестирования как самый быстрый способ сгенерировать большое количество строк. Аналогична системным таблицам `system.zeros` и `system.zeros_mt`.

Следующие запросы эквивалентны:

```sql
SELECT * FROM zeros(10);
SELECT * FROM system.zeros LIMIT 10;
SELECT * FROM zeros_mt(10);
SELECT * FROM system.zeros_mt LIMIT 10;
```

```response
┌─zero─┐
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
└──────┘
```
