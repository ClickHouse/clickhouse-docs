---
description: 'timeSeriesMetricsは、テーブルエンジンがTimeSeriesエンジンであるテーブル`db_name.time_series_table`によって使用されるメトリクステーブルを返します。'
sidebar_label: 'timeSeriesMetrics'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesMetrics
title: 'timeSeriesMetrics'
---


# timeSeriesMetrics テーブル関数

`timeSeriesMetrics(db_name.time_series_table)` - テーブルエンジンが [TimeSeries](../../engines/table-engines/integrations/time-series.md) エンジンであるテーブル `db_name.time_series_table` によって使用される [メトリクス](../../engines/table-engines/integrations/time-series.md#metrics-table) テーブルを返します:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS metrics_table
```

この関数は、_metrics_ テーブルが内部の場合でも機能します:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下のクエリは同等です:

```sql
SELECT * FROM timeSeriesMetrics(db_name.time_series_table);
SELECT * FROM timeSeriesMetrics('db_name.time_series_table');
SELECT * FROM timeSeriesMetrics('db_name', 'time_series_table');
```
