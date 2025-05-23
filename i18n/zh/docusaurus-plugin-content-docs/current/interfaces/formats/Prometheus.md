---
'alias': []
'description': 'Prometheus 格式的文档'
'input_format': false
'keywords':
- 'Prometheus'
'output_format': true
'slug': '/interfaces/formats/Prometheus'
'title': 'Prometheus'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

以 [Prometheus 文本格式](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format) 暴露指标。

对于此格式，输出表必须按照以下规则正确结构化：

- 列 `name` ([String](/sql-reference/data-types/string.md)) 和 `value` (数字) 是必需的。
- 行可以选择性地包含 `help` ([String](/sql-reference/data-types/string.md)) 和 `timestamp` (数字)。
- 列 `type` ([String](/sql-reference/data-types/string.md)) 应该是 `counter`、`gauge`、`histogram`、`summary`、`untyped` 或空。
- 每个指标值也可能有一些 `labels` ([Map(String, String)](/sql-reference/data-types/map.md))。
- 多个连续行可以引用一个具有不同标签的指标。表格应按指标名称排序（例如，使用 `ORDER BY name`）。

对于 `histogram` 和 `summary` 标签有特别的要求 - 详情请参见 [Prometheus 文档](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries)。 
特殊规则适用于标签 `{'count':''}` 和 `{'sum':''}` 的行，它们分别被转换为 `<metric_name>_count` 和 `<metric_name>_sum`。

## 示例用法 {#example-usage}

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

将被格式化为：

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

## 格式设置 {#format-settings}
