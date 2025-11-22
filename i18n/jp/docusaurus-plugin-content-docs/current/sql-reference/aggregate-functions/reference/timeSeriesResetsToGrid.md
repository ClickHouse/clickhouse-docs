---
description: '指定されたグリッド上の時系列データに対して、PromQL ライクな resets を計算する集約関数。'
sidebar_position: 230
slug: /sql-reference/aggregate-functions/reference/timeSeriesResetsToGrid
title: 'timeSeriesResetsToGrid'
doc_type: 'reference'
---

この集約関数は、タイムスタンプと値のペアとして与えられた時系列データを受け取り、開始タイムスタンプ・終了タイムスタンプ・ステップ長で定義される等間隔の時間グリッド上で、このデータから [PromQL ライクな resets](https://prometheus.io/docs/prometheus/latest/querying/functions/#resets) を計算します。グリッド上の各ポイントについて、`resets` を計算するためのサンプルは、指定された時間ウィンドウ内のものが考慮されます。

Parameters:

* `start timestamp` - グリッドの開始を指定
* `end timestamp` - グリッドの終了を指定
* `grid step` - グリッドのステップを秒単位で指定
* `staleness` - 対象とするサンプルの最大の「staleness」（古さ）を秒単位で指定

Arguments:

* `timestamp` - サンプルのタイムスタンプ
* `value` - `timestamp` に対応する時系列の値

Return value:
指定されたグリッド上の `resets` の値を `Array(Nullable(Float64))` として返します。返される配列には、各時間グリッドポイントごとに 1 つの値が含まれます。特定のグリッドポイントについて、その時間ウィンドウ内に resets の値を計算するためのサンプルが存在しない場合、その値は NULL になります。

Example:
次のクエリは、グリッド [90, 105, 120, 135, 150, 165, 180, 195, 210, 225] 上の `resets` の値を計算します:

```sql
WITH
    -- 注記: 130と190の間隔は、windowパラメータに基づいてts = 180の値がどのように補完されるかを示すためのものです
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 3, 2, 6, 6, 4, 2, 0]::Array(Float32) AS values, -- 上記のタイムスタンプに対応する値の配列
    90 AS start_ts,       -- タイムスタンプグリッドの開始位置
    90 + 135 AS end_ts,   -- タイムスタンプグリッドの終了位置
    15 AS step_seconds,   -- タイムスタンプグリッドのステップ幅
    45 AS window_seconds  -- 「staleness」ウィンドウ
SELECT timeSeriesResetsToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- このサブクエリは、タイムスタンプと値の配列を`timestamp`、`value`の行に変換します
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

レスポンス:

```response
   ┌─timeSeriesResetsToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,1,1,1,NULL,0,1,2]                                                           │
   └──────────────────────────────────────────────────────────────────────────────────────────┘
```

また、同じ長さの `Array` として、複数のタイムスタンプと値のサンプルを渡すこともできます。配列引数を使用した同じクエリは次のとおりです。

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
この関数は実験的な機能です。`allow_experimental_ts_to_grid_aggregate_function=true` を設定して有効にしてください。
:::
