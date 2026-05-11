---
description: 'selector로 필터링하고 지정된 구간 내 타임스탬프를 갖는 시계열 데이터를 TimeSeries 테이블에서 읽습니다.'
sidebar_label: 'timeSeriesSelector'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesSelector
title: 'timeSeriesSelector'
doc_type: 'reference'
---



# timeSeriesSelector Table Function \{#timeseriesselector-table-function\}

지정된 셀렉터로 필터링하고 지정된 구간 내 타임스탬프를 가진 TimeSeries 테이블에서 시계열을 읽습니다.
이 함수는 [range selectors](https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors)와 유사하지만, [instant selectors](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors)를 구현하는 데에도 사용됩니다.



## 구문 \{#syntax\}

```sql
timeSeriesSelector('db_name', 'time_series_table', 'instant_query', min_time, max_time)
timeSeriesSelector(db_name.time_series_table, 'instant_query', min_time, max_time)
timeSeriesSelector('time_series_table', 'instant_query', min_time, max_time)
```


## Arguments \{#arguments\}

- `db_name` - TimeSeries 테이블이 위치한 데이터베이스의 이름입니다.
- `time_series_table` - TimeSeries 테이블의 이름입니다.
- `instant_query` - `@` 또는 `offset` 수정자 없이 [PromQL 구문](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors)으로 작성된 instant selector입니다.
- `min_time` - 시작 타임스탬프(포함)입니다.
- `max_time` - 종료 타임스탬프(포함)입니다.



## 반환 값 \{#returned_value\}

이 함수는 세 개의 컬럼을 반환합니다:
- `id` - 지정된 셀렉터와 일치하는 시계열의 식별자를 포함합니다.
- `timestamp` - 타임스탬프를 포함합니다.
- `value` - 값을 포함합니다.

반환되는 데이터에는 특정 순서가 없습니다.



## 예제 \{#example\}

```sql
SELECT * FROM timeSeriesSelector(mytable, 'http_requests{job="prometheus"}', now() - INTERVAL 10 MINUTES, now())
```
