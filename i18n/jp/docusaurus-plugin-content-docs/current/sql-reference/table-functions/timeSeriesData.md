---
slug: /sql-reference/table-functions/timeSeriesData
sidebar_position: 145
sidebar_label: timeSeriesData
title: "timeSeriesData"
description: "timeSeriesDataは、テーブルエンジンがTimeSeriesであるテーブル `db_name.time_series_table` に使用されるデータテーブルを返します。"
---


# timeSeriesData テーブル関数

`timeSeriesData(db_name.time_series_table)` - テーブルエンジンが [TimeSeries](../../engines/table-engines/integrations/time-series.md) であるテーブル `db_name.time_series_table` に使用される [データ](../../engines/table-engines/integrations/time-series.md#data-table) テーブルを返します。

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

この関数は、_data_ テーブルが内部の場合でも機能します。

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下のクエリは等価です。

``` sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');
```
