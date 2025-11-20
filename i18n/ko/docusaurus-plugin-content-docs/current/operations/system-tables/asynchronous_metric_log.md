---
'description': '시스템 테이블로, `system.asynchronous_metrics`에 대한 이력 값을 포함하며, 값은 시간 간격(기본적으로
  1초마다)마다 한 번 저장됩니다.'
'keywords':
- 'system table'
- 'asynchronous_metric_log'
'slug': '/operations/system-tables/asynchronous_metric_log'
'title': 'system.asynchronous_metric_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

`system.asynchronous_metrics`의 역사적 값을 포함하며, 이는 시간 간격(기본적으로 1초)마다 한 번씩 저장됩니다. 기본적으로 활성화되어 있습니다.

컬럼:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트명.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트 시간.
- `metric` ([String](../../sql-reference/data-types/string.md)) — 메트릭 이름.
- `value` ([Float64](../../sql-reference/data-types/float.md)) — 메트릭 값.

**예시**

```sql
SELECT * FROM system.asynchronous_metric_log LIMIT 3 \G
```

```text
Row 1:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:07
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0.001

Row 2:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:08
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0

Row 3:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:09
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0
```

**참고**

- [asynchronous_metric_log 설정](../../operations/server-configuration-parameters/settings.md#asynchronous_metric_log) — 설정 활성화 및 비활성화.
- [system.asynchronous_metrics](../system-tables/asynchronous_metrics.md) — 백그라운드에서 주기적으로 계산된 메트릭이 포함됩니다.
- [system.metric_log](../system-tables/metric_log.md) — 주기적으로 디스크에 플러시되는 `system.metrics` 및 `system.events` 테이블의 메트릭 값 역사.
