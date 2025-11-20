---
'description': '조건부 함수에 대한 Documentation'
'sidebar_label': 'Conditional'
'slug': '/sql-reference/functions/conditional-functions'
'title': '조건부 함수'
'doc_type': 'reference'
---


# 조건부 함수

## 개요 {#overview}

### 조건부 결과 직접 사용하기 {#using-conditional-results-directly}

조건부 결과는 항상 `0`, `1` 또는 `NULL`로 귀결됩니다. 따라서 다음과 같이 조건부 결과를 직접 사용할 수 있습니다:

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

### 조건부에서 NULL 값 {#null-values-in-conditionals}

`NULL` 값이 조건부에 포함되면 결과도 `NULL`이 됩니다.

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

다음 예시는 `multiIf`에 등호 조건을 추가하지 않아 실패하는 것을 보여줍니다.

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

### CASE 문 {#case-statement}

ClickHouse의 CASE 표현식은 SQL CASE 연산자와 유사한 조건부 로직을 제공합니다. 조건을 평가하고 처음 일치하는 조건에 따라 값을 반환합니다.

ClickHouse는 두 가지 형태의 CASE를 지원합니다:

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br/>
   이 형태는 전체적인 유연성을 허용하며 내부적으로 [multiIf](/sql-reference/functions/conditional-functions#multiIf) 함수를 사용하여 구현됩니다. 각 조건은 독립적으로 평가되며 표현식에는 비상수 값이 포함될 수 있습니다.

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
   <br/>
   이 더 간결한 형태는 상수 값 매칭에 최적화되어 있으며 내부적으로 `caseWithExpression()`을 사용합니다.

예를 들어, 다음은 유효합니다:

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

이 형태는 반환 표현식이 상수일 필요는 없습니다.

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

#### 주의사항 {#caveats}

ClickHouse는 CASE 표현식(또는 내부 동등한 것, 예를 들어 `multiIf`)의 결과 타입을 조건을 평가하기 전에 결정합니다. 이것은 반환 표현식의 타입이 다를 경우, 예를 들어 시간대나 숫자 타입이 다를 때 중요합니다.

- 결과 타입은 모든 분기 중에서 가장 큰 호환 타입을 기준으로 선택됩니다.
- 이 타입이 선택되면, 다른 모든 분기는 암묵적으로 이 타입으로 캐스팅됩니다 - 실행 시 해당 로직이 결코 실행되지 않더라도 말입니다.
- DateTime64와 같이 시간대가 타입 서명에 포함된 타입의 경우, 이는 예상치 못한 동작을 초래할 수 있습니다: 처음 발견된 시간대가 모든 분기에서 사용될 수 있으며, 다른 분기에서 다른 시간대를 명시하더라도 말입니다.

예를 들어, 아래 모든 행은 첫 번째 일치 분기의 시간대에서 타임스탬프를 반환합니다. 즉, `Asia/Kolkata`입니다.

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

여기서 ClickHouse는 여러 `DateTime64(3, <timezone>)` 반환 타입을 봅니다. 가장 먼저 보는 것을 기반으로 공통 타입을 `DateTime64(3, 'Asia/Kolkata')`로 추론하고, 다른 분기를 이 타입으로 암묵적으로 캐스팅합니다.

원하는 시간대 형식을 유지하기 위해 문자열로 변환하여 해결할 수 있습니다:

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

<!-- 
아래 태그의 내부 내용은 doc 프레임워크 빌드 시 
시스템.함수에서 생성된 문서로 대체됩니다. 태그를 수정하거나 제거하지 마십시오.
자세한 내용은: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
## clamp {#clamp}

도입된 버전: v24.5

값이 지정된 최소값과 최대값 범위 내에 있도록 제한합니다.

값이 최소값보다 작으면 최소값을 반환합니다. 값이 최대값보다 크면 최대값을 반환합니다. 그렇지 않으면 값 자체를 반환합니다.

모든 인수는 비교 가능한 타입이어야 합니다. 결과 타입은 모든 인수 중에서 가장 큰 호환 타입입니다.
    
**구문**

```sql
clamp(value, min, max)
```

**인수**

- `value` — 클램프할 값. 
- `min` — 최소 경계. 
- `max` — 최대 경계. 

**반환된 값**

[min, max] 범위로 제한된 값을 반환합니다.

**예시**

**기본 사용법**

```sql title=Query
SELECT clamp(5, 1, 10) AS result;
```

```response title=Response
┌─result─┐
│      5 │
└────────┘
```

**최소값 이하**

```sql title=Query
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      0 │
└────────┘
```

**최대값 이상**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      7 │
└────────┘
```



## greatest {#greatest}

도입된 버전: v1.1

인수 중에서 가장 큰 값을 반환합니다.
`NULL` 인수는 무시됩니다.

- 배열의 경우, 사전 순으로 가장 큰 배열을 반환합니다.
- `DateTime` 타입의 경우, 결과 타입은 가장 큰 타입으로 승격됩니다 (예: `DateTime32`와 혼합된 경우 `DateTime64`).

:::note 설정 `least_greatest_legacy_null_behavior`를 사용하여 `NULL` 동작을 변경합니다
버전 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19)에서는 `NULL` 값을 무시하는 후방 호환되지 않는 변경이 도입되었습니다. 이전에는 인수 중 하나가 `NULL`인 경우 `NULL`을 반환했습니다.
이전 동작을 유지하려면 설정 `least_greatest_legacy_null_behavior` (기본: `false`)를 `true`로 설정하세요.
:::
    

**구문**

```sql
greatest(x1[, x2, ...])
```

**인수**

- `x1[, x2, ...]` — 비교할 하나 이상의 값. 모든 인수는 비교 가능한 타입이어야 합니다. [`Any`](/sql-reference/data-types)


**반환된 값**

인수 중 가장 큰 값을 반환하며, 가장 큰 호환 타입으로 승격됩니다. [`Any`](/sql-reference/data-types)

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



## if {#if}

도입된 버전: v1.1

조건부 분기를 수행합니다.

- 조건 `cond`가 0이 아닌 값으로 평가되면 함수는 표현식 `then`의 결과를 반환합니다.
- `cond`가 0 또는 NULL로 평가되면 `else` 표현식의 결과가 반환됩니다.

설정 [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation)는 숏서킷 평가 사용 여부를 제어합니다.

사용하면 `then` 표현식은 `cond`가 true인 행에 대해서만 평가되고, `else` 표현식은 `cond`가 false인 경우에만 평가됩니다.

예를 들어, 숏서킷 평가가 활성화된 경우, 다음 쿼리를 실행할 때 0으로 나누기 예외가 발생하지 않습니다:

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then`과 `else`는 유사한 타입이어야 합니다.

**구문**

```sql
if(cond, then, else)
```

**인수**

- `cond` — 평가된 조건. [`UInt8`](/sql-reference/data-types/int-uint) 또는 [`Nullable(UInt8)`](/sql-reference/data-types/nullable) 또는 [`NULL`](/sql-reference/syntax#null)
- `then` — `cond`가 true인 경우 반환되는 표현식. 
- `else` — `cond`가 false이거나 `NULL`인 경우 반환되는 표현식. 

**반환된 값**

조건 `cond`에 따라 `then` 또는 `else` 표현식 중 하나의 결과를 반환합니다.

**예시**

**예시 사용법**

```sql title=Query
SELECT if(1, 2 + 2, 2 + 6) AS res;
```

```response title=Response
┌─res─┐
│   4 │
└─────┘
```



## least {#least}

도입된 버전: v1.1

인수 중에서 가장 작은 값을 반환합니다.
`NULL` 인수는 무시됩니다.

- 배열의 경우, 사전 순으로 가장 작은 배열을 반환합니다.
- DateTime 타입의 경우, 결과 타입은 가장 큰 타입으로 승격됩니다 (예: DateTime32와 혼합된 경우 `DateTime64`).

:::note 설정 `least_greatest_legacy_null_behavior`를 사용하여 `NULL` 동작을 변경합니다
버전 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19)에서는 `NULL` 값을 무시하는 후방 호환되지 않는 변경이 도입되었습니다. 이전에는 인수 중 하나가 `NULL`인 경우 `NULL`을 반환했습니다.
이전 동작을 유지하려면 설정 `least_greatest_legacy_null_behavior` (기본: `false`)를 `true`로 설정하세요.
:::
    

**구문**

```sql
least(x1[, x2, ...])
```

**인수**

- `x1[, x2, ...]` — 비교할 단일 값 또는 여러 값. 모든 인수는 비교 가능한 타입이어야 합니다. [`Any`](/sql-reference/data-types)


**반환된 값**

인수 중 가장 작은 값을 반환하며, 가장 큰 호환 타입으로 승격됩니다. [`Any`](/sql-reference/data-types)

**예시**

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

**DateTime 타입**

```sql title=Query
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```



## multiIf {#multiIf}

도입된 버전: v1.1

[`CASE`](/sql-reference/operators#conditional-expression) 연산자를 쿼리에서 더 간결하게 작성할 수 있도록 허용합니다.
각 조건을 순서대로 평가합니다. 첫 번째 조건이 true(0이 아니고 NULL이 아님)인 경우, 해당 분기 값을 반환합니다.
조건이 true가 아닌 경우 `else` 값을 반환합니다.

설정 [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation)은 
숏서킷 평가 사용 여부를 제어합니다. 활성화되면 `then_i` 표현식은 
`((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)`가 true인 행에서만 평가됩니다.

예를 들어, 숏서킷 평가가 활성화된 경우, 다음 쿼리를 실행할 때 0으로 나누기 예외가 발생하지 않습니다:

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

모든 분기 및 else 표현식은 공통의 슈퍼타입을 가져야 합니다. `NULL` 조건은 false로 처리됩니다.
    

**구문**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**별칭**: `caseWithoutExpression`, `caseWithoutExpr`

**인수**

- `cond_N` — `then_N`이 반환되는지 제어하는 N번째 평가된 조건. [`UInt8`](/sql-reference/data-types/int-uint) 또는 [`Nullable(UInt8)`](/sql-reference/data-types/nullable) 또는 [`NULL`](/sql-reference/syntax#null)
- `then_N` — `cond_N`이 true일 때 함수의 결과. 
- `else` — 어떤 조건도 true가 아닐 경우 함수의 결과. 

**반환된 값**

일치하는 `cond_N`에 대해 `then_N`의 결과를 반환하고, 그렇지 않으면 `else` 조건을 반환합니다.

**예시**

**예시 사용법**

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



<!--AUTOGENERATED_END-->
