---
'description': '피어슨 상관 계수를 계산하지만, 수치적으로 안정적인 알고리즘을 사용합니다.'
'sidebar_position': 119
'slug': '/sql-reference/aggregate-functions/reference/corrstable'
'title': 'corrStable'
'doc_type': 'reference'
---


# corrStable

[피어슨 상관 계수](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient)를 계산합니다: 

$$
\frac{\Sigma{(x - \bar{x})(y - \bar{y})}}{\sqrt{\Sigma{(x - \bar{x})^2} * \Sigma{(y - \bar{y})^2}}}
$$

[`corr`](../reference/corr.md) 함수와 유사하지만, 수치적으로 안정적인 알고리즘을 사용합니다. 그 결과, `corrStable`은 `corr`보다 느리지만 더 정확한 결과를 생성합니다.

**구문**

```sql
corrStable(x, y)
```

**인자**

- `x` — 첫 번째 변수. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).
- `y` — 두 번째 변수. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal](../../data-types/decimal.md).

**반환 값**

- 피어슨 상관 계수. [Float64](../../data-types/float.md).

***예제**

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
SELECT corrStable(x_value, y_value)
FROM series;
```

결과:

```response
┌─corrStable(x_value, y_value)─┐
│          0.17302657554532558 │
└──────────────────────────────┘
```
