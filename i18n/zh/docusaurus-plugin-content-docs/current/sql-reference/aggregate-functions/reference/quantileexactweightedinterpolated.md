---
'description': 'Computes quantile of a numeric data sequence using linear interpolation,
  taking into account the weight of each element.'
'sidebar_position': 176
'slug': '/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated'
'title': 'quantileExactWeightedInterpolated'
---




# quantileExactWeightedInterpolated

计算一个数字数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)，使用线性插值，并考虑每个元素的权重。

为了获取插值，所有传递的值被组合成一个数组，然后根据它们对应的权重进行排序。然后使用 [加权百分位法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method) 通过构建基于权重的累积分布进行分位数插值，接着使用权重和数值进行线性插值以计算分位数。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会被合并（也就是说，查询的效率比可能的要低）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

我们强烈建议使用 `quantileExactWeightedInterpolated` 而不是 `quantileInterpolatedWeighted`，因为 `quantileExactWeightedInterpolated` 的准确性高于 `quantileInterpolatedWeighted`。以下是一个例子：

```sql
SELECT
    quantileExactWeightedInterpolated(0.99)(number, 1),
    quantile(0.99)(number),
    quantileInterpolatedWeighted(0.99)(number, 1)
FROM numbers(9)


┌─quantileExactWeightedInterpolated(0.99)(number, 1)─┬─quantile(0.99)(number)─┬─quantileInterpolatedWeighted(0.99)(number, 1)─┐
│                                               7.92 │                   7.92 │                                             8 │
└────────────────────────────────────────────────────┴────────────────────────┴───────────────────────────────────────────────┘
```

**语法**

```sql
quantileExactWeightedInterpolated(level)(expr, weight)
```

别名: `medianExactWeightedInterpolated`。

**参数**

- `level` — 分位数的级别。可选参数。范围为 0 到 1 的常量浮点数。我们建议使用 `level` 值在 `[0.01, 0.99]` 范围内。默认值：0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 对列值的表达式，结果为数值 [数据类型](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — 所有序列成员的权重列。权重是值出现次数的数字，使用 [无符号整数类型](../../../sql-reference/data-types/int-uint.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数值数据类型输入，返回 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值为 `Date` 类型，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值为 `DateTime` 类型，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

输入表：

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

结果：

```text
┌─quantileExactWeightedInterpolated(n, val)─┐
│                                       1.5 │
└───────────────────────────────────────────┘
```

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
