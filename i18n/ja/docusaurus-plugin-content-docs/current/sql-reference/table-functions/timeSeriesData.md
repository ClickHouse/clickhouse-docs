---
slug: /sql-reference/table-functions/timeSeriesData
sidebar_position: 145
sidebar_label: timeSeriesData
---

# timeSeriesData

`timeSeriesData(db_name.time_series_table)` - テーブル `db_name.time_series_table` が使用する[データ](../../engines/table-engines/integrations/time-series.md#data-table)テーブルを返します。このテーブルのエンジンは[TimeSeries](../../engines/table-engines/integrations/time-series.md)です：

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

この関数は、_data_ テーブルが内部の場合でも機能します：

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下のクエリは同等です：

``` sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');
```
