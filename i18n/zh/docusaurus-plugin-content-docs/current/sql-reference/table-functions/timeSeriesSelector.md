---
'description': '从 TimeSeries 表中读取时间序列，通过选择器过滤，并且在指定的时间间隔内使用时间戳.'
'sidebar_label': 'timeSeriesSelector'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/timeSeriesSelector'
'title': 'timeSeriesSelector'
'doc_type': 'reference'
---


# timeSeriesSelector 表函数

从按选择条件过滤的 TimeSeries 表中读取时间序列，并且时间戳在指定的区间内。这个函数类似于 [范围选择器](https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors)，但它也用于实现 [即时选择器](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors)。

## 语法 {#syntax}

```sql
timeSeriesSelector('db_name', 'time_series_table', 'instant_query', min_time, max_time)
timeSeriesSelector(db_name.time_series_table, 'instant_query', min_time, max_time)
timeSeriesSelector('time_series_table', 'instant_query', min_time, max_time)
```

## 参数 {#arguments}

- `db_name` - 存在 TimeSeries 表的数据库名称。
- `time_series_table` - TimeSeries 表的名称。
- `instant_query` - 用 [PromQL 语法](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors) 编写的即时选择器，无需 `@` 或 `offset` 修饰符。
- `min_time` - 开始时间戳，包含在内。
- `max_time` - 结束时间戳，包含在内。

## 返回值 {#returned_value}

该函数返回三列：
- `id` - 包含与指定选择器匹配的时间序列的标识符。
- `timestamp` - 包含时间戳。
- `value` - 包含值。

返回的数据没有特定的顺序。

## 示例 {#example}

```sql
SELECT * FROM timeSeriesSelector(mytable, 'http_requests{job="prometheus"}', now() - INTERVAL 10 MINUTES, now())
```
