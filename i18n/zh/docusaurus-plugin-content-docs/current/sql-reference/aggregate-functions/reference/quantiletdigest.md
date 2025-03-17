---
slug: /sql-reference/aggregate-functions/reference/quantiletdigest
sidebar_position: 178
title: 'quantileTDigest'
description: '使用 t-digest 算法计算数字数据序列的近似分位数。'
---


# quantileTDigest

使用 [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) 算法计算数字数据序列的近似 [分位数](https://en.wikipedia.org/wiki/Quantile)。

内存消耗为 `log(n)`，其中 `n` 是值的数量。结果依赖于查询的运行顺序，并且是非确定性的。

该函数的性能低于 [quantile](/sql-reference/aggregate-functions/reference/quantile) 或 [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)。在状态大小与精度的比率方面，该函数比 `quantile` 要好得多。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即，查询的效率低于可能的效率）。在这种情况下，使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

``` sql
quantileTDigest(level)(expr)
```

别名：`medianTDigest`。

**参数**

- `level` — 分位数级别。可选参数。介于 0 到 1 之间的常量浮点数。我们建议使用 `level` 值范围为 `[0.01, 0.99]`。默认值：0.5。在 `level=0.5` 时，该函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 表达式，针对列值生成数字 [数据类型](/sql-reference/data-types)，[日期](../../../sql-reference/data-types/date.md) 或 [日期时间](../../../sql-reference/data-types/datetime.md)。

**返回值**

- 指定级别的近似分位数。

类型：

- 对于数字数据类型输入，返回 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值为 `Date` 类型，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值为 `DateTime` 类型，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

``` sql
SELECT quantileTDigest(number) FROM numbers(10)
```

结果：

``` text
┌─quantileTDigest(number)─┐
│                     4.5 │
└─────────────────────────┘
```

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
