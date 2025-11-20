---
'description': '`Σ((x - x̄)(y - ȳ)) / (n - 1)`의 값을 계산합니다.'
'sidebar_position': 124
'slug': '/sql-reference/aggregate-functions/reference/covarsamp'
'title': 'covarSamp'
'doc_type': 'reference'
---


# covarSamp

`Σ((x - x̅)(y - y̅)) / (n - 1)`의 값을 계산합니다.

:::note
이 함수는 수치적으로 불안정한 알고리즘을 사용합니다. 계산에서 [수치적 안정성](https://en.wikipedia.org/wiki/Numerical_stability)이 필요하다면, [`covarSampStable`](../reference/covarsamp.md) 함수를 사용하십시오. 속도는 느리지만, 계산 오류가 낮습니다.
:::

**구문**

```sql
covarSamp(x, y)
```

**인수**

- `x` — 첫 번째 변수. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).
- `y` — 두 번째 변수. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).

**반환 값**

- `x`와 `y` 간의 샘플 공분산. `n <= 1`인 경우, `nan`이 반환됩니다. [Float64](../../data-types/float.md).

**예제**

쿼리:

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series(i UInt32, x_value Float64, y_value Float64) ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6,-4.4),(2, -9.6,3),(3, -1.3,-4),(4, 5.3,9.7),(5, 4.4,0.037),(6, -8.6,-7.8),(7, 5.1,9.3),(8, 7.9,-3.6),(9, -8.2,0.62),(10, -3,7.3);
```

```sql
SELECT covarSamp(x_value, y_value)
FROM
(
    SELECT
        x_value,
        y_value
    FROM series
);
```

결과:

```reference
┌─covarSamp(x_value, y_value)─┐
│           7.206275555555556 │
└─────────────────────────────┘
```

쿼리:

```sql
SELECT covarSamp(x_value, y_value)
FROM
(
    SELECT
        x_value,
        y_value
    FROM series LIMIT 1
);

```

결과:

```reference
┌─covarSamp(x_value, y_value)─┐
│                         nan │
└─────────────────────────────┘
```
