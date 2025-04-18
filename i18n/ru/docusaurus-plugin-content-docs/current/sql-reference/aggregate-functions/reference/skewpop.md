---
description: 'Вычисляет асимметрию последовательности.'
sidebar_position: 185
slug: /sql-reference/aggregate-functions/reference/skewpop
title: 'skewPop'
---


# skewPop

Вычисляет [асимметрию](https://en.wikipedia.org/wiki/Skewness) последовательности.

```sql
skewPop(expr)
```

**Аргументы**

`expr` — [Выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Асимметрия данного распределения. Тип — [Float64](../../../sql-reference/data-types/float.md)

**Пример**

```sql
SELECT skewPop(value) FROM series_with_value_column;
```
