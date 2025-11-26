---
description: '精确计算数值数据序列的分位数，并考虑每个元素的权重。'
sidebar_position: 174
slug: /sql-reference/aggregate-functions/reference/quantileexactweighted
title: 'quantileExactWeighted'
doc_type: 'reference'
---

# quantileExactWeighted

精确计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)，并考虑每个元素的权重。

为得到精确结果，会将传入的所有数值合并为一个数组，然后对该数组进行部分排序。每个值会按其权重进行计数，就好像它重复出现了 `weight` 次一样。算法中使用了哈希表。因此，如果传入的数值频繁重复，则该函数比 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 消耗更少的 RAM。可以使用该函数替代 `quantileExact`，并将权重设为 1。

在查询中使用多个具有不同 level 的 `quantile*` 函数时，其内部状态不会被合并（也就是说，查询的执行效率低于理论上可能达到的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
加权精确分位数(level)(expr, weight)
```

别名：`medianExactWeighted`。

**参数**

* `level` — 分位数水平。可选参数。取值为 0 到 1 的常量浮点数。建议在 `[0.01, 0.99]` 范围内使用 `level` 值。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 在列值上进行计算的表达式，结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
* `weight` — 序列成员的权重列。权重表示该值出现的次数，使用[无符号整数类型](../../../sql-reference/data-types/int-uint.md)表示。

**返回值**

* 指定水平的分位数。

类型：

* 数值数据类型输入时为 [Float64](../../../sql-reference/data-types/float.md)。
* 输入值为 `Date` 类型时为 [Date](../../../sql-reference/data-types/date.md)。
* 输入值为 `DateTime` 类型时为 [DateTime](../../../sql-reference/data-types/datetime.md)。

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
