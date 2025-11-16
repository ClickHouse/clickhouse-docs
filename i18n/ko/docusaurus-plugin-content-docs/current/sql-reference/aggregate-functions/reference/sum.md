---
'description': '숫자의 합계를 계산합니다. 숫자에 대해서만 작동합니다.'
'sidebar_position': 195
'slug': '/sql-reference/aggregate-functions/reference/sum'
'title': 'sum'
'doc_type': 'reference'
---


# sum

합계를 계산합니다. 숫자에만 작동합니다.

**구문**

```sql
sum(num)
```

**매개변수**
- `num`: 숫자 값의 컬럼. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**반환 값**

- 값의 합계. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**예시**

먼저 `employees` 테이블을 생성하고 몇 가지 허구의 직원 데이터를 삽입합니다.

쿼리:

```sql
CREATE TABLE employees
(
    `id` UInt32,
    `name` String,
    `salary` UInt32
)
ENGINE = Log
```

```sql
INSERT INTO employees VALUES
    (87432, 'John Smith', 45680),
    (59018, 'Jane Smith', 72350),
    (20376, 'Ivan Ivanovich', 58900),
    (71245, 'Anastasia Ivanovna', 89210);
```

`sum` 함수를 사용하여 직원 급여의 총액을 조회합니다. 

쿼리:

```sql
SELECT sum(salary) FROM employees;
```

결과:

```response
   ┌─sum(salary)─┐
1. │      266140 │
   └─────────────┘
```
