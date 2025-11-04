---
slug: '/sql-reference/aggregate-functions/reference/skewsamp'
sidebar_position: 186
description: 'Вычисляет выборочную асимметрию последовательности.'
title: skewSamp
doc_type: reference
---
# skewSamp

Вычисляет [дисперсию выборки](https://en.wikipedia.org/wiki/Skewness) последовательности.

Это беспристрастная оценка асимметрии случайной величины, если переданные значения образуют её выборку.

```sql
skewSamp(expr)
```

**Аргументы**

`expr` — [Выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Асимметрия данной распределения. Тип — [Float64](../../../sql-reference/data-types/float.md). Если `n <= 1` (`n` — размер выборки), то функция возвращает `nan`.

**Пример**

```sql
SELECT skewSamp(value) FROM series_with_value_column;
```