---
description: '使用线性插值法在数值数据序列上计算分位数，并考虑每个元素的权重。'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted
title: 'quantileInterpolatedWeighted'
doc_type: 'reference'
---

# quantileInterpolatedWeighted {#quantileinterpolatedweighted}

使用线性插值计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)，并考虑每个元素的权重。

为了得到插值结果，首先将传入的所有值组合成一个数组，然后按照它们对应的权重进行排序。接着使用[加权百分位方法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)进行分位数插值：基于权重构建累积分布，再利用权重和值进行线性插值来计算分位数。

在查询中使用多个具有不同级别的 `quantile*` 函数时，它们的内部状态不会被合并（也就是说，该查询的执行效率会低于本可达到的最优效果）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileInterpolatedWeighted(level)(expr, weight)
```

别名：`medianInterpolatedWeighted`。

**参数**

* `level` — 分位水平。可选参数，为 0 到 1 之间的常量浮点数。建议在 `[0.01, 0.99]` 范围内选择 `level` 值。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 基于列值计算的表达式，其结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
* `weight` — 包含序列成员权重的列。权重表示该值出现的次数。

**返回值**

* 指定水平的分位数。

类型：

* 对于数值型输入数据类型，返回 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值的类型为 `Date`，返回 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值的类型为 `DateTime`，返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

查询：

```sql
SELECT quantileInterpolatedWeighted(n, val) FROM t
```

结果：

```text
┌─quantileInterpolatedWeighted(n, val)─┐
│                                    1 │
└──────────────────────────────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
