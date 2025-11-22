---
description: '在指定网格上的时间序列数据上计算类似 PromQL 的线性预测的聚合函数。'
sidebar_position: 228
slug: /sql-reference/aggregate-functions/reference/timeSeriesPredictLinearToGrid
title: 'timeSeriesPredictLinearToGrid'
doc_type: 'reference'
---

该聚合函数接受由时间戳和值构成的时间序列数据对，并在由起始时间戳、结束时间戳和步长描述的规则时间网格上，使用指定的预测时间偏移，计算[类似 PromQL 的线性预测](https://prometheus.io/docs/prometheus/latest/querying/functions/#predict_linear)。对于网格上的每个点，在指定时间窗口内的样本会被用于计算 `predict_linear`。

参数：

* `start timestamp` - 指定网格的起始时间。
* `end timestamp` - 指定网格的结束时间。
* `grid step` - 指定网格的步长（秒）。
* `staleness` - 指定所考虑样本的最大“过期时间”（秒）。过期时间窗口是左开右闭区间。
* `predict_offset` - 指定要加到预测时间上的偏移秒数。

参数（Arguments）：

* `timestamp` - 样本的时间戳。
* `value` - 与该 `timestamp` 对应的时间序列值。

返回值：
指定网格上的 `predict_linear` 值，类型为 `Array(Nullable(Float64))`。返回的数组对每个时间网格点包含一个值。如果在窗口内没有足够的样本来为某个网格点计算预测值，则该值为 NULL。

示例：
下面的查询在网格 [90, 105, 120, 135, 150, 165, 180, 195, 210] 上，以 60 秒偏移计算 `predict_linear` 值：

```sql
WITH
    -- 注意：140 和 190 之间的间隔用于演示如何根据窗口参数为 ts = 150、165、180 填充值
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- 与上述时间戳对应的值数组
    90 AS start_ts,       -- 时间戳网格起始点
    90 + 120 AS end_ts,   -- 时间戳网格结束点
    15 AS step_seconds,   -- 时间戳网格步长
    45 AS window_seconds, -- "过期"窗口
    60 AS predict_offset  -- 预测时间偏移量
SELECT timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)
FROM
(
    -- 此子查询将时间戳和值数组转换为 `timestamp`、`value` 行
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

也可以将多个时间戳和值的样本作为大小相同的数组传入。使用数组参数的同一查询如下所示：

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
该函数是实验性特性，可通过设置 `allow_experimental_ts_to_grid_aggregate_function=true` 来启用。
:::
