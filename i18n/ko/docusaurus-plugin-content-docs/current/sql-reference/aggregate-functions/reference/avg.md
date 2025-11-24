---
'description': '산술 평균을 계산합니다.'
'sidebar_position': 112
'slug': '/sql-reference/aggregate-functions/reference/avg'
'title': 'avg'
'doc_type': 'reference'
---


# avg

산술 평균을 계산합니다.

**구문**

```sql
avg(x)
```

**인자**

- `x` — 입력 값으로, [정수](../../../sql-reference/data-types/int-uint.md), [부동 소수점](../../../sql-reference/data-types/float.md), 또는 [십진수](../../../sql-reference/data-types/decimal.md)여야 합니다.

**반환 값**

- 항상 [Float64](../../../sql-reference/data-types/float.md) 형식으로 산술 평균을 반환합니다.
- 입력 매개변수 `x`가 비어 있을 경우 `NaN`을 반환합니다.

**예제**

쿼리:

```sql
SELECT avg(x) FROM VALUES('x Int8', 0, 1, 2, 3, 4, 5);
```

결과:

```text
┌─avg(x)─┐
│    2.5 │
└────────┘
```

**예제**

임시 테이블 생성:

쿼리:

```sql
CREATE TABLE test (t UInt8) ENGINE = Memory;
```

산술 평균을 가져옵니다:

쿼리:

```sql
SELECT avg(t) FROM test;
```

결과:

```text
┌─avg(x)─┐
│    nan │
└────────┘
```
