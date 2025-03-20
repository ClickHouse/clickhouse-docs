---
slug: /sql-reference/aggregate-functions/reference/quantiletdigestweighted
sidebar_position: 179
title: "quantileTDigestWeighted"
description: "使用 t-digest 算法计算数字数据序列的近似分位数。"
---


# quantileTDigestWeighted

使用 [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) 算法计算数字数据序列的近似 [分位数](https://en.wikipedia.org/wiki/Quantile)。该函数考虑了每个序列成员的权重。最大误差为 1%。内存消耗为 `log(n)`，其中 `n` 是值的数量。

该函数的性能低于 [quantile](/sql-reference/aggregate-functions/reference/quantile) 或 [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)。从状态大小与精度的比率来看，该函数比 `quantile` 更加优秀。

结果依赖于查询的运行顺序，结果是非确定性的。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即查询效率不如预期）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

:::note    
使用 `quantileTDigestWeighted` [不推荐用于小型数据集](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275)，可能导致显著误差。在这种情况下，请考虑使用 [`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md)。
:::

**语法**

``` sql
quantileTDigestWeighted(level)(expr, weight)
```

别名：`medianTDigestWeighted`。

**参数**

- `level` — 分位数级别。可选参数。范围为 0 到 1 的常量浮点数。我们推荐在范围 `[0.01, 0.99]` 使用 `level` 值。默认值：0.5。在 `level=0.5` 时，该函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，结果为数字 [数据类型](/sql-reference/data-types)，[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — 包含序列元素权重的列。权重表示值出现的次数。

**返回值**

- 指定级别的近似分位数。

类型：

- 输入为数字数据类型时为 [Float64](../../../sql-reference/data-types/float.md)。
- 输入值为 `Date` 类型时为 [Date](../../../sql-reference/data-types/date.md)。
- 输入值为 `DateTime` 类型时为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

``` sql
SELECT quantileTDigestWeighted(number, 1) FROM numbers(10)
```

结果：

``` text
┌─quantileTDigestWeighted(number, 1)─┐
│                                4.5 │
└────────────────────────────────────┘
```

**参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
