---
'description': '指定されたグリッド上の時系列データに対して、PromQLに似た導関数を計算する集約関数。'
'sidebar_position': 227
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesDerivToGrid'
'title': 'timeSeriesDerivToGrid'
'doc_type': 'reference'
---

時間系列データをタイムスタンプと値のペアとして受け取り、指定されたタイムウィンドウ内のサンプルを考慮して、開始タイムスタンプ、終了タイムスタンプ、ステップで説明された定期的な時間グリッド上で[PromQL風の導関数](https://prometheus.io/docs/prometheus/latest/querying/functions/#deriv)を計算する集約関数です。グリッド上の各ポイントに対して、`deriv`を計算するためのサンプルは指定されたタイムウィンドウ内で考慮されます。

パラメータ:
- `start timestamp` - グリッドの開始を指定します。
- `end timestamp` - グリッドの終了を指定します。
- `grid step` - グリッドのステップを秒単位で指定します。
- `staleness` - 考慮されるサンプルの最大「古さ」を秒単位で指定します。古さウィンドウは左開区間および右閉区間です。

引数:
- `timestamp` - サンプルのタイムスタンプ
- `value` - `timestamp`に対応する時間系列の値

戻り値:
指定されたグリッド上の`deriv`値を`Array(Nullable(Float64))`として返します。戻り値の配列には、各時間グリッドポイントに対して1つの値が含まれます。特定のグリッドポイントの導関数値を計算するためのサンプルが十分でない場合、その値はNULLになります。

例:
次のクエリは、グリッド[90, 105, 120, 135, 150, 165, 180, 195, 210]上の`deriv`値を計算します。

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

応答:

```response
   ┌─timeSeriesDerivToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,0.1,0.11,0.15,NULL,NULL,0.15]                                              │
   └─────────────────────────────────────────────────────────────────────────────────────────┘
```

また、同じサイズの配列として複数のタイムスタンプと値のサンプルを渡すことも可能です。配列引数を用いた同じクエリ:

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
この関数は実験的であり、`allow_experimental_ts_to_grid_aggregate_function=true`を設定することで有効にできます。
:::

