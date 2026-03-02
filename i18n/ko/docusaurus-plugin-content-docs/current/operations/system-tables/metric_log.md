---
description: '`system.metrics` 및 `system.events` 테이블의 메트릭 값 이력을 저장하며, 해당 값이 주기적으로 디스크에 플러시되는 시스템 테이블입니다.'
keywords: ['시스템 테이블', 'metric_log']
slug: /operations/system-tables/metric_log
title: 'system.metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.metric_log \{#systemmetric_log\}

<SystemTableCloud />

`system.metrics` 및 `system.events` 테이블의 메트릭 값 이력을 저장하며, 주기적으로 디스크로 플러시됩니다.

컬럼:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트 날짜.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트 시간.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 단위 해상도의 이벤트 시간.

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
이 테이블은 XML 태그 `<schema_type>`을 사용하여 다양한 스키마 유형으로 구성할 수 있습니다. 기본 스키마 유형은 `wide`이며, 각 메트릭 또는 프로파일 이벤트가 개별 컬럼으로 저장됩니다. 이 스키마는 단일 컬럼 읽기에 가장 높은 성능과 효율성을 제공합니다.

`transposed` 스키마는 메트릭과 이벤트가 행으로 저장되는 `system.asynchronous_metric_log`와 유사한 형식으로 데이터를 저장합니다. 이 스키마는 머지 작업 동안 리소스 사용량을 줄이므로, 리소스가 제한된 환경에서 유용합니다.

**함께 보기**

* [metric&#95;log setting](../../operations/server-configuration-parameters/settings.md#metric_log) — 해당 설정을 활성화 및 비활성화하는 방법입니다.
* [system.asynchronous&#95;metrics](../../operations/system-tables/asynchronous_metrics.md) — 주기적으로 계산된 메트릭을 포함합니다.
* [system.events](/operations/system-tables/events) — 발생한 여러 이벤트를 포함합니다.
* [system.metrics](../../operations/system-tables/metrics.md) — 즉시 계산된 메트릭을 포함합니다.
* [Monitoring](../../operations/monitoring.md) — ClickHouse 모니터링의 기본 개념입니다.
