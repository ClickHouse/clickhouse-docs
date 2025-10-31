---
'description': 'TimeSeries テーブルのデータを使用して prometheus クエリを評価します。'
'sidebar_label': 'prometheusQueryRange'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/prometheusQueryRange'
'title': 'prometheusQueryRange'
'doc_type': 'reference'
---


# prometheusQuery テーブル関数

TimeSeries テーブルからのデータを使用して、評価時間の範囲で prometheus クエリを評価します。

## 構文 {#syntax}

```sql
prometheusQueryRange('db_name', 'time_series_table', 'promql_query', start_time, end_time, step)
prometheusQueryRange(db_name.time_series_table, 'promql_query', start_time, end_time, step)
prometheusQueryRange('time_series_table', 'promql_query', start_time, end_time, step)
```

## 引数 {#arguments}

- `db_name` - TimeSeries テーブルが存在するデータベースの名前。
- `time_series_table` - TimeSeries テーブルの名前。
- `promql_query` - [PromQL 構文](https://prometheus.io/docs/prometheus/latest/querying/basics/)で書かれたクエリ。
- `start_time` - 評価範囲の開始時間。
- `end_time` - 評価範囲の終了時間。
- `step` - `start_time` から `end_time` まで（含む）評価時間を反復するために使用されるステップ。

## 戻り値 {#returned_value}

この関数は、パラメータ `promql_query` に渡されたクエリの結果タイプに応じて異なるカラムを返すことができます。

| 結果タイプ | 結果カラム | 例 |
|-------------|----------------|---------|
| vector      | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType | prometheusQuery(mytable, 'up') |
| matrix      | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar      | scalar ValueType | prometheusQuery(mytable, '1h30m') |
| string      | string String | prometheusQuery(mytable, '"abc"') |

## 例 {#example}

```sql
SELECT * FROM prometheusQueryRange(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now() - INTERVAL 10 MINUTES, now(), INTERVAL 1 MINUTE)
```
