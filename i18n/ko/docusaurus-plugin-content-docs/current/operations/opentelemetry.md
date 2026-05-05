---
description: 'ClickHouse에서 분산 트레이싱 및 메트릭 수집을 위해 OpenTelemetry를 사용하는 가이드'
sidebar_label: 'OpenTelemetry로 ClickHouse 트레이싱'
sidebar_position: 62
slug: /operations/opentelemetry
title: 'OpenTelemetry로 ClickHouse 트레이싱'
doc_type: 'guide'
---

[OpenTelemetry](https://opentelemetry.io/)는 분산 애플리케이션으로부터 트레이스와 메트릭을 수집하기 위한 오픈 표준입니다. ClickHouse는 OpenTelemetry를 일부 지원합니다.

## ClickHouse에 트레이스 컨텍스트 제공 \{#supplying-trace-context-to-clickhouse\}

ClickHouse는 [W3C 권고안](https://www.w3.org/TR/trace-context/)에 따라 정의된 트레이스 컨텍스트 HTTP 헤더를 수신합니다. 또한 ClickHouse 서버 간 또는 클라이언트와 서버 간 통신에 사용되는 네이티브 프로토콜을 통해 전달되는 트레이스 컨텍스트도 지원합니다. 수동 테스트를 위해 Trace Context 권고안을 준수하는 트레이스 컨텍스트 헤더는 `--opentelemetry-traceparent` 및 `--opentelemetry-tracestate` 플래그를 사용하여 `clickhouse-client`에 제공할 수 있습니다.

상위 트레이스 컨텍스트가 제공되지 않았거나 제공된 트레이스 컨텍스트가 위의 W3C 표준을 준수하지 않는 경우, ClickHouse는 새로운 트레이스를 시작할 수 있으며, 이때 시작 확률은 [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability) 설정으로 제어됩니다.

## 트레이스 컨텍스트 전파 \{#propagating-the-trace-context\}

트레이스 컨텍스트는 다음과 같은 경우 하위 서비스로 전파됩니다.

* [Distributed](../engines/table-engines/special/distributed.md) 테이블 엔진을 사용할 때와 같이, 원격 ClickHouse 서버에 쿼리를 실행하는 경우

* [url](../sql-reference/table-functions/url.md) 테이블 함수를 사용하는 경우. 트레이스 컨텍스트 정보는 HTTP 헤더로 전송됩니다.

## ClickHouse Keeper 요청 추적 \{#tracing-clickhouse-keeper-requests\}

ClickHouse는 [ClickHouse Keeper](../guides/sre/keeper/index.md) 요청(ZooKeeper와 호환되는 코디네이션 서비스)에 대해 OpenTelemetry 트레이싱을 지원합니다. 이 기능은 클라이언트 요청 전송부터 서버 측 처리에 이르기까지 Keeper 작업의 전체 수명 주기에 대한 상세한 가시성을 제공합니다.

### Keeper 트레이싱 활성화 \{#enabling-keeper-tracing\}

Keeper 요청에 대한 트레이싱을 활성화하려면 ZooKeeper/Keeper 클라이언트 설정에서 다음 설정을 구성하십시오:

```xml
<clickhouse>
    <zookeeper>
        <node>
            <host>keeper1</host>
            <port>9181</port>
        </node>
        <!-- Enable OpenTelemetry tracing context propagation -->
        <pass_opentelemetry_tracing_context>true</pass_opentelemetry_tracing_context>
    </zookeeper>
</clickhouse>
```


### Keeper Span 유형 \{#keeper-span-types\}

트레이싱이 활성화되면 ClickHouse는 클라이언트 측과 서버 측 Keeper 작업 모두에 대해 스팬을 생성합니다:

**클라이언트 측 스팬:**

- `zookeeper.create` — 새 노드 생성
- `zookeeper.get` — 노드 데이터 조회
- `zookeeper.set` — 노드 데이터 설정
- `zookeeper.remove` — 노드 삭제
- `zookeeper.list` — 자식 노드 목록 조회
- `zookeeper.exists` — 노드 존재 여부 확인
- `zookeeper.multi` — 여러 작업을 원자적으로 실행
- `zookeeper.client.requests_queue` — 요청이 전송되기 전 큐에서 대기하는 시간

**서버 측 스팬 (Keeper):**

- `keeper.receive_request` — 클라이언트 요청 수신 및 파싱
- `keeper.dispatcher.requests_queue` — 디스패처에서의 요청 큐 대기
- `keeper.write.pre_commit` — Raft 커밋 이전 쓰기 요청 전처리
- `keeper.write.commit` — Raft 커밋 이후 쓰기 요청 처리
- `keeper.read.wait_for_write` — 종속된 쓰기 작업을 기다리는 읽기 요청
- `keeper.read.process` — 읽기 요청 처리
- `keeper.dispatcher.responses_queue` — 디스패처에서의 응답 큐 대기
- `keeper.send_response` — 클라이언트로 응답 전송

### 샘플링과 성능 \{#sampling-and-performance\}

추적 오버헤드를 관리하기 위해 Keeper는 동적 샘플링을 적용합니다. 샘플링 비율은 요청 크기에 따라 자동으로 1/10,000에서 1/10 사이로 조정됩니다. 샘플링 여부와 관계없이 모든 요청의 처리 시간은 성능 모니터링을 위해 히스토그램 메트릭으로 기록됩니다.

## ClickHouse 자체 추적하기 \{#tracing-the-clickhouse-itself\}

ClickHouse는 각 쿼리와 쿼리 실행 단계(예: 쿼리 계획 수립 또는 분산 쿼리)에 대해 `trace spans`를 생성합니다.

트레이싱 정보가 유용하려면 [Jaeger](https://jaegertracing.io/)나 [Prometheus](https://prometheus.io/)처럼 OpenTelemetry를 지원하는 모니터링 시스템으로 내보내야 합니다. ClickHouse는 특정 모니터링 시스템에 대한 의존성을 피하고, 시스템 테이블을 통해서만 트레이싱 데이터를 제공합니다. 표준에서 [요구하는](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span) OpenTelemetry trace span 정보는 [system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) 테이블에 저장됩니다.

이 테이블은 서버 설정에서 활성화해야 하며, 기본 설정 파일 `config.xml`의 `opentelemetry_span_log` 요소를 참고하십시오. 기본적으로 활성화되어 있습니다.

태그 또는 속성은 키와 값을 포함하는 두 개의 병렬 배열로 저장됩니다. 이를 처리하려면 [ARRAY JOIN](../sql-reference/statements/select/array-join.md)을 사용하십시오.

## Log-query-settings \{#log-query-settings\}

[log_query_settings](settings/settings.md) 설정을 사용하면 쿼리 실행 중 쿼리 설정 변경 내용을 로그로 남길 수 있습니다. 이 옵션을 활성화하면 쿼리 설정에 가해진 모든 수정 사항이 OpenTelemetry span 로그에 기록됩니다. 이 기능은 특히 운영 환경에서 쿼리 성능에 영향을 줄 수 있는 설정 변경 사항을 추적하는 데 유용합니다.

## 모니터링 시스템과의 통합 \{#integration-with-monitoring-systems\}

현재 ClickHouse에서 모니터링 시스템으로 추적 데이터를 내보내기 위한 완성된 도구는 없습니다.

테스트 목적으로, [system.opentelemetry&#95;span&#95;log](../operations/system-tables/opentelemetry_span_log.md) 테이블 위에 [URL](../engines/table-engines/special/url.md) 엔진을 사용하는 materialized view를 설정하여, 도착하는 로그 데이터를 trace collector(트레이스 수집기)의 HTTP 엔드포인트로 전송하도록 구성할 수 있습니다. 예를 들어, 최소한의 span 데이터를 Zipkin v2 JSON 형식으로 `http://localhost:9411`에서 실행 중인 Zipkin 인스턴스로 전송하려면 다음과 같이 합니다.

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

오류가 발생한 경우 해당 오류가 발생한 로그 데이터의 일부는 아무런 알림 없이 손실됩니다. 데이터가 수신되지 않으면 서버 로그에서 오류 메시지를 확인하십시오.


## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse로 관측성 솔루션 구축하기 - Part 2 - 트레이스](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)