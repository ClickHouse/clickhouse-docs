---
description: '在指定网格上的时间序列数据上计算类似 PromQL irate 的聚合函数。'
sidebar_position: 223
slug: /sql-reference/aggregate-functions/reference/timeSeriesInstantRateToGrid
title: 'timeSeriesInstantRateToGrid'
doc_type: 'reference'
---

该聚合函数将时间序列数据作为时间戳与数值的成对输入，并在由起始时间戳、结束时间戳和步长定义的规则时间网格上，从这些数据中计算 [类似 PromQL 的 irate](https://prometheus.io/docs/prometheus/latest/querying/functions/#irate)。对于网格上的每个点，用于计算 `irate` 的样本都在指定的时间窗口内进行选取。

参数：

* `start timestamp` - 指定网格的起始时间。
* `end timestamp` - 指定网格的结束时间。
* `grid step` - 指定网格的步长（单位：秒）。
* `staleness` - 指定被纳入计算的样本允许的最大“陈旧度”（单位：秒）。陈旧度窗口是左开右闭区间。

参数（Arguments）：

* `timestamp` - 样本的时间戳
* `value` - 与该 `timestamp` 对应的时间序列数值

返回值：
指定网格上的 `irate` 值，类型为 `Array(Nullable(Float64))`。返回的数组中每个时间网格点对应一个值。如果在窗口内没有足够的样本为某个网格点计算瞬时速率值，则该值为 NULL。

示例：
以下查询在网格 [90, 105, 120, 135, 150, 165, 180, 195, 210] 上计算 `irate` 值：

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window parameter
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesInstantRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesInstantRa⋯timestamps, values)─┐
1. │ [NULL,NULL,0,0.2,0.1,0.1,NULL,NULL,0.3] │
   └─────────────────────────────────────────┘
```

同样还可以将多个时间戳和值样本以长度相同的数组形式传入。使用数组参数的同一查询如下：

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesInstantRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
该函数为实验性功能，可通过将参数 `allow_experimental_ts_to_grid_aggregate_function` 设置为 `true` 来启用。
:::
