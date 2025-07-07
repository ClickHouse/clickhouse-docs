---
'description': 'timeSeriesData テーブルエンジンがTimeSeriesである `db_name.time_series_table`
  テーブルで使用されるデータテーブルを返します。'
'sidebar_label': 'timeSeriesData'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/timeSeriesData'
'title': 'timeSeriesData'
---




# timeSeriesData テーブル関数

`timeSeriesData(db_name.time_series_table)` - テーブルエンジンが [TimeSeries](../../engines/table-engines/integrations/time-series.md) の `db_name.time_series_table` に使用される [データ](../../engines/table-engines/integrations/time-series.md#data-table) テーブルを返します。

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

この関数は、_data_ テーブルが内部にある場合でも機能します。

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下のクエリは同等です。

```sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');

