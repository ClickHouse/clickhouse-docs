---
description: '使用 t-digest 算法计算数值序列的近似分位数。'
sidebar_position: 179
slug: /sql-reference/aggregate-functions/reference/quantiletdigestweighted
title: 'quantileTDigestWeighted'
doc_type: 'reference'
---

# quantileTDigestWeighted

使用 [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) 算法计算数值数据序列的近似[分位数](https://en.wikipedia.org/wiki/Quantile)。该函数会考虑序列中每个元素的权重。最大误差不超过 1%。内存消耗为 `log(n)`，其中 `n` 为数值个数。

该函数的性能低于 [quantile](/sql-reference/aggregate-functions/reference/quantile) 或 [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)。从状态大小与精度之比来看，该函数明显优于 `quantile`。

结果依赖于查询的执行顺序，因此是非确定性的。

在一个查询中使用多个具有不同分位水平的 `quantile*` 函数时，其内部状态不会被合并（也就是说，查询的运行效率低于理论上的最佳效率）。在这种情况下，建议使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

:::note\
[不推荐在很小的数据集上使用 `quantileTDigestWeighted`](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275)，否则可能会产生显著误差。在这种情况下，可考虑改用 [`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md)。
:::

**语法**

```sql
quantileTDigestWeighted(level)(expr, weight)
```

别名：`medianTDigestWeighted`。

**参数**

* `level` — 分位数水平。可选参数，取值为 0 到 1 之间的常量浮点数。建议在 `[0.01, 0.99]` 范围内使用 `level` 参数。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 针对列值的表达式，结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
* `weight` — 序列元素权重所在的列。权重表示该值出现的次数。

**返回值**

* 指定水平的近似分位数。

类型：

* 数值数据类型输入时返回 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值为 `Date` 类型，则返回 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值为 `DateTime` 类型，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
SELECT quantileTDigestWeighted(number, 1) FROM numbers(10)
```

结果：

```text
┌─quantileTDigestWeighted(number, 1)─┐
│                                4.5 │
└────────────────────────────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
