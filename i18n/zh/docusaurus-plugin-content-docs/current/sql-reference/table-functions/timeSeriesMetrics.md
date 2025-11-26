---
description: 'timeSeriesMetrics 返回用于表引擎为 TimeSeries 的表 `db_name.time_series_table` 的指标表。'
sidebar_label: 'timeSeriesMetrics'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesMetrics
title: 'timeSeriesMetrics'
doc_type: 'reference'
---

# timeSeriesMetrics 表函数

`timeSeriesMetrics(db_name.time_series_table)` - 返回表引擎为 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 的表 `db_name.time_series_table` 所使用的 [metrics](../../engines/table-engines/integrations/time-series.md#metrics-table) 表：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS metrics_table
```

如果 *metrics* 表位于内层，该函数同样适用：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下查询是等价的：

```sql
SELECT * FROM timeSeriesMetrics(db_name.time_series_table);
SELECT * FROM timeSeriesMetrics('db_name.time_series_table');
SELECT * FROM timeSeriesMetrics('db_name', 'time_series_table');
```
