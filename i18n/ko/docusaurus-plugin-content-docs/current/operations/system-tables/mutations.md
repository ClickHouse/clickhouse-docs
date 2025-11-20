---
'description': '시스템 테이블로 MergeTree 테이블의 변이 및 진행 상황에 대한 정보를 포함하고 있습니다. 각 변이 명령은 단일
  행으로 표현됩니다.'
'keywords':
- 'system table'
- 'mutations'
'slug': '/operations/system-tables/mutations'
'title': 'system.mutations'
'doc_type': 'reference'
---


# system.mutations

이 테이블은 [mutations](/sql-reference/statements/alter/index.md#mutations)과 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 테이블의 진행 상황에 대한 정보를 포함합니다. 각 변형 명령은 하나의 행으로 표현됩니다.

## Columns: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — 변형이 적용된 데이터베이스의 이름입니다.
- `table` ([String](/sql-reference/data-types/string.md)) — 변형이 적용된 테이블의 이름입니다.
- `mutation_id` ([String](/sql-reference/data-types/string.md)) — 변형의 ID입니다. 복제 테이블의 경우 이 ID는 ClickHouse Keeper의 `<table_path_in_clickhouse_keeper>/mutations/` 디렉토리의 znode 이름에 해당합니다. 비복제 테이블의 경우 이 ID는 테이블의 데이터 디렉토리 내 파일 이름에 해당합니다.
- `command` ([String](/sql-reference/data-types/string.md)) — 변형 명령 문자열 ( `ALTER TABLE [db.]table` 이후의 쿼리 부분입니다).
- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 변형 명령이 실행을 위해 제출된 날짜 및 시간입니다.
- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 복제 테이블의 변형에 대해, 배열은 파티션의 ID를 포함합니다 (각 파티션마다 하나의 레코드). 비복제 테이블의 변형에 대해 배열은 비어 있습니다.
- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — 복제 테이블의 변형에 대해, 배열은 변형에 의해 획득된 블록 번호와 함께 각 파티션마다 하나의 레코드를 포함합니다. 이 번호보다 작은 블록 번호를 포함하는 파트만 해당 파티션에서 변형됩니다. 비복제 테이블에서는 모든 파티션의 블록 번호가 단일 순서로 형성됩니다. 즉, 비복제 테이블의 변형에 대해 이 컬럼은 변형에 의해 획득된 단일 블록 번호를 포함하는 하나의 레코드를 가집니다.
- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 변형을 완료하기 위해 변형이 필요한 데이터 파트의 이름 배열입니다.
- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 변형을 완료하기 위해 변형이 필요한 데이터 파트의 수입니다.
- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 변형이 종료되었는지를 나타냅니다. **ClickHouse Cloud에서만 사용 가능.**

:::note 
`is_killed=1`은 변형이 완전히 종료되었음을 반드시 의미하지는 않습니다. 다른 긴 실행 변형이 종료된 변형을 차단하고 있는 경우 `is_killed=1` 및 `is_done=0` 상태를 오랫동안 유지할 수 있습니다. 이는 정상적인 상황입니다.
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 변형이 완료되었는지의 여부를 나타내는 플래그입니다. 가능한 값:
  - `1` 변형이 완료된 경우,
  - `0` 변형이 아직 진행 중인 경우.

:::note
`parts_to_do = 0`이더라도, 변형되지 않아야 할 새로운 데이터 파트를 생성하는 긴 실행 `INSERT` 쿼리로 인해 복제 테이블의 변형이 아직 완료되지 않았을 수 있습니다.
:::

일부 데이터 파트를 변형하는 데 문제가 발생한 경우, 다음 컬럼은 추가 정보를 포함합니다:

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 변형할 수 없었던 가장 최근 파트의 이름입니다.
- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 가장 최근 파트 변형 실패의 날짜 및 시간입니다.
- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 가장 최근 파트 변형 실패를 유발한 예외 메시지입니다.

## Monitoring Mutations {#monitoring-mutations}

`system.mutations` 테이블의 진행 상황을 추적하려면 다음 쿼리를 사용합니다:

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'system', 'mutations')
WHERE is_done = 0 AND table = 'tmp';

-- or

SELECT * FROM clusterAllReplicas('cluster_name', 'system.mutations')
WHERE is_done = 0 AND table = 'tmp';
```

참고: `system.*` 테이블에 대한 읽기 권한이 필요합니다.

:::tip Cloud usage
ClickHouse Cloud에서는 각 노드의 `system.mutations` 테이블이 클러스터의 모든 변형을 포함하며 `clusterAllReplicas`가 필요하지 않습니다.
:::

**See Also**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 테이블 엔진
- [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) 계열
