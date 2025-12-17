---
description: '在指定网格上的时间序列数据上计算类似 PromQL 的线性预测的聚合函数。'
sidebar_position: 228
slug: /sql-reference/aggregate-functions/reference/timeSeriesPredictLinearToGrid
title: 'timeSeriesPredictLinearToGrid'
doc_type: 'reference'
---

该聚合函数接收由时间戳和值组成的时间序列数据对，并在由起始时间戳、结束时间戳和步长描述的规则时间网格上，计算具有指定预测时间偏移量的[类似 PromQL 的线性预测](https://prometheus.io/docs/prometheus/latest/querying/functions/#predict_linear)。对于网格上的每个点，用于计算 `predict_linear` 的样本都限定在指定的时间窗口内。

参数：

* `start timestamp` - 指定网格的起始时间。
* `end timestamp` - 指定网格的结束时间。
* `grid step` - 指定网格的步长（以秒为单位）。
* `staleness` - 指定所考虑样本的最大“陈旧度”（以秒为单位）。陈旧度窗口是一个左开右闭区间。
* `predict_offset` - 指定要添加到预测时间的偏移秒数。

参数（函数参数）：

* `timestamp` - 样本的时间戳
* `value` - 与该 `timestamp` 对应的时间序列值

返回值：
指定网格上的 `predict_linear` 值，类型为 `Array(Nullable(Float64))`。返回的数组包含每个时间网格点的一个值。如果在窗口内没有足够的样本来计算某个网格点的速率值，则该值为 NULL。

示例：
下面的查询在网格 [90, 105, 120, 135, 150, 165, 180, 195, 210] 上计算具有 60 秒偏移量的 `predict_linear` 值：

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

同样也可以将多个时间戳和数值样本作为相同长度的数组传入。使用数组参数的等价查询如下所示：

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
此函数为实验性功能，可通过将 `allow_experimental_ts_to_grid_aggregate_function` 设置为 `true` 来启用。
:::
