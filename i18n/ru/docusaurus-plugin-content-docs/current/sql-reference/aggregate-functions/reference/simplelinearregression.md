---
description: 'Выполняет простую (одномерную) линейную регрессию.'
sidebar_position: 183
slug: /sql-reference/aggregate-functions/reference/simplelinearregression
title: 'simpleLinearRegression'
---


# simpleLinearRegression

Выполняет простую (одномерную) линейную регрессию.

```sql
simpleLinearRegression(x, y)
```

Параметры:

- `x` — Колонка со значениями объясняющей переменной.
- `y` — Колонка со значениями зависимой переменной.

Возвращаемые значения:

Константы `(k, b)` результирующей линии `y = k*x + b`.

**Примеры**

```sql
SELECT arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [0, 1, 2, 3])
```

```text
┌─arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [0, 1, 2, 3])─┐
│ (1,0)                                                             │
└───────────────────────────────────────────────────────────────────┘
```

```sql
SELECT arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [3, 4, 5, 6])
```

```text
┌─arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [3, 4, 5, 6])─┐
│ (1,3)                                                             │
└───────────────────────────────────────────────────────────────────┘
```
