---
description: 'TimeSeries テーブルのデータを使用して Prometheus のクエリを評価します。'
sidebar_label: 'prometheusQuery'
sidebar_position: 145
slug: /sql-reference/table-functions/prometheusQuery
title: 'prometheusQuery'
doc_type: 'reference'
---

TimeSeries テーブルのデータを使用して Prometheus のクエリを評価します。

## 構文 \{#syntax\}

```sql
prometheusQuery('db_name', 'time_series_table', 'promql_query', evaluation_time)
prometheusQuery(db_name.time_series_table, 'promql_query', evaluation_time)
prometheusQuery('time_series_table', 'promql_query', evaluation_time)
```

## Arguments \{#arguments\}

* `db_name` - TimeSeries テーブルが存在するデータベースの名前。
* `time_series_table` - TimeSeries テーブルの名前。
* `promql_query` - [PromQL 構文](https://prometheus.io/docs/prometheus/latest/querying/basics/) で記述されたクエリ。
* `evaluation_time` - 評価時刻のタイムスタンプ。クエリを現在時刻で評価するには、`evaluation_time` に `now()` を使用します。

## 返される値 \{#returned_value\}

この関数は、パラメータ `promql_query` に渡されたクエリの結果型に応じて、返される列が異なります。

| 結果型    | 結果列                                                                                       | 例                                                   |
| ------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| vector | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType               | prometheusQuery(mytable, &#39;up&#39;)              |
| matrix | tags Array(Tuple(String, String)), time&#95;series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, &#39;up[1m]&#39;)          |
| scalar | scalar ValueType                                                                          | prometheusQuery(mytable, &#39;1h30m&#39;)           |
| string | string String                                                                             | prometheusQuery(mytable, &#39;&quot;abc&quot;&#39;) |

## 例 \{#example\}

```sql
SELECT * FROM prometheusQuery(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now())
```