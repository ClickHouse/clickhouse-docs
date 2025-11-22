---
description: '指定されたグリッド上で、時系列データに対して PromQL 風の線形予測を計算する集計関数。'
sidebar_position: 228
slug: /sql-reference/aggregate-functions/reference/timeSeriesPredictLinearToGrid
title: 'timeSeriesPredictLinearToGrid'
doc_type: 'reference'
---

時系列データをタイムスタンプと値のペアとして受け取り、開始タイムスタンプ・終了タイムスタンプ・ステップによって定義される等間隔の時間グリッド上で、このデータから指定された予測タイムスタンプへのオフセットを用いた[PromQL 風の線形予測](https://prometheus.io/docs/prometheus/latest/querying/functions/#predict_linear)を計算する集計関数です。グリッド上の各点に対しては、指定された時間ウィンドウ内のサンプルが `predict_linear` の計算対象として考慮されます。

Parameters:

* `start timestamp` - グリッドの開始を指定します。
* `end timestamp` - グリッドの終了を指定します。
* `grid step` - グリッドのステップを秒で指定します。
* `staleness` - 対象とするサンプルの最大の「古さ」（staleness）を秒で指定します。staleness ウィンドウは左開・右閉の区間です。
* `predict_offset` - 予測時刻に加算するオフセット秒数を指定します。

Arguments:

* `timestamp` - サンプルのタイムスタンプ
* `value` - `timestamp` に対応する時系列の値

Return value:
指定されたグリッド上の `predict_linear` の値を `Array(Nullable(Float64))` として返します。返される配列には、各時間グリッドポイントに 1 つの値が含まれます。特定のグリッドポイントについて予測値を計算するのに十分なサンプルがウィンドウ内に存在しない場合、その値は NULL になります。

Example:
次のクエリは、60 秒のオフセットで、グリッド [90, 105, 120, 135, 150, 165, 180, 195, 210] 上の `predict_linear` の値を計算します。

```sql
WITH
    -- 注記: 140と190の間のギャップは、windowパラメータに基づいてts = 150、165、180の値がどのように補完されるかを示すためのものです
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- 上記のタイムスタンプに対応する値の配列
    90 AS start_ts,       -- タイムスタンプグリッドの開始位置
    90 + 120 AS end_ts,   -- タイムスタンプグリッドの終了位置
    15 AS step_seconds,   -- タイムスタンプグリッドのステップ幅
    45 AS window_seconds, -- "staleness"ウィンドウ
    60 AS predict_offset  -- 予測時間のオフセット
SELECT timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)
FROM
(
    -- このサブクエリは、タイムスタンプと値の配列を`timestamp`、`value`の行に変換します
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

レスポンス：

```response
   ┌─timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)─┐
1. │ [NULL,NULL,1,9.166667,11.6,16.916666,NULL,NULL,16.5]                                                            │
   └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

タイムスタンプと値のサンプルを、同じ長さの配列として複数渡すこともできます。配列を引数に取る同じクエリは次のとおりです：

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
この関数は実験的な機能です。`allow_experimental_ts_to_grid_aggregate_function=true` を設定して有効にしてください。
:::
