---
description: 'Используется для тестирования как самый быстрый метод генерации многих строк.
  Похож на системные таблицы `system.zeros` и `system.zeros_mt`.'
sidebar_label: 'zeros'
sidebar_position: 145
slug: /sql-reference/table-functions/zeros
title: 'zeros'
---


# Функция таблицы zeros

* `zeros(N)` – Возвращает таблицу с единственной колонкой 'zero' (UInt8), содержащей целое число 0 `N` раз
* `zeros_mt(N)` – То же самое, что и `zeros`, но использует несколько потоков.

Эта функция используется для тестирования как самый быстрый метод генерации многих строк. Похожа на системные таблицы `system.zeros` и `system.zeros_mt`.

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
