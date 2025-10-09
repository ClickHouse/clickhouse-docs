---
'alias': []
'description': 'Prometheus 形式に関するドキュメント'
'input_format': false
'keywords':
- 'Prometheus'
'output_format': true
'slug': '/interfaces/formats/Prometheus'
'title': 'Prometheus'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

[Prometheusテキストベースの公開形式](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format)でメトリックを公開します。

この形式では、出力テーブルが以下のルールに従って正しく構成されていることが要件です：

- カラム `name` ([String](/sql-reference/data-types/string.md)) および `value` (数値) が必須です。
- 行にはオプションとして `help` ([String](/sql-reference/data-types/string.md)) および `timestamp` (数値) を含むことができます。
- カラム `type` ([String](/sql-reference/data-types/string.md)) は `counter`、`gauge`、`histogram`、`summary`、`untyped` のいずれか、または空である必要があります。
- 各メトリック値には、いくつかの `labels` ([Map(String, String)](/sql-reference/data-types/map.md)) も含めることができます。
- いくつかの連続する行は、異なるラベルを持つ同じメトリックを参照することがあります。テーブルはメトリック名でソートされる必要があります（例：`ORDER BY name` を使用）。

`histogram` および `summary` ラベルに特別な要件があります - 詳細については [Prometheus doc](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries) を参照してください。 
ラベル `{'count':''}` および `{'sum':''}` を持つ行には特別なルールが適用され、これらはそれぞれ `<metric_name>_count` と `<metric_name>_sum` に変換されます。

## 例の使い方 {#example-usage}

```yaml
┌─name────────────────────────────────┬─type──────┬─help──────────────────────────────────────┬─labels─────────────────────────┬────value─┬─────timestamp─┐
│ http_request_duration_seconds       │ histogram │ A histogram of the request duration.      │ {'le':'0.05'}                  │    24054 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.1'}                   │    33444 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.2'}                   │   100392 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.5'}                   │   129389 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'1'}                     │   133988 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'+Inf'}                  │   144320 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'sum':''}                     │    53423 │             0 │
│ http_requests_total                 │ counter   │ Total number of HTTP requests             │ {'method':'post','code':'200'} │     1027 │ 1395066363000 │
│ http_requests_total                 │ counter   │                                           │ {'method':'post','code':'400'} │        3 │ 1395066363000 │
│ metric_without_timestamp_and_labels │           │                                           │ {}                             │    12.47 │             0 │
│ rpc_duration_seconds                │ summary   │ A summary of the RPC duration in seconds. │ {'quantile':'0.01'}            │     3102 │             0 │
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

# HELP http_request_duration_seconds A histogram of the request duration.

# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.05"} 24054
http_request_duration_seconds_bucket{le="0.1"} 33444
http_request_duration_seconds_bucket{le="0.5"} 129389
http_request_duration_seconds_bucket{le="1"} 133988
http_request_duration_seconds_bucket{le="+Inf"} 144320
http_request_duration_seconds_sum 53423
http_request_duration_seconds_count 144320


# HELP http_requests_total Total number of HTTP requests

# TYPE http_requests_total counter
http_requests_total{code="200",method="post"} 1027 1395066363000
http_requests_total{code="400",method="post"} 3 1395066363000

metric_without_timestamp_and_labels 12.47


# HELP rpc_duration_seconds A summary of the RPC duration in seconds.

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
