---
'description': '지정된 그리드에서 시계열 데이터에 대해 PromQL과 유사한 선형 예측을 계산하는 집계 함수.'
'sidebar_position': 228
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesPredictLinearToGrid'
'title': 'timeSeriesPredictLinearToGrid'
'doc_type': 'reference'
---

Aggregate function that takes time series data as pairs of timestamps and values and calculates a [PromQL-like linear prediction](https://prometheus.io/docs/prometheus/latest/querying/functions/#predict_linear) with a specified prediction timestamp offset from this data on a regular time grid described by start timestamp, end timestamp and step. For each point on the grid the samples for calculating `predict_linear` are considered within the specified time window.

Parameters:
- `start timestamp` - 그리드의 시작 시간을 지정합니다.
- `end timestamp` - 그리드의 종료 시간을 지정합니다.
- `grid step` - 초 단위로 그리드의 스텝을 지정합니다.
- `staleness` - 고려된 샘플의 최대 "노후화" 시간을 초 단위로 지정합니다. 노후화 윈도우는 왼쪽은 열린 구간이고 오른쪽은 닫힌 구간입니다.
- `predict_offset` - 예측 시간에 추가할 초 단위 오프셋을 지정합니다.

Arguments:
- `timestamp` - 샘플의 타임스탬프
- `value` - `timestamp`에 해당하는 시계열의 값

Return value:
지정된 그리드上的 `predict_linear` 값은 `Array(Nullable(Float64))` 형식으로 반환됩니다. 반환된 배열은 각 시간 그리드 포인트에 대해 하나의 값을 포함합니다. 해당 윈도우 내에 특정 그리드 포인트의 비율 값을 계산하기에 충분한 샘플이 없을 경우 값은 NULL입니다.

Example:
다음 쿼리는 60초 오프셋으로 그리드 [90, 105, 120, 135, 150, 165, 180, 195, 210]上的 `predict_linear` 값을 계산합니다:

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window parameter
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

또한 타임스탬프 및 값의 여러 샘플을 동일한 크기의 배열로 전달하는 것도 가능합니다. 배열 인수로 동일한 쿼리:

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
이 함수는 실험적입니다. `allow_experimental_ts_to_grid_aggregate_function=true`로 설정하여 활성화하세요.
:::
