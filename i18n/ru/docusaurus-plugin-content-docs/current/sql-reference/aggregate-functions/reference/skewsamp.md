---
description: 'Вычисляет выборочную асимметрию последовательности.'
sidebar_position: 186
slug: /sql-reference/aggregate-functions/reference/skewsamp
title: 'skewSamp'
---


# skewSamp

Вычисляет [выборочную асимметрию](https://en.wikipedia.org/wiki/Skewness) последовательности.

Это представляет собой несмещенную оценку асимметрии случайной величины, если переданные значения формируют ее выборку.

```sql
skewSamp(expr)
```

**Аргументы**

`expr` — [Выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Асимметрия данного распределения. Тип — [Float64](../../../sql-reference/data-types/float.md). Если `n <= 1` (`n` — размер выборки), то функция возвращает `nan`.

**Пример**

```sql
SELECT skewSamp(value) FROM series_with_value_column;
```
