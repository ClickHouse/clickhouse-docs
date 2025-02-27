---
title : Prometheus
slug: /interfaces/formats/Prometheus
keywords : [Prometheus]
input_format: false
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

[Prometheusのテキストベースの公開フォーマット](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format)でメトリクスを公開します。

このフォーマットでは、出力テーブルが以下のルールに従って正しく構造化されていることが必要です。

- カラム `name` ([String](/sql-reference/data-types/string.md)) と `value` (数値) は必須です。
- 行はオプションで `help` ([String](/sql-reference/data-types/string.md)) および `timestamp` (数値) を含むことができます。
- カラム `type` ([String](/sql-reference/data-types/string.md)) は `counter`、`gauge`、`histogram`、`summary`、`untyped` のいずれかか空である必要があります。
- 各メトリクス値には一部の `labels` ([Map(String, String)](/sql-reference/data-types/map.md)) を持つことができます。
- 複数の連続する行は、異なるラベルを持つ同じメトリクスを参照することができます。テーブルはメトリクス名でソートされるべきです（例： `ORDER BY name` を使用）。

`histogram` と `summary` ラベルに関しては特別な要件があります - 詳細は[Prometheus doc](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries)を参照してください。
ラベル `{'count':''}` と `{'sum':''}` を持つ行には特別なルールが適用され、それぞれ `<metric_name>_count` と `<metric_name>_sum` に変換されます。

## 使用例 {#example-usage}

```yaml
┌─name────────────────────────────────┬─type──────┬─help──────────────────────────────────────┬─labels─────────────────────────┬────value─┬─────timestamp─┐
│ http_request_duration_seconds       │ histogram │ リクエスト時間のヒストグラム。              │ {'le':'0.05'}                  │    24054 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.1'}                   │    33444 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.2'}                   │   100392 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.5'}                   │   129389 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'1'}                     │   133988 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'+Inf'}                  │   144320 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'sum':''}                     │    53423 │             0 │
│ http_requests_total                 │ counter   │ HTTPリクエストの総数                       │ {'method':'post','code':'200'} │     1027 │ 1395066363000 │
│ http_requests_total                 │ counter   │                                           │ {'method':'post','code':'400'} │        3 │ 1395066363000 │
│ metric_without_timestamp_and_labels │           │                                           │ {}                             │    12.47 │             0 │
│ rpc_duration_seconds                │ summary   │ RPC時間の要約（秒単位）。                  │ {'quantile':'0.01'}            │     3102 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.05'}            │     3272 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.5'}             │     4773 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.9'}             │     9001 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.99'}            │    76656 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'count':''}                   │     2693 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'sum':''}                     │ 17560473 │             0 │
│ something_weird                     │           │                                           │ {'problem':'division by zero'} │      inf │      -3982045 │
└─────────────────────────────────────┴───────────┴───────────────────────────────────────────┴────────────────────────────────┴──────────┴───────────────┘
```

次のようにフォーマットされます：

```text
# HELP http_request_duration_seconds リクエスト時間のヒストグラム。
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.05"} 24054
http_request_duration_seconds_bucket{le="0.1"} 33444
http_request_duration_seconds_bucket{le="0.5"} 129389
http_request_duration_seconds_bucket{le="1"} 133988
http_request_duration_seconds_bucket{le="+Inf"} 144320
http_request_duration_seconds_sum 53423
http_request_duration_seconds_count 144320

# HELP http_requests_total HTTPリクエストの総数
# TYPE http_requests_total counter
http_requests_total{code="200",method="post"} 1027 1395066363000
http_requests_total{code="400",method="post"} 3 1395066363000

metric_without_timestamp_and_labels 12.47

# HELP rpc_duration_seconds RPC時間の要約（秒単位）。
# TYPE rpc_duration_seconds summary
rpc_duration_seconds{quantile="0.01"} 3102
rpc_duration_seconds{quantile="0.05"} 3272
rpc_duration_seconds{quantile="0.5"} 4773
rpc_duration_seconds{quantile="0.9"} 9001
rpc_duration_seconds{quantile="0.99"} 76656
rpc_duration_seconds_sum 17560473
rpc_duration_seconds_count 2693

something_weird{problem="division by zero"} +Inf -3982045
```

## フォーマット設定 {#format-settings}
