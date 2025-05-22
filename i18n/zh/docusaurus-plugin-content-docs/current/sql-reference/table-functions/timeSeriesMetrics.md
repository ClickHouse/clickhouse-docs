
# timeSeriesMetrics 表函数

`timeSeriesMetrics(db_name.time_series_table)` - 返回由表 `db_name.time_series_table` 使用的 [metrics](../../engines/table-engines/integrations/time-series.md#metrics-table) 表，其表引擎为 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 引擎：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS metrics_table
```

如果 _metrics_ 表是内部的，该函数也可以正常工作：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下查询是等效的：

```sql
SELECT * FROM timeSeriesMetrics(db_name.time_series_table);
SELECT * FROM timeSeriesMetrics('db_name.time_series_table');
SELECT * FROM timeSeriesMetrics('db_name', 'time_series_table');
```
