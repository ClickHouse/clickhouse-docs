---
'description': '프로젝션 조작에 대한 문서'
'sidebar_label': 'PROJECTION'
'sidebar_position': 49
'slug': '/sql-reference/statements/alter/projection'
'title': '프로젝션'
'doc_type': 'reference'
---

Projections는 쿼리 실행을 최적화하는 형식으로 데이터를 저장합니다. 이 기능은 다음에 유용합니다:
- 기본 키의 일부가 아닌 컬럼에서 쿼리 실행
- 컬럼을 사전 집계하여 계산 및 I/O를 모두 줄일 수 있습니다.

테이블에 하나 이상의 프로젝션을 정의할 수 있으며, 쿼리 분석 중 ClickHouse는 사용자가 제공한 쿼리를 수정하지 않고 스캔할 데이터가 가장 적은 프로젝션을 선택합니다.

:::note 디스크 사용량

프로젝션은 내부적으로 새로운 숨겨진 테이블을 생성하므로 더 많은 I/O와 디스크 공간이 필요합니다. 예를 들어, 프로젝션에서 다른 기본 키를 정의하면 원래 테이블의 모든 데이터가 중복됩니다.
:::

프로젝션의 내부 작동 방식에 대한 더 많은 기술 세부정보는 이 [페이지](../../guides/best-practices/sparse-primary-indexes.md/#option-3-projections)에서 확인할 수 있습니다.

## 기본 키를 사용하지 않는 필터링 예제 {#example-filtering-without-using-primary-keys}

테이블 생성:
```sql
CREATE TABLE visits_order
(
   `user_id` UInt64,
   `user_name` String,
   `pages_visited` Nullable(Float64),
   `user_agent` String
)
ENGINE = MergeTree()
PRIMARY KEY user_agent
```
`ALTER TABLE`을 사용하여 기존 테이블에 프로젝션을 추가할 수 있습니다:
```sql
ALTER TABLE visits_order ADD PROJECTION user_name_projection (
SELECT
*
ORDER BY user_name
)

ALTER TABLE visits_order MATERIALIZE PROJECTION user_name_projection
```
데이터 삽입:
```sql
INSERT INTO visits_order SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

프로젝션을 사용하면 원래 테이블에서 `user_name`이 `PRIMARY_KEY`로 정의되지 않았더라도 `user_name`으로 빠르게 필터링할 수 있습니다. 쿼리 실행 시 ClickHouse는 프로젝션이 사용될 경우 처리할 데이터가 적다는 것을 판단하며, 데이터는 `user_name`으로 정렬됩니다.
```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

쿼리가 프로젝션을 사용하고 있는지 확인하려면 `system.query_log` 테이블을 검토할 수 있습니다. `projections` 필드에는 사용된 프로젝션의 이름이 있거나 사용된 것이 없으면 비어 있습니다.
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## 사전 집계 쿼리 예제 {#example-pre-aggregation-query}

프로젝션과 함께 테이블 생성:
```sql
CREATE TABLE visits
(
   `user_id` UInt64,
   `user_name` String,
   `pages_visited` Nullable(Float64),
   `user_agent` String,
   PROJECTION projection_visits_by_user
   (
       SELECT
           user_agent,
           sum(pages_visited)
       GROUP BY user_id, user_agent
   )
)
ENGINE = MergeTree()
ORDER BY user_agent
```
데이터 삽입:
```sql
INSERT INTO visits SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```
```sql
INSERT INTO visits SELECT
    number,
    'test',
    1. * (number / 2),
   'IOS'
FROM numbers(100, 500);
```
첫 번째 쿼리를 `user_agent` 필드를 사용하여 `GROUP BY`로 실행할 것입니다. 이 쿼리는 사전 집계와 일치하지 않으므로 정의된 프로젝션을 사용하지 않습니다.
```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

프로젝션을 사용하려면 사전 집계 및 `GROUP BY` 필드를 일부 또는 모두 선택하는 쿼리를 실행할 수 있습니다.
```sql
SELECT
    user_agent
FROM visits
WHERE user_id > 50 AND user_id < 150
GROUP BY user_agent
```
```sql
SELECT
    user_agent,
    sum(pages_visited)
FROM visits
GROUP BY user_agent
```

앞서 언급했듯이, `system.query_log` 테이블을 검토할 수 있습니다. `projections` 필드에는 사용된 프로젝션의 이름이 있거나 비어 있을 경우 사용된 것이 없습니다.
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## `_part_offset` 필드를 가진 일반 프로젝션 {#normal-projection-with-part-offset-field}

`_part_offset` 필드를 활용하는 일반 프로젝션으로 테이블 생성:

```sql
CREATE TABLE events
(
    `event_time` DateTime,
    `event_id` UInt64,
    `user_id` UInt64,
    `huge_string` String,
    PROJECTION order_by_user_id
    (
        SELECT
            _part_offset
        ORDER BY user_id
    )
)
ENGINE = MergeTree()
ORDER BY (event_id);
```

일부 샘플 데이터 삽입:

```sql
INSERT INTO events SELECT * FROM generateRandom() LIMIT 100000;
```

### 보조 인덱스로서 `_part_offset` 사용 {#normal-projection-secondary-index}

`_part_offset` 필드는 병합 및 변이 동안 값을 보존하여 보조 인덱싱에 유용합니다. 이를 쿼리에서 활용할 수 있습니다:

```sql
SELECT
    count()
FROM events
WHERE _part_starting_offset + _part_offset IN (
    SELECT _part_starting_offset + _part_offset
    FROM events
    WHERE user_id = 42
)
SETTINGS enable_shared_storage_snapshot_in_query = 1
```


# 프로젝션 조작

다음은 [프로젝션](/engines/table-engines/mergetree-family/mergetree.md/#projections)과 함께 사용할 수 있는 작업입니다:

## 프로젝션 추가 {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - 테이블 메타데이터에 프로젝션 설명을 추가합니다.

## 프로젝션 삭제 {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - 테이블 메타데이터에서 프로젝션 설명을 제거하고 디스크에서 프로젝션 파일을 삭제합니다. [변이](/sql-reference/statements/alter/index.md#mutations)로 구현되었습니다.

## 프로젝션 물리화 {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 쿼리는 `partition_name` 내에서 프로젝션 `name`을 재구축합니다. [변이](/sql-reference/statements/alter/index.md#mutations)로 구현되었습니다.

## 프로젝션 지우기 {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 설명을 제거하지 않고 디스크에서 프로젝션 파일을 삭제합니다. [변이](/sql-reference/statements/alter/index.md#mutations)로 구현되었습니다.

`ADD`, `DROP`, 및 `CLEAR` 명령은 메타데이터를 변경하거나 파일을 제거하는 점에서 경량입니다.

또한, ClickHouse Keeper 또는 ZooKeeper를 통해 프로젝션 메타데이터를 복제하여 동기화합니다.

:::note
프로젝션 조작은 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 엔진(복제된 변형 포함)을 가진 테이블에 대해 지원됩니다.
:::
