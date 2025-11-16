---
'description': '인구 분산을 계산합니다.'
'sidebar_position': 210
'slug': '/sql-reference/aggregate-functions/reference/varPop'
'title': 'varPop'
'doc_type': 'reference'
---

## varPop {#varpop}

모집단 분산을 계산합니다:

$$
\frac{\Sigma{(x - \bar{x})^2}}{n}
$$

**구문**

```sql
varPop(x)
```

별칭: `VAR_POP`.

**매개변수**

- `x`: 모집단 분산을 찾기 위한 값의 모집단. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**반환 값**

- `x`의 모집단 분산을 반환합니다. [`Float64`](../../data-types/float.md).

**예시**

쿼리:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    x UInt8,
)
ENGINE = Memory;

INSERT INTO test_data VALUES (3), (3), (3), (4), (4), (5), (5), (7), (11), (15);

SELECT
    varPop(x) AS var_pop
FROM test_data;
```

결과:

```response
┌─var_pop─┐
│    14.4 │
└─────────┘
```
