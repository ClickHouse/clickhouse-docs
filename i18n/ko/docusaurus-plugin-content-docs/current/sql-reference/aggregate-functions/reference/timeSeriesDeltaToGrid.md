---
'description': '지정된 그리드에서 시계열 데이터에 대한 PromQL과 유사한 델타를 계산하는 집계 함수.'
'sidebar_position': 221
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesDeltaToGrid'
'title': 'timeSeriesDeltaToGrid'
'doc_type': 'reference'
---

Aggregate function that takes time series data as pairs of timestamps and values and calculates [PromQL-like delta](https://prometheus.io/docs/prometheus/latest/querying/functions/#delta) from this data on a regular time grid described by start timestamp, end timestamp and step. For each point on the grid the samples for calculating `delta` are considered within the specified time window.

Parameters:
- `start timestamp` - 그리드의 시작 시간을 지정합니다.
- `end timestamp` - 그리드의 끝 시간을 지정합니다.
- `grid step` - 초 단위로 그리드의 단계를 지정합니다.
- `staleness` - 고려하는 샘플의 최대 "오래됨"을 초 단위로 지정합니다. 오랜 샘플의 시간창은 왼쪽은 열려 있고 오른쪽은 닫혀 있는 구간입니다.

Arguments:
- `timestamp` - 샘플의 타임스탬프
- `value` - `timestamp`에 해당하는 시계열의 값

Return value:
지정된 그리드에서 `delta` 값이 `Array(Nullable(Float64))` 형식으로 반환됩니다. 반환된 배열은 각 시간 그리드 포인트에 대해 하나의 값을 포함합니다. 특정 그리드 포인트에 대해 `delta` 값을 계산할 수 있는 샘플이 충분하지 않으면 값은 NULL입니다.

Example:
다음 쿼리는 그리드 [90, 105, 120, 135, 150, 165, 180, 195, 210]에서 `delta` 값을 계산합니다:

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window parameter
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesDeltaToGr⋯timestamps, values)─┐
1. │ [NULL,NULL,0,3,4.5,3.75,NULL,NULL,3.75] │
   └─────────────────────────────────────────┘
```

또한, 동일한 크기의 배열로 타임스탬프와 값을 여러 샘플로 전달할 수도 있습니다. 배열 인수를 사용한 동일한 쿼리:

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
이 함수는 실험적입니다. `allow_experimental_ts_to_grid_aggregate_function=true` 설정으로 활성화하세요.
:::
