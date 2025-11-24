---
'description': '시스템 테이블은 ClickHouse Keeper 또는 ZooKeeper에 저장된 복제 큐의 작업에 대한 정보를 포함하고
  있으며, `ReplicatedMergeTree` 계열의 테이블에 해당합니다.'
'keywords':
- 'system table'
- 'replication_queue'
'slug': '/operations/system-tables/replication_queue'
'title': 'system.replication_queue'
'doc_type': 'reference'
---


# system.replication_queue

`ReplicatedMergeTree` 패밀리의 테이블을 위해 ClickHouse Keeper 또는 ZooKeeper에 저장된 복제 큐의 작업에 대한 정보를 포함합니다.

컬럼:

- `database` ([String](../../sql-reference/data-types/string.md)) — 데이터베이스의 이름입니다.

- `table` ([String](../../sql-reference/data-types/string.md)) — 테이블의 이름입니다.

- `replica_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper의 복제본 이름입니다. 동일 테이블의 서로 다른 복제본은 서로 다른 이름을 가집니다.

- `position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 큐에서 작업의 위치입니다.

- `node_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper의 노드 이름입니다.

- `type` ([String](../../sql-reference/data-types/string.md)) — 큐의 작업 유형 중 하나입니다:

  - `GET_PART` — 다른 복제본에서 파트를 가져옵니다.
  - `ATTACH_PART` — 파트를 첨부합니다. 이는 `detached` 폴더에서 찾은 경우 우리 복제본의 파트일 수 있습니다. 이는 `GET_PART`에 몇 가지 최적화를 한 것으로 생각할 수 있습니다.
  - `MERGE_PARTS` — 파트를 병합합니다.
  - `DROP_RANGE` — 지정된 숫자 범위 내의 지정된 파티션에서 파트를 삭제합니다.
  - `CLEAR_COLUMN` — 주의: 사용 중단. 지정된 파티션에서 특정 컬럼을 삭제합니다.
  - `CLEAR_INDEX` — 주의: 사용 중단. 지정된 파티션에서 특정 인덱스를 삭제합니다.
  - `REPLACE_RANGE` — 특정 범위의 파트를 삭제하고 새로운 것으로 교체합니다.
  - `MUTATE_PART` — 파트에 하나 이상의 변형을 적용합니다.
  - `ALTER_METADATA` — 전역 /metadata 및 /columns 경로에 따라 수정 사항을 적용합니다.

- `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 작업이 실행을 위해 제출된 날짜와 시간입니다.

- `required_quorum` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 작업 완료를 확인받기 위해 기다리고 있는 복제본의 수입니다. 이 컬럼은 `GET_PARTS` 작업에만 해당합니다.

- `source_replica` ([String](../../sql-reference/data-types/string.md)) — 소스 복제본의 이름입니다.

- `new_part_name` ([String](../../sql-reference/data-types/string.md)) — 새로운 파트의 이름입니다.

- `parts_to_merge` ([Array](../../sql-reference/data-types/array.md) ([String](../../sql-reference/data-types/string.md))) — 병합하거나 업데이트할 파트의 이름입니다.

- `is_detach` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 큐에 `DETACH_PARTS` 작업이 있는지 여부를 나타내는 플래그입니다.

- `is_currently_executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 특정 작업이 현재 수행 중인지 여부를 나타내는 플래그입니다.

- `num_tries` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 작업을 완료하기 위한 실패한 시도의 수입니다.

- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 발생한 마지막 오류에 대한 텍스트 메시지입니다(있는 경우).

- `last_attempt_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 작업이 마지막으로 시도된 날짜와 시간입니다.

- `num_postponed` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 작업이 연기된 횟수입니다.

- `postpone_reason` ([String](../../sql-reference/data-types/string.md)) — 작업이 연기된 이유입니다.

- `last_postpone_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 작업이 마지막으로 연기된 날짜와 시간입니다.

- `merge_type` ([String](../../sql-reference/data-types/string.md)) — 현재 병합의 유형입니다. 변형인 경우 비어 있습니다.

**예시**

```sql
SELECT * FROM system.replication_queue LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
database:               merge
table:                  visits_v2
replica_name:           mtgiga001-1t
position:               15
node_name:              queue-0009325559
type:                   MERGE_PARTS
create_time:            2020-12-07 14:04:21
required_quorum:        0
source_replica:         mtgiga001-1t
new_part_name:          20201130_121373_121384_2
parts_to_merge:         ['20201130_121373_121378_1','20201130_121379_121379_0','20201130_121380_121380_0','20201130_121381_121381_0','20201130_121382_121382_0','20201130_121383_121383_0','20201130_121384_121384_0']
is_detach:              0
is_currently_executing: 0
num_tries:              36
last_exception:         Code: 226, e.displayText() = DB::Exception: Marks file '/opt/clickhouse/data/merge/visits_v2/tmp_fetch_20201130_121373_121384_2/CounterID.mrk' does not exist (version 20.8.7.15 (official build))
last_attempt_time:      2020-12-08 17:35:54
num_postponed:          0
postpone_reason:
last_postpone_time:     1970-01-01 03:00:00
```

**참고**

- [ReplicatedMergeTree 테이블 관리](/sql-reference/statements/system#managing-replicatedmergetree-tables)
