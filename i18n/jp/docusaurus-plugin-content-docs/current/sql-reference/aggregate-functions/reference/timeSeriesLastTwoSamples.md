---
description: 'PromQL 風の irate および idelta 計算のために時系列データを再サンプリングする集約関数'
sidebar_position: 224
slug: /sql-reference/aggregate-functions/reference/timeSeriesLastTwoSamples
title: 'timeSeriesLastTwoSamples'
doc_type: 'reference'
---

タイムスタンプと値のペアとして時系列データを受け取り、最新サンプルを最大 2 件までのみ保持する集約関数です。

引数:

* `timestamp` - サンプルのタイムスタンプ
* `value` - `timestamp` に対応する時系列の値\
  また、同じサイズの配列 (`Array`) として、複数のタイムスタンプと値のサンプルを渡すことも可能です。

戻り値:
`Tuple(Array(DateTime), Array(Float64))` - 長さが 0 から 2 のいずれかで、互いに同じ長さを持つ 2 つの配列からなるタプル。1 番目の配列にはサンプリングされた時系列のタイムスタンプが、2 番目の配列にはそれに対応する時系列の値が格納されます。

例:
この集約関数は、グリッドに揃えたタイムスタンプに対して再サンプリングした時系列データを保存する、Materialized View と集約テーブルでの利用を想定しています。
以下に、生データ用のテーブルと、再サンプリングデータを保存するテーブルの例を示します。

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

-- より大きな時間ステップ(15秒)にリサンプリングされたデータ用テーブル
CREATE TABLE t_resampled_timeseries_15_sec
(
    metric_id UInt64,
    grid_timestamp DateTime('UTC') CODEC(DoubleDelta, ZSTD), -- 15秒に整列したタイムスタンプ
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
    ceil(toUnixTimestamp(timestamp + interval 999 millisecond) / 15, 0) * 15 AS grid_timestamp,   -- タイムスタンプを次のグリッドポイントに切り上げる
    initializeAggregation('timeSeriesLastTwoSamplesState', timestamp, value) AS samples
FROM t_raw_timeseries
ORDER BY metric_id, grid_timestamp;
```

いくつかのテストデータを挿入し、&#39;2024-12-12 12:00:12&#39; から &#39;2024-12-12 12:00:30&#39; までのデータを読み込みます

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

タイムスタンプ &#39;2024-12-12 12:00:15&#39; および &#39;2024-12-12 12:00:30&#39; に対応する最新 2 件のサンプルをクエリします:

```sql
-- リサンプリングされたデータの確認
SELECT metric_id, grid_timestamp, (finalizeAggregation(samples).1 as timestamp, finalizeAggregation(samples).2 as value) 
FROM t_resampled_timeseries_15_sec
WHERE metric_id = 3 AND grid_timestamp BETWEEN '2024-12-12 12:00:15' AND '2024-12-12 12:00:30'
ORDER BY metric_id, grid_timestamp;
```

```response
3    2024-12-12 12:00:15    (['2024-12-12 12:00:14.670','2024-12-12 12:00:13.770'],[19,8])
3    2024-12-12 12:00:30    (['2024-12-12 12:00:29.969','2024-12-12 12:00:29.069'],[14,6])
```

集約テーブルには、15 秒ごとに揃えた各タイムスタンプについて、直近 2 件の値のみが保存されます。これにより、生テーブルに保存されているデータよりもはるかに少ないデータを読み取るだけで、PromQL 風の `irate` および `idelta` を計算できます。

```sql
-- 生データからideltaとirateを計算
WITH
    '2024-12-12 12:00:15'::DateTime64(3,'UTC') AS start_ts,       -- タイムスタンプグリッドの開始時刻
    start_ts + INTERVAL 60 SECOND AS end_ts,   -- タイムスタンプグリッドの終了時刻
    15 AS step_seconds,   -- タイムスタンプグリッドのステップ（秒）
    45 AS window_seconds  -- 「staleness」ウィンドウ（秒）
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
    15 AS step_seconds,   -- タイムスタンプグリッドのステップ幅
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
この関数は実験的な機能です。使用するには、`allow_experimental_ts_to_grid_aggregate_function=true` を設定して有効化してください。
:::
