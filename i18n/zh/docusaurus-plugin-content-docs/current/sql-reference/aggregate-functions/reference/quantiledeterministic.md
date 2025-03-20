---
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
sidebar_position: 172
title: 'quantileDeterministic'
description: '计算数值数据序列的近似分位数。'
---


# quantileDeterministic

计算数值数据序列的近似 [分位数](https://en.wikipedia.org/wiki/Quantile)。

此函数应用 [水库抽样](https://en.wikipedia.org/wiki/Reservoir_sampling)，水库大小最多为 8192，并采用确定性抽样算法。结果是确定性的。要获取精确的分位数，请使用 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 函数。

在查询中使用多个 `quantile*` 函数且级别不同的情况下，内部状态不会合并（即查询的效率低于预期）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

``` sql
quantileDeterministic(level)(expr, determinator)
```

别名: `medianDeterministic`。

**参数**

- `level` — 分位数的级别。可选参数。常量浮点数，范围从 0 到 1。建议使用 `level` 值在 `[0.01, 0.99]` 范围内。默认值: 0.5。在 `level=0.5` 时，该函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 对列值的表达式，结果为数值 [数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `determinator` — 用于在水库抽样算法中替代随机数生成器的数，其哈希值用于使抽样结果确定。您可以使用任何确定性的正数作为确定器，例如用户 ID 或事件 ID。如果相同的确定器值出现过于频繁，该函数将无法正常工作。

**返回值**

- 指定级别的近似分位数。

类型：

- 对于数值数据类型输入，返回 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值具有 `Date` 类型，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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
SELECT quantileDeterministic(val, 1) FROM t
```

结果：

``` text
┌─quantileDeterministic(val, 1)─┐
│                           1.5 │
└───────────────────────────────┘
```

**参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
