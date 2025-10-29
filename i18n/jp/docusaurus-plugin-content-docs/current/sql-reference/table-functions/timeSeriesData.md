---
'description': 'timeSeriesData は、テーブルエンジンが TimeSeries のテーブル `db_name.time_series_table`
  で使用されるデータテーブルを返します。'
'sidebar_label': 'timeSeriesData'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/timeSeriesData'
'title': 'timeSeriesData'
'doc_type': 'reference'
---


# timeSeriesData テーブル関数

`timeSeriesData(db_name.time_series_table)` - テーブルエンジンが [TimeSeries](../../engines/table-engines/integrations/time-series.md) の `db_name.time_series_table` に使用される [データ](../../engines/table-engines/integrations/time-series.md#data-table) テーブルを返します：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

この関数は、_data_ テーブルが内部である場合にも動作します：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

次のクエリは同等です：

```sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');
```
