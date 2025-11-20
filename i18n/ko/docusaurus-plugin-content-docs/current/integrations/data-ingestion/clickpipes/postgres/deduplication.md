---
'sidebar_label': '중복 제거 전략'
'description': '중복 및 삭제된 행을 처리합니다.'
'slug': '/integrations/clickpipes/postgres/deduplication'
'title': '중복 제거 전략 (using CDC)'
'keywords':
- 'deduplication'
- 'postgres'
- 'clickpipes'
- 'replacingmergetree'
- 'final'
'doc_type': 'guide'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

Updates and deletes replicated from Postgres to ClickHouse result in duplicated rows in ClickHouse due to its data storage structure and the replication process. This page covers why this happens and the strategies to use in ClickHouse to handle duplicates.

## 데이터가 어떻게 복제되나요? {#how-does-data-get-replicated}

### PostgreSQL 논리적 디코딩 {#PostgreSQL-logical-decoding}

ClickPipes는 [Postgres 논리적 디코딩](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication)을 사용하여 Postgres에서 발생하는 변경사항을 소비합니다. Postgres의 논리적 디코딩 프로세스는 ClickPipes와 같은 클라이언트가 사람이 읽을 수 있는 형식으로 변경사항을 수신할 수 있도록 하며, 즉, 일련의 INSERT, UPDATE, DELETE를 포함합니다.

### ReplacingMergeTree {#replacingmergetree}

ClickPipes는 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 엔진을 사용하여 Postgres 테이블을 ClickHouse에 매핑합니다. ClickHouse는 추가 전용 작업 부하에서 가장 잘 작동하며 잦은 UPDATE를 권장하지 않습니다. 여기서 ReplacingMergeTree가 특히 강력합니다.

ReplacingMergeTree를 사용하면, 업데이트는 행의 새로운 버전(`_peerdb_version`)과 함께 삽입으로 모델링되며, 삭제는 새로운 버전과 `_peerdb_is_deleted`가 true로 표시된 삽입입니다. ReplacingMergeTree 엔진은 백그라운드에서 데이터의 중복을 제거하고 병합하며, 특정 기본 키(id)에 대한 행의 최신 버전을 유지하여 UPDATE와 DELETE를 버전이 있는 삽입으로 효율적으로 처리할 수 있게 합니다.

아래는 ClickPipes가 ClickHouse에 테이블을 생성하기 위해 실행한 CREATE Table 문장의 예입니다.

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

### 설명 예시 {#illustrative-example}

아래의 설명은 ClickPipes를 사용하여 PostgreSQL과 ClickHouse 간에 테이블 `users`의 동기화를 기본적으로 보여줍니다.

<Image img={clickpipes_initial_load} alt="ClickPipes 초기 로드" size="lg"/>

**1단계**는 PostgreSQL의 2개 행에 대한 초기 스냅샷과 이 2개 행을 ClickHouse로 초기 로드하는 ClickPipes의 동작을 보여줍니다. 관찰할 수 있듯이, 두 행 모두 ClickHouse로 변경 없이 그대로 복사됩니다.

**2단계**는 users 테이블에 대한 세 가지 작업을 보여줍니다: 새 행 삽입, 기존 행 업데이트, 및 다른 행 삭제.

**3단계**는 ClickPipes가 INSERT, UPDATE 및 DELETE 작업을 ClickHouse에 버전이 있는 삽입으로 복제하는 방법을 보여줍니다. UPDATE는 ID 2의 행에 대한 새로운 버전으로 나타나고, DELETE는 `_is_deleted`가 true로 표시된 ID 1의 새로운 버전으로 나타납니다. 이로 인해 ClickHouse는 PostgreSQL보다 3개의 추가 행을 보유하게 됩니다.

그 결과, `SELECT count(*) FROM users;`와 같은 간단한 쿼리를 실행하면 ClickHouse와 PostgreSQL에서 다른 결과를 생성할 수 있습니다. [ClickHouse 병합 문서](/merges#replacing-merges)에 따르면, 구식 행 버전은 병합 과정 중에 결국 폐기됩니다. 그러나 이 병합의 타이밍은 예측할 수 없기 때문에 ClickHouse의 쿼리는 병합이 발생할 때까지 일관성 없는 결과를 반환할 수 있습니다.

ClickHouse와 PostgreSQL에서 동일한 쿼리 결과를 보장하기 위해 어떻게 해야 할까요?

### FINAL 키워드를 사용하여 중복 제거하기 {#deduplicate-using-final-keyword}

ClickHouse 쿼리에서 데이터를 중복 제거하는 권장 방법은 [FINAL 수정자](/sql-reference/statements/select/from#final-modifier)를 사용하는 것입니다. 이 수정자는 중복 제거된 행만 반환되도록 보장합니다.

세 가지 쿼리에 이를 적용하는 방법을 살펴보겠습니다.

_다음 쿼리에서 삭제된 행을 필터링하는 데 사용되는 WHERE 절에 유의하세요._

- **단순 카운트 쿼리**: 게시물 수 세기.

이것은 동기화가 정상적으로 이루어졌는지 확인하기 위해 실행할 수 있는 가장 간단한 쿼리입니다. 두 쿼리는 동일한 수를 반환해야 합니다.

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

- **JOIN을 포함한 간단한 집계**: 가장 많은 조회수를 기록한 상위 10명의 사용자.

단일 테이블에 대한 집계의 예입니다. 여기서 중복이 있으면 합계 함수의 결과에 큰 영향을 줄 수 있습니다.

```sql
-- PostgreSQL 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts p
LEFT JOIN users u ON u.id = p.owneruserid
-- highlight-next-line
WHERE p.owneruserid > 0
GROUP BY user_id, display_name
ORDER BY viewcount DESC
LIMIT 10;

-- ClickHouse 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts AS p
FINAL
LEFT JOIN users AS u
FINAL ON (u.id = p.owneruserid) AND (u._peerdb_is_deleted = 0)
-- highlight-next-line
WHERE (p.owneruserid > 0) AND (p._peerdb_is_deleted = 0)
GROUP BY
    user_id,
    display_name
ORDER BY viewcount DESC
LIMIT 10
```

#### FINAL 설정 {#final-setting}

쿼리의 각 테이블 이름에 FINAL 수정자를 추가하기보다는, [FINAL 설정](/operations/settings/settings#final)을 사용하여 쿼리의 모든 테이블에 자동으로 적용할 수 있습니다.

이 설정은 쿼리별 또는 전체 세션에 적용할 수 있습니다.

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```

#### ROW 정책 {#row-policy}

중복된 `_peerdb_is_deleted = 0` 필터를 숨기는 쉬운 방법은 [ROW 정책](/docs/operations/access-rights#row-policy-management)을 사용하는 것입니다. 아래는 votes 테이블의 모든 쿼리에서 삭제된 행을 제외하기 위해 행 정책을 생성하는 예입니다.

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 행 정책은 사용자 및 역할 목록에 적용됩니다. 이 예에서는 모든 사용자 및 역할에 적용됩니다. 특정 사용자 또는 역할로 조정할 수 있습니다.

### PostgreSQL과 유사하게 쿼리하기 {#query-like-with-postgres}

분석 데이터셋을 PostgreSQL에서 ClickHouse로 마이그레이션할 때는 데이터 처리 및 쿼리 실행의 차이를 감안하여 응용 프로그램 쿼리를 수정해야 하는 경우가 많습니다.

이 섹션에서는 원래 쿼리를 변경하지 않고 데이터 중복 제거를 위한 기술을 탐구합니다.

#### 뷰 {#views}

[뷰](/sql-reference/statements/create/view#normal-view)는 쿼리에서 FINAL 키워드를 숨기는 훌륭한 방법입니다. 뷰는 데이터를 저장하지 않고 매 접근 시 다른 테이블에서 단순히 읽어들입니다.

아래는 ClickHouse의 데이터베이스의 각 테이블에 대해 FINAL 키워드와 삭제된 행을 필터링하는 뷰를 생성하는 예입니다.

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

그런 후, PostgreSQL에서 사용했던 것과 같은 쿼리를 사용하여 뷰를 쿼리할 수 있습니다. 

```sql
-- Most viewed posts
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM posts_view
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10
```

#### 새로 고칠 수 있는 물리화된 뷰 {#refreshable-material-view}

또 다른 접근법은 [새로 고칠 수 있는 물리화된 뷰](/materialized-view/refreshable-materialized-view)를 사용하는 것입니다. 이 방법은 행을 중복 제거하고 결과를 대상 테이블에 저장하기 위해 쿼리 실행을 예약할 수 있게 해줍니다. 매번 일정한 새로 고침마다 대상 테이블은 최신 쿼리 결과로 대체됩니다.

이 방법의 주요 장점은 FINAL 키워드를 사용하는 쿼리가 새로 고침 도중에 단 한 번 실행되므로, 이후 대상 테이블에 대한 쿼리에 FINAL을 사용할 필요가 없다는 점입니다.

그러나 단점은 대상 테이블의 데이터가 마지막 새로 고침 시점까지만 최신이라는 것입니다. 그럼에도 불구하고, 많은 경우에서 몇 분에서 몇 시간 단위의 새로 고침 간격이 충분할 수 있습니다.

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

그런 후, 테이블 `deduplicated_posts`를 정상적으로 쿼리할 수 있습니다.

```sql
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM deduplicated_posts
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10;
```
