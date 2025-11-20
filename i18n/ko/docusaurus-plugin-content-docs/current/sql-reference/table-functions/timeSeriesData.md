---
'description': 'timeSeriesData는 테이블 `db_name.time_series_table`에서 사용되는 데이터 테이블을 반환하며,
  이 테이블 엔진은 TimeSeries입니다.'
'sidebar_label': 'timeSeriesData'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/timeSeriesData'
'title': 'timeSeriesData'
'doc_type': 'reference'
---


# timeSeriesData 테이블 함수

`timeSeriesData(db_name.time_series_table)` - [데이터](../../engines/table-engines/integrations/time-series.md#data-table) 테이블을 반환합니다. 해당 테이블의 엔진은 [TimeSeries](../../engines/table-engines/integrations/time-series.md)입니다:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

함수는 _data_ 테이블이 내부인 경우에도 작동합니다:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

다음 쿼리는 동일합니다:

```sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');
```
