---
title: 'BigQuery에서 ClickHouse Cloud로 마이그레이션하기'
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: 'BigQuery에서 ClickHouse Cloud로 데이터를 마이그레이션하는 방법'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: '마이그레이션 가이드'
doc_type: 'guide'
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


## BigQuery 대신 ClickHouse Cloud를 사용해야 하는 이유 \{#why-use-clickhouse-cloud-over-bigquery\}

요약: 현대 데이터 분석 워크로드에서는 ClickHouse가 BigQuery보다 더 빠르고, 더 저렴하며, 더 강력하기 때문입니다.

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## BigQuery에서 ClickHouse Cloud로 데이터 로드하기 \{#loading-data-from-bigquery-to-clickhouse-cloud\}

### 데이터세트 \{#dataset\}

BigQuery에서 ClickHouse Cloud로의 전형적인 마이그레이션 예시를 보여주기 위한 데이터세트로, [여기](/getting-started/example-datasets/stackoverflow)에 문서화된 Stack Overflow 데이터세트를 사용합니다. 이 데이터세트에는 2008년부터 2024년 4월까지 Stack Overflow에서 발생한 모든 `post`, `vote`, `user`, `comment`, `badge`가 포함되어 있습니다. 이 데이터에 대한 BigQuery 스키마는 아래와 같습니다:

<Image img={bigquery_3} size="lg" alt="Schema"/>

마이그레이션 단계를 테스트하기 위해 이 데이터세트를 BigQuery 인스턴스에 적재하고자 하는 사용자를 위해, GCS 버킷에 Parquet 형식의 테이블 데이터를 제공하며 BigQuery에서 테이블을 생성하고 적재하기 위한 DDL 명령은 [여기](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==)에서 확인할 수 있습니다.

### 데이터 마이그레이션 \{#migrating-data\}

BigQuery와 ClickHouse Cloud 간 데이터 마이그레이션은 두 가지 주요 워크로드 유형으로 나눌 수 있습니다.

- **초기 대량 적재 및 주기적 업데이트** - 초기 데이터셋을 마이그레이션한 뒤, 예를 들어 매일과 같이 지정된 간격으로 주기적으로 업데이트해야 합니다. 이때 업데이트는 변경된 행을 다시 전송하는 방식으로 처리하며, 비교에 사용할 수 있는 컬럼(예: 날짜)을 통해 변경된 행을 식별합니다. 삭제는 전체 데이터셋을 주기적으로 완전히 다시 적재하는 방식으로 처리합니다.
- **실시간 복제 또는 CDC** - 초기 데이터셋을 먼저 마이그레이션해야 합니다. 이후 이 데이터셋에 대한 변경 사항은 수 초 정도의 지연만 허용되는 거의 실시간에 가깝게 ClickHouse에 반영되어야 합니다. 이는 사실상 [Change Data Capture(변경 데이터 캡처, CDC) 프로세스](https://en.wikipedia.org/wiki/Change_data_capture)에 해당하며, BigQuery의 테이블이 ClickHouse와 동기화되어야 합니다. 즉, BigQuery 테이블에서 발생하는 insert, update, delete 작업이 ClickHouse의 동일한 테이블에 그대로 적용되어야 합니다.

#### Google Cloud Storage(GCS)를 통한 대량 적재 \{#bulk-loading-via-google-cloud-storage-gcs\}

BigQuery는 Google의 오브젝트 스토리지인 GCS로 데이터 내보내기를 지원합니다. 예제 데이터 세트의 경우 다음을 수행합니다.

1. 7개의 테이블을 GCS로 내보냅니다. 해당 명령은 [여기](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==)에서 확인할 수 있습니다.

2. 데이터를 ClickHouse Cloud로 가져옵니다. 이를 위해 [gcs table function](/sql-reference/table-functions/gcs)을 사용할 수 있습니다. DDL과 가져오기 쿼리는 [여기](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==)에서 확인할 수 있습니다. ClickHouse Cloud 인스턴스는 여러 개의 컴퓨트 노드로 구성되므로, `gcs` table function 대신 [s3Cluster table function](/sql-reference/table-functions/s3Cluster)을 사용합니다. 이 함수는 GCS 버킷에서도 동작하며, [ClickHouse Cloud 서비스의 모든 노드를 활용하여](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) 데이터를 병렬로 적재합니다.

<Image img={bigquery_4} size="md" alt="대량 적재"/>

이 접근 방식에는 여러 가지 장점이 있습니다.

- BigQuery 내보내기 기능은 일부 데이터만 선택적으로 내보낼 수 있는 필터를 지원합니다.
- BigQuery는 [Parquet, Avro, JSON, CSV](https://cloud.google.com/bigquery/docs/exporting-data) 형식과 여러 [압축 유형](https://cloud.google.com/bigquery/docs/exporting-data)으로 내보내기를 지원하며, 이는 모두 ClickHouse에서 지원됩니다.
- GCS는 [오브젝트 수명 주기 관리](https://cloud.google.com/storage/docs/lifecycle)를 지원하므로, ClickHouse로 내보내고 가져온 뒤 지정된 기간이 지나면 데이터를 삭제하도록 설정할 수 있습니다.
- [Google은 하루 최대 50TB까지 GCS로의 내보내기를 무료로 허용](https://cloud.google.com/bigquery/quotas#export_jobs)합니다. 사용자는 GCS 스토리지에 대해서만 비용을 지불하면 됩니다.
- 내보내기 시 여러 개의 파일이 자동으로 생성되며, 각 파일은 최대 1GB의 테이블 데이터로 제한됩니다. 이는 가져오기를 병렬화할 수 있으므로 ClickHouse에 유리합니다.

다음 예제를 시도하기 전에, 내보내기에 필요한 [권한](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions)과 내보내기 및 가져오기 성능을 극대화하기 위한 [데이터 위치(locality) 권장 사항](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)을 검토하는 것이 좋습니다.

### 실시간 복제 또는 예약된 쿼리를 통한 CDC \{#real-time-replication-or-cdc-via-scheduled-queries\}

Change Data Capture (CDC)는 두 데이터베이스 간의 테이블을 동기화 상태로 유지하는 프로세스를 의미합니다. 업데이트와 삭제를 거의 실시간으로 처리해야 하는 경우에는 복잡성이 상당히 증가합니다. 한 가지 접근 방식은 BigQuery의 [예약된 쿼리 기능](https://cloud.google.com/bigquery/docs/scheduling-queries)을 사용해 주기적인 내보내기를 예약하는 것입니다. 데이터가 ClickHouse에 삽입될 때까지 어느 정도 지연을 허용할 수 있다면, 이 방식은 구현과 유지 관리가 쉽습니다. 예시는 [이 블로그 포스트](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)에 나와 있습니다.

## 스키마 설계 \{#designing-schemas\}

Stack Overflow 데이터셋에는 여러 개의 연관된 테이블이 있습니다. 우선 기본 테이블(Primary table) 마이그레이션에 집중할 것을 권장합니다. 이 테이블은 반드시 가장 큰 테이블일 필요는 없으며, 분석용 쿼리가 가장 많이 실행될 것으로 예상되는 테이블이면 됩니다. 이렇게 하면 주요 ClickHouse 개념에 익숙해질 수 있습니다. 이후 다른 테이블을 추가하면서 ClickHouse 기능을 충분히 활용하고 최적의 성능을 얻기 위해, 이 테이블의 스키마를 다시 설계해야 할 수도 있습니다. 이 모델링 과정은 [데이터 모델링 문서](/data-modeling/schema-design#next-data-modeling-techniques)에서 다룹니다.

이 원칙에 따라 여기서는 주요 `posts` 테이블에 집중합니다. 이에 대한 BigQuery 스키마는 아래와 같습니다.

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


### 타입 최적화 \{#optimizing-types\}

[여기에서 설명한](/data-modeling/schema-design) 절차를 적용하면 다음과 같은 스키마가 생성됩니다.

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

[`INSERT INTO SELECT`](/sql-reference/statements/insert-into)를 사용하여 gcs에서 내보낸 데이터를 [`gcs` table function](/sql-reference/table-functions/gcs)으로 읽어 이 테이블을 간단히 채울 수 있습니다. ClickHouse Cloud에서는 gcs 호환 [`s3Cluster` table function](/sql-reference/table-functions/s3Cluster)을 사용하여 여러 노드에 걸쳐 적재를 병렬화할 수도 있습니다:

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

새 스키마에서는 null 값을 전혀 저장하지 않습니다. 위의 insert 문은 이러한 값들을 각 타입의 기본값으로 암묵적으로 변환합니다. 정수형에는 0이, 문자열에는 빈 값이 사용됩니다. 또한 ClickHouse는 모든 숫자형 값을 대상 정밀도로 자동 변환합니다.


## ClickHouse 기본 키는 어떻게 다른가요? \{#how-are-clickhouse-primary-keys-different\}

[여기](/migrations/bigquery)에 설명된 것처럼, BigQuery와 마찬가지로 ClickHouse는 테이블 기본 키 컬럼 값의 고유성을 강제하지 않습니다.

BigQuery의 클러스터링과 유사하게, ClickHouse 테이블의 데이터는 기본 키 컬럼을 기준으로 정렬된 상태로 디스크에 저장됩니다. 이 정렬 순서는 쿼리 옵티마이저에서 재정렬을 방지하고, 조인 시 메모리 사용을 최소화하며, LIMIT 절에서 쇼트서킷(short-circuiting)을 가능하게 하는 데 활용됩니다.
BigQuery와 달리, ClickHouse는 기본 키 컬럼 값을 기반으로 [희소 기본 인덱스(sparse primary index)](/guides/best-practices/sparse-primary-indexes)를 자동으로 생성합니다. 이 인덱스는 기본 키 컬럼에 대한 필터를 포함하는 모든 쿼리를 가속하는 데 사용됩니다. 구체적으로는 다음과 같습니다.

- 메모리와 디스크 효율성은 ClickHouse가 자주 사용되는 대규모 환경에서 무엇보다 중요합니다. 데이터는 ClickHouse 테이블에 파트라고 하는 청크 단위로 기록되며, 백그라운드에서 파트를 병합하는 규칙이 적용됩니다. ClickHouse에서는 각 파트가 자체 기본 인덱스를 가집니다. 파트가 병합될 때 병합된 파트의 기본 인덱스도 함께 병합됩니다. 이 인덱스는 각 행마다 생성되는 것이 아닙니다. 대신, 하나의 파트에 대한 기본 인덱스는 여러 행 그룹당 하나의 인덱스 엔트리를 가지며, 이 기법을 희소 인덱싱(sparse indexing)이라고 합니다.
- 희소 인덱싱이 가능한 이유는 ClickHouse가 파트에 속한 행들을 지정된 키를 기준으로 정렬된 상태로 디스크에 저장하기 때문입니다. 단일 행을 직접 찾는 방식(B-Tree 기반 인덱스처럼)이 아니라, 희소 기본 인덱스를 사용하면 인덱스 엔트리에 대한 이진 검색을 통해 쿼리와 일치할 가능성이 있는 행 그룹을 빠르게 식별할 수 있습니다. 이렇게 식별된, 일치 가능성이 있는 행 그룹은 병렬로 ClickHouse 엔진으로 스트리밍되어 실제 일치 항목을 찾습니다. 이러한 인덱스 설계 덕분에 기본 인덱스는 작게 유지되며(전체가 메인 메모리에 적재 가능), 동시에 쿼리 실행 시간을 크게 단축합니다. 특히 데이터 분석 사용 사례에서 일반적인 범위 쿼리의 경우에 효과적입니다. 자세한 내용은 [이 심층 가이드](/guides/best-practices/sparse-primary-indexes)를 참고하십시오.

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

ClickHouse에서 선택된 기본 키는 인덱스뿐 아니라 데이터가 디스크에 기록되는 순서도 결정합니다. 이로 인해 압축 수준에 큰 영향을 줄 수 있고, 이는 다시 쿼리 성능에 영향을 미칠 수 있습니다. 대부분의 컬럼 값이 연속된 순서로 기록되도록 하는 정렬 키를 사용하면 선택된 압축 알고리즘(및 코덱)이 데이터를 더 효과적으로 압축할 수 있습니다.

> 테이블의 모든 컬럼은, 해당 컬럼이 키에 포함되었는지 여부와 관계없이 지정된 정렬 키 값을 기준으로 정렬됩니다. 예를 들어 `CreationDate`가 키로 사용되는 경우, 다른 모든 컬럼의 값 순서는 `CreationDate` 컬럼의 값 순서와 일치하게 됩니다. 여러 개의 정렬 키를 지정할 수 있으며, 이는 `SELECT` 쿼리의 `ORDER BY` 절과 동일한 의미로 정렬을 수행합니다.

### 정렬 키 선택 \{#choosing-an-ordering-key\}

정렬 키를 선택할 때의 고려 사항과 단계는 `posts` 테이블을 예로 들어 설명한 [여기](/data-modeling/schema-design#choosing-an-ordering-key)를 참고하십시오.

## 데이터 모델링 기법 \{#data-modeling-techniques\}

BigQuery에서 마이그레이션하려는 사용자는 [ClickHouse에서 데이터를 모델링하는 가이드](/data-modeling/schema-design)를 읽을 것을 권장합니다. 이 가이드는 동일한 Stack Overflow 데이터 세트를 사용하며 ClickHouse 기능을 활용한 여러 가지 접근 방법을 다룹니다.

### 파티션 \{#partitions\}

BigQuery를 사용해 본 경우, 대규모 데이터베이스의 성능과 관리 용이성을 높이기 위해 테이블을 더 작고 관리하기 쉬운 조각인 파티션으로 나누는 테이블 파티셔닝 개념에 이미 익숙할 수 있습니다. 이러한 파티셔닝은 지정된 컬럼(예: 날짜)에 대한 범위, 정의된 목록, 또는 키에 대한 해시를 사용해 구현할 수 있습니다. 이를 통해 관리자는 날짜 범위나 지리적 위치와 같은 특정 기준에 따라 데이터를 구성할 수 있습니다.

파티셔닝은 파티션 프루닝과 보다 효율적인 인덱싱을 통해 데이터에 더 빠르게 접근할 수 있도록 하여 쿼리 성능 향상에 도움이 됩니다. 또한 전체 테이블이 아니라 개별 파티션 단위로 작업할 수 있게 해 주므로 백업 및 데이터 정리(삭제)와 같은 유지 관리 작업에도 유리합니다. 더불어, 파티셔닝은 여러 파티션에 부하를 분산하여 BigQuery 데이터베이스의 확장성을 크게 향상시킬 수 있습니다.

ClickHouse에서는 테이블을 처음 정의할 때 [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 절을 통해 파티셔닝을 지정합니다. 이 절에는 임의의 컬럼들에 대한 SQL 식을 포함할 수 있으며, 그 결과에 따라 각 행이 어떤 파티션으로 전송될지가 결정됩니다.

<Image img={bigquery_6} size="md" alt="파티션" />

데이터 파트는 디스크에서 각 파티션과 논리적으로 연관되며, 개별적으로 쿼리할 수 있습니다. 아래 예시에서는 [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toYear) 식을 사용하여 posts 테이블을 연도별로 파티셔닝합니다. 행이 ClickHouse에 삽입될 때마다 이 식이 각 행에 대해 평가되며, 그 결과에 따라 해당 파티션에 속하는 새로운 데이터 파트 형태로 행이 그 파티션으로 라우팅됩니다.

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


#### 적용 사례 \{#applications\}

ClickHouse에서의 파티셔닝은 BigQuery에서와 유사한 방식으로 활용되지만, 몇 가지 미묘한 차이가 있습니다. 보다 구체적으로는 다음과 같습니다.

* **데이터 관리** - ClickHouse에서 파티셔닝은 기본적으로 쿼리 최적화 기법이 아니라 데이터 관리 기능으로 이해해야 합니다. 키를 기준으로 데이터를 논리적으로 분리하면 각 파티션에 대해 삭제와 같은 작업을 독립적으로 수행할 수 있습니다. 이를 통해 시간 기준으로 [스토리지 계층](/integrations/s3#storage-tiers) 간에 파티션(즉, 데이터 하위 집합)을 효율적으로 이동하거나, [데이터를 만료시키거나 클러스터에서 효율적으로 삭제](/sql-reference/statements/alter/partition)할 수 있습니다. 예를 들어, 아래 예시에서는 2008년의 게시물을 제거합니다.

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

* **Query optimization** - 파티션은 쿼리 성능 향상에 도움이 될 수 있지만, 이는 접근 패턴에 크게 좌우됩니다. 쿼리가 소수의 파티션(이상적으로는 하나)만을 대상으로 하는 경우에는 성능이 향상될 수 있습니다. 이는 일반적으로 파티셔닝 키가 기본 키에 포함되어 있지 않고, 해당 키로 필터링하는 경우에만 유용합니다. 그러나 많은 파티션을 대상으로 해야 하는 쿼리는 파티셔닝을 사용하지 않았을 때보다 성능이 더 나빠질 수 있습니다(파티셔닝으로 인해 파트 수가 더 많아질 수 있기 때문입니다). 단일 파티션만을 대상으로 하는 이점은 파티셔닝 키가 이미 기본 키의 앞부분에 포함되어 있는 경우 사실상 거의 사라집니다. 파티션 내 값이 고유하다면, 파티셔닝은 [`GROUP BY` 쿼리 최적화](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)에도 사용될 수 있습니다. 그러나 일반적으로는 기본 키가 먼저 충분히 최적화되어 있는지 확인해야 하며, 접근 패턴이 하루 단위 파티셔닝에서 최근 1일처럼 특정 예측 가능한 일(日) 단위의 일부 구간만을 일관되게 조회하는 예외적인 경우에만, 파티셔닝을 쿼리 최적화 기법으로 고려하는 것이 좋습니다.


#### 권장 사항 \{#recommendations\}

파티셔닝을 데이터 관리 기법으로 적극 활용하는 방안을 고려해야 합니다. 이는 시계열 데이터를 다루면서 클러스터에서 데이터를 만료시켜야 하는 경우에 특히 적합합니다. 예를 들어 가장 오래된 파티션은 [간단히 드롭](/sql-reference/statements/alter/partition#drop-partitionpart)할 수 있습니다.

중요: 파티셔닝 키 표현식으로 인해 카디널리티가 높은 집합이 생성되지 않도록 해야 합니다. 즉, 100개가 넘는 파티션을 생성하는 것은 피해야 합니다. 예를 들어, 클라이언트 식별자나 이름처럼 카디널리티가 높은 컬럼을 기준으로 데이터를 파티셔닝하지 마십시오. 대신 클라이언트 식별자나 이름을 `ORDER BY` 표현식에서 첫 번째 컬럼으로 두는 것이 좋습니다.

> 내부적으로 ClickHouse는 삽입된 데이터에 대해 [파트를 생성](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)합니다. 더 많은 데이터가 삽입될수록 파트의 수가 증가합니다. 너무 많은 수의 파트는 쿼리 성능 저하(읽어야 할 파일이 더 많아지기 때문)를 초래하므로, 이를 방지하기 위해 백그라운드 비동기 프로세스에서 파트를 병합합니다. 파트 수가 [사전 구성된 한계값](/operations/settings/merge-tree-settings#parts_to_throw_insert)을 초과하면, ClickHouse는 삽입 시 ["too many parts" 오류](/knowledgebase/exception-too-many-parts)를 발생시킵니다. 이는 정상적인 운영 환경에서는 발생하지 않아야 하며, 잘못된 구성이나 잘못된 사용(예: 매우 작은 단위로 자주 삽입하는 경우)이 있을 때만 발생합니다. 파트는 각 파티션마다 독립적으로 생성되므로, 파티션 수가 증가하면 파트 수 또한 증가하며, 이는 파티션 수의 배수가 됩니다. 따라서 카디널리티가 높은 파티셔닝 키는 이러한 오류를 유발할 수 있으므로 피해야 합니다.

## materialized view와 프로젝션 비교 \{#materialized-views-vs-projections\}

ClickHouse의 프로젝션 개념을 사용하면 하나의 테이블에 여러 개의 `ORDER BY` 절을 지정할 수 있습니다.

[ClickHouse 데이터 모델링](/data-modeling/schema-design)에서는 materialized view를 활용하여
ClickHouse에서 집계를 미리 계산하고, 행을 변환하며, 서로 다른 액세스 패턴에 맞게 쿼리를
최적화하는 방법을 살펴봅니다. 마지막 항목과 관련해서는, insert를 수신하는 원본 테이블과는
다른 정렬 키를 가진 대상 테이블로 materialized view가 행을 전송하는
[예시를 제시한 바](/materialized-view/incremental-materialized-view#lookup-table) 있습니다.

예를 들어, 다음 쿼리를 살펴보십시오:

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

이 쿼리는 `UserId`가 정렬 키가 아니기 때문에 (아주 빠르게 처리되더라도) 전체 9천만 행을 스캔해야 합니다.
이전에는 `PostId` 조회용 materialized view를 사용하여 이 문제를 해결했습니다.
동일한 문제는 projection을 사용해도 해결할 수 있습니다.
아래 명령은 `ORDER BY user_id`를 사용하는 projection을 추가합니다.

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

먼저 프로젝션을 생성한 다음 이를 구체화해야 합니다.
두 번째 명령은 데이터를 서로 다른 두 가지 정렬 순서로 디스크에 각각 한 번씩, 총 두 번 저장합니다.
프로젝션은 아래와 같이 데이터가 생성될 때 함께 정의할 수도 있으며,
데이터가 삽입될 때 자동으로 유지 관리됩니다.

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

`ALTER` 명령으로 PROJECTION을 생성한 경우, `MATERIALIZE PROJECTION` 명령이 실행될 때 생성이 비동기적으로 진행됩니다. 다음 쿼리를 사용하여 이 작업의 진행 상황을 확인할 수 있으며, `is_done=1`이 될 때까지 대기합니다.

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

위 쿼리를 다시 실행해 보면, 추가적인 스토리지 사용을 대가로
성능이 크게 향상된 것을 확인할 수 있습니다.

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

[`EXPLAIN` command](/sql-reference/statements/explain)를 사용하여 이 쿼리를 처리하는 데 이 프로젝션이 사용되었는지도 확인할 수 있습니다.


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


### 프로젝션을 언제 사용해야 하는가 \{#when-to-use-projections\}

프로젝션은 데이터가 삽입될 때 자동으로 유지 관리되므로 신규 사용자에게 매력적인 기능입니다. 또한 쿼리를 단일 테이블로만 전송하면 되며, 가능한 경우 프로젝션이 활용되어 응답 시간이 단축됩니다.

<Image img={bigquery_7} size="md" alt="프로젝션"/>

이는 필터에 따라 적절한 최적화 대상 테이블을 선택하거나 쿼리를 다시 작성해야 하는 materialized views와 대조적입니다. 이로 인해 애플리케이션 측에 더 큰 부담이 가해지고 클라이언트 측 복잡성이 증가합니다.

이러한 장점에도 불구하고 프로젝션에는 기본적인 제약 사항이 있으므로 이를 인지하고 제한적으로 사용해야 합니다. 자세한 내용은 ["materialized views versus projections"](/managing-data/materialized-views-versus-projections)을 참조하십시오.

프로젝션 사용을 권장하는 경우는 다음과 같습니다.

- 데이터의 완전한 재정렬이 필요한 경우. 이론적으로 프로젝션의 표현식에서 `GROUP BY,`를 사용할 수 있지만, 집계를 유지 관리하는 데에는 materialized views가 더 효과적입니다. 쿼리 옵티마이저는 `SELECT * ORDER BY x`와 같이 단순한 재정렬을 사용하는 프로젝션을 더 잘 활용하는 경향이 있습니다. 이 표현식에서 컬럼의 부분 집합만 선택하여 스토리지 사용량을 줄일 수 있습니다.
- 스토리지 사용량 증가와 데이터를 두 번 쓰는 오버헤드를 수용할 수 있는 경우. 삽입 속도에 미치는 영향을 테스트하고 [스토리지 오버헤드를 평가](/data-compression/compression-in-clickhouse)하십시오.

## ClickHouse에서 BigQuery 쿼리 재작성하기 \{#rewriting-bigquery-queries-in-clickhouse\}

다음은 BigQuery와 ClickHouse를 비교하는 예시 쿼리입니다. 이 목록은 ClickHouse 기능을 활용해 쿼리를 크게 단순화하는 방법을 보여주는 것을 목표로 합니다. 아래 예시에서는 전체 Stack Overflow 데이터셋(2024년 4월까지)을 사용합니다.

**질문을 10개 넘게 작성한 사용자 중에서 조회 수가 가장 많은 사용자:**

*BigQuery*

<Image img={bigquery_8} size="sm" alt="BigQuery 쿼리 재작성" border />

*ClickHouse*

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

**어떤 태그의 조회수가 가장 높은지:**

*BigQuery*

<br />

<Image img={bigquery_9} size="sm" alt="BigQuery 1" border />

*ClickHouse*

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


## 집계 함수 \{#aggregate-functions\}

가능하다면 ClickHouse 집계 함수를 활용하는 것이 좋습니다. 아래에서는 [`argMax` 함수](/sql-reference/aggregate-functions/reference/argmax)를 사용하여 각 연도별로 가장 많이 조회된 질문을 계산하는 예시를 보여 줍니다.

*BigQuery*

<Image img={bigquery_10} border size="sm" alt="집계 함수 1" />

<Image img={bigquery_11} border size="sm" alt="집계 함수 2" />

*ClickHouse*

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


## 조건문과 배열 \{#conditionals-and-arrays\}

조건문과 배열 함수는 쿼리를 훨씬 더 간단하게 만들어 줍니다. 다음 쿼리는 2022년 대비 2023년에 발생 횟수가 10,000번을 초과하는 태그 중에서 백분율 증가폭이 가장 큰 태그를 계산합니다. 다음 ClickHouse 쿼리가 조건문, 배열 함수, 그리고 `HAVING` 및 `SELECT` 절에서 별칭을 재사용할 수 있는 기능 덕분에 얼마나 간결한지에 주목하십시오.

*BigQuery*

<Image img={bigquery_12} size="sm" border alt="조건문과 배열" />

*ClickHouse*

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

이로써 BigQuery에서 ClickHouse로의 마이그레이션을 위한 기본 가이드를 마칩니다. 고급 ClickHouse 기능에 대해 더 알아보려면 [ClickHouse에서 데이터 모델링하기](/data-modeling/schema-design) 가이드를 참고하십시오.
