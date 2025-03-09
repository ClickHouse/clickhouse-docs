---
slug: /sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated
sidebar_position: 176
title: 'quantileExactWeightedInterpolated'
description: '计算数值数据序列的分位数，使用线性插值，并考虑每个元素的权重。'
---


# quantileExactWeightedInterpolated

计算 [分位数](https://en.wikipedia.org/wiki/Quantile) 的数值数据序列，使用线性插值，并考虑每个元素的权重。

为了得到插值值，所有传入的值被组合成一个数组，然后根据它们相应的权重进行排序。然后使用 [加权百分位法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method) 通过构建基于权重的累积分布进行分位数插值，随后使用权重和数值进行线性插值以计算分位数。

当在一个查询中使用多个不同层级的 `quantile*` 函数时，内部状态不会合并（即，查询的效率低于可能的水平）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

我们强烈建议使用 `quantileExactWeightedInterpolated` 而不是 `quantileInterpolatedWeighted`，因为 `quantileExactWeightedInterpolated` 比 `quantileInterpolatedWeighted` 更为准确。下面是一个例子：

``` sql
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

``` sql
quantileExactWeightedInterpolated(level)(expr, weight)
```

别名: `medianExactWeightedInterpolated`.

**参数**

- `level` — 分位数的水平。可选参数。常量浮点数，范围为 0 到 1。我们建议使用 `level` 值在 `[0.01, 0.99]` 范围内。默认值: 0.5。当 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 适用于列值的表达式，结果为数值 [数据类型](/sql-reference/data-types)，[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — 序列成员的权重列。权重是值出现的次数，其类型为 [无符号整数类型](../../../sql-reference/data-types/int-uint.md)。

**返回值**

- 指定层级的分位数。

类型：

- 数值数据类型输入的 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值属于 `Date` 类型，则为 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值属于 `DateTime` 类型，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

输入表：

``` text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

结果：

``` text
┌─quantileExactWeightedInterpolated(n, val)─┐
│                                       1.5 │
└───────────────────────────────────────────┘
```

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
