---
description: 'timeSeriesTags テーブル関数は、テーブルエンジンが TimeSeries エンジンである `db_name.time_series_table`
  テーブルで使用されるタグテーブルを返します。'
sidebar_label: 'timeSeriesTags'
sidebar_position: 145
slug: '/sql-reference/table-functions/timeSeriesTags'
title: 'timeSeriesTags'
---




# timeSeriesTags テーブル機能

`timeSeriesTags(db_name.time_series_table)` - テーブルエンジンが [TimeSeries](../../engines/table-engines/integrations/time-series.md) エンジンの `db_name.time_series_table` で使用される [tags](../../engines/table-engines/integrations/time-series.md#tags-table) テーブルを返します：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS tags_table
```

この関数は、_tags_ テーブルが内部の場合でも動作します：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

次のクエリは同等です：

```sql
SELECT * FROM timeSeriesTags(db_name.time_series_table);
SELECT * FROM timeSeriesTags('db_name.time_series_table');
SELECT * FROM timeSeriesTags('db_name', 'time_series_table');

