---
'description': '이 함수는 예외 안전성을 테스트하는 목적으로 사용할 수 있습니다. 지정된 확률로 생성 시 예외를 발생시킵니다.'
'sidebar_position': 101
'slug': '/sql-reference/aggregate-functions/reference/aggthrow'
'title': 'aggThrow'
'doc_type': 'reference'
---


# aggThrow

이 함수는 예외 안전성을 테스트하는 데 사용할 수 있습니다. 지정된 확률로 생성 시 예외를 발생시킵니다.

**구문**

```sql
aggThrow(throw_prob)
```

**인수**

- `throw_prob` — 생성 시 발생할 확률. [Float64](../../data-types/float.md).

**반환 값**

- 예외: `Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully`.

**예제**

쿼리:

```sql
SELECT number % 2 AS even, aggThrow(number) FROM numbers(10) GROUP BY even;
```

결과:

```response
Received exception:
Code: 503. DB::Exception: Aggregate function aggThrow has thrown exception successfully: While executing AggregatingTransform. (AGGREGATE_FUNCTION_THROW)
```
