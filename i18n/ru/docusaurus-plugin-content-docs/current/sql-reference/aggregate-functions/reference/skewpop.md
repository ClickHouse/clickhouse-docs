---
slug: /sql-reference/aggregate-functions/reference/skewpop
sidebar_position: 185
title: 'skewPop'
description: 'Вычисляет асимметрию последовательности.'
---


# skewPop

Вычисляет [асимметрию](https://en.wikipedia.org/wiki/Skewness) последовательности.

``` sql
skewPop(expr)
```

**Аргументы**

`expr` — [Выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Асимметрия заданного распределения. Тип — [Float64](../../../sql-reference/data-types/float.md)

**Пример**

``` sql
SELECT skewPop(value) FROM series_with_value_column;
```
