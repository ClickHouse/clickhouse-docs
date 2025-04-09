---
description: 'Агрегатная функция, которая вычисляет наклон между самыми левыми и самыми правыми точками группы значений.'
sidebar_position: 114
slug: /sql-reference/aggregate-functions/reference/boundingRatio
title: 'boundingRatio'
---

Агрегатная функция, которая вычисляет наклон между самыми левыми и самыми правыми точками группы значений.

Пример:

Пример данных:
```sql
SELECT
    number,
    number * 1.5
FROM numbers(10)
```
```response
┌─number─┬─multiply(number, 1.5)─┐
│      0 │                     0 │
│      1 │                   1.5 │
│      2 │                     3 │
│      3 │                   4.5 │
│      4 │                     6 │
│      5 │                   7.5 │
│      6 │                     9 │
│      7 │                  10.5 │
│      8 │                    12 │
│      9 │                  13.5 │
└────────┴───────────────────────┘
```

Функция boundingRatio() возвращает наклон линии между самыми левыми и самыми правыми точками, в приведенных выше данных эти точки — `(0,0)` и `(9,13.5)`.

```sql
SELECT boundingRatio(number, number * 1.5)
FROM numbers(10)
```
```response
┌─boundingRatio(number, multiply(number, 1.5))─┐
│                                          1.5 │
└──────────────────────────────────────────────┘
```
