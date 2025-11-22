---
description: 'timeSeriesTags テーブル関数は、テーブルエンジンが TimeSeries エンジンであるテーブル `db_name.time_series_table` に対応する tags テーブルを返します。'
sidebar_label: 'timeSeriesTags'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesTags
title: 'timeSeriesTags'
doc_type: 'reference'
---

# timeSeriesTags テーブル関数

`timeSeriesTags(db_name.time_series_table)` - テーブルエンジンが [TimeSeries](../../engines/table-engines/integrations/time-series.md) エンジンである `db_name.time_series_table` が使用する [tags](../../engines/table-engines/integrations/time-series.md#tags-table) テーブルを返します。

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS tags_table
```

この関数は、*tags* テーブルが内側のテーブルである場合にも動作します。

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

次のクエリはいずれも同じ結果になります。

```sql
SELECT * FROM timeSeriesTags(db_name.time_series_table);
SELECT * FROM timeSeriesTags('db_name.time_series_table');
SELECT * FROM timeSeriesTags('db_name', 'time_series_table');
```
