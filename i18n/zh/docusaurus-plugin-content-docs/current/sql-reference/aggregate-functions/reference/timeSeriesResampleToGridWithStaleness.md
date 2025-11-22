---
description: '将时间序列数据重新采样到指定网格的聚合函数。'
sidebar_position: 226
slug: /sql-reference/aggregate-functions/reference/timeSeriesResampleToGridWithStaleness
title: 'timeSeriesResampleToGridWithStaleness'
doc_type: 'reference'
---

该聚合函数将时间序列数据作为时间戳与数值的成对输入，并根据由起始时间戳、结束时间戳和步长定义的等间隔时间网格对数据进行重新采样。对于网格上的每个点，选择在指定时间窗口内最新的样本。

别名：`timeSeriesLastToGrid`。

参数：

* `start timestamp` - 指定网格的起始时间
* `end timestamp` - 指定网格的结束时间
* `grid step` - 指定网格的步长（以秒为单位）
* `staleness window` - 指定最近样本允许的最大“陈旧度”（以秒为单位）

参数（Arguments）：

* `timestamp` - 样本的时间戳
* `value` - 与该 `timestamp` 对应的时间序列数值

返回值：
根据指定网格重新采样后的时间序列数值，类型为 `Array(Nullable(Float64))`。返回的数组包含网格中每个时间点的一个值。如果某个网格点没有对应的样本，则该值为 NULL。

示例：
下述查询通过为网格 [90, 105, 120, 135, 150, 165, 180, 195, 210] 上的每个点选择不早于该点前 30 秒的数值，将时间序列数据重新采样到该网格：

```sql
WITH
    -- 注意:140 和 190 之间的间隔用于演示根据陈旧窗口参数如何为 ts = 150、165、180 填充值
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- 与上述时间戳对应的值数组
    90 AS start_ts,       -- 时间戳网格起始点
    90 + 120 AS end_ts,   -- 时间戳网格结束点
    15 AS step_seconds,   -- 时间戳网格步长
    30 AS window_seconds  -- "陈旧"窗口
SELECT timeSeriesResampleToGridWithStaleness(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesResa⋯stamp, value)─┐
1. │ [NULL,NULL,1,3,4,4,NULL,5,8] │
   └──────────────────────────────┘
```

还可以将多个时间戳和值的样本作为长度相同的数组传入。使用数组参数时，相同的查询如下：

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
此函数为实验性特性，要启用它，请将 `allow_experimental_ts_to_grid_aggregate_function` 设置为 `true`。
:::
