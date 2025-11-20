---
'description': 'OpenTelemetry를 사용하여 ClickHouse에서 분산 추적 및 메트릭 수집에 대한 가이드'
'sidebar_label': 'Tracing ClickHouse with OpenTelemetry'
'sidebar_position': 62
'slug': '/operations/opentelemetry'
'title': 'Tracing ClickHouse with OpenTelemetry'
'doc_type': 'guide'
---

[OpenTelemetry](https://opentelemetry.io/)는 분산 애플리케이션에서 추적 및 메트릭을 수집하기 위한 개방형 표준입니다. ClickHouse는 OpenTelemetry에 대한 일부 지원을 제공합니다.

## ClickHouse에 추적 컨텍스트 제공하기 {#supplying-trace-context-to-clickhouse}

ClickHouse는 [W3C 권장 사항](https://www.w3.org/TR/trace-context/)에 설명된 대로 추적 컨텍스트 HTTP 헤더를 수락합니다. 또한 ClickHouse 서버 간의 통신 또는 클라이언트와 서버 간의 통신에 사용되는 네이티브 프로토콜을 통해 추적 컨텍스트를 수락합니다. 수동 테스트를 위해, Trace Context 권장 사항에 준수하는 추적 컨텍스트 헤더는 `clickhouse-client`에 `--opentelemetry-traceparent` 및 `--opentelemetry-tracestate` 플래그를 사용하여 제공할 수 있습니다.

부모 추적 컨텍스트가 제공되지 않거나 제공된 추적 컨텍스트가 위의 W3C 표준을 준수하지 않을 경우, ClickHouse는 [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability) 설정에 의해 제어되는 확률로 새로운 추적을 시작할 수 있습니다.

## 추적 컨텍스트 전파하기 {#propagating-the-trace-context}

추적 컨텍스트는 다음과 같은 경우에 하류 서비스로 전파됩니다:

* [Distributed](../engines/table-engines/special/distributed.md) 테이블 엔진을 사용할 때와 같이 원격 ClickHouse 서버에 대한 쿼리.

* [url](../sql-reference/table-functions/url.md) 테이블 함수. 추적 컨텍스트 정보는 HTTP 헤더에 전송됩니다.

## ClickHouse 자체 추적하기 {#tracing-the-clickhouse-itself}

ClickHouse는 각 쿼리와 쿼리 계획 또는 분산 쿼리와 같은 일부 쿼리 실행 단계에 대해 `trace spans`를 생성합니다.

유용하기 위해, 추적 정보는 [Jaeger](https://jaegertracing.io/) 또는 [Prometheus](https://prometheus.io/)와 같이 OpenTelemetry를 지원하는 모니터링 시스템으로 내보내져야 합니다. ClickHouse는 특정 모니터링 시스템에 대한 종속성을 피하고, 대신 시스템 테이블을 통해 추적 데이터를 제공합니다. 표준에서 [필요한 OpenTelemetry 추적 span 정보](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span)는 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 테이블에 저장됩니다.

테이블은 서버 구성에서 활성화되어야 하며, 기본 구성 파일 `config.xml`의 `opentelemetry_span_log` 요소를 참조하십시오. 기본적으로 활성화되어 있습니다.

태그 또는 속성은 키와 값을 포함하는 두 개의 병렬 배열로 저장됩니다. 이를 사용하여 작업하려면 [ARRAY JOIN](../sql-reference/statements/select/array-join.md)을 사용하십시오.

## 로그 쿼리 설정 {#log-query-settings}

[log_query_settings](settings/settings.md) 설정을 활성화하면 쿼리 실행 중 쿼리 설정의 변경 사항이 로그됩니다. 활성화되면 쿼리 설정에 대한 모든 수정 사항이 OpenTelemetry span 로그에 기록됩니다. 이 기능은 쿼리 성능에 영향을 미칠 수 있는 구성 변경 사항을 추적하기 위해 프로덕션 환경에서 특히 유용합니다.

## 모니터링 시스템과의 통합 {#integration-with-monitoring-systems}

현재 ClickHouse에서 모니터링 시스템으로 추적 데이터를 내보낼 수 있는 준비된 도구는 없습니다.

테스트를 위해 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 테이블에 대해 [URL](../engines/table-engines/special/url.md) 엔진으로 물리화된 뷰를 설정하여 추적 수집기의 HTTP 엔드포인트로 도착하는 로그 데이터를 푸시할 수 있습니다. 예를 들어, 최소한의 span 데이터를 `http://localhost:9411`에서 실행 중인 Zipkin 인스턴스로 푸시하려면 Zipkin v2 JSON 형식으로:

```sql
CREATE MATERIALIZED VIEW default.zipkin_spans
ENGINE = URL('http://127.0.0.1:9411/api/v2/spans', 'JSONEachRow')
SETTINGS output_format_json_named_tuples_as_objects = 1,
    output_format_json_array_of_rows = 1 AS
SELECT
    lower(hex(trace_id)) AS traceId,
    CASE WHEN parent_span_id = 0 THEN '' ELSE lower(hex(parent_span_id)) END AS parentId,
    lower(hex(span_id)) AS id,
    operation_name AS name,
    start_time_us AS timestamp,
    finish_time_us - start_time_us AS duration,
    cast(tuple('clickhouse'), 'Tuple(serviceName text)') AS localEndpoint,
    cast(tuple(
        attribute.values[indexOf(attribute.names, 'db.statement')]),
        'Tuple("db.statement" text)') AS tags
FROM system.opentelemetry_span_log
```

오류가 발생할 경우, 오류가 발생한 로그 데이터의 일부는 조용히 손실됩니다. 데이터가 도착하지 않으면 서버 로그에서 오류 메시지를 확인하십시오.

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse로 관측 가능성 솔루션 구축 - 2부 - 추적](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
