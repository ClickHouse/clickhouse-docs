---
'slug': '/migrations/postgresql/data-modeling-techniques'
'title': '데이터 모델링 기법'
'description': 'PostgreSQL에서 ClickHouse로 마이그레이션하는 가이드의 Part 3'
'keywords':
- 'postgres'
- 'postgresql'
'show_related_blogs': true
'sidebar_label': 'Part 3'
'doc_type': 'guide'
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';
import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';
import Image from '@theme/IdealImage';

> 이 글은 PostgreSQL에서 ClickHouse로 마이그레이션하는 방법에 대한 **3부** 가이드입니다. 실용적인 예제를 사용하여 PostgreSQL에서 ClickHouse로 마이그레이션하는 경우 ClickHouse에서 데이터를 모델링하는 방법을 설명합니다.

Postgres에서 마이그레이션하는 사용자에게는 [ClickHouse에서 데이터를 모델링하기 위한 가이드](/data-modeling/schema-design)를 읽을 것을 권장합니다. 이 가이드는 동일한 Stack Overflow 데이터 세트를 사용하고 ClickHouse 기능을 활용한 여러 접근 방식을 탐구합니다.

## ClickHouse의 기본(정렬) 키 {#primary-ordering-keys-in-clickhouse}

OLTP 데이터베이스에서 온 사용자는 ClickHouse에서 해당 개념의 동등한 항목을 자주 찾습니다. ClickHouse가 `PRIMARY KEY` 구문을 지원하는 것을 발견했을 때, 사용자는 소스 OLTP 데이터베이스와 동일한 키를 사용하여 테이블 스키마를 정의하고자 할 수 있습니다. 이는 적절하지 않습니다.

### ClickHouse의 기본 키가 다른 이유는 무엇인가요? {#how-are-clickhouse-primary-keys-different}

OLTP 기본 키를 ClickHouse에서 사용하는 것이 적절하지 않은 이유를 이해하기 위해 사용자는 ClickHouse 인덱싱의 기본 사항을 이해해야 합니다. Postgres를 비교 예제로 사용하지만, 이러한 일반적인 개념은 다른 OLTP 데이터베이스에도 적용됩니다.

- Postgres 기본 키는 정의상 각 행마다 고유합니다. [B-트리 구조](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)를 사용하면 이 키로 단일 행을 효율적으로 조회할 수 있습니다. ClickHouse는 단일 행 값을 조회하도록 최적화할 수 있지만, 분석 작업 부하는 일반적으로 많은 행에 대해 몇 개의 컬럼을 읽어야 하므로, 필터는 **집계를 수행할 행의 하위 집합**을 식별해야 할 경우가 많습니다.
- 메모리와 디스크 효율성은 ClickHouse가 자주 사용되는 규모에 필수적입니다. 데이터는 ClickHouse 테이블에 파트라는 청크로 쓰여지며, 백그라운드에서 파트를 병합하기 위한 규칙이 적용됩니다. ClickHouse에서 각 파트에는 고유한 기본 인덱스가 있습니다. 파트가 병합될 때, 병합된 파트의 기본 인덱스도 병합됩니다. Postgres와는 달리, 이러한 인덱스는 각 행에 대해 구축되지 않습니다. 대신, 파트의 기본 인덱스는 행 그룹당 하나의 인덱스 항목을 가집니다. 이 기술을 **스파스 인덱싱**이라고 합니다.
- **스파스 인덱싱**이 가능한 이유는 ClickHouse가 파트의 행을 지정된 키에 따라 디스크에 정렬하여 저장하기 때문입니다. 단일 행을 직접 찾는 대신(B-트리 기반 인덱스처럼), 스파스 기본 인덱스는 인덱스 항목에 대한 이진 검색을 통해 쿼리에 일치할 가능성이 있는 행 그룹을 빠르게 식별할 수 있습니다. 그러고 나서 잠재적으로 일치할 행 그룹은 ClickHouse 엔진으로 스트리밍되어 일치 항목을 찾습니다. 이 인덱스 설계는 기본 인덱스가 작아지면서 주 메모리로 완전히 적재될 수 있도록 하여, 특히 데이터 분석 사용 사례에서 전형적인 범위 쿼리에 대해 쿼리 실행 시간을 유의미하게 단축할 수 있습니다.

자세한 내용은 [이 심층 가이드](/guides/best-practices/sparse-primary-indexes)를 권장합니다.

<Image img={postgres_b_tree} size="lg" alt="PostgreSQL B-Tree 인덱스"/>

<Image img={postgres_sparse_index} size="lg" alt="PostgreSQL 스파스 인덱스"/>

ClickHouse에서 선택된 키는 인덱스뿐만 아니라 데이터가 디스크에 쓰이는 순서도 결정합니다. 이로 인해 압축 수준에 중대한 영향을 줄 수 있으며, 결과적으로 쿼리 성능에도 영향을 미칠 수 있습니다. 대부분의 컬럼 값이 연속적인 순서로 쓰이도록 하는 정렬 키는 선택된 압축 알고리즘(및 코덱)이 데이터를 보다 효과적으로 압축하도록 도와줍니다.

> 테이블의 모든 컬럼은 지정된 정렬 키의 값에 따라 정렬됩니다. 키 자체에 포함되어 있는지와 관계없이 말입니다. 예를 들어, `CreationDate`가 키로 사용되면 다른 모든 컬럼의 값 순서는 `CreationDate` 컬럼의 값 순서에 대응됩니다. 여러 개의 정렬 키를 지정할 수 있으며, 이는 `SELECT` 쿼리의 `ORDER BY` 절과 동일한 의미로 정렬됩니다.

### 정렬 키 선택하기 {#choosing-an-ordering-key}

정렬 키 선택에 대한 고려 사항과 단계에 대해서는, 게시물 테이블을 예로 들어 [여기서]( /data-modeling/schema-design#choosing-an-ordering-key) 확인하십시오.

CDC를 사용하는 실시간 복제 시에는 추가 제약 조건이 있으니, CDC와 함께 정렬 키를 사용자 정의하는 기술에 대해서는 [이 문서](/integrations/clickpipes/postgres/ordering_keys)를 참조하십시오.

## 파티션 {#partitions}

Postgres 사용자는 큰 데이터베이스의 성능 및 관리성을 향상시키기 위해 테이블을 작은 더 관리 가능한 조각인 파티션으로 나누는 테이블 파티셔닝 개념에 익숙할 것입니다. 이 파티셔닝은 지정된 컬럼(예: 날짜)에서 범위, 정의된 리스트 또는 키 해시를 사용하여 수행할 수 있습니다. 이를 통해 관리자는 특정 기준(예: 날짜 범위 또는 지리적 위치)에 따라 데이터를 구성할 수 있습니다. 파티셔닝은 파티션 프루닝을 통해 데이터 접근 속도를 빠르게 하여 쿼리 성능을 향상시키고, 전체 테이블이 아니라 개별 파티션에서 작업을 수행할 수 있으므로 백업 및 데이터 정리와 같은 유지 관리 작업에도 도움이 됩니다. 또한, 파티셔닝은 PostgreSQL 데이터베이스의 확장성을 크게 향상시키고 여러 파티션에 부하를 분산시킬 수 있습니다.

ClickHouse에서는 테이블을 처음 정의할 때 `PARTITION BY` 절을 통해 파티셔닝이 지정됩니다. 이 절은 SQL 표현식을 포함할 수 있으며, 이 표현식의 결과가 행이 전송되는 파티션을 정의합니다.

<Image img={postgres_partitions} size="md" alt="PostgreSQL 파티션에서 ClickHouse 파티션으로"/>

데이터 파트는 디스크에서 각 파티션과 논리적으로 연결되어 있으며, 개별적으로 쿼리할 수 있습니다. 아래 예에서는 `toYear(CreationDate)` 표현식을 사용하여 `posts` 테이블을 연도별로 파티셔닝합니다. 행이 ClickHouse에 삽입될 때 이 표현식은 각 행에 대해 평가되고, 결과 파티션이 존재하면 해당 파티션으로 라우팅됩니다(해당 연도의 첫 번째 행이면 파티션이 생성됨).

```sql
 CREATE TABLE posts
(
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
...
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)
PARTITION BY toYear(CreationDate)
```

파티셔닝에 대한 전체 설명은 ["테이블 파티션"](/partitions)를 참조하십시오.

### 파티션의 용도 {#applications-of-partitions}

ClickHouse의 파티셔닝은 Postgres와 유사한 용도가 있지만 몇 가지 미세한 차이가 있습니다. 좀 더 구체적으로:

- **데이터 관리** - ClickHouse에서 사용자는 주로 파티셔닝을 데이터 관리 기능으로 간주해야 하며, 쿼리 최적화 기법으로 보지 않아야 합니다. 키에 따라 데이터를 논리적으로 분리함으로써 각 파티션에서 개별적으로 작업할 수 있습니다. 예를 들어 삭제할 수 있습니다. 이를 통해 사용자는 파티션을 이동할 수 있으며, 따라서 하위 집합을 [스토리지 티어](/integrations/s3#storage-tiers) 간에 효율적으로 이동시키거나 데이터를 만료/클러스터에서 효율적으로 삭제할 수 있습니다. 예를 들어, 아래에서는 2008년의 게시물을 삭제합니다.

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008      │
│ 2009      │
│ 2010      │
│ 2011      │
│ 2012      │
│ 2013      │
│ 2014      │
│ 2015      │
│ 2016      │
│ 2017      │
│ 2018      │
│ 2019      │
│ 2020      │
│ 2021      │
│ 2022      │
│ 2023      │
│ 2024      │
└───────────┘

17 rows in set. Elapsed: 0.002 sec.

ALTER TABLE posts
(DROP PARTITION '2008')

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

- **쿼리 최적화** - 파티션이 쿼리 성능에 도움을 줄 수 있지만, 이는 액세스 패턴에 따라 크게 달라집니다. 쿼리가 몇 개의 파티션(이상적으로는 하나)만 대상으로 할 경우 성능이 향상될 수 있습니다. 이는 기본 키에 파티셔닝 키가 포함되어 있지 않고 이를 필터링할 때만 유용합니다. 그러나 많은 파티션을 커버해야 하는 쿼리는 파르푸 효과를 위해 성능이 악화될 수 있으며(파티셔닝 결과로 더 많은 파트가 있을 수 때문입니다). 단일 파티션을 타겟팅하는 이점은 해당 파티셔닝 키가 이미 기본 키의 초기 항목인 경우에도 존재감이 미미할 수 있습니다. 파티셔닝은 또한 각 파티션에 있는 값이 고유한 경우 [GROUP BY 쿼리 최적화](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)에 사용될 수 있습니다. 그러나 일반적으로 사용자는 기본 키가 최적화되어 있는지 확인해야 하며, 액세스 패턴이 특정 예측 가능한 하위 집합에만 접근하는 비상적 경우를 제외하고는 쿼리 최적화 기법으로서의 파티셔닝을 고려해야 합니다. 예를 들어 하루 단위로 파티셔닝하고, 대부분의 쿼리가 마지막 날에 있는 경우가 이에 해당합니다.

### 파티션에 대한 권장 사항 {#recommendations-for-partitions}

사용자는 파티셔닝을 데이터 관리 기법으로 간주해야 합니다. 시계열 데이터를 사용할 때 클러스터에서 데이터를 만료해야 할 경우 이상적입니다. 예를 들어, 가장 오래된 파티션은 [간단히 삭제할 수 있습니다](/sql-reference/statements/alter/partition#drop-partitionpart).

**중요:** 파티셔닝 키 표현이 높은 카디널리티 집합을 초래하지 않도록 해야 합니다. 즉, 100개 이상의 파티션을 생성하는 것은 피해야 합니다. 예를 들어, 클라이언트 식별자 또는 이름과 같은 높은 카디널리티 컬럼으로 데이터를 파티셔닝하지 마십시오. 대신, 클라이언트 식별자나 이름을 ORDER BY 표현식의 첫 번째 컬럼으로 만드십시오.

> 내부적으로 ClickHouse는 [삽입된 데이터에 대해 파트]( /guides/best-practices/sparse-primary-indexes#clickhouse-index-design)를 생성합니다. 데이터가 더 많이 삽입됨에 따라 파트 수가 증가합니다. 쿼리 성능을 저하시킬 수 있는 지나치게 많은 파트를 방지하기 위해, 파트는 백그라운드 비동기 프로세스에서 결합됩니다. 파트 수가 사전 구성된 한도를 초과하면 ClickHouse는 삽입 시 "너무 많은 파트" 오류를 발생시킵니다. 이는 정상적으로 발생해서는 안 되며 ClickHouse가 잘못 구성되거나 잘못 사용될 경우에만 발생합니다. 예를 들어, 많은 소규모 삽입이 이루어질 수 있습니다.

> 파트는 파티션별로 독립적으로 생성되므로, 파티션 수가 증가하면 파트 수가 증가하게 됩니다. 즉, 이것은 파티션 수의 배수입니다. 높은 카디널리티 파티셔닝 키는 따라서 이 오류를 야기할 수 있으며 피해야 합니다.

## 물리화된 뷰vs 프로젝션 {#materialized-views-vs-projections}

Postgres는 단일 테이블에서 여러 인덱스를 생성할 수 있게 하여 다양한 접근 패턴을 위한 최적화를 가능하게 합니다. 이러한 유연성은 관리자가 특정 쿼리 및 운영 요구에 맞게 데이터베이스 성능을 조정할 수 있게 합니다. ClickHouse의 프로젝션 개념은 전적으로 유사하지 않지만 사용자가 테이블에 대해 여러 `ORDER BY` 절을 지정할 수 있게 합니다.

ClickHouse의 [데이터 모델링 문서](/data-modeling/schema-design)에서는 물리화된 뷰를 ClickHouse에서 집계, 행 변환 및 다양한 접근 패턴에 대한 쿼리 최적화를 미리 계산하는 데 어떻게 활용할 수 있는지 설명합니다.

이 중 후자는 물리화된 뷰가 `PostId`에 대해 다른 정렬 키를 가진 대상 테이블로 행을 전송하는 [예시](/materialized-view/incremental-materialized-view#lookup-table)를 제공합니다.

예를 들어, 다음 쿼리를 고려하십시오:

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

이 쿼리는 `UserId`가 정렬 키가 아니기 때문에 모든 9000만 행을 스캔해야 합니다(확실히 빠르게). 
이전에는 `PostId`에 대한 조회 작업을 수행하는 물리화된 뷰를 사용하여 이 문제를 해결했습니다. 같은 문제는 [프로젝션](/data-modeling/projections)으로 해결할 수 있습니다. 아래 명령은 `ORDER BY user_id`에 대한 프로젝션을 추가합니다.

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

먼저 프로젝션을 생성한 다음 이를 물리화해야 한다는 점에 유의하십시오. 이 후자는 데이터를 두 가지 다른 순서로 디스크에 두 번 저장하도록 합니다. 데이터 생성 시에도 프로젝션을 정의할 수 있으며, 아래와 같이 데이터가 삽입되고 유지 관리됩니다.

```sql
CREATE TABLE comments
(
        `Id` UInt32,
        `PostId` UInt32,
        `Score` UInt16,
        `Text` String,
        `CreationDate` DateTime64(3, 'UTC'),
        `UserId` Int32,
        `UserDisplayName` LowCardinality(String),
        PROJECTION comments_user_id
        (
        SELECT *
        ORDER BY UserId
        )
)
ENGINE = MergeTree
ORDER BY PostId
```

`ALTER`를 통해 프로젝션이 생성되면 `MATERIALIZE PROJECTION` 명령이 발행될 때 비동기적으로 생성됩니다. 사용자는 다음 쿼리로 이 작업의 진행 상황을 확인할 수 있으며, `is_done=1`을 기다립니다.

```sql
SELECT
        parts_to_do,
        is_done,
        latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │           1 │       0 │                    │
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

위의 쿼리를 반복하면 추가 스토리지 비용을 감수하면서 성능이 크게 개선되었음을 확인할 수 있습니다.

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

`EXPLAIN` 명령을 사용하여 이 쿼리에서 프로젝션이 사용되었음을 확인할 수도 있습니다:

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

    ┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))         │
 2. │   Aggregating                                       │
 3. │   Filter                                            │
 4. │           ReadFromMergeTree (comments_user_id)      │
 5. │           Indexes:                                  │
 6. │           PrimaryKey                                │
 7. │           Keys:                                     │
 8. │           UserId                                    │
 9. │           Condition: (UserId in [8592047, 8592047]) │
10. │           Parts: 2/2                                │
11. │           Granules: 2/11360                         │
    └─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

### 프로젝션을 사용할 때 {#when-to-use-projections}

프로젝션은 데이터가 삽입됨에 따라 자동으로 유지 관리되는 매력적인 기능으로 사용자는 단일 테이블로 쿼리를 보낼 수 있으며, 필요한 경우 프로젝션을 활용하여 응답 시간을 단축할 수 있습니다.

<Image img={postgres_projections} size="md" alt="ClickHouse에서의 PostgreSQL 프로젝션"/>

이는 사용자에게 적합한 최적화된 대상 테이블을 선택하거나 필터에 따라 쿼리를 재작성해야 하는 물리화된 뷰와는 대조적입니다. 이는 사용자 애플리케이션에 더 큰 강조를 두고 클라이언트 측의 복잡성을 증가시킵니다.

이러한 장점에도 불구하고, 프로젝션에는 사용자가 인지해야 하는 [고유한 제한 사항](/data-modeling/projections#when-to-use-projections)이 있으므로 신중하게 배포해야 합니다.

다음과 같은 경우에 프로젝션을 사용하는 것이 좋습니다:

- 데이터의 완전한 재정렬이 필요한 경우입니다. 프로젝션의 표현식이 이론적으로는 `GROUP BY`를 사용할 수 있지만, 물리화된 뷰는 집계를 유지하는 데 더 효과적입니다. 또한 쿼리 최적화기는 단순한 재정렬을 사용하는 프로젝션을 활용할 가능성이 더 높습니다. 즉, `SELECT * ORDER BY x`. 사용자는 저장소 공간을 줄이기 위해 이 표현식에서 일부 컬럼을 선택할 수 있습니다.
- 사용자가 두 번의 데이터 작성을 수반하는 스토리지 비용 증가를 감수할 수 있을 때입니다. 삽입 속도에 미치는 영향을 테스트하고, [스토리지 오버헤드](/data-compression/compression-in-clickhouse)를 평가하십시오.

:::note
버전 25.5부터 ClickHouse는 프로젝션 내에서 가상 컬럼 `_part_offset`을 지원합니다. 이는 프로젝션을 저장하는 보다 공간 효율적인 방법을 제공합니다.

자세한 내용은 ["프로젝션"](/data-modeling/projections)를 참조하십시오.
:::

## 비정규화 {#denormalization}

Postgres는 관계형 데이터베이스이므로 데이터 모델은 일반적으로 수백 개의 테이블을 포함하여 상당히 [정규화](https://en.wikipedia.org/wiki/Database_normalization)됩니다. ClickHouse에서는 JOIN 성능을 최적화하기 위해 때때로 비정규화하는 것이 유용할 수 있습니다.

이 [가이드](/data-modeling/denormalization)에서는 ClickHouse에서 Stack Overflow 데이터 세트를 비정규화하는 이점을 보여줍니다.

이로써 Postgres에서 ClickHouse로 마이그레이션하는 사용자에 대한 기본 가이드를 마칩니다. Postgres에서 마이그레이션하는 사용자에게는 [ClickHouse에서 데이터를 모델링하기 위한 가이드](/data-modeling/schema-design)를 읽어 ClickHouse의 고급 기능에 대해 자세히 알아볼 것을 권장합니다.
