---
'description': '聚合函数，用于在指定网格上对时间序列数据进行类似 PromQL 的线性预测。'
'sidebar_position': 228
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesPredictLinearToGrid'
'title': 'timeSeriesPredictLinearToGrid'
'doc_type': 'reference'
---

聚合函数采用时间序列数据作为时间戳和数值的配对，并根据指定的预测时间戳偏移量在常规时间网格上计算 [PromQL 风格的线性预测](https://prometheus.io/docs/prometheus/latest/querying/functions/#predict_linear)。对于网格上的每一个点，计算 `predict_linear` 所需的样本将在指定的时间窗口内考虑。

参数：
- `start timestamp` - 指定网格的开始时间。
- `end timestamp` - 指定网格的结束时间。
- `grid step` - 指定网格的步长（以秒为单位）。
- `staleness` - 指定考虑样本的最大“陈旧性”（以秒为单位）。陈旧性窗口是一个左开右闭的区间。
- `predict_offset` - 指定要添加到预测时间的秒数偏移。

参数：
- `timestamp` - 样本的时间戳
- `value` - 与 `timestamp` 对应的时间序列值

返回值：
在指定网格上的 `predict_linear` 值，作为 `Array(Nullable(Float64))`。返回的数组包含每个时间网格点的一个值。如果在窗口内没有足够的样本来计算特定网格点的速率值，则该值为 NULL。

示例：
以下查询计算在网格 [90, 105, 120, 135, 150, 165, 180, 195, 210] 上的 `predict_linear` 值，偏移 60 秒：

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window parameter
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds, -- "staleness" window
    60 AS predict_offset  -- prediction time offset
SELECT timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)
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
   ┌─timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)─┐
1. │ [NULL,NULL,1,9.166667,11.6,16.916666,NULL,NULL,16.5]                                                            │
   └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

同样，可以将多个时间戳和数值样本作为相同大小的数组传递。使用数组参数的相同查询：

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds,
    60 AS predict_offset
SELECT timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamps, values);
```

:::note
此函数为实验性功能，通过设置 `allow_experimental_ts_to_grid_aggregate_function=true` 来启用它。
:::
