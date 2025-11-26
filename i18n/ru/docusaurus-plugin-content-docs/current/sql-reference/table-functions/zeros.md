---
description: 'Используется для тестовых целей как наиболее быстрый способ сгенерировать множество строк.
  Аналогично системным таблицам `system.zeros` и `system.zeros_mt`.'
sidebar_label: 'zeros'
sidebar_position: 145
slug: /sql-reference/table-functions/zeros
title: 'zeros'
doc_type: 'reference'
---

# Табличная функция zeros

* `zeros(N)` – Возвращает таблицу с единственным столбцом `zero` (UInt8), который содержит целое число 0 в `N` строках.
* `zeros_mt(N)` – То же, что и `zeros`, но использует несколько потоков.

Эта функция используется для тестирования как самый быстрый способ генерации большого количества строк. Аналогична системным таблицам `system.zeros` и `system.zeros_mt`.

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
