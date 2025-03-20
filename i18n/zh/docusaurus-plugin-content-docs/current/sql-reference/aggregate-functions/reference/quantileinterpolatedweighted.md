---
slug: /sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted
sidebar_position: 176
title: 'quantileInterpolatedWeighted'
description: '计算使用线性插值的数值数据序列的分位数，同时考虑每个元素的权重。'
---


# quantileInterpolatedWeighted

计算 [分位数](https://en.wikipedia.org/wiki/Quantile) 的数值数据序列，使用线性插值，同时考虑每个元素的权重。

为了获得插值结果，所有传入的值被组合成一个数组，然后根据相应的权重进行排序。然后通过基于权重构建累积分布来执行分位数插值，通过权重和值进行线性插值来计算分位数。

当在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会组合（也就是说，查询的效率低于其潜在效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

``` sql
quantileInterpolatedWeighted(level)(expr, weight)
```

别名: `medianInterpolatedWeighted`。

**参数**

- `level` — 分位数的级别。可选参数。0 到 1 的常量浮点数。我们建议使用 `level` 值在 `[0.01, 0.99]` 范围内。默认值: 0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，生成数值 [数据类型](/sql-reference/data-types)，[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — 序列成员的权重列。权重是值出现次数的数字。

**返回值**

- 指定级别的分位数。

类型：

- 输入为数值数据类型时为 [Float64](../../../sql-reference/data-types/float.md)。
- 输入值为 `Date` 类型时为 [Date](../../../sql-reference/data-types/date.md)。
- 输入值为 `DateTime` 类型时为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

输入表:

``` text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

查询:

``` sql
SELECT quantileInterpolatedWeighted(n, val) FROM t
```

结果:

``` text
┌─quantileInterpolatedWeighted(n, val)─┐
│                                    1 │
└──────────────────────────────────────┘
```

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
