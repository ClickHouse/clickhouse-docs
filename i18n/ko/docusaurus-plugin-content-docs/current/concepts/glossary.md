---
'sidebar_label': '용어집'
'description': '이 페이지에는 ClickHouse에 관한 일반적으로 사용되는 단어와 구문 목록과 그 정의가 포함되어 있습니다.'
'title': '용어집'
'slug': '/concepts/glossary'
'keywords':
- 'glossary'
- 'definitions'
- 'terminology'
'doc_type': 'reference'
---


# 용어집

## Atomicity {#atomicity}

Atomicity는 트랜잭션(일련의 데이터베이스 작업)이 단일하고 분리할 수 없는 단위로 처리됨을 보장합니다. 이는 트랜잭션 내의 모든 작업이 발생하거나 전혀 발생하지 않아야 함을 의미합니다. 원자 트랜잭션의 예로는 한 은행 계좌에서 다른 계좌로의 돈 이체가 있습니다. 이체의 어느 단계라도 실패하면 트랜잭션은 실패하며 돈은 첫 번째 계좌에 남습니다. Atomicity는 돈이 잃거나 생성되지 않도록 보장합니다.

## Block {#block}

Block은 데이터 처리 및 저장을 조직하기 위한 논리적 단위입니다. 각 블록은 쿼리 실행 중 성능을 향상시키기 위해 함께 처리되는 컬럼형 데이터를 포함합니다. 데이터를 블록 단위로 처리함으로써 ClickHouse는 캐시 미스를 최소화하고 벡터화된 실행을 촉진하여 CPU 코어를 효율적으로 사용합니다. ClickHouse는 LZ4, ZSTD 및 Delta와 같은 다양한 압축 알고리즘을 사용하여 블록의 데이터를 압축합니다.

## Cluster {#cluster}

데이터를 저장하고 처리하기 위해 함께 작동하는 노드(서버)의 모음입니다.

## CMEK {#cmek}

고객 관리 암호화 키(CMEK)를 사용하면 고객이 자신의 키 관리 서비스(KMS) 키로 ClickHouse 디스크 데이터 키를 암호화하고 정적으로 데이터를 보호할 수 있습니다.

## Dictionary {#dictionary}

딕셔너리는 여러 유형의 참조 목록에 유용한 키-값 쌍의 매핑입니다. 이는 쿼리에서 딕셔너리를 효율적으로 사용할 수 있는 강력한 기능으로, 참조 테이블과의 `JOIN`보다 더 효율적일 수 있습니다.

## Distributed table {#distributed-table}

ClickHouse의 분산 테이블은 데이터를 직접 저장하지 않고 클러스터 내 여러 서버에서의 분산 쿼리 처리를 위한 통합 뷰를 제공하는 특별한 유형의 테이블입니다.

## Granule {#granule}

Granule은 압축되지 않은 블록의 행 배치입니다. 데이터를 읽을 때 ClickHouse는 개별 행이 아닌 granule에 접근하여 분석 작업에서 더 빠른 데이터 처리를 가능하게 합니다. 기본적으로 granule은 8192개의 행을 포함합니다. 기본 인덱스는 granule당 하나의 항목을 포함합니다.

## Incremental materialized view {#incremental-materialized-view}

ClickHouse의 증분 물리화된 뷰는 삽입 시간에 데이터를 처리하고 집계하는 유형의 물리화된 뷰입니다. 소스 테이블에 새로운 데이터가 삽입되면 물리화된 뷰는 새로 삽입된 블록에 대해 미리 정의된 SQL 집계 쿼리를 실행하고 집계된 결과를 대상으로 한 테이블에 기록합니다.

## Lightweight update {#lightweight-update}

ClickHouse의 경량 업데이트는 표준 SQL UPDATE 구문을 사용하여 테이블의 행을 업데이트할 수 있게 해주는 실험적 기능입니다. 그러나 전체 컬럼이나 데이터 파트를 재작성하는 대신(전통적인 변형과 같이) 업데이트된 컬럼과 행만 포함하는 "패치 파트"를 생성합니다. 이러한 업데이트는 패치 적용을 통해 SELECT 쿼리에서 즉시 볼 수 있지만 물리적 데이터는 이후 병합 중에만 업데이트됩니다.

## Materialized view {#materialized-view}

ClickHouse의 물리화된 뷰는 데이터가 소스 테이블에 삽입될 때 자동으로 쿼리를 실행하여 변환된 또는 집계된 결과를 별도의 대상 테이블에 저장하여 쿼리를 빠르게 수행할 수 있도록 하는 메커니즘입니다.

## MergeTree {#mergetree}

ClickHouse의 MergeTree는 높은 데이터 수집률과 대량의 데이터 볼륨을 위해 설계된 테이블 엔진입니다. 이는 ClickHouse의 핵심 저장 엔진으로, 컬럼형 저장, 사용자 정의 파티셔닝, 스파스 기본 인덱스 및 배경 데이터 병합을 지원하는 기능을 제공합니다.

## Mutation {#mutation}

ClickHouse에서 변형(mutation)은 ALTER TABLE ... UPDATE 또는 ALTER TABLE ... DELETE와 같은 명령어를 사용하여 테이블 내 기존 데이터를 수정하거나 삭제하는 작업을 말합니다. 변형은 변경의 영향을 받는 전체 데이터 파트를 재작성하는 비동기 배경 프로세스로 구현됩니다.

## On-the-fly mutation {#on-the-fly-mutation}

ClickHouse의 즉시 변형(on-the-fly mutation)은 변형이 제출된 후 즉시 다음 SELECT 쿼리에서 업데이트 또는 삭제가 보이도록 하는 메커니즘입니다. 백그라운드 변형 프로세스가 완료될 때까지 기다릴 필요가 없습니다.

## Parts {#parts}

테이블의 데이터의 일부를 저장하는 물리적 파일입니다. 이는 파티션과는 다르며, 파티션은 파티션 키를 사용하여 생성된 테이블 데이터의 논리적 분할입니다.

## Partitioning key {#partitioning-key}

ClickHouse에서 파티션 키는 테이블 생성 시 PARTITION BY 절에 정의된 SQL 표현식입니다. 이는 데이터가 디스크에서 파티션으로 논리적으로 그룹화되는 방식을 결정합니다. 각 파티션 키의 고유한 값은 고유한 물리적 파티션을 형성하여 전체 파티션을 삭제, 이동 또는 보관하는 효율적인 데이터 관리 작업을 가능하게 합니다.

## Primary key {#primary-key}

ClickHouse에서 기본 키는 데이터가 디스크에 저장되는 순서를 결정하며 쿼리 필터링 속도를 높이는 스파스 인덱스를 구축하는 데 사용됩니다. 전통적인 데이터베이스와는 달리 ClickHouse의 기본 키는 유일성을 강제하지 않으며 여러 행이 동일한 기본 키 값을 가질 수 있습니다.

## Projection {#projection}

ClickHouse의 프로젝션은 데이터를 다르게 정렬하거나 미리 계산된 집계를 저장하여 쿼리 속도를 높이는 숨겨진 자동 유지 관리되는 테이블입니다. 주로 기본 기본 키에 포함되지 않은 컬럼을 필터링할 때 유용합니다.

## Refreshable materialized view {#refreshable-materialized-view}

Refreshable materialized view는 주기적으로 전체 데이터 세트에 대해 쿼리를 다시 실행하고 결과를 대상 테이블에 저장하는 유형의 물리화된 뷰입니다. 증분 물리화된 뷰와 달리, refreshable materialized view는 일정을 기반으로 업데이트되며, JOIN 및 UNION을 포함한 복잡한 쿼리를 제한 없이 지원할 수 있습니다.

## Replica {#replica}

ClickHouse 데이터베이스에 저장된 데이터의 복사본입니다. 중복성과 신뢰성을 위해 동일한 데이터의 복제본을 여러 개 가질 수 있습니다. 복제본은 ReplicatedMergeTree 테이블 엔진과 함께 사용되며, 이를 통해 ClickHouse는 서로 다른 서버 간에 데이터의 여러 복사본을 동기화할 수 있습니다.

## Shard {#shard}

데이터의 하위 집합입니다. ClickHouse는 항상 데이터에 대해 최소 한 개의 샤드를 갖습니다. 데이터가 여러 서버에 분산되지 않으면 데이터는 하나의 샤드에 저장됩니다. 단일 서버의 용량을 초과할 경우 여러 서버에 데이터를 샤딩하여 부하를 분산할 수 있습니다.

## Skipping index {#skipping-index}

Skipping index는 여러 개의 연속된 granule 수준에서 소량의 메타데이터를 저장하는 데 사용되며, ClickHouse가 관련 없는 행을 스캔하지 않도록 합니다. Skipping index는 프로젝션에 대한 경량 대안을 제공합니다.

## Sorting key {#sorting-key}

ClickHouse에서 정렬 키는 디스크의 행의 물리적 순서를 정의합니다. 기본 키를 지정하지 않으면 ClickHouse는 정렬 키를 기본 키로 사용합니다. 둘 다 지정하면 기본 키는 정렬 키의 접두어여야 합니다.

## Sparse index {#sparse-index}

기본 인덱스가 단일 행이 아니라 행 그룹에 대해 하나의 항목을 포함하는 인덱싱의 유형입니다. 행 그룹에 해당하는 항목을 마크(mark)라고 합니다. 스파스 인덱스를 사용하면 ClickHouse가 먼저 쿼리와 일치할 가능성이 있는 행 그룹을 식별한 다음 이를 별도로 처리하여 일치를 찾습니다. 이로 인해 기본 인덱스는 메모리에 로드할 수 있을 만큼 작습니다.

## Table engine {#table-engine}

ClickHouse의 테이블 엔진은 데이터가 작성되고 저장되며 접근되는 방식을 결정합니다. MergeTree는 가장 일반적인 테이블 엔진이며, 대량의 데이터의 빠른 삽입을 허용하여 백그라운드에서 처리됩니다.

## TTL {#ttl}

Time To Live (TTL)은 ClickHouse 기능으로, 특정 기간 이후에 컬럼 또는 행을 자동으로 이동, 삭제 또는 집계합니다. 이를 통해 자주 액세스할 필요가 없는 데이터를 삭제, 이동 또는 보관할 수 있어 저장소를 보다 효율적으로 관리할 수 있습니다.
