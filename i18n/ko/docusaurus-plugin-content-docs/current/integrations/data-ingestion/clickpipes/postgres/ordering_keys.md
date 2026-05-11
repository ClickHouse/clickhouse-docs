---
sidebar_label: '정렬 키'
description: '사용자 정의 정렬 키를 설정하는 방법.'
slug: /integrations/clickpipes/postgres/ordering_keys
title: 'Ordering Keys'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

Ordering Keys(정렬 키, sorting keys라고도 함)는 ClickHouse에서 테이블 데이터가 디스크에 어떻게 정렬되고 인덱싱되는지를 정의합니다. Postgres에서 복제할 때 ClickPipes는 기본적으로 해당 ClickHouse 테이블의 정렬 키로 Postgres 테이블의 기본 키를 사용합니다. 대부분의 경우 Postgres 기본 키만으로도 정렬 키로 충분합니다. ClickHouse는 이미 빠른 스캔에 최적화되어 있으며, 사용자 정의 정렬 키가 반드시 필요하지 않은 경우가 많기 때문입니다.

더 큰 규모의 사용 사례에서는 [migration guide](/migrations/postgresql/data-modeling-techniques)에 설명된 것처럼, 쿼리를 최적화하기 위해 ClickHouse 정렬 키에 Postgres 기본 키 외에도 추가 컬럼을 포함하는 것이 좋습니다. 

기본적으로 CDC를 사용할 때 Postgres 기본 키와 다른 정렬 키를 선택하면 ClickHouse에서 데이터 중복 제거 문제가 발생할 수 있습니다. 이는 ClickHouse의 정렬 키가 데이터 인덱싱과 정렬을 제어하는 동시에 중복 제거 키 역할까지 하는 이중 역할을 수행하기 때문입니다. 이 문제를 해결하는 가장 쉬운 방법은 갱신 가능 구체화 뷰(refreshable materialized view)를 정의하는 것입니다.

## 갱신 가능 구체화 뷰 사용 \{#use-refreshable-materialized-views\}

사용자 지정 정렬 키(ORDER BY)를 정의하는 간단한 방법은 [갱신 가능 구체화 뷰(refreshable materialized views)](/materialized-view/refreshable-materialized-view) (MV)를 사용하는 것입니다. 이를 사용하면 원하는 정렬 키를 사용하여 전체 테이블을 주기적으로(예를 들어 5분 또는 10분마다) 복사할 수 있습니다.

아래는 사용자 지정 ORDER BY와 필요한 중복 제거가 포함된 Refreshable MV의 예시입니다:

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```


## 갱신 가능 구체화 뷰 없이 사용자 정의 정렬 키 사용하기 \{#custom-ordering-keys-without-refreshable-materialized-views\}

데이터 규모가 커서 갱신 가능 구체화 뷰를 사용할 수 없는 경우, 더 큰 테이블에 사용자 정의 정렬 키를 정의하고 중복 제거 관련 문제를 해결하는 데 도움이 되는 몇 가지 권장 사항은 다음과 같습니다.

### 주어진 행에 대해 변경되지 않는 정렬 키 컬럼 선택하기 \{#choose-ordering-key-columns-that-dont-change-for-a-given-row\}

Postgres의 기본 키 외에 ClickHouse용 정렬 키에 추가 컬럼을 포함할 때는 각 행에 대해 값이 변경되지 않는 컬럼을 선택하는 것이 좋습니다. 이렇게 하면 ReplacingMergeTree에서 데이터 일관성과 중복 제거 관련 문제를 방지하는 데 도움이 됩니다.

예를 들어, 멀티 테넌트 SaaS 애플리케이션에서는 정렬 키로 (`tenant_id`, `id`)를 사용하는 것이 좋은 선택입니다. 이 컬럼들은 각 행을 고유하게 식별하며, 다른 컬럼이 변경되더라도 `id`에 대한 `tenant_id`는 변하지 않습니다. `id` 기준 중복 제거가 (tenant_id, id) 기준 중복 제거와 일치하므로, tenant_id가 변경될 경우 발생할 수 있는 데이터 [중복 제거 문제](https://docs.peerdb.io/mirror/ordering-key-different)를 피하는 데 도움이 됩니다.

### Postgres 테이블에서 Replica Identity를 사용자 정의 정렬 키로 설정 \{#set-replica-identity-on-postgres-tables-to-custom-ordering-key\}

Postgres CDC가 의도한 대로 동작하도록 하려면, 테이블의 `REPLICA IDENTITY`에 정렬 키 컬럼을 포함하도록 수정하는 것이 중요합니다. 이는 DELETE를 정확하게 처리하는 데 필수적입니다.

`REPLICA IDENTITY`에 정렬 키 컬럼이 포함되지 않으면 Postgres CDC는 기본 키 이외의 컬럼 값을 캡처하지 못합니다. 이것은 Postgres 논리적 디코딩의 한계입니다. Postgres에서 기본 키를 제외한 모든 정렬 키 컬럼은 NULL이 됩니다. 이는 중복 제거에 영향을 미치며, 이로 인해 행의 이전 버전이 최신 삭제된 버전(여기서 `_peerdb_is_deleted`가 1로 설정됨)과 중복 제거되지 않을 수 있습니다.

위의 `owneruserid`와 `id` 예에서, 기본 키에 이미 `owneruserid`가 포함되어 있지 않다면, (`owneruserid`, `id`)에 대해 `UNIQUE INDEX`를 생성하고 이를 테이블의 `REPLICA IDENTITY`로 설정해야 합니다. 이렇게 하면 Postgres CDC가 정확한 복제 및 중복 제거에 필요한 컬럼 값을 캡처할 수 있습니다.

아래는 `events` 테이블에서 이를 수행하는 예입니다. 수정된 정렬 키가 있는 모든 테이블에 이 설정을 적용해야 합니다.

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
