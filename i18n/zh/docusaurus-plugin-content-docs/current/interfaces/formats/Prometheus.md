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



## Description {#description}

以 [Prometheus 文本格式](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format)导出指标。

对于此格式,输出表必须按照以下规则正确构建:

- 列 `name` ([String](/sql-reference/data-types/string.md)) 和 `value` (数字) 是必需的。
- 行可以选择性地包含 `help` ([String](/sql-reference/data-types/string.md)) 和 `timestamp` (数字)。
- 列 `type` ([String](/sql-reference/data-types/string.md)) 应为 `counter`、`gauge`、`histogram`、`summary`、`untyped` 之一或为空。
- 每个指标值还可以包含一些 `labels` ([Map(String, String)](/sql-reference/data-types/map.md))。
- 多个连续的行可以引用具有不同标签的同一指标。表应按指标名称排序(例如,使用 `ORDER BY name`)。

对于 `histogram` 和 `summary` 标签有特殊要求 - 详情请参阅 [Prometheus 文档](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries)。
特殊规则适用于带有标签 `{'count':''}` 和 `{'sum':''}` 的行,它们分别被转换为 `<metric_name>_count` 和 `<metric_name>_sum`。


## 使用示例 {#example-usage}

```yaml
┌─name────────────────────────────────┬─type──────┬─help──────────────────────────────────────┬─labels─────────────────────────┬────value─┬─────timestamp─┐
│ http_request_duration_seconds       │ histogram │ 请求持续时间的直方图。                        │ {'le':'0.05'}                  │    24054 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.1'}                   │    33444 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.2'}                   │   100392 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'0.5'}                   │   129389 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'1'}                     │   133988 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'le':'+Inf'}                  │   144320 │             0 │
│ http_request_duration_seconds       │ histogram │                                           │ {'sum':''}                     │    53423 │             0 │
│ http_requests_total                 │ counter   │ HTTP 请求总数                              │ {'method':'post','code':'200'} │     1027 │ 1395066363000 │
│ http_requests_total                 │ counter   │                                           │ {'method':'post','code':'400'} │        3 │ 1395066363000 │
│ metric_without_timestamp_and_labels │           │                                           │ {}                             │    12.47 │             0 │
│ rpc_duration_seconds                │ summary   │ RPC 持续时间(秒)的摘要。                     │ {'quantile':'0.01'}            │     3102 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.05'}            │     3272 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.5'}             │     4773 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.9'}             │     9001 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'quantile':'0.99'}            │    76656 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'count':''}                   │     2693 │             0 │
│ rpc_duration_seconds                │ summary   │                                           │ {'sum':''}                     │ 17560473 │             0 │
│ something_weird                     │           │                                           │ {'problem':'division by zero'} │      inf │      -3982045 │
└─────────────────────────────────────┴───────────┴───────────────────────────────────────────┴────────────────────────────────┴──────────┴───────────────┘
```

将被格式化为:


```text
# HELP http_request_duration_seconds 请求持续时间的直方图。
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.05"} 24054
http_request_duration_seconds_bucket{le="0.1"} 33444
http_request_duration_seconds_bucket{le="0.5"} 129389
http_request_duration_seconds_bucket{le="1"} 133988
http_request_duration_seconds_bucket{le="+Inf"} 144320
http_request_duration_seconds_sum 53423
http_request_duration_seconds_count 144320
```


# HELP http_requests_total HTTP 请求总数
# TYPE http_requests_total counter
http_requests_total{code="200",method="post"} 1027 1395066363000
http_requests_total{code="400",method="post"} 3 1395066363000

metric_without_timestamp_and_labels 12.47



# HELP rpc&#95;duration&#95;seconds RPC 调用耗时（秒）的汇总。

# TYPE rpc&#95;duration&#95;seconds summary

rpc&#95;duration&#95;seconds{quantile="0.01"} 3102
rpc&#95;duration&#95;seconds{quantile="0.05"} 3272
rpc&#95;duration&#95;seconds{quantile="0.5"} 4773
rpc&#95;duration&#95;seconds{quantile="0.9"} 9001
rpc&#95;duration&#95;seconds{quantile="0.99"} 76656
rpc&#95;duration&#95;seconds&#95;sum 17560473
rpc&#95;duration&#95;seconds&#95;count 2693

something&#95;weird{problem="除零错误"} +Inf -3982045

```
```


## 格式设置 {#format-settings}
