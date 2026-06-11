---
description: 'timeSeriesSamples는 테이블 엔진이 TimeSeries인 `db_name.time_series_table`에서
  사용하는 [샘플](../../engines/table-engines/integrations/time-series.md#samples-table) 테이블을 반환합니다.'
sidebar_label: 'timeSeriesSamples'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesSamples
title: 'timeSeriesSamples'
doc_type: 'reference'
---

`timeSeriesSamples(db_name.time_series_table)` - 테이블 엔진이 [TimeSeries](../../engines/table-engines/integrations/time-series.md)인 `db_name.time_series_table`에서 사용하는 [샘플](../../engines/table-engines/integrations/time-series.md#samples-table) 테이블을 반환합니다:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries SAMPLES samples_table
```

*samples* 테이블이 내부 테이블인 경우에도 이 함수는 동작합니다:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries SAMPLES INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

다음 쿼리는 동일한 의미입니다:

```sql
SELECT * FROM timeSeriesSamples(db_name.time_series_table);
SELECT * FROM timeSeriesSamples('db_name.time_series_table');
SELECT * FROM timeSeriesSamples('db_name', 'time_series_table');
```

:::note
함수 `timeSeriesSamples`에는 이전 버전과의 호환성을 위해 유지되고 있는 별칭 `timeSeriesData`가 있습니다.
:::