---
'description': '시스템 테이블로, 각 쿼리에 대한 `system.events` 테이블의 메모리 및 메트릭 값 기록을 포함하며, 주기적으로
  디스크에 플러시됩니다.'
'keywords':
- 'system table'
- 'query_metric_log'
'slug': '/operations/system-tables/query_metric_log'
'title': 'system.query_metric_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_metric_log

<SystemTableCloud/>

개별 쿼리에 대한 `system.events` 테이블의 메모리 및 메트릭 값의 이력을 포함하며, 주기적으로 디스크에 플러시됩니다.

쿼리가 시작되면, `query_metric_log_interval` 밀리초(기본값은 1000) 간격으로 데이터가 수집됩니다. 쿼리가 `query_metric_log_interval` 보다 오래 걸리는 경우 쿼리가 완료될 때도 데이터가 수집됩니다.

컬럼:
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 쿼리의 ID.
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트 시간.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 해상도의 이벤트 시간.

**예시**

```sql
SELECT * FROM system.query_metric_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
query_id:                                                        97c8ba04-b6d4-4bd7-b13e-6201c5c6e49d
hostname:                                                        clickhouse.eu-central1.internal
event_date:                                                      2020-09-05
event_time:                                                      2020-09-05 16:22:33
event_time_microseconds:                                         2020-09-05 16:22:33.196807
memory_usage:                                                    313434219
peak_memory_usage:                                               598951986
ProfileEvent_Query:                                              0
ProfileEvent_SelectQuery:                                        0
ProfileEvent_InsertQuery:                                        0
ProfileEvent_FailedQuery:                                        0
ProfileEvent_FailedSelectQuery:                                  0
...
```

**참조**

- [query_metric_log 설정](../../operations/server-configuration-parameters/settings.md#query_metric_log) — 설정의 활성화 및 비활성화.
- [query_metric_log_interval](../../operations/settings/settings.md#query_metric_log_interval)
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — 주기적으로 계산된 메트릭을 포함합니다.
- [system.events](/operations/system-tables/events) — 발생한 여러 이벤트를 포함합니다.
- [system.metrics](../../operations/system-tables/metrics.md) — 즉시 계산된 메트릭을 포함합니다.
- [Monitoring](../../operations/monitoring.md) — ClickHouse 모니터링의 기본 개념.
