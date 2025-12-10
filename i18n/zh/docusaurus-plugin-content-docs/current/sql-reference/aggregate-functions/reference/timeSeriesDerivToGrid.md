---
description: '在指定网格上，对时间序列数据计算类似 PromQL 的导数的聚合函数。'
sidebar_position: 227
slug: /sql-reference/aggregate-functions/reference/timeSeriesDerivToGrid
title: 'timeSeriesDerivToGrid'
doc_type: 'reference'
---

聚合函数，接收由时间戳和值组成的时间序列数据对作为输入，并在由起始时间戳、结束时间戳和步长描述的规则时间网格上，从这些数据计算出[类似 PromQL 的导数](https://prometheus.io/docs/prometheus/latest/querying/functions/#deriv)。对于网格上的每个点，用于计算 `deriv` 的样本都限制在指定的时间窗口内。

参数：

* `start timestamp` - 指定网格的起始时间。
* `end timestamp` - 指定网格的结束时间。
* `grid step` - 指定网格的步长（秒）。
* `staleness` - 指定被考虑样本的最大“陈旧度”（秒）。陈旧度窗口是一个左开右闭区间。

参数（Arguments）：

* `timestamp` - 样本的时间戳
* `value` - 与该 `timestamp` 对应的时间序列值

返回值：
在指定网格上的 `deriv` 值，类型为 `Array(Nullable(Float64))`。返回数组对每个时间网格点包含一个值。如果在窗口中没有足够的样本来计算某个特定网格点的导数值，则该位置的值为 NULL。

示例：
以下查询在网格 [90, 105, 120, 135, 150, 165, 180, 195, 210] 上计算 `deriv` 值：

```sql
WITH
    -- 注意：140 和 190 之间的间隔用于演示如何根据窗口参数为 ts = 150、165、180 填充值
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- 与上述时间戳对应的值数组
    90 AS start_ts,       -- 时间戳网格起始值
    90 + 120 AS end_ts,   -- 时间戳网格结束值
    15 AS step_seconds,   -- 时间戳网格步长
    45 AS window_seconds  -- "陈旧性"窗口
SELECT timeSeriesDerivToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesDerivToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,0.1,0.11,0.15,NULL,NULL,0.15]                                              │
   └─────────────────────────────────────────────────────────────────────────────────────────┘
```

也可以将多个时间戳和对应的值样本作为大小相同的数组传递。使用数组参数时，同一查询如下所示：

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesDerivToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
该函数为实验性功能，可通过设置 `allow_experimental_ts_to_grid_aggregate_function=true` 来启用。
:::
