---
description: '指定されたグリッドにタイムシリーズデータを再サンプリングする集約関数。'
sidebar_position: 226
slug: /sql-reference/aggregate-functions/reference/timeSeriesResampleToGridWithStaleness
title: 'timeSeriesResampleToGridWithStaleness'
doc_type: 'reference'
---

タイムスタンプと値のペアとして与えられたタイムシリーズデータを、開始タイムスタンプ・終了タイムスタンプ・ステップによって定義される等間隔の時間グリッドに再サンプリングする集約関数です。グリッド上の各ポイントについて、（指定された時間ウィンドウ内で）最も新しいサンプルが選択されます。

エイリアス: `timeSeriesLastToGrid`。

パラメータ:

* `start timestamp` - グリッドの開始時刻を指定します
* `end timestamp` - グリッドの終了時刻を指定します
* `grid step` - グリッドのステップ（秒）を指定します
* `staleness window` - 最新サンプルに許容される最大の「staleness」（古さ）を秒で指定します

引数:

* `timestamp` - サンプルのタイムスタンプ
* `value` - `timestamp` に対応するタイムシリーズの値

戻り値:
指定されたグリッドに再サンプリングされたタイムシリーズの値を `Array(Nullable(Float64))` として返します。返される配列には、各時間グリッドポイントに1つの値が含まれます。特定のグリッドポイントに対応するサンプルが存在しない場合、その値は NULL になります。

例:
次のクエリは、グリッド [90, 105, 120, 135, 150, 165, 180, 195, 210] に対して、それぞれのグリッドポイントについて 30 秒より古くない値を選択することでタイムシリーズデータを再サンプリングします:

```sql
WITH
    -- 注意: 140 と 190 の間のギャップは、staleness window パラメータに基づいて ts = 150, 165, 180 の値がどのように補間されるかを示すためのものです
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- 上記のタイムスタンプに対応する値の配列
    90 AS start_ts,       -- タイムスタンプグリッドの開始時刻
    90 + 120 AS end_ts,   -- タイムスタンプグリッドの終了時刻
    15 AS step_seconds,   -- タイムスタンプグリッドのステップ幅（秒）
    30 AS window_seconds  -- 「staleness」ウィンドウ
SELECT timeSeriesResampleToGridWithStaleness(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- このサブクエリは、タイムスタンプと値の配列を `timestamp`, `value` の行に展開します
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

レスポンス:

```response
   ┌─timeSeriesResa⋯stamp, value)─┐
1. │ [NULL,NULL,1,3,4,4,NULL,5,8] │
   └──────────────────────────────┘
```

また、タイムスタンプと値のサンプルを、同じ長さの配列として複数渡すことも可能です。配列引数を用いた同じクエリは次のとおりです。

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    30 AS window_seconds
SELECT timeSeriesResampleToGridWithStaleness(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
この関数は実験的な機能です。`allow_experimental_ts_to_grid_aggregate_function=true` を設定して有効にしてください。
:::
