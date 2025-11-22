---
description: '计算数值序列的近似分位数值。'
sidebar_position: 172
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
title: 'quantileDeterministic'
doc_type: 'reference'
---

# quantileDeterministic

计算数值数据序列的近似[分位数](https://en.wikipedia.org/wiki/Quantile)。

该函数使用水库大小最多为 8192 的[水库抽样](https://en.wikipedia.org/wiki/Reservoir_sampling)，并采用确定性的抽样算法，因此结果是可复现的。若要获得精确分位数，请使用 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 函数。

在查询中使用多个具有不同分位数等级的 `quantile*` 函数时，其内部状态不会被合并（也就是说，查询的执行效率低于理论上可以达到的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileDeterministic(level)(expr, determinator)
```

别名：`medianDeterministic`。

**参数**

* `level` — 分位数水平。可选参数。取值为 0 到 1 之间的常量浮点数。建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。 当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 针对列值进行运算的表达式，结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
* `determinator` — 在蓄水池抽样算法中，其哈希值用于替代随机数生成器，从而使抽样结果具有确定性（可复现）的数值。`determinator` 可以是任意确定性的正数，例如用户 id 或事件 id。若相同的 determinator 值出现过于频繁，函数可能无法正常工作。

**返回值**

* 指定水平的近似分位数。

类型：

* 对于数值数据类型输入，返回 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值为 `Date` 类型，返回 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值为 `DateTime` 类型，返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

输入表：

```text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

查询：

```sql
SELECT quantileDeterministic(val, 1) FROM t
```

结果：

```text
┌─quantileDeterministic(val, 1)─┐
│                           1.5 │
└───────────────────────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
