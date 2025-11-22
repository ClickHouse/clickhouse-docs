---
description: '使用 Greenwald-Khanna 算法计算数值序列的分位数。'
sidebar_position: 175
slug: /sql-reference/aggregate-functions/reference/quantileGK
title: 'quantileGK'
doc_type: 'reference'
---

# quantileGK

使用 [Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf) 算法计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。Greenwald-Khanna 算法是一种用于在数据流上高效计算分位数的算法。该算法由 Michael Greenwald 和 Sanjeev Khanna 于 2001 年提出，在需要对大规模数据流进行实时分位数计算的数据库和大数据系统中被广泛采用。该算法具有很高的效率，每个元素只需 O(log n) 空间和 O(log log n) 时间（其中 n 为输入大小）。同时，其精度也很高，能够在较高概率下给出近似的分位数值。

`quantileGK` 与 ClickHouse 中的其他分位数函数不同，因为它允许用户控制近似分位数结果的精度。

**语法**

```sql
quantileGK(accuracy, level)(expr)
```

别名：`medianGK`。

**参数**

* `accuracy` — 分位数的精度。为常量正整数。精度值越大，误差越小。例如，如果将 `accuracy` 参数设置为 100，则在较高概率下，计算得到的分位数误差不超过 1%。计算得到的分位数精度与算法的计算复杂度之间存在权衡。更高的精度需要更多内存和计算资源以更精确地计算分位数，而较低的精度参数则可以更快、占用更少内存地完成计算，但精度会略有下降。

* `level` — 分位数等级。可选参数。取值为 0 到 1 的常量浮点数。默认值：0.5。在 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。

* `expr` — 对列值进行运算的表达式，其结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

* 具有指定等级和精度的分位数。

类型：

* 数值型输入时为 [Float64](../../../sql-reference/data-types/float.md)。
* 输入值为 `Date` 类型时为 [Date](../../../sql-reference/data-types/date.md)。
* 输入值为 `DateTime` 类型时为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

```sql
SELECT quantileGK(1, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(1, 0.25)(plus(number, 1))─┐
│                                    1 │
└──────────────────────────────────────┘

SELECT quantileGK(10, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(10, 0.25)(plus(number, 1))─┐
│                                   156 │
└───────────────────────────────────────┘

SELECT quantileGK(100, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(100, 0.25)(plus(number, 1))─┐
│                                    251 │
└────────────────────────────────────────┘

SELECT quantileGK(1000, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(1000, 0.25)(plus(number, 1))─┐
│                                     249 │
└─────────────────────────────────────────┘
```

**另请参阅**

* [median]/sql-reference/aggregate-functions/reference/median
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
