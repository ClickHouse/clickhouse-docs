---
description: '计算数值数据序列的近似分位数。'
sidebar_position: 172
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
title: 'quantileDeterministic'
doc_type: 'reference'
---

# quantileDeterministic {#quantiledeterministic}

计算数值数据序列的近似[分位数](https://en.wikipedia.org/wiki/Quantile)。

此函数使用大小最多为 8192 的水库进行[水库抽样](https://en.wikipedia.org/wiki/Reservoir_sampling)，并采用确定性的抽样算法，因此结果是确定的。若要获取精确分位数，请使用 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 函数。

在查询中使用多个具有不同等级的 `quantile*` 函数时，它们的内部状态不会被合并（也就是说，查询的执行效率会低于本可达到的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileDeterministic(level)(expr, determinator)
```

Alias: `medianDeterministic`.

**Arguments**

* `level` — 分位数的级别。可选参数。取值为 0 到 1 之间的常量浮点数。建议使用范围为 `[0.01, 0.99]` 的 `level` 值。默认值：0.5。在 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 作用于列值的表达式，结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
* `determinator` — 在水塘抽样算法中，其哈希值用于替代随机数生成器，使抽样结果具有确定性。作为 `determinator`，可以使用任意确定性的正数值，例如用户 ID 或事件 ID。如果同一个 `determinator` 值出现过于频繁，函数将无法正确工作。

**Returned value**

* 指定级别的近似分位数。

Type:

* 对数值数据类型输入返回 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值为 `Date` 类型，则返回 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值为 `DateTime` 类型，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**Example**

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

**另见**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
