---
'description': '로컬 서버에 존재하는 복제된 테이블에 대한 정보와 상태를 포함하는 시스템 테이블입니다. 모니터링에 유용합니다.'
'keywords':
- 'system table'
- 'replicas'
'slug': '/operations/system-tables/replicas'
'title': 'system.replicas'
'doc_type': 'reference'
---


# system.replicas

로컬 서버에 존재하는 복제 테이블에 대한 정보와 상태를 포함합니다. 이 테이블은 모니터링에 사용될 수 있습니다. 테이블은 모든 Replicated\* 테이블에 대해 행을 포함합니다.

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

- `database` (`String`) - 데이터베이스 이름
- `table` (`String`) - 테이블 이름
- `engine` (`String`) - 테이블 엔진 이름
- `is_leader` (`UInt8`) - 복제본이 리더인지 여부입니다.
    여러 복제본이 동시에 리더가 될 수 있습니다. 복제본이 리더가 되는 것을 방지하려면 `merge_tree` 설정인 `replicated_can_become_leader`를 사용할 수 있습니다. 리더는 백그라운드 병합 스케줄을 책임집니다.
    리더 여부와 관계없이 ZK에 세션이 있는 모든 복제본에 대해 쓰기가 수행될 수 있다는 점에 유의하세요.
- `can_become_leader` (`UInt8`) - 복제본이 리더가 될 수 있는지 여부입니다.
- `is_readonly` (`UInt8`) - 복제본이 읽기 전용 모드인지 여부입니다.
    이 모드는 구성이 ClickHouse Keeper와 섹션이 없거나, ClickHouse Keeper에서 세션을 재초기화할 때 알 수 없는 오류가 발생하고, ClickHouse Keeper에서 세션 재초기화 중일 때 활성화됩니다.
- `is_session_expired` (`UInt8`) - ClickHouse Keeper와의 세션이 만료되었습니다. 기본적으로 `is_readonly`와 동일합니다.
- `future_parts` (`UInt32`) - 아직 완료되지 않은 INSERT 또는 병합의 결과로 나타날 데이터 파트의 수입니다.
- `parts_to_check` (`UInt32`) - 검증 대기 중인 데이터 파트의 수입니다. 손상될 가능성이 있는 경우, 파트는 검증 대기 열에 추가됩니다.
- `zookeeper_path` (`String`) - ClickHouse Keeper에서 테이블 데이터 경로입니다.
- `replica_name` (`String`) - ClickHouse Keeper에서 복제본 이름입니다. 동일한 테이블의 다른 복제본은 서로 다른 이름을 가집니다.
- `replica_path` (`String`) - ClickHouse Keeper에서 복제본 데이터 경로입니다. 'zookeeper_path/replicas/replica_path'를 연결한 것과 같습니다.
- `columns_version` (`Int32`) - 테이블 구조의 버전 번호입니다. 몇 번의 ALTER가 수행되었는지 나타냅니다. 복제본이 서로 다른 버전을 가질 경우, 일부 복제본이 모든 ALTER를 아직 수행하지 않았음을 의미합니다.
- `queue_size` (`UInt32`) - 수행 대기 중인 작업을 위한 대기열의 크기입니다. 작업에는 데이터 블록 삽입, 병합 및 특정 기타 작업이 포함됩니다. 일반적으로 `future_parts`와 일치합니다.
- `inserts_in_queue` (`UInt32`) - 수행해야 할 데이터 블록의 삽입 수입니다. 삽입은 일반적으로 비교적 빠르게 복제됩니다. 이 수가 크면 뭔가 잘못된 것입니다.
- `merges_in_queue` (`UInt32`) - 수행 대기 중인 병합의 수입니다. 가끔 병합이 길어질 수 있으므로, 이 값은 오랜 시간 동안 0보다 클 수 있습니다.
- `part_mutations_in_queue` (`UInt32`) - 수행 대기 중인 변형의 수입니다.
- `queue_oldest_time` (`DateTime`) - `queue_size`가 0보다 클 경우, 가장 오래된 작업이 대기열에 추가된 시간을 표시합니다.
- `inserts_oldest_time` (`DateTime`) - `queue_oldest_time` 참조
- `merges_oldest_time` (`DateTime`) - `queue_oldest_time` 참조
- `part_mutations_oldest_time` (`DateTime`) - `queue_oldest_time` 참조

다음 4개 컬럼은 ZK와 활성 세션이 있을 때만 0이 아닌 값을 가집니다.

- `log_max_index` (`UInt64`) - 일반 활동 로그에서 최대 항목 번호입니다.
- `log_pointer` (`UInt64`) - 복제본이 실행 대기열로 복사한 일반 활동 로그의 최대 항목 번호 플러스 1입니다. 만약 `log_pointer`가 `log_max_index`보다 훨씬 작으면 문제가 발생한 것입니다.
- `last_queue_update` (`DateTime`) - 큐가 마지막으로 업데이트된 시간입니다.
- `absolute_delay` (`UInt64`) - 현재 복제본의 지연 시간을 초 단위로 나타냅니다.
- `total_replicas` (`UInt8`) - 이 테이블의 알려진 복제본의 총 수입니다.
- `active_replicas` (`UInt8`) - ClickHouse Keeper에 세션이 있는 이 테이블의 복제본 수 (즉, 정상 작동 중인 복제본의 수)입니다.
- `lost_part_count` (`UInt64`) - 테이블 생성 이후 모든 복제본에서 잃어버린 데이터 파트의 수입니다. 이 값은 ClickHouse Keeper에 지속되며 증가할 수 있습니다.
- `last_queue_update_exception` (`String`) - 큐에 손상된 항목이 포함되어 있는 경우입니다. 특히 ClickHouse가 버전 간의 이전 호환성을 깨뜨릴 때 중요하며, 새 버전에서 작성된 로그 항목이 이전 버전에서 구문 분석할 수 없는 경우 발생합니다.
- `zookeeper_exception` (`String`) - ClickHouse Keeper에서 정보를 가져오는 도중 오류가 발생했을 때 마지막 예외 메시지입니다.
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — 복제본 이름과 복제본이 활성 상태인지 여부 간의 맵입니다.

모든 컬럼을 요청할 경우, 각 행에 대해 ClickHouse Keeper에서 여러 번 읽기가 수행되기 때문에 테이블이 다소 느리게 작동할 수 있습니다.
마지막 4개 컬럼(log_max_index, log_pointer, total_replicas, active_replicas)을 요청하지 않으면 테이블이 빠르게 작동합니다.

예를 들어, 다음과 같이 모든 것이 올바르게 작동하는지 확인할 수 있습니다:

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

이 쿼리가 아무것도 반환하지 않으면, 모든 것이 정상임을 의미합니다.
