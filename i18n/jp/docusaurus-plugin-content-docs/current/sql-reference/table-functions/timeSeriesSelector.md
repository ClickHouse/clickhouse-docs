---
description: 'TimeSeries テーブルから、セレクタでフィルタリングされた、指定された期間内のタイムスタンプを持つ時系列データを読み取ります。'
sidebar_label: 'timeSeriesSelector'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesSelector
title: 'timeSeriesSelector'
doc_type: 'reference'
---



# timeSeriesSelector テーブル関数

TimeSeries テーブルから、セレクタでフィルタされたタイムシリーズを、タイムスタンプが指定された区間内にあるものに限定して読み取ります。
この関数は [range selector](https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors) に似ていますが、[instant selector](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors) を実装するためにも使用されます。



## 構文 {#syntax}

```sql
timeSeriesSelector('db_name', 'time_series_table', 'instant_query', min_time, max_time)
timeSeriesSelector(db_name.time_series_table, 'instant_query', min_time, max_time)
timeSeriesSelector('time_series_table', 'instant_query', min_time, max_time)
```


## 引数 {#arguments}

- `db_name` - TimeSeriesテーブルが配置されているデータベースの名前。
- `time_series_table` - TimeSeriesテーブルの名前。
- `instant_query` - [PromQL構文](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors)で記述されたインスタントセレクタ。`@`または`offset`修飾子を含まない。
- `min_time` - 開始タイムスタンプ(この値を含む)。
- `max_time` - 終了タイムスタンプ(この値を含む)。


## 戻り値 {#returned_value}

この関数は3つのカラムを返します：

- `id` - 指定されたセレクタに一致する時系列の識別子が含まれます。
- `timestamp` - タイムスタンプが含まれます。
- `value` - 値が含まれます。

返されるデータに特定の順序はありません。


## 例 {#example}

```sql
SELECT * FROM timeSeriesSelector(mytable, 'http_requests{job="prometheus"}', now() - INTERVAL 10 MINUTES, now())
```
