---
description: '使用 t-digest 算法计算数值数据序列的近似分位数。'
sidebar_position: 179
slug: /sql-reference/aggregate-functions/reference/quantiletdigestweighted
title: 'quantileTDigestWeighted'
doc_type: 'reference'
---

# quantileTDigestWeighted {#quantiletdigestweighted}

使用 [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) 算法对数值数据序列计算近似[分位数](https://en.wikipedia.org/wiki/Quantile)。该函数会考虑序列中每个元素的权重。最大误差为 1%。内存消耗为 `log(n)`，其中 `n` 是值的数量。

该函数的性能低于 [quantile](/sql-reference/aggregate-functions/reference/quantile) 或 [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)。从 State 大小与精度的比例来看，该函数比 `quantile` 要好得多。

结果取决于查询执行的顺序，因此是非确定性的。

在一个查询中使用具有不同 level 的多个 `quantile*` 函数时，其内部状态不会被合并（也就是说，该查询的执行效率低于本可以达到的水平）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

:::note
[不推荐在非常小的数据集上使用 `quantileTDigestWeighted`](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275)，这可能会导致较大的误差。在这种情况下，请考虑改用 [`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md)。
:::

**语法**

```sql
quantileTDigestWeighted(level)(expr, weight)
```

别名：`medianTDigestWeighted`。

**参数**

* `level` — 分位数的等级。可选参数，取值为 0 到 1 的常量浮点数。建议在 `[0.01, 0.99]` 范围内使用 `level` 值。默认值：0.5。在 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 针对列值的表达式，其结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
* `weight` — 包含序列元素权重的列。权重是该值出现的次数。

**返回值**

* 指定等级的近似分位数。

类型：

* 对于数值型输入数据类型，为 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值的类型为 `Date`，则为 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值的类型为 `DateTime`，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

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
