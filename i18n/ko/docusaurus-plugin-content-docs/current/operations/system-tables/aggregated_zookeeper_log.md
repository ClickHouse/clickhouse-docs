---
description: '세션, 경로, 작업 유형, 컴포넌트, 하위 요청 플래그를 기준으로 그룹화한 ZooKeeper 작업의 집계 통계를 포함하는 시스템 테이블입니다.'
keywords: ['시스템 테이블', 'aggregated_zookeeper_log']
slug: /operations/system-tables/aggregated_zookeeper_log
title: 'system.aggregated_zookeeper_log'
doc_type: 'reference'
---

# system.aggregated_zookeeper_log \{#systemaggregated_zookeeper_log\}

이 테이블에는 `(session_id, parent_path, operation, component, is_subrequest)`별로 그룹화된 ZooKeeper 작업의 집계 통계(예: 작업 수, 평균 지연 시간, 오류)가 저장되며, 주기적으로 디스크에 플러시됩니다.

각 개별 요청과 응답을 기록하는 [system.zookeeper&#95;log](zookeeper_log.md)와 달리, 이 테이블은 작업을 그룹 단위로 집계하므로 훨씬 더 가볍고, 따라서 프로덕션 워크로드에 더 적합합니다.

`Multi` 또는 `MultiRead` 배치에 포함된 작업은 `is_subrequest` 컬럼을 통해 별도로 추적됩니다. 하위 요청의 지연 시간은 이를 포함하는 `Multi`/`MultiRead` 작업에 전체 지연 시간이 귀속되므로 0입니다.

컬럼:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 서버의 호스트 이름입니다.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 그룹이 플러시된 날짜입니다.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 그룹이 플러시된 시각입니다.
* `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 세션 id입니다.
* `parent_path` ([String](../../sql-reference/data-types/string.md)) — 경로 접두사입니다.
* `operation` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeper 작업 유형입니다.
* `is_subrequest` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 이 작업이 `Multi` 또는 `MultiRead` 작업 내부의 하위 요청이었는지 여부입니다.
* `count` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 그룹에 포함된 작업 수입니다.
* `errors` ([Map(Enum, UInt32)](../../sql-reference/data-types/map.md)) — 그룹의 오류이며, 오류 코드를 개수에 매핑한 맵입니다.
* `average_latency` ([Float64](../../sql-reference/data-types/float.md)) — 그룹 내 모든 작업의 평균 지연 시간이며, 마이크로초 단위입니다. 하위 요청의 지연 시간은 이를 포함하는 `Multi` 또는 `MultiRead` 작업에 귀속되므로 0입니다.
* `component` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 이벤트를 발생시킨 구성 요소입니다.

**함께 보기**

* [system.zookeeper&#95;log](zookeeper_log.md) — 요청별 상세 ZooKeeper 로그입니다.
* [ZooKeeper](../../operations/tips.md#zookeeper)