---
'description': 'timeSeriesMetrics는 `db_name.time_series_table` 테이블의 메트릭스 테이블을 반환합니다.
  이 테이블 엔진은 TimeSeries 엔진입니다.'
'sidebar_label': 'timeSeriesMetrics'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/timeSeriesMetrics'
'title': 'timeSeriesMetrics'
'doc_type': 'reference'
---


# timeSeriesMetrics 테이블 함수

`timeSeriesMetrics(db_name.time_series_table)` - 테이블 엔진이 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 엔진인 `db_name.time_series_table`에서 사용되는 [metrics](../../engines/table-engines/integrations/time-series.md#metrics-table) 테이블을 반환합니다:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS metrics_table
```

함수는 _metrics_ 테이블이 내부인 경우에도 작동합니다:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

다음 쿼리는 동일합니다:

```sql
SELECT * FROM timeSeriesMetrics(db_name.time_series_table);
SELECT * FROM timeSeriesMetrics('db_name.time_series_table');
SELECT * FROM timeSeriesMetrics('db_name', 'time_series_table');
```
