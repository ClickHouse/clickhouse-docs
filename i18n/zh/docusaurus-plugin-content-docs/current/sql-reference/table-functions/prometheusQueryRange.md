---
description: '使用 TimeSeries 表中的数据执行 Prometheus 查询。'
sidebar_label: 'prometheusQueryRange'
sidebar_position: 145
slug: /sql-reference/table-functions/prometheusQueryRange
title: 'prometheusQueryRange'
doc_type: 'reference'
---



# prometheusQuery 表函数

基于 TimeSeries 表中的数据，在一段评估时间范围内执行 Prometheus 查询。



## 语法 {#syntax}

```sql
prometheusQueryRange('db_name', 'time_series_table', 'promql_query', start_time, end_time, step)
prometheusQueryRange(db_name.time_series_table, 'promql_query', start_time, end_time, step)
prometheusQueryRange('time_series_table', 'promql_query', start_time, end_time, step)
```


## 参数 {#arguments}

- `db_name` - TimeSeries 表所在的数据库名称。
- `time_series_table` - TimeSeries 表的名称。
- `promql_query` - 使用 [PromQL 语法](https://prometheus.io/docs/prometheus/latest/querying/basics/) 编写的查询。
- `start_time` - 评估范围的起始时间。
- `end_time` - 评估范围的结束时间。
- `step` - 用于从 `start_time` 迭代到 `end_time`(包含端点)的评估时间步长。


## 返回值 {#returned_value}

该函数根据传递给 `promql_query` 参数的查询结果类型返回不同的列:

| 结果类型 | 结果列                                                                        | 示例                            |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| vector      | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType           | prometheusQuery(mytable, 'up')     |
| matrix      | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar      | scalar ValueType                                                                      | prometheusQuery(mytable, '1h30m')  |
| string      | string String                                                                         | prometheusQuery(mytable, '"abc"')  |


## 示例 {#example}

```sql
SELECT * FROM prometheusQueryRange(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now() - INTERVAL 10 MINUTES, now(), INTERVAL 1 MINUTE)
```
