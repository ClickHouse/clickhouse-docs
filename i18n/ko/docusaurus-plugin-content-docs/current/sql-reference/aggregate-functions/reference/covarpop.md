---
'description': '인구 공분산을 계산합니다.'
'sidebar_position': 121
'slug': '/sql-reference/aggregate-functions/reference/covarpop'
'title': 'covarPop'
'doc_type': 'reference'
---


# covarPop

모집단 공분산을 계산합니다:

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{n}
$$

:::note
이 함수는 수치적으로 불안정한 알고리즘을 사용합니다. 계산에 [수치적 안정성](https://en.wikipedia.org/wiki/Numerical_stability)이 필요한 경우, [`covarPopStable`](../reference/covarpopstable.md) 함수를 사용하십시오. 이 함수는 느리지만 계산 오류가 더 낮습니다.
:::

**구문**

```sql
covarPop(x, y)
```

**인수**

- `x` — 첫 번째 변수. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).
- `y` — 두 번째 변수. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).

**반환 값**

- `x`와 `y` 간의 모집단 공분산. [Float64](../../data-types/float.md).

**예시**

쿼리:

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series(i UInt32, x_value Float64, y_value Float64) ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6, -4.4),(2, -9.6, 3),(3, -1.3, -4),(4, 5.3, 9.7),(5, 4.4, 0.037),(6, -8.6, -7.8),(7, 5.1, 9.3),(8, 7.9, -3.6),(9, -8.2, 0.62),(10, -3, 7.3);
```

```sql
SELECT covarPop(x_value, y_value)
FROM series;
```

결과:

```reference
┌─covarPop(x_value, y_value)─┐
│                   6.485648 │
└────────────────────────────┘
```
