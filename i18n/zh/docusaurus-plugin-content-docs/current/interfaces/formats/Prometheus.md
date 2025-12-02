---
alias: []
description: 'Prometheus 格式文档'
input_format: false
keywords: ['Prometheus']
output_format: true
slug: /interfaces/formats/Prometheus
title: 'Prometheus'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✗     | ✔      |       |

## 描述 {#description}

以 [Prometheus 文本暴露格式](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format)导出指标数据。

对于该格式，输出表必须满足以下结构规则：

- 必须包含列 `name`（[String](/sql-reference/data-types/string.md)）和 `value`（数值）。
- 行中还可以包含可选列 `help`（[String](/sql-reference/data-types/string.md)）和 `timestamp`（数值）。
- 列 `type`（[String](/sql-reference/data-types/string.md)）的取值应为 `counter`、`gauge`、`histogram`、`summary`、`untyped` 之一，或为空。
- 每个指标值还可以带有若干 `labels`（[Map(String, String)](/sql-reference/data-types/map.md)）。
- 若干连续的行可以对应同一个指标，但具有不同的 labels。表应按指标名称排序（例如使用 `ORDER BY name`）。

对于 `histogram` 和 `summary` 的 labels 有特殊要求，详情参见 [Prometheus 文档](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries)。  
对标签为 `{'count':''}` 和 `{'sum':''}` 的行会应用特殊规则，它们分别会被转换为 `<metric_name>_count` 和 `<metric_name>_sum`。

## 使用示例 {#example-usage}

```yaml
┌─name────────────────────────────────┬─type──────┬─help──────────────────────────────────────┬─labels─────────────────────────┬────value─┬─────timestamp─┐
│ http_request_duration_seconds       │ histogram │ 请求持续时间直方图。                      │ {'le':'0.05'}                  │    24054 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.1'}                   │    33444 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.2'}                   │   100392 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.5'}                   │   129389 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'1'}                     │   133988 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'+Inf'}                  │   144320 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'sum':''}                     │    53423 │             0 │
│ http_requests_total                 │ counter   │ HTTP 请求总数                             │ {'method':'post','code':'200'} │     1027 │ 1395066363000 │
│ http_requests_total                 │ counter   │                                           │ {'method':'post','code':'400'} │        3 │ 1395066363000 │
│ metric_without_timestamp_and_labels │           │                                           │ {}                             │    12.47 │             0 │
│ rpc_duration_seconds                │ summary   │ RPC 持续时间(秒)摘要。                    │ {'quantile':'0.01'}            │     3102 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.05'}            │     3272 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.5'}             │     4773 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.9'}             │     9001 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.99'}            │    76656 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'count':''}                   │     2693 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'sum':''}                     │ 17560473 │             0 │
│ something_weird                     │           │                                           │ {'problem':'division by zero'} │      inf │      -3982045 │
└─────────────────────────────────────┴───────────┴───────────────────────────────────────────┴────────────────────────────────┴──────────┴───────────────┘
```

格式如下：

```text
# HELP http_request_duration_seconds 请求持续时间的直方图。 {#help-http_request_duration_seconds-a-histogram-of-the-request-duration}
# TYPE http_request_duration_seconds histogram {#type-http_request_duration_seconds-histogram}
http_request_duration_seconds_bucket{le="0.05"} 24054
http_request_duration_seconds_bucket{le="0.1"} 33444
http_request_duration_seconds_bucket{le="0.5"} 129389
http_request_duration_seconds_bucket{le="1"} 133988
http_request_duration_seconds_bucket{le="+Inf"} 144320
http_request_duration_seconds_sum 53423
http_request_duration_seconds_count 144320

# HELP http_requests_total HTTP 请求总数 {#help-http_requests_total-total-number-of-http-requests}
# TYPE http_requests_total counter {#type-http_requests_total-counter}
http_requests_total{code="200",method="post"} 1027 1395066363000
http_requests_total{code="400",method="post"} 3 1395066363000

metric_without_timestamp_and_labels 12.47

# HELP rpc_duration_seconds RPC 调用时长（秒）的概要。 {#help-rpc_duration_seconds-a-summary-of-the-rpc-duration-in-seconds}
# TYPE rpc_duration_seconds summary {#type-rpc_duration_seconds-summary}
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
