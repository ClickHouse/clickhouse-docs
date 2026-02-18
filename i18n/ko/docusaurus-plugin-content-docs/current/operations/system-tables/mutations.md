---
description: 'MergeTree 테이블의 뮤테이션과 해당 진행 상태에 대한 정보를 포함하는 시스템 테이블입니다. 각 뮤테이션 명령은 하나의 행으로 표현됩니다.'
keywords: ['시스템 테이블', '뮤테이션']
slug: /operations/system-tables/mutations
title: 'system.mutations'
doc_type: 'reference'
---

# system.mutations \{#systemmutations\}

이 테이블에는 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 테이블의 [뮤테이션](/sql-reference/statements/alter/index.md#mutations)과 그 진행 상태에 대한 정보가 포함되어 있습니다. 각 뮤테이션 명령은 하나의 행으로 표현됩니다.

## Columns: \{#columns\}

- `database` ([String](/sql-reference/data-types/string.md)) — 뮤테이션이 적용된 데이터베이스 이름입니다.
- `table` ([String](/sql-reference/data-types/string.md)) — 뮤테이션이 적용된 테이블 이름입니다.
- `mutation_id` ([String](/sql-reference/data-types/string.md)) — 뮤테이션 ID입니다. 복제된 테이블(Replicated Table)의 경우 이 ID는 ClickHouse Keeper의 `<table_path_in_clickhouse_keeper>/mutations/` 디렉터리 내 znode 이름과 대응합니다. 비복제 테이블의 경우 이 ID는 테이블 데이터 디렉터리 내 파일 이름과 대응합니다.
- `command` ([String](/sql-reference/data-types/string.md)) — 뮤테이션 명령 문자열입니다(쿼리에서 `ALTER TABLE [db.]table` 이후 부분).
- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) —  뮤테이션 명령이 실행을 위해 제출된 날짜와 시간입니다.
- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 복제된 테이블의 뮤테이션의 경우, 각 파티션당 하나의 레코드로 파티션 ID를 포함하는 배열입니다. 비복제 테이블의 뮤테이션의 경우 배열은 비어 있습니다.
- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — 복제된 테이블의 뮤테이션의 경우, 각 파티션에 대해 해당 뮤테이션이 할당받은 블록 번호를 하나의 레코드로 포함하는 배열입니다. 이 번호보다 작은 번호를 가진 블록을 포함하는 파트만 해당 파티션에서 뮤테이션됩니다. 비복제 테이블에서는 모든 파티션의 블록 번호가 단일 시퀀스를 이룹니다. 따라서 비복제 테이블의 뮤테이션의 경우, 이 컬럼에는 뮤테이션이 할당받은 단일 블록 번호를 포함한 레코드가 하나만 존재합니다.
- `parts_in_progress_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 현재 뮤테이션이 진행 중인 데이터 파트의 이름 배열입니다.
- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 뮤테이션이 완료되기 위해 앞으로 뮤테이션이 수행되어야 하는 데이터 파트의 이름 배열입니다.
- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 뮤테이션이 완료되기 위해 앞으로 뮤테이션이 수행되어야 하는 데이터 파트의 개수입니다.
- `parts_postpone_reasons` ([Map](/sql-reference/data-types/map.md)([String](/sql-reference/data-types/string.md))) — 연기된 파트 이름과 그 이유를 매핑한 맵입니다.

:::note

- 파트 이름이 `parts_postpone_reasons`에 없고 아직 뮤테이션이 수행되지 않았다면, 해당 파트는 아직 뮤테이션이 예약되지 않은 것입니다.
- `all_parts`라는 파트 이름은 아직 뮤테이션이 수행되지 않은 모든 파트를 나타냅니다.
:::

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 뮤테이션이 중지(kill)되었는지 여부를 나타냅니다. **ClickHouse Cloud에서만 사용할 수 있습니다.**

:::note 
`is_killed=1`이라고 해서 뮤테이션이 완전히 종료되었다는 의미는 아닙니다. `is_killed=1`이고 `is_done=0` 상태가 오랜 기간 지속될 수 있습니다. 이는 다른 장시간 실행 중인 뮤테이션이 중지된 뮤테이션을 차단하고 있는 경우 발생할 수 있습니다. 이러한 상황은 정상입니다.
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 뮤테이션이 완료되었는지 여부를 나타내는 플래그입니다. 가능한 값:
  - 뮤테이션이 완료된 경우 `1`,
  - 뮤테이션이 아직 진행 중인 경우 `0`.

:::note
`parts_to_do = 0`인 경우에도, 복제된 테이블의 뮤테이션은 장시간 실행되는 `INSERT` 쿼리로 인해 아직 완료되지 않았을 수 있습니다. 이 쿼리는 뮤테이션이 필요로 하는 새로운 데이터 파트를 생성합니다.
:::

일부 데이터 파트의 뮤테이션에 문제가 발생한 경우, 다음 컬럼에 추가 정보가 포함됩니다:

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 가장 최근에 뮤테이션에 실패한 파트의 이름입니다.
- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 가장 최근 파트 뮤테이션 실패가 발생한 날짜와 시간입니다.
- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 가장 최근 파트 뮤테이션 실패를 발생시킨 예외 메시지입니다.

## 뮤테이션 모니터링 \{#monitoring-mutations\}

`system.mutations` 테이블의 진행 상황을 추적하려면 다음 쿼리를 사용하십시오:

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'system', 'mutations')
WHERE is_done = 0 AND table = 'tmp';

-- or

SELECT * FROM clusterAllReplicas('cluster_name', 'system.mutations')
WHERE is_done = 0 AND table = 'tmp';
```

참고: `system.*` 테이블에 대한 읽기 권한이 필요합니다.

:::tip Cloud 사용
ClickHouse Cloud에서는 각 노드의 `system.mutations` 테이블에 클러스터 전체의 모든 뮤테이션이 포함되어 있으므로 `clusterAllReplicas`를 사용할 필요가 없습니다.
:::

**함께 보기**

* [Mutations](/sql-reference/statements/alter/index.md#mutations)
* [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 테이블 엔진
* [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) 계열
