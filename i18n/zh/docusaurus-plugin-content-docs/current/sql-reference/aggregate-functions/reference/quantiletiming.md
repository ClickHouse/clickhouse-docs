---
'description': '使用确定的精度计算数字数据序列的分位数。'
'sidebar_position': 180
'slug': '/sql-reference/aggregate-functions/reference/quantiletiming'
'title': 'quantileTiming'
---


# quantileTiming

使用确定的精度计算数值数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)。

结果是确定性的（它不依赖于查询处理顺序）。该函数经过优化，适用于描述分布的序列，例如加载网页的时间或后端响应时间。

当在查询中使用多个 `quantile*` 函数和不同的级别时，内部状态不会合并（即，查询的工作效率低于潜在的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileTiming(level)(expr)
```

别名: `medianTiming`。

**参数**

- `level` — 分位数的级别。可选参数。范围从 0 到 1 的常量浮点数。我们建议使用 `level` 值在 `[0.01, 0.99]` 的范围内。默认值：0.5。在 `level=0.5` 时，该函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。

- `expr` — 针对列值的 [表达式](/sql-reference/syntax#expressions)，返回 [Float\*](../../../sql-reference/data-types/float.md) 类型的数字。

    - 如果传递负值给函数，则行为未定义。
    - 如果值大于 30,000（页面加载时间超过 30 秒），则假定为 30,000。

**准确性**

如果满足以下条件，则计算是准确的：

- 值的总数不超过 5670。
- 值的总数超过 5670，但页面加载时间小于 1024 毫秒。

否则，计算结果将舍入到最接近的 16 毫秒的倍数。

:::note    
在计算页面加载时间的分位数时，该函数比 [quantile](/sql-reference/aggregate-functions/reference/quantile) 更有效且更准确。
:::

**返回值**

- 指定级别的分位数。

类型: `Float32`。

:::note    
如果没有值传递给函数（使用 `quantileTimingIf` 时），将返回 [NaN](/sql-reference/data-types/float#nan-and-inf)。这样做的目的是将这些情况与导致零的情况区分开。有关排序 `NaN` 值的说明，请参见 [ORDER BY 子句](/sql-reference/statements/select/order-by)。
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
