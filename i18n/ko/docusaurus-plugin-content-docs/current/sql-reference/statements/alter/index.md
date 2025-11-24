---
'description': 'ALTER에 대한 문서'
'sidebar_label': 'ALTER'
'sidebar_position': 35
'slug': '/sql-reference/statements/alter/'
'title': 'ALTER'
'doc_type': 'reference'
---


# ALTER

대부분의 `ALTER TABLE` 쿼리는 테이블 설정이나 데이터를 수정합니다:

| 수정자                                                                            |
|-------------------------------------------------------------------------------------|
| [COLUMN](/sql-reference/statements/alter/column.md)                         |
| [PARTITION](/sql-reference/statements/alter/partition.md)                   |
| [DELETE](/sql-reference/statements/alter/delete.md)                         |
| [UPDATE](/sql-reference/statements/alter/update.md)                         |
| [ORDER BY](/sql-reference/statements/alter/order-by.md)                     |
| [INDEX](/sql-reference/statements/alter/skipping-index.md)                  |
| [CONSTRAINT](/sql-reference/statements/alter/constraint.md)                 |
| [TTL](/sql-reference/statements/alter/ttl.md)                               |
| [STATISTICS](/sql-reference/statements/alter/statistics.md)                 |
| [APPLY DELETED MASK](/sql-reference/statements/alter/apply-deleted-mask.md) |

:::note
대부분의 `ALTER TABLE` 쿼리는 [\*MergeTree](/engines/table-engines/mergetree-family/index.md), [Merge](/engines/table-engines/special/merge.md) 및 [Distributed](/engines/table-engines/special/distributed.md) 테이블에서만 지원됩니다.
:::

이 `ALTER` 문은 뷰를 조작합니다:

| 문장                                                                               | 설명                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | [물리화된 뷰](/sql-reference/statements/create/view)의 구조를 수정합니다.                                       |

이 `ALTER` 문은 역할 기반 접근 제어와 관련된 엔티티를 수정합니다:

| 문장                                                                           |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| 문장                                                                                 | 설명                                                                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | 테이블에 대한 주석을 추가, 수정 또는 제거합니다. 이전에 설정되었는지 여부와 관계없이.                                 |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | [이름이 지정된 컬렉션](/operations/named-collections.md)을 수정합니다.                   |

## Mutations {#mutations}

테이블 데이터를 조작하기 위한 `ALTER` 쿼리는 "변형(mutations)"이라고 하는 메커니즘을 통해 구현됩니다. 특히 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) 및 [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md)이 있습니다. 이들은 [MergeTree](/engines/table-engines/mergetree-family/index.md) 테이블의 병합과 유사한 비동기 백그라운드 프로세스로 새로운 "변형된" 버전의 파트를 생성합니다.

`*MergeTree` 테이블에 대한 변형은 **전체 데이터 파트를 재작성**하여 실행됩니다. 
원자성이 없으며 — 파트는 변형이 완료되는 대로 변형된 파트로 대체됩니다. 변형이 수행되는 동안 시작된 `SELECT` 쿼리는 이미 변형된 데이터와 아직 변형되지 않은 파트에서 데이터를 모두 볼 수 있습니다.

변형은 생성 순서에 따라 완전히 정렬되어 있으며 해당 순서에 따라 각 파트에 적용됩니다. 변형은 `INSERT INTO` 쿼리와 부분적으로 순서가 정해져 있습니다: 변형이 제출되기 전에 테이블에 삽입된 데이터는 변형되고, 그 이후에 삽입된 데이터는 변형되지 않습니다. 변형이 삽입을 차단하지 않는다는 점에 유의하십시오.

변형 쿼리는 변형 항목이 추가된 직후에 즉시 반환됩니다(복제 테이블의 경우 ZooKeeper에, 비복제 테이블의 경우 파일 시스템에). 변형 자체는 시스템 프로필 설정을 사용하여 비동기적으로 실행됩니다. 변형의 진행 상황을 추적하려면 [`system.mutations`](/operations/system-tables/mutations) 테이블을 사용할 수 있습니다. 성공적으로 제출된 변형은 ClickHouse 서버가 재시작되더라도 계속 실행됩니다. 변형이 제출된 후 롤백할 방법은 없지만, 변형이 어떤 이유로 멈춰 있는 경우 [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) 쿼리를 사용하여 취소할 수 있습니다.

완료된 변형의 항목은 즉시 삭제되지 않으며(보존된 항목 수는 `finished_mutations_to_keep` 저장 엔진 매개변수에 의해 결정됨) 오래된 변형 항목이 삭제됩니다.

## Synchronicity of ALTER Queries {#synchronicity-of-alter-queries}

비복제 테이블의 경우 모든 `ALTER` 쿼리는 동기적으로 수행됩니다. 복제 테이블의 경우, 쿼리는 적절한 작업에 대한 지침을 `ZooKeeper`에 추가하고, 작업은 가능한 한 빨리 수행됩니다. 그러나 쿼리는 이러한 작업이 모든 복제본에서 완료될 때까지 기다릴 수 있습니다.

변형을 생성하는 `ALTER` 쿼리(예: `UPDATE`, `DELETE`, `MATERIALIZE INDEX`, `MATERIALIZE PROJECTION`, `MATERIALIZE COLUMN`, `APPLY DELETED MASK`, `CLEAR STATISTIC`, `MATERIALIZE STATISTIC` 포함)는 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 설정에 의해 동기성이 정의됩니다.

메타데이터만 수정하는 다른 `ALTER` 쿼리의 경우, 대기 설정을 지정하기 위해 [alter_sync](/operations/settings/settings#alter_sync) 설정을 사용할 수 있습니다.

비활성 복제본이 모든 `ALTER` 쿼리를 실행하기 위해 대기하는 시간을 초 단위로 지정할 수 있으며, 이는 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 설정을 통해 조정됩니다.

:::note
모든 `ALTER` 쿼리에 대해, `alter_sync = 2`이고 일부 복제본이 `replication_wait_for_inactive_replica_timeout` 설정에 명시된 시간 이상 비활성인 경우, `UNFINISHED` 예외가 발생합니다.
:::

## Related content {#related-content}

- 블로그: [ClickHouse에서 업데이트 및 삭제 처리하기](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
