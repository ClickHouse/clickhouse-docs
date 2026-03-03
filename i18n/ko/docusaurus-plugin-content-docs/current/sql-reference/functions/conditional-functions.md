---
description: '조건부 함수 문서'
sidebar_label: '조건부'
slug: /sql-reference/functions/conditional-functions
title: '조건부 함수'
doc_type: 'reference'
---

# 조건부 함수 \{#conditional-functions\}

## 개요 \{#overview\}

### 조건식 결과의 직접 사용 \{#using-conditional-results-directly\}

조건식은 항상 `0`, `1` 또는 `NULL` 중 하나의 값을 반환합니다. 따라서 다음과 같이 조건식 결과를 직접 사용할 수 있습니다:

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


### 조건식에서 NULL 값 \{#null-values-in-conditionals\}

조건식에 `NULL` 값이 포함되면 결과 역시 `NULL`이 됩니다.

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

따라서 타입이 `Nullable`인 경우 쿼리를 신중하게 구성해야 합니다.

다음 예시는 `multiIf`에 동등 비교 조건을 추가하지 않았을 때 어떻게 실패하는지 보여 줍니다.

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


### CASE 문 \{#case-statement\}

ClickHouse의 CASE 표현식은 SQL CASE 연산자와 유사한 조건부 로직을 구현합니다. 조건을 평가하고, 처음으로 일치하는 조건에 따라 값을 반환합니다.

ClickHouse는 두 가지 형태의 CASE를 지원합니다:

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br />
   이 형태는 높은 유연성을 제공하며, 내부적으로 [multiIf](/sql-reference/functions/conditional-functions#multiIf) 함수로 구현됩니다. 각 조건은 서로 독립적으로 평가되며, 식에는 상수가 아닌 값도 포함될 수 있습니다.

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

┌─number─┬─result─┐
│      0 │    100 │
│      1 │    200 │
│      2 │      0 │
└────────┴────────┘

3 rows in set. Elapsed: 0.002 sec.
```

또한 이 형태에서는 반환 식이 상수일 필요가 없습니다.

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
```


#### 주의사항 \{#caveats\}

ClickHouse는 CASE 표현식(또는 `multiIf`와 같은 내부적으로 동등한 표현식)의 결과 타입을, 어떤 조건도 평가하기 전에 먼저 결정합니다. 이는 반환 표현식의 타입이 서로 다를 때(예: 서로 다른 타임존 또는 숫자 타입) 중요합니다.

* 결과 타입은 모든 분기에서 서로 호환 가능한 타입 중 가장 큰 타입을 기준으로 선택됩니다.
* 한 번 이 타입이 선택되면, 런타임에서 실제로 해당 분기의 로직이 실행되지 않더라도 나머지 모든 분기는 암묵적으로 이 타입으로 캐스팅됩니다.
* DateTime64처럼 타임존이 타입 시그니처의 일부인 타입의 경우, 예상치 못한 동작을 유발할 수 있습니다. 예를 들어, 첫 번째로 발견된 타임존이 다른 분기에서 서로 다른 타임존을 지정하더라도 모든 분기에 사용될 수 있습니다.

예를 들어, 아래 예에서는 모든 행이 첫 번째로 매칭된 분기의 타임존, 즉 `Asia/Kolkata` 타임존의 타임스탬프를 반환합니다.

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

여기에서 ClickHouse는 여러 개의 `DateTime64(3, <timezone>)` 반환 타입을 인식합니다. 첫 번째로 보이는 `DateTime64(3, 'Asia/Kolkata'`를 공통 타입으로 추론하고, 다른 분기들을 암시적으로 이 타입으로 캐스팅합니다.

의도한 시간대 형식을 보존하기 위해 문자열로 변환하여 이 문제를 해결할 수 있습니다:

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

┌─number─┬─tz──────────────────┐
│      0 │ 1970-01-01 05:30:00 │
│      1 │ 1969-12-31 16:00:00 │
│      2 │ 1970-01-01 00:00:00 │
└────────┴─────────────────────┘

3 rows in set. Elapsed: 0.002 sec.
```

{/* 
  아래 태그의 내부 콘텐츠는 문서 프레임워크 빌드 시점에 
  system.functions에서 생성된 문서로 대체됩니다. 태그를 수정하거나 제거하지 마십시오.
  자세한 내용은 https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md 를 참조하십시오.
  */ }

{/*AUTOGENERATED_START*/ }


## clamp \{#clamp\}

도입 버전: v24.5.0

값이 지정된 최소값과 최대값 사이의 범위에 있도록 제한합니다.

값이 최소값보다 작으면 최소값을 반환합니다. 값이 최대값보다 크면 최대값을 반환합니다. 그렇지 않으면 값 자체를 반환합니다.

모든 인수는 서로 비교 가능한 타입이어야 합니다. 결과 타입은 모든 인수 중에서 가장 호환 가능한 가장 넓은 타입입니다.

**구문**

```sql
clamp(value, min, max)
```

**Arguments**

* `value` — 지정된 범위로 제한할 값입니다. - `min` — 최솟값(하한)입니다. - `max` — 최댓값(상한)입니다.

**Returned value**

[min, max] 범위로 제한된 값을 반환합니다.

**Examples**

**기본 사용법**

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

**최댓값 초과**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      7 │
└────────┘
```


## greatest \{#greatest\}

도입된 버전: v1.1.0

인수 중에서 가장 큰 값을 반환합니다.
`NULL` 인수는 무시됩니다.

* 배열의 경우, 사전식으로 가장 큰 배열을 반환합니다.
* `DateTime` 타입의 경우, 결과 타입은 가장 큰 타입으로 승격됩니다(예: `DateTime32`와 함께 사용되면 `DateTime64`).

:::note `NULL` 동작을 변경하려면 설정 `least_greatest_legacy_null_behavior`를 사용
버전 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19)에서는 `NULL` 값이 무시되도록 하는, 이전 버전과 호환되지 않는 변경 사항이 도입되었습니다. 이전에는 인수 중 하나가 `NULL`이면 `NULL`을 반환했습니다.
이전 동작을 유지하려면 설정 `least_greatest_legacy_null_behavior`(기본값: `false`)를 `true`로 설정합니다.
:::

**구문**

```sql
greatest(x1[, x2, ...])
```

**인자**

* `x1[, x2, ...]` — 비교할 하나 이상의 값입니다. 모든 인자는 서로 비교 가능한 타입이어야 합니다. [`Any`](/sql-reference/data-types)

**반환 값**

인자들 중 가장 큰 값을 반환하며, 호환 가능한 타입 중 가장 넓은 타입으로 승격됩니다. [`Any`](/sql-reference/data-types)

**예시**

**숫자형 타입**

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

도입된 버전: v1.1.0

조건부 분기를 수행합니다.

* 조건 `cond`가 0이 아닌 값으로 평가되면 함수는 표현식 `then`의 결과를 반환합니다.
* `cond`가 0 또는 NULL로 평가되면 `else` 표현식의 결과가 반환됩니다.

[`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) 설정은 단락(쇼트 서킷) 평가 사용 여부를 제어합니다.

이 설정을 활성화하면 `then` 표현식은 `cond`가 참인 행에서만 평가되고, `else` 표현식은 `cond`가 거짓인 행에서만 평가됩니다.

예를 들어 단락 평가가 활성화되어 있으면 다음 쿼리를 실행할 때 0으로 나누기 예외가 발생하지 않습니다:

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then`과 `else`는 동일한 타입이어야 합니다.

**구문**

```sql
if(cond, then, else)
```

**인수**

* `cond` — 평가할 조건입니다. [`UInt8`](/sql-reference/data-types/int-uint) 또는 [`Nullable(UInt8)`](/sql-reference/data-types/nullable) 또는 [`NULL`](/sql-reference/syntax#null)
* `then` — `cond`가 true이면 반환되는 표현식입니다. - `else` — `cond`가 false이거나 `NULL`이면 반환되는 표현식입니다.

**반환 값**

조건 `cond`에 따라 `then` 또는 `else` 표현식 중 하나의 결과가 반환됩니다.

**예제**

**사용 예**

```sql title=Query
SELECT if(1, 2 + 2, 2 + 6) AS res;
```

```response title=Response
┌─res─┐
│   4 │
└─────┘
```


## least \{#least\}

도입된 버전: v1.1.0

인수 중 가장 작은 값을 반환합니다.
`NULL` 인수는 무시됩니다.

* 배열의 경우, 사전식(lexicographical)으로 가장 작은 배열을 반환합니다.
* DateTime 타입의 경우, 결과 타입은 가장 큰 타입으로 승격됩니다(예: DateTime32와 함께 사용되는 경우 DateTime64).

:::note `NULL` 동작을 변경하려면 `least_greatest_legacy_null_behavior` 설정을 사용하십시오
버전 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19)에서 하위 호환되지 않는 변경 사항이 도입되어, 이제는 `NULL` 값이 무시됩니다. 이전에는 인수 중 하나가 `NULL`이면 `NULL`을 반환했습니다.
이전 동작을 유지하려면 설정 `least_greatest_legacy_null_behavior`(기본값: `false`)를 `true`로 설정하십시오.
:::

**구문**

```sql
least(x1[, x2, ...])
```

**인수**

* `x1[, x2, ...]` — 비교할 단일 값 또는 여러 값입니다. 모든 인수는 서로 비교 가능한 타입이어야 합니다. [`Any`](/sql-reference/data-types)

**반환 값**

인수 중 가장 작은 값을, 서로 호환되는 타입 중 가장 큰 타입으로 승격하여 반환합니다. [`Any`](/sql-reference/data-types)

**예시**

**숫자형 타입**

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

**DateTime 유형**

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

도입 버전: v1.1.0

쿼리에서 [`CASE`](/sql-reference/operators#conditional-expression) 연산자를 더 간결하게 작성할 수 있도록 합니다.
각 조건을 순서대로 평가합니다. 처음으로 true(0이 아니고 `NULL`이 아닌)인 조건에 대해 해당 분기 값(branch value)을 반환합니다.
어떤 조건도 true가 아니면 `else` 값을 반환합니다.

[`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) SETTING은
단락 평가(short-circuit evaluation) 사용 여부를 제어합니다. 활성화된 경우, `then_i` 표현식은
`((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)`가 true인 행에서만 평가됩니다.

예를 들어, 단락 평가가 활성화된 경우 다음 쿼리를 실행할 때 0으로 나누기 예외가 발생하지 않습니다:

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

모든 분기와 else 절의 표현식은 공통 상위 타입을 가져야 합니다. `NULL` 조건은 거짓으로 간주됩니다.

**구문**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**별칭(Aliases)**: `caseWithoutExpression`, `caseWithoutExpr`

**인수(Arguments)**

* `cond_N` — `then_N`을 반환할지 여부를 제어하는 N번째로 평가되는 조건입니다. [`UInt8`](/sql-reference/data-types/int-uint) 또는 [`Nullable(UInt8)`](/sql-reference/data-types/nullable) 또는 [`NULL`](/sql-reference/syntax#null)
* `then_N` — `cond_N`이 true일 때 함수의 결과입니다. - `else` — 어떤 `cond_N`도 true가 아닐 때 함수의 결과입니다.

**반환 값**

일치하는 `cond_N`이 있으면 해당 `then_N`의 결과를 반환하고, 없으면 `else`의 결과를 반환합니다.

**예시(Examples)**

**사용 예시(Example usage)**

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
