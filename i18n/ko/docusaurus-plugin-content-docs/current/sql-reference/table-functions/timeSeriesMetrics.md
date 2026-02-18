---
description: 'timeSeriesMetrics는 테이블 엔진이 TimeSeries 엔진인 `db_name.time_series_table` 테이블에서 사용하는 메트릭 테이블을 반환합니다.'
sidebar_label: 'timeSeriesMetrics'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesMetrics
title: 'timeSeriesMetrics'
doc_type: 'reference'
---

# timeSeriesMetrics 테이블 FUNCTION \{#timeseriesmetrics-table-function\}

`timeSeriesMetrics(db_name.time_series_table)` - 테이블 엔진이 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 엔진인 `db_name.time_series_table` 테이블에서 사용하는 [metrics](../../engines/table-engines/integrations/time-series.md#metrics-table) 테이블을 반환합니다.

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS metrics_table
```

*metrics* 테이블이 inner 테이블인 경우에도 이 함수는 동작합니다:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

다음 쿼리는 서로 동등합니다:

```sql
SELECT * FROM timeSeriesMetrics(db_name.time_series_table);
SELECT * FROM timeSeriesMetrics('db_name.time_series_table');
SELECT * FROM timeSeriesMetrics('db_name', 'time_series_table');
```
