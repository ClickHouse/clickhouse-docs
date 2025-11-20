---
'description': '시스템 테이블로, 프로세서 수준의 프로파일링 정보가 포함되어 있습니다 (이는 `EXPLAIN PIPELINE`에서 찾을
  수 있습니다)'
'keywords':
- 'system table'
- 'processors_profile_log'
- 'EXPLAIN PIPELINE'
'slug': '/operations/system-tables/processors_profile_log'
'title': 'system.processors_profile_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.processors_profile_log

<SystemTableCloud/>

이 테이블은 processors 수준의 프로파일링 정보를 포함하고 있습니다 (이 정보는 [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)에서 찾을 수 있습니다).

열:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트가 발생한 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트가 발생한 날짜 및 시간.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 이벤트가 발생한 마이크로초 정밀도로 날짜 및 시간.
- `id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 프로세서 ID
- `parent_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 부모 프로세서 ID
- `plan_step` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 이 프로세서를 생성한 쿼리 계획 단계의 ID. 프로세서가 어떤 단계에서 추가되지 않았다면 값은 0입니다.
- `plan_group` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 쿼리 계획 단계에 의해 생성된 경우의 프로세서 그룹. 그룹은 같은 쿼리 계획 단계에서 추가된 프로세서의 논리적 파티셔닝입니다. 그룹은 EXPLAIN PIPELINE 결과를 아름답게 꾸미기 위해서만 사용됩니다.
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리 ID (분산 쿼리 실행을 위해).
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 쿼리 ID
- `name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 프로세서의 이름.
- `elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 이 프로세서가 실행된 마이크로초 수.
- `input_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 이 프로세서가 데이터(다른 프로세서에서)를 기다린 마이크로초 수.
- `output_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 출력 포트가 가득 차서 이 프로세서가 기다린 마이크로초 수.
- `input_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 프로세서가 소비한 행 수.
- `input_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 프로세서가 소비한 바이트 수.
- `output_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 프로세서가 생성한 행 수.
- `output_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 프로세서가 생성한 바이트 수.
**예시**

쿼리:

```sql
EXPLAIN PIPELINE
SELECT sleep(1)
┌─explain─────────────────────────┐
│ (Expression)                    │
│ ExpressionTransform             │
│   (SettingQuotaAndLimits)       │
│     (ReadFromStorage)           │
│     SourceFromSingleChunk 0 → 1 │
└─────────────────────────────────┘

SELECT sleep(1)
SETTINGS log_processors_profiles = 1
Query id: feb5ed16-1c24-4227-aa54-78c02b3b27d4
┌─sleep(1)─┐
│        0 │
└──────────┘
1 rows in set. Elapsed: 1.018 sec.

SELECT
    name,
    elapsed_us,
    input_wait_elapsed_us,
    output_wait_elapsed_us
FROM system.processors_profile_log
WHERE query_id = 'feb5ed16-1c24-4227-aa54-78c02b3b27d4'
ORDER BY name ASC
```

결과:

```text
┌─name────────────────────┬─elapsed_us─┬─input_wait_elapsed_us─┬─output_wait_elapsed_us─┐
│ ExpressionTransform     │    1000497 │                  2823 │                    197 │
│ LazyOutputFormat        │         36 │               1002188 │                      0 │
│ LimitsCheckingTransform │         10 │               1002994 │                    106 │
│ NullSource              │          5 │               1002074 │                      0 │
│ NullSource              │          1 │               1002084 │                      0 │
│ SourceFromSingleChunk   │         45 │                  4736 │                1000819 │
└─────────────────────────┴────────────┴───────────────────────┴────────────────────────┘
```

여기에서 다음과 같은 내용을 확인할 수 있습니다:

- `ExpressionTransform`이 `sleep(1)` 함수를 실행 중이므로 `work`는 1e6이 소요되며, 따라서 `elapsed_us` > 1e6입니다.
- `SourceFromSingleChunk`는 기다려야 하며, 이는 `ExpressionTransform`이 `sleep(1)` 실행 중에 어떤 데이터도 수용하지 않기 때문입니다. 그러므로 `PortFull` 상태에서 1e6 us가 소요되며, 따라서 `output_wait_elapsed_us` > 1e6입니다.
- `LimitsCheckingTransform`/`NullSource`/`LazyOutputFormat`는 결과를 처리하기 위해서 `ExpressionTransform`이 `sleep(1)`을 실행할 때까지 기다려야 하므로 `input_wait_elapsed_us` > 1e6입니다.

**참고**

- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)
