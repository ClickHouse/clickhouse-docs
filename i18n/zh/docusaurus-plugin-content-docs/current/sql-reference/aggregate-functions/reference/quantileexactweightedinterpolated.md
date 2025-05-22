---
'description': '计算数字数据序列的分位数，使用线性插值，并考虑每个元素的权重。'
'sidebar_position': 176
'slug': '/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated'
'title': 'quantileExactWeightedInterpolated'
---


# quantileExactWeightedInterpolated

计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)，使用线性插值，考虑每个元素的权重。

为了获得插值结果，所有传入的值被组合成一个数组，然后根据其对应的权重进行排序。分位数插值是通过构建基于权重的累积分布，采用[加权百分位法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)来执行的，然后使用权重和值进行线性插值以计算分位数。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（也就是说，查询的效率不如它本可以达到的那样）。在这种情况下，建议使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

我们强烈推荐使用 `quantileExactWeightedInterpolated` 而不是 `quantileInterpolatedWeighted`，因为 `quantileExactWeightedInterpolated` 比 `quantileInterpolatedWeighted` 更加准确。以下是一个示例：

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

别名: `medianExactWeightedInterpolated`.

**参数**

- `level` — 分位数的级别。可选参数。0 到 1 之间的常量浮点数。我们建议使用 `level` 值范围在 `[0.01, 0.99]` 内。默认值: 0.5。在 `level=0.5` 时，此函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，结果为数值型[数据类型](/sql-reference/data-types)，[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — 包含序列成员权重的列。权重是具有[无符号整数类型](../../../sql-reference/data-types/int-uint.md)的值出现次数。

**返回值**

- 指定级别的分位数。

类型：

- 数值数据类型输入的[Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值具有 `Date` 类型，则返回[Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则返回[DateTime](../../../sql-reference/data-types/datetime.md)。

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
