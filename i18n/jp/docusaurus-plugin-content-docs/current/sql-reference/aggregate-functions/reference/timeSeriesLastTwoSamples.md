---
description: 'PromQL風の irate および idelta 計算のために時系列データを再サンプリングする集約関数'
sidebar_position: 224
slug: /sql-reference/aggregate-functions/reference/timeSeriesLastTwoSamples
title: 'timeSeriesLastTwoSamples'
doc_type: 'reference'
---

タイムスタンプと値のペアとして渡された時系列データから、最大で直近2件のサンプルのみを保持する集約関数です。

引数:

* `timestamp` - サンプルのタイムスタンプ
* `value` - `timestamp` に対応する時系列の値\
  また、同じサイズの配列として、複数のタイムスタンプと値のサンプルを渡すこともできます。

戻り値:
`Tuple(Array(DateTime), Array(Float64))` - 長さが 0 から 2 の範囲の、同じ長さを持つ 2 つの配列から成るペア。1 つ目の配列にはサンプリングされた時系列のタイムスタンプが含まれ、2 つ目の配列にはそれに対応する時系列の値が含まれます。

例:
この集約関数は、グリッドに揃えたタイムスタンプに対して再サンプリングされた時系列データを保存するマテリアライズドビューと集約テーブルでの利用を想定しています。
以下の生データ用テーブルと、再サンプリングされたデータを保存するテーブルの例を考えます。

```sql
-- 生データ用テーブル
CREATE TABLE t_raw_timeseries
(
    metric_id UInt64,
    timestamp DateTime64(3, 'UTC') CODEC(DoubleDelta, ZSTD),
    value Float64 CODEC(DoubleDelta)
)
ENGINE = MergeTree()
ORDER BY (metric_id, timestamp);

-- より大きな時間間隔（15秒）にリサンプリングされたデータ用テーブル
CREATE TABLE t_resampled_timeseries_15_sec
(
    metric_id UInt64,
    grid_timestamp DateTime('UTC') CODEC(DoubleDelta, ZSTD), -- 15秒に整列されたタイムスタンプ
    samples AggregateFunction(timeSeriesLastTwoSamples, DateTime64(3, 'UTC'), Float64)
)
ENGINE = AggregatingMergeTree()
ORDER BY (metric_id, grid_timestamp);

-- リサンプリングテーブルにデータを投入するためのマテリアライズドビュー
CREATE MATERIALIZED VIEW mv_resampled_timeseries TO t_resampled_timeseries_15_sec
(
    metric_id UInt64,
    grid_timestamp DateTime('UTC') CODEC(DoubleDelta, ZSTD),
    samples AggregateFunction(timeSeriesLastTwoSamples, DateTime64(3, 'UTC'), Float64)
)
AS SELECT
    metric_id,
    ceil(toUnixTimestamp(timestamp + interval 999 millisecond) / 15, 0) * 15 AS grid_timestamp,   -- タイムスタンプを次のグリッドポイントに切り上げ
    initializeAggregation('timeSeriesLastTwoSamplesState', timestamp, value) AS samples
FROM t_raw_timeseries
ORDER BY metric_id, grid_timestamp;
```

いくつかテストデータを挿入し、&#39;2024-12-12 12:00:12&#39; から &#39;2024-12-12 12:00:30&#39; の間のデータを読み取ります

```sql
-- データを挿入
INSERT INTO t_raw_timeseries(metric_id, timestamp, value) SELECT number%10 AS metric_id, '2024-12-12 12:00:00'::DateTime64(3, 'UTC') + interval ((number/10)%100)*900 millisecond as timestamp, number%3+number%29 AS value FROM numbers(1000);

-- 生データを確認
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

タイムスタンプ &#39;2024-12-12 12:00:15&#39; および &#39;2024-12-12 12:00:30&#39; の直近 2 件のサンプルをクエリします：

```sql
-- リサンプリングされたデータを確認
SELECT metric_id, grid_timestamp, (finalizeAggregation(samples).1 as timestamp, finalizeAggregation(samples).2 as value) 
FROM t_resampled_timeseries_15_sec
WHERE metric_id = 3 AND grid_timestamp BETWEEN '2024-12-12 12:00:15' AND '2024-12-12 12:00:30'
ORDER BY metric_id, grid_timestamp;
```

```response
3    2024-12-12 12:00:15    (['2024-12-12 12:00:14.670','2024-12-12 12:00:13.770'],[19,8])
3    2024-12-12 12:00:30    (['2024-12-12 12:00:29.969','2024-12-12 12:00:29.069'],[14,6])
```

集約テーブルは、15 秒間隔に揃えられた各タイムスタンプについて、最新 2 つの値のみを保存します。これにより、生データのテーブルに保存されているデータ量よりはるかに少ないデータを読み込むだけで、PromQL の `irate` や `idelta` と同様の計算を行うことができます。

```sql
-- 生データからideltaとirateを計算
WITH
    '2024-12-12 12:00:15'::DateTime64(3,'UTC') AS start_ts,       -- タイムスタンプグリッドの開始時刻
    start_ts + INTERVAL 60 SECOND AS end_ts,   -- タイムスタンプグリッドの終了時刻
    15 AS step_seconds,   -- タイムスタンプグリッドのステップ間隔
    45 AS window_seconds  -- 「staleness」ウィンドウ
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
-- 再サンプリングされたデータからideltaとirateを計算
WITH
    '2024-12-12 12:00:15'::DateTime64(3,'UTC') AS start_ts,       -- タイムスタンプグリッドの開始時刻
    start_ts + INTERVAL 60 SECOND AS end_ts,   -- タイムスタンプグリッドの終了時刻
    15 AS step_seconds,   -- タイムスタンプグリッドのステップ間隔
    45 AS window_seconds  -- 「staleness」ウィンドウ
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
この関数は実験的機能です。`allow_experimental_ts_to_grid_aggregate_function=true` を設定して有効化してください。
:::
