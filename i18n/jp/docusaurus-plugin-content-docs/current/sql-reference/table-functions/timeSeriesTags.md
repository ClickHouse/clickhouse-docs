---
slug: /sql-reference/table-functions/timeSeriesTags
sidebar_position: 145
sidebar_label: timeSeriesTags
title: "timeSeriesTags"
description: "timeSeriesTags テーブル関数は、テーブル エンジンが TimeSeries エンジンである `db_name.time_series_table` に使用されるタグ テーブルを返します。"
---


# timeSeriesTags テーブル関数

`timeSeriesTags(db_name.time_series_table)` - [tags](../../engines/table-engines/integrations/time-series.md#tags-table) テーブルを返します
テーブル エンジンが [TimeSeries](../../engines/table-engines/integrations/time-series.md) エンジンである `db_name.time_series_table` に使用されます:

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS tags_table
```

この関数は、_tags_ テーブルが内部の場合でも機能します:

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

次のクエリは同等です:

``` sql
SELECT * FROM timeSeriesTags(db_name.time_series_table);
SELECT * FROM timeSeriesTags('db_name.time_series_table');
SELECT * FROM timeSeriesTags('db_name', 'time_series_table');
```
