---
'description': '이 테이블은 즉시 계산할 수 있는 차원 메트릭을 포함하며 Prometheus 형식으로 내보낼 수 있습니다. 항상 최신
  상태입니다.'
'keywords':
- 'system table'
- 'dimensional_metrics'
'slug': '/operations/system-tables/dimensional_metrics'
'title': 'system.dimensional_metrics'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# dimensional_metrics {#dimensional_metrics}

<SystemTableCloud/>

이 테이블은 즉시 계산할 수 있고 Prometheus 형식으로 내보낼 수 있는 차원 메트릭을 포함합니다. 항상 최신 상태입니다.

컬럼:

- `metric` ([String](../../sql-reference/data-types/string.md)) — 메트릭 이름.
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — 메트릭 값.
- `description` ([String](../../sql-reference/data-types/string.md)) — 메트릭 설명.
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — 메트릭 레이블.
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric`에 대한 별칭.

**예제**

다음 쿼리를 사용하여 Prometheus 형식으로 모든 차원 메트릭을 내보낼 수 있습니다.
```sql
SELECT
  metric AS name,
  toFloat64(value) AS value,
  description AS help,
  labels,
  'gauge' AS type
FROM system.dimensional_metrics
FORMAT Prometheus
```

## Metric descriptions {#metric_descriptions}

### merge_failures {#merge_failures}
시작 이후 모든 실패한 병합의 수.

### startup_scripts_failure_reason {#startup_scripts_failure_reason}
오류 유형에 따라 시작 스크립트 실패를 나타냅니다. 시작 스크립트가 실패할 때 1로 설정되며, 오류 이름으로 레이블이 지정됩니다.

### merge_tree_parts {#merge_tree_parts}
병합 트리 데이터 파트의 수, 파트 상태, 파트 유형, 프로젝션 파트 여부에 따라 레이블이 지정됩니다.

**참고**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 주기적으로 계산된 메트릭을 포함합니다.
- [system.events](/operations/system-tables/events) — 발생한 사건의 수를 포함합니다.
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics`와 `system.events` 테이블의 메트릭 값 이력을 포함합니다.
- [Monitoring](../../operations/monitoring.md) — ClickHouse 모니터링의 기본 개념.
