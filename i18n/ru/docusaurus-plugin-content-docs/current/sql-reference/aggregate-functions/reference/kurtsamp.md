---
description: 'Вычисляет выборочную эксцизу последовательности.'
sidebar_position: 158
slug: /sql-reference/aggregate-functions/reference/kurtsamp
title: 'kurtSamp'
---


# kurtSamp

Вычисляет [выборочную эксцизу](https://en.wikipedia.org/wiki/Kurtosis) последовательности.

Она представляет собой несмещённую оценку эксцизы случайной величины, если переданные значения формируют её выборку.

```sql
kurtSamp(expr)
```

**Аргументы**

`expr` — [Выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Эксциза данной распределения. Тип — [Float64](../../../sql-reference/data-types/float.md). Если `n <= 1` (`n` — размер выборки), тогда функция возвращает `nan`.

**Пример**

```sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
