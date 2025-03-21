---
slug: /sql-reference/aggregate-functions/reference/skewsamp
sidebar_position: 186
title: 'skewSamp'
description: 'Вычисляет выборочную асимметрию последовательности.'
---


# skewSamp

Вычисляет [выборочную асимметрию](https://en.wikipedia.org/wiki/Skewness) последовательности.

Она представляет собой несмещенную оценку асимметрии случайной величины, если переданные значения составляют её выборку.

``` sql
skewSamp(expr)
```

**Аргументы**

`expr` — [Выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Асимметрия данной распределения. Тип — [Float64](../../../sql-reference/data-types/float.md). Если `n <= 1` (`n` — размер выборки), тогда функция возвращает `nan`.

**Пример**

``` sql
SELECT skewSamp(value) FROM series_with_value_column;
```
