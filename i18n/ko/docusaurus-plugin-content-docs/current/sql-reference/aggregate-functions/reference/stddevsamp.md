---
'description': '결과는 varSamp의 제곱근과 같습니다.'
'sidebar_position': 190
'slug': '/sql-reference/aggregate-functions/reference/stddevsamp'
'title': 'stddevSamp'
'doc_type': 'reference'
---


# stddevSamp

결과는 [varSamp](../../../sql-reference/aggregate-functions/reference/varsamp.md)의 제곱근과 같습니다.

별칭: `STDDEV_SAMP`.

:::note
이 함수는 수치적으로 불안정한 알고리즘을 사용합니다. 계산에서 [수치적 안정성](https://en.wikipedia.org/wiki/Numerical_stability)이 필요한 경우, [`stddevSampStable`](../reference/stddevsampstable.md) 함수를 사용하십시오. 이는 느리게 작동하지만 계산 오류를 줄여줍니다.
:::

**문법**

```sql
stddevSamp(x)
```

**매개변수**

- `x`: 샘플 분산의 제곱근을 찾기 위한 값입니다. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

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
    stddevSamp(population)
FROM test_data;
```

결과:

```response
┌─stddevSamp(population)─┐
│                      4 │
└────────────────────────┘
```
