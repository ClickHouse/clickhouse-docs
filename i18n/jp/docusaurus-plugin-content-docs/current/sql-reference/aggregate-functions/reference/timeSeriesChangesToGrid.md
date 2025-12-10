---
description: '指定されたグリッド上の時系列データに対して、PromQL 風の変化量を計算する集約関数。'
sidebar_position: 229
slug: /sql-reference/aggregate-functions/reference/timeSeriesChangesToGrid
title: 'timeSeriesChangesToGrid'
doc_type: 'reference'
---

タイムスタンプと値のペアとして与えられる時系列データを受け取り、開始タイムスタンプ・終了タイムスタンプ・ステップで定義される規則的な時間グリッド上で、そのデータから[PromQL 風の変化量](https://prometheus.io/docs/prometheus/latest/querying/functions/#changes)を計算する集約関数です。グリッド上の各ポイントに対して、`changes` を計算するためのサンプルは、指定された時間ウィンドウ内のものが対象になります。

Parameters:

* `start timestamp` - グリッドの開始時刻を指定します
* `end timestamp` - グリッドの終了時刻を指定します
* `grid step` - グリッドのステップ（秒）を指定します
* `staleness` - 対象とするサンプルの最大の「staleness」（秒）を指定します

Arguments:

* `timestamp` - サンプルのタイムスタンプ
* `value` - `timestamp` に対応する時系列の値

Return value:
指定されたグリッド上の `changes` の値を `Array(Nullable(Float64))` として返します。返される配列には、時間グリッドの各ポイントに対して 1 つの値が含まれます。特定のグリッドポイントについて、変化量を計算するためのサンプルがウィンドウ内に存在しない場合、その値は NULL になります。

Example:
次のクエリは、グリッド [90, 105, 120, 135, 150, 165, 180, 195, 210, 225] 上の `changes` の値を計算します:

```sql
WITH
    -- 注記: 130と190の間隔は、windowパラメータに基づいてts = 180の値がどのように補完されるかを示すためのものです
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- 上記のタイムスタンプに対応する値の配列
    90 AS start_ts,       -- タイムスタンプグリッドの開始位置
    90 + 135 AS end_ts,   -- タイムスタンプグリッドの終了位置
    15 AS step_seconds,   -- タイムスタンプグリッドの間隔(秒)
    45 AS window_seconds  -- "staleness"ウィンドウ(秒)
SELECT timeSeriesChangesToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- このサブクエリは、タイムスタンプと値の配列を`timestamp`、`value`の行形式に変換します
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

レスポンス：

```response
   ┌─timeSeriesChangesToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,1,1,1,NULL,0,1,2]                                                            │
   └───────────────────────────────────────────────────────────────────────────────────────────┘
```

タイムスタンプと値の複数のサンプルを、同じ長さの配列として渡すこともできます。配列引数を使った同じクエリは次のとおりです。

```sql
WITH
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 135 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesChangesToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
この関数は実験的な機能です。有効化するには `allow_experimental_ts_to_grid_aggregate_function=true` を設定してください。
:::
