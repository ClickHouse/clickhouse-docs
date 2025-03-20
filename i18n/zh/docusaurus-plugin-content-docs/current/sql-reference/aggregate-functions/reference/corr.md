---
slug: /sql-reference/aggregate-functions/reference/corr
sidebar_position: 117
title: 'corr'
description: '计算皮尔逊相关系数。'
---


# corr

计算 [皮尔逊相关系数](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient):

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{\sqrt{\Sigma{(x - \bar{x})^2} * \Sigma{(y - \bar{y})^2}}}
$$


:::note
此函数使用数值不稳定的算法。如果您需要计算中的 [数值稳定性](https://en.wikipedia.org/wiki/Numerical_stability)，请使用 [`corrStable`](../reference/corrstable.md) 函数。虽然速度较慢，但提供了更准确的结果。
:::

**语法**

```sql
corr(x, y)
```

**参数**

- `x` — 第一个变量。[(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md)。
- `y` — 第二个变量。[(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md)。

**返回值**

- 皮尔逊相关系数。 [Float64](../../data-types/float.md)。

**示例**

查询:

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

结果:

```response
┌─corr(x_value, y_value)─┐
│     0.1730265755453256 │
└────────────────────────┘
```
