---
description: '一个聚合函数，用于在指定网格上对时间序列数据计算类似 PromQL 的 resets。'
sidebar_position: 230
slug: /sql-reference/aggregate-functions/reference/timeSeriesResetsToGrid
title: 'timeSeriesResetsToGrid'
doc_type: 'reference'
---

聚合函数，将时间序列数据作为时间戳与数值的成对输入，并在由起始时间戳、结束时间戳和步长描述的规则时间网格上，从这些数据中计算[类似 PromQL 的 `resets`](https://prometheus.io/docs/prometheus/latest/querying/functions/#resets)。对于网格上的每一个点，用于计算 `resets` 的样本都会在指定的时间窗口内进行考虑。

参数：

* `start timestamp` - 指定网格的起始时间
* `end timestamp` - 指定网格的结束时间
* `grid step` - 指定网格的步长（以秒为单位）
* `staleness` - 指定被考虑样本的最大“陈旧时间”（staleness，单位为秒）

参数：

* `timestamp` - 样本的时间戳
* `value` - 时间序列在该 `timestamp` 上对应的数值

返回值：
指定网格上的 `resets` 值，类型为 `Array(Nullable(Float64))`。返回的数组对每一个时间网格点包含一个值。如果在某个网格点对应的窗口内没有样本可用于计算该点的 `resets` 值，则该值为 NULL。

示例：
下面的查询在网格 [90, 105, 120, 135, 150, 165, 180, 195, 210, 225] 上计算 `resets` 值：

```sql
WITH
    -- 注意:130 和 190 之间的间隔用于演示根据窗口参数为 ts = 180 填充值的方式
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 3, 2, 6, 6, 4, 2, 0]::Array(Float32) AS values, -- 对应上述时间戳的值数组
    90 AS start_ts,       -- 时间戳网格起始值
    90 + 135 AS end_ts,   -- 时间戳网格结束值
    15 AS step_seconds,   -- 时间戳网格步长
    45 AS window_seconds  -- "过期"窗口
SELECT timeSeriesResetsToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesResetsToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,1,1,1,NULL,0,1,2]                                                           │
   └──────────────────────────────────────────────────────────────────────────────────────────┘
```

也可以将多组时间戳和值样本作为大小相同的数组传入。使用数组参数时，相同的查询如下：

```sql
WITH
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 3, 2, 6, 6, 4, 2, 0]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 135 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesResetsToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
此函数为实验特性，可通过将 `allow_experimental_ts_to_grid_aggregate_function` 设置为 `true` 来启用。
:::
