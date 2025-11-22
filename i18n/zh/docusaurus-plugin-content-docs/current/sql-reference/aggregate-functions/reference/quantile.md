---
description: '计算数值数据序列的近似分位数。'
sidebar_position: 170
slug: /sql-reference/aggregate-functions/reference/quantile
title: 'quantile'
doc_type: 'reference'
---

# quantile

计算数值序列的近似[分位数](https://en.wikipedia.org/wiki/Quantile)。

该函数使用蓄水池大小最多为 8192 的[蓄水池抽样](https://en.wikipedia.org/wiki/Reservoir_sampling)，以及用于抽样的随机数生成器。其结果是非确定性的。若要获得精确分位数，请使用 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 函数。

在查询中使用多个具有不同分位水平的 `quantile*` 函数时，其内部状态不会被合并（也就是说，查询的执行效率会低于本可达到的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

请注意，对于空的数值序列，`quantile` 将返回 NaN，而其 `quantile*` 变体将根据具体变体返回 NaN 或该序列类型的默认值。

**语法**

```sql
quantile(level)(expr)
```

别名：`median`。

**参数**

* `level` — 分位数水平。可选参数。取值为 0 到 1 之间的常量浮点数。推荐在 `[0.01, 0.99]` 范围内设置 `level`。默认值：0.5。在 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 作用于列值的表达式，结果为数值型[数据类型](/sql-reference/data-types)、[Date](/sql-reference/data-types/date) 或 [DateTime](/sql-reference/data-types/datetime)。

**返回值**

* 指定分位数水平的近似分位数。

类型：

* 数值数据类型输入时为 [Float64](/sql-reference/data-types/float)。
* 输入值为 `Date` 类型时为 [Date](/sql-reference/data-types/date)。
* 输入值为 `DateTime` 类型时为 [DateTime](/sql-reference/data-types/datetime)。

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
SELECT quantile(val) FROM t
```

结果：

```text
┌─quantile(val)─┐
│           1.5 │
└───────────────┘
```

**另见**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles#quantiles)
