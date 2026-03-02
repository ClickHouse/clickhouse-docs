---
description: 'arrayJoin 함수에 대한 설명서'
sidebar_label: 'arrayJoin'
slug: /sql-reference/functions/array-join
title: 'arrayJoin 함수'
doc_type: 'reference'
---

# arrayJoin function \{#arrayjoin-function\}

이 함수는 매우 특이한 함수입니다.

일반적인 함수는 행 집합은 변경하지 않고, 각 행의 값들만 변경합니다(맵).
집계 함수는 행 집합을 압축합니다(fold 또는 reduce).
`arrayJoin` 함수는 각 행을 받아 행 집합을 생성합니다(unfold).

이 함수는 배열을 인수로 받으며, 배열의 요소 개수만큼 원본 행을 여러 행으로 확장합니다.
이 함수가 적용된 컬럼의 값만 해당 배열의 각 값으로 대체되고, 나머지 컬럼의 모든 값은 그대로 복사됩니다.

:::note
배열이 비어 있으면 `arrayJoin`은 아무 행도 생성하지 않습니다.
배열 타입의 기본값을 포함하는 단일 행을 반환하려면, 예를 들어 `arrayJoin(emptyArrayToSingle(...))`처럼 [emptyArrayToSingle](./array-functions.md#emptyArrayToSingle)로 감싸면 됩니다.
:::

예를 들어:

```sql title="Query"
SELECT arrayJoin([1, 2, 3] AS src) AS dst, 'Hello', src
```

```text title="Response"
┌─dst─┬─\'Hello\'─┬─src─────┐
│   1 │ Hello     │ [1,2,3] │
│   2 │ Hello     │ [1,2,3] │
│   3 │ Hello     │ [1,2,3] │
└─────┴───────────┴─────────┘
```

`arrayJoin` 함수는 `WHERE` 절을 포함하여 쿼리의 모든 부분에 영향을 줍니다. 아래 쿼리에서 서브쿼리가 1개의 행만 반환했음에도 결과가 `2`가 되는 것에 주목하십시오.

```sql title="Query"
SELECT sum(1) AS impressions
FROM
(
    SELECT ['Istanbul', 'Berlin', 'Babruysk'] AS cities
)
WHERE arrayJoin(cities) IN ['Istanbul', 'Berlin'];
```

```text title="Response"
┌─impressions─┐
│           2 │
└─────────────┘
```

쿼리에서 여러 개의 `arrayJoin` 함수를 사용할 수 있습니다. 이 경우 변환이 여러 번 수행되어 행이 여러 배로 증가합니다.
예를 들어:

```sql title="Query"
SELECT
    sum(1) AS impressions,
    arrayJoin(cities) AS city,
    arrayJoin(browsers) AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text title="Response"
┌─impressions─┬─city─────┬─browser─┐
│           2 │ Istanbul │ Chrome  │
│           1 │ Istanbul │ Firefox │
│           2 │ Berlin   │ Chrome  │
│           1 │ Berlin   │ Firefox │
│           2 │ Babruysk │ Chrome  │
│           1 │ Babruysk │ Firefox │
└─────────────┴──────────┴─────────┘
```

### 모범 사례 \{#important-note\}

동일한 표현식에 대해 여러 번 `arrayJoin`을 사용하는 경우, 공통 부분식 제거로 인해 기대한 결과가 나오지 않을 수 있습니다.
이러한 경우 조인 결과에 영향을 주지 않는 추가 연산을 사용하여 반복되는 배열 표현식을 변경하는 것을 고려하십시오. 예를 들어 `arrayJoin(arraySort(arr))`, `arrayJoin(arrayConcat(arr, []))`와 같이 사용할 수 있습니다.

예:

```sql
SELECT
    arrayJoin(dice) AS first_throw,
    /* arrayJoin(dice) as second_throw */ -- is technically correct, but will annihilate result set
    arrayJoin(arrayConcat(dice, [])) AS second_throw -- intentionally changed expression to force re-evaluation
FROM (
    SELECT [1, 2, 3, 4, 5, 6] AS dice
);
```

SELECT 쿼리에서 [`ARRAY JOIN`](../statements/select/array-join.md) 구문을 사용하면 보다 다양한 활용이 가능합니다.
`ARRAY JOIN`을 사용하면 동일한 개수의 요소를 가진 여러 배열을 한 번에 변환할 수 있습니다.

예:

```sql
SELECT
    sum(1) AS impressions,
    city,
    browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
ARRAY JOIN
    cities AS city,
    browsers AS browser
GROUP BY
    2,
    3
```

```text
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Babruysk │ Chrome  │
└─────────────┴──────────┴─────────┘
```

또는 [`Tuple`](../data-types/tuple.md)를 사용할 수 있습니다.

예시:

```sql title="Query"
SELECT
    sum(1) AS impressions,
    (arrayJoin(arrayZip(cities, browsers)) AS t).1 AS city,
    t.2 AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text title="Row"
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Babruysk │ Chrome  │
└─────────────┴──────────┴─────────┘
```

ClickHouse에서 `arrayJoin`이라는 이름은 조인 연산과의 개념적 유사성에서 유래했지만, 단일 행 내부의 배열에 적용된다는 점이 다릅니다. 전통적인 JOIN은 서로 다른 테이블의 행을 결합하지만, `arrayJoin`은 행 안의 배열 각 요소를 &quot;조인&quot;하여 여러 행을 생성하고(배열의 각 요소마다 하나의 행), 그 과정에서 다른 컬럼 값들을 복제합니다. ClickHouse는 또한 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 절 구문을 제공하여, 익숙한 SQL JOIN 용어를 사용함으로써 전통적인 JOIN 연산과의 관계를 더욱 명확하게 보여 줍니다. 이 과정은 배열을 &quot;펼치는(unfolding)&quot; 것이라고 부르기도 하지만, 이 함수 이름과 절에서는 &quot;join&quot;이라는 용어를 사용합니다. 이는 배열 요소와 테이블을 조인하는 것과 유사한 방식으로 데이터 세트를 효과적으로 확장한다는 점에서 JOIN 연산과 비슷하기 때문입니다.
