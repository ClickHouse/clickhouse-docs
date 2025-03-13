---
slug: /sql-reference/aggregate-functions/reference/kurtsamp
sidebar_position: 158
title: "kurtSamp"
description: "Вычисляет выборочную куртозис последовательности."
---


# kurtSamp

Вычисляет [выборочный куртозис](https://en.wikipedia.org/wiki/Kurtosis) последовательности.

Он представляет собой несмещенную оценку куртозиса случайной переменной, если переданные значения образуют её выборку.

``` sql
kurtSamp(expr)
```

**Аргументы**

`expr` — [Выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Куртозис данной распределения. Тип — [Float64](../../../sql-reference/data-types/float.md). Если `n <= 1` (`n` — размер выборки), функция возвращает `nan`.

**Пример**

``` sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
