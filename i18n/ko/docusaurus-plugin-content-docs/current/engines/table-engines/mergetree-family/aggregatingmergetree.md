---
'description': '같은 기본 키(또는 보다 정확하게, 같은 [정렬 키](../../../engines/table-engines/mergetree-family/mergetree.md))를
  가진 모든 행을 단일 행으로 교체합니다(단일 데이터 파트 내에서). 이 행은 집계 함수의 상태 조합을 저장합니다.'
'sidebar_label': 'AggregatingMergeTree'
'sidebar_position': 60
'slug': '/engines/table-engines/mergetree-family/aggregatingmergetree'
'title': 'AggregatingMergeTree 테이블 엔진'
'doc_type': 'reference'
---


# AggregatingMergeTree 테이블 엔진

이 엔진은 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)에서 상속받아 데이터 파트 병합 로직을 변경합니다. ClickHouse는 동일한 기본 키를 가진 모든 행(더 정확하게는 동일한 [정렬 키](../../../engines/table-engines/mergetree-family/mergetree.md)를 가진 행)을 단일 행으로 대체하며, 이 행은 집계 함수의 상태 조합을 저장합니다(단일 데이터 파트 내에서).

`AggregatingMergeTree` 테이블을 사용하여 집계된 물리화된 뷰를 포함한 증분 데이터 집계를 수행할 수 있습니다.

아래 비디오에서 AggregatingMergeTree와 집계 함수를 사용하는 방법에 대한 예를 볼 수 있습니다:
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Aggregation States in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

이 엔진은 다음 유형의 모든 컬럼을 처리합니다:

- [`AggregateFunction`](../../../sql-reference/data-types/aggregatefunction.md)
- [`SimpleAggregateFunction`](../../../sql-reference/data-types/simpleaggregatefunction.md)

`AggregatingMergeTree`를 사용하는 것은 행 수를 대폭 줄일 수 있을 때 적합합니다.

## 테이블 생성 {#creating-a-table}

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

요청 매개변수에 대한 설명은 [요청 설명](../../../sql-reference/statements/create/table.md)에서 확인하세요.

**쿼리 절**

`AggregatingMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [절](../../../engines/table-engines/mergetree-family/mergetree.md)이 필요합니다.

<details markdown="1">

<summary>테이블 생성에 대한 사용되지 않는 방법</summary>

:::note
새로운 프로젝트에서는 이 방법을 사용하지 마세요. 가능하다면 이전 프로젝트를 위에 설명된 방법으로 전환하세요.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

모든 매개변수는 `MergeTree`와 동일한 의미를 가집니다.
</details>

## SELECT 및 INSERT {#select-and-insert}

데이터를 삽입하려면 집계 -State- 함수를 사용하는 [INSERT SELECT](../../../sql-reference/statements/insert-into.md) 쿼리를 사용하세요. `AggregatingMergeTree` 테이블에서 데이터를 선택할 때는 `GROUP BY` 절과 데이터를 삽입할 때 사용한 동일한 집계 함수를 사용하되, `-Merge` 접미사를 붙입니다.

`SELECT` 쿼리의 결과에서 `AggregateFunction` 유형의 값은 ClickHouse 출력 형식에 대한 구현별 이진 표현을 가집니다. 예를 들어, `SELECT` 쿼리로 데이터를 `TabSeparated` 형식으로 덤프하면, 이 덤프는 `INSERT` 쿼리를 사용하여 다시 로드할 수 있습니다.

## 집계된 물리화된 뷰의 예 {#example-of-an-aggregated-materialized-view}

다음 예제는 `test`라는 데이터베이스가 있다고 가정합니다. 존재하지 않으면 아래 명령어를 사용하여 생성하세요:

```sql
CREATE DATABASE test;
```

이제 원시 데이터를 포함하는 테이블 `test.visits`를 생성합니다:

```sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

다음으로, 방문자 수와 고유 사용자 수를 추적하는 `AggregationFunction`s를 저장할 `AggregatingMergeTree` 테이블이 필요합니다.

`test.visits` 테이블을 감시하고 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 유형을 사용하는 `AggregatingMergeTree` 물리화된 뷰를 생성합니다:

```sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

`test.visits`에서 `test.agg_visits`를 채우는 물리화된 뷰를 생성합니다:

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

`test.visits` 테이블에 데이터를 삽입합니다:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

데이터는 `test.visits`와 `test.agg_visits` 모두에 삽입됩니다.

집계된 데이터를 얻으려면 물리화된 뷰 `test.visits_mv`에서 `SELECT ... GROUP BY ...` 쿼리를 실행합니다:

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

`test.visits`에 또 다른 몇 개의 레코드를 추가하지만, 이번에는 한 레코드에 대해 다른 타임스탬프를 사용해보세요:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

다시 `SELECT` 쿼리를 실행하면 다음과 같은 결과가 반환됩니다:

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

일부 경우, 삽입 시간에 행을 미리 집계하는 것을 피하고 집계 비용을 삽입 시간에서 병합 시간으로 전환하려고 할 수 있습니다. 일반적으로 오류를 피하기 위해 물리화된 뷰 정의의 `GROUP BY` 절에 집계의 일부가 아닌 컬럼을 포함해야 하지만, `optimize_on_insert = 0` (기본적으로 켜져 있음) 설정과 함께 [`initializeAggregation`](/sql-reference/functions/other-functions#initializeAggregation) 함수를 사용할 수 있습니다. 이 경우 `GROUP BY`의 사용은 더 이상 필요하지 않습니다:

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
`initializeAggregation`을 사용할 때, 집계 상태는 그룹화 없이 각 개별 행에 대해 생성됩니다. 각 원본 행은 물리화된 뷰에서 하나의 행을 생성하며, 실제 집계는 `AggregatingMergeTree`가 파트를 병합할 때 발생합니다. 이는 `optimize_on_insert = 0`일 때만 해당됩니다.
:::

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse에서 집계 조합기 사용하기](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
