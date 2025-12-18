---
description: '指定されたグリッド上の時系列データに対して、PromQL に類似した線形予測を計算する集約関数。'
sidebar_position: 228
slug: /sql-reference/aggregate-functions/reference/timeSeriesPredictLinearToGrid
title: 'timeSeriesPredictLinearToGrid'
doc_type: 'reference'
---

この集約関数は、タイムスタンプと値のペアからなる時系列データを受け取り、開始タイムスタンプ、終了タイムスタンプ、およびステップで記述される規則的な時間グリッド上で、このデータに基づき指定された予測タイムスタンプのオフセットを用いた[PromQL に類似した線形予測](https://prometheus.io/docs/prometheus/latest/querying/functions/#predict_linear)を計算します。グリッド上の各ポイントについて、`predict_linear` を計算するためのサンプルは、指定された時間ウィンドウ内のものが考慮されます。

Parameters:

* `start timestamp` - グリッドの開始を指定します。
* `end timestamp` - グリッドの終了を指定します。
* `grid step` - グリッドのステップ（秒）を指定します。
* `staleness` - 対象とするサンプルの最大の「古さ」（秒）を指定します。staleness ウィンドウは左開・右閉の区間です。
* `predict_offset` - 予測時刻に加算するオフセット秒数を指定します。

Arguments:

* `timestamp` - サンプルのタイムスタンプ
* `value` - `timestamp` に対応する時系列の値

Return value:
指定されたグリッド上の `predict_linear` の値を `Array(Nullable(Float64))` として返します。返される配列には、時間グリッドの各ポイントに 1 つの値が含まれます。特定のグリッドポイントについて、そのウィンドウ内に予測値を計算するのに十分なサンプルが存在しない場合、その値は NULL になります。

Example:
次のクエリは、60 秒のオフセット付きで、グリッド [90, 105, 120, 135, 150, 165, 180, 195, 210] 上の `predict_linear` の値を計算します。

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

応答:

```response
   ┌─timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)─┐
1. │ [NULL,NULL,1,9.166667,11.6,16.916666,NULL,NULL,16.5]                                                            │
   └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

同じ長さの配列として、複数のタイムスタンプと値を渡すこともできます。配列引数を使った同じクエリは次のとおりです。

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
この関数は実験的な機能です。`allow_experimental_ts_to_grid_aggregate_function=true` を設定して有効化してください。
:::
