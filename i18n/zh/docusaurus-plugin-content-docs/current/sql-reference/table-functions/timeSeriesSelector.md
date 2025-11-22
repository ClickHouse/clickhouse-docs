---
description: '从 TimeSeries 表中读取根据选择器过滤且时间戳位于指定区间内的时间序列。'
sidebar_label: 'timeSeriesSelector'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesSelector
title: 'timeSeriesSelector'
doc_type: 'reference'
---



# timeSeriesSelector 表函数

从 TimeSeries 表中读取时间序列数据，按指定的 selector 进行过滤，并将时间戳限定在给定的时间区间内。
此函数类似于 [range selectors](https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors)，但也可用于实现 [instant selectors](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors)。



## 语法 {#syntax}

```sql
timeSeriesSelector('db_name', 'time_series_table', 'instant_query', min_time, max_time)
timeSeriesSelector(db_name.time_series_table, 'instant_query', min_time, max_time)
timeSeriesSelector('time_series_table', 'instant_query', min_time, max_time)
```


## 参数 {#arguments}

- `db_name` - TimeSeries 表所在数据库的名称。
- `time_series_table` - TimeSeries 表的名称。
- `instant_query` - 使用 [PromQL 语法](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors) 编写的即时选择器,不包含 `@` 或 `offset` 修饰符。
- `min_time` - 起始时间戳,包含该值。
- `max_time` - 结束时间戳,包含该值。


## 返回值 {#returned_value}

该函数返回三列：

- `id` - 包含与指定选择器匹配的时间序列标识符。
- `timestamp` - 包含时间戳。
- `value` - 包含数值。

返回数据无特定顺序。


## 示例 {#example}

```sql
SELECT * FROM timeSeriesSelector(mytable, 'http_requests{job="prometheus"}', now() - INTERVAL 10 MINUTES, now())
```
