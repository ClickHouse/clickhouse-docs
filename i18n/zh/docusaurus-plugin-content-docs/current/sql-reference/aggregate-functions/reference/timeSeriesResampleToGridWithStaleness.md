---
'description': '聚合函数，重新采样时间序列数据到指定的网格。'
'sidebar_position': 226
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesResampleToGridWithStaleness'
'title': 'timeSeriesResampleToGridWithStaleness'
'doc_type': 'reference'
---

聚合函数，将时间序列数据作为时间戳与值的对，并将这些数据重新采样到由开始时间戳、结束时间戳和步长描述的规则时间网格中。对于网格上的每个点，都选择最接近（在指定的时间窗口内）的样本。

别名： `timeSeriesLastToGrid`。

参数：
- `start timestamp` - 指定网格的开始时间
- `end timestamp` - 指定网格的结束时间
- `grid step` - 指定网格的步长（以秒为单位）
- `staleness window` - 指定最近样本的最大“过时”时间（以秒为单位）

参数：
- `timestamp` - 样本的时间戳
- `value` - 与 `timestamp` 对应的时间序列的值

返回值：
重新采样到指定网格的时间序列值，格式为 `Array(Nullable(Float64))`。返回的数组包含每个时间网格点的一个值。如果特定的网格点没有样本，则该值为 NULL。

示例：
以下查询将时间序列数据重新采样到网格 [90, 105, 120, 135, 150, 165, 180, 195, 210]，通过选择每个网格点上不早于 30 秒的值：

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to staleness window parameter
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    30 AS window_seconds  -- "staleness" window
SELECT timeSeriesResampleToGridWithStaleness(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesResa⋯stamp, value)─┐
1. │ [NULL,NULL,1,3,4,4,NULL,5,8] │
   └──────────────────────────────┘
```

同样可以将多个时间戳和值的样本作为相同大小的数组传递。具有数组参数的相同查询：

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    30 AS window_seconds
SELECT timeSeriesResampleToGridWithStaleness(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
此函数是实验性的，通过设置 `allow_experimental_ts_to_grid_aggregate_function=true` 来启用它。
:::
