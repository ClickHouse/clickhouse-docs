---
description: 'TimeSeries 테이블의 데이터를 사용하여 Prometheus 쿼리를 평가합니다.'
sidebar_label: 'prometheusQuery'
sidebar_position: 145
slug: /sql-reference/table-functions/prometheusQuery
title: 'prometheusQuery'
doc_type: 'reference'
---



# prometheusQuery 테이블 함수 \{#prometheusquery-table-function\}

TimeSeries 테이블의 데이터를 사용하여 Prometheus 쿼리를 실행합니다.



## 구문 \{#syntax\}

```sql
prometheusQuery('db_name', 'time_series_table', 'promql_query', evaluation_time)
prometheusQuery(db_name.time_series_table, 'promql_query', evaluation_time)
prometheusQuery('time_series_table', 'promql_query', evaluation_time)
```


## Arguments \{#arguments\}

- `db_name` - TimeSeries 테이블이 위치한 데이터베이스의 이름입니다.
- `time_series_table` - TimeSeries 테이블의 이름입니다.
- `promql_query` - [PromQL syntax](https://prometheus.io/docs/prometheus/latest/querying/basics/)로 작성된 쿼리입니다.
- `evaluation_time` - 평가 시점의 타임스탬프입니다. 현재 시점에서 쿼리를 평가하려면 `evaluation_time`에 `now()`를 사용합니다.



## 반환 값 \{#returned_value\}

이 함수는 `promql_query` 매개변수로 전달된 쿼리의 결과 유형에 따라 서로 다른 컬럼을 반환합니다.

| 결과 유형 | 결과 컬럼 | 예시 |
|-------------|----------------|---------|
| vector      | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType | prometheusQuery(mytable, 'up') |
| matrix      | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar      | scalar ValueType | prometheusQuery(mytable, '1h30m') |
| string      | string String | prometheusQuery(mytable, '"abc"') |



## 예제 \{#example\}

```sql
SELECT * FROM prometheusQuery(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now())
```
