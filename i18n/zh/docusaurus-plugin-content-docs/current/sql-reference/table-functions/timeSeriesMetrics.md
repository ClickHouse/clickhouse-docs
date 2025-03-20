---
slug: /sql-reference/table-functions/timeSeriesMetrics
sidebar_position: 145
sidebar_label: timeSeriesMetrics
title: 'timeSeriesMetrics'
description: 'timeSeriesMetrics 返回由表 `db_name.time_series_table` 使用的指标表，该表的引擎是 TimeSeries 引擎。'
---


# timeSeriesMetrics 表函数

`timeSeriesMetrics(db_name.time_series_table)` - 返回由表 `db_name.time_series_table` 使用的 [指标](../../engines/table-engines/integrations/time-series.md#metrics-table) 表，该表的引擎是 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 引擎：

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS metrics_table
```

该函数即使在 _metrics_ 表是内部表的情况下也能工作：

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下查询是等效的：

``` sql
SELECT * FROM timeSeriesMetrics(db_name.time_series_table);
SELECT * FROM timeSeriesMetrics('db_name.time_series_table');
SELECT * FROM timeSeriesMetrics('db_name', 'time_series_table');
```
