---
description: 'MergeTree에서 상속하며, 머지 과정에서 행을 축소하는 로직이 추가된 엔진입니다.'
keywords: ['업데이트', '축소']
sidebar_label: 'CollapsingMergeTree'
sidebar_position: 70
slug: /engines/table-engines/mergetree-family/collapsingmergetree
title: 'CollapsingMergeTree 테이블 엔진'
doc_type: 'guide'
---



# CollapsingMergeTree 테이블 엔진 \{#collapsingmergetree-table-engine\}



## 설명 \{#description\}

`CollapsingMergeTree` 엔진은 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)를 상속하며,
머지(merge) 과정에서 행을 축약(collapse)하는 로직을 추가합니다.
`CollapsingMergeTree` 테이블 엔진은 비동기적으로,
특수 필드 `Sign`을 제외한 모든 정렬 키(`ORDER BY`) 필드 값이 동일하고
`Sign` 필드 값이 `1` 또는 `-1`인 행 쌍을 삭제(축약)합니다.
반대 부호의 `Sign` 값을 갖는 짝이 없는 행은 유지됩니다.

자세한 내용은 이 문서의 [Collapsing](#table_engine-collapsingmergetree-collapsing) 섹션을 참고하십시오.

:::note
이 엔진은 저장소 사용량을 크게 줄일 수 있으며,
그 결과 `SELECT` 쿼리의 효율성이 향상됩니다.
:::



## 매개변수 \{#parameters\}

이 테이블 엔진의 모든 매개변수는 `Sign` 매개변수를 제외하면
[`MergeTree`](/engines/table-engines/mergetree-family/mergetree)에서와 동일한 의미를 가집니다.

- `Sign` — 행 유형을 나타내는 컬럼 이름으로, `1`은 "state" 행, `-1`은 "cancel" 행을 의미합니다. 타입: [Int8](/sql-reference/data-types/int-uint).



## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) 
ENGINE = CollapsingMergeTree(Sign)
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

<details markdown="1">
  <summary>테이블을 생성하는 사용 중단된 방법</summary>

  :::note
  아래 방법은 새로운 프로젝트에서 사용하는 것을 권장하지 않습니다.
  가능하다면 기존 프로젝트를 업데이트하여 새로운 방법을 사용하도록 하는 것이 좋습니다.
  :::

  ```sql
  CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
  (
      name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
      name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
      ...
  ) 
  ENGINE [=] CollapsingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, Sign)
  ```

  `Sign` — 행 유형을 나타내는 [Int8](/sql-reference/data-types/int-uint) 타입 컬럼의 이름으로, `1`은 「state」 행을, `-1`은 「cancel」 행을 의미합니다.
</details>

* 쿼리 매개변수에 대한 설명은 [쿼리 설명](../../../sql-reference/statements/create/table.md)을 참조하십시오.
* `CollapsingMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [쿼리 절](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)이 필요합니다.


## Collapsing \{#table_engine-collapsingmergetree-collapsing\}

### Data \{#data\}

특정 객체에 대해 지속적으로 변경되는 데이터를 저장해야 하는 상황을 생각해 보십시오.
객체마다 하나의 행만 두고 무언가 변경될 때마다 이를 업데이트하는 것이 논리적으로 들릴 수 있지만,
업데이트 연산은 저장소의 데이터를 다시 기록해야 하므로 DBMS 입장에서는 비용이 많이 들고 느린 작업입니다.
데이터를 빠르게 기록해야 하는 경우, 대량의 업데이트를 수행하는 방식은 허용 가능한 접근 방식이 아니며
항상 객체의 변경 사항을 순차적으로 기록할 수 있습니다.
이를 위해 특수한 컬럼 `Sign`을 사용합니다.

* `Sign` = `1`이면 해당 행은 「state」 행을 의미합니다: *현재 유효한 상태를 나타내는 필드들을 포함하는 행*입니다.
* `Sign` = `-1`이면 해당 행은 「cancel」 행을 의미합니다: *동일한 속성을 가진 객체의 상태를 취소하는 데 사용되는 행*입니다.

예를 들어, 어떤 웹사이트에서 사용자가 확인한 페이지 수와 각 페이지를 얼마나 오래 방문했는지 계산하려고 한다고 가정합니다.
특정 시점에 사용자 활동 상태를 나타내는 다음과 같은 행을 기록합니다:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

이후 시점에는 사용자 활동의 변경을 기록하고 이를 다음 두 개의 행으로 표현합니다.

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

첫 번째 행은 객체의 이전 상태(이 경우에는 사용자를 나타냄)를 상쇄하여 무효화합니다.
이 행은 `Sign`을 제외한 &quot;canceled&quot; 행의 모든 정렬 키 필드를 그대로 복사해야 합니다.
위의 두 번째 행은 현재 상태를 나타냅니다.

사용자 활동의 마지막 상태만 필요하므로, 아래에 표시된 것처럼 원래 &quot;state&quot; 행과 삽입한 &quot;cancel&quot; 행을 삭제하여 객체의 잘못된(이전) 상태를 하나로 축약할 수 있습니다.

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- old "state" row can be deleted
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "cancel" row can be deleted
│ 4324182021466249494 │         6 │      185 │    1 │ -- new "state" row remains
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree`는 데이터 파트를 머지하는 동안 바로 이 *축약(collapse)* 동작을 수행합니다.

:::note
각 변경에 대해 두 개의 행이 필요한 이유는
[Algorithm](#table_engine-collapsingmergetree-collapsing-algorithm) 단락에서 자세히 설명합니다.
:::

**이러한 접근 방식의 특징**

1. 데이터를 기록하는 프로그램은 객체의 상태를 기억하고 있어야 취소할 수 있습니다. &quot;cancel&quot; 행에는 &quot;state&quot;의 정렬 키 필드 복사본과 반대되는 `Sign`이 포함되어야 합니다. 이는 초기 저장 공간 사용량을 늘리지만, 데이터를 빠르게 기록할 수 있게 해 줍니다.
2. 컬럼에서 길이가 계속 증가하는 배열은 쓰기 부하 증가로 인해 엔진 효율을 떨어뜨립니다. 데이터가 단순할수록 효율이 높아집니다.
3. `SELECT` 결과는 객체 변경 이력의 일관성에 강하게 의존합니다. 데이터를 삽입용으로 준비할 때 주의해야 합니다. 일관성이 없는 데이터에서는 예측 불가능한 결과가 발생할 수 있습니다. 예를 들어, 세션 깊이와 같은 음수가 될 수 없는 메트릭에 대해 음수 값이 나타날 수 있습니다.

### Algorithm \{#table_engine-collapsingmergetree-collapsing-algorithm\}

ClickHouse가 데이터 [parts](/concepts/glossary#parts)를 머지할 때,
동일한 정렬 키(`ORDER BY`)를 가진 연속 행 그룹은 최대 두 개의 행으로 축소됩니다.
`Sign` = `1`인 &quot;state&quot; 행과 `Sign` = `-1`인 &quot;cancel&quot; 행입니다.
즉, ClickHouse에서는 엔트리가 축약(collapse)됩니다.


각 결과 데이터 파트에 대해 ClickHouse는 다음을 저장합니다.

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| "state" 행과 "cancel" 행의 개수가 같고 마지막 행이 "state" 행인 경우, 첫 번째 "cancel" 행과 마지막 "state" 행을 저장합니다. |
|2.| "state" 행이 "cancel" 행보다 더 많은 경우, 마지막 "state" 행을 저장합니다.                                                            |
|3.| "cancel" 행이 "state" 행보다 더 많은 경우, 첫 번째 "cancel" 행을 저장합니다.                                                          |
|4.| 그 밖의 모든 경우에는 어떤 행도 저장하지 않습니다.                                                                                               |

또한 "state" 행이 "cancel" 행보다 최소 2개 이상 더 많거나, "cancel" 행이 "state" 행보다 최소 2개 이상 더 많은 경우에는 병합이 계속 진행됩니다.
그러나 ClickHouse는 이 상황을 논리적 오류로 간주하고 서버 로그에 기록합니다. 
이 오류는 동일한 데이터가 여러 번 삽입된 경우에 발생할 수 있습니다. 
따라서 collapsing 동작은 통계 계산 결과를 변경하지 않아야 합니다.
변경 내용은 점진적으로 collapse되어, 결국 거의 모든 객체에 대해 마지막 상태만 남게 됩니다.

`Sign` 컬럼이 필요한 이유는 병합 알고리즘이 동일한 정렬 키를 가진 모든 행이 동일한 결과 데이터 파트에, 나아가 동일한 물리 서버에 있을 것이라는 보장을 하지 못하기 때문입니다. 
ClickHouse는 여러 스레드로 `SELECT` 쿼리를 처리하며, 결과에서 행의 순서를 예측할 수 없습니다. 

`CollapsingMergeTree` 테이블에서 완전히 "collapsed"된 데이터를 얻어야 한다면 집계가 필요합니다.
collapsing을 최종적으로 마무리하려면, `GROUP BY` 절과 sign을 반영하는 집계 함수를 사용하여 쿼리를 작성하십시오. 
예를 들어 개수를 계산할 때는 `count()` 대신 `sum(Sign)`을 사용하십시오. 
어떤 합을 계산하려면, 아래 [예시](#example-of-use)와 같이 `sum(x)` 대신 `sum(Sign * x)`와 `HAVING sum(Sign) > 0`을 함께 사용하십시오.

`count`, `sum`, `avg` 집계는 이 방식으로 계산할 수 있습니다. 
`uniq` 집계는 객체가 적어도 하나의 collapse되지 않은(non-collapsed) 상태를 가진 경우 계산할 수 있습니다. 
`min` 및 `max` 집계는 `CollapsingMergeTree`가 collapsed 상태의 이력을 저장하지 않기 때문에 계산할 수 없습니다.

:::note
집계 없이 데이터를 추출해야 하는 경우
(예를 들어, 최신 값이 특정 조건과 일치하는 행이 존재하는지 확인해야 하는 경우),
`FROM` 절에 대해 [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 수정자를 사용할 수 있습니다. 이 수정자는 결과를 반환하기 전에 데이터를 병합합니다.
CollapsingMergeTree의 경우 각 키에 대해 최신 state 행만 반환됩니다.
:::



## 예제 \{#examples\}

### 사용 예제 \{#example-of-use\}

다음과 같은 예제 데이터가 있다고 가정합니다.

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree`를 사용하여 `UAct` 테이블을 생성합니다:

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID
```

다음으로 데이터를 삽입합니다:

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

두 개의 서로 다른 데이터 파트를 생성하기 위해 두 개의 `INSERT` 쿼리를 사용합니다.

:::note
단일 쿼리로 데이터를 삽입하면 ClickHouse는 하나의 데이터 파트만 생성하며 이후에는 머지 작업을 전혀 수행하지 않습니다.
:::

다음과 같이 데이터를 조회할 수 있습니다:

```sql
SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

위에서 반환된 데이터를 살펴보며 collapsing이 실제로 발생했는지 확인해 보겠습니다...
두 개의 `INSERT` 쿼리로 두 개의 데이터 파트를 생성했습니다.
`SELECT` 쿼리는 두 개의 스레드에서 수행되었고, 행의 순서는 임의였습니다.
그러나 데이터 파트 간 머지가 아직 발생하지 않았기 때문에 collapsing은 **발생하지 않았으며**,
ClickHouse는 예측할 수 없는 시점에 백그라운드에서 데이터 파트를 머지합니다.

따라서 집계가 필요하며,
이를 위해 [`sum`](/sql-reference/aggregate-functions/reference/sum)
집계 함수와 [`HAVING`](/sql-reference/statements/select/having) 절을 사용합니다:

```sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration
FROM UAct
GROUP BY UserID
HAVING sum(Sign) > 0
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

집계가 필요하지 않고 collapsing을 강제로 수행하려는 경우, `FROM` 절에 `FINAL` 수정자를 사용할 수도 있습니다.

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

:::note
이 방식으로 데이터를 조회하는 것은 효율성이 떨어지며, 스캔되는 데이터가 수백만 행 수준으로 많을 때에는 사용을 권장하지 않습니다.
:::

### 다른 접근 방식의 예 \{#example-of-another-approach\}

이 접근 방식의 개념은 머지(merge) 작업이 키 필드만을 고려한다는 점입니다.
따라서 「cancel」 행에서는 `Sign` 컬럼을 사용하지 않고 합계를 계산할 때
이전 버전의 행을 상쇄하는 음수 값을 지정할 수 있습니다.

이 예제에서는 아래의 샘플 데이터를 사용합니다.


```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

이 방법을 사용하려면 음수 값을 저장할 수 있도록 `PageViews`와 `Duration`의 데이터 타입을 변경해야 합니다.
따라서 `collapsingMergeTree`를 사용해 테이블 `UAct`를 생성할 때는 해당 컬럼들의 타입을 `UInt8`에서 `Int16`으로 변경합니다.

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews Int16,
    Duration Int16,
    Sign Int8
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID
```

테이블에 데이터를 삽입하여 이 접근 방식을 시험해 보겠습니다.

다만 예제나 작은 테이블에는 사용해도 무방합니다.

```sql
INSERT INTO UAct VALUES(4324182021466249494,  5,  146,  1);
INSERT INTO UAct VALUES(4324182021466249494, -5, -146, -1);
INSERT INTO UAct VALUES(4324182021466249494,  6,  185,  1);

SELECT * FROM UAct FINAL;
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

```sql
SELECT
    UserID,
    sum(PageViews) AS PageViews,
    sum(Duration) AS Duration
FROM UAct
GROUP BY UserID
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

```sql
SELECT COUNT() FROM UAct
```

```text
┌─count()─┐
│       3 │
└─────────┘
```

```sql
OPTIMIZE TABLE UAct FINAL;

SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
