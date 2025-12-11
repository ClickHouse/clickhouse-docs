---
description: '采用线性插值方法并考虑每个元素的权重，计算数值数据序列的分位数。'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated
title: 'quantileExactWeightedInterpolated'
doc_type: 'reference'
---

# quantileExactWeightedInterpolated {#quantileexactweightedinterpolated}

使用线性插值计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)，并考虑每个元素的权重。

为了得到插值结果，首先将所有传入的数值组合成一个数组，然后按照其对应的权重进行排序。接着使用[加权百分位数方法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)进行分位数插值：根据权重构建累积分布，然后利用权重和值进行线性插值来计算分位数。

在查询中使用多个不同分位点的 `quantile*` 函数时，内部状态不会被合并（也就是说，该查询的执行效率会低于理论上的最优情况）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

我们强烈建议使用 `quantileExactWeightedInterpolated` 代替 `quantileInterpolatedWeighted`，因为 `quantileExactWeightedInterpolated` 比 `quantileInterpolatedWeighted` 更精确。下面是一个示例：

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

* `level` — 分位数级别。可选参数。取值为 0 到 1 之间的常量浮点数。建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 作用于列值的表达式，结果类型为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
* `weight` — 包含序列成员权重的列。权重表示该值的出现次数，使用[无符号整数类型](../../../sql-reference/data-types/int-uint.md)表示。

**返回值**

* 指定级别的分位数。

类型：

* 数值数据类型输入时为 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值为 `Date` 类型，则为 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值为 `DateTime` 类型，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

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
