---
'description': '计算 Pearson 相关系数.'
'sidebar_position': 117
'slug': '/sql-reference/aggregate-functions/reference/corr'
'title': 'corr'
'doc_type': 'reference'
---


# corr

计算 [Pearson 相关系数](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient):

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{\sqrt{\Sigma{(x - \bar{x})^2} * \Sigma{(y - \bar{y})^2}}}
$$

<br/>
:::note
此函数使用了一种数值不稳定的算法。如果您需要计算中的 [数值稳定性](https://en.wikipedia.org/wiki/Numerical_stability)，请使用 [`corrStable`](../reference/corrstable.md) 函数。此函数较慢，但能提供更准确的结果。
:::

**语法**

```sql
corr(x, y)
```

**参数**

- `x` — 第一个变量。[(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md).
- `y` — 第二个变量。[(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md).

**返回值**

- Pearson 相关系数。 [Float64](../../data-types/float.md).

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
