---
'description': 'arrayJoin 함수에 대한 문서'
'sidebar_label': 'arrayJoin'
'slug': '/sql-reference/functions/array-join'
'title': 'arrayJoin 함수'
'doc_type': 'reference'
---


# arrayJoin 함수

이것은 매우 비정상적인 함수입니다.

일반 함수는 행 집합을 변경하지 않고 각 행의 값만 변경합니다 (map). 집계 함수는 행 집합을 압축합니다 (fold 또는 reduce). `arrayJoin` 함수는 각 행을 가져와서 행 집합을 생성합니다 (unfold).

이 함수는 배열을 인자로 받아, 원본 행을 배열의 요소 수에 따라 여러 행으로 전파합니다. 이 함수가 적용된 컬럼의 값은 해당 배열의 값으로 대체되며, 나머지 컬럼의 값은 단순히 복사됩니다.

:::note
배열이 비어 있으면 `arrayJoin`은 아무 행도 생성하지 않습니다. 배열 타입의 기본 값을 포함하는 단일 행을 반환하려면 [emptyArrayToSingle](./array-functions.md#emptyArrayToSingle)로 감쌀 수 있습니다. 예: `arrayJoin(emptyArrayToSingle(...))`.
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

`arrayJoin` 함수는 쿼리의 모든 섹션, 특히 `WHERE` 섹션에 영향을 미칩니다. 아래 쿼리의 결과가 `2`인 이유는 서브쿼리에서 1 행을 반환했기 때문임을 주목하십시오.

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

쿼리는 여러 개의 `arrayJoin` 함수를 사용할 수 있습니다. 이 경우 변환이 여러 번 수행되어 행이 곱해집니다. 예를 들어:

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

### 모범 사례 {#important-note}

같은 표현으로 여러 개의 `arrayJoin`을 사용하는 경우 공통 하위 표현의 제거로 인해 예상치 못한 결과가 발생할 수 있습니다. 이러한 경우, 조인 결과에 영향을 미치지 않는 추가 작업으로 반복된 배열 표현을 수정하는 것을 고려하세요. 예: `arrayJoin(arraySort(arr))`, `arrayJoin(arrayConcat(arr, []))`

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

SELECT 쿼리의 [`ARRAY JOIN`](../statements/select/array-join.md) 구문에 주목하십시오. 이는 더 넓은 가능성을 제공합니다. `ARRAY JOIN`은 동일한 요소 수를 가진 여러 배열을 동시에 변환할 수 있게 해줍니다.

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

또는 [`Tuple`](../data-types/tuple.md)을 사용할 수 있습니다.

예:

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

ClickHouse에서 `arrayJoin`이라는 이름은 JOIN 작업과 개념적으로 유사한 데서 유래했으며, 단일 행 내의 배열에 적용됩니다. 전통적인 JOIN이 서로 다른 테이블의 행을 결합하는 반면, `arrayJoin`은 행의 배열 각 요소를 "조인"하여 여러 행을 생성합니다 - 각 배열 요소당 하나의 행을 생성하면서 다른 컬럼 값을 중복합니다. ClickHouse는 또한 전통적인 JOIN 작업과의 관계를 더욱 명확히 하기 위해 친숙한 SQL JOIN 용어를 사용한 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 절 구문을 제공합니다. 이 과정은 배열을 "펼치는" 것으로도 불리지만, "조인"이라는 용어가 함수 이름과 절 모두에서 사용되는 이유는 배열 요소와 테이블을 조인하는 것과 유사하여 데이터 세트를 JOIN 작업과 비슷한 방식으로 확장하기 때문입니다.
