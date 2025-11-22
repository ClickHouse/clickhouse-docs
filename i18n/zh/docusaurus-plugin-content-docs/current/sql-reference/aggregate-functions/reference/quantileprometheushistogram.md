---
description: '使用线性插值计算直方图的分位数。'
sidebar_position: 364
slug: /sql-reference/aggregate-functions/reference/quantilePrometheusHistogram
title: 'quantilePrometheusHistogram'
doc_type: 'reference'
---

# quantilePrometheusHistogram

使用线性插值，并考虑每个直方图桶的累积值和上界，计算直方图的[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得插值后的值，所有传入的桶数据会被合并为一个数组，然后根据其对应桶的上界值进行排序。随后在经典直方图上执行与 PromQL [histogram&#95;quantile()](https://prometheus.io/docs/prometheus/latest/querying/functions/#histogram_quantile) 函数类似的分位数插值：在找到分位数位置所在的桶后，使用该桶的下界和上界进行线性插值。

**语法**

```sql
quantilePrometheusHistogram(level)(bucket_upper_bound, cumulative_bucket_value)
```

**参数**

* `level` — 分位水平。可选参数。取值为 0 到 1 之间的常量浮点数。建议使用范围为 `[0.01, 0.99]` 的 `level` 值。默认值：`0.5`。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。

* `bucket_upper_bound` — 直方图桶的上界。

  * 最后一个桶的上界必须为 `+Inf`。

* `cumulative_bucket_value` — 直方图桶的累积 [UInt](../../../sql-reference/data-types/int-uint) 或 [Float64](../../../sql-reference/data-types/float.md) 值。

  * 随着桶上界的增大，这些值必须单调递增。

**返回值**

* 指定水平的分位数。

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
