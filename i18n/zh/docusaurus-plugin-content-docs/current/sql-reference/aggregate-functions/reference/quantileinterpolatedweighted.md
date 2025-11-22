---
description: '使用线性插值，在考虑每个元素权重的情况下计算数值数据序列的分位数。'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted
title: 'quantileInterpolatedWeighted'
doc_type: 'reference'
---

# quantileInterpolatedWeighted

使用线性插值计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)，并考虑每个元素的权重。

为了得到插值后的值，首先将所有传入的值合并为一个数组，然后按照其对应的权重进行排序。接着使用[加权百分位方法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)进行分位数插值：基于权重构建累积分布，然后使用权重和值进行线性插值来计算分位数。

在一个查询中使用多个具有不同分位水平的 `quantile*` 函数时，这些函数的内部状态不会被合并（也就是说，查询的执行效率低于其本可以达到的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileInterpolatedWeighted(level)(expr, weight)
```

别名：`medianInterpolatedWeighted`。

**参数**

* `level` — 分位数水平。可选参数。取值为 0 到 1 之间的常量浮点数。建议在 `[0.01, 0.99]` 范围内使用 `level` 值。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 针对列值的表达式，结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
* `weight` — 存放序列各成员权重的列。权重表示该值出现的次数。

**返回值**

* 指定水平的分位数。

类型：

* 对数值数据类型输入，返回 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值为 `Date` 类型，返回 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值为 `DateTime` 类型，返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

**另请参见**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
