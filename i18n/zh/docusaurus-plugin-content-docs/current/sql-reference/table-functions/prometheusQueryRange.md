---
description: '使用来自 TimeSeries 表的数据评估 Prometheus 查询。'
sidebar_label: 'prometheusQueryRange'
sidebar_position: 145
slug: /sql-reference/table-functions/prometheusQueryRange
title: 'prometheusQueryRange'
doc_type: 'reference'
---

# prometheusQuery 表函数 {#prometheusquery-table-function}

在一段评估时间范围内，使用 TimeSeries 表中的数据执行 Prometheus 查询。

## 语法 {#syntax}

```sql
prometheusQueryRange('db_name', 'time_series_table', 'promql_query', start_time, end_time, step)
prometheusQueryRange(db_name.time_series_table, 'promql_query', start_time, end_time, step)
prometheusQueryRange('time_series_table', 'promql_query', start_time, end_time, step)
```

## 参数 {#arguments}

- `db_name` - TimeSeries 表所在数据库的名称。
- `time_series_table` - TimeSeries 表的名称。
- `promql_query` - 使用 [PromQL 语法](https://prometheus.io/docs/prometheus/latest/querying/basics/) 编写的查询。
- `start_time` - 评估区间的开始时间。
- `end_time` - 评估区间的结束时间。
- `step` - 用于在从 `start_time` 到 `end_time`（含起止时间）范围内迭代评估时间的步长。

## 返回值 {#returned_value}

该函数会根据传给参数 `promql_query` 的查询结果类型返回不同的列结构：

| Result Type | Result Columns | Example |
|-------------|----------------|---------|
| vector      | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType | prometheusQuery(mytable, 'up') |
| matrix      | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar      | scalar ValueType | prometheusQuery(mytable, '1h30m') |
| string      | string String | prometheusQuery(mytable, '"abc"') |

## 示例 {#example}

```sql
SELECT * FROM prometheusQueryRange(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now() - INTERVAL 10 MINUTES, now(), INTERVAL 1 MINUTE)
```
