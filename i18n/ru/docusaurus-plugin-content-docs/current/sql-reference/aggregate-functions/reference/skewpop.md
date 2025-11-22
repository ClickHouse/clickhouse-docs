---
description: 'Вычисляет коэффициент асимметрии последовательности.'
sidebar_position: 185
slug: /sql-reference/aggregate-functions/reference/skewpop
title: 'skewPop'
doc_type: 'reference'
---

# skewPop

Вычисляет [асимметрию](https://en.wikipedia.org/wiki/Skewness) последовательности.

```sql
skewPop(expr)
```

**Аргументы**

`expr` — [выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Коэффициент асимметрии заданного распределения. Тип — [Float64](../../../sql-reference/data-types/float.md)

**Пример**

```sql
SELECT skewPop(value) FROM series_with_value_column;
```
