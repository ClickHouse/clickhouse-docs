---
'sidebar_label': '주문 키'
'description': '사용자 정의 주문 키를 정의하는 방법.'
'slug': '/integrations/clickpipes/postgres/ordering_keys'
'title': '주문 키'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

Ordering Keys (일명 정렬 키)는 ClickHouse에서 테이블의 데이터가 디스크에 정렬되고 인덱싱되는 방식을 정의합니다. Postgres에서 복제할 때, ClickPipes는 기본적으로 Postgres 테이블의 기본 키를 ClickHouse의 해당 테이블에 대한 정렬 키로 사용합니다. 대부분의 경우, Postgres 기본 키는 충분한 정렬 키로 작용하며, ClickHouse는 이미 빠른 스캔을 위해 최적화되어 있으므로 사용자 정의 정렬 키가 필요하지 않은 경우가 많습니다.

[마이그레이션 가이드](/migrations/postgresql/data-modeling-techniques)에서 설명된 바와 같이, 더 큰 사용 사례의 경우 쿼리를 최적화하기 위해 ClickHouse 정렬 키에 Postgres 기본 키 외의 추가 컬럼을 포함해야 합니다.

CDC에서 기본적으로 Postgres 기본 키와 다른 정렬 키를 선택하면 ClickHouse에서 데이터 중복 제거 문제를 일으킬 수 있습니다. 이는 ClickHouse의 정렬 키가 데이터 인덱싱과 정렬을 제어하는 동시에 중복 제거 키로 작용하기 때문에 발생합니다. 이 문제를 해결하는 가장 쉬운 방법은 새로 고칠 수 있는 물리화된 뷰를 정의하는 것입니다.

## 새로 고칠 수 있는 물리화된 뷰 사용하기 {#use-refreshable-materialized-views}

사용자 정의 정렬 키(ORDER BY)를 정의하는 간단한 방법은 [새로 고칠 수 있는 물리화된 뷰](/materialized-view/refreshable-materialized-view) (MVs)를 사용하는 것입니다. 이를 통해 원하는 정렬 키로 전체 테이블을 주기적으로 (예: 매 5분 또는 10분마다) 복사할 수 있습니다. 

아래는 사용자 정의 ORDER BY와 필요한 중복 제거가 포함된 새로 고칠 수 있는 MV의 예입니다:

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```

## 새로 고칠 수 없는 물리화된 뷰 없이 사용자 정의 정렬 키 설정하기 {#custom-ordering-keys-without-refreshable-materialized-views}

데이터의 규모로 인해 새로 고칠 수 있는 물리화된 뷰가 작동하지 않는 경우, 더 큰 테이블에서 사용자 정의 정렬 키를 정의하고 중복 제거 관련 문제를 극복하기 위해 따라야 할 몇 가지 권장 사항이 있습니다.

### 주어진 행에 대해 변경되지 않는 정렬 키 컬럼 선택하기 {#choose-ordering-key-columns-that-dont-change-for-a-given-row}

ClickHouse의 정렬 키에 Postgres의 기본 키 외에 추가 컬럼을 포함할 때, 각 행에 대해 변경되지 않는 컬럼을 선택하는 것을 권장합니다. 이는 ReplacingMergeTree와의 데이터 일관성 및 중복 제거 문제를 예방하는 데 도움이 됩니다.

예를 들어, 다중 테넌트 SaaS 애플리케이션에서는 (`tenant_id`, `id`)를 정렬 키로 사용하는 것이 좋은 선택입니다. 이 컬럼들은 각 행을 고유하게 식별하며, `tenant_id`는 다른 컬럼이 변경되더라도 `id`에 대해 일정하게 유지됩니다. 아이디(id)별 중복 제거가 (tenant_id, id)별 중복 제거와 일치하므로, tenant_id가 변경될 경우 발생할 수 있는 데이터 [중복 제거 문제](https://docs.peerdb.io/mirror/ordering-key-different)를 피할 수 있습니다.

### Postgres 테이블에서 기본 키를 사용자 정의 정렬 키로 설정하기 {#set-replica-identity-on-postgres-tables-to-custom-ordering-key}

Postgres CDC가 예상대로 작동하려면, 테이블의 `REPLICA IDENTITY`를 수정하여 정렬 키 컬럼을 포함하는 것이 중요합니다. 이는 DELETE를 정확하게 처리하는 데 필수적입니다.

`REPLICA IDENTITY`가 정렬 키 컬럼을 포함하지 않으면, Postgres CDC는 기본 키 외의 컬럼 값들을 캡처하지 않습니다 - 이는 Postgres 논리적 디코딩의 한계입니다. Postgres의 기본 키 외의 모든 정렬 키 컬럼은 null 값을 가지게 됩니다. 이는 중복 제거에 영향을 미치며, 이전 버전의 행이 최신 삭제된 버전(여기서 `_peerdb_is_deleted`가 1로 설정됨)과 중복 제거되지 않을 수 있습니다.

위의 예에서 `owneruserid`와 `id`가 있을 경우, 기본 키에 이미 `owneruserid`가 포함되어 있지 않다면, (`owneruserid`, `id`)에 대해 `UNIQUE INDEX`를 생성하고 이를 테이블의 `REPLICA IDENTITY`로 설정해야 합니다. 이는 Postgres CDC가 정확한 복제 및 중복 제거를 위해 필요한 컬럼 값을 캡처하도록 보장합니다.

아래는 이벤트 테이블에서 이를 수행하는 방법의 예입니다. 수정된 정렬 키가 있는 모든 테이블에 이를 적용해야 합니다.

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
