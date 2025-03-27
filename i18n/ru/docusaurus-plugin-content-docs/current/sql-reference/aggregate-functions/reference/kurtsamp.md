---
description: 'Вычисляет выборочную куртозис последовательности.'
sidebar_position: 158
slug: /sql-reference/aggregate-functions/reference/kurtsamp
title: 'kurtSamp'
---


# kurtSamp

Вычисляет [выборочный куртозис](https://en.wikipedia.org/wiki/Kurtosis) последовательности.

Он представляет собой нез biaisную оценку куртозиса случайной величины, если переданные значения составляют ее выборку.

```sql
kurtSamp(expr)
```

**Аргументы**

`expr` — [Выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Куртозис данного распределения. Тип — [Float64](../../../sql-reference/data-types/float.md). Если `n <= 1` (`n` — размер выборки), функция возвращает `nan`.

**Пример**

```sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
