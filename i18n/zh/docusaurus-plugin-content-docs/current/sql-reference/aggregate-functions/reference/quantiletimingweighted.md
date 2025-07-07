---
'description': '根据每个序列成员的权重，以确定的精度计算数字数据序列的分位数。'
'sidebar_position': 181
'slug': '/sql-reference/aggregate-functions/reference/quantiletimingweighted'
'title': 'quantileTimingWeighted'
---


# quantileTimingWeighted

使用确定的精度，根据每个序列成员的权重计算数值数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)。

结果是确定性的（不依赖于查询处理顺序）。该函数经过优化，可以与描述分布的序列一起使用，如加载网页时间或后端响应时间。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即，查询的工作效率低于可能的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileTimingWeighted(level)(expr, weight)
```

别名：`medianTimingWeighted`。

**参数**

- `level` — 分位数的级别。可选参数。范围为 0 到 1 的常量浮点数。我们建议使用范围在 `[0.01, 0.99]` 之间的 `level` 值。默认值：0.5。当 `level=0.5` 时，该函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。

- `expr` — 对列值的 [表达式](/sql-reference/syntax#expressions)，返回一个 [Float\*](../../../sql-reference/data-types/float.md)-类型的数字。

        - 如果传递给函数的是负值，则行为未定义。
        - 如果值大于 30,000（加载时间超过 30 秒），则假定为 30,000。

- `weight` — 包含序列元素权重的列。权重是值出现次数的数字。

**精确度**

计算准确的条件为：

- 值的总数不超过 5670。
- 值的总数超过 5670，但页面加载时间小于 1024ms。

否则，计算结果将四舍五入到 16 毫秒的最接近倍数。

:::note    
在计算页面加载时间分位数时，该函数比 [quantile](/sql-reference/aggregate-functions/reference/quantile) 更有效且准确。
:::

**返回值**

- 指定级别的分位数。

类型： `Float32`。

:::note    
如果没有值传递给函数（使用 `quantileTimingIf` 时），将返回 [NaN](/sql-reference/data-types/float#nan-and-inf)。此目的在于将这些情况与结果为零的情况区分开。有关排序 `NaN` 值的说明，请参阅 [ORDER BY 子句](/sql-reference/statements/select/order-by)。
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

与 `quantileTimingWeighted` 相同，但接受多个具有分位数级别的参数，并返回一个填充多个分位数值的数组。

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
