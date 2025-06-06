---
'description': 'timeSeriesTags 表函数返回使用的标签表 由表 `db_name.time_series_table`，其表引擎为 TimeSeries
  引擎。'
'sidebar_label': 'timeSeriesTags'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/timeSeriesTags'
'title': 'timeSeriesTags'
---


# timeSeriesTags 表函数

`timeSeriesTags(db_name.time_series_table)` - 返回由表 `db_name.time_series_table` 使用的 [tags](../../engines/table-engines/integrations/time-series.md#tags-table) 表，该表的引擎是 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 引擎：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS tags_table
```

如果 _tags_ 表是内部的，该函数也可以工作：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下查询是等效的：

```sql
SELECT * FROM timeSeriesTags(db_name.time_series_table);
SELECT * FROM timeSeriesTags('db_name.time_series_table');
SELECT * FROM timeSeriesTags('db_name', 'time_series_table');
```
