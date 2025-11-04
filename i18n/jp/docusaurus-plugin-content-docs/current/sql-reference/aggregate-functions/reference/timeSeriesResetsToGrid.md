---
'description': '指定されたグリッド上の時系列データに対して、PromQLのようなリセットを計算する集約関数。'
'sidebar_position': 230
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesResetsToGrid'
'title': 'timeSeriesResetsToGrid'
'doc_type': 'reference'
---

Aggregate function that takes time series data as pairs of timestamps and values and calculates [PromQL-like resets](https://prometheus.io/docs/prometheus/latest/querying/functions/#resets) from this data on a regular time grid described by start timestamp, end timestamp and step. For each point on the grid the samples for calculating `resets` are considered within the specified time window.

パラメータ:
- `start timestamp` - グリッドの開始を指定します
- `end timestamp` - グリッドの終了を指定します
- `grid step` - グリッドのステップを秒単位で指定します
- `staleness` - 考慮されるサンプルの最大「古さ」を秒単位で指定します

引数:
- `timestamp` - サンプルのタイムスタンプ
- `value` - `timestamp` に対応する時系列の値

返り値:
指定されたグリッド上の `resets` 値を `Array(Nullable(Float64))` として返します。返される配列には、各時間グリッドポイントに対して1つの値が含まれます。特定のグリッドポイントのためにリセット値を計算するためのサンプルがウィンドウ内に存在しない場合、値はNULLです。

例:
次のクエリは、グリッド [90, 105, 120, 135, 150, 165, 180, 195, 210, 225] 上の `resets` 値を計算します:

```sql
WITH
    -- NOTE: the gap between 130 and 190 is to show how values are filled for ts = 180 according to window parameter
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 3, 2, 6, 6, 4, 2, 0]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 135 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesResetsToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesResetsToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,1,1,1,NULL,0,1,2]                                                           │
   └──────────────────────────────────────────────────────────────────────────────────────────┘
```

また、タイムスタンプと値の複数のサンプルを等しいサイズの配列として渡すことも可能です。配列引数を用いた同じクエリ:

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
この関数は実験的です。`allow_experimental_ts_to_grid_aggregate_function=true` を設定することで有効にします。
:::
