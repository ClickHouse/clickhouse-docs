---
slug: /sql-reference/aggregate-functions/reference/kurtpop
sidebar_position: 157
title: 'kurtPop'
description: 'Вычисляет куртозис последовательности.'
---


# kurtPop

Вычисляет [куртозис](https://en.wikipedia.org/wiki/Kurtosis) последовательности.

``` sql
kurtPop(expr)
```

**Аргументы**

`expr` — [Выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Куртозис данного распределения. Тип — [Float64](../../../sql-reference/data-types/float.md)

**Пример**

``` sql
SELECT kurtPop(value) FROM series_with_value_column;
```
