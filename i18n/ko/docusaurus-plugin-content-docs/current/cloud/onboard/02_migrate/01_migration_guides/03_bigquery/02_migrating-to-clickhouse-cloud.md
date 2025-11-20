---
'title': 'BigQuery에서 ClickHouse Cloud로 마이그레이션하기'
'slug': '/migrations/bigquery/migrating-to-clickhouse-cloud'
'description': 'BigQuery에서 ClickHouse Cloud로 데이터를 마이그레이션하는 방법'
'keywords':
- 'BigQuery'
'show_related_blogs': true
'sidebar_label': '마이그레이션 가이드'
'doc_type': 'guide'
---

import bigquery_2 from '@site/static/images/migrations/bigquery-2.png';
import bigquery_3 from '@site/static/images/migrations/bigquery-3.png';
import bigquery_4 from '@site/static/images/migrations/bigquery-4.png';
import bigquery_5 from '@site/static/images/migrations/bigquery-5.png';
import bigquery_6 from '@site/static/images/migrations/bigquery-6.png';
import bigquery_7 from '@site/static/images/migrations/bigquery-7.png';
import bigquery_8 from '@site/static/images/migrations/bigquery-8.png';
import bigquery_9 from '@site/static/images/migrations/bigquery-9.png';
import bigquery_10 from '@site/static/images/migrations/bigquery-10.png';
import bigquery_11 from '@site/static/images/migrations/bigquery-11.png';
import bigquery_12 from '@site/static/images/migrations/bigquery-12.png';
import Image from '@theme/IdealImage';

## Why use ClickHouse Cloud over BigQuery? {#why-use-clickhouse-cloud-over-bigquery}

TLDR: ClickHouse는 현대 데이터 분석을 위해 BigQuery보다 더 빠르고, 저렴하며, 강력하기 때문입니다:

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## Loading data from BigQuery to ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}

### Dataset {#dataset}

BigQuery에서 ClickHouse Cloud로의 전형적인 마이그레이션을 보여주기 위해 예제 데이터셋으로 Stack Overflow 데이터셋을 사용합니다. 이 데이터셋은 2008년부터 2024년 4월까지 Stack Overflow에서 발생한 모든 `post`, `vote`, `user`, `comment`, `badge`를 포함하고 있습니다. 이 데이터에 대한 BigQuery 스키마는 아래에 나타나 있습니다:

<Image img={bigquery_3} size="lg" alt="Schema"/>

이 데이터셋을 BigQuery 인스턴스에 채우고 마이그레이션 단계를 테스트하고자 하는 사용자에게는 GCS 버킷에 Parquet 형식으로 데이터를 제공하며, BigQuery에서 테이블을 생성하고 로드하는 DDL 명령은 [여기](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==)에서 확인할 수 있습니다.

### Migrating data {#migrating-data}

BigQuery와 ClickHouse Cloud 간의 데이터 마이그레이션은 두 가지 주요 작업 유형으로 나뉩니다:

- **초기 대량 로드 및 주기적 업데이트** - 초기 데이터셋을 마이그레이션해야 하며, 정해진 간격(예: 매일)으로 주기적인 업데이트가 필요합니다. 여기서 업데이트는 변경된 행을 다시 전송하여 처리합니다 - 비교할 수 있는 열(예: 날짜)을 사용하여 식별됩니다. 삭제는 데이터셋의 주기적 완전 로드를 통해 처리됩니다.
- **실시간 복제 또는 CDC** - 초기 데이터셋을 마이그레이션해야 하며, 이 데이터셋의 변경 사항은 ClickHouse에 거의 실시간으로 반영되어야 하며, 몇 초의 지연만 허용됩니다. 이는 실제로 [변경 데이터 캡처(CDC) 프로세스](https://en.wikipedia.org/wiki/Change_data_capture)로, BigQuery의 테이블은 ClickHouse와 동기화되어야 하며, 즉 각 BigQuery 테이블의 삽입, 업데이트 및 삭제는 ClickHouse의 동등한 테이블에 적용되어야 합니다.

#### Bulk loading via Google Cloud Storage (GCS) {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery는 데이터의 Google 객체 저장소(GCS)로의 내보내기를 지원합니다. 우리의 예제 데이터셋에 대해:

1. 7개의 테이블을 GCS로 내보냅니다. 그에 대한 명령은 [여기](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==)에서 확인할 수 있습니다.

2. ClickHouse Cloud에 데이터를 가져옵니다. 이를 위해 [gcs 테이블 함수](/sql-reference/table-functions/gcs)를 사용할 수 있습니다. DDL 및 가져오기 쿼리는 [여기](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==)에서 확인할 수 있습니다. ClickHouse Cloud 인스턴스는 여러 컴퓨트 노드로 구성되어 있기 때문에 `gcs` 테이블 함수 대신 [s3Cluster 테이블 함수](/sql-reference/table-functions/s3Cluster)를 사용하고 있습니다. 이 함수는 gcs 버킷과 함께 작동하며 [ClickHouse Cloud 서비스의 모든 노드를 활용하여](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) 데이터를 병렬로 로드합니다.

<Image img={bigquery_4} size="md" alt="Bulk loading"/>

이 접근 방식은 여러 가지 장점이 있습니다:

- BigQuery 내보내기 기능은 데이터 하위 집합을 내보내기 위한 필터를 지원합니다.
- BigQuery는 [Parquet, Avro, JSON, CSV](https://cloud.google.com/bigquery/docs/exporting-data) 형식으로 내보내기를 지원하며, 여러 [압축 유형](https://cloud.google.com/bigquery/docs/exporting-data)을 지원합니다 - 모든 것은 ClickHouse에서 지원됩니다.
- GCS는 [객체 생애 주기 관리](https://cloud.google.com/storage/docs/lifecycle)를 지원하며, ClickHouse로 내보내고 가져온 데이터를 지정된 기간 후에 삭제할 수 있습니다.
- [Google은 하루에 최대 50TB를 무료로 GCS로 내보낼 수 있도록 허용합니다](https://cloud.google.com/bigquery/quotas#export_jobs). 사용자 는 GCS 저장소에 대해서만 요금을 지불합니다.
- 내보내기는 자동으로 여러 파일을 생성하며, 각 파일의 최대 테이블 데이터 용량은 1GB로 제한됩니다. 이는 ClickHouse에 유리하여 가져오기를 병렬화할 수 있습니다.

다음 예제를 시도하기 전에 사용자는 내보내기 및 가져오기 성능을 극대화하기 위해 [내보내기에 필요한 권한](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) 및 [지역성 권장 사항](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)을 검토할 것을 권장합니다.

### Real-time replication or CDC via scheduled queries {#real-time-replication-or-cdc-via-scheduled-queries}

변경 데이터 캡처(CDC)는 두 데이터베이스 간에 테이블을 동기화하는 과정입니다. 여기에 실시간으로 업데이트 및 삭제가 처리되어야 하므로 상당히 복잡합니다. 한 가지 접근 방식은 단순히 BigQuery의 [예약 쿼리 기능](https://cloud.google.com/bigquery/docs/scheduling-queries)을 사용하여 주기적으로 내보내기를 예약하는 것입니다. ClickHouse에 데이터가 삽입되는 데 다소 지연이 허용된다면 이 접근 방식은 구현 및 유지 관리가 용이합니다. 예시는 [이 블로그 게시물](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)에서 확인할 수 있습니다.

## Designing schemas {#designing-schemas}

Stack Overflow 데이터셋에는 여러 관련 테이블이 포함되어 있습니다. 우리는 먼저 기본 테이블의 마이그레이션에 집중할 것을 권장합니다. 이 테이블은 반드시 가장 큰 테이블일 필요는 없으며, 오히려 가장 많은 분석 쿼리를 받을 것으로 예상되는 테이블입니다. 이는 ClickHouse의 주요 개념에 익숙해질 수 있게 해줍니다. 이 테이블은 추가 테이블이 추가됨에 따라 ClickHouse 기능을 최대한 활용하고 최적의 성능을 얻기 위해 리모델링이 필요할 수 있습니다. 이 모델링 프로세스는 [데이터 모델링 문서](/data-modeling/schema-design#next-data-modeling-techniques)에서 살펴봅니다.

이 원칙을 준수하여, 우리는 주요 `posts` 테이블에 집중합니다. 이에 대한 BigQuery 스키마는 아래에 나타나 있습니다:

```sql
CREATE TABLE stackoverflow.posts (
    id INTEGER,
    posttypeid INTEGER,
    acceptedanswerid STRING,
    creationdate TIMESTAMP,
    score INTEGER,
    viewcount INTEGER,
    body STRING,
    owneruserid INTEGER,
    ownerdisplayname STRING,
    lasteditoruserid STRING,
    lasteditordisplayname STRING,
    lasteditdate TIMESTAMP,
    lastactivitydate TIMESTAMP,
    title STRING,
    tags STRING,
    answercount INTEGER,
    commentcount INTEGER,
    favoritecount INTEGER,
    conentlicense STRING,
    parentid STRING,
    communityowneddate TIMESTAMP,
    closeddate TIMESTAMP
);
```

### Optimizing types {#optimizing-types}

[여기](https://data-modeling/schema-design)에서 설명한 프로세스를 적용하면 다음과 같은 스키마가 생성됩니다:

```sql
CREATE TABLE stackoverflow.posts
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   `AcceptedAnswerId` UInt32,
   `CreationDate` DateTime,
   `Score` Int32,
   `ViewCount` UInt32,
   `Body` String,
   `OwnerUserId` Int32,
   `OwnerDisplayName` String,
   `LastEditorUserId` Int32,
   `LastEditorDisplayName` String,
   `LastEditDate` DateTime,
   `LastActivityDate` DateTime,
   `Title` String,
   `Tags` String,
   `AnswerCount` UInt16,
   `CommentCount` UInt8,
   `FavoriteCount` UInt8,
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Optimized types'
```

이 테이블에 데이터를 채우기 위해 간단한 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into)를 사용하여 gcs에서 내보낸 데이터를 읽을 수 있습니다. ClickHouse Cloud에서는 여러 노드에 걸쳐 로딩을 병렬화하기 위해 gcs 호환 [`s3Cluster` 테이블 함수](/sql-reference/table-functions/s3Cluster)도 사용할 수 있습니다:

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

우리는 새로운 스키마에서 어떤 Nullable도 유지하지 않습니다. 위의 삽입은 이를 해당 유형의 기본값으로 암묵적으로 변환합니다 - 정수의 경우 0, 문자열의 경우 빈 값입니다. ClickHouse는 또한 자동으로 모든 숫자를 대상 정밀도로 변환합니다.

## How are ClickHouse Primary keys different? {#how-are-clickhouse-primary-keys-different}

[여기](https://migrations/bigquery)에서 설명한 대로, BigQuery와 마찬가지로 ClickHouse는 테이블의 기본 키 열 값에 대해 고유성을 강제하지 않습니다.

BigQuery의 클러스터링과 유사하게, ClickHouse 테이블의 데이터는 기본 키 열에 의해 디스크에 정렬되어 저장됩니다. 이 정렬 순서는 쿼리 최적화 프로그램에서 리소팅을 방지하고 조인에 대한 메모리 사용을 최소화하며, 제한 절에 대한 단축 회로를 가능하게 하는 데 사용됩니다. ClickHouse는 기본 키 열 값을 기반으로 [희소 기본 인덱스](https://guides/best-practices/sparse-primary-indexes)를 자동으로 생성합니다. 이 인덱스는 기본 키 열에 필터가 포함된 모든 쿼리를 가속화하는 데 사용됩니다. 구체적으로:

- 메모리와 디스크 효율성은 ClickHouse가 자주 사용되는 규모에 매우 중요합니다. 데이터는 'parts'로 알려진 청크로 ClickHouse 테이블에 기록되며, 백그라운드에서 파트를 병합하는 규칙이 적용됩니다. ClickHouse에서 각 파트는 자체 기본 인덱스를 가지고 있습니다. 파트가 병합될 때, 병합된 파트의 기본 인덱스도 함께 병합됩니다. 이 인덱스는 각 행에 대해 생성되지 않습니다. 대신, 파트의 기본 인덱스는 행 그룹당 하나의 인덱스 항목을 가지고 있습니다 - 이 기술을 희소 인덱싱이라고 합니다.
- 희소 인덱싱은 ClickHouse가 파트의 행을 지정된 키에 따라 디스크에 순서대로 저장하기 때문에 가능합니다. 개별 행을 직접 찾는 대신 (B-Tree 기반 인덱스처럼), 희소 기본 인덱스는 빠르게 (인덱스 항목에 대한 이진 검색을 통해) 쿼리에 잠재적으로 일치할 수 있는 행 그룹을 식별할 수 있습니다. 발견된 잠재적 일치 행 그룹은 ClickHouse 엔진으로 비슷한 순서로 스트리밍되어 일치를 찾습니다. 이러한 인덱스 설계는 기본 인덱스를 작게 유지할 수 있게 하며(메인 메모리에 완전히 적재 가능) 쿼리 실행 시간을 상당히 단축시킵니다, 특히 데이터 분석 사용 사례에서 일반적인 범위 쿼리에 대해 더욱 그렇습니다. 더 자세한 내용은 [이 심층 가이드](https://guides/best-practices/sparse-primary-indexes)를 권장합니다.

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

ClickHouse에서 선택한 기본 키는 인덱스뿐만 아니라 디스크에 데이터가 기록되는 순서도 결정합니다. 이로 인해 압축 수준에 중대한 영향을 미칠 수 있으며, 이는 쿼리 성능에 영향을 미칠 수 있습니다. 대부분의 열 값이 연속적으로 기록되도록 하는 정렬 키는 선택된 압축 알고리즘(및 코덱)이 데이터를 더 효과적으로 압축하도록 합니다.

> 테이블의 모든 열은 지정된 정렬 키의 값에 따라 정렬됩니다. 정렬 키에 포함되지 않은 경우에도 해당합니다. 예를 들어, `CreationDate`를 키로 사용하는 경우, 모든 다른 열의 값 순서는 `CreationDate` 열의 값 순서에 해당합니다. 여러 개의 정렬 키를 지정할 수 있습니다 - 이는 `SELECT` 쿼리의 `ORDER BY` 절과 동일한 의미로 정렬됩니다.

### Choosing an ordering key {#choosing-an-ordering-key}

정렬 키 선택 시 고려사항 및 단계에 대해 posts 테이블을 예로 들어 [여기](https://data-modeling/schema-design#choosing-an-ordering-key)에서 확인하세요.

## Data modeling techniques {#data-modeling-techniques}

BigQuery에서 마이그레이션하는 사용자에게는 [ClickHouse에서 데이터 모델링 가이드](https://data-modeling/schema-design)를 읽어볼 것을 권장합니다. 이 가이드는 동일한 Stack Overflow 데이터셋을 사용하여 ClickHouse 기능을 활용하는 여러 접근 방식을 탐구합니다.

### Partitions {#partitions}

BigQuery 사용자는 테이블을 더 작은 관리 가능한 파트로 나누어 성능과 관리성을 향상시키는 테이블 파티셔닝 개념에 익숙할 것입니다. 이 파티셔닝은 지정된 열(예: 날짜)의 범위, 정의된 목록 또는 키에 대한 해시를 사용하여 수행할 수 있습니다. 이를 통해 관리자는 날짜 범위나 지리적 위치와 같은 특정 기준에 따라 데이터를 구성할 수 있습니다.

파티셔닝은 파티션 프루닝(Partition Pruning)을 통해 더 빠른 데이터 접근을 가능하게 하여 쿼리 성능을 향상시키며, 백업 및 데이터 정리를 포함한 유지 관리 작업을 개선합니다. 개별 파티션에서 작업을 수행할 수 있게 해줍니다. 또한, 파티셔닝은 BigQuery 데이터베이스의 확장성을 크게 향상시켜 여러 파티션에 부하를 분산시킬 수 있습니다.

ClickHouse에서는 테이블이 처음 정의될 때 [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 절을 통해 파티셔닝이 지정됩니다. 이 절은 SQL 표현식을 포함할 수 있으며, 이 표현식의 결과는 어떤 파티션으로 행이 전송될지를 정의합니다.

<Image img={bigquery_6} size="md" alt="Partitions"/>

데이터 파트는 디스크의 각 파티션과 논리적으로 연결되어 있으며, 개별적으로 쿼리될 수 있습니다. 아래의 예에서는 `toYear(CreationDate)` 표현식을 사용하여 posts 테이블을 연도로 파티셔닝합니다. ClickHouse에 행이 삽입되면 이 표현식은 각 행에 대해 평가되며, 그 결과에 따라 새로운 데이터 파트가 해당 파티션의 일부로 라우팅됩니다.

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

#### Applications {#applications}

ClickHouse의 파티셔닝은 BigQuery와 유사한 응용 프로그램을 가지고 있지만 미세한 차이가 있습니다. 구체적으로:

- **데이터 관리** - ClickHouse에서는 사용자가 주로 파티셔닝을 데이터 관리 기능으로 고려해야 하며, 쿼리 최적화 기법이 아닙니다. 키를 기준으로 데이터를 논리적으로 분리함으로써 각 파티션을 독립적으로 운영할 수 있습니다(예: 삭제). 이를 통해 사용자는 파티션을 이동시키고, 따라서 하위 집합을 [스토리지 계층](/integrations/s3#storage-tiers) 간에 효율적으로 이동할 수 있습니다. 예를 들어, 아래에서는 2008년의 게시물을 삭제합니다:

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

- **쿼리 최적화** - 파티션은 쿼리 성능을 도울 수 있지만, 이는 액세스 패턴에 크게 의존합니다. 쿼리가 몇 개의 파티션(이상적으로는 하나)만을 타겟팅하는 경우 성능이 개선될 수 있습니다. 이는 파티셔닝 키가 기본 키에 포함되지 않고 이를 기반으로 필터링할 때만 일반적으로 유용합니다. 그러나, 많은 파티션을 포함해야 하는 쿼리는 파티셔닝이 없는 경우보다 성능이 저하될 수 있습니다(파티셔닝의 결과로 파트가 더 많을 수 있기 때문입니다). 단일 파티션을 타겟팅하는 이점은 파티셔닝 키가 이미 기본 키의 초기 항목인 경우 그 효과가 미미해질 수 있습니다. 파티셔닝은 또한 각 파티션의 값이 고유한 경우 [GROUP BY 쿼리를 최적화하는 데](https://engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key) 사용될 수 있습니다. 그러나 일반적으로 사용자는 기본 키가 최적화되었는지 확인해야 하며, 액세스 패턴이 특정 예측 가능한 하위 집합에 대한 경우(예: 일자별 파티셔닝)와 같은 예외적인 경우에만 파티셔닝을 쿼리 최적화 기법으로 고려해야 합니다.

#### Recommendations {#recommendations}

사용자는 파티셔닝을 데이터 관리 기법으로 고려해야 합니다. 주로 시간 시퀀스 데이터로 작업할 때 클러스터에서 데이터를 만료시킬 필요가 있을 때 이상적입니다. 예를 들어, 가장 오래된 파티션을 [단순히 삭제할 수 있습니다](/sql-reference/statements/alter/partition#drop-partitionpart).

중요: 파티셔닝 키 표현이 높은 기수 집합을 생성하지 않도록 해야 합니다. 즉, 100개 이상의 파티션을 만드는 것은 피해야 합니다. 예를 들어, 클라이언트 식별자 또는 이름과 같은 높은 기수 열로 데이터를 파티셔닝하지 마십시오. 대신 클라이언트 식별자나 이름을 `ORDER BY` 표현식의 첫 번째 열로 만듭니다.

> 내부적으로 ClickHouse는 삽입된 데이터에 대해 [parts를 생성합니다](https://guides/best-practices/sparse-primary-indexes#clickhouse-index-design). 더 많은 데이터가 삽입되면 파트의 수가 증가합니다. 쿼리 성능이 저하되지 않도록 과도한 파트 수를 방지하기 위해, 파트는 백그라운드 비동기 프로세스에서 병합됩니다. 파트 수가 [사전 구성된 한도를 초과하면](https://operations/settings/merge-tree-settings#parts_to_throw_insert), ClickHouse는 삽입 시 ["너무 많은 파트" 오류](https://knowledgebase/exception-too-many-parts)를 발생시킵니다. 이는 정상적인 작업 조건에서는 발생하지 않아야 하며, ClickHouse가 잘못 구성되었거나 잘못 사용되었을 때만 발생합니다(예: 너무 많은 소규모 삽입). 파트가 파티션 별로 독립적으로 만들어지므로, 파티션 수가 증가할수록 파트 수는 증가하게 됩니다. 따라서 높은 기수 파티셔닝 키는 이 오류를 유발할 수 있으므로 피해야 합니다.

## Materialized views vs projections {#materialized-views-vs-projections}

ClickHouse의 프로젝션 개념을 통해 사용자는 테이블에 대해 여러 `ORDER BY` 절을 지정할 수 있습니다.

[ClickHouse 데이터 모델링](/data-modeling/schema-design)에서는 물리화된 뷰를 ClickHouse에서 사용하여 집계 항목을 미리 계산하고, 행을 변환하며, 다양한 접근 패턴에 대한 쿼리를 최적화하는 방법을 탐구합니다. 후자의 경우, 우리는 [예시](https://materialized-view/incremental-materialized-view#lookup-table)를 제공하여 물리화된 뷰가 다른 정렬 키와 함께 대상 테이블로 행을 전송하는 방법을 보여줍니다.

예를 들어, 다음 쿼리를 고려해보세요:

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

이 쿼리는 모든 90m 행을 스캔해야 하며(빠르게, 비록), `UserId`가 정렬 키가 아닙니다. 이전에 우리는 `PostId`를 조회하는 물리화된 뷰를 사용하여 이 문제를 해결했습니다. 같은 문제는 프로젝션으로도 해결할 수 있습니다. 아래 명령은 `ORDER BY user_id`를 가진 프로젝션을 추가합니다.

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

여기서 우리는 먼저 프로젝션을 생성한 다음 물리화해야 합니다. 후자의 명령은 데이터를 두 개의 서로 다른 방식으로 디스크에 두 번 저장하게 만듭니다. 또한, 데이터 생성 시 프로젝션을 정의할 수 있으며 아래와 같이 표시되며 데이터가 삽입되는 대로 자동으로 유지 관리됩니다.

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
    --highlight-begin
    PROJECTION comments_user_id
    (
    SELECT *
    ORDER BY UserId
    )
    --highlight-end
)
ENGINE = MergeTree
ORDER BY PostId
```

프로젝션이 `ALTER` 명령을 통해 생성되는 경우, `MATERIALIZE PROJECTION` 명령이 발행될 때 생성은 비동기입니다. 사용자는 다음 쿼리로 이 작업의 진행 상황을 확인할 수 있으며, `is_done=1`이 될 때까지 기다립니다.

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

앞의 쿼리를 반복하면 성능이 추가 저장소를 희생하고 상당히 향상된 것을 확인할 수 있습니다.

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

[`EXPLAIN` 명령](/sql-reference/statements/explain)을 통해, 이 쿼리를 처리하기 위해 프로젝션이 사용되었음을 확인할 수 있습니다:

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

### When to use projections {#when-to-use-projections}

프로젝션은 데이터가 삽입될 때 자동으로 유지 관리되기 때문에 새로운 사용자에게 매력적인 기능입니다. 또한 쿼리는 가능한 경우 프로젝션이 활용되는 단일 테이블로 전송될 수 있어 응답 시간을 단축시킵니다.

<Image img={bigquery_7} size="md" alt="Projections"/>

이것은 사용자가 적절한 최적화된 대상 테이블을 선택하거나 필터에 따라 쿼리를 다시 작성해야 하는 물리화된 뷰와 대조적입니다. 이는 사용자 애플리케이션에 더 큰 강조를 두며 클라이언트 측 복잡성을 증가시킵니다.

하지만 이러한 장점에도 불구하고 프로젝션은 사용자가 알고 있어야 하는 고유한 제한사항이 있으며, 따라서 신중하게 배포해야 합니다. 자세한 내용은 ["물리화된 뷰 대 프로젝션"](/managing-data/materialized-views-versus-projections)를 참조하십시오.

우리는 다음과 같은 경우 프로젝션을 사용하는 것을 권장합니다:

- 데이터의 완전한 재배치가 필요한 경우. 프로젝션의 표현식이 이론적으로 `GROUP BY`를 사용할 수 있지만, 물리화된 뷰는 집계를 유지하는 데 더 효과적입니다. 쿼리 최적화기는 일반적으로 간단한 재배치(즉, `SELECT * ORDER BY x`)를 사용하는 프로젝션을 활용하는 경향이 높습니다. 사용자는 이 표현식에서 컬럼의 하위 집합을 선택하여 저장소 발자국을 줄일 수 있습니다.
- 사용자가 데이터 두 번 쓰기와 관련된 저장소 발자국 증가 및 오버헤드를 편안하게 여기는 경우. 삽입 속도에 미치는 영향을 테스트하고 [저장소 오버헤드를 평가하십시오](/data-compression/compression-in-clickhouse).

## Rewriting BigQuery queries in ClickHouse {#rewriting-bigquery-queries-in-clickhouse}

다음은 BigQuery와 ClickHouse를 비교하는 예제 쿼리입니다. 이 목록은 ClickHouse 기능을 활용하여 쿼리를 크게 단순화하는 방법을 보여주기 위한 것입니다. 여기의 예시는 전체 Stack Overflow 데이터셋(2024년 4월까지)을 사용합니다.

**가장 많은 조회를 받은 사용자(질문이 10개 이상인):**

_BigQuery_

<Image img={bigquery_8} size="sm" alt="Rewriting BigQuery queries" border/>

_ClickHouse_

```sql
SELECT
    OwnerDisplayName,
    sum(ViewCount) AS total_views
FROM stackoverflow.posts
WHERE (PostTypeId = 'Question') AND (OwnerDisplayName != '')
GROUP BY OwnerDisplayName
HAVING count() > 10
ORDER BY total_views DESC
LIMIT 5

   ┌─OwnerDisplayName─┬─total_views─┐
1. │ Joan Venge       │    25520387 │
2. │ Ray Vega         │    21576470 │
3. │ anon             │    19814224 │
4. │ Tim              │    19028260 │
5. │ John             │    17638812 │
   └──────────────────┴─────────────┘

5 rows in set. Elapsed: 0.076 sec. Processed 24.35 million rows, 140.21 MB (320.82 million rows/s., 1.85 GB/s.)
Peak memory usage: 323.37 MiB.
```

**가장 많은 조회를 받은 태그:**

_BigQuery_

<br />

<Image img={bigquery_9} size="sm" alt="BigQuery 1" border/>

_ClickHouse_

```sql
-- ClickHouse
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tags,
    sum(ViewCount) AS views
FROM stackoverflow.posts
GROUP BY tags
ORDER BY views DESC
LIMIT 5

   ┌─tags───────┬──────views─┐
1. │ javascript │ 8190916894 │
2. │ python     │ 8175132834 │
3. │ java       │ 7258379211 │
4. │ c#         │ 5476932513 │
5. │ android    │ 4258320338 │
   └────────────┴────────────┘

5 rows in set. Elapsed: 0.318 sec. Processed 59.82 million rows, 1.45 GB (188.01 million rows/s., 4.54 GB/s.)
Peak memory usage: 567.41 MiB.
```

## Aggregate functions {#aggregate-functions}

가능한 경우 사용자는 ClickHouse 집계 함수를 활용해야 합니다. 아래에서는 [`argMax` 함수](/sql-reference/aggregate-functions/reference/argmax)를 사용하여 매년 가장 많이 조회된 질문을 계산하는 예를 보여줍니다.

_BigQuery_

<Image img={bigquery_10} border size="sm" alt="Aggregate functions 1"/>

<Image img={bigquery_11} border size="sm" alt="Aggregate functions 2"/>

_ClickHouse_

```sql
-- ClickHouse
SELECT
    toYear(CreationDate) AS Year,
    argMax(Title, ViewCount) AS MostViewedQuestionTitle,
    max(ViewCount) AS MaxViewCount
FROM stackoverflow.posts
WHERE PostTypeId = 'Question'
GROUP BY Year
ORDER BY Year ASC
FORMAT Vertical

Row 1:
──────
Year:                    2008
MostViewedQuestionTitle: How to find the index for a given item in a list?
MaxViewCount:            6316987

Row 2:
──────
Year:                    2009
MostViewedQuestionTitle: How do I undo the most recent local commits in Git?
MaxViewCount:            13962748

...

Row 16:
───────
Year:                    2023
MostViewedQuestionTitle: How do I solve "error: externally-managed-environment" every time I use pip 3?
MaxViewCount:            506822

Row 17:
───────
Year:                    2024
MostViewedQuestionTitle: Warning "Third-party cookie will be blocked. Learn more in the Issues tab"
MaxViewCount:            66975

17 rows in set. Elapsed: 0.225 sec. Processed 24.35 million rows, 1.86 GB (107.99 million rows/s., 8.26 GB/s.)
Peak memory usage: 377.26 MiB.
```

## Conditionals and arrays {#conditionals-and-arrays}

조건부 및 배열 함수는 쿼리를 상당히 간단하게 만듭니다. 다음 쿼리는 2022년에서 2023년 사이에 가장 큰 비율 증가를 보인 태그(출현이 10000회 이상)를 계산합니다. 다음 ClickHouse 쿼리가 조건부, 배열 함수, `HAVING` 및 `SELECT` 절에서 별칭을 재사용할 수 있는 능력 덕분에 간결함을 보여줍니다.

_BigQuery_

<Image img={bigquery_12} size="sm" border alt="Conditionals and Arrays"/>

_ClickHouse_

```sql
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tag,
    countIf(toYear(CreationDate) = 2023) AS count_2023,
    countIf(toYear(CreationDate) = 2022) AS count_2022,
    ((count_2023 - count_2022) / count_2022) * 100 AS percent_change
FROM stackoverflow.posts
WHERE toYear(CreationDate) IN (2022, 2023)
GROUP BY tag
HAVING (count_2022 > 10000) AND (count_2023 > 10000)
ORDER BY percent_change DESC
LIMIT 5

┌─tag─────────┬─count_2023─┬─count_2022─┬──────percent_change─┐
│ next.js     │      13788 │      10520 │   31.06463878326996 │
│ spring-boot │      16573 │      17721 │  -6.478189718413183 │
│ .net        │      11458 │      12968 │ -11.644046884639112 │
│ azure       │      11996 │      14049 │ -14.613139725247349 │
│ docker      │      13885 │      16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘

5 rows in set. Elapsed: 0.096 sec. Processed 5.08 million rows, 155.73 MB (53.10 million rows/s., 1.63 GB/s.)
Peak memory usage: 410.37 MiB.
```

이것으로 BigQuery에서 ClickHouse로 마이그레이션하는 사용자에 대한 기본 가이드를 마칩니다. BigQuery에서 마이그레이션하는 사용자는 고급 ClickHouse 기능에 대해 더 알고 싶다면 [ClickHouse에서 데이터 모델링에 대한 가이드](/data-modeling/schema-design)를 읽어보기를 권장합니다.
