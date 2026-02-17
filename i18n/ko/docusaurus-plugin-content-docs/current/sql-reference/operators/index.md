---
description: '연산자 문서'
sidebar_label: '연산자'
sidebar_position: 38
slug: /sql-reference/operators/
title: '연산자'
doc_type: 'reference'
---

# 연산자 \{#operators\}

ClickHouse는 연산자의 우선순위(priority), 우선도(precedence), 결합 방향(associativity)에 따라 쿼리 파싱 단계에서 각 연산자를 해당 함수로 변환합니다.

## Access 연산자 \{#access-operators\}

`a[N]` – 배열 요소에 접근합니다. `arrayElement(a, N)` FUNCTION과 같습니다.

`a.N` – 튜플 요소에 접근합니다. `tupleElement(a, N)` FUNCTION과 같습니다.

## 수치 부정 연산자 \{#numeric-negation-operator\}

`-a` – `negate (a)` FUNCTION입니다.

튜플 부정에는 [tupleNegate](../../sql-reference/functions/tuple-functions.md#tupleNegate)를 사용합니다.

## 곱셈 및 나눗셈 연산자 \{#multiplication-and-division-operators\}

`a * b` – `multiply(a, b)` FUNCTION입니다.

튜플에 숫자를 곱할 때는 [tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tupleMultiplyByNumber), 스칼라 곱(scalar product)에는 [dotProduct](/sql-reference/functions/array-functions#arrayDotProduct)를 사용합니다.

`a / b` – `divide(a, b)` FUNCTION입니다.

튜플을 숫자로 나눌 때는 [tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupleDivideByNumber)를 사용합니다.

`a % b` – `modulo(a, b)` FUNCTION입니다.

## 덧셈 및 뺄셈 연산자 \{#addition-and-subtraction-operators\}

`a + b` – `plus(a, b)` 함수입니다.

튜플 덧셈의 경우: [tuplePlus](../../sql-reference/functions/tuple-functions.md#tuplePlus).

`a - b` – `minus(a, b)` 함수입니다.

튜플 뺄셈의 경우: [tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleMinus).

## 비교 연산자 \{#comparison-operators\}

### equals 함수 \{#equals-function\}

`a = b` – `equals(a, b)` 함수입니다.

`a == b` – `equals(a, b)` 함수입니다.

### notEquals 함수 \{#notequals-function\}

`a != b` – `notEquals(a, b)` 함수입니다.

`a <> b` – `notEquals(a, b)` 함수입니다.

### lessOrEquals 함수 \{#lessorequals-function\}

`a <= b` – `lessOrEquals(a, b)` 함수입니다.

### greaterOrEquals 함수 \{#greaterorequals-function\}

`a >= b` – `greaterOrEquals(a, b)` 함수입니다.

### less 함수 \{#less-function\}

`a < b` – `less(a, b)` 함수와 같습니다.

### greater 함수 \{#greater-function\}

`a > b` – `greater(a, b)` 함수에 해당합니다.

### like 함수 \{#like-function\}

`a LIKE b` – `like(a, b)` 함수입니다.

### notLike 함수 \{#notlike-function\}

`a NOT LIKE b` – `notLike(a, b)` 함수입니다.

### ilike 함수 \{#ilike-function\}

`a ILIKE b` – `ilike(a, b)` 함수입니다.

### BETWEEN 함수 \{#between-function\}

`a BETWEEN b AND c` – `a >= b AND a <= c`와 같습니다.

`a NOT BETWEEN b AND c` – `a < b OR a > c`와 같습니다.

### is not distinct from 연산자 (`<=>`) \{#is-not-distinct-from\}

:::note
25.10부터는 `<=>` 연산자를 다른 연산자와 마찬가지로 사용할 수 있습니다.
25.10 이전에는 JOIN 표현식에서만 사용할 수 있었으며, 예를 들어 다음과 같습니다:

```sql
CREATE TABLE a (x String) ENGINE = Memory;
INSERT INTO a VALUES ('ClickHouse');

SELECT * FROM a AS a1 JOIN a AS a2 ON a1.x <=> a2.x;

┌─x──────────┬─a2.x───────┐
│ ClickHouse │ ClickHouse │
└────────────┴────────────┘
```

:::

`&lt;=&gt;` 연산자는 `NULL`-안전 동등 연산자로, `IS NOT DISTINCT FROM`와 동일합니다.
일반 동등 연산자(`=`)처럼 동작하지만, `NULL` 값을 서로 비교 가능한 값으로 취급합니다.
두 `NULL` 값은 서로 같다고 간주되며, `NULL` 값과 `NULL`이 아닌 값을 비교하면 `NULL` 대신 0 (false)을 반환합니다.

```sql
SELECT
  'ClickHouse' <=> NULL,
  NULL <=> NULL
```

```response
┌─isNotDistinc⋯use', NULL)─┬─isNotDistinc⋯NULL, NULL)─┐
│                        0 │                        1 │
└──────────────────────────┴──────────────────────────┘
```


## 데이터 Set 작업을 위한 연산자 \{#operators-for-working-with-data-sets\}

[IN 연산자](../../sql-reference/operators/in.md) 및 [EXISTS](../../sql-reference/operators/exists.md) 연산자를 참고하십시오.

### in 함수 \{#in-function\}

`a IN ...` – `in(a, b)` 함수입니다.

### notIn 함수 \{#notin-function\}

`a NOT IN ...` – 는 `notIn(a, b)` FUNCTION입니다.

### globalIn 함수 \{#globalin-function\}

`a GLOBAL IN ...` – `globalIn(a, b)` 함수에 해당합니다.

### globalNotIn 함수 \{#globalnotin-function\}

`a GLOBAL NOT IN ...` – `globalNotIn(a, b)` 함수입니다.

### in 서브쿼리 함수 \{#in-subquery-function\}

`a = ANY (subquery)` – `in(a, subquery)` 함수와 동일합니다.  

### notIn 서브쿼리 함수 \{#notin-subquery-function\}

`a != ANY (subquery)` – `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)`와 동일합니다.

### in 서브쿼리 함수 \{#in-subquery-function-1\}

`a = ALL (subquery)` – `a IN (SELECT singleValueOrNull(*) FROM subquery)`와 동일합니다.

### notIn 서브쿼리 함수 \{#notin-subquery-function-1\}

`a != ALL (subquery)` – `notIn(a, subquery)` 함수입니다.

**예시**

ALL을 사용하는 쿼리:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ALL (SELECT number FROM numbers(3, 3));
```

결과:

```text
┌─a─┐
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```

ANY를 사용하는 쿼리:

```sql
SELECT number AS a FROM numbers(10) WHERE a > ANY (SELECT number FROM numbers(3, 3));
```

결과:

```text
┌─a─┐
│ 4 │
│ 5 │
│ 6 │
│ 7 │
│ 8 │
│ 9 │
└───┘
```


## 날짜 및 시간 처리를 위한 연산자 \{#operators-for-working-with-dates-and-times\}

### EXTRACT \{#extract\}

```sql
EXTRACT(part FROM date);
```

지정한 날짜에서 특정 파트를 추출합니다. 예를 들어, 지정한 날짜에서 월을 가져오거나, 시간에서 초를 가져올 수 있습니다.

`part` 파라미터는 날짜의 어느 파트를 가져올지 지정합니다. 사용할 수 있는 값은 다음과 같습니다:

* `DAY` — 한 달 중 일(day)입니다. 가능한 값: 1–31.
* `MONTH` — 월을 나타내는 숫자입니다. 가능한 값: 1–12.
* `YEAR` — 연도입니다.
* `SECOND` — 초입니다. 가능한 값: 0–59.
* `MINUTE` — 분입니다. 가능한 값: 0–59.
* `HOUR` — 시입니다. 가능한 값: 0–23.

`part` 파라미터는 대소문자를 구분하지 않습니다.

`date` 파라미터는 처리할 날짜 또는 시간을 지정합니다. [Date](../../sql-reference/data-types/date.md) 형식과 [DateTime](../../sql-reference/data-types/datetime.md) 형식을 모두 지원합니다.

예시:

```sql
SELECT EXTRACT(DAY FROM toDate('2017-06-15'));
SELECT EXTRACT(MONTH FROM toDate('2017-06-15'));
SELECT EXTRACT(YEAR FROM toDate('2017-06-15'));
```

다음 예제에서는 테이블을 생성하고, 해당 테이블에 `DateTime` 타입 값을 하나 INSERT합니다.

```sql
CREATE TABLE test.Orders
(
    OrderId UInt64,
    OrderName String,
    OrderDate DateTime
)
ENGINE = Log;
```

```sql
INSERT INTO test.Orders VALUES (1, 'Jarlsberg Cheese', toDateTime('2008-10-11 13:23:44'));
```

```sql
SELECT
    toYear(OrderDate) AS OrderYear,
    toMonth(OrderDate) AS OrderMonth,
    toDayOfMonth(OrderDate) AS OrderDay,
    toHour(OrderDate) AS OrderHour,
    toMinute(OrderDate) AS OrderMinute,
    toSecond(OrderDate) AS OrderSecond
FROM test.Orders;
```

```text
┌─OrderYear─┬─OrderMonth─┬─OrderDay─┬─OrderHour─┬─OrderMinute─┬─OrderSecond─┐
│      2008 │         10 │       11 │        13 │          23 │          44 │
└───────────┴────────────┴──────────┴───────────┴─────────────┴─────────────┘
```

[tests](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00619_extract.sql)에서 더 많은 예제를 확인할 수 있습니다.


### INTERVAL \{#interval\}

[Interval](../../sql-reference/data-types/special-data-types/interval.md) 타입 값을 생성하며, 이 값은 [Date](../../sql-reference/data-types/date.md) 및 [DateTime](../../sql-reference/data-types/datetime.md) 타입 값과의 산술 연산에 사용됩니다.

Interval 타입의 종류:

* `SECOND`
* `MINUTE`
* `HOUR`
* `DAY`
* `WEEK`
* `MONTH`
* `QUARTER`
* `YEAR`

`INTERVAL` 값을 설정할 때 문자열 리터럴도 사용할 수 있습니다. 예를 들어, `INTERVAL 1 HOUR`는 `INTERVAL '1 hour'` 또는 `INTERVAL '1' hour`와 동일합니다.

:::tip
서로 다른 타입의 Interval은 함께 사용할 수 없습니다. `INTERVAL 4 DAY 1 HOUR`와 같은 표현은 사용할 수 없습니다. Interval의 가장 작은 단위보다 작거나 같은 단위로 Interval을 지정하십시오. 예를 들어, `INTERVAL 25 HOUR`처럼 지정합니다. 아래 예시와 같이 여러 번의 연산을 연달아 사용할 수 있습니다.
:::

예시:

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY + INTERVAL 3 HOUR;
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:09:50 │                                    2020-11-08 01:09:50 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4 day' + INTERVAL '3 hour';
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay(4)), toIntervalHour(3))─┐
│ 2020-11-03 22:12:10 │                                    2020-11-08 01:12:10 │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL '4' day + INTERVAL '3' hour;
```

```text
┌───current_date_time─┬─plus(plus(now(), toIntervalDay('4')), toIntervalHour('3'))─┐
│ 2020-11-03 22:33:19 │                                        2020-11-08 01:33:19 │
└─────────────────────┴────────────────────────────────────────────────────────────┘
```

:::note
`INTERVAL` 구문이나 `addDays` 함수 사용을 항상 권장합니다. `now() + ...`와 같은 단순 덧셈 또는 뺄셈 구문은 시간 설정을 고려하지 않습니다. 예를 들어, 일광 절약 시간제(서머타임)가 반영되지 않습니다.
:::

예시:

```sql
SELECT toDateTime('2014-10-26 00:00:00', 'Asia/Istanbul') AS time, time + 60 * 60 * 24 AS time_plus_24_hours, time + toIntervalDay(1) AS time_plus_1_day;
```

```text
┌────────────────time─┬──time_plus_24_hours─┬─────time_plus_1_day─┐
│ 2014-10-26 00:00:00 │ 2014-10-26 23:00:00 │ 2014-10-27 00:00:00 │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**추가 참고**

* [Interval](../../sql-reference/data-types/special-data-types/interval.md) 데이터 형식
* [toInterval](/sql-reference/functions/type-conversion-functions#toIntervalYear) 변환 함수


## 논리 AND 연산자 \{#logical-and-operator\}

구문 `SELECT a AND b` — 함수 [and](/sql-reference/functions/logical-functions#and)를 사용하여 `a`와 `b`의 논리곱을 계산합니다.

## 논리 OR 연산자 \{#logical-or-operator\}

`SELECT a OR b` 구문은 함수 [or](/sql-reference/functions/logical-functions#or)를 사용하여 `a`와 `b`의 논리합을 계산합니다.

## 논리 부정 연산자 \{#logical-negation-operator\}

구문은 `SELECT NOT a` 형식이며, 함수 [not](/sql-reference/functions/logical-functions#not)를 사용해 `a`의 논리 부정 값을 계산합니다.

## 조건 연산자 \{#conditional-operator\}

`a ? b : c` – `if(a, b, c)` 함수입니다.

참고:

조건 연산자는 먼저 b와 c의 값을 계산한 다음, 조건 a가 충족되는지 확인하고 해당 값을 반환합니다. `b` 또는 `c`가 [arrayJoin()](/sql-reference/functions/array-join) 함수이면, 조건 a와 상관없이 각 행이 모두 복제됩니다.

## 조건식 \{#conditional-expression\}

```sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

`x`가 지정된 경우 `transform(x, [a, ...], [b, ...], c)` 함수가 사용됩니다. 그렇지 않으면 `multiIf(a, b, ..., c)` 함수가 사용됩니다.

식에 `ELSE c` 절이 없는 경우 기본값은 `NULL`입니다.

`transform` 함수는 `NULL` 값을 처리하지 않습니다.


## Concatenation Operator \{#concatenation-operator\}

`s1 || s2` – `concat(s1, s2) FUNCTION`과 같습니다.

## 람다 생성 연산자 \{#lambda-creation-operator\}

`x -> expr` – `lambda(x, expr)` 함수입니다.

다음 연산자들은 괄호이므로 우선순위가 없습니다:

## 배열 생성 연산자 \{#array-creation-operator\}

`[x1, ...]` – `array(x1, ...)` 함수입니다.

## 튜플 생성 연산자 \{#tuple-creation-operator\}

`(x1, x2, ...)` – `tuple(x1, x2, ...)` 함수입니다.

## 결합법칙(Associativity) \{#associativity\}

모든 이항 연산자는 좌결합입니다. 예를 들어 `1 + 2 + 3` 은 `plus(plus(1, 2), 3)` 으로 변환됩니다.
하지만 항상 예상한 대로 동작하는 것은 아닙니다. 예를 들어 `SELECT 4 > 2 > 3` 의 결과는 0이 됩니다.

효율성을 위해 `and` 와 `or` 함수는 임의 개수의 인수를 허용합니다. 이에 따라 `AND` 와 `OR` 연산자로 이루어진 연쇄는 이 함수들에 대한 하나의 호출로 변환됩니다.

## `NULL` 값 확인 \{#checking-for-null\}

ClickHouse는 `IS NULL`와 `IS NOT NULL` 연산자를 지원합니다.

### IS NULL \{#is_null\}

* [널 허용(Nullable)](../../sql-reference/data-types/nullable.md) 타입의 값에 대해 `IS NULL` 연산자는 다음을 반환합니다.
  * 값이 `NULL`이면 `1`을 반환합니다.
  * 그렇지 않으면 `0`을 반환합니다.
* 그 외의 값에 대해서는 `IS NULL` 연산자가 항상 `0`을 반환합니다.

[optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 설정을 활성화하면 최적화할 수 있습니다. `optimize_functions_to_subcolumns = 1`인 경우 함수는 전체 컬럼 데이터를 읽고 처리하는 대신 [null](../../sql-reference/data-types/nullable.md#finding-null) 서브컬럼만 읽습니다. 쿼리 `SELECT n IS NULL FROM table`은 `SELECT n.null FROM TABLE`로 변환됩니다.

{/* */ }

```sql
SELECT x+100 FROM t_null WHERE y IS NULL
```

```text
┌─plus(x, 100)─┐
│          101 │
└──────────────┘
```


### IS NOT NULL \{#is_not_null\}

* [널 허용](../../sql-reference/data-types/nullable.md) 타입의 값에 대해 `IS NOT NULL` 연산자는 다음과 같이 동작합니다.
  * 값이 `NULL`이면 `0`을 반환합니다.
  * 그렇지 않으면 `1`을 반환합니다.
* 그 외 타입의 값에 대해서는 `IS NOT NULL` 연산자는 항상 `1`을 반환합니다.

{/* */ }

```sql
SELECT * FROM t_null WHERE y IS NOT NULL
```

```text
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

[optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 설정을 활성화하여 최적화할 수 있습니다. `optimize_functions_to_subcolumns = 1`인 경우 함수는 전체 컬럼 데이터를 읽고 처리하는 대신 [null](../../sql-reference/data-types/nullable.md#finding-null) 서브컬럼만 읽습니다. `SELECT n IS NOT NULL FROM table` 쿼리는 `SELECT NOT n.null FROM TABLE`로 변환됩니다.
