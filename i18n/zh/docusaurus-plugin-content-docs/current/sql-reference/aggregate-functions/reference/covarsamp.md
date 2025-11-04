---
'description': "计算值为 `\x03a3((x - x\x0305)(y - y\x0305)) / (n - 1)`"
'sidebar_position': 124
'slug': '/sql-reference/aggregate-functions/reference/covarsamp'
'title': 'covarSamp'
'doc_type': 'reference'
---


# covarSamp

计算 `Σ((x - x̅)(y - y̅)) / (n - 1)` 的值。

:::note
此函数使用数值不稳定的算法。如果您需要计算中的 [数值稳定性](https://en.wikipedia.org/wiki/Numerical_stability)，请使用 [`covarSampStable`](../reference/covarsamp.md) 函数。它的计算速度较慢，但提供较低的计算误差。
:::

**语法**

```sql
covarSamp(x, y)
```

**参数**

- `x` — 第一个变量。 [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md)。
- `y` — 第二个变量。 [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md)。

**返回值**

- `x` 和 `y` 之间的样本协方差。当 `n <= 1` 时，返回 `nan`。 [Float64](../../data-types/float.md)。

**示例**

查询：

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series(i UInt32, x_value Float64, y_value Float64) ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6,-4.4),(2, -9.6,3),(3, -1.3,-4),(4, 5.3,9.7),(5, 4.4,0.037),(6, -8.6,-7.8),(7, 5.1,9.3),(8, 7.9,-3.6),(9, -8.2,0.62),(10, -3,7.3);
```

```sql
SELECT covarSamp(x_value, y_value)
FROM
(
    SELECT
        x_value,
        y_value
    FROM series
);
```

结果：

```reference
┌─covarSamp(x_value, y_value)─┐
│           7.206275555555556 │
└─────────────────────────────┘
```

查询：

```sql
SELECT covarSamp(x_value, y_value)
FROM
(
    SELECT
        x_value,
        y_value
    FROM series LIMIT 1
);

```

结果：

```reference
┌─covarSamp(x_value, y_value)─┐
│                         nan │
└─────────────────────────────┘
```
