---
'description': '`theilsU` 함수는 테이블의 두 컬럼 간의 연관성을 측정하는 값인 Theils의 U 불확실성 계수를 계산합니다.'
'sidebar_position': 201
'slug': '/sql-reference/aggregate-functions/reference/theilsu'
'title': 'theilsU'
'doc_type': 'reference'
---


# theilsU

`theilsU` 함수는 두 개의 컬럼 간의 연관성을 측정하는 값인 [Theil의 U 불확실성 계수](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient)를 계산합니다. 이 값은 -1.0(100% 부의 연관성 또는 완벽한 반전)에서 +1.0(100% 긍정적 연관성 또는 완벽한 일치) 사이의 범위를 가지며, 0.0의 값은 연관성이 없음을 나타냅니다.

**구문**

```sql
theilsU(column1, column2)
```

**인수**

- `column1`과 `column2`는 비교될 컬럼입니다.

**반환 값**

- -1과 1 사이의 값입니다.

**반환 유형**은 항상 [Float64](../../../sql-reference/data-types/float.md)입니다.

**예제**

아래 비교되는 두 컬럼은 서로 작은 연관성을 가지므로 `theilsU` 값은 음수입니다:

```sql
SELECT
    theilsU(a, b)
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
┌────────theilsU(a, b)─┐
│ -0.30195720557678846 │
└──────────────────────┘
```
