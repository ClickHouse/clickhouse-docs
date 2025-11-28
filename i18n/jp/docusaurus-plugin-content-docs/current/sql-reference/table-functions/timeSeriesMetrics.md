---
description: 'timeSeriesMetrics は、テーブルエンジンに TimeSeries エンジンを使用するテーブル `db_name.time_series_table` で利用されるメトリクステーブルを返します。'
sidebar_label: 'timeSeriesMetrics'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesMetrics
title: 'timeSeriesMetrics'
doc_type: 'reference'
---

# timeSeriesMetrics テーブル関数

`timeSeriesMetrics(db_name.time_series_table)` — テーブルエンジンとして [TimeSeries](../../engines/table-engines/integrations/time-series.md) エンジンを使用するテーブル `db_name.time_series_table` が利用する [metrics](../../engines/table-engines/integrations/time-series.md#metrics-table) テーブルを返します。

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS metrics_table
```

この関数は、*metrics* テーブルが内側のテーブルになっている場合でも動作します。

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下のクエリは等価です。

```sql
SELECT * FROM timeSeriesMetrics(db_name.time_series_table);
SELECT * FROM timeSeriesMetrics('db_name.time_series_table');
SELECT * FROM timeSeriesMetrics('db_name', 'time_series_table');
```
