---
'description': '결과는 varPop의 제곱근과 같습니다.'
'sidebar_position': 188
'slug': '/sql-reference/aggregate-functions/reference/stddevpop'
'title': 'stddevPop'
'doc_type': 'reference'
---


# stddevPop

결과는 [varPop](../../../sql-reference/aggregate-functions/reference/varpop.md)의 제곱근과 같습니다.

별칭: `STD`, `STDDEV_POP`.

:::note
이 함수는 수치적으로 불안정한 알고리즘을 사용합니다. 계산에서 [수치적 안정성](https://en.wikipedia.org/wiki/Numerical_stability)이 필요한 경우 [`stddevPopStable`](../reference/stddevpopstable.md) 함수를 사용하십시오. 이 함수는 느리게 작동하지만 더 낮은 계산 오류를 제공합니다.
:::

**구문**

```sql
stddevPop(x)
```

**매개변수**

- `x`: 표준 편차를 찾기 위한 값의 집합. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**반환 값**

- `x`의 표준 편차의 제곱근. [Float64](../../data-types/float.md).

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
    stddevPop(population) AS stddev
FROM test_data;
```

결과:

```response
┌────────────stddev─┐
│ 3.794733192202055 │
└───────────────────┘
```
