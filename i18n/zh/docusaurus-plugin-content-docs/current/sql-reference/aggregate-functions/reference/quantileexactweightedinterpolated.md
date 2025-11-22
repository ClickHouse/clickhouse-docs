---
description: '使用线性插值计算数值数据序列的分位数，并在计算中考虑每个元素的权重。'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated
title: 'quantileExactWeightedInterpolated'
doc_type: 'reference'
---

# quantileExactWeightedInterpolated

使用线性插值计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)，并考虑每个元素的权重。

为了得到插值结果，首先将传入的所有值合并到一个数组中，然后按照它们对应的权重进行排序。接着使用[加权百分位数方法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)进行分位数插值：基于权重构建累积分布，然后使用权重和数值进行线性插值来计算分位数。

在一个查询中使用多个不同分位水平的 `quantile*` 函数时，其内部状态不会被合并（也就是说，查询效率会低于本可达到的水平）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

我们强烈建议使用 `quantileExactWeightedInterpolated` 而不是 `quantileInterpolatedWeighted`，因为 `quantileExactWeightedInterpolated` 比 `quantileInterpolatedWeighted` 更精确。示例如下：

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

别名：`medianExactWeightedInterpolated`。

**参数**

* `level` — 分位数水平。可选参数。取值为 0 到 1 之间的常量浮点数。建议使用范围为 `[0.01, 0.99]` 的 `level` 值。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 作用于列值的表达式，其结果为数值[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
* `weight` — 包含序列成员权重的列。权重表示值的出现次数，使用[无符号整数类型](../../../sql-reference/data-types/int-uint.md)表示。

**返回值**

* 指定水平的分位数。

类型：

* 对数值数据类型输入，返回 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值的类型为 `Date`，则返回 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值的类型为 `DateTime`，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
