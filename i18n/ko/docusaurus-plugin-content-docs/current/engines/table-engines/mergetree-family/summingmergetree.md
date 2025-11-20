---
'description': 'SummingMergeTree는 MergeTree 엔진에서 상속됩니다. 그 핵심 기능은 파트 병합 중에 숫자 데이터를
  자동으로 합산할 수 있는 능력입니다.'
'sidebar_label': 'SummingMergeTree'
'sidebar_position': 50
'slug': '/engines/table-engines/mergetree-family/summingmergetree'
'title': 'SummingMergeTree 테이블 엔진'
'doc_type': 'reference'
---


# SummingMergeTree 테이블 엔진

이 엔진은 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)에서 상속됩니다. 차이점은 `SummingMergeTree` 테이블에 대해 데이터를 병합할 때 ClickHouse가 동일한 기본 키를 가진 모든 행(보다 정확하게는 동일한 [정렬 키](../../../engines/table-engines/mergetree-family/mergetree.md)로)을 하나의 행으로 대체하여 숫자 데이터 유형의 컬럼에 대한 합계 값을 포함한다는 것입니다. 정렬 키가 단일 키 값에 많은 행이 대응되도록 구성된 경우, 스토리지 용량이 크게 줄어들고 데이터 선택 속도가 빨라집니다.

우리는 `MergeTree`와 함께 엔진을 사용하는 것을 권장합니다. `MergeTree` 테이블에 전체 데이터를 저장하고, 이 aggregated 데이터 저장을 위해 `SummingMergeTree`를 사용하십시오. 예를 들어, 보고서를 준비할 때 그렇습니다. 이러한 접근 방식은 잘못 구성된 기본 키로 인해 귀중한 데이터를 잃는 것을 방지합니다.

## 테이블 생성 {#creating-a-table}

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

요청 파라미터에 대한 설명은 [요청 설명](../../../sql-reference/statements/create/table.md)을 참조하십시오.

### SummingMergeTree의 파라미터 {#parameters-of-summingmergetree}

#### 컬럼 {#columns}

`columns` - 값이 합산될 컬럼의 이름을 가진 튜플. 선택적 파라미터입니다.
컬럼은 숫자 유형이어야 하며, 파티션 또는 정렬 키에 포함되어서는 안 됩니다.

`columns`가 지정되지 않은 경우 ClickHouse는 정렬 키에 포함되지 않은 모든 숫자 데이터 유형의 컬럼에서 값을 합산합니다.

### 쿼리 구문 {#query-clauses}

`SummingMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [구문](../../../engines/table-engines/mergetree-family/mergetree.md)이 필요합니다.

<details markdown="1">

<summary>테이블 생성에 대한 사용 중단된 방법</summary>

:::note
이 방법은 새로운 프로젝트에서 사용하지 말고, 가능하다면 오래된 프로젝트를 위의 방법으로 전환하십시오.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

`columns`를 제외한 모든 파라미터는 `MergeTree`에서와 동일한 의미를 가집니다.

- `columns` — 합산할 컬럼의 이름을 가진 튜플. 선택적 파라미터입니다. 자세한 설명은 위의 텍스트를 참조하십시오.

</details>

## 사용 예제 {#usage-example}

다음 테이블을 고려하십시오:

```sql
CREATE TABLE summtt
(
    key UInt32,
    value UInt32
)
ENGINE = SummingMergeTree()
ORDER BY key
```

데이터를 삽입합니다:

```sql
INSERT INTO summtt VALUES(1,1),(1,2),(2,1)
```

ClickHouse는 모든 행을 완전히 합산할 수 있지만 ([아래 참조](#data-processing)), 쿼리에서 집계 함수 `sum` 및 `GROUP BY` 구문을 사용합니다.

```sql
SELECT key, sum(value) FROM summtt GROUP BY key
```

```text
┌─key─┬─sum(value)─┐
│   2 │          1 │
│   1 │          3 │
└─────┴────────────┘
```

## 데이터 처리 {#data-processing}

데이터가 테이블에 삽입될 때, 데이터는 원래 그대로 저장됩니다. ClickHouse는 주기적으로 삽입된 데이터 파트를 병합하며, 이때 동일한 기본 키를 가진 행이 합산되어 데이터의 각 결과 파트에 대해 하나로 대체됩니다.

ClickHouse는 데이터 파트를 병합할 수 있기 때문에, 서로 다른 결과 파트는 동일한 기본 키를 가진 행을 포함할 수 있으며, 즉, 합산이 불완전할 수 있습니다. 따라서 (`SELECT`) 쿼리에서 집계 함수 [sum()](/sql-reference/aggregate-functions/reference/sum)와 `GROUP BY` 구문을 사용하는 것이 위의 예처럼 필요합니다.

### 합산에 대한 일반 규칙 {#common-rules-for-summation}

숫자 데이터 유형의 컬럼의 값이 합산됩니다. 컬럼 집합은 `columns` 파라미터로 정의됩니다.

모든 합산 컬럼에서 값이 0인 경우, 행은 삭제됩니다.

컬럼이 기본 키에 없고 합산되지 않는 경우, 기존 값 중 임의의 값이 선택됩니다.

기본 키의 컬럼에 대해서는 값이 합산되지 않습니다.

### AggregateFunction 컬럼에서의 합산 {#the-summation-in-the-aggregatefunction-columns}

[AggregateFunction 유형](../../../sql-reference/data-types/aggregatefunction.md) 컬럼의 경우 ClickHouse는 해당 기능에 따라 집계하는 [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 엔진처럼 작동합니다.

### 중첩 구조 {#nested-structures}

테이블은 특별한 방식으로 처리되는 중첩 데이터 구조를 가질 수 있습니다.

중첩 테이블의 이름이 `Map`으로 끝나고, 다음 기준을 충족하는 두 개 이상의 컬럼이 포함되어 있으면:

- 첫 번째 컬럼은 숫자 `(*Int*, Date, DateTime)` 또는 문자열 `(String, FixedString)`이며, `key`라고 부르겠습니다,
- 다른 컬럼은 산술 `(*Int*, Float32/64)`이며, `(values...)`라고 부르겠습니다,

그러면 이 중첩 테이블은 `key => (values...)`의 매핑으로 해석되며, 행을 병합할 때 두 데이터 세트의 요소가 `key`에 따라 합산되어 `(values...)`가 됩니다.

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

데이터를 요청할 때, `Map`의 집계를 위해 [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) 함수를 사용하십시오.

중첩 데이터 구조의 경우, 합산을 위한 컬럼의 튜플에 해당 컬럼을 명시할 필요가 없습니다.

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse에서 집계 조합기 사용하기](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
