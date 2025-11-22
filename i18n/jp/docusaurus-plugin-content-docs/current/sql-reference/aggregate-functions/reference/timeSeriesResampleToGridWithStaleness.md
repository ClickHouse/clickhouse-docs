---
description: '指定されたグリッドに時系列データを再サンプリングする集約関数。'
sidebar_position: 226
slug: /sql-reference/aggregate-functions/reference/timeSeriesResampleToGridWithStaleness
title: 'timeSeriesResampleToGridWithStaleness'
doc_type: 'reference'
---

タイムスタンプと値のペアからなる時系列データを受け取り、開始タイムスタンプ、終了タイムスタンプ、およびステップで定義される規則的な時間グリッドに再サンプリングする集約関数です。グリッド上の各ポイントについて、（指定された時間ウィンドウ内で）最新のサンプルが選択されます。

エイリアス: `timeSeriesLastToGrid`。

パラメータ:

* `start timestamp` - グリッドの開始時刻を指定します
* `end timestamp` - グリッドの終了時刻を指定します
* `grid step` - グリッドのステップ（秒単位の刻み幅）を指定します
* `staleness window` - 最新サンプルの許容される最大の「staleness」（秒）を指定します

引数:

* `timestamp` - サンプルのタイムスタンプ
* `value` - `timestamp` に対応する時系列の値

戻り値:
指定されたグリッドに再サンプリングされた時系列の値を `Array(Nullable(Float64))` として返します。返される配列には、各時間グリッドポイントに対して 1 つの値が含まれます。特定のグリッドポイントに対応するサンプルが存在しない場合、その値は NULL になります。

例:
次のクエリは、グリッド [90, 105, 120, 135, 150, 165, 180, 195, 210] に対して、各グリッドポイントについて 30 秒より古くない値を選択することで、時系列データを再サンプリングします。

```sql
WITH
    -- 注記: 140と190の間の間隔は、stalenessウィンドウパラメータに従ってts = 150、165、180の値がどのように補完されるかを示すためのものです
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- 上記のタイムスタンプに対応する値の配列
    90 AS start_ts,       -- タイムスタンプグリッドの開始位置
    90 + 120 AS end_ts,   -- タイムスタンプグリッドの終了位置
    15 AS step_seconds,   -- タイムスタンプグリッドのステップ幅
    30 AS window_seconds  -- stalenessウィンドウ
SELECT timeSeriesResampleToGridWithStaleness(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesResa⋯stamp, value)─┐
1. │ [NULL,NULL,1,3,4,4,NULL,5,8] │
   └──────────────────────────────┘
```

また、複数のタイムスタンプと値を同じ長さの配列として渡すこともできます。配列を引数に取る同じクエリは次のとおりです：

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
この関数は実験的な機能です。有効化するには `allow_experimental_ts_to_grid_aggregate_function=true` を設定してください。
:::
