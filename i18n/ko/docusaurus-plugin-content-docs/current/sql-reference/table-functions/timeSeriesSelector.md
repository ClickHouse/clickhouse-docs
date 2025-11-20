---
'description': '지정된 간격의 타임스탬프와 함께 선택기를 사용하여 필터링된 TimeSeries 테이블에서 시계열을 읽습니다.'
'sidebar_label': 'timeSeriesSelector'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/timeSeriesSelector'
'title': 'timeSeriesSelector'
'doc_type': 'reference'
---


# timeSeriesSelector 테이블 함수

선택자에 의해 필터링되고 지정된 간격 내의 타임스탬프를 가진 TimeSeries 테이블에서 시간 시리즈를 읽습니다. 이 함수는 [범위 선택기](https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors)와 유사하지만 [즉시 선택기](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors)도 구현하는 데 사용됩니다.

## 문법 {#syntax}

```sql
timeSeriesSelector('db_name', 'time_series_table', 'instant_query', min_time, max_time)
timeSeriesSelector(db_name.time_series_table, 'instant_query', min_time, max_time)
timeSeriesSelector('time_series_table', 'instant_query', min_time, max_time)
```

## 인수 {#arguments}

- `db_name` - TimeSeries 테이블이 위치한 데이터베이스의 이름.
- `time_series_table` - TimeSeries 테이블의 이름.
- `instant_query` - `@` 또는 `offset` 수식어 없이 작성된 [PromQL 문법](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors)의 즉시 선택기.
- `min_time` - 시작 타임스탬프, 포함.
- `max_time` - 종료 타임스탬프, 포함.

## 반환 값 {#returned_value}

이 함수는 세 개의 컬럼을 반환합니다:
- `id` - 지정된 선택자와 일치하는 시간 시리즈의 식별자를 포함합니다.
- `timestamp` - 타임스탬프를 포함합니다.
- `value` - 값을 포함합니다.

반환된 데이터에 대한 특정 순서는 없습니다.

## 예제 {#example}

```sql
SELECT * FROM timeSeriesSelector(mytable, 'http_requests{job="prometheus"}', now() - INTERVAL 10 MINUTES, now())
```
