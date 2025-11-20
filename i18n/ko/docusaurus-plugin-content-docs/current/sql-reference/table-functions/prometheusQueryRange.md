---
'description': 'TimeSeries 테이블의 데이터를 사용하여 prometheus 쿼리를 평가합니다.'
'sidebar_label': 'prometheusQueryRange'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/prometheusQueryRange'
'title': 'prometheusQueryRange'
'doc_type': 'reference'
---


# prometheusQuery 테이블 함수

시간 범위를 통해 TimeSeries 테이블의 데이터를 사용하여 prometheus 쿼리를 평가합니다.

## 구문 {#syntax}

```sql
prometheusQueryRange('db_name', 'time_series_table', 'promql_query', start_time, end_time, step)
prometheusQueryRange(db_name.time_series_table, 'promql_query', start_time, end_time, step)
prometheusQueryRange('time_series_table', 'promql_query', start_time, end_time, step)
```

## 인수 {#arguments}

- `db_name` - TimeSeries 테이블이 위치한 데이터베이스의 이름.
- `time_series_table` - TimeSeries 테이블의 이름.
- `promql_query` - [PromQL 구문](https://prometheus.io/docs/prometheus/latest/querying/basics/)으로 작성된 쿼리.
- `start_time` - 평가 범위의 시작 시간.
- `end_time` - 평가 범위의 종료 시간.
- `step` - `start_time`에서 `end_time`까지 (포함) 평가 시간을 반복하는 데 사용되는 단계.

## 반환 값 {#returned_value}

이 함수는 `promql_query` 매개변수에 전달된 쿼리의 결과 유형에 따라 다른 컬럼을 반환할 수 있습니다:

| 결과 유형 | 결과 컬럼 | 예제 |
|-------------|----------------|---------|
| vector      | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType | prometheusQuery(mytable, 'up') |
| matrix      | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar      | scalar ValueType | prometheusQuery(mytable, '1h30m') |
| string      | string String | prometheusQuery(mytable, '"abc"') |

## 예제 {#example}

```sql
SELECT * FROM prometheusQueryRange(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now() - INTERVAL 10 MINUTES, now(), INTERVAL 1 MINUTE)
```
