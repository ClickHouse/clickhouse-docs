---
slug: /sql-reference/table-functions/zeros
sidebar_position: 145
sidebar_label: zeros
title: "zeros"
description: "Используется для тестовых целей как самый быстрый метод генерации множества строк. Аналогично системным таблицам `system.zeros` и `system.zeros_mt`."
---


# Функция таблицы zeros

* `zeros(N)` – Возвращает таблицу с единственной колонкой 'zero' (UInt8), содержащей целое число 0 `N` раз
* `zeros_mt(N)` – То же самое, что и `zeros`, но использует несколько потоков.

Эта функция используется для тестовых целей как самый быстрый метод генерации множества строк. Аналогично системным таблицам `system.zeros` и `system.zeros_mt`.

Следующие запросы эквивалентны:

``` sql
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
