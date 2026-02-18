---
description: '조건부 함수에 대한 문서'
sidebar_label: '조건부'
slug: /sql-reference/functions/conditional-functions
title: '조건부 함수(Conditional Functions)'
doc_type: 'reference'
---

# 조건부 함수 \{#conditional-functions\}

## 개요 \{#overview\}

### 조건 결과를 직접 사용하기 \{#using-conditional-results-directly\}

조건문의 결과는 항상 `0`, `1` 또는 `NULL`입니다. 따라서 다음과 같이 조건 결과를 직접 사용할 수 있습니다:

```sql
SELECT left < right AS is_small
FROM LEFT_RIGHT

┌─is_small─┐
│     ᴺᵁᴸᴸ │
│        1 │
│        0 │
│        0 │
│     ᴺᵁᴸᴸ │
└──────────┘
```

### 조건식에서의 NULL 값 \{#null-values-in-conditionals\}

조건식에 `NULL` 값이 포함되어 있으면 결과도 `NULL`이 됩니다.

```sql
SELECT
    NULL < 1,
    2 < NULL,
    NULL < NULL,
    NULL = NULL

┌─less(NULL, 1)─┬─less(2, NULL)─┬─less(NULL, NULL)─┬─equals(NULL, NULL)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ               │
└───────────────┴───────────────┴──────────────────┴────────────────────┘
```

따라서 데이터 타입이 널 허용(`Nullable`)이면 쿼리를 신중하게 작성해야 합니다.

다음 예시는 `multiIf`에 등호 조건을 추가하지 않아 쿼리가 실패하는 상황을 통해 이를 보여 줍니다.

```sql
SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'right is smaller', 'Both equal') AS faulty_result
FROM LEFT_RIGHT

┌─left─┬─right─┬─faulty_result────┐
│ ᴺᵁᴸᴸ │     4 │ Both equal       │
│    1 │     3 │ left is smaller  │
│    2 │     2 │ Both equal       │
│    3 │     1 │ right is smaller │
│    4 │  ᴺᵁᴸᴸ │ Both equal       │
└──────┴───────┴──────────────────┘
```

### CASE 구문 \{#case-statement\}

ClickHouse의 CASE 표현식은 SQL CASE 연산자와 유사한 조건부 로직을 제공합니다. 조건을 평가한 후, 처음으로 일치하는 조건에 따라 값을 반환합니다.

ClickHouse는 두 가지 형식의 CASE를 지원합니다.

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br />
   이 형식은 높은 유연성을 제공하며, 내부적으로 [multiIf](/sql-reference/functions/conditional-functions#multiIf) 함수를 사용해 구현됩니다. 각 조건은 서로 독립적으로 평가되며, 식에는 비상수 값도 포함될 수 있습니다.

```sql
SELECT
    number,
    CASE
        WHEN number % 2 = 0 THEN number + 1
        WHEN number % 2 = 1 THEN number * 10
        ELSE number
    END AS result
FROM system.numbers
WHERE number < 5;

-- is translated to
SELECT
    number,
    multiIf((number % 2) = 0, number + 1, (number % 2) = 1, number * 10, number) AS result
FROM system.numbers
WHERE number < 5

┌─number─┬─result─┐
│      0 │      1 │
│      1 │     10 │
│      2 │      3 │
│      3 │     30 │
│      4 │      5 │
└────────┴────────┘

5 rows in set. Elapsed: 0.002 sec.
```

2. `CASE <expr> WHEN <val1> THEN ... WHEN <val2> THEN ... ELSE ... END`
   <br />
   이 더 간결한 구문은 상수 값 비교에 최적화되어 있으며, 내부적으로 `caseWithExpression()`을 사용합니다.

예를 들어, 다음 구문은 유효합니다:

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN 100
        WHEN 1 THEN 200
        ELSE 0
    END AS result
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    caseWithExpression(number, 0, 100, 1, 200, 0) AS result
FROM system.numbers
WHERE number < 3
```

┌─number─┬─result─┐
│      0 │    100 │
│      1 │    200 │
│      2 │      0 │
└────────┴────────┘

3개의 행이 조회되었습니다. 경과 시간: 0.002초.

````

This form also does not require return expressions to be constants.

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN number + 1
        WHEN 1 THEN number * 10
        ELSE number
    END
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    caseWithExpression(number, 0, number + 1, 1, number * 10, number)
FROM system.numbers
WHERE number < 3

┌─number─┬─caseWithExpr⋯0), number)─┐
│      0 │                        1 │
│      1 │                       10 │
│      2 │                        2 │
└────────┴──────────────────────────┘

3 rows in set. Elapsed: 0.001 sec.
````

#### 주의사항 \{#caveats\}

ClickHouse는 CASE 표현식(또는 `multiIf`와 같은 내부적으로 동등한 표현식)의 결과 타입을, 어떤 조건을 평가하기 전에 먼저 결정합니다. 이는 반환 표현식의 타입이 서로 다를 때(예: 서로 다른 타임존이나 숫자 타입) 중요합니다.

* 결과 타입은 모든 분기 중에서 서로 호환 가능한 타입 가운데 가장 넓은 범위를 지원하는 타입을 기준으로 선택됩니다.
* 이 타입이 선택되고 나면, 다른 모든 분기는 런타임에 실제로 실행되지 않더라도 암시적으로 해당 타입으로 캐스팅됩니다.
* 타임존이 타입 시그니처의 일부인 DateTime64 같은 타입의 경우, 이런 동작은 예상과 다른 결과를 낳을 수 있습니다. 가장 먼저 등장한 타임존이, 다른 분기에서 서로 다른 타임존을 지정하더라도 모든 분기에 사용될 수 있습니다.

예를 들어, 아래 예시에서는 모든 행이 첫 번째로 매칭된 분기의 타임존, 즉 `Asia/Kolkata` 기준의 타임스탬프를 반환합니다.

```sql
SELECT
    number,
    CASE
        WHEN number = 0 THEN fromUnixTimestamp64Milli(0, 'Asia/Kolkata')
        WHEN number = 1 THEN fromUnixTimestamp64Milli(0, 'America/Los_Angeles')
        ELSE fromUnixTimestamp64Milli(0, 'UTC')
    END AS tz
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    multiIf(number = 0, fromUnixTimestamp64Milli(0, 'Asia/Kolkata'), number = 1, fromUnixTimestamp64Milli(0, 'America/Los_Angeles'), fromUnixTimestamp64Milli(0, 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬──────────────────────tz─┐
│      0 │ 1970-01-01 05:30:00.000 │
│      1 │ 1970-01-01 05:30:00.000 │
│      2 │ 1970-01-01 05:30:00.000 │
└────────┴─────────────────────────┘

3 rows in set. Elapsed: 0.011 sec.
```

여기에서 ClickHouse는 여러 개의 `DateTime64(3, <timezone>)` 반환 타입을 감지합니다. 가장 먼저 보이는 `DateTime64(3, 'Asia/Kolkata'`를 공통 타입으로 추론하고, 다른 분기들을 이 타입으로 암시적으로 캐스팅합니다.

이는 문자열로 변환하여 의도한 시간대 포맷을 보존하는 방식으로 해결할 수 있습니다:

```sql
SELECT
    number,
    multiIf(
        number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'),
        number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'),
        formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')
    ) AS tz
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    multiIf(number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'), number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'), formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')) AS tz
FROM system.numbers
WHERE number < 3
```

┌─number─┬─tz──────────────────┐
│      0 │ 1970-01-01 05:30:00 │
│      1 │ 1969-12-31 16:00:00 │
│      2 │ 1970-01-01 00:00:00 │
└────────┴─────────────────────┘

결과 세트의 행: 3개. 경과 시간: 0.002초.

```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->
```

{/*AUTOGENERATED_START*/ }

## clamp \{#clamp\}

도입된 버전: v24.5

값이 지정된 최소값과 최대값 범위 내에 있도록 제한합니다.

값이 최소값보다 작으면 최소값을 반환합니다. 값이 최대값보다 크면 최대값을 반환합니다. 그렇지 않으면 해당 값을 그대로 반환합니다.

모든 인수는 서로 비교 가능한 타입이어야 합니다. 결과 타입은 모든 인수 중에서 가장 범위가 넓은 호환 타입입니다.

**구문**

```sql
clamp(value, min, max)
```

**인수**

* `value` — 클램프할 값입니다.
* `min` — 최소 경계값입니다.
* `max` — 최대 경계값입니다.

**반환 값**

[`min`, `max`] 범위로 제한된 값을 반환합니다.

**예시**

**기본 사용 예**

```sql title=Query
SELECT clamp(5, 1, 10) AS result;
```

```response title=Response
┌─result─┐
│      5 │
└────────┘
```

**최솟값 미만**

```sql title=Query
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      0 │
└────────┘
```

**최댓값보다 큰 값**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      7 │
└────────┘
```

## greatest \{#greatest\}

도입 버전: v1.1

인수 중에서 가장 큰 값을 반환합니다.
`NULL` 인수는 무시됩니다.

* 배열의 경우, 사전식으로 가장 큰 배열을 반환합니다.
* `DateTime` 타입의 경우, 결과 타입은 더 큰 타입으로 승격됩니다(예: `DateTime32`와 함께 사용되면 `DateTime64`).

:::note `NULL` 동작을 변경하려면 `least_greatest_legacy_null_behavior` 설정을 사용하십시오
버전 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19)에서는 `NULL` 값을 무시하도록 하는 하위 호환이 되지 않는 변경이 도입되었습니다. 이전에는 인수 가운데 하나가 `NULL`인 경우 `NULL`을 반환했습니다.
이전 동작을 유지하려면 `least_greatest_legacy_null_behavior` 설정(기본값: `false`)을 `true`로 설정하십시오.
:::

**구문**

```sql
greatest(x1[, x2, ...])
```

**인수**

* `x1[, x2, ...]` — 비교할 하나 이상의 값입니다. 모든 인수는 서로 비교 가능한 타입이어야 합니다. [`Any`](/sql-reference/data-types)

**반환 값**

인수들 중 가장 큰 값을, 호환 가능한 타입 중 가장 큰 타입으로 승격하여 반환합니다. [`Any`](/sql-reference/data-types)

**예시**

**숫자 타입**

```sql title=Query
SELECT greatest(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- The type returned is a Float64 as the UInt8 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

**배열**

```sql title=Query
SELECT greatest(['hello'], ['there'], ['world']);
```

```response title=Response
┌─greatest(['hello'], ['there'], ['world'])─┐
│ ['world']                                 │
└───────────────────────────────────────────┘
```

**DateTime 타입**

```sql title=Query
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─greatest(toD⋯(now(), 3))─┐
│  2025-05-28 15:50:53.000 │
└──────────────────────────┘
```

## if \{#if\}

도입된 버전: v1.1

조건 분기를 수행합니다.

* 조건 `cond`가 0이 아닌 값으로 평가되면 함수는 표현식 `then`의 결과를 반환합니다.
* `cond`가 0 또는 NULL로 평가되면 `else` 표현식의 결과를 반환합니다.

[`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) 설정은 단락 평가(short-circuit evaluation) 사용 여부를 제어합니다.

설정이 활성화되어 있으면 `then` 표현식은 `cond`가 true인 행에 대해서만 평가되고, `else` 표현식은 `cond`가 false인 행에 대해서만 평가됩니다.

예를 들어, 단락 평가가 활성화된 경우 다음 쿼리를 실행해도 0으로 나누기 예외가 발생하지 않습니다:

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then`과 `else`는 같은 타입이어야 합니다.

**문법**

```sql
if(cond, then, else)
```

**인수**

* `cond` — 평가되는 조건입니다. [`UInt8`](/sql-reference/data-types/int-uint) 또는 [`Nullable(UInt8)` 널 허용](/sql-reference/data-types/nullable) 또는 [`NULL`](/sql-reference/syntax#null)
* `then` — `cond`가 true일 때 반환되는 표현식입니다. - `else` — `cond`가 false이거나 `NULL`일 때 반환되는 표현식입니다.

**반환 값**

조건 `cond`에 따라 `then` 또는 `else` 표현식 중 하나의 결과가 반환됩니다.

**예시**

**사용 예시**

```sql title=Query
SELECT if(1, 2 + 2, 2 + 6) AS res;
```

```response title=Response
┌─res─┐
│   4 │
└─────┘
```

## least \{#least\}

도입된 버전: v1.1

인수 중에서 가장 작은 값을 반환합니다.
`NULL` 인수는 무시됩니다.

* 배열의 경우, 사전식으로 가장 작은 배열을 반환합니다.
* DateTime 타입의 경우, 결과 타입은 가장 큰 타입으로 승격됩니다(예: DateTime32와 혼합되면 DateTime64).

:::note `NULL` 동작을 변경하려면 `least_greatest_legacy_null_behavior` 설정을 사용하십시오
버전 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19)에서 하위 호환되지 않는 변경 사항이 도입되어, 하나의 인수가 `NULL`인 경우 `NULL`을 반환하던 이전 동작과 달리 이제는 `NULL` 값이 무시됩니다.
이전 동작을 유지하려면 설정 `least_greatest_legacy_null_behavior`(기본값: `false`)를 `true`로 설정하십시오.
:::

**구문**

```sql
least(x1[, x2, ...])
```

**인수**

* `x1[, x2, ...]` — 비교할 단일 값 또는 여러 값입니다. 모든 인수는 서로 비교 가능한 타입이어야 합니다. [`Any`](/sql-reference/data-types)

**반환 값**

인수 가운데 가장 작은 값을 반환하며, 호환되는 가장 넓은 타입으로 승격됩니다. [`Any`](/sql-reference/data-types)

**예제**

**숫자 타입**

```sql title=Query
SELECT least(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- The type returned is a Float64 as the UInt8 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

**배열**

```sql title=Query
SELECT least(['hello'], ['there'], ['world']);
```

```response title=Response
┌─least(['hell⋯ ['world'])─┐
│ ['hello']                │
└──────────────────────────┘
```

**DateTime 데이터 타입**

```sql title=Query
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```

## multiIf \{#multiIf\}

도입된 버전: v1.1

쿼리에서 [`CASE`](/sql-reference/operators#conditional-expression) 연산자를 더 간결하게 작성할 수 있게 해 줍니다.
각 조건을 순서대로 평가하며, 참(0이 아니고 `NULL`이 아닌)인 첫 번째 조건에 대해 해당 분기 값을 반환합니다.
어느 조건도 참이 아니면 `else` 값을 반환합니다.

[`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) SETTING은
쇼트서킷(short-circuit) 평가 사용 여부를 제어합니다. 활성화된 경우 `then_i` 표현식은
`((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)`가 참인 행에서만 평가됩니다.

예를 들어 쇼트서킷 평가를 사용하는 경우, 다음 쿼리를 실행해도 0으로 나누기 예외가 발생하지 않습니다.

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

모든 분기 및 else 표현식은 공통 상위 타입(supertype)을 가져야 합니다. `NULL` 조건은 false로 취급됩니다.

**구문**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**별칭**: `caseWithoutExpression`, `caseWithoutExpr`

**인수**

* `cond_N` — `then_N`이 반환되는지를 제어하는 N번째로 평가되는 조건입니다. [`UInt8`](/sql-reference/data-types/int-uint) 또는 [`Nullable(UInt8)`](/sql-reference/data-types/nullable) 또는 [`NULL`](/sql-reference/syntax#null)
* `then_N` — `cond_N`이 true일 때 함수의 결과입니다. `else` — 어떤 조건도 true가 아닐 때 함수의 결과입니다.

**반환 값**

일치하는 `cond_N`에 대해서는 해당 `then_N`의 결과를 반환하고, 일치하는 것이 없으면 `else`의 결과를 반환합니다.

**예시**

**사용 예시**

```sql title=Query
CREATE TABLE LEFT_RIGHT (left Nullable(UInt8), right Nullable(UInt8)) ENGINE = Memory;
INSERT INTO LEFT_RIGHT VALUES (NULL, 4), (1, 3), (2, 2), (3, 1), (4, NULL);

SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'left is greater', left = right, 'Both equal', 'Null value') AS result
FROM LEFT_RIGHT;
```

```response title=Response
┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Null value      │
│    1 │     3 │ left is smaller │
│    2 │     2 │ Both equal      │
│    3 │     1 │ left is greater │
│    4 │  ᴺᵁᴸᴸ │ Null value      │
└──────┴───────┴─────────────────┘
```

{/*AUTOGENERATED_END*/ }
