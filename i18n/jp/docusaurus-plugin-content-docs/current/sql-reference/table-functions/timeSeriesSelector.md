---
description: 'TimeSeries テーブルから、指定されたセレクタでフィルタリングされた、指定した区間内のタイムスタンプを持つ時系列データを読み取ります。'
sidebar_label: 'timeSeriesSelector'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesSelector
title: 'timeSeriesSelector'
doc_type: 'reference'
---



# timeSeriesSelector テーブル関数

`TimeSeries` テーブルから、セレクタによってフィルタされ、指定された区間内のタイムスタンプを持つ時系列データを読み取ります。
この関数は [range selectors](https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors) に類似していますが、[instant selectors](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors) を実装するためにも使用されます。



## 構文

```sql
timeSeriesSelector('db_name', 'time_series_table', 'instant_query', min_time, max_time)
timeSeriesSelector(db_name.time_series_table, 'instant_query', min_time, max_time)
timeSeriesSelector('time_series_table', 'instant_query', min_time, max_time)
```


## 引数 {#arguments}

- `db_name` - TimeSeries テーブルが存在するデータベース名。
- `time_series_table` - TimeSeries テーブル名。
- `instant_query` - [PromQL 構文](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors)で記述されたインスタントセレクタ。`@` および `offset` 修飾子は使用しないでください。
- `min_time` - 開始タイムスタンプ（開始時刻を含む）。
- `max_time` - 終了タイムスタンプ（終了時刻を含む）。



## 返される値 {#returned_value}

この関数は 3 つの列を返します:
- `id` - 指定したセレクタに一致する時系列の識別子を含みます。
- `timestamp` - タイムスタンプを含みます。
- `value` - 値を含みます。

返されるデータの順序は特に保証されません。



## 例

```sql
SELECT * FROM timeSeriesSelector(mytable, 'http_requests{job="prometheus"}', now() - INTERVAL 10 MINUTES, now())
```
