---
'description': '聚合函数，计算在指定网格上对时间序列数据的类似 PromQL 的速率。'
'sidebar_position': 225
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesRateToGrid'
'title': 'timeSeriesRateToGrid'
'doc_type': 'reference'
---

聚合函数，接受时间序列数据作为时间戳和值的对，并在由开始时间戳、结束时间戳和步长描述的规则时间网格上计算 [PromQL 类似的速率](https://prometheus.io/docs/prometheus/latest/querying/functions/#rate)。对于网格上的每个点，用于计算 `rate` 的样本在指定的时间窗口内考虑。

参数：
- `start timestamp` - 指定网格的开始时间。
- `end timestamp` - 指定网格的结束时间。
- `grid step` - 指定网格的步长（以秒为单位）。
- `staleness` - 指定考虑的样本的最大“过时”时间（以秒为单位）。过时窗口是左开右闭的区间。

参数：
- `timestamp` - 样本的时间戳
- `value` - 与 `timestamp` 相关的时间序列的值

返回值：
在指定网格上的 `rate` 值，作为 `Array(Nullable(Float64))`。返回的数组包含网格每个时间点的一个值。如果在计算特定网格点的速率值时没有足够的样本，则该值为 NULL。

示例：
以下查询在网格 [90, 105, 120, 135, 150, 165, 180, 195, 210] 上计算 `rate` 值：

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window parameter
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- This subquery converts arrays of timestamps and values into rows of `timestamp`, `value`
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

响应：

```response
   ┌─timeSeriesRateToGrid(start_ts, ⋯w_seconds)(timestamps, values)─┐
1. │ [NULL,NULL,0,0.06666667,0.1,0.083333336,NULL,NULL,0.083333336] │
   └────────────────────────────────────────────────────────────────┘
```

此外，还可以将多个时间戳和值样本作为相等大小的数组传递。使用数组参数的相同查询：

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
此函数为实验性功能，通过设置 `allow_experimental_ts_to_grid_aggregate_function=true` 来启用它。
:::
