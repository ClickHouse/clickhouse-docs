---
'description': 'covarSamp와 유사하지만 계산 오류가 더 낮으면서 느리게 작동합니다.'
'sidebar_position': 126
'slug': '/sql-reference/aggregate-functions/reference/covarsampstable'
'title': 'covarSampStable'
'doc_type': 'reference'
---


# covarSampStable

`Σ((x - x̅)(y - y̅)) / (n - 1)`의 값을 계산합니다. [covarSamp](../reference/covarsamp.md)와 유사하지만, 더 낮은 계산 오류를 제공하면서 더 느리게 작동합니다.

**문법**

```sql
covarSampStable(x, y)
```

**인수**

- `x` — 첫 번째 변수. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).
- `y` — 두 번째 변수. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).

**반환 값**

- `x`와 `y` 간의 샘플 공분산입니다. `n <= 1`인 경우, `inf`가 반환됩니다. [Float64](../../data-types/float.md).

**예시**

쿼리:

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series(i UInt32, x_value Float64, y_value Float64) ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6,-4.4),(2, -9.6,3),(3, -1.3,-4),(4, 5.3,9.7),(5, 4.4,0.037),(6, -8.6,-7.8),(7, 5.1,9.3),(8, 7.9,-3.6),(9, -8.2,0.62),(10, -3,7.3);
```

```sql
SELECT covarSampStable(x_value, y_value)
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
┌─covarSampStable(x_value, y_value)─┐
│                 7.206275555555556 │
└───────────────────────────────────┘
```

쿼리:

```sql
SELECT covarSampStable(x_value, y_value)
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
┌─covarSampStable(x_value, y_value)─┐
│                               inf │
└───────────────────────────────────┘
```
