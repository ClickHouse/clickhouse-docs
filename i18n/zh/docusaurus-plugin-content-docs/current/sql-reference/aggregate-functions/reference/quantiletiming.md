---
'description': '使用确定的精度计算数值数据序列的分位数。'
'sidebar_position': 180
'slug': '/sql-reference/aggregate-functions/reference/quantiletiming'
'title': 'quantileTiming'
'doc_type': 'reference'
---


# quantileTiming

通过确定的精度计算数字数据序列的 [quantile](https://en.wikipedia.org/wiki/Quantile)。

结果是确定性的（它不依赖于查询处理顺序）。该函数经过优化，适用于描述诸如网页加载时间或后端响应时间等分布的序列。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会组合（也就是说，查询的效率低于可能的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileTiming(level)(expr)
```

别名：`medianTiming`。

**参数**

- `level` — 分位数的级别。可选参数。常量浮点数，范围为 0 到 1。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，该函数计算 [median](https://en.wikipedia.org/wiki/Median)。

- `expr` — [表达式](/sql-reference/syntax#expressions)，对列值进行操作，返回 [Float\*](../../../sql-reference/data-types/float.md) 类型的数字。

  - 如果传递给函数的是负值，则行为是未定义的。
  - 如果值大于 30,000（加载时间超过 30 秒），则假定其为 30,000。

**准确性**

如果满足以下条件，则计算是准确的：

- 值的总数不超过 5670。
- 值的总数超过 5670，但页面加载时间少于 1024 毫秒。

否则，计算结果将四舍五入到最接近的 16 毫秒的倍数。

:::note    
对于计算页面加载时间的分位数，该函数比 [quantile](/sql-reference/aggregate-functions/reference/quantile) 更有效且更准确。
:::

**返回值**

- 指定级别的分位数。

类型：`Float32`。

:::note    
如果没有值传递给该函数（使用 `quantileTimingIf` 时），将返回 [NaN](/sql-reference/data-types/float#nan-and-inf)。这样做是为了将这些情况与结果为零的情况区分开。有关排序 `NaN` 值的说明，请参见 [ORDER BY 子句](/sql-reference/statements/select/order-by)。
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

**另请参阅**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
