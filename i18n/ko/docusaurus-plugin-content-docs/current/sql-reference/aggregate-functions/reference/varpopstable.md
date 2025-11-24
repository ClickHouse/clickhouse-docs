---
'description': '인구 분산을 반환합니다. varPop과는 달리, 이 함수는 수치적으로 안정된 알고리즘을 사용합니다. 작동 속도는 느리지만
  계산 오류가 더 낮습니다.'
'sidebar_position': 211
'slug': '/sql-reference/aggregate-functions/reference/varpopstable'
'title': 'varPopStable'
'doc_type': 'reference'
---

## varPopStable {#varpopstable}

인구 분산을 반환합니다. [`varPop`](../reference/varpop.md)와는 달리 이 함수는 [수치적으로 안정적인](https://en.wikipedia.org/wiki/Numerical_stability) 알고리즘을 사용합니다. 속도는 느리지만 계산 오류가 낮습니다.

**구문**

```sql
varPopStable(x)
```

별칭: `VAR_POP_STABLE`.

**매개변수**

- `x`: 인구 분산을 찾기 위한 값의 집합. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**반환 값**

- `x`의 인구 분산을 반환합니다. [Float64](../../data-types/float.md).

**예시**

쿼리:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    x UInt8,
)
ENGINE = Memory;

INSERT INTO test_data VALUES (3),(3),(3),(4),(4),(5),(5),(7),(11),(15);

SELECT
    varPopStable(x) AS var_pop_stable
FROM test_data;
```

결과:

```response
┌─var_pop_stable─┐
│           14.4 │
└────────────────┘
```
