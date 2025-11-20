---
'alias': []
'description': 'Prometheus 형식에 대한 Documentation'
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

## 설명 {#description}

[Prometheus 텍스트 기반 전시 형식](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format)에서 메트릭을 노출합니다.

이 형식에서는 출력 테이블이 다음 규칙에 따라 올바르게 구조화되는 것이 요구됩니다:

- `name` ([String](/sql-reference/data-types/string.md)) 및 `value` (숫자) 컬럼은 필수입니다.
- 행은 선택적으로 `help` ([String](/sql-reference/data-types/string.md)) 및 `timestamp` (숫자)를 포함할 수 있습니다.
- `type` ([String](/sql-reference/data-types/string.md)) 컬럼은 `counter`, `gauge`, `histogram`, `summary`, `untyped` 또는 비어 있어야 합니다.
- 각 메트릭 값은 일부 `labels` ([Map(String, String)](/sql-reference/data-types/map.md))를 가질 수도 있습니다.
- 여러 연속 행은 서로 다른 레이블을 가진 하나의 메트릭을 가리킬 수 있습니다. 테이블은 메트릭 이름으로 정렬되어야 합니다 (예: `ORDER BY name` 사용).

`histogram` 및 `summary` 레이블에는 특별한 요구 사항이 있습니다 - 자세한 내용은 [Prometheus 문서](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries)를 참조하십시오. 
`{'count':''}` 및 `{'sum':''}` 레이블이 있는 행에는 특별한 규칙이 적용되며, 이는 각각 `<metric_name>_count` 및 `<metric_name>_sum`으로 변환됩니다.

## 예제 사용법 {#example-usage}

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

다음과 같이 형식이 지정됩니다:

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

## 형식 설정 {#format-settings}
