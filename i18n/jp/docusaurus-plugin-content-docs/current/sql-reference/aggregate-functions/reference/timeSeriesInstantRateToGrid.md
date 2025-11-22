---
description: '指定されたグリッド上の時系列データに対して、PromQL に類似した irate を計算する集約関数。'
sidebar_position: 223
slug: /sql-reference/aggregate-functions/reference/timeSeriesInstantRateToGrid
title: 'timeSeriesInstantRateToGrid'
doc_type: 'reference'
---

この集約関数は、タイムスタンプと値のペアからなる時系列データを受け取り、開始タイムスタンプ、終了タイムスタンプ、およびステップで定義される等間隔の時間グリッド上で、そのデータから [PromQL の irate に類似した値](https://prometheus.io/docs/prometheus/latest/querying/functions/#irate) を計算します。グリッド上の各ポイントに対して、`irate` を計算するためのサンプルは、指定された時間ウィンドウ内のものが考慮されます。

Parameters:

* `start timestamp` - グリッドの開始を指定します。
* `end timestamp` - グリッドの終了を指定します。
* `grid step` - グリッドのステップを秒単位で指定します。
* `staleness` - 対象とするサンプルの許容される最大の &quot;staleness&quot;（古さ）を秒単位で指定します。staleness ウィンドウは左開・右閉区間です。

Arguments:

* `timestamp` - サンプルのタイムスタンプ。
* `value` - `timestamp` に対応する時系列の値。

Return value:
指定されたグリッド上の `irate` 値を `Array(Nullable(Float64))` として返します。返される配列には、時間グリッドの各ポイントに 1 つの値が含まれます。特定のグリッドポイントについて、そのウィンドウ内に瞬時レートを計算するのに十分なサンプルが存在しない場合、その値は NULL になります。

Example:
次のクエリは、グリッド [90, 105, 120, 135, 150, 165, 180, 195, 210] 上の `irate` 値を計算します。

```sql
WITH
    -- 注記: 140と190の間隔は、windowパラメータに基づいてts = 150、165、180の値がどのように補完されるかを示すためのものです
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- 上記のタイムスタンプに対応する値の配列
    90 AS start_ts,       -- タイムスタンプグリッドの開始位置
    90 + 120 AS end_ts,   -- タイムスタンプグリッドの終了位置
    15 AS step_seconds,   -- タイムスタンプグリッドの間隔(秒)
    45 AS window_seconds  -- 「staleness」ウィンドウ(秒)
SELECT timeSeriesInstantRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesInstantRa⋯timestamps, values)─┐
1. │ [NULL,NULL,0,0.2,0.1,0.1,NULL,NULL,0.3] │
   └─────────────────────────────────────────┘
```

また、同じ長さの `Array` として複数のタイムスタンプと値のサンプルを渡すことも可能です。配列引数を用いた同じクエリは次のとおりです。

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesInstantRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
この関数は実験的です。有効にするには `allow_experimental_ts_to_grid_aggregate_function=true` を設定してください。
:::
