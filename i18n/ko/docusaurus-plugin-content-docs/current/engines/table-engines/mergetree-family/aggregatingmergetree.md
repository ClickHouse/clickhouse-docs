---
description: '동일한 기본 키(primary key)(정확히는 동일한 [정렬 키(sorting key)](../../../engines/table-engines/mergetree-family/mergetree.md))를 가진 모든 행을, 집계 함수 상태들의 조합을 저장하는 단일 행(하나의 데이터 파트 내에서)으로 대체합니다.'
sidebar_label: 'AggregatingMergeTree'
sidebar_position: 60
slug: /engines/table-engines/mergetree-family/aggregatingmergetree
title: 'AggregatingMergeTree 테이블 엔진'
doc_type: 'reference'
---



# AggregatingMergeTree 테이블 엔진 \{#aggregatingmergetree-table-engine\}

이 엔진은 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)를 상속하며, 데이터 파트 병합 로직을 변경합니다. ClickHouse는 동일한 기본 키(보다 정확히는 동일한 [정렬 키](../../../engines/table-engines/mergetree-family/mergetree.md))를 가진 모든 행을 단일 행(단일 데이터 파트 내)으로 대체하며, 이 행에는 집계 함수 상태들의 조합이 저장됩니다.

`AggregatingMergeTree` 테이블은 집계된 materialized view를 포함하여 증분 데이터 집계에 사용할 수 있습니다.

아래 동영상에서 AggregatingMergeTree와 Aggregate 함수 사용 예제를 확인할 수 있습니다:
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="ClickHouse에서 집계 상태 사용하기" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

이 엔진은 다음 타입의 모든 컬럼을 처리합니다:

- [`AggregateFunction`](../../../sql-reference/data-types/aggregatefunction.md)
- [`SimpleAggregateFunction`](../../../sql-reference/data-types/simpleaggregatefunction.md)

행 수를 자릿수 단위로 크게 줄일 수 있는 경우 `AggregatingMergeTree`를 사용하는 것이 적합합니다.



## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = AggregatingMergeTree()
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[TTL expr]
[SETTINGS name=value, ...]
```

요청 매개변수에 대한 설명은 [요청 설명](../../../sql-reference/statements/create/table.md)을 참조하십시오.

**쿼리 절**

`AggregatingMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [절](../../../engines/table-engines/mergetree-family/mergetree.md)이 필요합니다.

<details markdown="1">
  <summary>테이블 생성의 더 이상 사용되지 않는 방법</summary>

  :::note
  새로운 프로젝트에서는 이 방법을 사용하지 말고, 가능하다면 기존 프로젝트도 위에서 설명한 방법으로 전환하십시오.
  :::

  ```sql
  CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
  (
      name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
      name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
      ...
  ) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
  ```

  모든 매개변수는 `MergeTree`에서와 동일한 의미를 가집니다.
</details>


## SELECT and INSERT \{#select-and-insert\}

데이터를 삽입하려면 집계 `-State-` 함수와 함께 [INSERT SELECT](../../../sql-reference/statements/insert-into.md) 쿼리를 사용합니다.
`AggregatingMergeTree` 테이블에서 데이터를 조회할 때는 `GROUP BY` 절과, 데이터를 삽입할 때 사용한 것과 동일한 집계 함수를 사용하되 `-Merge` 접미사를 사용합니다.

`SELECT` 쿼리 결과에서 `AggregateFunction` 타입의 값은 모든 ClickHouse 출력 형식에서 구현별 이진 표현을 가집니다. 예를 들어 `SELECT` 쿼리로 데이터를 `TabSeparated` 형식으로 내보냈다면, 이 데이터를 `INSERT` 쿼리를 사용하여 다시 로드할 수 있습니다.



## 집계 materialized view 예시 \{#example-of-an-aggregated-materialized-view\}

다음 예시는 `test`라는 이름의 데이터베이스가 있다고 가정합니다. 아직 없다면 아래 명령으로 생성하십시오:

```sql
CREATE DATABASE test;
```

이제 원시 데이터를 저장할 `test.visits` 테이블을 CREATE합니다:

```sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

다음으로, 총 방문 수와 고유 사용자 수를 추적하는 `AggregationFunction`들을 저장하는 데 사용할 `AggregatingMergeTree` 테이블이 필요합니다.

`test.visits` 테이블을 모니터링하고 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 타입을 사용하는 `AggregatingMergeTree` materialized view를 생성하십시오.

```sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

`test.visits`의 데이터를 사용해 `test.agg_visits`를 채우는 materialized view를 생성합니다:

```sql
CREATE MATERIALIZED VIEW test.visits_mv TO test.agg_visits
AS SELECT
    StartDate,
    CounterID,
    sumState(Sign) AS Visits,
    uniqState(UserID) AS Users
FROM test.visits
GROUP BY StartDate, CounterID;
```

`test.visits` 테이블에 데이터를 삽입하십시오:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

데이터는 `test.visits`와 `test.agg_visits` 두 테이블 모두에 삽입됩니다.

집계된 데이터를 가져오려면 materialized view `test.visits_mv`에서 `SELECT ... GROUP BY ...`와 같은 쿼리를 실행합니다.

```sql
SELECT
    StartDate,
    sumMerge(Visits) AS Visits,
    uniqMerge(Users) AS Users
FROM test.visits_mv
GROUP BY StartDate
ORDER BY StartDate;
```

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │      9 │     2 │
└─────────────────────────┴────────┴───────┘
```

`test.visits`에 레코드를 두 개 더 추가합니다. 이번에는 그중 하나에는 다른 타임스탬프를 사용해 보십시오:`

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

`SELECT` 쿼리를 다시 실행하면 다음과 같은 결과가 반환됩니다:`

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

경우에 따라, 집계 비용을 삽입 시점에서 머지 시점으로 이전하기 위해 삽입 시점의 사전 집계를 피하고자 할 수 있습니다. 일반적으로는 오류를 방지하기 위해, 집계에 포함되지 않는 컬럼을 materialized view 정의의 `GROUP BY` 절에 포함해야 합니다. 그러나 기본값으로 활성화되어 있는 설정인 `optimize_on_insert = 0`과 함께 [`initializeAggregation`](/sql-reference/functions/other-functions#initializeAggregation) 함수를 사용하여 이를 달성할 수 있습니다. 이 경우 `GROUP BY`가 더 이상 필요하지 않습니다:

```sql
CREATE MATERIALIZED VIEW test.visits_mv TO test.agg_visits
AS SELECT
    StartDate,
    CounterID,
    initializeAggregation('sumState', Sign) AS Visits,
    initializeAggregation('uniqState', UserID) AS Users
FROM test.visits;
```


:::note
`initializeAggregation`을 사용할 때는 그룹화 없이 각 개별 행에 대해 집계 상태가 생성됩니다.
각 소스 행은 구체화된 뷰(Materialized View)에 하나의 행을 생성하며, 실제 집계는 이후 `AggregatingMergeTree`가 파트를 병합할 때 수행됩니다.
이는 `optimize_on_insert = 0`인 경우에만 해당합니다.
:::



## 관련 콘텐츠 \{#related-content\}

- 블로그 글: [ClickHouse에서 Aggregate Combinator 활용하기](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
