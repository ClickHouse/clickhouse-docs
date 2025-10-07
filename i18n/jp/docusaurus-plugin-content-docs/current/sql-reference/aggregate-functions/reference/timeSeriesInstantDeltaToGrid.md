---
'description': '指定されたグリッド上で時系列データに対してPromQLのようなideltaを計算する集約関数。'
'sidebar_position': 222
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesInstantDeltaToGrid'
'title': 'timeSeriesInstantDeltaToGrid'
'doc_type': 'reference'
---

Aggregate function that takes time series data as pairs of timestamps and values and calculates [PromQL-like idelta](https://prometheus.io/docs/prometheus/latest/querying/functions/#idelta) from this data on a regular time grid described by start timestamp, end timestamp and step. For each point on the grid the samples for calculating `idelta` are considered within the specified time window.

Parameters:
- `start timestamp` - グリッドの開始を指定します。
- `end timestamp` - グリッドの終了を指定します。
- `grid step` - グリッドのステップを秒単位で指定します。
- `staleness` - 考慮するサンプルの最大「古さ」を秒単位で指定します。古さのウィンドウは左側が開き、右側が閉じた区間です。

Arguments:
- `timestamp` - サンプルのタイムスタンプ
- `value` - `timestamp` に対応する時系列の値

Return value:
指定されたグリッド上の `idelta` 値を `Array(Nullable(Float64))` として返します。返される配列には各時刻グリッドポイントの1つの値が含まれています。ウィンドウ内に特定のグリッドポイントの瞬時デルタ値を計算するのに十分なサンプルがない場合、値は NULL になります。

Example:
次のクエリは、グリッド [90, 105, 120, 135, 150, 165, 180, 195, 210] で `idelta` 値を計算します。

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window paramater
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesInstantDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesInsta⋯stamps, values)─┐
1. │ [NULL,NULL,0,2,1,1,NULL,NULL,3] │
   └─────────────────────────────────┘
```

また、同じサイズの配列として複数のタイムスタンプと値のサンプルを渡すことも可能です。配列引数を使用した同じクエリ：

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
この関数は実験的です。 `allow_experimental_ts_to_grid_aggregate_function=true` を設定することで有効になります。
:::
