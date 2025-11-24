---
'description': '시스템 테이블은 실행된 쿼리에 대한 트레이스 범위에 대한 정보를 포함합니다.'
'keywords':
- 'system table'
- 'opentelemetry_span_log'
'slug': '/operations/system-tables/opentelemetry_span_log'
'title': 'system.opentelemetry_span_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.opentelemetry_span_log

<SystemTableCloud/>

실행된 쿼리에 대한 [트레이스 스팬](https://opentracing.io/docs/overview/spans/)에 대한 정보를 포함합니다.

컬럼:

- `trace_id` ([UUID](../../sql-reference/data-types/uuid.md)) — 실행된 쿼리에 대한 트레이스 ID.
- `span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span`의 ID.
- `parent_span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 상위 `trace span`의 ID.
- `operation_name` ([String](../../sql-reference/data-types/string.md)) — 작업의 이름.
- `kind` ([Enum8](../../sql-reference/data-types/enum.md)) — 스팬의 [SpanKind](https://opentelemetry.io/docs/reference/specification/trace/api/#spankind).
  - `INTERNAL` — 스팬이 애플리케이션 내의 내부 작업을 나타냄을 나타냅니다.
  - `SERVER` — 스팬이 동기 RPC 또는 기타 원격 요청에 대한 서버 측 처리를 포함함을 나타냅니다.
  - `CLIENT` — 스팬이 일부 원격 서비스에 대한 요청을 설명함을 나타냅니다.
  - `PRODUCER` — 스팬이 비동기 요청의 발신자를 설명함을 나타냅니다. 이 상위 스팬은 종종 해당 자식 CONSUMER 스팬이 시작되기 전에 끝납니다.
  - `CONSUMER` - 스팬이 비동기 PRODUCER 요청의 자식을 설명함을 나타냅니다.
- `start_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span`의 시작 시간 (마이크로초 단위).
- `finish_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span`의 종료 시간 (마이크로초 단위).
- `finish_date` ([Date](../../sql-reference/data-types/date.md)) — `trace span`의 종료 날짜.
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — `trace span`에 따라 [속성](https://opentelemetry.io/docs/go/instrumentation/#attributes) 이름. [OpenTelemetry](https://opentelemetry.io/) 표준의 권장 사항에 따라 채워집니다.
- `attribute.values` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — `trace span`에 따라 속성 값. `OpenTelemetry` 표준의 권장 사항에 따라 채워집니다.

**예제**

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

**참고**

- [OpenTelemetry](../../operations/opentelemetry.md)
