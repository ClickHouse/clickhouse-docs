---
description: 'timeSeriesData 返回表引擎为 TimeSeries 的表 `db_name.time_series_table` 所使用的数据表。'
sidebar_label: 'timeSeriesData'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesData
title: 'timeSeriesData'
doc_type: 'reference'
---

# timeSeriesData 表函数

`timeSeriesData(db_name.time_series_table)` - 返回表引擎为 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 的表 `db_name.time_series_table` 所使用的 [data](../../engines/table-engines/integrations/time-series.md#data-table) 表。

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

当 *data* 表作为内表（inner）时，该函数同样有效：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下查询等价：

```sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');
```
