---
description: 'Вычисляет выборочную асимметрию последовательности.'
sidebar_position: 186
slug: /sql-reference/aggregate-functions/reference/skewsamp
title: 'skewSamp'
doc_type: 'reference'
---

# skewSamp {#skewsamp}

Вычисляет [выборочную асимметрию](https://en.wikipedia.org/wiki/Skewness) последовательности.

Представляет собой несмещённую оценку асимметрии случайной величины, если переданные значения образуют её выборку.

```sql
skewSamp(expr)
```

**Аргументы**

`expr` — [выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Асимметрия заданного распределения. Тип — [Float64](../../../sql-reference/data-types/float.md). Если `n <= 1` (`n` — размер выборки), функция возвращает `nan`.

**Пример**

```sql
SELECT skewSamp(value) FROM series_with_value_column;
```
