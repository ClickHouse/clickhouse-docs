---
'description': '결과는 varSamp의 제곱근과 같습니다. 이 함수는 숫적으로 안정적인 알고리즘을 사용합니다.'
'sidebar_position': 191
'slug': '/sql-reference/aggregate-functions/reference/stddevsampstable'
'title': 'stddevSampStable'
'doc_type': 'reference'
---


# stddevSampStable

결과는 [varSamp](../../../sql-reference/aggregate-functions/reference/varsamp.md)의 제곱근과 같습니다. [`stddevSamp`](../reference/stddevsamp.md)와 달리 이 함수는 수치적으로 안정적인 알고리즘을 사용합니다. 속도는 느리지만 더 낮은 계산 오류를 제공합니다.

**구문**

```sql
stddevSampStable(x)
```

**매개변수**

- `x`: 샘플 분산의 제곱근을 찾을 값들. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**반환 값**

`x`의 샘플 분산의 제곱근. [Float64](../../data-types/float.md).

**예제**

쿼리:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    population UInt8,
)
ENGINE = Log;

INSERT INTO test_data VALUES (3),(3),(3),(4),(4),(5),(5),(7),(11),(15);

SELECT
    stddevSampStable(population)
FROM test_data;
```

결과:

```response
┌─stddevSampStable(population)─┐
│                            4 │
└──────────────────────────────┘
```
