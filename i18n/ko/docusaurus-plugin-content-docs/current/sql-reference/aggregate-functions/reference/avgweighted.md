---
'description': '가중 산술 평균을 계산합니다.'
'sidebar_position': 113
'slug': '/sql-reference/aggregate-functions/reference/avgweighted'
'title': 'avgWeighted'
'doc_type': 'reference'
---


# avgWeighted

가중 산술 평균을 계산합니다. [가중 산술 평균](https://en.wikipedia.org/wiki/Weighted_arithmetic_mean).

**문법**

```sql
avgWeighted(x, weight)
```

**인수**

- `x` — 값들.
- `weight` — 값들의 가중치.

`x`와 `weight`는 모두
[정수](../../../sql-reference/data-types/int-uint.md) 또는 [부동 소수점](../../../sql-reference/data-types/float.md) 이어야 하며,
다른 유형일 수 있습니다.

**반환 값**

- 모든 가중치가 0이거나 제공된 가중치 매개변수가 비어 있는 경우 `NaN`.
- 그렇지 않으면 가중 평균.

**반환 유형**은 항상 [Float64](../../../sql-reference/data-types/float.md)입니다.

**예시**

쿼리:

```sql
SELECT avgWeighted(x, w)
FROM VALUES('x Int8, w Int8', (4, 1), (1, 0), (10, 2))
```

결과:

```text
┌─avgWeighted(x, weight)─┐
│                      8 │
└────────────────────────┘
```

**예시**

쿼리:

```sql
SELECT avgWeighted(x, w)
FROM VALUES('x Int8, w Float64', (4, 1), (1, 0), (10, 2))
```

결과:

```text
┌─avgWeighted(x, weight)─┐
│                      8 │
└────────────────────────┘
```

**예시**

쿼리:

```sql
SELECT avgWeighted(x, w)
FROM VALUES('x Int8, w Int8', (0, 0), (1, 0), (10, 0))
```

결과:

```text
┌─avgWeighted(x, weight)─┐
│                    nan │
└────────────────────────┘
```

**예시**

쿼리:

```sql
CREATE TABLE test (t UInt8) ENGINE = Memory;
SELECT avgWeighted(t) FROM test
```

결과:

```text
┌─avgWeighted(x, weight)─┐
│                    nan │
└────────────────────────┘
```
