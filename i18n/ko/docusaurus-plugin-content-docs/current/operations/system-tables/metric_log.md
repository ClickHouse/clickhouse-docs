---
'description': '시스템 테이블로 `system.metrics` 및 `system.events` 테이블의 메트릭 값 이력을 포함하며, 주기적으로
  디스크에 플러시됩니다.'
'keywords':
- 'system table'
- 'metric_log'
'slug': '/operations/system-tables/metric_log'
'title': 'system.metric_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.metric_log

<SystemTableCloud/>

`system.metrics` 및 `system.events` 테이블의 메트릭 값 기록을 포함하며, 주기적으로 디스크에 플러시됩니다.

컬럼:
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름입니다.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트 날짜입니다.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트 시간입니다.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 해상도의 이벤트 시간입니다.

**예시**

```sql
SELECT * FROM system.metric_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                                                        clickhouse.eu-central1.internal
event_date:                                                      2020-09-05
event_time:                                                      2020-09-05 16:22:33
event_time_microseconds:                                         2020-09-05 16:22:33.196807
milliseconds:                                                    196
ProfileEvent_Query:                                              0
ProfileEvent_SelectQuery:                                        0
ProfileEvent_InsertQuery:                                        0
ProfileEvent_FailedQuery:                                        0
ProfileEvent_FailedSelectQuery:                                  0
...
...
CurrentMetric_Revision:                                          54439
CurrentMetric_VersionInteger:                                    20009001
CurrentMetric_RWLockWaitingReaders:                              0
CurrentMetric_RWLockWaitingWriters:                              0
CurrentMetric_RWLockActiveReaders:                               0
CurrentMetric_RWLockActiveWriters:                               0
CurrentMetric_GlobalThread:                                      74
CurrentMetric_GlobalThreadActive:                                26
CurrentMetric_LocalThread:                                       0
CurrentMetric_LocalThreadActive:                                 0
CurrentMetric_DistributedFilesToInsert:                          0
```

**스키마**
이 테이블은 XML 태그 `<schema_type>`을 사용하여 다양한 스키마 유형으로 구성할 수 있습니다. 기본 스키마 유형은 `wide`로, 이곳에서는 각 메트릭 또는 프로파일 이벤트가 별도의 컬럼으로 저장됩니다. 이 스키마는 단일 컬럼 읽기에 가장 성능이 좋고 효율적입니다.

`transposed` 스키마는 `system.asynchronous_metric_log`와 유사한 형식으로 데이터를 저장하며, 메트릭과 이벤트가 행으로 저장됩니다. 이 스키마는 병합 중 리소스 소모를 줄이므로 저자원 환경에 유용합니다.

또한 호환성 스키마인 `transposed_with_wide_view`가 있으며, 실제 데이터를 전치 스키마(`system.transposed_metric_log`)를 가진 테이블에 저장하고 그 위에 넓은 스키마를 사용하여 뷰를 생성합니다. 이 뷰는 전치 테이블을 쿼리하므로 `wide` 스키마에서 `transposed` 스키마로 마이그레이션할 때 유용합니다.

**참고하세요**

- [metric_log 설정](../../operations/server-configuration-parameters/settings.md#metric_log) — 설정의 활성화 및 비활성화.
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — 주기적으로 계산된 메트릭을 포함합니다.
- [system.events](/operations/system-tables/events) — 발생한 여러 이벤트를 포함합니다.
- [system.metrics](../../operations/system-tables/metrics.md) — 즉시 계산된 메트릭을 포함합니다.
- [모니터링](../../operations/monitoring.md) — ClickHouse 모니터링의 기본 개념입니다.
