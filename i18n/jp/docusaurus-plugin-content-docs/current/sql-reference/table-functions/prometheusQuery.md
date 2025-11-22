---
description: 'TimeSeries テーブルのデータを用いて Prometheus クエリを評価します。'
sidebar_label: 'prometheusQuery'
sidebar_position: 145
slug: /sql-reference/table-functions/prometheusQuery
title: 'prometheusQuery'
doc_type: 'reference'
---



# prometheusQuery テーブル関数

TimeSeries テーブルのデータを使用して、Prometheus のクエリを評価します。



## 構文 {#syntax}

```sql
prometheusQuery('db_name', 'time_series_table', 'promql_query', evaluation_time)
prometheusQuery(db_name.time_series_table, 'promql_query', evaluation_time)
prometheusQuery('time_series_table', 'promql_query', evaluation_time)
```


## 引数 {#arguments}

- `db_name` - TimeSeriesテーブルが存在するデータベースの名前。
- `time_series_table` - TimeSeriesテーブルの名前。
- `promql_query` - [PromQL構文](https://prometheus.io/docs/prometheus/latest/querying/basics/)で記述されたクエリ。
- `evaluation_time` - 評価タイムスタンプ。現在時刻でクエリを評価する場合は、`evaluation_time`に`now()`を使用します。


## 戻り値 {#returned_value}

この関数は、パラメータ `promql_query` に渡されるクエリの結果タイプに応じて、異なるカラムを返すことができます：

| 結果タイプ | 結果カラム                                                                        | 例                            |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| vector      | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType           | prometheusQuery(mytable, 'up')     |
| matrix      | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar      | scalar ValueType                                                                      | prometheusQuery(mytable, '1h30m')  |
| string      | string String                                                                         | prometheusQuery(mytable, '"abc"')  |


## 例 {#example}

```sql
SELECT * FROM prometheusQuery(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now())
```
