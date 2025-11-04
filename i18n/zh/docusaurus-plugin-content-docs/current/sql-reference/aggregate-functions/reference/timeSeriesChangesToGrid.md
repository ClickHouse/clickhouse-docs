---
'description': '聚合函数，计算在指定网格上对时间序列数据的类似于 PromQL 的变化。'
'sidebar_position': 229
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesChangesToGrid'
'title': 'timeSeriesChangesToGrid'
'doc_type': 'reference'
---

聚合函数，将时间序列数据作为时间戳和值的对，并在由开始时间戳、结束时间戳和步长描述的规则时间网格上计算 [PromQL 类似的变化](https://prometheus.io/docs/prometheus/latest/querying/functions/#changes)。对于网格上的每个点，计算 `changes` 的样本在指定的时间窗口内考虑。

参数：
- `start timestamp` - 指定网格的开始
- `end timestamp` - 指定网格的结束
- `grid step` - 指定网格的步长（单位：秒）
- `staleness` - 指定考虑样本的最大“陈旧性”（单位：秒）

参数：
- `timestamp` - 样本的时间戳
- `value` - 与 `timestamp` 对应的时间序列值

返回值：
在指定网格上的 `changes` 值，返回为 `Array(Nullable(Float64))`。返回的数组包含每个时间网格点的一个值。如果在窗口内没有样本用于计算特定网格点的变化值，则该值为 NULL。

示例：
以下查询计算网格 [90, 105, 120, 135, 150, 165, 180, 195, 210, 225] 上的 `changes` 值：

```sql
WITH
    -- NOTE: the gap between 130 and 190 is to show how values are filled for ts = 180 according to window parameter
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 135 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesChangesToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesChangesToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,1,1,1,NULL,0,1,2]                                                            │
   └───────────────────────────────────────────────────────────────────────────────────────────┘
```

也可以将多个时间戳和值样本作为相同大小的数组传递。使用数组参数的相同查询：

```sql
WITH
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 135 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesChangesToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
此函数为实验性功能，通过设置 `allow_experimental_ts_to_grid_aggregate_function=true` 来启用。
:::
