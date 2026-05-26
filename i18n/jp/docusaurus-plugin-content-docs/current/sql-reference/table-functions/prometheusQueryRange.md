---
description: 'TimeSeries テーブルのデータを使用して Prometheus のクエリを評価します。'
sidebar_label: 'prometheusQueryRange'
sidebar_position: 145
slug: /sql-reference/table-functions/prometheusQueryRange
title: 'prometheusQueryRange'
doc_type: 'reference'
---

一定期間の評価時刻にわたり、TimeSeries テーブルのデータを使用して Prometheus のクエリを評価します。

## 構文 \{#syntax\}

```sql
prometheusQueryRange('db_name', 'time_series_table', 'promql_query', start_time, end_time, step)
prometheusQueryRange(db_name.time_series_table, 'promql_query', start_time, end_time, step)
prometheusQueryRange('time_series_table', 'promql_query', start_time, end_time, step)
```

## 引数 \{#arguments\}

* `db_name` - TimeSeries テーブルが存在するデータベースの名前。
* `time_series_table` - TimeSeries テーブルの名前。
* `promql_query` - [PromQL 構文](https://prometheus.io/docs/prometheus/latest/querying/basics/)で記述されたクエリ。
* `start_time` - 評価範囲の開始時刻。
* `end_time` - 評価範囲の終了時刻。
* `step` - `start_time` から `end_time` まで (両端を含む) 評価時刻を反復する際に使用されるステップ間隔。

## 戻り値 \{#returned_value\}

この関数は、引数 `promql_query` に渡されたクエリの結果の型に応じて、異なる列を返します。

| Result Type | Result Columns                                                                            | Example                                             |
| ----------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| vector      | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType               | prometheusQuery(mytable, &#39;up&#39;)              |
| matrix      | tags Array(Tuple(String, String)), time&#95;series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, &#39;up[1m]&#39;)          |
| scalar      | scalar ValueType                                                                          | prometheusQuery(mytable, &#39;1h30m&#39;)           |
| string      | string String                                                                             | prometheusQuery(mytable, &#39;&quot;abc&quot;&#39;) |

## 使用例 \{#example\}

```sql
SELECT * FROM prometheusQueryRange(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now() - INTERVAL 10 MINUTES, now(), INTERVAL 1 MINUTE)
```