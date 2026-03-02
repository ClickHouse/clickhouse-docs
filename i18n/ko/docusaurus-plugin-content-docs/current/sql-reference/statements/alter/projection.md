---
description: '프로젝션 조작 방법에 대한 문서'
sidebar_label: 'PROJECTION'
sidebar_position: 49
slug: /sql-reference/statements/alter/projection
title: '프로젝션'
doc_type: 'reference'
---

이 문서에서는 프로젝션이 무엇인지, 어떻게 사용할 수 있는지, 그리고 프로젝션을 조작하는 다양한 옵션을 설명합니다.

## 프로젝션 개요 \{#overview\}

프로젝션은 데이터를 쿼리 실행에 최적화된 형식으로 저장하며, 다음과 같은 경우에 유용합니다:

- 기본 키에 포함되지 않은 컬럼에 대해 쿼리를 실행하는 경우
- 컬럼을 사전 집계해 연산과 I/O를 모두 줄이는 경우

하나의 테이블에 하나 이상의 프로젝션을 정의할 수 있으며, 쿼리 분석 시 스캔해야 할 데이터가 가장 적은 프로젝션을 ClickHouse가 선택합니다. 이때 사용자가 작성한 쿼리는 변경되지 않습니다.

:::note[Disk usage]
프로젝션은 내부적으로 새로운 숨겨진 테이블을 생성하므로, 더 많은 I/O와 디스크 공간이 필요합니다.
예를 들어, 프로젝션에 서로 다른 기본 키가 정의된 경우 원본 테이블의 모든 데이터가 복제됩니다.
:::

프로젝션이 내부적으로 어떻게 동작하는지에 대한 보다 기술적인 세부 사항은 이 [페이지](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections)에서 확인할 수 있습니다.

## 프로젝션 사용하기 \{#examples\}

### 기본 키 없이 필터링하는 예 \{#example-filtering-without-using-primary-keys\}

테이블을 생성합니다:

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

`ALTER TABLE` 명령을 사용하여 기존 테이블에 PROJECTION을 추가할 수 있습니다:

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

Projection을 사용하면 원본 테이블에서 `user_name`이 `PRIMARY_KEY`로 정의되지 않았더라도 `user_name` 기준으로 빠르게 필터링할 수 있습니다.
쿼리 실행 시점에 ClickHouse는 데이터가 `user_name`으로 정렬되어 있으므로 Projection을 사용하는 것이 처리해야 할 데이터 양을 줄인다고 판단했습니다.

```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

쿼리가 프로젝션을 사용하고 있는지 확인하려면 `system.query_log` 테이블을 살펴보면 됩니다. `projections` 필드에는 사용된 프로젝션의 이름이 기록되며, 사용된 프로젝션이 없으면 비어 있습니다.

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


### 사전 집계 예제 쿼리 \{#example-pre-aggregation-query\}

`projection_visits_by_user` 프로젝션이 포함된 테이블을 생성합니다:

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

데이터를 삽입하십시오:

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

`user_agent` 필드를 사용하여 `GROUP BY`가 포함된 첫 번째 쿼리를 실행합니다.
이 쿼리는 사전 집계가 일치하지 않기 때문에 정의된 프로젝션을 사용하지 않습니다.

```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

PROJECTION을 활용하려면 사전 집계(pre-aggregation) 및 `GROUP BY`에 사용된 필드의 일부 또는 전체를 선택하는 쿼리를 실행하면 됩니다.

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

앞에서 언급했듯이, `system.query_log` 테이블을 확인하면 프로젝션이 사용되었는지 파악할 수 있습니다.
`projections` 필드는 사용된 프로젝션의 이름을 표시합니다.
프로젝션이 사용되지 않은 경우 이 필드는 비어 있습니다:

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


### `_part_offset` 필드를 사용하는 일반 프로젝션 \{#normal-projection-with-part-offset-field\}

`_part_offset` 필드를 활용하는 일반 프로젝션을 포함한 테이블을 생성합니다:

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

샘플 데이터를 삽입합니다:

```sql
INSERT INTO events SELECT * FROM generateRandom() LIMIT 100000;
```


#### `_part_offset`를 보조 인덱스로 사용하기 \{#normal-projection-secondary-index\}

`_part_offset` 필드는 머지와 뮤테이션이 수행되는 동안에도 값이 유지되므로 보조 인덱스로 활용하는 데 유용합니다. 쿼리에서 다음과 같이 활용할 수 있습니다.

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


## 프로젝션 관리 \{#manipulating-projections\}

[프로젝션](/engines/table-engines/mergetree-family/mergetree.md/#projections)에 대해 다음 작업을 수행할 수 있습니다:

### ADD PROJECTION \{#add-projection\}

다음 문을 사용하여 테이블 메타데이터에 PROJECTION 설명을 추가합니다:

```sql
ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] ) [WITH SETTINGS ( setting_name1 = setting_value1, setting_name2 = setting_value2, ...)]
```


#### `WITH SETTINGS` 절 \{#with-settings\}

`WITH SETTINGS`는 **프로젝션 수준의 설정**을 정의하며, 프로젝션이 데이터를 저장하는 방식을 구성합니다(예: `index_granularity` 또는 `index_granularity_bytes`).
이는 **MergeTree 테이블 설정**과 직접 대응하지만, **해당 프로젝션에만** 적용됩니다.

예시:

```sql
ALTER TABLE t
ADD PROJECTION p (
    SELECT x ORDER BY x
) WITH SETTINGS (
    index_granularity = 4096,
    index_granularity_bytes = 1048576
);
```

Projection 설정은 Projection에 적용되는 실제 테이블 설정을, 검증 규칙을 준수하는 범위 내에서 재정의합니다(예: 잘못되었거나 호환되지 않는 재정의는 거부됩니다).


### DROP PROJECTION \{#drop-projection\}

아래 SQL 문을 사용하여 테이블 메타데이터에서 프로젝션 정의를 제거하고 디스크에서 프로젝션 파일을 삭제합니다.
이는 [뮤테이션](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

```sql
ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name
```


### MATERIALIZE PROJECTION \{#materialize-projection\}

아래 SQL 문을 사용하여 파티션 `partition_name` 내의 projection `name`을(를) 재구성합니다.
이는 [뮤테이션](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]
```


### CLEAR PROJECTION \{#clear-projection\}

아래 SQL 문을 사용하여 프로젝션 정의는 유지한 채 디스크에서 프로젝션 파일을 삭제할 수 있습니다.
이는 [뮤테이션](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]
```

`ADD`, `DROP`, `CLEAR` 명령은 메타데이터만 변경하거나 파일만 제거한다는 점에서 가벼운 명령입니다.
또한 이 명령은 복제되며, ClickHouse Keeper 또는 ZooKeeper를 통해 프로젝션(projection) 메타데이터를 동기화합니다.

:::note
프로젝션(projection) 조작은 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 엔진( [복제(replication)](/engines/table-engines/mergetree-family/replication.md) 변형 포함)을 사용하는 테이블에서만 지원됩니다.
:::


### 프로젝션 파트 병합 동작 제어 \{#control-projections-merges\}

쿼리를 실행할 때 ClickHouse는 원본 테이블에서 읽을지, 해당 테이블의 프로젝션 중 하나에서 읽을지 선택합니다.
원본 테이블에서 읽을지, 프로젝션 중 하나에서 읽을지는 각 테이블 파트마다 개별적으로 결정됩니다.
ClickHouse는 일반적으로 가능한 한 적은 데이터만 읽는 것을 목표로 하며, 예를 들어 파트의 기본 키를 샘플링하는 등 몇 가지 기법을 사용해 어떤 파트에서 읽는 것이 최적인지 판별합니다.
일부 경우에는 원본 테이블 파트에 대응되는 프로젝션 파트가 없을 수 있습니다.
예를 들어, SQL에서 테이블에 대한 프로젝션을 생성하는 작업은 기본적으로 「지연(lazy)」 방식이기 때문에 새로 삽입되는 데이터에만 영향을 주고 기존 파트는 변경하지 않으므로 이런 상황이 발생할 수 있습니다.

프로젝션 중 하나는 이미 미리 계산된 집계 값을 포함하고 있으므로, ClickHouse는 쿼리 실행 시 다시 집계를 수행하지 않기 위해 해당 프로젝션 파트에서 읽으려고 시도합니다. 특정 파트에 대응되는 프로젝션 파트가 없는 경우, 쿼리 실행은 원본 파트를 다시 사용합니다.

하지만 원본 테이블의 행이 복잡한 데이터 파트 백그라운드 병합으로 인해 비단순하게 변경되면 어떻게 될까요?
예를 들어, 테이블이 `ReplacingMergeTree` 테이블 엔진을 사용해 저장된 경우를 가정합니다.
병합 중에 동일한 행이 여러 입력 파트에서 감지되면, 가장 최근에 삽입된 파트에서 온 최신 행 버전만 유지되고, 더 오래된 버전은 모두 폐기됩니다.

마찬가지로, 테이블이 `AggregatingMergeTree` 테이블 엔진을 사용해 저장된 경우, 병합 작업은 입력 파트에서 동일한 행(기본 키 값 기준)을 하나의 행으로 접어 부분 집계 상태를 갱신할 수 있습니다.

ClickHouse v24.8 이전에는 프로젝션 파트가 메인 데이터와 암묵적으로 동기화되지 않은 상태가 되거나, 테이블에 프로젝션이 있는 경우 데이터베이스가 자동으로 예외를 발생시켰기 때문에 업데이트 및 삭제와 같은 특정 작업을 아예 실행할 수 없었습니다.

v24.8부터는 새로운 테이블 수준 설정 [`deduplicate_merge_projection_mode`](/operations/settings/merge-tree-settings#deduplicate_merge_projection_mode)가 앞에서 언급한 복잡한 백그라운드 병합 작업이 원본 테이블의 파트에서 발생할 때의 동작을 제어합니다.

삭제 뮤테이션은 원본 테이블의 파트에서 행을 제거하는 또 다른 파트 병합 작업의 예입니다. v24.7부터는 경량한 삭제로 인해 트리거되는 삭제 뮤테이션의 동작을 제어하기 위한 설정도 함께 제공됩니다: [`lightweight_mutation_projection_mode`](/operations/settings/merge-tree-settings#deduplicate_merge_projection_mode).

아래는 `deduplicate_merge_projection_mode`와 `lightweight_mutation_projection_mode` 모두에 대해 설정 가능한 값은 다음과 같습니다:

- `throw` (기본값): 예외를 발생시켜 프로젝션 파트가 동기화 상태에서 벗어나는 것을 방지합니다.
- `drop`: 영향을 받는 프로젝션 테이블 파트를 드롭합니다. 쿼리는 해당 프로젝션 파트에 대해서는 원본 테이블 파트를 사용합니다.
- `rebuild`: 영향을 받는 프로젝션 파트를 다시 빌드하여 원본 테이블 파트의 데이터와 일관성을 유지합니다.

## 함께 보기 \{#see-also\}

- ["머지 과정에서의 프로젝션 제어" (블로그 게시물)](https://clickhouse.com/blog/clickhouse-release-24-08#control-of-projections-during-merges)
- ["프로젝션" (가이드)](/data-modeling/projections#using-projections-to-speed-up-UK-price-paid)
- ["Materialized Views와 프로젝션 비교"](https://clickhouse.com/docs/managing-data/materialized-views-versus-projections)