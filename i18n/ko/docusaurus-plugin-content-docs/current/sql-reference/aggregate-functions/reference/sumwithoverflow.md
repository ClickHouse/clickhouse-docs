---
'description': '입력 매개변수와 동일한 데이터 유형을 사용하여 숫자의 합계를 계산합니다. 합계가 이 데이터 유형의 최대 값을 초과하면
  오버플로가 발생하여 계산됩니다.'
'sidebar_position': 200
'slug': '/sql-reference/aggregate-functions/reference/sumwithoverflow'
'title': 'sumWithOverflow'
'doc_type': 'reference'
---


# sumWithOverflow

숫자의 합계를 계산하며, 결과에 대한 데이터 유형은 입력 매개변수와 동일합니다. 합계가 이 데이터 유형의 최대 값을 초과하면 오버플로우로 계산됩니다.

숫자에 대해서만 작동합니다.

**문법**

```sql
sumWithOverflow(num)
```

**매개변수**
- `num`: 숫자 값의 컬럼. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**반환 값**

- 값의 합계. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**예제**

먼저 `employees`라는 테이블을 만들고 여기에 가상의 직원 데이터를 삽입합니다. 이 예제에서는 `salary`를 `UInt16`로 선택하여 이 값들의 합계가 오버플로우를 초래할 수 있습니다.

쿼리:

```sql
CREATE TABLE employees
(
    `id` UInt32,
    `name` String,
    `monthly_salary` UInt16
)
ENGINE = Log
```

```sql
SELECT
    sum(monthly_salary) AS no_overflow,
    sumWithOverflow(monthly_salary) AS overflow,
    toTypeName(no_overflow),
    toTypeName(overflow)
FROM employees
```

`sum` 및 `sumWithOverflow` 함수와 `toTypeName` 함수를 사용하여 직원 급여의 총액을 쿼리하고 이들의 유형을 보여줍니다.
`sum` 함수의 경우 결과 유형은 합계를 포함할 수 있는 충분한 큰 `UInt64`인 반면, `sumWithOverflow`의 결과 유형은 여전히 `UInt16`로 유지됩니다.

쿼리:

```sql
SELECT 
    sum(monthly_salary) AS no_overflow,
    sumWithOverflow(monthly_salary) AS overflow,
    toTypeName(no_overflow),
    toTypeName(overflow),    
FROM employees;
```

결과:

```response
   ┌─no_overflow─┬─overflow─┬─toTypeName(no_overflow)─┬─toTypeName(overflow)─┐
1. │      118700 │    53164 │ UInt64                  │ UInt16               │
   └─────────────┴──────────┴─────────────────────────┴──────────────────────┘
```
