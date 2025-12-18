---
description: '将时间序列数据重新采样到指定网格的聚合函数。'
sidebar_position: 226
slug: /sql-reference/aggregate-functions/reference/timeSeriesResampleToGridWithStaleness
title: 'timeSeriesResampleToGridWithStaleness'
doc_type: 'reference'
---

该聚合函数将时间序列数据作为时间戳和值的成对数据进行处理，并根据由起始时间戳、结束时间戳和步长描述的等间隔时间网格对数据进行重新采样。对于网格上的每个点，会在给定时间窗口内选择最近的样本。

别名：`timeSeriesLastToGrid`。

参数（Parameters）：

* `start timestamp` - 指定网格的起始时间戳
* `end timestamp` - 指定网格的结束时间戳
* `grid step` - 指定网格的步长（秒）
* `staleness window` - 指定最近样本允许的最大“陈旧”时间（秒）

自变量（Arguments）：

* `timestamp` - 样本的时间戳
* `value` - 与该 `timestamp` 对应的时间序列值

返回值：
将时间序列值重新采样到指定网格后的结果，类型为 `Array(Nullable(Float64))`。返回的数组中，每个时间网格点对应一个值。如果某个网格点没有样本，则该值为 NULL。

示例：
下面的查询将时间序列数据重新采样到网格 [90, 105, 120, 135, 150, 165, 180, 195, 210] 上，并为网格上的每个点选择时间戳不早于该网格点 30 秒之前的值：

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

还可以将多个时间戳和数值样本作为长度相同的数组传入。使用数组参数的相同查询如下：

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
该函数为实验性特性，可通过设置 `allow_experimental_ts_to_grid_aggregate_function=true` 来启用。
:::
