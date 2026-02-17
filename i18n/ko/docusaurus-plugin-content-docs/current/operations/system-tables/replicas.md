---
description: '로컬 서버에 존재하는 복제된 테이블(Replicated Table)의 정보와 상태를 포함하는 시스템 테이블입니다. 모니터링에 유용합니다.'
keywords: ['system table', '레플리카']
slug: /operations/system-tables/replicas
title: 'system.replicas'
doc_type: 'reference'
---

# system.replicas \{#systemreplicas\}

로컬 서버에 있는 복제된 테이블(Replicated Table)의 정보와 상태를 포함합니다.
이 테이블은 모니터링 용도로 사용할 수 있습니다. 테이블에는 각 Replicated* 테이블마다 하나의 행이 있습니다.

예시:

```sql
SELECT *
FROM system.replicas
WHERE table = 'test_table'
FORMAT Vertical
```

```text
Query id: dc6dcbcb-dc28-4df9-ae27-4354f5b3b13e

Row 1:
───────
database:                    db
table:                       test_table
engine:                      ReplicatedMergeTree
is_leader:                   1
can_become_leader:           1
is_readonly:                 0
is_session_expired:          0
future_parts:                0
parts_to_check:              0
zookeeper_path:              /test/test_table
replica_name:                r1
replica_path:                /test/test_table/replicas/r1
columns_version:             -1
queue_size:                  27
inserts_in_queue:            27
merges_in_queue:             0
part_mutations_in_queue:     0
queue_oldest_time:           2021-10-12 14:48:48
inserts_oldest_time:         2021-10-12 14:48:48
merges_oldest_time:          1970-01-01 03:00:00
part_mutations_oldest_time:  1970-01-01 03:00:00
oldest_part_to_get:          1_17_17_0
oldest_part_to_merge_to:
oldest_part_to_mutate_to:
log_max_index:               206
log_pointer:                 207
last_queue_update:           2021-10-12 14:50:08
absolute_delay:              99
total_replicas:              5
active_replicas:             5
lost_part_count:             0
last_queue_update_exception:
zookeeper_exception:
replica_is_active:           {'r1':1,'r2':1}
```

컬럼:

* `database` (`String`) - 데이터베이스 이름
* `table` (`String`) - 테이블 이름
* `engine` (`String`) - 테이블 엔진 이름
* `is_leader` (`UInt8`) - 레플리카가 리더인지 여부입니다.
  여러 레플리카가 동시에 리더가 될 수 있습니다. 레플리카가 리더가 되지 않도록 `merge_tree` 설정 `replicated_can_become_leader`로 제한할 수 있습니다. 리더는 백그라운드 머지 작업을 스케줄하는 역할을 담당합니다.
  리더인지 여부와 관계없이, 사용 가능하고 ZK에 세션이 있는 모든 레플리카에 쓰기 작업을 수행할 수 있습니다.
* `can_become_leader` (`UInt8`) - 레플리카가 리더가 될 수 있는지 여부입니다.
* `is_readonly` (`UInt8`) - 레플리카가 읽기 전용 모드인지 여부입니다.
  이 모드는 설정에 ClickHouse Keeper 관련 섹션이 없거나, ClickHouse Keeper에서 세션을 재초기화하는 과정에서 알 수 없는 오류가 발생했거나, 세션을 재초기화하는 동안에 활성화됩니다.
* `is_session_expired` (`UInt8`) - ClickHouse Keeper와의 세션이 만료되었는지 여부입니다. 사실상 `is_readonly`와 동일합니다.
* `future_parts` (`UInt32`) - INSERT 작업 또는 아직 수행되지 않은 머지의 결과로 생성될 데이터 파트 개수입니다.
* `parts_to_check` (`UInt32`) - 검증 대기 큐에 있는 데이터 파트 개수입니다. 파트에 손상이 의심되는 경우 해당 파트가 검증 큐에 추가됩니다.
* `zookeeper_path` (`String`) - ClickHouse Keeper에서 테이블 데이터의 경로입니다.
* `replica_name` (`String`) - ClickHouse Keeper에서 레플리카 이름입니다. 동일한 테이블의 서로 다른 레플리카는 서로 다른 이름을 갖습니다.
* `replica_path` (`String`) - ClickHouse Keeper에서 레플리카 데이터의 경로입니다. 「zookeeper&#95;path/replicas/replica&#95;path」를 이어 붙인 것과 같습니다.
* `columns_version` (`Int32`) - 테이블 구조의 버전 번호입니다. ALTER가 몇 번 실행되었는지를 나타냅니다. 레플리카 간에 버전이 다르면, 일부 레플리카가 아직 모든 ALTER를 수행하지 않았음을 의미합니다.
* `queue_size` (`UInt32`) - 실행 대기 중인 작업 큐의 크기입니다. 작업에는 데이터 블록 삽입, 머지, 기타 일부 작업이 포함됩니다. 일반적으로 `future_parts`와 일치합니다.
* `inserts_in_queue` (`UInt32`) - 수행되어야 하는 데이터 블록 삽입 작업의 개수입니다. 삽입은 일반적으로 상당히 빠르게 복제됩니다. 이 값이 크다면 문제가 있음을 의미합니다.
* `merges_in_queue` (`UInt32`) - 수행 대기 중인 머지 개수입니다. 머지는 시간이 오래 걸릴 수 있으므로 이 값이 오랫동안 0보다 클 수 있습니다.
* `part_mutations_in_queue` (`UInt32`) - 수행 대기 중인 뮤테이션 개수입니다.
* `queue_oldest_time` (`DateTime`) - `queue_size`가 0보다 크면, 큐에 가장 오래된 작업이 추가된 시점을 표시합니다.
* `inserts_oldest_time` (`DateTime`) - `queue_oldest_time`를 참조하십시오.
* `merges_oldest_time` (`DateTime`) - `queue_oldest_time`를 참조하십시오.
* `part_mutations_oldest_time` (`DateTime`) - `queue_oldest_time`를 참조하십시오.

다음 4개 컬럼은 ZK와 활성 세션이 있는 경우에만 0이 아닌 값을 가집니다.

* `log_max_index` (`UInt64`) - 일반 활동 로그에서 최대 엔트리 번호입니다.
* `log_pointer` (`UInt64`) - 레플리카가 실행 큐로 복사한 일반 활동 로그의 최대 엔트리 번호에 1을 더한 값입니다. `log_pointer`가 `log_max_index`보다 훨씬 작다면 문제가 있음을 의미합니다.
* `last_queue_update` (`DateTime`) - 마지막으로 큐가 업데이트된 시점입니다.
* `absolute_delay` (`UInt64`) - 현재 레플리카의 지연 시간(초)입니다.
* `total_replicas` (`UInt8`) - 이 테이블에 대해 알려진 레플리카의 전체 개수입니다.
* `active_replicas` (`UInt8`) - ClickHouse Keeper에 세션이 있는 이 테이블의 레플리카 개수(즉, 정상 동작 중인 레플리카 개수)입니다.
* `lost_part_count` (`UInt64`) - 테이블 생성 이후 지금까지 모든 레플리카에서 손실된 데이터 파트의 총 개수입니다. 값은 ClickHouse Keeper에 영구적으로 저장되며 증가만 합니다.
* `last_queue_update_exception` (`String`) - 큐에 손상된 엔트리가 있을 때의 메시지입니다. 특히 ClickHouse가 버전 간 하위 호환성을 깨뜨려 최신 버전이 기록한 로그 엔트리를 이전 버전에서 파싱할 수 없을 때 중요합니다.
* `zookeeper_exception` (`String`) - ClickHouse Keeper에서 정보를 가져오는 중 오류가 발생했을 때 기록되는 마지막 예외 메시지입니다.
* `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — 레플리카 이름과 해당 레플리카 활성 상태 간의 맵입니다.

모든 컬럼을 조회하면 각 행마다 ClickHouse Keeper에서 여러 번의 읽기가 필요하므로 테이블이 다소 느리게 동작할 수 있습니다.
마지막 4개의 컬럼(log&#95;max&#95;index, log&#95;pointer, total&#95;replicas, active&#95;replicas)을 조회하지 않으면 테이블은 빠르게 동작합니다.

예를 들어, 다음과 같이 모든 것이 정상적으로 동작하는지 확인할 수 있습니다:

```sql
SELECT
    database,
    table,
    is_leader,
    is_readonly,
    is_session_expired,
    future_parts,
    parts_to_check,
    columns_version,
    queue_size,
    inserts_in_queue,
    merges_in_queue,
    log_max_index,
    log_pointer,
    total_replicas,
    active_replicas
FROM system.replicas
WHERE
       is_readonly
    OR is_session_expired
    OR future_parts > 20
    OR parts_to_check > 10
    OR queue_size > 20
    OR inserts_in_queue > 10
    OR log_max_index - log_pointer > 10
    OR total_replicas < 2
    OR active_replicas < total_replicas
```

이 쿼리가 아무것도 반환하지 않으면 모든 것이 정상이라는 뜻입니다.
