---
'description': '指定されたグリッド上の時系列データに対して、PromQLのような線形予測を計算する集約関数。'
'sidebar_position': 228
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesPredictLinearToGrid'
'title': 'timeSeriesPredictLinearToGrid'
'doc_type': 'reference'
---

Aggregate function that takes time series data as pairs of timestamps and values and calculates a [PromQL-like linear prediction](https://prometheus.io/docs/prometheus/latest/querying/functions/#predict_linear) with a specified prediction timestamp offset from this data on a regular time grid described by start timestamp, end timestamp and step. For each point on the grid the samples for calculating `predict_linear` are considered within the specified time window.

Parameters:
- `start timestamp` - グリッドの開始を指定します。
- `end timestamp` - グリッドの終了を指定します。
- `grid step` - 秒単位でグリッドのステップを指定します。
- `staleness` - 考慮するサンプルの最大「老朽化」を秒単位で指定します。老朽化ウィンドウは左閉じ右開きの区間です。
- `predict_offset` - 予測時間に加える秒数を指定します。

Arguments:
- `timestamp` - サンプルのタイムスタンプ
- `value` - `timestamp` に対応する時系列の値

Return value:
`predict_linear` の値を指定されたグリッド上で `Array(Nullable(Float64))` として返します。返される配列には、各時間グリッドポイントに対して一つの値が含まれます。特定のグリッドポイントのレート値を計算するのに十分なサンプルがウィンドウ内に存在しない場合、値は NULL になります。

Example:
次のクエリは、60秒のオフセットを持つグリッド [90, 105, 120, 135, 150, 165, 180, 195, 210] 上で `predict_linear` の値を計算します。

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window paramater
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds, -- "staleness" window
    60 AS predict_offset  -- prediction time offset
SELECT timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)
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
   ┌─timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)─┐
1. │ [NULL,NULL,1,9.166667,11.6,16.916666,NULL,NULL,16.5]                                                            │
   └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

また、タイムスタンプと値のサンプルを同じサイズの配列として複数渡すことも可能です。配列引数を使用した同じクエリは次の通りです：

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds,
    60 AS predict_offset
SELECT timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamps, values);
```

:::note
この関数は実験的です。 `allow_experimental_ts_to_grid_aggregate_function=true` を設定することで有効にできます。
:::
