---
'description': 'Function에 대한 문서'
'sidebar_label': 'FUNCTION'
'sidebar_position': 38
'slug': '/sql-reference/statements/create/function'
'title': 'CREATE FUNCTION - 사용자 정의 함수 (UDF)'
'doc_type': 'reference'
---

사용자 정의 함수(UDF)를 람다 표현식에서 생성합니다. 이 표현식은 함수 매개변수, 상수, 연산자 또는 다른 함수 호출로 구성되어야 합니다.

**구문**

```sql
CREATE FUNCTION name [ON CLUSTER cluster] AS (parameter0, ...) -> expression
```
함수는 임의의 수의 매개변수를 가질 수 있습니다.

몇 가지 제한 사항이 있습니다:

- 함수의 이름은 사용자 정의 함수와 시스템 함수 간에 고유해야 합니다.
- 재귀 함수는 허용되지 않습니다.
- 함수에서 사용하는 모든 변수는 매개변수 목록에 지정되어야 합니다.

제한 사항이 위반되는 경우 예외가 발생합니다.

**예제**

쿼리:

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
SELECT number, linear_equation(number, 2, 1) FROM numbers(3);
```

결과:

```text
┌─number─┬─plus(multiply(2, number), 1)─┐
│      0 │                            1 │
│      1 │                            3 │
│      2 │                            5 │
└────────┴──────────────────────────────┘
```

다음 쿼리에서 사용자 정의 함수 내에서 [조건부 함수](../../../sql-reference/functions/conditional-functions.md)가 호출됩니다:

```sql
CREATE FUNCTION parity_str AS (n) -> if(n % 2, 'odd', 'even');
SELECT number, parity_str(number) FROM numbers(3);
```

결과:

```text
┌─number─┬─if(modulo(number, 2), 'odd', 'even')─┐
│      0 │ even                                 │
│      1 │ odd                                  │
│      2 │ even                                 │
└────────┴──────────────────────────────────────┘
```

## 관련 콘텐츠 {#related-content}

### [실행 가능한 UDF](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#executable-udfs}

### [ClickHouse Cloud에서의 사용자 정의 함수](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
