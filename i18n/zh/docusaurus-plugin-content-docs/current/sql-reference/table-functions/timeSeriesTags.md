---
description: 'timeSeriesTags 表函数返回 TimeSeries 引擎表 `db_name.time_series_table` 所使用的 tags 表。'
sidebar_label: 'timeSeriesTags'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesTags
title: 'timeSeriesTags'
doc_type: 'reference'
---

# timeSeriesTags 表函数 \\{#timeseriestags-table-function\\}

`timeSeriesTags(db_name.time_series_table)` - 返回表 `db_name.time_series_table` 使用的 [tags](../../engines/table-engines/integrations/time-series.md#tags-table) 表，其中该表的表引擎为 [TimeSeries](../../engines/table-engines/integrations/time-series.md) 引擎：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS tags_table
```

如果 *tags* 表是内部表，该函数同样适用：

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下查询是等价的：

```sql
SELECT * FROM timeSeriesTags(db_name.time_series_table);
SELECT * FROM timeSeriesTags('db_name.time_series_table');
SELECT * FROM timeSeriesTags('db_name', 'time_series_table');
```
