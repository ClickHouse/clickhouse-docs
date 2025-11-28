---
description: '使用 T-Digest 算法计算数值数据序列的近似分位数。'
sidebar_position: 178
slug: /sql-reference/aggregate-functions/reference/quantiletdigest
title: 'quantileTDigest'
doc_type: 'reference'
---

# quantileTDigest

使用 [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) 算法，对数值数据序列计算近似的[分位数](https://en.wikipedia.org/wiki/Quantile)。

内存消耗为 `log(n)`，其中 `n` 为值的数量。结果取决于查询的执行顺序，因此是非确定性的。

该函数的性能低于 [quantile](/sql-reference/aggregate-functions/reference/quantile) 或 [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)。从状态大小与精度之间的比率来看，该函数要比 `quantile` 好得多。

在一个查询中使用多个具有不同 level 的 `quantile*` 函数时，其内部状态不会被合并（也就是说，查询的执行效率低于理论可达的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileTDigest(level)(expr)
```

别名：`medianTDigest`。

**参数**

* `level` — 分位数水平。可选参数。取值为 0 到 1 之间的常量浮点数。建议将 `level` 设置在 `[0.01, 0.99]` 范围内。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 基于列值的表达式，其结果为数值[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

* 给定水平的近似分位数。

类型：

* 对于数值数据类型输入，返回 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值为 `Date` 类型，则返回 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值为 `DateTime` 类型，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
SELECT quantileTDigest(number) FROM numbers(10)
```

结果：

```text
┌─quantileTDigest(number)─┐
│                     4.5 │
└─────────────────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
