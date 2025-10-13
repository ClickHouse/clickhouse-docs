---
slug: '/sql-reference/aggregate-functions/reference/corr'
sidebar_position: 117
description: 'Вы calculates коэффициент корреляции Пирсона.'
title: corr
doc_type: reference
---
# corr

Вычисляет [коэффициент корреляции Пирсона](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient):

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{\sqrt{\Sigma{(x - \bar{x})^2} * \Sigma{(y - \bar{y})^2}}}
$$

<br/>
:::note
Эта функция использует численно нестабильный алгоритм. Если вам нужна [численная стабильность](https://en.wikipedia.org/wiki/Numerical_stability) в расчетах, используйте функцию [`corrStable`](../reference/corrstable.md). Она медленнее, но дает более точный результат.
:::

**Синтаксис**

```sql
corr(x, y)
```

**Аргументы**

- `x` — первая переменная. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md).
- `y` — вторая переменная. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md).

**Возвращаемое значение**

- Коэффициент корреляции Пирсона. [Float64](../../data-types/float.md).

**Пример**

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
SELECT corr(x_value, y_value)
FROM series;
```

Результат:

```response
┌─corr(x_value, y_value)─┐
│     0.1730265755453256 │
└────────────────────────┘
```