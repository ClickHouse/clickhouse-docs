---
'slug': '/cloud/reference/shared-merge-tree'
'sidebar_label': 'SharedMergeTree'
'title': 'SharedMergeTree'
'keywords':
- 'SharedMergeTree'
'description': 'SharedMergeTree 테이블 엔진에 대해 설명합니다.'
'doc_type': 'reference'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# SharedMergeTree 테이블 엔진

SharedMergeTree 테이블 엔진 계열은 ReplicatedMergeTree 엔진의 클라우드 네이티브 대체 요소로, 공유 스토리지 위에서 작동하도록 최적화 되어 있습니다 (예: Amazon S3, Google Cloud Storage, MinIO, Azure Blob Storage). 각특정 MergeTree 엔진 유형에 대해 SharedMergeTree의 아나로그가 존재합니다. 즉, ReplacingSharedMergeTree는 ReplacingReplicatedMergeTree를 대체합니다.

SharedMergeTree 테이블 엔진 계열은 ClickHouse Cloud의 핵심 기능을 제공합니다. 최종 사용자에게는 ReplicatedMergeTree 기반 엔진 대신 SharedMergeTree 엔진 계열을 사용하기 위해 변경할 것 없이 시작할 수 있습니다. 다음과 같은 추가 이점을 제공합니다:

- 높은 삽입 처리량
- 백그라운드 병합의 처리량 개선
- 변형 처리량 개선
- 더 빠른 스케일 업 및 스케일 다운 작업
- 선택 쿼리를 위한 더 경량의 강력한 일관성

SharedMergeTree가 가져오는 중요한 개선 사항은 ReplicatedMergeTree와 비교하여 컴퓨트와 스토리지의 더 깊은 분리를 제공한다는 것입니다. 아래에서 ReplicatedMergeTree가 컴퓨트와 스토리지를 어떻게 분리하는지 확인할 수 있습니다:

<Image img={shared_merge_tree} alt="ReplicatedMergeTree Diagram" size="md"  />

보시다시피, ReplicatedMergeTree에 저장된 데이터가 오브젝트 스토리지에 저장되더라도 메타데이터는 여전히 각 clickhouse-server에 존재합니다. 이는 모든 복제 작업에 대해 메타데이터도 모든 복제본에 복제되어야 함을 의미합니다.

<Image img={shared_merge_tree_2} alt="ReplicatedMergeTree Diagram with Metadata" size="md"  />

ReplicatedMergeTree와 달리 SharedMergeTree는 복제본 간의 통신을 필요로 하지 않습니다. 대신 모든 통신은 공유 스토리지와 clickhouse-keeper를 통해 이루어집니다. SharedMergeTree는 비동기 리더리스 복제를 구현하고 협조 및 메타데이터 저장을 위해 clickhouse-keeper를 사용합니다. 이는 서비스가 스케일 인 및 스케일 아웃 할 때 메타데이터가 복제될 필요가 없음을 의미합니다. 이는 더 빠른 복제, 변형, 병합 및 스케일 업 작업으로 이어집니다. SharedMergeTree는 각 테이블에 대해 수백 개의 복제본을 허용하여 샤드 없이 동적으로 스케일할 수 있게 합니다. ClickHouse Cloud에서는 분산 쿼리 실행 방식을 사용하여 쿼리의 컴퓨트 자원을 더 활용합니다.

## Introspection {#introspection}

ReplicatedMergeTree의 introspection에 사용되는 대부분의 시스템 테이블은 SharedMergeTree에서도 존재하지만, `system.replication_queue` 및 `system.replicated_fetches`는 데이터와 메타데이터가 복제되지 않기 때문에 존재하지 않습니다. 그러나 SharedMergeTree에는 이 두 테이블에 대한 해당 대안이 있습니다.

**system.virtual_parts**

이 테이블은 SharedMergeTree에 대한 `system.replication_queue`의 대안 역할을 합니다. 가장 최근의 현재 파트 세트 및 병합, 변형, 삭제된 파티션과 같은 진행 중인 미래 파트에 대한 정보를 저장합니다.

**system.shared_merge_tree_fetches**

이 테이블은 SharedMergeTree에 대한 `system.replicated_fetches`의 대안입니다. 현재 진행 중인 기본 키 및 체크섬을 메모리로 가져오는 정보가 포함되어 있습니다.

## SharedMergeTree 활성화 {#enabling-sharedmergetree}

`SharedMergeTree`는 기본적으로 활성화되어 있습니다.

SharedMergeTree 테이블 엔진을 지원하는 서비스에서는 수동으로 활성화할 필요가 없습니다. 이전과 동일한 방법으로 테이블을 생성할 수 있으며, CREATE TABLE 쿼리에 지정된 엔진에 해당하는 SharedMergeTree 기반의 테이블 엔진이 자동으로 사용됩니다.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

이렇게 하면 SharedMergeTree 테이블 엔진을 사용하여 `my_table` 테이블이 생성됩니다.

ClickHouse Cloud에서 `default_table_engine=MergeTree`이므로 `ENGINE=MergeTree`를 지정할 필요가 없습니다. 다음 쿼리는 위 쿼리와 동일합니다.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Replacing, Collapsing, Aggregating, Summing, VersionedCollapsing 또는 Graphite MergeTree 테이블을 사용하는 경우, 자동으로 해당 SharedMergeTree 기반 테이블 엔진으로 변환됩니다.

```sql
CREATE TABLE myFirstReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree
ORDER BY key;
```

주어진 테이블에 대해 어떤 테이블 엔진이 사용되었는지 `SHOW CREATE TABLE`을 통해 확인할 수 있습니다:
```sql
SHOW CREATE TABLE myFirstReplacingMT;
```

```sql
CREATE TABLE default.myFirstReplacingMT
( `key` Int64, `someCol` String, `eventTime` DateTime )
ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY key
```

## 설정 {#settings}

일부 설정 동작이 크게 변경되었습니다:

- `insert_quorum` -- SharedMergeTree에 대한 모든 삽입은 공통 삽입(공유 스토리지에 기록됨)이므로 SharedMergeTree 테이블 엔진을 사용할 때 이 설정이 필요하지 않습니다.
- `insert_quorum_parallel` -- SharedMergeTree에 대한 모든 삽입은 공통 삽입(공유 스토리지에 기록됨)이므로 SharedMergeTree 테이블 엔진을 사용할 때 이 설정이 필요하지 않습니다.
- `select_sequential_consistency` -- 공통 삽입을 필요로 하지 않으며 `SELECT` 쿼리에서 clickhouse-keeper에 추가 로드를 유발합니다.

## 일관성 {#consistency}

SharedMergeTree는 ReplicatedMergeTree보다 더 나은 경량 일관성을 제공합니다. SharedMergeTree에 데이터를 삽입할 때 `insert_quorum` 또는 `insert_quorum_parallel`과 같은 설정을 제공할 필요가 없습니다. 삽입은 공통 삽입으로, 메타데이터는 ClickHouse-Keeper에 저장되고, 이 메타데이터는 ClickHouse-keeper의 최소 공통 수로 복제됩니다. 클러스터의 각 복제본은 ClickHouse-Keeper에서 비동기적으로 새로운 정보를 가져옵니다.

대부분의 경우 `select_sequential_consistency`나 `SYSTEM SYNC REPLICA LIGHTWEIGHT`를 사용할 필요는 없습니다. 비동기 복제가 대부분의 시나리오를 처리하며 지연 시간이 매우 낮습니다. 이전 읽기를 방지해야 하는 희귀한 경우에는 다음 권장 사항을 선호 순서에 따라 따르십시오:

1. 읽기 및 쓰기를 동일한 세션이나 동일한 노드에서 실행하는 경우, 복제본이 이미 가장 최근 메타데이터를 갖고 있기 때문에 `select_sequential_consistency`를 사용할 필요가 없습니다.

2. 한 복제본에 쓰고 다른 복제본에서 읽는 경우, `SYSTEM SYNC REPLICA LIGHTWEIGHT`를 사용하여 복제본이 ClickHouse-Keeper에서 메타데이터를 가져오도록 강제할 수 있습니다.

3. 쿼리의 일부로 설정의 `select_sequential_consistency`를 사용합니다.
