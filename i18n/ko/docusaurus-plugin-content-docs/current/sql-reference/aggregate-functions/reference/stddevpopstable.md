---
'description': '결과는 varPop의 제곱근과 같습니다. stddevPop과 달리 이 함수는 수치적으로 안정적인 알고리즘을 사용합니다.'
'sidebar_position': 189
'slug': '/sql-reference/aggregate-functions/reference/stddevpopstable'
'title': 'stddevPopStable'
'doc_type': 'reference'
---


# stddevPopStable

결과는 [varPop](../../../sql-reference/aggregate-functions/reference/varpop.md)의 제곱근과 같습니다. [`stddevPop`](../reference/stddevpop.md)와 달리 이 함수는 수치적으로 안정적인 알고리즘을 사용합니다. 작동 속도는 느리지만 계산 오류가 적습니다.

**문법**

```sql
stddevPopStable(x)
```

**매개변수**

- `x`: 표준 편차를 찾기 위한 값의 모집단. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**반환 값**

`x`의 분산의 제곱근. [Float64](../../data-types/float.md).

**예제**

쿼리:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    population Float64,
)
ENGINE = Log;

INSERT INTO test_data SELECT randUniform(5.5, 10) FROM numbers(1000000)

SELECT
    stddevPopStable(population) AS stddev
FROM test_data;
```

결과:

```response
┌─────────────stddev─┐
│ 1.2999977786592576 │
└────────────────────┘
```
