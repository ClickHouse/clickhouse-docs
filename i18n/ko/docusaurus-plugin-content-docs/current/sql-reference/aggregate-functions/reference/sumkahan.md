---
'description': 'Kahan 보정 합산 알고리즘을 사용하여 숫자의 합을 계산합니다.'
'sidebar_position': 197
'slug': '/sql-reference/aggregate-functions/reference/sumkahan'
'title': 'sumKahan'
'doc_type': 'reference'
---

Calculates the sum of the numbers with [Kahan compensated summation algorithm](https://en.wikipedia.org/wiki/Kahan_summation_algorithm)  
[Kahan 보정 합산 알고리즘](https://en.wikipedia.org/wiki/Kahan_summation_algorithm)으로 숫자의 합을 계산합니다.  
Slower than [sum](./sum.md) function.  
[sum](./sum.md) 함수보다 느립니다.  
The compensation works only for [Float](../../../sql-reference/data-types/float.md) types.  
보상은 오직 [Float](../../../sql-reference/data-types/float.md) 타입에 대해서만 작동합니다.

**Syntax**  
**구문**

```sql
sumKahan(x)
```

**Arguments**  
**인수**

- `x` — Input value, must be [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md), or [Decimal](../../../sql-reference/data-types/decimal.md).  
  `x` — 입력 값, 반드시 [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) 또는 [Decimal](../../../sql-reference/data-types/decimal.md) 이어야 합니다.

**Returned value**  
**반환 값**

- the sum of numbers, with type [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md), or [Decimal](../../../sql-reference/data-types/decimal.md) depends on type of input arguments  
  숫자의 합으로, [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) 또는 [Decimal](../../../sql-reference/data-types/decimal.md) 타입은 입력 인수의 타입에 따라 다릅니다.

**Example**  
**예제**

Query:  
쿼리:

```sql
SELECT sum(0.1), sumKahan(0.1) FROM numbers(10);
```

Result:  
결과:

```text
┌───────────sum(0.1)─┬─sumKahan(0.1)─┐
│ 0.9999999999999999 │             1 │
└────────────────────┴───────────────┘
```
