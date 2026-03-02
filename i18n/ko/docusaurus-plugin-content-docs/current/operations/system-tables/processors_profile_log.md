---
description: '프로세서 수준의 프로파일링 정보를 포함하는 시스템 테이블 (`EXPLAIN PIPELINE`에서 확인 가능)'
keywords: ['시스템 테이블', 'processors_profile_log', 'EXPLAIN PIPELINE']
slug: /operations/system-tables/processors_profile_log
title: 'system.processors_profile_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.processors_profile_log \{#systemprocessors_profile_log\}

<SystemTableCloud />

이 테이블에는 프로세서 단위의 프로파일링 데이터가 포함됩니다( [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)에서 확인할 수 있음).

컬럼:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트가 발생한 날짜.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트가 발생한 날짜와 시간.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 이벤트가 발생한 날짜와 시간을 마이크로초 정밀도로 나타낸 값.
* `id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 프로세서의 ID.
* `parent_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 부모 프로세서들의 ID.
* `plan_step` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 이 프로세서를 생성한 쿼리 플랜 단계의 ID. 프로세서가 어떤 단계에서도 추가되지 않았다면 값은 0입니다.
* `plan_group` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 쿼리 플랜 단계에 의해 생성된 경우 프로세서의 그룹. 그룹은 동일한 쿼리 플랜 단계에서 추가된 프로세서들을 논리적으로 구분한 것입니다. 그룹은 EXPLAIN PIPELINE 결과를 보기 좋게 표시하는 데만 사용됩니다.
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 초기 쿼리의 ID(분산 쿼리 실행의 경우).
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 쿼리의 ID.
* `name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 프로세서의 이름.
* `elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 이 프로세서가 실행된 시간(마이크로초 단위).
* `input_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 이 프로세서가 데이터(다른 프로세서로부터)를 기다리며 대기한 시간(마이크로초 단위).
* `output_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 출력 포트가 가득 차 있어 이 프로세서가 대기한 시간(마이크로초 단위).
* `input_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 프로세서가 소비한 행의 개수.
* `input_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 프로세서가 소비한 바이트 수.
* `output_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 프로세서가 생성한 행의 개수.
* `output_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 프로세서가 생성한 바이트 수.

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

여기에서 다음을 확인할 수 있습니다.

* `ExpressionTransform`는 `sleep(1)` 함수를 실행하고 있으므로 `work`에 1e6이 소요되고, 따라서 `elapsed_us` &gt; 1e6이 됩니다.
* `SourceFromSingleChunk`는 대기해야 합니다. `ExpressionTransform`이 `sleep(1)`을 실행하는 동안에는 어떤 데이터도 받지 않으므로 1e6 us 동안 `PortFull` 상태가 되며, 따라서 `output_wait_elapsed_us` &gt; 1e6이 됩니다.
* `LimitsCheckingTransform`/`NullSource`/`LazyOutputFormat`는 결과를 처리하기 위해 `ExpressionTransform`이 `sleep(1)` 실행을 완료할 때까지 대기해야 하므로 `input_wait_elapsed_us` &gt; 1e6이 됩니다.

**참고**

* [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)
