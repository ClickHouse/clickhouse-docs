---
alias: []
description: 'Prometheus 형식에 대한 문서'
input_format: false
keywords: ['Prometheus']
output_format: true
slug: /interfaces/formats/Prometheus
title: 'Prometheus'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✗     | ✔      |       |



## 설명 \{#description\}

[Prometheus text-based exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format) 형식으로 메트릭을 노출합니다.

이 형식을 사용하려면 출력 테이블이 다음 규칙에 따라 올바르게 구성되어야 합니다:

- `name` ([String](/sql-reference/data-types/string.md)) 컬럼과 `value`(숫자) 컬럼은 필수입니다.
- 행에는 선택적으로 `help` ([String](/sql-reference/data-types/string.md)) 및 `timestamp`(숫자)를 포함할 수 있습니다.
- `type` ([String](/sql-reference/data-types/string.md)) 컬럼은 `counter`, `gauge`, `histogram`, `summary`, `untyped` 중 하나이거나 비어 있어야 합니다.
- 각 메트릭 값에는 `labels` ([Map(String, String)](/sql-reference/data-types/map.md))를 포함할 수도 있습니다.
- 서로 다른 `labels`를 가진 여러 연속된 행이 동일한 메트릭을 참조할 수 있습니다. 테이블은 메트릭 이름(예: `ORDER BY name` 사용)에 따라 정렬되어야 합니다.

`histogram` 및 `summary` 레이블에는 특별한 요구 사항이 있습니다. 자세한 내용은 [Prometheus 문서](https://prometheus.io/docs/instrumenting/exposition_formats/#histograms-and-summaries)를 참고하십시오.  
`{'count':''}` 및 `{'sum':''}` 레이블이 있는 행에는 특별한 규칙이 적용되며, 각각 `<metric_name>_count` 및 `<metric_name>_sum`으로 변환됩니다.



## 사용 예제 \{#example-usage\}

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

형식은 다음과 같습니다:


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

# HELP http_requests_total HTTP 요청 총 횟수
# TYPE http_requests_total counter
http_requests_total{code="200",method="post"} 1027 1395066363000
http_requests_total{code="400",method="post"} 3 1395066363000

metric_without_timestamp_and_labels 12.47

# HELP rpc_duration_seconds RPC 지속 시간(초)에 대한 요약입니다.
# TYPE rpc_duration_seconds summary
rpc_duration_seconds{quantile="0.01"} 3102
rpc_duration_seconds{quantile="0.05"} 3272
rpc_duration_seconds{quantile="0.5"} 4773
rpc_duration_seconds{quantile="0.9"} 9001
rpc_duration_seconds{quantile="0.99"} 76656
rpc_duration_seconds_sum 17560473
rpc_duration_seconds_count 2693

something_weird{problem="0으로 나누기 오류"} +Inf -3982045
```


## 형식 설정 {#format-settings}
