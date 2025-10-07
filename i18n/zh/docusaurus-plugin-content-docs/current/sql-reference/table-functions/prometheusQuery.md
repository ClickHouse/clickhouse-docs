---
'description': '使用来自 TimeSeries 表的数据评估 prometheus 查询。'
'sidebar_label': 'prometheusQuery'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/prometheusQuery'
'title': 'prometheusQuery'
'doc_type': 'reference'
---


# prometheusQuery 表函数

使用来自时间序列表的数据来评估 prometheus 查询。

## 语法 {#syntax}

```sql
prometheusQuery('db_name', 'time_series_table', 'promql_query', evaluation_time)
prometheusQuery(db_name.time_series_table, 'promql_query', evaluation_time)
prometheusQuery('time_series_table', 'promql_query', evaluation_time)
```

## 参数 {#arguments}

- `db_name` - 存在时间序列表的数据库名称。
- `time_series_table` - 时间序列表的名称。
- `promql_query` - 采用 [PromQL 语法](https://prometheus.io/docs/prometheus/latest/querying/basics/) 编写的查询。
- `evaluation_time` - 评估时间戳。要在当前时间评估查询，请使用 `now()` 作为 `evaluation_time`。

## 返回值 {#returned_value}

该函数可以根据传递给参数 `promql_query` 的查询的结果类型返回不同的列：

| 结果类型 | 结果列 | 示例 |
|----------|--------|------|
| vector   | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType | prometheusQuery(mytable, 'up') |
| matrix   | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar   | scalar ValueType | prometheusQuery(mytable, '1h30m') |
| string   | string String | prometheusQuery(mytable, '"abc"') |

## 示例 {#example}

```sql
SELECT * FROM prometheusQuery(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now())
```
