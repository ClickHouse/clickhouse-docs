---
'description': '计算 Pearson 相关系数，但使用数值稳定算法。'
'sidebar_position': 119
'slug': '/sql-reference/aggregate-functions/reference/corrstable'
'title': 'corrStable'
'doc_type': 'reference'
---


# corrStable

计算 [Pearson 相关系数](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient)： 

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{\sqrt{\Sigma{(x - \bar{x})^2} * \Sigma{(y - \bar{y})^2}}}
$$

类似于 [`corr`](../reference/corr.md) 函数，但使用了数值稳定的算法。因此，`corrStable` 的速度比 `corr` 慢，但产生更准确的结果。

**语法**

```sql
corrStable(x, y)
```

**参数**

- `x` — 第一个变量。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal](../../data-types/decimal.md)。
- `y` — 第二个变量。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal](../../data-types/decimal.md)。

**返回值**

- Pearson 相关系数。 [Float64](../../data-types/float.md)。

***示例**

查询：

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

结果：

```response
┌─corrStable(x_value, y_value)─┐
│          0.17302657554532558 │
└──────────────────────────────┘
```
