---
'description': 'Cramer''s V를 계산하지만, 편향 수정을 사용합니다.'
'sidebar_position': 128
'slug': '/sql-reference/aggregate-functions/reference/cramersvbiascorrected'
'title': 'cramersVBiasCorrected'
'doc_type': 'reference'
---


# cramersVBiasCorrected

Cramer's V는 테이블의 두 컬럼 간의 연관성을 측정하는 지표입니다. [`cramersV` 함수](./cramersv.md)의 결과는 0(변수 간의 연관성이 없음을 나타냄)에서 1 사이로, 각 값이 다른 값에 의해 완전히 결정될 때만 1에 도달할 수 있습니다. 이 함수는 편향이 심할 수 있으므로, Cramer's V의 이 버전은 [편향 보정](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)을 사용합니다.

**구문**

```sql
cramersVBiasCorrected(column1, column2)
```

**매개변수**

- `column1`: 비교할 첫 번째 컬럼.
- `column2`: 비교할 두 번째 컬럼.

**반환값**

- 0(컬럼 값 간의 연관성이 없음에 해당)에서 1(완전 연관성) 사이의 값.

유형: 항상 [Float64](../../../sql-reference/data-types/float.md).

**예제**

아래 비교되는 두 컬럼은 서로 중간 정도의 연관성을 가지고 있습니다. `cramersVBiasCorrected`의 결과가 `cramersV`의 결과보다 작다는 점에 주목하십시오:

쿼리:

```sql
SELECT
    cramersV(a, b),
    cramersVBiasCorrected(a ,b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 4 AS b
        FROM
            numbers(150)
    );
```

결과:

```response
┌─────cramersV(a, b)─┬─cramersVBiasCorrected(a, b)─┐
│ 0.5798088336225178 │          0.5305112825189074 │
└────────────────────┴─────────────────────────────┘
```
