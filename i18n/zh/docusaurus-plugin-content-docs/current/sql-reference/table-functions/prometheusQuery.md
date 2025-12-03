---
description: '使用 TimeSeries 表数据评估 Prometheus 查询。'
sidebar_label: 'prometheusQuery'
sidebar_position: 145
slug: /sql-reference/table-functions/prometheusQuery
title: 'prometheusQuery'
doc_type: 'reference'
---



# prometheusQuery 表函数 {#prometheusquery-table-function}

使用 TimeSeries 表中的数据执行 Prometheus 查询。



## 语法 {#syntax}

```sql
prometheusQuery('db_name', 'time_series_table', 'promql_query', evaluation_time)
prometheusQuery(db_name.time_series_table, 'promql_query', evaluation_time)
prometheusQuery('time_series_table', 'promql_query', evaluation_time)
```


## 参数 {#arguments}

- `db_name` - 包含 TimeSeries 表的数据库名称。
- `time_series_table` - TimeSeries 表的名称。
- `promql_query` - 使用 [PromQL 语法](https://prometheus.io/docs/prometheus/latest/querying/basics/) 编写的查询。
- `evaluation_time` - 用于评估的时间戳。要在当前时间点评估查询，请将 `now()` 作为 `evaluation_time` 传入。



## 返回值 {#returned_value}

该函数会根据传入到参数 `promql_query` 的查询结果类型返回不同的列：

| 结果类型 | 返回列 | 示例 |
|-------------|----------------|---------|
| vector      | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType | prometheusQuery(mytable, 'up') |
| matrix      | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar      | scalar ValueType | prometheusQuery(mytable, '1h30m') |
| string      | string String | prometheusQuery(mytable, '"abc"') |



## 示例 {#example}

```sql
SELECT * FROM prometheusQuery(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now())
```
