---
'slug': '/migrations/postgresql/dataset'
'title': '데이터 마이 그레이션'
'description': 'PostgreSQL에서 ClickHouse로 마이그레이션할 데이터셋 예제'
'keywords':
- 'Postgres'
'show_related_blogs': true
'sidebar_label': '1부'
'doc_type': 'guide'
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> 이것은 **1부**로 PostgreSQL에서 ClickHouse로 마이그레이션하는 가이드입니다. 실용적인 예시를 사용하여 실시간 복제(CDC) 접근 방식을 통해 효율적으로 마이그레이션을 수행하는 방법을 보여줍니다. 다루는 많은 개념들은 PostgreSQL에서 ClickHouse로의 수동 대량 데이터 전송에도 적용될 수 있습니다.

## 데이터셋 {#dataset}

Postgres에서 ClickHouse로의 전형적인 마이그레이션을 보여주는 예제 데이터셋으로 Stack Overflow 데이터셋을 사용합니다. 이 데이터셋은 2008년부터 2024년 4월까지 Stack Overflow에서 발생한 모든 `post`, `vote`, `user`, `comment`, 및 `badge`를 포함합니다. 이 데이터의 PostgreSQL 스키마는 아래에 나와 있습니다:

<Image img={postgres_stackoverflow_schema} size="lg" alt="PostgreSQL Stack Overflow schema"/>

*PostgreSQL에서 테이블을 생성하기 위한 DDL 명령은 [여기](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==)에서 확인할 수 있습니다.*

이 스키마는 가장 최적화된 것은 아니지만, 기본 키, 외부 키, 파티셔닝 및 인덱스를 포함한 여러 개념들을 활용합니다. 

우리는 이러한 개념 각각을 ClickHouse의 동등한 개념으로 마이그레이션할 것입니다.

마이그레이션 단계를 테스트하기 위해 이 데이터셋을 PostgreSQL 인스턴스에 채워 넣고자 하는 사용자들을 위해, DDL 및 이후 데이터 로드 명령이 포함된 `pg_dump` 형식의 데이터를 다운로드할 수 있도록 제공했습니다:

```bash

# users
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql


# posts
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql


# posthistory
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql < posthistory.sql


# comments
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql


# votes
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql < votes.sql


# badges
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql


# postlinks
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz
gzip -d postlinks.sql.gz
psql < postlinks.sql
```

ClickHouse에 비해 이 데이터셋은 Postgres에게는 상당히 많은 양입니다. 위의 예시는 2024년 첫 세 달을 커버하는 하위 집합을 나타냅니다.

> 우리의 예시 결과는 Postgres와 Clickhouse 간의 성능 차이를 보여주기 위해 전체 데이터셋을 사용하지만, 아래에 문서화된 모든 단계는 더 작은 하위 집합과 기능적으로 동일합니다. 전체 데이터셋을 Postgres에 로드하려는 사용자는 [여기](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)에서 확인할 수 있습니다. 위의 스키마에 의해 부과된 외부 제약 때문에 PostgreSQL의 전체 데이터셋에는 참조 무결성을 충족하는 행만 포함되어 있습니다. 제약 조건이 없는 [Parquet 버전](/getting-started/example-datasets/stackoverflow)은 필요할 경우 ClickHouse로 직접 쉽게 로드할 수 있습니다.

## 데이터 마이그레이션 {#migrating-data}

### 실시간 복제 (CDC) {#real-time-replication-or-cdc}

ClickPipes를 PostgreSQL에 설정하는 방법은 이 [가이드](/integrations/clickpipes/postgres)를 참조하십시오. 이 가이드는 다양한 유형의 원본 Postgres 인스턴스를 다룹니다.

ClickPipes 또는 PeerDB를 사용하는 CDC 접근 방식을 통해 PostgreSQL 데이터베이스의 각 테이블이 ClickHouse에 자동으로 복제됩니다.

업데이트 및 삭제를 거의 실시간으로 처리하기 위해 ClickPipes는 Postgres 테이블을 ClickHouse에 매핑할 때 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 엔진을 사용합니다. 이 엔진은 ClickHouse에서 업데이트 및 삭제를 처리하도록 설계되었습니다. ClickPipes를 사용하여 데이터가 ClickHouse에 복제되는 방법에 대한 자세한 내용은 [여기](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated)에서 확인할 수 있습니다. 복제에 있어 CDC를 사용하면 ClickHouse에서 업데이트 또는 삭제 작업을 복제할 때 중복된 행이 생성된다는 점에 유의해야 합니다. ClickHouse에서 이를 처리하기 위해 [FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) 수정자를 사용하는 [기술](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword)을 참조하십시오.

ClickPipes를 사용하여 ClickHouse에서 `users` 테이블이 어떻게 생성되는지 살펴보겠습니다.

```sql
CREATE TABLE users
(
    `id` Int32,
    `reputation` String,
    `creationdate` DateTime64(6),
    `displayname` String,
    `lastaccessdate` DateTime64(6),
    `aboutme` String,
    `views` Int32,
    `upvotes` Int32,
    `downvotes` Int32,
    `websiteurl` String,
    `location` String,
    `accountid` Int32,
    `_peerdb_synced_at` DateTime64(9) DEFAULT now64(),
    `_peerdb_is_deleted` Int8,
    `_peerdb_version` Int64
)
ENGINE = ReplacingMergeTree(_peerdb_version)
PRIMARY KEY id
ORDER BY id;
```

설정이 완료되면 ClickPipes는 PostgreSQL에서 ClickHouse로 모든 데이터를 마이그레이션하기 시작합니다. 네트워크 및 배포 크기에 따라, Stack Overflow 데이터셋의 경우 몇 분 만에 완료되어야 합니다.

### 주기적인 업데이트가 포함된 수동 대량 로드 {#initial-bulk-load-with-periodic-updates}

수동 방식으로, 데이터셋의 초기 대량 로드는 다음을 통해 달성할 수 있습니다:

- **테이블 함수** - [Postgres 테이블 함수](/sql-reference/table-functions/postgresql)를 사용하여 ClickHouse에서 Postgres로부터 데이터를 `SELECT`하고 ClickHouse 테이블에 `INSERT`합니다. 이는 수백 GB에 달하는 데이터셋의 대량 로드에 관련됩니다.
- **내보내기** - CSV 또는 SQL 스크립트 파일과 같은 중간 형식으로 내보냅니다. 그런 다음 이 파일들은 ClickHouse에 클라이언트를 통해 `INSERT FROM INFILE` 절 또는 객체 저장소와 관련된 함수(예: s3, gcs)를 사용하여 로드할 수 있습니다.

PostgreSQL에서 데이터를 수동으로 로드할 때, 먼저 ClickHouse에 테이블을 생성해야 합니다. ClickHouse에서 테이블 스키마를 최적화하기 위해 Stack Overflow 데이터셋을 사용하는 이 [데이터 모델링 문서](/data-modeling/schema-design#establish-initial-schema)를 참조하십시오.

PostgreSQL과 ClickHouse 간의 데이터 타입은 다를 수 있습니다. 각 테이블 컬럼에 대한 동등한 타입을 설정하기 위해 [Postgres 테이블 함수](/sql-reference/table-functions/postgresql)와 함께 `DESCRIBE` 명령을 사용할 수 있습니다. 다음 명령은 PostgreSQL에서 `posts` 테이블을 설명하며, 사용자 환경에 맞게 수정하십시오:

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

PostgreSQL과 ClickHouse 간의 데이터 타입 매핑 개요에 대해서는 [부록 문서](/migrations/postgresql/appendix#data-type-mappings)를 참조하십시오.

이 스키마를 위한 타입 최적화 과정은 다른 출처에서 데이터가 로드된 경우와 동일합니다. S3의 Parquet를 사용하는 [대체 가이드](/data-modeling/schema-design)에 설명된 프로세스를 적용하면 다음과 같은 스키마가 나옵니다:

```sql title="Query"
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

우리는 간단한 `INSERT INTO SELECT`를 사용하여 PostgresSQL에서 데이터를 읽고 ClickHouse에 삽입하여 이를 채울 수 있습니다:

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

증분 로드도 그에 따라 예약할 수 있습니다. Postgres 테이블이 오직 삽입만 수신하고 증가하는 id 또는 타임스탬프가 존재하는 경우, 위의 테이블 함수 접근 방식을 사용하여 증분을 로드할 수 있습니다. 즉, `SELECT`에 `WHERE` 절을 적용할 수 있습니다. 이 접근 방식은 업데이트된 동일한 컬럼을 보장할 경우 업데이트를 지원하는 데에도 사용될 수 있습니다. 하지만 삭제를 지원하려면 완전한 재로드가 필요하며, 테이블이 커짐에 따라 이를 성취하는 것은 어려울 수 있습니다.

우리는 `CreationDate`를 사용하여 초기 로드와 증분 로드를 시연합니다(행이 업데이트될 경우 업데이트된다고 가정합니다).

```sql
-- initial load
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse는 `=`, `!=`, `>`, `>=`, `<`, `<=`, 및 IN과 같은 간단한 `WHERE` 절을 PostgreSQL 서버로 푸시합니다. 따라서 변경 세트를 식별하는 데 사용하는 컬럼에 인덱스가 존재하는지 확인하여 증분 로드를 더욱 효율적으로 만들 수 있습니다.

> 쿼리 복제를 사용할 때 UPDATE 작업을 감지하는 가능한 방법 중 하나는 [`XMIN` 시스템 컬럼](https://www.postgresql.org/docs/9.1/ddl-system-columns.html) (트랜잭션 ID)을 수위 표시기로 사용하는 것입니다. 이 컬럼의 변화는 변화의 지표로, 따라서 목적지 테이블에 적용될 수 있습니다. 이러한 접근 방식을 사용하는 사용자는 `XMIN` 값이 랩around 될 수 있고 비교를 위해 전체 테이블 스캔이 필요하며 변경 추적이 더 복잡할 수 있다는 점을 유의해야 합니다.

[2부로 가기](/migrations/postgresql/rewriting-queries)
