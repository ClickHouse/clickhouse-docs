---
'description': '피어슨 상관 계수(Pearson correlation coefficient)를 계산합니다.'
'sidebar_position': 117
'slug': '/sql-reference/aggregate-functions/reference/corr'
'title': 'corr'
'doc_type': 'reference'
---


# corr

[피어슨 상관 계수](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient)를 계산합니다:

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{\sqrt{\Sigma{(x - \bar{x})^2} * \Sigma{(y - \bar{y})^2}}}
$$

<br/>
:::note
이 함수는 수치적으로 불안정한 알고리즘을 사용합니다. 계산에서 [수치 안정성](https://en.wikipedia.org/wiki/Numerical_stability)이 필요하면 [`corrStable`](../reference/corrstable.md) 함수를 사용하세요. 속도는 느리지만 더 정확한 결과를 제공합니다.
:::

**문법**

```sql
corr(x, y)
```

**인수**

- `x` — 첫 번째 변수. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md).
- `y` — 두 번째 변수. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md).

**반환 값**

- 피어슨 상관 계수. [Float64](../../data-types/float.md).

**예시**

쿼리:

```sql
DROP TABLE IF EXISTS series;
CREATE TABLE series
(
    i UInt32,
    x_value Float64,
    y_value Float64
)
ENGINE = Memory;
INSERT INTO series(i, x_value, y_value) VALUES (1, 5.6, -4.4),(2, -9.6, 3),(3, -1.3, -4),(4, 5.3, 9.7),(5, 4.4, 0.037),(6, -8.6, -7.8),(7, 5.1, 9.3),(8, 7.9, -3.6),(9, -8.2, 0.62),(10, -3, 7.3);
```

```sql
SELECT corr(x_value, y_value)
FROM series;
```

결과:

```response
┌─corr(x_value, y_value)─┐
│     0.1730265755453256 │
└────────────────────────┘
```
