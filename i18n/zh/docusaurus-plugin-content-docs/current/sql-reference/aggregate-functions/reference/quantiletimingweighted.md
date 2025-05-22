
# quantileTimingWeighted

根据确定的精度计算数值数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)，考虑每个序列成员的权重。

结果是确定性的（不依赖于查询处理的顺序）。该函数针对描述分布的序列进行了优化，例如加载网页时间或后端响应时间。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即，查询的效率低于可能的效率）。在这种情况下，可以使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileTimingWeighted(level)(expr, weight)
```

别名：`medianTimingWeighted`。

**参数**

- `level` — 分位数的级别。可选参数。常量浮点数，范围从 0 到 1。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。

- `expr` — 针对列值的 [表达式](/sql-reference/syntax#expressions)，返回一个 [Float\*](../../../sql-reference/data-types/float.md) 类型的数字。

        - 如果对函数传递负值，则行为未定义。
        - 如果值大于 30,000（加载时间超过 30 秒），则假定为 30,000。

- `weight` — 列出序列元素的权重。权重是值出现次数的数字。

**准确性**

计算是准确的，如果：

- 值的总数不超过 5670。
- 值的总数超过 5670，但页面加载时间小于 1024ms。

否则，计算结果将四舍五入到离 16 毫秒最近的倍数。

:::note    
对于计算页面加载时间的分位数，该函数比 [quantile](/sql-reference/aggregate-functions/reference/quantile) 更有效且准确。
:::

**返回值**

- 指定级别的分位数。

类型：`Float32`。

:::note    
如果没有值传递给函数（在使用 `quantileTimingIf` 时），则返回 [NaN](/sql-reference/data-types/float#nan-and-inf)。这样做的目的是将这些情况与结果为零的情况区分开。有关排序 `NaN` 值的说明，请参见 [ORDER BY 子句](/sql-reference/statements/select/order-by)。
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

与 `quantileTimingWeighted` 相同，但接受多个参数（带有分位数级别），并返回一个填充了多个该分位数值的数组。

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
