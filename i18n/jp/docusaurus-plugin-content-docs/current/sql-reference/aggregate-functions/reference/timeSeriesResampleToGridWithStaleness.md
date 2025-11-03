---
'description': '指定されたグリッドに対して時系列データを再サンプリングする集約関数。'
'sidebar_position': 226
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesResampleToGridWithStaleness'
'title': 'timeSeriesResampleToGridWithStaleness'
'doc_type': 'reference'
---

Aggregate function that takes time series data as pairs of timestamps and values and re-samples this data to a regular time grid described by start timestamp, end timestamp and step. For each point on the grid the most recent (within the specified time window) sample is chosen.

Alias: `timeSeriesLastToGrid`.

Parameters:
- `start timestamp` - グリッドの開始時刻を指定します
- `end timestamp` - グリッドの終了時刻を指定します
- `grid step` - グリッドのステップ（秒単位）を指定します
- `staleness window` - 最近のサンプルの最大「古さ」（秒単位）を指定します

Arguments:
- `timestamp` - サンプルのタイムスタンプ
- `value` - `timestamp` に対応する時系列の値

Return value:
指定されたグリッドに再サンプリングされた時系列の値を `Array(Nullable(Float64))` として返します。返される配列は各時間グリッドポイントに対して1つの値を含みます。特定のグリッドポイントにサンプルがない場合、その値は NULL になります。

Example:
次のクエリは、各グリッドポイントで30秒より古くない値を選択することによって、時系列データをグリッド [90, 105, 120, 135, 150, 165, 180, 195, 210] に再サンプリングします：

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to staleness window parameter
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    30 AS window_seconds  -- "staleness" window
SELECT timeSeriesResampleToGridWithStaleness(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- This subquery converts arrays of timestamps and values into rows of `timestamp`, `value`
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

Response:

```response
   ┌─timeSeriesResa⋯stamp, value)─┐
1. │ [NULL,NULL,1,3,4,4,NULL,5,8] │
   └──────────────────────────────┘
```

また、同じサイズの配列としてタイムスタンプと値の複数のサンプルを渡すことも可能です。配列引数を使用した同じクエリ：

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
この関数は実験的です。`allow_experimental_ts_to_grid_aggregate_function=true` を設定して有効にしてください。
:::
