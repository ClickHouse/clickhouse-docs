---
description: 'ALTER SQL 문에 대한 문서'
sidebar_label: 'ALTER'
sidebar_position: 35
slug: /sql-reference/statements/alter/
title: 'ALTER'
doc_type: 'reference'
---

# ALTER \{#alter\}

대부분의 `ALTER TABLE` 쿼리는 테이블 설정이나 데이터를 수정합니다:

| Modifier                                                                            |
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
| [APPLY PATCHES](/sql-reference/statements/alter/apply-patches.md)           |

:::note
대부분의 `ALTER TABLE` 쿼리는 [\*MergeTree](/engines/table-engines/mergetree-family/index.md), [Merge](/engines/table-engines/special/merge.md), [Distributed](/engines/table-engines/special/distributed.md) 테이블에서만 지원됩니다.
:::

다음 `ALTER` SQL 문은 뷰를 변경합니다:

| Statement                                                                           | Description                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | [materialized view](/sql-reference/statements/create/view) 구조를 수정합니다.                                       |

다음 `ALTER` SQL 문은 역할 기반 접근 제어와 관련된 개체를 수정합니다:

| Statement                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| Statement                                                                             | Description                                                                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | 이전에 주석이 설정되어 있었는지와 상관없이 테이블의 주석을 추가, 수정 또는 제거합니다. |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | [Named Collections](/operations/named-collections.md)를 수정합니다.                   |

## 뮤테이션 \{#mutations\}

테이블 데이터를 조작하기 위한 `ALTER` 쿼리는 "뮤테이션(mutations)"이라는 메커니즘으로 구현되며, 대표적으로 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md)와 [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md)가 있습니다. 이들은 [MergeTree](/engines/table-engines/mergetree-family/index.md) 테이블에서 머지(merge)와 유사한 백그라운드 비동기 프로세스로 동작하며, 새로운 "뮤테이션된(mutated)" 버전의 파트를 생성합니다.

`*MergeTree` 테이블에서 뮤테이션은 **전체 데이터 파트를 다시 쓰는 방식으로** 실행됩니다. 
원자성은 보장되지 않습니다. 파트는 뮤테이션이 완료되는 대로 뮤테이션된 파트로 교체되며, 뮤테이션 수행 중에 시작된 `SELECT` 쿼리는 이미 뮤테이션된 파트의 데이터와 아직 뮤테이션되지 않은 파트의 데이터를 함께 보게 됩니다.

뮤테이션은 생성 순서에 따라 완전히 순서가 정해지며, 각 파트에 그 순서대로 적용됩니다. 또한 뮤테이션은 `INSERT INTO` 쿼리와는 부분적으로만 순서가 정해집니다. 뮤테이션이 제출되기 전에 테이블에 삽입된 데이터는 뮤테이션 대상이 되지만, 그 이후에 삽입된 데이터는 뮤테이션되지 않습니다. 뮤테이션은 어떤 방식으로도 `INSERT`를 블로킹하지 않는다는 점에 유의하십시오.

뮤테이션 쿼리는 뮤테이션 엔트리가 추가된 직후 바로 반환됩니다(복제된 테이블의 경우 ZooKeeper에, 비복제 테이블의 경우 파일 시스템에 기록됩니다). 뮤테이션 자체는 시스템 프로파일 설정을 사용하여 비동기적으로 실행됩니다. 뮤테이션 진행 상태를 추적하려면 [`system.mutations`](/operations/system-tables/mutations) 테이블을 사용할 수 있습니다. 제출에 성공한 뮤테이션은 ClickHouse 서버가 재시작되더라도 계속 실행됩니다. 뮤테이션이 한 번 제출되면 이를 롤백하는 방법은 없지만, 어떤 이유로든 뮤테이션이 멈춰 있는 경우 [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) 쿼리로 취소할 수 있습니다.

완료된 뮤테이션 엔트리는 즉시 삭제되지 않으며, 보존되는 엔트리 수는 `finished_mutations_to_keep` 스토리지 엔진 파라미터에 의해 결정됩니다. 더 오래된 뮤테이션 엔트리는 삭제됩니다.

## ALTER 쿼리의 동기성 \{#synchronicity-of-alter-queries\}

비복제 테이블에서는 모든 `ALTER` 쿼리가 동기적으로 수행됩니다. 복제된 테이블에서는 쿼리가 관련 작업에 대한 지시만 `ZooKeeper`에 추가하고, 실제 작업은 가능한 한 빨리 수행됩니다. 이때 쿼리가 모든 레플리카에서 이러한 작업이 완료될 때까지 대기하도록 할 수 있습니다.

뮤테이션을 생성하는 `ALTER` 쿼리(예: `UPDATE`, `DELETE`, `MATERIALIZE INDEX`, `MATERIALIZE PROJECTION`, `MATERIALIZE COLUMN`, `APPLY DELETED MASK`, `APPLY PATCHES`, `CLEAR STATISTIC`, `MATERIALIZE STATISTIC` 등)의 동기 방식은 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 설정으로 정의됩니다.

메타데이터만 수정하는 기타 `ALTER` 쿼리에 대해서는 [alter_sync](/operations/settings/settings#alter_sync) 설정을 사용하여 대기 동작을 설정할 수 있습니다.

비활성 레플리카가 모든 `ALTER` 쿼리의 실행을 완료할 때까지 얼마나 오래(초 단위) 대기할지 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 설정으로 지정할 수 있습니다.

:::note
모든 `ALTER` 쿼리에 대해 `alter_sync = 2`이고, 일부 레플리카가 `replication_wait_for_inactive_replica_timeout` 설정에 지정된 시간보다 더 오래 비활성 상태인 경우 `UNFINISHED` 예외가 발생합니다.
:::

## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse에서 업데이트 및 삭제 처리하기](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)