---
description: '`ReplicatedMergeTree` 계열 테이블에 대해 ClickHouse Keeper 또는 ZooKeeper에 저장된 복제 큐(replication queue)의 작업 정보를 담고 있는 시스템 테이블입니다.'
keywords: ['시스템 테이블', 'replication_queue']
slug: /operations/system-tables/replication_queue
title: 'system.replication_queue'
doc_type: 'reference'
---

# system.replication_queue \{#systemreplication_queue\}

`ReplicatedMergeTree` 패밀리에 속한 테이블에 대해 ClickHouse Keeper 또는 ZooKeeper에 저장된 replication 큐의 태스크에 대한 정보를 포함합니다.

Columns:

* `database` ([String](../../sql-reference/data-types/string.md)) — 데이터베이스 이름.

* `table` ([String](../../sql-reference/data-types/string.md)) — 테이블 이름.

* `replica_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper 내 레플리카 이름. 동일한 테이블의 서로 다른 레플리카는 서로 다른 이름을 가집니다.

* `position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 큐에서 태스크의 위치.

* `node_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper 내 노드 이름.

* `type` ([String](../../sql-reference/data-types/string.md)) — 큐 내 태스크의 타입으로, 다음 중 하나입니다:

  * `GET_PART` — 다른 레플리카에서 파트를 가져옵니다.
  * `ATTACH_PART` — 파트를 붙입니다(자신의 레플리카의 `detached` 폴더에서 발견된 경우일 수 있습니다). 거의 동일하기 때문에 일부 최적화가 적용된 `GET_PART`로 볼 수 있습니다.
  * `MERGE_PARTS` — 파트들을 병합합니다.
  * `DROP_RANGE` — 지정된 파티션에서 지정된 번호 범위의 파트들을 삭제합니다.
  * `CLEAR_COLUMN` — 참고: 사용 중단됨. 지정된 파티션에서 특정 컬럼을 삭제합니다.
  * `CLEAR_INDEX` — 참고: 사용 중단됨. 지정된 파티션에서 특정 인덱스를 삭제합니다.
  * `REPLACE_RANGE` — 특정 범위의 파트들을 삭제하고 새로운 파트들로 교체합니다.
  * `MUTATE_PART` — 파트에 하나 이상의 뮤테이션을 적용합니다.
  * `ALTER_METADATA` — 전역 /metadata 및 /columns 경로에 따라 ALTER 변경을 적용합니다.

* `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 태스크가 실행을 위해 제출된 날짜와 시각.

* `required_quorum` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 태스크가 완료되고 완료 확인을 기다리는 레플리카 수. 이 컬럼은 `GET_PARTS` 태스크에만 관련이 있습니다.

* `source_replica` ([String](../../sql-reference/data-types/string.md)) — 소스 레플리카의 이름.

* `new_part_name` ([String](../../sql-reference/data-types/string.md)) — 새 파트의 이름.

* `parts_to_merge` ([Array](../../sql-reference/data-types/array.md) ([String](../../sql-reference/data-types/string.md))) — 병합하거나 업데이트할 파트들의 이름.

* `is_detach` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `DETACH_PARTS` 태스크가 큐에 있는지 여부를 나타내는 플래그.

* `is_currently_executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 특정 태스크가 현재 실행 중인지 여부를 나타내는 플래그.

* `num_tries` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 태스크를 완료하려다 실패한 시도 횟수.

* `last_exception` ([String](../../sql-reference/data-types/string.md)) — 마지막으로 발생한 오류에 대한 텍스트 메시지(있는 경우).

* `last_attempt_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 태스크가 마지막으로 시도된 날짜와 시각.

* `num_postponed` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 작업이 연기된 횟수.

* `postpone_reason` ([String](../../sql-reference/data-types/string.md)) — 태스크가 연기된 이유.

* `last_postpone_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 태스크가 마지막으로 연기된 날짜와 시각.

* `merge_type` ([String](../../sql-reference/data-types/string.md)) — 현재 병합 유형. 뮤테이션인 경우 비어 있습니다.

**Example**

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

**함께 보기**

* [ReplicatedMergeTree 테이블 관리](/sql-reference/statements/system#managing-replicatedmergetree-tables)
