---
description: '指定されたグリッド上の時系列データに対して、PromQL と同様の idelta を計算する集約関数。'
sidebar_position: 222
slug: /sql-reference/aggregate-functions/reference/timeSeriesInstantDeltaToGrid
title: 'timeSeriesInstantDeltaToGrid'
doc_type: 'reference'
---

この集約関数は、時刻と値のペアとして与えられた時系列データを受け取り、開始時刻・終了時刻・ステップで定義される等間隔の時間グリッド上で、このデータから [PromQL と同様の idelta](https://prometheus.io/docs/prometheus/latest/querying/functions/#idelta) を計算します。グリッド上の各ポイントについて、`idelta` を計算するためのサンプルは、指定された時間ウィンドウ内のものが考慮されます。

Parameters:

* `start timestamp` - グリッドの開始を指定します。
* `end timestamp` - グリッドの終了を指定します。
* `grid step` - グリッドのステップを秒単位で指定します。
* `staleness` - 対象とするサンプルの最大の「staleness」を秒単位で指定します。staleness ウィンドウは左開・右閉区間です。

Arguments:

* `timestamp` - サンプルのタイムスタンプ
* `value` - `timestamp` に対応する時系列の値

Return value:
指定されたグリッド上の `idelta` 値を `Array(Nullable(Float64))` として返します。返される配列は、各時間グリッドポイントごとに 1 つの値を含みます。特定のグリッドポイントについて、そのウィンドウ内に瞬時デルタ値を計算するのに十分なサンプルが存在しない場合、その値は NULL になります。

Example:
次のクエリは、グリッド [90, 105, 120, 135, 150, 165, 180, 195, 210] 上の `idelta` 値を計算します。

```sql
WITH
    -- 注記: 140と190の間隔は、windowパラメータに基づいてts = 150、165、180の値がどのように補完されるかを示すためのものです
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- 上記のタイムスタンプに対応する値の配列
    90 AS start_ts,       -- タイムスタンプグリッドの開始位置
    90 + 120 AS end_ts,   -- タイムスタンプグリッドの終了位置
    15 AS step_seconds,   -- タイムスタンプグリッドのステップ幅
    45 AS window_seconds  -- "staleness"ウィンドウ
SELECT timeSeriesInstantDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- このサブクエリは、タイムスタンプと値の配列を`timestamp`、`value`の行に変換します
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

応答:

```response
   ┌─timeSeriesInsta⋯stamps, values)─┐
1. │ [NULL,NULL,0,2,1,1,NULL,NULL,3] │
   └─────────────────────────────────┘
```

また、同じ長さの配列として、複数のタイムスタンプと値のサンプルを渡すこともできます。配列引数を用いた同じクエリは次のとおりです。

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesInstantDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
この関数は実験的な関数です。`allow_experimental_ts_to_grid_aggregate_function=true` を設定して有効化してください。
:::
