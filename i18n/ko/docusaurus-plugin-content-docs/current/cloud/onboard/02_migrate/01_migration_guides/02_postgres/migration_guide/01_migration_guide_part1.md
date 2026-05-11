---
slug: /migrations/postgresql/dataset
title: '데이터 마이그레이션'
description: 'PostgreSQL에서 ClickHouse로 마이그레이션하기 위한 데이터셋 예제'
keywords: ['Postgres']
show_related_blogs: true
sidebar_label: '1부'
doc_type: 'guide'
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> 이 문서는 PostgreSQL에서 ClickHouse로 마이그레이션하는 가이드의 **1부**입니다. 실용적인 예제를 통해 실시간 복제(CDC) 접근 방식을 사용하여 마이그레이션을 효율적으로 수행하는 방법을 보여 줍니다. 여기에서 다루는 많은 개념은 PostgreSQL에서 ClickHouse로의 수동 대량 데이터 이전에도 적용할 수 있습니다.


## 데이터 세트 \{#dataset\}

Postgres에서 ClickHouse로의 전형적인 마이그레이션 예시를 보여 주기 위한 예제 데이터 세트로, [여기](/getting-started/example-datasets/stackoverflow)에 문서화된 Stack Overflow 데이터 세트를 사용합니다. 이 데이터 세트에는 2008년부터 2024년 4월까지 Stack Overflow에서 발생한 모든 `post`, `vote`, `user`, `comment`, `badge`가 포함되어 있습니다. 이 데이터에 대한 PostgreSQL 스키마는 아래와 같습니다:

<Image img={postgres_stackoverflow_schema} size="lg" alt="PostgreSQL Stack Overflow schema" />

*PostgreSQL에서 테이블을 생성하기 위한 DDL 명령은 [여기](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==)에서 확인할 수 있습니다.*

이 스키마는 반드시 최적이라고 할 수는 없지만, 기본 키(primary key), 외래 키(foreign key), 파티셔닝(partitioning), 인덱스(indexes) 등 여러 널리 사용되는 PostgreSQL 기능을 활용합니다.

이러한 개념들을 각각 ClickHouse에 해당하는 개념으로 마이그레이션합니다.

마이그레이션 단계를 테스트하기 위해 이 데이터 세트를 PostgreSQL 인스턴스에 적재하려는 사용자를 위해, DDL과 함께 다운로드 가능한 `pg_dump` 형식의 데이터를 제공하며, 이후 데이터 적재 명령은 아래에 제시합니다:

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

ClickHouse 기준으로는 작은 규모지만, Postgres에는 상당한 크기의 데이터세트입니다. 위 예시는 2024년 첫 세 달을 다루는 부분 집합입니다.

> 위 예시 결과는 Postgres와 ClickHouse 간의 성능 차이를 보여주기 위해 전체 데이터세트를 사용하지만, 아래에 설명된 모든 단계는 더 작은 부분 집합에서도 기능적으로 동일합니다. 전체 데이터세트를 Postgres에 적재하려는 사용자는 [여기](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)를 참조하십시오. 위 스키마가 부과하는 외래 키 제약 조건 때문에 PostgreSQL용 전체 데이터세트에는 참조 무결성을 만족하는 행만 포함됩니다. 이러한 제약 조건이 없는 [Parquet 버전](/getting-started/example-datasets/stackoverflow)은 필요 시 ClickHouse에 직접 쉽게 로드할 수 있습니다.


## 데이터 마이그레이션 \{#migrating-data\}

### 실시간 복제(CDC) \{#real-time-replication-or-cdc\}

PostgreSQL용 ClickPipes를 설정하려면 이 [가이드](/integrations/clickpipes/postgres)를 참고하십시오. 이 가이드는 다양한 유형의 PostgreSQL 소스 인스턴스를 다룹니다.

ClickPipes 또는 PeerDB를 사용하는 CDC 방식에서는 PostgreSQL 데이터베이스의 각 테이블이 ClickHouse로 자동 복제됩니다.

업데이트와 삭제를 거의 실시간으로 처리하기 위해 ClickPipes는 Postgres 테이블을 ClickHouse의 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 엔진에 매핑합니다. 이 엔진은 ClickHouse에서 업데이트와 삭제를 처리하도록 특별히 설계되었습니다. 데이터가 ClickPipes를 통해 ClickHouse로 어떻게 복제되는지에 대한 자세한 내용은 [여기](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated)에서 확인할 수 있습니다. CDC를 사용한 복제는 업데이트 또는 삭제 작업을 복제할 때 ClickHouse에 중복된 행을 생성한다는 점을 유의해야 합니다. 이러한 중복을 ClickHouse에서 처리하는 방법으로 [FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) 수정자를 사용하는 [기법](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword)을 참고하십시오.

이제 ClickPipes를 사용해 ClickHouse에서 `users` 테이블이 어떻게 생성되는지 살펴보겠습니다.

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

설정을 마치면 ClickPipes가 PostgreSQL의 모든 데이터를 ClickHouse로 마이그레이션하기 시작합니다. 네트워크 환경과 배포 규모에 따라 달라질 수 있지만, Stack Overflow 데이터셋의 경우 몇 분 정도면 완료됩니다.


### 주기적인 업데이트가 포함된 수동 대량 적재 \{#initial-bulk-load-with-periodic-updates\}

수동 방식에서는 다음과 같이 초기 데이터셋 대량 적재를 수행할 수 있습니다:

* **Table functions** - ClickHouse에서 [Postgres table function](/sql-reference/table-functions/postgresql)을 사용해 Postgres에서 데이터를 `SELECT`한 뒤, 이를 ClickHouse 테이블에 `INSERT`합니다. 수백 GB 규모까지의 대량 적재에 적합합니다.
* **Exports** - CSV 또는 SQL 스크립트 파일과 같은 중간 형식으로 내보냅니다. 그런 다음 이 파일들을 클라이언트에서 `INSERT FROM INFILE` 절을 사용하거나, 객체 스토리지와 해당 함수(예: s3, gcs)를 사용하여 ClickHouse에 적재할 수 있습니다.

PostgreSQL에서 수동으로 데이터를 적재할 때는 먼저 ClickHouse에 테이블을 생성해야 합니다. ClickHouse에서 Stack Overflow 데이터셋을 사용해 테이블 스키마를 최적화하는 방법을 다루는 [데이터 모델링 문서](/data-modeling/schema-design#establish-initial-schema)를 참고하십시오.

PostgreSQL과 ClickHouse 사이의 데이터 타입은 서로 다를 수 있습니다. 각 테이블 컬럼에 대한 동등한 타입을 결정하기 위해 [Postgres table function](/sql-reference/table-functions/postgresql)과 함께 `DESCRIBE` 명령을 사용할 수 있습니다. 다음 명령은 PostgreSQL의 `posts` 테이블 구조를 조회하는 예시이므로, 환경에 맞게 수정하여 사용하십시오:

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

PostgreSQL과 ClickHouse 간 데이터 타입 매핑에 대한 개요는 [부록 문서](/migrations/postgresql/appendix#data-type-mappings)를 참고하십시오.

이 스키마에 대해 데이터 타입을 최적화하는 단계는 데이터가 S3의 Parquet 등 다른 소스에서 로드된 경우와 동일합니다. 이 [Parquet을 사용하는 대체 가이드](/data-modeling/schema-design)에 설명된 프로세스를 적용하면 다음과 같은 스키마가 생성됩니다.

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

PostgresSQL의 데이터를 읽어 ClickHouse에 삽입하는 간단한 `INSERT INTO SELECT` 문으로 이를 채울 수 있습니다:

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

증분 적재는 마찬가지로 스케줄링할 수 있습니다. Postgres 테이블이 insert만 받고, 증가하는 id 또는 타임스탬프가 존재하는 경우, 위에서 설명한 table function 방식을 사용하여 증분 데이터를 적재할 수 있습니다. 즉, `SELECT`에 `WHERE` 절을 적용할 수 있습니다. 이 방식은 동일한 컬럼만 갱신된다는 것이 보장되는 경우 업데이트를 지원하는 데도 사용할 수 있습니다. 그러나 delete를 지원하려면 전체 재적재가 필요하며, 테이블이 커질수록 이를 수행하기가 어려워질 수 있습니다.

여기서는 `CreationDate`를 사용하여 초기 적재와 증분 적재를 시연합니다(행이 업데이트될 때 이 값이 갱신된다고 가정합니다).

```sql
-- initial load
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```


> ClickHouse는 `=`, `!=`, `>`, `>=`, `<`, `<=`, `IN`과 같은 단순 `WHERE` 절을 PostgreSQL 서버로 푸시다운합니다. 따라서 변경 집합을 식별하는 데 사용되는 컬럼에 인덱스를 만들어 두면 증분 적재를 더욱 효율적으로 수행할 수 있습니다.
>
> 쿼리 복제를 사용할 때 `UPDATE` 연산을 감지하는 한 가지 방법은 워터마크로 [`XMIN` system column](https://www.postgresql.org/docs/9.1/ddl-system-columns.html) (트랜잭션 ID)을 사용하는 것입니다. 이 컬럼의 값이 변경되면 변경이 발생했다는 의미이므로, 이를 기준으로 대상 테이블에 적용할 수 있습니다. 이 접근 방식을 사용하는 사용자는 `XMIN` 값이 순환(wrap-around)될 수 있으며, 값을 비교하려면 전체 테이블 스캔이 필요해 변경 사항 추적이 더 복잡해진다는 점을 인지해야 합니다.
>
[2부를 보려면 여기를 클릭하십시오](/migrations/postgresql/rewriting-queries)