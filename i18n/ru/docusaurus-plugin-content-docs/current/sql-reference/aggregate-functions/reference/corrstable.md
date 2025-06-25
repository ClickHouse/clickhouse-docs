---
description: 'Вычисляет коэффициент корреляции Пирсона, но использует численно стабильный алгоритм.'
sidebar_position: 119
slug: /sql-reference/aggregate-functions/reference/corrstable
title: 'corrStable'
---


# corrStable

Вычисляет [коэффициент корреляции Пирсона](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient): 

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{\sqrt{\Sigma{(x - \bar{x})^2} * \Sigma{(y - \bar{y})^2}}}
$$

Похож на функцию [`corr`](../reference/corr.md), но использует численно стабильный алгоритм. В результате `corrStable` медленнее, чем `corr`, но выдает более точный результат.

**Синтаксис**

```sql
corrStable(x, y)
```

**Аргументы**

- `x` — первая переменная. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).
- `y` — вторая переменная. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).

**Возвращаемое значение**

- Коэффициент корреляции Пирсона. [Float64](../../data-types/float.md).

***Пример**

Запрос:

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series
(
    i UInt32,
    x_value Float64,
    y_value Float64
)
ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6, -4.4),(2, -9.6, 3),(3, -1.3, -4),(4, 5.3, 9.7),(5, 4.4, 0.037),(6, -8.6, -7.8),(7, 5.1, 9.3),(8, 7.9, -3.6),(9, -8.2, 0.62),(10, -3, 7.3);
```

```sql
SELECT corrStable(x_value, y_value)
FROM series;
```

Результат:

```response
┌─corrStable(x_value, y_value)─┐
│          0.17302657554532558 │
└──────────────────────────────┘
```
