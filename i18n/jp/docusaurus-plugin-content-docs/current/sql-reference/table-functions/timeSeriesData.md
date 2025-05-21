---
description: 'timeSeriesData は、テーブルエンジンが TimeSeries の `db_name.time_series_table` に使用されるデータテーブルを返します。'
sidebar_label: 'timeSeriesData'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesData
title: 'timeSeriesData'
---


# timeSeriesData テーブル関数

`timeSeriesData(db_name.time_series_table)` - テーブルエンジンが [TimeSeries](../../engines/table-engines/integrations/time-series.md) のテーブル `db_name.time_series_table` に使用される [data](../../engines/table-engines/integrations/time-series.md#data-table) テーブルを返します。

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

この関数は、_data_ テーブルが内部の場合にも機能します。

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

次のクエリは同等です。

```sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');
```
