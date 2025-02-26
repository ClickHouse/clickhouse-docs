---
slug: /sql-reference/table-functions/timeSeriesTags
sidebar_position: 145
sidebar_label: timeSeriesTags
---

# timeSeriesTags

`timeSeriesTags(db_name.time_series_table)` - テーブル `db_name.time_series_table` が使用する[タグ](../../engines/table-engines/integrations/time-series.md#tags-table)テーブルを返します。このテーブルのエンジンは[TimeSeries](../../engines/table-engines/integrations/time-series.md)です:

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS tags_table
```

この関数は、_tags_ テーブルが内部の場合でも機能します:

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下のクエリは等価です:

``` sql
SELECT * FROM timeSeriesTags(db_name.time_series_table);
SELECT * FROM timeSeriesTags('db_name.time_series_table');
SELECT * FROM timeSeriesTags('db_name', 'time_series_table');
```
