---
'description': '使用线性插值计算直方图的分位数。'
'sidebar_position': 364
'slug': '/sql-reference/aggregate-functions/reference/quantilePrometheusHistogram'
'title': 'quantilePrometheusHistogram'
'doc_type': 'reference'
---


# quantilePrometheusHistogram

计算直方图的[分位数](https://en.wikipedia.org/wiki/Quantile)，使用线性插值，同时考虑每个直方图桶的累积值和上限。

为了获得插值，所有传入的值被组合成一个数组，然后根据相应桶的上限值进行排序。分位数插值的计算方式类似于 PromQL 的[histogram_quantile()](https://prometheus.io/docs/prometheus/latest/querying/functions/#histogram_quantile)函数，在经典直方图上执行线性插值，使用找到分位数位置的桶的下限和上限。

**语法**

```sql
quantilePrometheusHistogram(level)(bucket_upper_bound, cumulative_bucket_value)
```

**参数**

- `level` — 分位数的级别。可选参数。范围为 0 到 1 的常数浮点数。我们建议使用范围在`[0.01, 0.99]`之间的`level`值。默认值：`0.5`。在`level=0.5`时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。

- `bucket_upper_bound` — 直方图桶的上限。

  - 最高桶的上限必须为`+Inf`。

- `cumulative_bucket_value` — 直方图桶的累积[UInt](../../../sql-reference/data-types/int-uint)或[Float64](../../../sql-reference/data-types/float.md)值。

  - 随着桶的上限增加，值必须单调递增。

**返回值**

- 指定级别的分位数。

类型：

- `Float64`。

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

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
