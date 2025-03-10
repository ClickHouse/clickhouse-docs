---
slug: /sql-reference/table-functions/timeSeriesTags
sidebar_position: 145
sidebar_label: timeSeriesTags
title: "timeSeriesTags"
description: "timeSeriesTags 表函数返回由表 `db_name.time_series_table` 使用的标签表，该表引擎为时间序列引擎。"
---


# timeSeriesTags 表函数

`timeSeriesTags(db_name.time_series_table)` - 返回由表 `db_name.time_series_table` 使用的 [标签](../../engines/table-engines/integrations/time-series.md#tags-table) 表，该表引擎为 [时间序列](../../engines/table-engines/integrations/time-series.md) 引擎：

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS tags_table
```

如果 _tags_ 表为内部表，函数也能正常工作：

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

以下查询是等效的：

``` sql
SELECT * FROM timeSeriesTags(db_name.time_series_table);
SELECT * FROM timeSeriesTags('db_name.time_series_table');
SELECT * FROM timeSeriesTags('db_name', 'time_series_table');
```
