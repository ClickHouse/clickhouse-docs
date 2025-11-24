---
'description': '`contingency` 함수는 테이블의 두 컬럼 간의 연관성을 측정하는 값인 비상계획 계수를 계산합니다. 계산은 `cramersV`
  함수와 유사하지만 제곱근의 분모가 다릅니다.'
'sidebar_position': 116
'slug': '/sql-reference/aggregate-functions/reference/contingency'
'title': '비상계획'
'doc_type': 'reference'
---


# contingency

`contingency` 함수는 테이블의 두 컬럼 간의 관계를 측정하는 값인 [contingency coefficient](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C) 를 계산합니다. 이 계산은 [ `cramersV` 함수](./cramersv.md) 와 유사하지만, 제곱근에서 다른 분모를 사용합니다.

**구문**

```sql
contingency(column1, column2)
```

**인수**

- `column1`와 `column2`는 비교할 컬럼입니다.

**반환 값**

- 0과 1 사이의 값. 결과가 클수록 두 컬럼 간의 관계가 더 가까워집니다.

**반환 유형**은 항상 [Float64](../../../sql-reference/data-types/float.md)입니다.

**예시**

아래 비교되는 두 컬럼은 서로 작은 관계를 가지고 있습니다. 비교를 위해 `cramersV`의 결과도 포함했습니다:

```sql
SELECT
    cramersV(a, b),
    contingency(a ,b)
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
┌─────cramersV(a, b)─┬──contingency(a, b)─┐
│ 0.5798088336225178 │ 0.0817230766271248 │
└────────────────────┴────────────────────┘
```
