---
alias: []
description: 'Prometheus フォーマットのドキュメント'
input_format: false
keywords: ['Prometheus']
output_format: true
slug: /interfaces/formats/Prometheus
title: 'Prometheus'
doc_type: 'reference'
---

| 入力 | 出力 | 別名 |
|-------|--------|-------|
| ✗     | ✔      |       |



## Description {#description}

[Prometheusテキストベース公開フォーマット](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format)でメトリクスを公開します。

このフォーマットでは、出力テーブルが以下のルールに従って正しく構造化されている必要があります:

- カラム`name`([String](/sql-reference/data-types/string.md))と`value`(数値)は必須です。
- 行には任意で`help`([String](/sql-reference/data-types/string.md))と`timestamp`(数値)を含めることができます。
- カラム`type`([String](/sql-reference/data-types/string.md))は`counter`、`gauge`、`histogram`、`summary`、`untyped`のいずれか、または空である必要があります。
- 各メトリクス値には`labels`([Map(String, String)](/sql-reference/data-types/map.md))を持たせることもできます。
- 複数の連続する行が異なるラベルを持つ1つのメトリクスを参照する場合があります。テーブルはメトリクス名でソートされている必要があります(例: `ORDER BY name`)。

`histogram`と`summary`のラベルには特別な要件があります。詳細は[Prometheusドキュメント](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries)を参照してください。
ラベル`{'count':''}`と`{'sum':''}`を持つ行には特別なルールが適用され、それぞれ`<metric_name>_count`と`<metric_name>_sum`に変換されます。


## 使用例 {#example-usage}

```yaml
┌─name────────────────────────────────┬─type──────┬─help──────────────────────────────────────┬─labels─────────────────────────┬────value─┬─────timestamp─┐
│ http_request_duration_seconds       │ histogram │ リクエスト時間のヒストグラム。      │ {'le':'0.05'}                  │    24054 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.1'}                   │    33444 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.2'}                   │   100392 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.5'}                   │   129389 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'1'}                     │   133988 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'+Inf'}                  │   144320 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'sum':''}                     │    53423 │             0 │
│ http_requests_total                 │ counter   │ HTTPリクエストの総数             │ {'method':'post','code':'200'} │     1027 │ 1395066363000 │
│ http_requests_total                 │ counter   │                                           │ {'method':'post','code':'400'} │        3 │ 1395066363000 │
│ metric_without_timestamp_and_labels │           │                                           │ {}                             │    12.47 │             0 │
│ rpc_duration_seconds                │ summary   │ RPC時間(秒)のサマリー。 │ {'quantile':'0.01'}            │     3102 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.05'}            │     3272 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.5'}             │     4773 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.9'}             │     9001 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.99'}            │    76656 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'count':''}                   │     2693 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'sum':''}                     │ 17560473 │             0 │
│ something_weird                     │           │                                           │ {'problem':'division by zero'} │      inf │      -3982045 │
└─────────────────────────────────────┴───────────┴───────────────────────────────────────────┴────────────────────────────────┴──────────┴───────────────┘
```

次のようにフォーマットされます:


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



# HELP rpc&#95;duration&#95;seconds 秒単位の RPC 処理時間のサマリー。

# TYPE rpc&#95;duration&#95;seconds summary

rpc&#95;duration&#95;seconds{quantile="0.01"} 3102
rpc&#95;duration&#95;seconds{quantile="0.05"} 3272
rpc&#95;duration&#95;seconds{quantile="0.5"} 4773
rpc&#95;duration&#95;seconds{quantile="0.9"} 9001
rpc&#95;duration&#95;seconds{quantile="0.99"} 76656
rpc&#95;duration&#95;seconds&#95;sum 17560473
rpc&#95;duration&#95;seconds&#95;count 2693

something&#95;weird{problem="ゼロ除算"} +Inf -3982045

```
```


## フォーマット設定 {#format-settings}
