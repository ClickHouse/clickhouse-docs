---
description: '히스토그램 메트릭의 주기적 스냅샷이 디스크에 플러시되어 저장되는 시스템 테이블입니다.'
keywords: ['시스템 테이블', 'histogram_metric_log']
sidebar_label: 'histogram_metric_log'
sidebar_position: 65
slug: /operations/system-tables/histogram_metric_log
title: 'system.histogram_metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud />

## 설명 \{#description\}

`system.histogram_metrics`의 이력입니다. `collect_interval_milliseconds`마다 스냅샷이 생성되어 디스크에 플러시됩니다.

## 컬럼 \{#columns\}

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 서버의 호스트명입니다.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트 날짜입니다.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 이벤트 시간입니다.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 단위 해상도의 이벤트 시간입니다.
* `metric` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 메트릭 이름입니다.
* `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — 메트릭 레이블입니다.
* `histogram` ([Map(Float64, UInt64)](../../sql-reference/data-types/map.md)) — 버킷 상한값에 대한 누적 개수입니다. `+inf`는 마지막 버킷입니다.
* `count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 전체 관측 수입니다. `histogram[+inf]`와 같습니다.
* `sum` ([Float64](../../sql-reference/data-types/float.md)) — 관측된 값의 합계입니다.

## 예시 \{#example\}

```sql
SELECT event_time, metric, labels, histogram
FROM system.histogram_metric_log
WHERE metric = 'keeper_response_time_ms'
ORDER BY event_time DESC
LIMIT 1
FORMAT Vertical;
```

## 관련 항목 \{#see-also\}

* [system.histogram&#95;metrics](/operations/system-tables/histogram_metrics) — 실시간 히스토그램 메트릭.
* [system.metric&#95;log](/operations/system-tables/metric_log) — `system.metrics` 및 `system.events`의 이력.