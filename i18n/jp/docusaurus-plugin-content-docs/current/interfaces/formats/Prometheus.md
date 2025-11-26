---
alias: []
description: 'Prometheus 形式に関するドキュメント'
input_format: false
keywords: ['Prometheus']
output_format: true
slug: /interfaces/formats/Prometheus
title: 'Prometheus'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |



## 説明 {#description}

[Prometheus のテキストベースのエクスポジション形式](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format)でメトリクスを公開します。

この形式では、出力テーブルが次のルールに従って正しく構造化されている必要があります。

- 列 `name` ([String](/sql-reference/data-types/string.md)) と `value` (数値) は必須です。
- 行には任意で `help` ([String](/sql-reference/data-types/string.md)) と `timestamp` (数値) を含めることができます。
- 列 `type` ([String](/sql-reference/data-types/string.md)) は、`counter`、`gauge`、`histogram`、`summary`、`untyped` のいずれか、または空である必要があります。
- 各メトリクス値には、`labels` ([Map(String, String)](/sql-reference/data-types/map.md)) を持たせることもできます。
- 連続する複数の行が、異なるラベルを持つ同一メトリクスを参照している場合があります。テーブルはメトリクス名でソートされている必要があります（例: `ORDER BY name` を使用）。

`histogram` と `summary` のラベルには特別な要件があります。詳細は [Prometheus のドキュメント](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries)を参照してください。
ラベル `{'count':''}` および `{'sum':''}` を持つ行には特別なルールが適用され、それぞれ `<metric_name>_count` および `<metric_name>_sum` に変換されます。



## 使用例

```yaml
┌─name────────────────────────────────┬─type──────┬─help──────────────────────────────────────┬─labels─────────────────────────┬────value─┬─────timestamp─┐
│ http_request_duration_seconds       │ histogram │ リクエスト処理時間のヒストグラム。      │ {'le':'0.05'}                  │    24054 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.1'}                   │    33444 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.2'}                   │   100392 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.5'}                   │   129389 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'1'}                     │   133988 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'+Inf'}                  │   144320 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'sum':''}                     │    53423 │             0 │
│ http_requests_total                 │ counter   │ HTTPリクエストの総数             │ {'method':'post','code':'200'} │     1027 │ 1395066363000 │
│ http_requests_total                 │ counter   │                                           │ {'method':'post','code':'400'} │        3 │ 1395066363000 │
│ metric_without_timestamp_and_labels │           │                                           │ {}                             │    12.47 │             0 │
│ rpc_duration_seconds                │ summary   │ RPC処理時間(秒)のサマリー。 │ {'quantile':'0.01'}            │     3102 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.05'}            │     3272 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.5'}             │     4773 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.9'}             │     9001 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.99'}            │    76656 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'count':''}                   │     2693 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'sum':''}                     │ 17560473 │             0 │
│ something_weird                     │           │                                           │ {'problem':'division by zero'} │      inf │      -3982045 │
└─────────────────────────────────────┴───────────┴───────────────────────────────────────────┴────────────────────────────────┴──────────┴───────────────┘
```

次の形式になります:


```text
# HELP http_request_duration_seconds リクエスト処理時間のヒストグラム。
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.05"} 24054
http_request_duration_seconds_bucket{le="0.1"} 33444
http_request_duration_seconds_bucket{le="0.5"} 129389
http_request_duration_seconds_bucket{le="1"} 133988
http_request_duration_seconds_bucket{le="+Inf"} 144320
http_request_duration_seconds_sum 53423
http_request_duration_seconds_count 144320
```


# HELP http_requests_total HTTPリクエストの総数
# TYPE http_requests_total counter
http_requests_total{code="200",method="post"} 1027 1395066363000
http_requests_total{code="400",method="post"} 3 1395066363000

metric_without_timestamp_and_labels 12.47



# HELP rpc&#95;duration&#95;seconds RPC の処理時間（秒）のサマリー。

# TYPE rpc&#95;duration&#95;seconds summary

rpc&#95;duration&#95;seconds{quantile="0.01"} 3102
rpc&#95;duration&#95;seconds{quantile="0.05"} 3272
rpc&#95;duration&#95;seconds{quantile="0.5"} 4773
rpc&#95;duration&#95;seconds{quantile="0.9"} 9001
rpc&#95;duration&#95;seconds{quantile="0.99"} 76656
rpc&#95;duration&#95;seconds&#95;sum 17560473
rpc&#95;duration&#95;seconds&#95;count 2693

something&#95;weird{problem="ゼロによる除算"} +Inf -3982045

```
```


## 書式設定 {#format-settings}
