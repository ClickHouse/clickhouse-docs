---
description: '精确计算数值数据序列的分位数，并考虑到每个元素的权重。'
sidebar_position: 174
slug: /sql-reference/aggregate-functions/reference/quantileexactweighted
title: 'quantileExactWeighted'
doc_type: 'reference'
---

# quantileExactWeighted

精确计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)，并考虑每个元素的权重。

为了得到精确值，所有传入的值会被合并到一个数组中，然后对该数组进行部分排序。每个值按照其权重计数，就好像它出现了 `weight` 次。算法内部使用哈希表。正因为如此，如果传入的值频繁重复，该函数消耗的 RAM 会少于 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)。可以使用此函数代替 `quantileExact`，并将权重指定为 1。

在一个查询中使用多个带有不同分位等级的 `quantile*` 函数时，它们的内部状态不会被合并（也就是说，该查询的执行效率低于理论上的最优情况）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileExactWeighted(level)(expr, weight)
```

别名：`medianExactWeighted`。

**参数**

* `level` — 分位水平。可选参数。取值为 0 到 1 之间的常量浮点数。建议在 `[0.01, 0.99]` 范围内使用 `level` 值。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 作用于列值的表达式，结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
* `weight` — 包含序列成员权重的列。权重表示值出现的次数，使用[无符号整数类型](../../../sql-reference/data-types/int-uint.md)表示。

**返回值**

* 指定水平的分位数。

类型：

* 数值数据类型输入时返回 [Float64](../../../sql-reference/data-types/float.md)。
* 输入值为 `Date` 类型时返回 [Date](../../../sql-reference/data-types/date.md)。
* 输入值为 `DateTime` 类型时返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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
SELECT quantileExactWeighted(n, val) FROM t
```

结果：

```text
┌─quantileExactWeighted(n, val)─┐
│                             1 │
└───────────────────────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
