---
description: 'FUNCTION에 대한 문서'
sidebar_label: 'FUNCTION'
sidebar_position: 38
slug: /sql-reference/statements/create/function
title: 'CREATE FUNCTION - 사용자 정의 함수(UDF)'
doc_type: 'reference'
---

람다 식으로부터 사용자 정의 함수(UDF)를 생성합니다. 이 식은 함수 매개변수, 상수, 연산자 또는 다른 함수 호출로만 구성되어야 합니다.

**구문**

```sql
CREATE [OR REPLACE] FUNCTION name [ON CLUSTER cluster] AS (parameter0, ...) -> expression
```

함수는 임의의 개수의 매개변수를 가질 수 있습니다.

다음과 같은 몇 가지 제약 사항이 있습니다:

* 함수 이름은 사용자 정의 함수와 시스템 함수 전체에서 고유해야 합니다.
* 재귀 함수는 허용되지 않습니다.
* 함수에서 사용하는 모든 변수는 함수의 매개변수 목록에 명시해야 합니다.

이러한 제약 사항을 위반하면 예외가 발생합니다.

**예시**

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

다음 쿼리에서는 사용자 정의 FUNCTION 내에서 [조건 함수](../../../sql-reference/functions/conditional-functions.md)가 호출됩니다:

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

기존 UDF 교체하기:

```sql
CREATE FUNCTION exampleReplaceFunction AS frame -> frame;
SELECT create_query FROM system.functions WHERE name = 'exampleReplaceFunction';
CREATE OR REPLACE FUNCTION exampleReplaceFunction AS frame -> frame + 1;
SELECT create_query FROM system.functions WHERE name = 'exampleReplaceFunction';
```

결과:

```text
┌─create_query─────────────────────────────────────────────┐
│ CREATE FUNCTION exampleReplaceFunction AS frame -> frame │
└──────────────────────────────────────────────────────────┘

┌─create_query───────────────────────────────────────────────────┐
│ CREATE FUNCTION exampleReplaceFunction AS frame -> (frame + 1) │
└────────────────────────────────────────────────────────────────┘
```


## 관련 문서 \{#related-content\}

### [실행형 UDF](/sql-reference/functions/udf.md). \{#executable-udfs\}

### [ClickHouse Cloud의 사용자 정의 함수](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) \{#user-defined-functions-in-clickhouse-cloud\}