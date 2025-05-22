
# timeSeriesData 表函数

`timeSeriesData(db_name.time_series_table)` - 返回由表 `db_name.time_series_table` 使用的 [data](../../engines/table-engines/integrations/time-series.md#data-table) 表，其表引擎为 [TimeSeries](../../engines/table-engines/integrations/time-series.md):

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

如果 _data_ 表是内部的，该函数也可以正常工作：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下查询是等价的：

```sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');
```
