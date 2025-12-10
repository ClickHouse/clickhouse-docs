---
description: '用于对时间序列数据进行重采样，以支持类似 PromQL 中 irate 和 idelta 的计算的聚合函数'
sidebar_position: 224
slug: /sql-reference/aggregate-functions/reference/timeSeriesLastTwoSamples
title: 'timeSeriesLastTwoSamples'
doc_type: 'reference'
---

一个聚合函数，用于接收时间戳和值成对的时间序列数据，并且最多只存储最近的 2 个样本。

参数：

* `timestamp` - 样本的时间戳
* `value` - 对应于该 `timestamp` 的时间序列值\
  也可以将多个时间戳和数值样本作为大小相同的 Array 传入。

返回值：\
一个 `Tuple(Array(DateTime), Array(Float64))` —— 一对长度为 0 到 2 的等长数组。第一个数组包含采样后时间序列的时间戳，第二个数组包含时间序列对应的数值。

示例：\
该聚合函数旨在与物化视图和用于存储针对网格对齐时间戳的重采样时间序列数据的聚合表一起使用。\
考虑下面这个原始数据示例表，以及一个用于存储重采样数据的表：

```sql
-- 原始数据表
CREATE TABLE t_raw_timeseries
(
    metric_id UInt64,
    timestamp DateTime64(3, 'UTC') CODEC(DoubleDelta, ZSTD),
    value Float64 CODEC(DoubleDelta)
)
ENGINE = MergeTree()
ORDER BY (metric_id, timestamp);

-- 重采样至更大时间步长（15 秒）的数据表
CREATE TABLE t_resampled_timeseries_15_sec
(
    metric_id UInt64,
    grid_timestamp DateTime('UTC') CODEC(DoubleDelta, ZSTD), -- 对齐至 15 秒的时间戳
    samples AggregateFunction(timeSeriesLastTwoSamples, DateTime64(3, 'UTC'), Float64)
)
ENGINE = AggregatingMergeTree()
ORDER BY (metric_id, grid_timestamp);

-- 用于填充重采样表的物化视图
CREATE MATERIALIZED VIEW mv_resampled_timeseries TO t_resampled_timeseries_15_sec
(
    metric_id UInt64,
    grid_timestamp DateTime('UTC') CODEC(DoubleDelta, ZSTD),
    samples AggregateFunction(timeSeriesLastTwoSamples, DateTime64(3, 'UTC'), Float64)
)
AS SELECT
    metric_id,
    ceil(toUnixTimestamp(timestamp + interval 999 millisecond) / 15, 0) * 15 AS grid_timestamp,   -- 将时间戳向上舍入至下一个网格点
    initializeAggregation('timeSeriesLastTwoSamplesState', timestamp, value) AS samples
FROM t_raw_timeseries
ORDER BY metric_id, grid_timestamp;
```

插入一些测试数据，并读取时间在 &#39;2024-12-12 12:00:12&#39; 到 &#39;2024-12-12 12:00:30&#39; 之间的数据

```sql
-- 插入数据
INSERT INTO t_raw_timeseries(metric_id, timestamp, value) SELECT number%10 AS metric_id, '2024-12-12 12:00:00'::DateTime64(3, 'UTC') + interval ((number/10)%100)*900 millisecond as timestamp, number%3+number%29 AS value FROM numbers(1000);

-- 查看原始数据
SELECT *
FROM t_raw_timeseries
WHERE metric_id = 3 AND timestamp BETWEEN '2024-12-12 12:00:12' AND '2024-12-12 12:00:31'
ORDER BY metric_id, timestamp;
```


```response
3    2024-12-12 12:00:12.870    29
3    2024-12-12 12:00:13.770    8
3    2024-12-12 12:00:14.670    19
3    2024-12-12 12:00:15.570    30
3    2024-12-12 12:00:16.470    9
3    2024-12-12 12:00:17.370    20
3    2024-12-12 12:00:18.270    2
3    2024-12-12 12:00:19.170    10
3    2024-12-12 12:00:20.070    21
3    2024-12-12 12:00:20.970    3
3    2024-12-12 12:00:21.870    11
3    2024-12-12 12:00:22.770    22
3    2024-12-12 12:00:23.670    4
3    2024-12-12 12:00:24.570    12
3    2024-12-12 12:00:25.470    23
3    2024-12-12 12:00:26.370    5
3    2024-12-12 12:00:27.270    13
3    2024-12-12 12:00:28.170    24
3    2024-12-12 12:00:29.069    6
3    2024-12-12 12:00:29.969    14
3    2024-12-12 12:00:30.869    25
```

查询时间戳为 &#39;2024-12-12 12:00:15&#39; 和 &#39;2024-12-12 12:00:30&#39; 的最近 2 个样本：

```sql
-- 检查重新采样的数据
SELECT metric_id, grid_timestamp, (finalizeAggregation(samples).1 as timestamp, finalizeAggregation(samples).2 as value) 
FROM t_resampled_timeseries_15_sec
WHERE metric_id = 3 AND grid_timestamp BETWEEN '2024-12-12 12:00:15' AND '2024-12-12 12:00:30'
ORDER BY metric_id, grid_timestamp;
```

```response
3    2024-12-12 12:00:15    (['2024-12-12 12:00:14.670','2024-12-12 12:00:13.770'],[19,8])
3    2024-12-12 12:00:30    (['2024-12-12 12:00:29.969','2024-12-12 12:00:29.069'],[14,6])
```

聚合表仅为每个按 15 秒对齐的时间戳存储最近的 2 个值。这样在计算 PromQL 风格的 `irate` 和 `idelta` 时，只需读取的数据量就远小于原始表中的数据量。

```sql
-- 从原始数据计算 idelta 和 irate
WITH
    '2024-12-12 12:00:15'::DateTime64(3,'UTC') AS start_ts,       -- 时间戳网格起始时间
    start_ts + INTERVAL 60 SECOND AS end_ts,   -- 时间戳网格结束时间
    15 AS step_seconds,   -- 时间戳网格步长
    45 AS window_seconds  -- "陈旧性"窗口
SELECT
    metric_id,
    timeSeriesInstantDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value),
    timeSeriesInstantRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM t_raw_timeseries
WHERE metric_id = 3 AND timestamp BETWEEN start_ts - interval window_seconds seconds AND end_ts
GROUP BY metric_id;
```

```response
3    [11,8,-18,8,11]    [12.222222222222221,8.88888888888889,1.1111111111111112,8.88888888888889,12.222222222222221]
```


```sql
-- 从重新采样的数据计算 idelta 和 irate
WITH
    '2024-12-12 12:00:15'::DateTime64(3,'UTC') AS start_ts,       -- 时间戳网格起始点
    start_ts + INTERVAL 60 SECOND AS end_ts,   -- 时间戳网格结束点
    15 AS step_seconds,   -- 时间戳网格步长
    45 AS window_seconds  -- "陈旧性"窗口
SELECT
    metric_id,
    timeSeriesInstantDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values),
    timeSeriesInstantRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values)
FROM (
    SELECT
        metric_id,
        finalizeAggregation(samples).1 AS timestamps,
        finalizeAggregation(samples).2 AS values
    FROM t_resampled_timeseries_15_sec
    WHERE metric_id = 3 AND grid_timestamp BETWEEN start_ts - interval window_seconds seconds AND end_ts
)
GROUP BY metric_id;
```

```response
3    [11,8,-18,8,11]    [12.222222222222221,8.88888888888889,1.1111111111111112,8.88888888888889,12.222222222222221]
```

:::note
此函数为实验性功能，可通过设置 `allow_experimental_ts_to_grid_aggregate_function=true` 来启用。
:::
