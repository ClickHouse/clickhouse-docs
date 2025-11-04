---
'description': '根据每个序列成员的权重，用确定的精度计算数字数据序列的分位数。'
'sidebar_position': 181
'slug': '/sql-reference/aggregate-functions/reference/quantiletimingweighted'
'title': 'quantileTimingWeighted'
'doc_type': 'reference'
---


# quantileTimingWeighted

在确定的精度下，根据每个序列成员的权重计算数字数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)。

结果是确定性的（不依赖于查询处理顺序）。该函数经过优化，用于处理描述分布的序列，如加载网页时间或后端响应时间。

当在查询中使用多个 `quantile*` 函数且有不同的级别时，内部状态不会合并（即，查询工作效率低于可能的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileTimingWeighted(level)(expr, weight)
```

别名：`medianTimingWeighted`。

**参数**

- `level` — 分位数的级别。可选参数。范围在 0 到 1 之间的常量浮点数。我们建议使用范围在 `[0.01, 0.99]` 之间的 `level` 值。默认值：0.5。 在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。

- `expr` — 针对列值的 [表达式](/sql-reference/syntax#expressions)，返回一个 [Float\*](../../../sql-reference/data-types/float.md) 类型的数字。

        - 如果传递负值给函数，行为是未定义的。
        - 如果值大于 30,000（页面加载时间超过 30 秒），则假定为 30,000。

- `weight` — 包含序列元素权重的列。权重是数值出现次数。

**准确性**

如果满足以下条件，则计算结果是准确的：

- 值的总数不超过 5670。
- 值的总数超过 5670，但页面加载时间小于 1024ms。

否则，计算结果会四舍五入到最接近的 16 ms 的倍数。

:::note    
对于计算页面加载时间的分位数，此函数比 [quantile](/sql-reference/aggregate-functions/reference/quantile) 更有效和准确。
:::

**返回值**

- 指定级别的分位数。

类型：`Float32`。

:::note    
如果没有值传递给函数（在使用 `quantileTimingIf` 时），将返回 [NaN](/sql-reference/data-types/float#nan-and-inf)。其目的是将这些情况与结果为零的情况区分开。有关排序 `NaN` 值的说明，请参见 [ORDER BY 子句](/sql-reference/statements/select/order-by)。
:::

**示例**

输入表：

```text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

查询：

```sql
SELECT quantileTimingWeighted(response_time, weight) FROM t
```

结果：

```text
┌─quantileTimingWeighted(response_time, weight)─┐
│                                           112 │
└───────────────────────────────────────────────┘
```


# quantilesTimingWeighted

与 `quantileTimingWeighted` 相同，但接受多个参数的分位数级别，并返回填充多个分位数值的数组。

**示例**

输入表：

```text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

查询：

```sql
SELECT quantilesTimingWeighted(0,5, 0.99)(response_time, weight) FROM t
```

结果：

```text
┌─quantilesTimingWeighted(0.5, 0.99)(response_time, weight)─┐
│ [112,162]                                                 │
└───────────────────────────────────────────────────────────┘
```

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
