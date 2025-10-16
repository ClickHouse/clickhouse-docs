---
'description': '指定された間隔内のタイムスタンプとセレクターでフィルタリングされた TimeSeries テーブルからタイムシリーズを読み取ります。'
'sidebar_label': 'timeSeriesSelector'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/timeSeriesSelector'
'title': 'timeSeriesSelector'
'doc_type': 'reference'
---


# timeSeriesSelector テーブル関数

指定されたセレクタでフィルタリングされ、指定された間隔内のタイムスタンプを持つ TimeSeries テーブルから時系列を読み取ります。この関数は [範囲セレクタ](https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors) に似ていますが、[インスタントセレクタ](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors) を実装するためにも使用されます。

## 構文 {#syntax}

```sql
timeSeriesSelector('db_name', 'time_series_table', 'instant_query', min_time, max_time)
timeSeriesSelector(db_name.time_series_table, 'instant_query', min_time, max_time)
timeSeriesSelector('time_series_table', 'instant_query', min_time, max_time)
```

## 引数 {#arguments}

- `db_name` - TimeSeries テーブルが存在するデータベースの名前。
- `time_series_table` - TimeSeries テーブルの名前。
- `instant_query` - `@` または `offset` モディファイアを含まない [PromQL 構文](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors) で書かれたインスタントセレクタ。
- `min_time` - 開始タイムスタンプ（含む）。
- `max_time` - 終了タイムスタンプ（含む）。

## 戻り値 {#returned_value}

この関数は三つのカラムを返します：
- `id` - 指定されたセレクタに一致する時系列の識別子を含みます。
- `timestamp` - タイムスタンプを含みます。
- `value` - 値を含みます。

返されたデータに特定の順序はありません。

## 例 {#example}

```sql
SELECT * FROM timeSeriesSelector(mytable, 'http_requests{job="prometheus"}', now() - INTERVAL 10 MINUTES, now())
```
