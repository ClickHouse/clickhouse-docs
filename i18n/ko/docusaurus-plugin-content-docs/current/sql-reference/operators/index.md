---
'description': 'Operators에 대한 문서'
'displayed_sidebar': 'sqlreference'
'sidebar_label': 'Operators'
'sidebar_position': 38
'slug': '/sql-reference/operators/'
'title': '연산자'
'doc_type': 'reference'
---


# 연산자

ClickHouse는 쿼리 파싱 단계에서 연산자를 해당 함수로 변환하며, 이 과정에서 우선순위, 선행성 및 결합성을 고려합니다.

## 접근 연산자 {#access-operators}

`a[N]` – 배열 요소에 접근합니다. `arrayElement(a, N)` 함수입니다.

`a.N` – 튜플 요소에 접근합니다. `tupleElement(a, N)` 함수입니다.

## 숫자 부정 연산자 {#numeric-negation-operator}

`-a` – `negate(a)` 함수입니다.

튜플 부정에 대해서는: [tupleNegate](../../sql-reference/functions/tuple-functions.md#tupleNegate) 참조.

## 곱셈 및 나눗셈 연산자 {#multiplication-and-division-operators}

`a * b` – `multiply(a, b)` 함수입니다.

튜플에 숫자를 곱할 때: [tupleMultiplyByNumber](../../sql-reference/functions/tuple-functions.md#tupleMultiplyByNumber), 스칼라 곱을 위한 경우: [dotProduct](/sql-reference/functions/array-functions#arrayDotProduct).

`a / b` – `divide(a, b)` 함수입니다.

튜플에 숫자를 나눌 때: [tupleDivideByNumber](../../sql-reference/functions/tuple-functions.md#tupleDivideByNumber).

`a % b` – `modulo(a, b)` 함수입니다.

## 덧셈 및 뺄셈 연산자 {#addition-and-subtraction-operators}

`a + b` – `plus(a, b)` 함수입니다.

튜플 덧셈에 대해서는: [tuplePlus](../../sql-reference/functions/tuple-functions.md#tuplePlus).

`a - b` – `minus(a, b)` 함수입니다.

튜플 뺄셈에 대해서는: [tupleMinus](../../sql-reference/functions/tuple-functions.md#tupleMinus).

## 비교 연산자 {#comparison-operators}

### equals 함수 {#equals-function}
`a = b` – `equals(a, b)` 함수입니다.

`a == b` – `equals(a, b)` 함수입니다.

### notEquals 함수 {#notequals-function}
`a != b` – `notEquals(a, b)` 함수입니다.

`a <> b` – `notEquals(a, b)` 함수입니다.

### lessOrEquals 함수 {#lessorequals-function}
`a <= b` – `lessOrEquals(a, b)` 함수입니다.

### greaterOrEquals 함수 {#greaterorequals-function}
`a >= b` – `greaterOrEquals(a, b)` 함수입니다.

### less 함수 {#less-function}
`a < b` – `less(a, b)` 함수입니다.

### greater 함수 {#greater-function}
`a > b` – `greater(a, b)` 함수입니다.

### like 함수 {#like-function}
`a LIKE b` – `like(a, b)` 함수입니다.

### notLike 함수 {#notlike-function}
`a NOT LIKE b` – `notLike(a, b)` 함수입니다.

### ilike 함수 {#ilike-function}
`a ILIKE b` – `ilike(a, b)` 함수입니다.

### BETWEEN 함수 {#between-function}
`a BETWEEN b AND c` – `a >= b AND a <= c`와 동일합니다.

`a NOT BETWEEN b AND c` – `a < b OR a > c`와 동일합니다.

## 데이터 세트 작업을 위한 연산자 {#operators-for-working-with-data-sets}

[IN 연산자](../../sql-reference/operators/in.md) 및 [EXISTS](../../sql-reference/operators/exists.md) 연산자를 참조하세요.

### in 함수 {#in-function}
`a IN ...` – `in(a, b)` 함수입니다.

### notIn 함수 {#notin-function}
`a NOT IN ...` – `notIn(a, b)` 함수입니다.

### globalIn 함수 {#globalin-function}
`a GLOBAL IN ...` – `globalIn(a, b)` 함수입니다.

### globalNotIn 함수 {#globalnotin-function}
`a GLOBAL NOT IN ...` – `globalNotIn(a, b)` 함수입니다.

### in 서브쿼리 함수 {#in-subquery-function}
`a = ANY(subquery)` – `in(a, subquery)` 함수입니다.  

### notIn 서브쿼리 함수 {#notin-subquery-function}
`a != ANY(subquery)` – `a NOT IN (SELECT singleValueOrNull(*) FROM subquery)`와 동일합니다.

### in 서브쿼리 함수 {#in-subquery-function-1}
`a = ALL(subquery)` – `a IN (SELECT singleValueOrNull(*) FROM subquery)`와 동일합니다.

### notIn 서브쿼리 함수 {#notin-subquery-function-1}
`a != ALL(subquery)` – `notIn(a, subquery)` 함수입니다.

**예시**

ALL가 있는 쿼리:

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

ANY가 있는 쿼리:

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

## 날짜 및 시간 작업을 위한 연산자 {#operators-for-working-with-dates-and-times}

### EXTRACT {#extract}

```sql
EXTRACT(part FROM date);
```

주어진 날짜에서 부분을 추출합니다. 예를 들어, 주어진 날짜에서 월을 가져오거나 시간에서 초를 가져올 수 있습니다.

`part` 매개변수는 어떤 날짜 부분을 추출할지 지정합니다. 사용 가능한 값은 다음과 같습니다:

- `DAY` — 월의 날. 가능한 값: 1–31.
- `MONTH` — 월의 번호. 가능한 값: 1–12.
- `YEAR` — 연도.
- `SECOND` — 초. 가능한 값: 0–59.
- `MINUTE` — 분. 가능한 값: 0–59.
- `HOUR` — 시간. 가능한 값: 0–23.

`part` 매개변수는 대소문자를 구분하지 않습니다.

`date` 매개변수는 처리할 날짜 또는 시간을 지정합니다. [Date](../../sql-reference/data-types/date.md) 또는 [DateTime](../../sql-reference/data-types/datetime.md) 유형이 지원됩니다.

예시:

```sql
SELECT EXTRACT(DAY FROM toDate('2017-06-15'));
SELECT EXTRACT(MONTH FROM toDate('2017-06-15'));
SELECT EXTRACT(YEAR FROM toDate('2017-06-15'));
```

다음 예시에서는 테이블을 생성하고 그 안에 `DateTime` 유형의 값을 삽입합니다.

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

더 많은 예시는 [tests](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00619_extract.sql)에서 확인할 수 있습니다.

### INTERVAL {#interval}

[Interval](../../sql-reference/data-types/special-data-types/interval.md) 유형의 값을 생성하며, 이는 [Date](../../sql-reference/data-types/date.md)와 [DateTime](../../sql-reference/data-types/datetime.md) 유형의 값과 수학적 연산을 수행할 때 사용합니다.

간격의 타입:
- `SECOND`
- `MINUTE`
- `HOUR`
- `DAY`
- `WEEK`
- `MONTH`
- `QUARTER`
- `YEAR`

`INTERVAL` 값을 설정할 때 문자열 리터럴을 사용할 수 있습니다. 예를 들어, `INTERVAL 1 HOUR`는 `INTERVAL '1 hour'` 또는 `INTERVAL '1' hour`와 동일합니다.

:::tip    
서로 다른 유형의 간격을 결합할 수 없습니다. `INTERVAL 4 DAY 1 HOUR`와 같은 표현은 사용할 수 없습니다. 가장 작은 간격 단위보다 작거나 같은 단위로 간격을 지정해야 합니다. 예: `INTERVAL 25 HOUR`. 아래 예제와 같이 연속적인 연산을 사용할 수 있습니다.
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
`INTERVAL` 구문이나 `addDays` 함수가 항상 선호됩니다. 단순한 덧셈이나 뺄셈(예: `now() + ...`와 같은 구문)은 시간 설정을 고려하지 않습니다. 예를 들어, 서머타임.
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

**참고 항목**

- [Interval](../../sql-reference/data-types/special-data-types/interval.md) 데이터 유형
- [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear) 타입 변환 함수

## 논리 AND 연산자 {#logical-and-operator}

구문 `SELECT a AND b` — `a`와 `b`의 논리적 합성을 [and](/sql-reference/functions/logical-functions#and) 함수로 계산합니다.

## 논리 OR 연산자 {#logical-or-operator}

구문 `SELECT a OR b` — `a`와 `b`의 논리적 합집합을 [or](/sql-reference/functions/logical-functions#or) 함수로 계산합니다.

## 논리 부정 연산자 {#logical-negation-operator}

구문 `SELECT NOT a` — `a`의 논리적 부정을 [not](/sql-reference/functions/logical-functions#not) 함수로 계산합니다.

## 조건부 연산자 {#conditional-operator}

`a ? b : c` – `if(a, b, c)` 함수입니다.

참고:

조건부 연산자는 b와 c의 값을 계산한 후, 조건 a가 충족되는지 확인하고, 해당하는 값을 반환합니다. 만약 `b`나 `C`가 [arrayJoin()](/sql-reference/functions/array-join) 함수라면, 각 행은 "a" 조건과 관계없이 복제됩니다.

## 조건부 표현식 {#conditional-expression}

```sql
CASE [x]
    WHEN a THEN b
    [WHEN ... THEN ...]
    [ELSE c]
END
```

`x`가 지정된 경우, `transform(x, [a, ...], [b, ...], c)` 함수가 사용됩니다. 그렇지 않으면 – `multiIf(a, b, ..., c)`가 사용됩니다.

표현식에 `ELSE c` 절이 없는 경우, 기본 값은 `NULL`입니다.

`transform` 함수는 `NULL`과 함께 작동하지 않습니다.

## 연결 연산자 {#concatenation-operator}

`s1 || s2` – `concat(s1, s2) 함수입니다.`

## 람다 생성 연산자 {#lambda-creation-operator}

`x -> expr` – `lambda(x, expr) 함수입니다.`

다음 연산자들은 우선순위가 없으며 괄호 역할을 합니다:

## 배열 생성 연산자 {#array-creation-operator}

`[x1, ...]` – `array(x1, ...) 함수입니다.`

## 튜플 생성 연산자 {#tuple-creation-operator}

`(x1, x2, ...)` – `tuple(x1, x2, ...) 함수입니다.`

## 결합성 {#associativity}

모든 이항 연산자는 좌측 결합성을 갖습니다. 예를 들어, `1 + 2 + 3`은 `plus(plus(1, 2), 3)`으로 변환됩니다.  
가끔 이 예상한 대로 작동하지 않을 수 있습니다. 예를 들어, `SELECT 4 > 2 > 3`은 0을 반환합니다.

효율성을 위해 `and` 및 `or` 함수는 임의의 수의 인수를 허용합니다. 해당하는 `AND` 및 `OR` 연산자의 체인은 이러한 함수의 단일 호출로 변환됩니다.

## `NULL` 확인하기 {#checking-for-null}

ClickHouse는 `IS NULL` 및 `IS NOT NULL` 연산자를 지원합니다.

### IS NULL {#is_null}

- [Nullable](../../sql-reference/data-types/nullable.md) 유형 값에 대해, `IS NULL` 연산자는 다음을 반환합니다:
  - `1`, 만약 값이 `NULL`일 경우.
  - 그 외의 경우에는 `0`을 반환합니다.
- 다른 값의 경우, `IS NULL` 연산자는 항상 `0`을 반환합니다.

[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 설정을 활성화하여 최적화할 수 있습니다. `optimize_functions_to_subcolumns = 1`인 경우, 이 함수는 전체 컬럼 데이터를 읽고 처리하는 대신 [null](../../sql-reference/data-types/nullable.md#finding-null) 하위 컬럼만 읽습니다. 쿼리 `SELECT n IS NULL FROM table`은 `SELECT n.null FROM TABLE`로 변환됩니다.

<!-- -->

```sql
SELECT x+100 FROM t_null WHERE y IS NULL
```

```text
┌─plus(x, 100)─┐
│          101 │
└──────────────┘
```

### IS NOT NULL {#is_not_null}

- [Nullable](../../sql-reference/data-types/nullable.md) 유형 값에 대해, `IS NOT NULL` 연산자는 다음을 반환합니다:
  - `0`, 만약 값이 `NULL`일 경우.
  - 그 외의 경우에는 `1`을 반환합니다.
- 다른 값의 경우, `IS NOT NULL` 연산자는 항상 `1`을 반환합니다.

<!-- -->

```sql
SELECT * FROM t_null WHERE y IS NOT NULL
```

```text
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 설정을 활성화하여 최적화할 수 있습니다. `optimize_functions_to_subcolumns = 1`인 경우, 이 함수는 전체 컬럼 데이터를 읽고 처리하는 대신 [null](../../sql-reference/data-types/nullable.md#finding-null) 하위 컬럼만 읽습니다. 쿼리 `SELECT n IS NOT NULL FROM table`은 `SELECT NOT n.null FROM TABLE`로 변환됩니다.
