---
description: '실행된 쿼리의 트레이스 스팬 정보를 포함하는 시스템 테이블입니다.'
keywords: ['system table', 'opentelemetry_span_log']
slug: /operations/system-tables/opentelemetry_span_log
title: 'system.opentelemetry_span_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.opentelemetry_span_log \{#systemopentelemetry_span_log\}

<SystemTableCloud />

실행된 쿼리에 대한 [trace span](https://opentracing.io/docs/overview/spans/) 정보를 포함합니다.

컬럼:

* `trace_id` ([UUID](../../sql-reference/data-types/uuid.md)) — 실행된 쿼리의 trace ID입니다.
* `span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span`의 ID입니다.
* `parent_span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 상위 `trace span`의 ID입니다.
* `operation_name` ([String](../../sql-reference/data-types/string.md)) — 연산 이름입니다.
* `kind` ([Enum8](../../sql-reference/data-types/enum.md)) — span의 [SpanKind](https://opentelemetry.io/docs/reference/specification/trace/api/#spankind)입니다.
  * `INTERNAL` — span이 애플리케이션 내부 연산을 나타냄을 의미합니다.
  * `SERVER` — span이 동기 RPC 또는 기타 원격 요청에 대한 서버 측 처리를 포괄함을 의미합니다.
  * `CLIENT` — span이 어떤 원격 서비스에 대한 요청을 설명함을 의미합니다.
  * `PRODUCER` — span이 비동기 요청의 발신자를 설명함을 의미합니다. 이 상위 span은 해당 자식 CONSUMER span보다 먼저 종료되는 경우가 많으며, 자식 span이 시작되기 전일 수도 있습니다.
  * `CONSUMER` - span이 비동기 PRODUCER 요청의 자식을 설명함을 의미합니다.
* `start_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span`의 시작 시간(마이크로초 단위)입니다.
* `finish_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span`의 종료 시간(마이크로초 단위)입니다.
* `finish_date` ([Date](../../sql-reference/data-types/date.md)) — `trace span`의 종료 날짜입니다.
* `status_code` ([Enum8](../../sql-reference/data-types/enum.md)) — span의 상태 코드입니다.
* `status_message` ([String](../../sql-reference/data-types/string.md)) — span과 연관된 오류 메시지(있는 경우)입니다. `status_code`가 ERROR가 아니면 비어 있습니다.
* `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — `trace span`에 따라 달라지는 [Attribute](https://opentelemetry.io/docs/go/instrumentation/#attributes) 이름입니다. [OpenTelemetry](https://opentelemetry.io/) 표준의 권장 사항에 따라 채워집니다.
* `attribute.values` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — `trace span`에 따라 달라지는 Attribute 값입니다. `OpenTelemetry` 표준의 권장 사항에 따라 채워집니다.

**예시**

쿼리:

```sql
SELECT * FROM system.opentelemetry_span_log LIMIT 1 FORMAT Vertical;
```

결과:

```text
Row 1:
──────
trace_id:         cdab0847-0d62-61d5-4d38-dd65b19a1914
span_id:          701487461015578150
parent_span_id:   2991972114672045096
operation_name:   DB::Block DB::InterpreterSelectQuery::getSampleBlockImpl()
kind:             INTERNAL
start_time_us:    1612374594529090
finish_time_us:   1612374594529108
finish_date:      2021-02-03
attribute.names:  []
attribute.values: []
```

**추가 참고**

* [OpenTelemetry](../../operations/opentelemetry.md)
