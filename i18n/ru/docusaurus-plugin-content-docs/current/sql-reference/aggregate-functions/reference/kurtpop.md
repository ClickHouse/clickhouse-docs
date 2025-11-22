---
description: 'Вычисляет эксцесс для последовательности.'
sidebar_position: 157
slug: /sql-reference/aggregate-functions/reference/kurtpop
title: 'kurtPop'
doc_type: 'reference'
---

# kurtPop

Вычисляет [эксцесс](https://en.wikipedia.org/wiki/Kurtosis) последовательности значений.

```sql
kurtPop(expr)
```

**Аргументы**

`expr` — [выражение](/sql-reference/syntax#expressions), возвращающее число.

**Возвращаемое значение**

Эксцесс заданного распределения. Тип — [Float64](../../../sql-reference/data-types/float.md).

**Пример**

```sql
SELECT kurtPop(value) FROM series_with_value_column;
```
