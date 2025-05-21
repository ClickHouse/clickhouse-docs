---
'description': 'With the determined precision computes the quantile of a numeric data
  sequence.'
'sidebar_position': 180
'slug': '/sql-reference/aggregate-functions/reference/quantiletiming'
'title': 'quantileTiming'
---




# quantileTiming

使用确定的精度计算数值数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)。

结果是确定性的（不依赖于查询处理顺序）。该函数针对描述分布的序列进行了优化，比如加载网页的时间或后端响应时间。

当在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即查询的效率低于可能的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileTiming(level)(expr)
```

别名: `medianTiming`。

**参数**

- `level` — 分位数级别。可选参数。介于 0 到 1 之间的常量浮点数。我们建议使用范围为 `[0.01, 0.99]` 的 `level` 值。默认值: 0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。

- `expr` — 针对列值的 [表达式](/sql-reference/syntax#expressions)，返回一个 [Float*](../../../sql-reference/data-types/float.md) 类型的数字。

    - 如果传递给函数的是负值，则行为未定义。
    - 如果值大于 30,000（页面加载时间超过 30 秒），则认为该值为 30,000。

**准确性**

如果满足以下条件，计算结果是准确的：

- 值的总数不超过 5670。
- 值的总数超过 5670，但页面加载时间小于 1024ms。

否则，计算结果会四舍五入到最接近的 16 ms 的倍数。

:::note    
对于计算页面加载时间的分位数，此函数比 [quantile](/sql-reference/aggregate-functions/reference/quantile) 更有效且准确。
:::

**返回值**

- 指定级别的分位数。

类型: `Float32`。

:::note    
如果没有值传递给函数（使用 `quantileTimingIf` 时），则返回 [NaN](/sql-reference/data-types/float#nan-and-inf)。这样做的目的是为了区分这些情况与结果为零的情况。有关排序 `NaN` 值的说明，请参见 [ORDER BY 子句](/sql-reference/statements/select/order-by)。
:::

**示例**

输入表：

```text
┌─response_time─┐
│            72 │
│           112 │
│           126 │
│           145 │
│           104 │
│           242 │
│           313 │
│           168 │
│           108 │
└───────────────┘
```

查询：

```sql
SELECT quantileTiming(response_time) FROM t
```

结果：

```text
┌─quantileTiming(response_time)─┐
│                           126 │
└───────────────────────────────┘
```

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
