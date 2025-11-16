---
'description': '샘플링 쿼리 프로파일러에 의해 수집된 스택 트레이스를 포함하는 시스템 테이블.'
'keywords':
- 'system table'
- 'trace_log'
'slug': '/operations/system-tables/trace_log'
'title': 'system.trace_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.trace_log

<SystemTableCloud/>

[샘플링 쿼리 프로파일러](../../operations/optimizing-performance/sampling-query-profiler.md)에 의해 수집된 스택 추적을 포함합니다.

ClickHouse는 [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log) 서버 설정 섹션이 설정되면 이 테이블을 생성합니다. 또한 다음과 같은 설정을 참조하십시오: [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns), [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns), [memory_profiler_step](../../operations/settings/settings.md#memory_profiler_step),
[memory_profiler_sample_probability](../../operations/settings/settings.md#memory_profiler_sample_probability), [trace_profile_events](../../operations/settings/settings.md#trace_profile_events).

로그 분석을 위해 `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` 및 `demangle` 내부 함수들을 사용하십시오.

컬럼:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 샘플링 순간의 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 샘플링 순간의 타임스탬프.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도의 샘플링 순간의 타임스탬프.
- `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 나노초 단위의 샘플링 순간의 타임스탬프.
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 서버 빌드 수정 사항.

    `clickhouse-client`를 통해 서버에 연결할 때, `Connected to ClickHouse server version 19.18.1.`와 유사한 문자열을 볼 수 있습니다. 이 필드는 서버의 `revision`을 포함하지만 `version`은 포함하지 않습니다.

- `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 추적 유형:
  - `Real`은 월 시계 시간을 기준으로 스택 추적을 수집함을 나타냅니다.
  - `CPU`는 CPU 시간을 기준으로 스택 추적을 수집함을 나타냅니다.
  - `Memory`는 메모리 할당이 이후 수위 초과 시 할당 및 해제를 수집함을 나타냅니다.
  - `MemorySample`은 무작위할당 및 해제를 수집함을 나타냅니다.
  - `MemoryPeak`는 피크 메모리 사용량의 업데이트를 수집함을 나타냅니다.
  - `ProfileEvent`는 프로파일 이벤트의 증가를 수집함을 나타냅니다.
  - `JemallocSample`은 jemalloc 샘플을 수집함을 나타냅니다.
  - `MemoryAllocatedWithoutCheck`는 메모리 제한을 무시하고 이루어진 중요한 할당(>16MiB)을 수집함을 나타냅니다(ClickHouse 개발자 전용).
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 스레드 식별자.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — [query_log](/operations/system-tables/query_log) 시스템 테이블에서 실행 중인 쿼리에 대한 세부 정보를 얻기 위해 사용할 수 있는 쿼리 식별자.
- `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 샘플링 순간의 스택 추적. 각 요소는 ClickHouse 서버 프로세스 내의 가상 메모리 주소입니다.
- `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - 추적 유형이 `Memory`, `MemorySample` 또는 `MemoryPeak`인 경우 할당된 메모리의 양이고, 다른 추적 유형에는 0입니다.
- `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - 추적 유형이 `ProfileEvent`인 경우 업데이트된 프로파일 이벤트의 이름이고, 다른 추적 유형에는 빈 문자열입니다.
- `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - 추적 유형이 `ProfileEvent`인 경우 프로파일 이벤트의 증가량이고, 다른 추적 유형에는 0입니다.
- `symbols`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), 심볼화가 활성화된 경우 `trace`에 해당하는 비가공 기호 이름을 포함합니다.
- `lines`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), 심볼화가 활성화된 경우 `trace`에 해당하는 파일 이름과 행 번호를 포함하는 문자열을 포함합니다.

심볼화는 서버 구성 파일의 `trace_log` 아래 `symbolize`에서 활성화하거나 비활성화할 수 있습니다.

**예제**

```sql
SELECT * FROM system.trace_log LIMIT 1 \G
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2020-09-10
event_time:              2020-09-10 11:23:09
event_time_microseconds: 2020-09-10 11:23:09.872924
timestamp_ns:            1599762189872924510
revision:                54440
trace_type:              Memory
thread_id:               564963
query_id:
trace:                   [371912858,371912789,371798468,371799717,371801313,371790250,624462773,566365041,566440261,566445834,566460071,566459914,566459842,566459580,566459469,566459389,566459341,566455774,371993941,371988245,372158848,372187428,372187309,372187093,372185478,140222123165193,140222122205443]
size:                    5244400
```
