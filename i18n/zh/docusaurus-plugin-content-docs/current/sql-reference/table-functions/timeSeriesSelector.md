---
description: '从 TimeSeries 表中读取时间序列，根据选择器进行过滤，并限定时间戳在指定时间区间内。'
sidebar_label: 'timeSeriesSelector'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesSelector
title: 'timeSeriesSelector'
doc_type: 'reference'
---



# timeSeriesSelector 表函数

从 TimeSeries 表中读取满足选择器过滤条件且时间戳位于指定时间区间内的时间序列。
此函数类似于 [range selectors](https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors)，但也可用于实现 [instant selectors](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors)。



## 语法

```sql
timeSeriesSelector('db_name', 'time_series_table', 'instant_query', min_time, max_time)
timeSeriesSelector(db_name.time_series_table, 'instant_query', min_time, max_time)
timeSeriesSelector('time_series_table', 'instant_query', min_time, max_time)
```


## 参数 {#arguments}

- `db_name` - 包含 TimeSeries 表的数据库名称。
- `time_series_table` - TimeSeries 表的名称。
- `instant_query` - 使用 [PromQL 语法](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors) 编写的即时选择器（instant selector），且不包含 `@` 或 `offset` 修饰符。
- `min_time` - 起始时间戳（含）。
- `max_time` - 结束时间戳（含）。



## 返回值 {#returned_value}

该函数返回三列：
- `id` - 包含符合指定选择器条件的时间序列标识符。
- `timestamp` - 包含时间戳。
- `value` - 包含数值。

返回的数据不保证特定顺序。



## 示例

```sql
SELECT * FROM timeSeriesSelector(mytable, 'http_requests{job="prometheus"}', now() - INTERVAL 10 MINUTES, now())
```
