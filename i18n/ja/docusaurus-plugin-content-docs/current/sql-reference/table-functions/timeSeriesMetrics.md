---
slug: /sql-reference/table-functions/timeSeriesMetrics
sidebar_position: 145
sidebar_label: timeSeriesMetrics
---

# timeSeriesMetrics

`timeSeriesMetrics(db_name.time_series_table)` - テーブル `db_name.time_series_table` によって使用される[メトリクス](../../engines/table-engines/integrations/time-series.md#metrics-table) テーブルを返します。このテーブルのエンジンは[TimeSeries](../../engines/table-engines/integrations/time-series.md)です。

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS metrics_table
```

この関数は、_metrics_ テーブルがインナーである場合にも機能します。

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下のクエリは等価です。

``` sql
SELECT * FROM timeSeriesMetrics(db_name.time_series_table);
SELECT * FROM timeSeriesMetrics('db_name.time_series_table');
SELECT * FROM timeSeriesMetrics('db_name', 'time_series_table');
```
