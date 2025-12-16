---
description: '指定されたグリッド上の時系列データに対して、PromQL 風の導関数を計算する集約関数。'
sidebar_position: 227
slug: /sql-reference/aggregate-functions/reference/timeSeriesDerivToGrid
title: 'timeSeriesDerivToGrid'
doc_type: 'reference'
---

タイムスタンプと値のペアとして与えられる時系列データを受け取り、開始タイムスタンプ・終了タイムスタンプ・ステップで定義される規則的な時間グリッド上で、そのデータから [PromQL 風の導関数 (derivative)](https://prometheus.io/docs/prometheus/latest/querying/functions/#deriv) を計算する集約関数です。グリッド上の各ポイントについて、`deriv` を計算するためのサンプルは、指定された時間ウィンドウ内のものが対象となります。

Parameters:

* `start timestamp` - グリッドの開始を指定します。
* `end timestamp` - グリッドの終了を指定します。
* `grid step` - グリッドのステップを秒単位で指定します。
* `staleness` - 対象とするサンプルに許容される最大の「staleness」を秒単位で指定します。staleness ウィンドウは左開・右閉区間です。

Arguments:

* `timestamp` - サンプルのタイムスタンプ
* `value` - `timestamp` に対応する時系列の値

Return value:
指定されたグリッド上の `deriv` の値を `Array(Nullable(Float64))` として返します。返される配列には、時間グリッド上の各ポイントごとに 1 つの値が含まれます。特定のグリッドポイントについて、そのウィンドウ内に導関数の値を計算するのに十分なサンプルが存在しない場合、その値は NULL になります。

Example:
次のクエリは、グリッド [90, 105, 120, 135, 150, 165, 180, 195, 210] 上の `deriv` の値を計算します:

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window parameter
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesDerivToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- This subquery converts arrays of timestamps and values into rows of `timestamp`, `value`
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

レスポンス:

```response
   ┌─timeSeriesDerivToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,0.1,0.11,0.15,NULL,NULL,0.15]                                              │
   └─────────────────────────────────────────────────────────────────────────────────────────┘
```

また、同じ長さの配列としてタイムスタンプと値の複数サンプルを渡すこともできます。配列引数を用いた同じクエリは次のとおりです。

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
この関数は実験的な機能です。`allow_experimental_ts_to_grid_aggregate_function=true` を設定して有効化してください。
:::
