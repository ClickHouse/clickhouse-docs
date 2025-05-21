---
'description': 'Calculates the value of the population covariance'
'sidebar_position': 123
'slug': '/sql-reference/aggregate-functions/reference/covarpopstable'
'title': 'covarPopStable'
---




# covarPopStable

计算总体协方差的值：

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{n}
$$

它与[covarPop](../reference/covarpop.md)函数类似，但使用了数值稳定的算法。因此，`covarPopStable`比`covarPop`慢，但产生更准确的结果。


**语法**

```sql
covarPop(x, y)
```

**参数**

- `x` — 第一个变量。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal](../../data-types/decimal.md)。
- `y` — 第二个变量。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal](../../data-types/decimal.md)。

**返回值**

- `x`和`y`之间的总体协方差。[Float64](../../data-types/float.md)。

**示例**

查询：

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series(i UInt32, x_value Float64, y_value Float64) ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6,-4.4),(2, -9.6,3),(3, -1.3,-4),(4, 5.3,9.7),(5, 4.4,0.037),(6, -8.6,-7.8),(7, 5.1,9.3),(8, 7.9,-3.6),(9, -8.2,0.62),(10, -3,7.3);
```

```sql
SELECT covarPopStable(x_value, y_value)
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
┌─covarPopStable(x_value, y_value)─┐
│                         6.485648 │
└──────────────────────────────────┘
```
