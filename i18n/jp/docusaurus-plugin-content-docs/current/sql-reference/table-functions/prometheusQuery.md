---
'description': 'TimeSeries テーブルのデータを使用して prometheus クエリを評価します。'
'sidebar_label': 'prometheusQuery'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/prometheusQuery'
'title': 'prometheusQuery'
'doc_type': 'reference'
---


# prometheusQuery テーブル関数

TimeSeries テーブルからのデータを使用して、prometheus クエリを評価します。

## 構文 {#syntax}

```sql
prometheusQuery('db_name', 'time_series_table', 'promql_query', evaluation_time)
prometheusQuery(db_name.time_series_table, 'promql_query', evaluation_time)
prometheusQuery('time_series_table', 'promql_query', evaluation_time)
```

## 引数 {#arguments}

- `db_name` - TimeSeries テーブルが存在するデータベースの名前。
- `time_series_table` - TimeSeries テーブルの名前。
- `promql_query` - [PromQL 構文](https://prometheus.io/docs/prometheus/latest/querying/basics/)で書かれたクエリ。
- `evaluation_time` - 評価のタイムスタンプ。現在の時刻でクエリを評価するには、`evaluation_time`として `now()` を使用します。

## 戻り値 {#returned_value}

この関数は、`promql_query`パラメーターに渡されたクエリの結果タイプに応じて異なるカラムを返すことができます：

| 結果タイプ | 結果カラム | 例 |
|-------------|----------------|---------|
| vector      | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType | prometheusQuery(mytable, 'up') |
| matrix      | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar      | scalar ValueType | prometheusQuery(mytable, '1h30m') |
| string      | string String | prometheusQuery(mytable, '"abc"') |

## 例 {#example}

```sql
SELECT * FROM prometheusQuery(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now())
```
