---
'description': '타임 시리즈를 타임스탬프에 따라 오름차순으로 정렬합니다.'
'sidebar_position': 146
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesGroupArray'
'title': 'timeSeriesGroupArray'
'doc_type': 'reference'
---


# timeSeriesGroupArray

타임 시리즈를 타임스탬프에 따라 오름차순으로 정렬합니다.

**문법**

```sql
timeSeriesGroupArray(timestamp, value)
```

**인수**

- `timestamp` - 샘플의 타임스탬프
- `value` - 해당 `timestamp`에 대한 타임 시리즈의 값

**반환 값**

이 함수는 타임스탬프를 기준으로 오름차순으로 정렬된 튜플(`timestamp`, `value`)의 배열을 반환합니다. 동일한 `timestamp`에 대해 여러 값이 있는 경우, 함수는 이 중 가장 큰 값을 선택합니다.

**예시**

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- array of values corresponding to timestamps above
SELECT timeSeriesGroupArray(timestamp, value)
FROM
(
    -- This subquery converts arrays of timestamps and values into rows of `timestamp`, `value`
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

응답:

```response
   ┌─timeSeriesGroupArray(timestamp, value)───────┐
1. │ [(100,5),(110,1),(120,6),(130,8),(140,19)]   │
   └──────────────────────────────────────────────┘
```

타임스탬프와 값을 동일한 크기의 배열로 여러 샘플로 전달하는 것도 가능합니다. 배열 인수를 사용한 동일한 쿼리:

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- array of values corresponding to timestamps above
SELECT timeSeriesGroupArray(timestamps, values);
```

:::note
이 함수는 실험적입니다. `allow_experimental_ts_to_grid_aggregate_function=true`로 설정하여 활성화하세요.
:::
