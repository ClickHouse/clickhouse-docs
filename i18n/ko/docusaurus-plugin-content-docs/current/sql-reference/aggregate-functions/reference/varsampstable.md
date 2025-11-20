---
'description': '데이터 집합의 샘플 분산을 계산합니다. `varSamp`와는 달리, 이 함수는 수치적으로 안정적인 알고리즘을 사용합니다.
  속도는 느리지만 계산 오류가 더 낮습니다.'
'sidebar_position': 213
'slug': '/sql-reference/aggregate-functions/reference/varsampstable'
'title': 'varSampStable'
'doc_type': 'reference'
---

## varSampStable {#varsampstable}

데이터 집합의 샘플 분산을 계산합니다. [`varSamp`](../reference/varsamp.md)와 달리 이 함수는 수치적으로 안정적인 알고리즘을 사용합니다. 실행 속도는 느리지만, 계산 오류가 낮습니다.

**구문**

```sql
varSampStable(x)
```

별칭: `VAR_SAMP_STABLE`

**매개변수**

- `x`: 샘플 분산을 계산하려는 모집단입니다. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**반환 값**

- 입력 데이터 집합의 샘플 분산을 반환합니다. [Float64](../../data-types/float.md).

**구현 상세**

`varSampStable` 함수는 [`varSamp`](../reference/varsamp.md)와 동일한 공식을 사용하여 샘플 분산을 계산합니다:

$$
\sum\frac{(x - \text{mean}(x))^2}{(n - 1)}
$$

여기서:
- `x`는 데이터 집합의 각 개별 데이터 포인트입니다.
- `mean(x)`는 데이터 집합의 산술 평균입니다.
- `n`은 데이터 집합의 데이터 포인트 수입니다.

**예제**

쿼리:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    x Float64
)
ENGINE = Memory;

INSERT INTO test_data VALUES (10.5), (12.3), (9.8), (11.2), (10.7);

SELECT round(varSampStable(x),3) AS var_samp_stable FROM test_data;
```

응답:

```response
┌─var_samp_stable─┐
│           0.865 │
└─────────────────┘
```
