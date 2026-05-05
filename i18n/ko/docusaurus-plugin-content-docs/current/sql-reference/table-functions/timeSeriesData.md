---
description: 'timeSeriesData는 테이블 엔진이 TimeSeries인 `db_name.time_series_table` 테이블에서 사용하는 데이터 테이블을 반환합니다.'
sidebar_label: 'timeSeriesData'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesData
title: 'timeSeriesData'
doc_type: 'reference'
---

# timeSeriesData 테이블 FUNCTION \{#timeseriesdata-table-function\}

`timeSeriesData(db_name.time_series_table)` - 테이블 엔진이 [TimeSeries](../../engines/table-engines/integrations/time-series.md)인
`db_name.time_series_table` 테이블에서 사용하는 [data](../../engines/table-engines/integrations/time-series.md#data-table) 테이블을 반환합니다:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

FUNCTION은 *data* 테이블이 inner 테이블인 경우에도 동작합니다.

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

다음 쿼리는 서로 동일합니다:

```sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');
```
