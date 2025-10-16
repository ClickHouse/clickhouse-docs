---
slug: '/sql-reference/aggregate-functions/reference/kurtsamp'
sidebar_position: 158
description: 'Вычисляет выборочную эксцессу последовательности.'
title: kurtSamp
doc_type: reference
---
# kurtSamp

Вычисляет [элемент выборочной куртозы](https://en.wikipedia.org/wiki/Kurtosis) последовательности.

Он представляет собой несмещенную оценку куртозы случайной величины, если переданные значения образуют ее выборку.

```sql
kurtSamp(expr)
```

**Аргументы**

`expr` — [Выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Куртоза данного распределения. Тип — [Float64](../../../sql-reference/data-types/float.md). Если `n <= 1` (`n` — размер выборки), то функция возвращает `nan`.

**Пример**

```sql
SELECT kurtSamp(value) FROM series_with_value_column;
```