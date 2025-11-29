---
description: '使用线性插值计算直方图的分位数。'
sidebar_position: 364
slug: /sql-reference/aggregate-functions/reference/quantilePrometheusHistogram
title: 'quantilePrometheusHistogram'
doc_type: 'reference'
---

# quantilePrometheusHistogram {#quantileprometheushistogram}

使用线性插值计算直方图的[分位数](https://en.wikipedia.org/wiki/Quantile)，同时考虑每个直方图桶的累积值和上界。

为了获得插值结果，所有传入的值会被合并成一个数组，然后按照其对应桶的上界值进行排序。之后会类似 PromQL 中针对经典直方图的 [histogram&#95;quantile()](https://prometheus.io/docs/prometheus/latest/querying/functions/#histogram_quantile) 函数执行分位数插值：在确定分位数所在的桶后，使用该桶的下界和上界进行线性插值。

**语法**

```sql
quantilePrometheusHistogram(level)(bucket_upper_bound, cumulative_bucket_value)
```

**参数**

* `level` — 分位数的级别。可选参数。取值为 0 到 1 之间的常量浮点数。建议将 `level` 值设置在 `[0.01, 0.99]` 范围内。默认值：`0.5`。在 `level=0.5` 时，该函数计算[中位数](https://en.wikipedia.org/wiki/Median)。

* `bucket_upper_bound` — 直方图桶的上限。

  * 最高桶的上限必须为 `+Inf`。

* `cumulative_bucket_value` — 直方图桶的累积 [UInt](../../../sql-reference/data-types/int-uint) 或 [Float64](../../../sql-reference/data-types/float.md) 值。

  * 随着桶上限的增大，这些值必须单调递增。

**返回值**

* 指定级别的分位数。

类型：

* `Float64`。

**示例**

输入表：

```text
   ┌─bucket_upper_bound─┬─cumulative_bucket_value─┐
1. │                  0 │                       6 │
2. │                0.5 │                      11 │
3. │                  1 │                      14 │
4. │                inf │                      19 │
   └────────────────────┴─────────────────────────┘
```

结果：

```text
   ┌─quantilePrometheusHistogram(bucket_upper_bound, cumulative_bucket_value)─┐
1. │                                                                     0.35 │
   └──────────────────────────────────────────────────────────────────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
