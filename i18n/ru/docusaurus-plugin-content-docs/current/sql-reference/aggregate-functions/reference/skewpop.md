---
description: 'Вычисляет коэффициент асимметрии распределения последовательности.'
sidebar_position: 185
slug: /sql-reference/aggregate-functions/reference/skewpop
title: 'skewPop'
doc_type: 'reference'
---

# skewPop

Вычисляет [коэффициент асимметрии](https://en.wikipedia.org/wiki/Skewness) последовательности значений.

```sql
skewPop(expr)
```

**Аргументы**

`expr` — [выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Асимметрия заданного распределения. Тип — [Float64](../../../sql-reference/data-types/float.md)

**Пример**

```sql
SELECT skewPop(value) FROM series_with_value_column;
```
