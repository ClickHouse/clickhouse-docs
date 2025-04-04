---
slug: /sql-reference/aggregate-functions/reference/quantile
sidebar_position: 170
title: 'quantile'
description: '计算数值数据序列的近似分位数。'
---


# quantile

计算数值数据序列的近似 [分位数](https://en.wikipedia.org/wiki/Quantile)。

此函数应用 [水库抽样](https://en.wikipedia.org/wiki/Reservoir_sampling)，水库大小最大为 8192，并使用随机数生成器进行抽样。结果是非确定性的。要获取确切的分位数，请使用 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 函数。

当在一个查询中使用多个具有不同级别的 `quantile*` 函数时，内部状态不会组合（即查询的效率低于最佳状态）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

请注意，对于空的数值序列，`quantile` 将返回 NaN，但其 `quantile*` 变体将根据变体返回 NaN 或序列类型的默认值。

**语法**

``` sql
quantile(level)(expr)
```

别名：`median`。

**参数**

- `level` — 分位数的级别。可选参数。0 到 1 之间的常量浮点数。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 对列值进行计算的表达式，结果为数值 [数据类型](/sql-reference/data-types)、[Date](/sql-reference/data-types/date) 或 [DateTime](/sql-reference/data-types/datetime)。

**返回值**

- 指定级别的近似分位数。

类型：

- 对于数值数据类型输入，返回 [Float64](/sql-reference/data-types/float)。
- 如果输入值具有 `Date` 类型，则返回 [Date](/sql-reference/data-types/date)。
- 如果输入值具有 `DateTime` 类型，则返回 [DateTime](/sql-reference/data-types/datetime)。

**示例**

输入表：

``` text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

查询：

``` sql
SELECT quantile(val) FROM t
```

结果：

``` text
┌─quantile(val)─┐
│           1.5 │
└───────────────┘
```

**另请参阅**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles#quantiles)
