---
slug: /sql-reference/aggregate-functions/reference/quantileexactweighted
sidebar_position: 174
title: 'quantileExactWeighted'
description: '准确计算数字数据序列的分位数，考虑每个元素的权重。'
---


# quantileExactWeighted

准确计算 [分位数](https://en.wikipedia.org/wiki/Quantile) 的数字数据序列，考虑每个元素的权重。

为了获得精确值，所有传递的值被组合成一个数组，然后进行部分排序。每个值都按照其权重进行计数，就好像它存在 `weight` 次一样。该算法中使用了哈希表。因此，如果传递的值经常重复，该函数所消耗的内存比 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 更少。您可以使用此函数代替 `quantileExact` 并指定权重为 1。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即查询的效率不如可能的高）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

``` sql
quantileExactWeighted(level)(expr, weight)
```

别名: `medianExactWeighted`。

**参数**

- `level` — 分位数级别。可选参数。常量浮点数，从 0 到 1。我们建议使用 `level` 值在 `[0.01, 0.99]` 范围内。默认值: 0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，结果为数字 [数据类型](/sql-reference/data-types)、[日期](../../../sql-reference/data-types/date.md) 或 [日期时间](../../../sql-reference/data-types/datetime.md)。
- `weight` — 序列成员的权重列。权重是值出现次数的 [无符号整数类型](../../../sql-reference/data-types/int-uint.md)。

**返回值**

- 指定级别的分位数。

类型：

- 输入为数字数据类型时，返回 [Float64](../../../sql-reference/data-types/float.md)。
- 输入值为 `Date` 类型时，返回 [Date](../../../sql-reference/data-types/date.md)。
- 输入值为 `DateTime` 类型时，返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

查询：

``` sql
SELECT quantileExactWeighted(n, val) FROM t
```

结果：

``` text
┌─quantileExactWeighted(n, val)─┐
│                             1 │
└───────────────────────────────┘
```

**另请参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
