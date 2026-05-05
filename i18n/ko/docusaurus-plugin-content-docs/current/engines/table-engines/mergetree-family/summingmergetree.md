---
description: 'SummingMergeTree는 MergeTree 엔진을 상속한 엔진입니다. 이 엔진의 핵심 기능은 파트 병합 시 숫자 데이터를 자동으로 합산하는 것입니다.'
sidebar_label: 'SummingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/summingmergetree
title: 'SummingMergeTree 테이블 엔진'
doc_type: 'reference'
---

# SummingMergeTree 테이블 엔진 \{#summingmergetree-table-engine\}

이 엔진은 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)를 상속합니다. 차이점은 `SummingMergeTree` 테이블의 데이터 파트를 병합할 때 ClickHouse가 동일한 기본 키(보다 정확하게는 동일한 [정렬 키](../../../engines/table-engines/mergetree-family/mergetree.md))를 가진 모든 행을, 숫자 데이터 타입 컬럼의 값을 합산한 하나의 행으로 대체한다는 점입니다. 정렬 키가 하나의 키 값에 매우 많은 행이 대응되도록 구성되어 있다면, 저장 공간을 크게 줄이고 데이터 조회 속도를 높일 수 있습니다.

이 엔진은 `MergeTree`와 함께 사용하는 것을 권장합니다. 전체 데이터는 `MergeTree` 테이블에 저장하고, 예를 들어 보고서를 준비할 때와 같이 집계된 데이터를 저장할 때는 `SummingMergeTree`를 사용하십시오. 이러한 접근 방식은 잘못 구성된 기본 키로 인해 중요한 데이터를 잃어버리는 일을 방지하는 데 도움이 됩니다.

## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = SummingMergeTree([columns])
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

요청 파라미터 설명은 [요청 설명](../../../sql-reference/statements/create/table.md)을 참조하십시오.


### SummingMergeTree 매개변수 \{#parameters-of-summingmergetree\}

#### Columns \{#columns\}

`columns` - 값을 합산할 컬럼 이름들의 튜플입니다. 선택적 매개변수입니다.
    이 컬럼들은 숫자형 타입이어야 하며, 파티션 키나 정렬 키에 포함되어서는 안 됩니다.

`columns`가 지정되지 않으면 ClickHouse는 정렬 키에 포함되지 않은 모든 숫자형 데이터 타입 컬럼의 값을 합산합니다.

### 쿼리 절 \{#query-clauses\}

`SummingMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [절](../../../engines/table-engines/mergetree-family/mergetree.md)이 필요합니다.

<details markdown="1">

<summary>테이블을 생성하는 사용 중단된 방법</summary>

:::note
새 프로젝트에서는 이 방법을 사용하지 말고, 가능하다면 기존 프로젝트도 위에서 설명한 방법으로 전환하십시오.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

`columns`를 제외한 모든 매개변수는 `MergeTree`에서와 동일한 의미를 가집니다.

- `columns` — 합산할 컬럼들의 이름으로 구성된 tuple입니다. 선택적 매개변수입니다. 설명은 위의 내용을 참조하십시오.

</details>

## 사용 예시 \{#usage-example\}

다음과 같은 테이블이 있다고 가정합니다:

```sql
CREATE TABLE summtt
(
    key UInt32,
    value UInt32
)
ENGINE = SummingMergeTree()
ORDER BY key
```

데이터를 삽입하십시오:

```sql
INSERT INTO summtt VALUES(1,1),(1,2),(2,1)
```

ClickHouse는 모든 행을 빠짐없이 합산하지 않을 수 있으므로 ([아래 참조](#data-processing)), 쿼리에서 집계 함수 `sum`과 `GROUP BY` 절을 사용합니다.

```sql
SELECT key, sum(value) FROM summtt GROUP BY key
```

```text
┌─key─┬─sum(value)─┐
│   2 │          1 │
│   1 │          3 │
└─────┴────────────┘
```


## Data processing \{#data-processing\}

데이터가 테이블에 삽입되면, 원본 그대로 저장됩니다. ClickHouse는 삽입된 데이터 파트를 주기적으로 병합하며, 이때 동일한 기본 키를 가진 행들을 합산하여 각 결과 데이터 파트마다 하나의 행으로 대체합니다.

ClickHouse가 데이터 파트를 병합할 때, 병합 결과로 생성된 서로 다른 데이터 파트 각각에 동일한 기본 키를 가진 행이 포함될 수 있습니다. 즉, 합산이 불완전할 수 있습니다. 따라서 위의 예시에서 설명한 것처럼 쿼리에서 (`SELECT`) 집계 함수 [sum()](/sql-reference/aggregate-functions/reference/sum)와 `GROUP BY` 절을 함께 사용해야 합니다.

### 합산에 대한 일반 규칙 \{#common-rules-for-summation\}

숫자형 데이터 타입 컬럼의 값이 합산됩니다. 컬럼 집합은 `columns` 파라미터로 정의합니다.

합산 대상인 모든 컬럼의 값이 0이면, 해당 행은 삭제됩니다.

컬럼이 기본 키에 없고 합산 대상도 아니라면, 기존 값 중 임의의 값이 선택됩니다.

기본 키에 포함된 컬럼의 값은 합산되지 않습니다.

### AggregateFunction 컬럼의 합계 처리 \{#the-summation-in-the-aggregatefunction-columns\}

[AggregateFunction 타입](../../../sql-reference/data-types/aggregatefunction.md)의 컬럼에 대해서는 ClickHouse가 해당 함수에 따라 집계를 수행하는 [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 엔진처럼 동작합니다.

### 중첩 구조 \{#nested-structures\}

테이블에는 특별한 방식으로 처리되는 중첩 데이터 구조가 있을 수 있습니다.

만약 중첩 테이블의 이름이 `Map`으로 끝나고, 다음 기준을 만족하는 최소 두 개의 컬럼을 포함한다면:

* 첫 번째 컬럼은 숫자형 `(*Int*, Date, DateTime)` 또는 문자열형 `(String, FixedString)`이며, 이를 `key`라고 합니다.
* 나머지 컬럼들은 산술형 `(*Int*, Float32/64)`이며, 이를 `(values...)`라고 합니다.

이 경우, 해당 중첩 테이블은 `key => (values...)`의 매핑으로 해석되며, 행을 병합할 때 두 데이터 집합의 요소들은 `key`를 기준으로 병합되고, 이에 대응하는 `(values...)`는 합산됩니다.

예시:

```text
DROP TABLE IF EXISTS nested_sum;
CREATE TABLE nested_sum
(
    date Date,
    site UInt32,
    hitsMap Nested(
        browser String,
        imps UInt32,
        clicks UInt32
    )
) ENGINE = SummingMergeTree
PRIMARY KEY (date, site);

INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['Firefox', 'Opera'], [10, 5], [2, 1]);
INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['Chrome', 'Firefox'], [20, 1], [1, 1]);
INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['IE'], [22], [0]);
INSERT INTO nested_sum VALUES ('2020-01-01', 10, ['Chrome'], [4], [3]);

OPTIMIZE TABLE nested_sum FINAL; -- emulate merge 

SELECT * FROM nested_sum;
┌───────date─┬─site─┬─hitsMap.browser───────────────────┬─hitsMap.imps─┬─hitsMap.clicks─┐
│ 2020-01-01 │   10 │ ['Chrome']                        │ [4]          │ [3]            │
│ 2020-01-01 │   12 │ ['Chrome','Firefox','IE','Opera'] │ [20,11,22,5] │ [1,3,0,1]      │
└────────────┴──────┴───────────────────────────────────┴──────────────┴────────────────┘

SELECT
    site,
    browser,
    impressions,
    clicks
FROM
(
    SELECT
        site,
        sumMap(hitsMap.browser, hitsMap.imps, hitsMap.clicks) AS imps_map
    FROM nested_sum
    GROUP BY site
)
ARRAY JOIN
    imps_map.1 AS browser,
    imps_map.2 AS impressions,
    imps_map.3 AS clicks;

┌─site─┬─browser─┬─impressions─┬─clicks─┐
│   12 │ Chrome  │          20 │      1 │
│   12 │ Firefox │          11 │      3 │
│   12 │ IE      │          22 │      0 │
│   12 │ Opera   │           5 │      1 │
│   10 │ Chrome  │           4 │      3 │
└──────┴─────────┴─────────────┴────────┘
```

데이터를 요청할 때는 `맵` 집계를 위해 [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/sumMappedArrays.md) 함수를 사용합니다.

중첩된 데이터 구조에서는 합계를 위한 컬럼 튜플에 해당 컬럼들을 별도로 지정할 필요가 없습니다.


## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse에서 Aggregate Combinator 활용하기](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)