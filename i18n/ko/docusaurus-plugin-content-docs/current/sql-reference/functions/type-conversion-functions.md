---
'description': 'Type Conversion Functions에 대한 문서'
'sidebar_label': '유형 변환'
'slug': '/sql-reference/functions/type-conversion-functions'
'title': '유형 변환 함수'
'doc_type': 'reference'
---


# 타입 변환 함수
## 데이터 변환에 대한 일반적인 문제 {#common-issues-with-data-conversion}

ClickHouse는 일반적으로 [C++ 프로그램과 동일한 동작](https://en.cppreference.com/w/cpp/language/implicit_conversion)을 사용합니다.

`to<type>` 함수와 [cast](#cast)는 몇 가지 경우에 다르게 동작하는데, 예를 들어 [LowCardinality](../data-types/lowcardinality.md)의 경우: [cast](#cast)는 [LowCardinality](../data-types/lowcardinality.md) 특성을 제거하지만 `to<type>` 함수는 그렇지 않습니다. [Nullable](../data-types/nullable.md) 또한 마찬가지로, 이 동작은 SQL 표준과 호환되지 않으며, [cast_keep_nullable](../../operations/settings/settings.md/#cast_keep_nullable) 설정을 사용하면 변경할 수 있습니다.

:::note
데이터 유형의 값이 더 작은 데이터 유형(예: `Int64`에서 `Int32`로)으로 변환되거나 호환되지 않는 데이터 유형(예: `String`에서 `Int`로) 간에 변환되는 경우 데이터 손실의 가능성이 있음을 알아두십시오. 결과가 예상한 대로인지 철저히 확인하십시오.
:::

예시:

```sql
SELECT
    toTypeName(toLowCardinality('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type

┌─source_type────────────┬─to_type_result_type────┬─cast_result_type─┐
│ LowCardinality(String) │ LowCardinality(String) │ String           │
└────────────────────────┴────────────────────────┴──────────────────┘

SELECT
    toTypeName(toNullable('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type

┌─source_type──────┬─to_type_result_type─┬─cast_result_type─┐
│ Nullable(String) │ Nullable(String)    │ String           │
└──────────────────┴─────────────────────┴──────────────────┘

SELECT
    toTypeName(toNullable('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type
SETTINGS cast_keep_nullable = 1

┌─source_type──────┬─to_type_result_type─┬─cast_result_type─┐
│ Nullable(String) │ Nullable(String)    │ Nullable(String) │
└──────────────────┴─────────────────────┴──────────────────┘
```
## `toString` 함수에 대한 주의 사항 {#to-string-functions}

`toString` 계열의 함수는 숫자, 문자열(하지만 고정 문자열은 아님), 날짜 및 시간 날짜 간의 변환을 허용합니다.
이 함수들은 모두 하나의 인수를 받습니다.

- 문자열로 변환할 때, 값은 TabSeparated 형식(및 거의 모든 다른 텍스트 형식)과 동일한 규칙을 사용하여 포맷되거나 파싱됩니다. 문자열을 파싱할 수 없는 경우, 예외가 발생하고 요청이 취소됩니다.
- 날짜를 숫자로 변환하거나 그 반대의 경우, 날짜는 Unix epoch 시작 이후의 일 수로 해석됩니다.
- 날짜와 시간이 있는 날짜를 숫자로 변환하거나 그 반대의 경우, 날짜와 시간이 있는 날짜는 Unix epoch 시작 이후의 초 수로 해석됩니다.
- `DateTime` 인수의 `toString` 함수는 시간대 이름을 포함하는 두 번째 문자열 인수를 받을 수 있습니다. 예: `Europe/Amsterdam`. 이 경우, 시간은 지정된 시간대에 따라 포맷됩니다.
## `toDate`/`toDateTime` 함수에 대한 주의 사항 {#to-date-and-date-time-functions}

`toDate`/`toDateTime` 함수의 날짜 및 날짜-시간 형식은 다음과 같이 정의됩니다:

```response
YYYY-MM-DD
YYYY-MM-DD hh:mm:ss
```

예외적으로 UInt32, Int32, UInt64 또는 Int64 숫자 유형에서 Date로 변환할 때, 숫자가 65536 이상인 경우, 숫자는 Unix 타임스탬프(일 수가 아니라)로 해석되며, 날짜로 반올림됩니다. 이것은 `toDate(unix_timestamp)`를 작성하는 일반적인 경우에 대한 지원을 허용합니다. 그렇지 않으면 에러가 발생하고 번거로운 `toDate(toDateTime(unix_timestamp))`를 작성해야 합니다.

날짜와 날짜-시간 간의 변환은 자연스러운 방식으로 수행됩니다: null 시간을 추가하거나 시간을 생략하여.

숫자 유형 간의 변환은 C++에서 서로 다른 숫자 유형 간의 할당과 동일한 규칙을 사용합니다.

**예시**

쿼리:

```sql
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10
```

결과:

```response
┌──────────────────ts─┬─time_zone─────────┬─str_tz_datetime─────┐
│ 2023-09-08 19:14:59 │ Europe/Amsterdam  │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Andorra    │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Astrakhan  │ 2023-09-08 23:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Athens     │ 2023-09-08 22:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belfast    │ 2023-09-08 20:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belgrade   │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Berlin     │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Bratislava │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Brussels   │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Bucharest  │ 2023-09-08 22:14:59 │
└─────────────────────┴───────────────────┴─────────────────────┘
```

또한 [`toUnixTimestamp`](#toUnixTimestamp) 함수를 참조하십시오.
## toBool {#tobool}

입력 값을 [`Bool`](../data-types/boolean.md) 유형의 값으로 변환합니다. 오류가 발생할 경우 예외를 발생시킵니다.

**구문**

```sql
toBool(expr)
```

**인수**

- `expr` — 숫자 또는 문자열을 반환하는 표현식입니다. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 값.
- Float32/64 유형의 값.
- 대소문자 구분 없는 문자열 `true` 또는 `false`.

**반환 값**

- 인수 평가에 따라 `true` 또는 `false`를 반환합니다. [Bool](../data-types/boolean.md).

**예시**

쿼리:

```sql
SELECT
    toBool(toUInt8(1)),
    toBool(toInt8(-1)),
    toBool(toFloat32(1.01)),
    toBool('true'),
    toBool('false'),
    toBool('FALSE')
FORMAT Vertical
```

결과:

```response
toBool(toUInt8(1)):      true
toBool(toInt8(-1)):      true
toBool(toFloat32(1.01)): true
toBool('true'):          true
toBool('false'):         false
toBool('FALSE'):         false
```
## toInt8 {#toint8}

입력 값을 [`Int8`](../data-types/int-uint.md) 유형의 값으로 변환합니다. 오류가 발생할 경우 예외를 발생시킵니다.

**구문**

```sql
toInt8(expr)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식입니다. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 값 또는 문자열 표현.
- Float32/64 유형의 값.

지원되지 않는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt8('0xc0fe');`.

:::note
입력 값을 [Int8](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다. 예: `SELECT toInt8(128) == -128;`.
:::

**반환 값**

- 8비트 정수 값. [Int8](../data-types/int-uint.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt8(-8),
    toInt8(-8.8),
    toInt8('-8')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt8(-8):   -8
toInt8(-8.8): -8
toInt8('-8'): -8
```

**참조**

- [`toInt8OrZero`](#toint8orzero).
- [`toInt8OrNull`](#toInt8OrNull).
- [`toInt8OrDefault`](#toint8ordefault).
## toInt8OrZero {#toint8orzero}

[`toInt8`](#toint8)과 유사하게, 이 함수는 입력 값을 [Int8](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toInt8OrZero(x)
```

**인수**

- `x` — 숫자의 문자열 표현입니다. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수(반환 `0`):
- `NaN` 및 `Inf`를 포함한 일반 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt8OrZero('0xc0fe');`.

:::note
입력 값을 [Int8](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 8비트 정수 값, 그렇지 않으면 `0`. [Int8](../data-types/int-uint.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt8OrZero('-8'),
    toInt8OrZero('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt8OrZero('-8'):  -8
toInt8OrZero('abc'): 0
```

**참조**

- [`toInt8`](#toint8).
- [`toInt8OrNull`](#toInt8OrNull).
- [`toInt8OrDefault`](#toint8ordefault).
## toInt8OrNull {#toInt8OrNull}

[`toInt8`](#toint8)과 유사하게, 이 함수는 입력 값을 [Int8](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류가 발생할 경우 `NULL`을 반환합니다.

**구문**

```sql
toInt8OrNull(x)
```

**인수**

- `x` — 숫자의 문자열 표현입니다. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수(반환 `\N`)
- Float32/64 값의 문자열 표현, `NaN` 및 `Inf`를 포함.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt8OrNull('0xc0fe');`.

:::note
입력 값을 [Int8](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 8비트 정수 값, 그렇지 않으면 `NULL`. [Int8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt8OrNull('-8'),
    toInt8OrNull('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt8OrNull('-8'):  -8
toInt8OrNull('abc'): ᴺᵁᴸᴸ
```

**참조**

- [`toInt8`](#toint8).
- [`toInt8OrZero`](#toint8orzero).
- [`toInt8OrDefault`](#toint8ordefault).
## toInt8OrDefault {#toint8ordefault}

[`toInt8`](#toint8)과 유사하게, 이 함수는 입력 값을 [Int8](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류 발생 시 기본 값을 반환합니다.
`default` 값이 전달되지 않으면 오류 발생 시 `0`이 반환됩니다.

**구문**

```sql
toInt8OrDefault(expr[, default])
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식입니다. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택 사항) — `Int8` 타입으로 변환이 실패할 경우 반환할 기본 값입니다. [Int8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형 값 또는 문자열 표현.
- Float32/64 유형의 값.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt8OrDefault('0xc0fe', CAST('-1', 'Int8'));`.

:::note
입력 값을 [Int8](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 8비트 정수 값, 그렇지 않으면 전달된 기본 값을 반환하거나 기본 값이 없을 경우 `0`을 반환합니다. [Int8](../data-types/int-uint.md).

:::note
- 이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 유형은 캐스트 유형과 동일해야 합니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt8OrDefault('-8', CAST('-1', 'Int8')),
    toInt8OrDefault('abc', CAST('-1', 'Int8'))
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt8OrDefault('-8', CAST('-1', 'Int8')):  -8
toInt8OrDefault('abc', CAST('-1', 'Int8')): -1
```

**참조**

- [`toInt8`](#toint8).
- [`toInt8OrZero`](#toint8orzero).
- [`toInt8OrNull`](#toInt8OrNull).
## toInt16 {#toint16}

입력 값을 [`Int16`](../data-types/int-uint.md) 유형의 값으로 변환합니다. 오류가 발생할 경우 예외를 발생시킵니다.

**구문**

```sql
toInt16(expr)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식입니다. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 값 또는 문자열 표현.
- Float32/64 유형의 값.

지원되지 않는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt16('0xc0fe');`.

:::note
입력 값을 [Int16](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다. 예: `SELECT toInt16(32768) == -32768;`.
:::

**반환 값**

- 16비트 정수 값. [Int16](../data-types/int-uint.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt16(-16),
    toInt16(-16.16),
    toInt16('-16')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt16(-16):    -16
toInt16(-16.16): -16
toInt16('-16'):  -16
```

**참조**

- [`toInt16OrZero`](#toint16orzero).
- [`toInt16OrNull`](#toint16ornull).
- [`toInt16OrDefault`](#toint16ordefault).
## toInt16OrZero {#toint16orzero}

[`toInt16`](#toint16)과 유사하게, 이 함수는 입력 값을 [Int16](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toInt16OrZero(x)
```

**인수**

- `x` — 숫자의 문자열 표현입니다. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수(반환 `0`):
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt16OrZero('0xc0fe');`.

:::note
입력 값을 [Int16](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 16비트 정수 값, 그렇지 않으면 `0`. [Int16](../data-types/int-uint.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt16OrZero('-16'),
    toInt16OrZero('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt16OrZero('-16'): -16
toInt16OrZero('abc'): 0
```

**참조**

- [`toInt16`](#toint16).
- [`toInt16OrNull`](#toint16ornull).
- [`toInt16OrDefault`](#toint16ordefault).
## toInt16OrNull {#toint16ornull}

[`toInt16`](#toint16)과 유사하게, 이 함수는 입력 값을 [Int16](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류가 발생할 경우 `NULL`을 반환합니다.

**구문**

```sql
toInt16OrNull(x)
```

**인수**

- `x` — 숫자의 문자열 표현입니다. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수(반환 `\N`)
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt16OrNull('0xc0fe');`.

:::note
입력 값을 [Int16](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 16비트 정수 값, 그렇지 않으면 `NULL`. [Int16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt16OrNull('-16'),
    toInt16OrNull('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt16OrNull('-16'): -16
toInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**참조**

- [`toInt16`](#toint16).
- [`toInt16OrZero`](#toint16orzero).
- [`toInt16OrDefault`](#toint16ordefault).
## toInt16OrDefault {#toint16ordefault}

[`toInt16`](#toint16)과 유사하게, 이 함수는 입력 값을 [Int16](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류 발생 시 기본 값을 반환합니다.
`default` 값이 전달되지 않으면 오류 발생 시 `0`이 반환됩니다.

**구문**

```sql
toInt16OrDefault(expr[, default])
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식입니다. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택 사항) — `Int16` 타입으로 변환이 실패할 경우 반환할 기본 값입니다. [Int16](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형 값 또는 문자열 표현.
- Float32/64 유형의 값.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt16OrDefault('0xc0fe', CAST('-1', 'Int16'));`.

:::note
입력 값을 [Int16](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 16비트 정수 값, 그렇지 않으면 전달된 기본 값을 반환하거나 기본 값이 없을 경우 `0`을 반환합니다. [Int16](../data-types/int-uint.md).

:::note
- 이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 유형은 캐스트 유형과 동일해야 합니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt16OrDefault('-16', CAST('-1', 'Int16')),
    toInt16OrDefault('abc', CAST('-1', 'Int16'))
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt16OrDefault('-16', CAST('-1', 'Int16')): -16
toInt16OrDefault('abc', CAST('-1', 'Int16')): -1
```

**참조**

- [`toInt16`](#toint16).
- [`toInt16OrZero`](#toint16orzero).
- [`toInt16OrNull`](#toint16ornull).
## toInt32 {#toint32}

입력 값을 [`Int32`](../data-types/int-uint.md) 유형의 값으로 변환합니다. 오류가 발생할 경우 예외를 발생시킵니다.

**구문**

```sql
toInt32(expr)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식입니다. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 값 또는 문자열 표현.
- Float32/64 유형의 값.

지원되지 않는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt32('0xc0fe');`.

:::note
입력 값을 [Int32](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다. 예: `SELECT toInt32(2147483648) == -2147483648;`
:::

**반환 값**

- 32비트 정수 값. [Int32](../data-types/int-uint.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt32(-32),
    toInt32(-32.32),
    toInt32('-32')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt32(-32):    -32
toInt32(-32.32): -32
toInt32('-32'):  -32
```

**참조**

- [`toInt32OrZero`](#toint32orzero).
- [`toInt32OrNull`](#toint32ornull).
- [`toInt32OrDefault`](#toint32ordefault).
## toInt32OrZero {#toint32orzero}

[`toInt32`](#toint32)과 유사하게, 이 함수는 입력 값을 [Int32](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toInt32OrZero(x)
```

**인수**

- `x` — 숫자의 문자열 표현입니다. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수(반환 `0`):
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt32OrZero('0xc0fe');`.

:::note
입력 값을 [Int32](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 32비트 정수 값, 그렇지 않으면 `0`. [Int32](../data-types/int-uint.md)

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt32OrZero('-32'),
    toInt32OrZero('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt32OrZero('-32'): -32
toInt32OrZero('abc'): 0
```
**참조**

- [`toInt32`](#toint32).
- [`toInt32OrNull`](#toint32ornull).
- [`toInt32OrDefault`](#toint32ordefault).
## toInt32OrNull {#toint32ornull}

[`toInt32`](#toint32)과 유사하게, 이 함수는 입력 값을 [Int32](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류가 발생할 경우 `NULL`을 반환합니다.

**구문**

```sql
toInt32OrNull(x)
```

**인수**

- `x` — 숫자의 문자열 표현입니다. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수(반환 `\N`)
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt32OrNull('0xc0fe');`.

:::note
입력 값을 [Int32](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 32비트 정수 값, 그렇지 않으면 `NULL`. [Int32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt32OrNull('-32'),
    toInt32OrNull('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt32OrNull('-32'): -32
toInt32OrNull('abc'): ᴺᵁᴸᴸ
```

**참조**

- [`toInt32`](#toint32).
- [`toInt32OrZero`](#toint32orzero).
- [`toInt32OrDefault`](#toint32ordefault).
## toInt32OrDefault {#toint32ordefault}

[`toInt32`](#toint32)과 유사하게, 이 함수는 입력 값을 [Int32](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류 발생 시 기본 값을 반환합니다.
`default` 값이 전달되지 않으면 오류 발생 시 `0`이 반환됩니다.

**구문**

```sql
toInt32OrDefault(expr[, default])
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식입니다. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택 사항) — `Int32` 타입으로 변환이 실패할 경우 반환할 기본 값입니다. [Int32](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형 값 또는 문자열 표현.
- Float32/64 유형의 값.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt32OrDefault('0xc0fe', CAST('-1', 'Int32'));`.

:::note
입력 값을 [Int32](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 32비트 정수 값, 그렇지 않으면 전달된 기본 값을 반환하거나 기본 값이 없을 경우 `0`을 반환합니다. [Int32](../data-types/int-uint.md).

:::note
- 이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 유형은 캐스트 유형과 동일해야 합니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt32OrDefault('-32', CAST('-1', 'Int32')),
    toInt32OrDefault('abc', CAST('-1', 'Int32'))
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt32OrDefault('-32', CAST('-1', 'Int32')): -32
toInt32OrDefault('abc', CAST('-1', 'Int32')): -1
```

**참조**

- [`toInt32`](#toint32).
- [`toInt32OrZero`](#toint32orzero).
- [`toInt32OrNull`](#toint32ornull).
## toInt64 {#toint64}

입력 값을 [`Int64`](../data-types/int-uint.md) 유형의 값으로 변환합니다. 오류가 발생할 경우 예외를 발생시킵니다.

**구문**

```sql
toInt64(expr)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식입니다. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 값 또는 문자열 표현.
- Float32/64 유형의 값.

지원되지 않는 타입:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt64('0xc0fe');`.

:::note
입력 값을 [Int64](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다. 예: `SELECT toInt64(9223372036854775808) == -9223372036854775808;`
:::

**반환 값**

- 64비트 정수 값. [Int64](../data-types/int-uint.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt64(-64),
    toInt64(-64.64),
    toInt64('-64')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt64(-64):    -64
toInt64(-64.64): -64
toInt64('-64'):  -64
```

**참조**

- [`toInt64OrZero`](#toint64orzero).
- [`toInt64OrNull`](#toint64ornull).
- [`toInt64OrDefault`](#toint64ordefault).
## toInt64OrZero {#toint64orzero}

[`toInt64`](#toint64)과 유사하게, 이 함수는 입력 값을 [Int64](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toInt64OrZero(x)
```

**인수**

- `x` — 숫자의 문자열 표현입니다. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수(반환 `0`):
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt64OrZero('0xc0fe');`.

:::note
입력 값을 [Int64](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 64비트 정수 값, 그렇지 않으면 `0`. [Int64](../data-types/int-uint.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt64OrZero('-64'),
    toInt64OrZero('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt64OrZero('-64'): -64
toInt64OrZero('abc'): 0
```

**참조**

- [`toInt64`](#toint64).
- [`toInt64OrNull`](#toint64ornull).
- [`toInt64OrDefault`](#toint64ordefault).
## toInt64OrNull {#toint64ornull}

[`toInt64`](#toint64)과 유사하게, 이 함수는 입력 값을 [Int64](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류가 발생할 경우 `NULL`을 반환합니다.

**구문**

```sql
toInt64OrNull(x)
```

**인수**

- `x` — 숫자의 문자열 표현입니다. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수(반환 `\N`)
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt64OrNull('0xc0fe');`.

:::note
입력 값을 [Int64](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 64비트 정수 값, 그렇지 않으면 `NULL`. [Int64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt64OrNull('-64'),
    toInt64OrNull('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt64OrNull('-64'): -64
toInt64OrNull('abc'): ᴺᵁᴸᴸ
```

**참조**

- [`toInt64`](#toint64).
- [`toInt64OrZero`](#toint64orzero).
- [`toInt64OrDefault`](#toint64ordefault).
## toInt64OrDefault {#toint64ordefault}

[`toInt64`](#toint64)과 유사하게, 이 함수는 입력 값을 [Int64](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류 발생 시 기본 값을 반환합니다.
`default` 값이 전달되지 않으면 오류 발생 시 `0`이 반환됩니다.

**구문**

```sql
toInt64OrDefault(expr[, default])
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식입니다. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택 사항) — `Int64` 타입으로 변환이 실패할 경우 반환할 기본 값입니다. [Int64](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 값 또는 문자열 표현.
- Float32/64 유형의 값.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt64OrDefault('0xc0fe', CAST('-1', 'Int64'));`.

:::note
입력 값을 [Int64](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 64비트 정수 값, 그렇지 않으면 전달된 기본 값을 반환하거나 기본 값이 없을 경우 `0`을 반환합니다. [Int64](../data-types/int-uint.md).

:::note
- 이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 유형은 캐스트 유형과 동일해야 합니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt64OrDefault('-64', CAST('-1', 'Int64')),
    toInt64OrDefault('abc', CAST('-1', 'Int64'))
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt64OrDefault('-64', CAST('-1', 'Int64')): -64
toInt64OrDefault('abc', CAST('-1', 'Int64')): -1
```

**참조**

- [`toInt64`](#toint64).
- [`toInt64OrZero`](#toint64orzero).
- [`toInt64OrNull`](#toint64ornull).
## toInt128 {#toint128}

입력 값을 [`Int128`](../data-types/int-uint.md) 유형의 값으로 변환합니다. 오류가 발생할 경우 예외를 발생시킵니다.

**구문**

```sql
toInt128(expr)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식입니다. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 값 또는 문자열 표현.
- Float32/64 유형의 값.

지원되지 않는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt128('0xc0fe');`.

:::note
입력 값을 [Int128](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 128비트 정수 값. [Int128](../data-types/int-uint.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt128(-128),
    toInt128(-128.8),
    toInt128('-128')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt128(-128):   -128
toInt128(-128.8): -128
toInt128('-128'): -128
```

**참조**

- [`toInt128OrZero`](#toint128orzero).
- [`toInt128OrNull`](#toint128ornull).
- [`toInt128OrDefault`](#toint128ordefault).
## toInt128OrZero {#toint128orzero}

[`toInt128`](#toint128)과 유사하게, 이 함수는 입력 값을 [Int128](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toInt128OrZero(expr)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식입니다. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수(반환 `0`):
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt128OrZero('0xc0fe');`.

:::note
입력 값을 [Int128](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 128비트 정수 값, 그렇지 않으면 `0`. [Int128](../data-types/int-uint.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt128OrZero('-128'),
    toInt128OrZero('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt128OrZero('-128'): -128
toInt128OrZero('abc'):  0
```

**참조**

- [`toInt128`](#toint128).
- [`toInt128OrNull`](#toint128ornull).
- [`toInt128OrDefault`](#toint128ordefault).
## toInt128OrNull {#toint128ornull}

[`toInt128`](#toint128)과 유사하게, 이 함수는 입력 값을 [Int128](../data-types/int-uint.md) 유형의 값으로 변환하지만 오류가 발생할 경우 `NULL`을 반환합니다.

**구문**

```sql
toInt128OrNull(x)
```

**인수**

- `x` — 숫자의 문자열 표현입니다. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수(반환 `\N`)
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toInt128OrNull('0xc0fe');`.

:::note
입력 값을 [Int128](../data-types/int-uint.md)의 범위 내에서 표현할 수 없는 경우 결과가 오버플로우 또는 언더플로우됩니다. 이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공할 경우 128비트 정수 값, 그렇지 않으면 `NULL`. [Int128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
이 함수는 [0을 향한 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하므로 숫자의 소수 자리를 잘라냅니다.
:::

**예시**

쿼리:

```sql
SELECT
    toInt128OrNull('-128'),
    toInt128OrNull('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt128OrNull('-128'): -128
toInt128OrNull('abc'):  ᴺᵁᴸᴸ
```

**참조**

- [`toInt128`](#toint128).
- [`toInt128OrZero`](#toint128orzero).
- [`toInt128OrDefault`](#toint128ordefault).
## toInt128OrDefault {#toint128ordefault}

[`toInt128`](#toint128)와 유사하게 이 함수는 입력 값을 [Int128](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 기본 값을 반환합니다.
`default` 값이 제공되지 않으면 오류 발생 시 `0`이 반환됩니다.

**구문**

```sql
toInt128OrDefault(expr[, default])
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택 사항) — `Int128` 형식으로 구문 분석이 실패할 경우 반환할 기본 값. [Int128](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256.
- Float32/64.
- (U)Int8/16/32/128/256의 문자열 표현.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toInt128OrDefault('0xc0fe', CAST('-1', 'Int128'));`.

:::note
입력 값이 [Int128](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 128비트 정수 값, 그렇지 않으면 전달된 기본 값을 반환하거나 전달되지 않았을 경우 `0`을 반환합니다. [Int128](../data-types/int-uint.md).

:::note
- 함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 형식은 캐스트 형식과 동일해야 합니다.
:::

**예제**

쿼리:

```sql
SELECT
    toInt128OrDefault('-128', CAST('-1', 'Int128')),
    toInt128OrDefault('abc', CAST('-1', 'Int128'))
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt128OrDefault('-128', CAST('-1', 'Int128')): -128
toInt128OrDefault('abc', CAST('-1', 'Int128')):  -1
```

**참조**

- [`toInt128`](#toint128).
- [`toInt128OrZero`](#toint128orzero).
- [`toInt128OrNull`](#toint128ornull).
## toInt256 {#toint256}

입력 값을 [`Int256`](../data-types/int-uint.md) 형식의 값으로 변환합니다. 오류 발생 시 예외를 발생시킵니다.

**구문**

```sql
toInt256(expr)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

지원하지 않는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toInt256('0xc0fe');`.

:::note
입력 값이 [Int256](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 256비트 정수 값. [Int256](../data-types/int-uint.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toInt256(-256),
    toInt256(-256.256),
    toInt256('-256')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt256(-256):     -256
toInt256(-256.256): -256
toInt256('-256'):   -256
```

**참조**

- [`toInt256OrZero`](#toint256orzero).
- [`toInt256OrNull`](#toint256ornull).
- [`toInt256OrDefault`](#toint256ordefault).
## toInt256OrZero {#toint256orzero}

[`toInt256`](#toint256)와 유사하게 이 함수는 입력 값을 [Int256](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 `0`을 반환합니다.

**구문**

```sql
toInt256OrZero(x)
```

**인수**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원하지 않는 인수 (반환 `0`):
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toInt256OrZero('0xc0fe');`.

:::note
입력 값이 [Int256](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 256비트 정수 값, 그렇지 않으면 `0`. [Int256](../data-types/int-uint.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toInt256OrZero('-256'),
    toInt256OrZero('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt256OrZero('-256'): -256
toInt256OrZero('abc'):  0
```

**참조**

- [`toInt256`](#toint256).
- [`toInt256OrNull`](#toint256ornull).
- [`toInt256OrDefault`](#toint256ordefault).
## toInt256OrNull {#toint256ornull}

[`toInt256`](#toint256)와 유사하게 이 함수는 입력 값을 [Int256](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 `NULL`을 반환합니다.

**구문**

```sql
toInt256OrNull(x)
```

**인수**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원하지 않는 인수 (반환 `\N`)
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toInt256OrNull('0xc0fe');`.

:::note
입력 값이 [Int256](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 256비트 정수 값, 그렇지 않으면 `NULL`. [Int256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toInt256OrNull('-256'),
    toInt256OrNull('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt256OrNull('-256'): -256
toInt256OrNull('abc'):  ᴺᵁᴸᴸ
```

**참조**

- [`toInt256`](#toint256).
- [`toInt256OrZero`](#toint256orzero).
- [`toInt256OrDefault`](#toint256ordefault).
## toInt256OrDefault {#toint256ordefault}

[`toInt256`](#toint256)와 유사하게 이 함수는 입력 값을 [Int256](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 기본 값을 반환합니다.
`default` 값이 제공되지 않으면 오류 발생 시 `0`이 반환됩니다.

**구문**

```sql
toInt256OrDefault(expr[, default])
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택 사항) — `Int256` 형식으로 구문 분석이 실패할 경우 반환할 기본 값. [Int256](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toInt256OrDefault('0xc0fe', CAST('-1', 'Int256'));`.

:::note
입력 값이 [Int256](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 256비트 정수 값, 그렇지 않으면 전달된 기본 값을 반환하거나 전달되지 않았을 경우 `0`을 반환합니다. [Int256](../data-types/int-uint.md).

:::note
- 함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 형식은 캐스트 형식과 동일해야 합니다.
:::

**예제**

쿼리:

```sql
SELECT
    toInt256OrDefault('-256', CAST('-1', 'Int256')),
    toInt256OrDefault('abc', CAST('-1', 'Int256'))
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toInt256OrDefault('-256', CAST('-1', 'Int256')): -256
toInt256OrDefault('abc', CAST('-1', 'Int256')):  -1
```

**참조**

- [`toInt256`](#toint256).
- [`toInt256OrZero`](#toint256orzero).
- [`toInt256OrNull`](#toint256ornull).
## toUInt8 {#touint8}

입력 값을 [`UInt8`](../data-types/int-uint.md) 형식의 값으로 변환합니다. 오류 발생 시 예외를 발생시킵니다.

**구문**

```sql
toUInt8(expr)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

지원하지 않는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt8('0xc0fe');`.

:::note
입력 값이 [UInt8](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
예: `SELECT toUInt8(256) == 0;`.
:::

**반환 값**

- 8비트 부호 없는 정수 값. [UInt8](../data-types/int-uint.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt8(8),
    toUInt8(8.8),
    toUInt8('8')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt8(8):   8
toUInt8(8.8): 8
toUInt8('8'): 8
```

**참조**

- [`toUInt8OrZero`](#touint8orzero).
- [`toUInt8OrNull`](#touint8ornull).
- [`toUInt8OrDefault`](#touint8ordefault).
## toUInt8OrZero {#touint8orzero}

[`toUInt8`](#touint8)와 유사하게 이 함수는 입력 값을 [UInt8](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 `0`을 반환합니다.

**구문**

```sql
toUInt8OrZero(x)
```

**인수**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원하지 않는 인수 (반환 `0`):
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt8OrZero('0xc0fe');`.

:::note
입력 값이 [UInt8](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 8비트 부호 없는 정수 값, 그렇지 않으면 `0`. [UInt8](../data-types/int-uint.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt8OrZero('-8'),
    toUInt8OrZero('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt8OrZero('-8'):  0
toUInt8OrZero('abc'): 0
```

**참조**

- [`toUInt8`](#touint8).
- [`toUInt8OrNull`](#touint8ornull).
- [`toUInt8OrDefault`](#touint8ordefault).
## toUInt8OrNull {#touint8ornull}

[`toUInt8`](#touint8)와 유사하게 이 함수는 입력 값을 [UInt8](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 `NULL`을 반환합니다.

**구문**

```sql
toUInt8OrNull(x)
```

**인수**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원하지 않는 인수 (반환 `\N`)
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt8OrNull('0xc0fe');`.

:::note
입력 값이 [UInt8](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 8비트 부호 없는 정수 값, 그렇지 않으면 `NULL`. [UInt8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt8OrNull('8'),
    toUInt8OrNull('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt8OrNull('8'):   8
toUInt8OrNull('abc'): ᴺᵁᴸᴸ
```

**참조**

- [`toUInt8`](#touint8).
- [`toUInt8OrZero`](#touint8orzero).
- [`toUInt8OrDefault`](#touint8ordefault).
## toUInt8OrDefault {#touint8ordefault}

[`toUInt8`](#touint8)와 유사하게 이 함수는 입력 값을 [UInt8](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 기본 값을 반환합니다.
`default` 값이 제공되지 않으면 오류 발생 시 `0`이 반환됩니다.

**구문**

```sql
toUInt8OrDefault(expr[, default])
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택 사항) — `UInt8` 형식으로 구문 분석이 실패할 경우 반환할 기본 값. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt8OrDefault('0xc0fe', CAST('0', 'UInt8'));`.

:::note
입력 값이 [UInt8](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 8비트 부호 없는 정수 값, 그렇지 않으면 전달된 기본 값을 반환하거나 전달되지 않았을 경우 `0`을 반환합니다. [UInt8](../data-types/int-uint.md).

:::note
- 함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 형식은 캐스트 형식과 동일해야 합니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt8OrDefault('8', CAST('0', 'UInt8')),
    toUInt8OrDefault('abc', CAST('0', 'UInt8'))
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt8OrDefault('8', CAST('0', 'UInt8')):   8
toUInt8OrDefault('abc', CAST('0', 'UInt8')): 0
```

**참조**

- [`toUInt8`](#touint8).
- [`toUInt8OrZero`](#touint8orzero).
- [`toUInt8OrNull`](#touint8ornull).
## toUInt16 {#touint16}

입력 값을 [`UInt16`](../data-types/int-uint.md) 형식의 값으로 변환합니다. 오류 발생 시 예외를 발생시킵니다.

**구문**

```sql
toUInt16(expr)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

지원하지 않는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt16('0xc0fe');`.

:::note
입력 값이 [UInt16](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
예: `SELECT toUInt16(65536) == 0;`.
:::

**반환 값**

- 16비트 부호 없는 정수 값. [UInt16](../data-types/int-uint.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt16(16),
    toUInt16(16.16),
    toUInt16('16')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt16(16):    16
toUInt16(16.16): 16
toUInt16('16'):  16
```

**참조**

- [`toUInt16OrZero`](#touint16orzero).
- [`toUInt16OrNull`](#touint16ornull).
- [`toUInt16OrDefault`](#touint16ordefault).
## toUInt16OrZero {#touint16orzero}

[`toUInt16`](#touint16)와 유사하게 이 함수는 입력 값을 [UInt16](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 `0`을 반환합니다.

**구문**

```sql
toUInt16OrZero(x)
```

**인수**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원하지 않는 인수 (반환 `0`):
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt16OrZero('0xc0fe');`.

:::note
입력 값이 [UInt16](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 16비트 부호 없는 정수 값, 그렇지 않으면 `0`. [UInt16](../data-types/int-uint.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt16OrZero('16'),
    toUInt16OrZero('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt16OrZero('16'):  16
toUInt16OrZero('abc'): 0
```

**참조**

- [`toUInt16`](#touint16).
- [`toUInt16OrNull`](#touint16ornull).
- [`toUInt16OrDefault`](#touint16ordefault).
## toUInt16OrNull {#touint16ornull}

[`toUInt16`](#touint16)와 유사하게 이 함수는 입력 값을 [UInt16](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 `NULL`을 반환합니다.

**구문**

```sql
toUInt16OrNull(x)
```

**인수**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원하지 않는 인수 (반환 `\N`)
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt16OrNull('0xc0fe');`.

:::note
입력 값이 [UInt16](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 16비트 부호 없는 정수 값, 그렇지 않으면 `NULL`. [UInt16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt16OrNull('16'),
    toUInt16OrNull('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt16OrNull('16'):  16
toUInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**참조**

- [`toUInt16`](#touint16).
- [`toUInt16OrZero`](#touint16orzero).
- [`toUInt16OrDefault`](#touint16ordefault).
## toUInt16OrDefault {#touint16ordefault}

[`toUInt16`](#touint16)와 유사하게 이 함수는 입력 값을 [UInt16](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 기본 값을 반환합니다.
`default` 값이 제공되지 않으면 오류 발생 시 `0`이 반환됩니다.

**구문**

```sql
toUInt16OrDefault(expr[, default])
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택 사항) — `UInt16` 형식으로 구문 분석이 실패할 경우 반환할 기본 값. [UInt16](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt16OrDefault('0xc0fe', CAST('0', 'UInt16'));`.

:::note
입력 값이 [UInt16](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 16비트 부호 없는 정수 값, 그렇지 않으면 전달된 기본 값을 반환하거나 전달되지 않았을 경우 `0`을 반환합니다. [UInt16](../data-types/int-uint.md).

:::note
- 함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 형식은 캐스트 형식과 동일해야 합니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt16OrDefault('16', CAST('0', 'UInt16')),
    toUInt16OrDefault('abc', CAST('0', 'UInt16'))
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt16OrDefault('16', CAST('0', 'UInt16')):  16
toUInt16OrDefault('abc', CAST('0', 'UInt16')): 0
```

**참조**

- [`toUInt16`](#touint16).
- [`toUInt16OrZero`](#touint16orzero).
- [`toUInt16OrNull`](#touint16ornull).
## toUInt32 {#touint32}

입력 값을 [`UInt32`](../data-types/int-uint.md) 형식의 값으로 변환합니다. 오류 발생 시 예외를 발생시킵니다.

**구문**

```sql
toUInt32(expr)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

지원하지 않는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt32('0xc0fe');`.

:::note
입력 값이 [UInt32](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
예: `SELECT toUInt32(4294967296) == 0;`
:::

**반환 값**

- 32비트 부호 없는 정수 값. [UInt32](../data-types/int-uint.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt32(32),
    toUInt32(32.32),
    toUInt32('32')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt32(32):    32
toUInt32(32.32): 32
toUInt32('32'):  32
```

**참조**

- [`toUInt32OrZero`](#touint32orzero).
- [`toUInt32OrNull`](#touint32ornull).
- [`toUInt32OrDefault`](#touint32ordefault).
## toUInt32OrZero {#touint32orzero}

[`toUInt32`](#touint32)와 유사하게 이 함수는 입력 값을 [UInt32](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 `0`을 반환합니다.

**구문**

```sql
toUInt32OrZero(x)
```

**인수**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원하지 않는 인수 (반환 `0`):
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt32OrZero('0xc0fe');`.

:::note
입력 값이 [UInt32](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 32비트 부호 없는 정수 값, 그렇지 않으면 `0`. [UInt32](../data-types/int-uint.md)

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt32OrZero('32'),
    toUInt32OrZero('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt32OrZero('32'):  32
toUInt32OrZero('abc'): 0
```
**참조**

- [`toUInt32`](#touint32).
- [`toUInt32OrNull`](#touint32ornull).
- [`toUInt32OrDefault`](#touint32ordefault).
## toUInt32OrNull {#touint32ornull}

[`toUInt32`](#touint32)와 유사하게 이 함수는 입력 값을 [UInt32](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 `NULL`을 반환합니다.

**구문**

```sql
toUInt32OrNull(x)
```

**인수**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원하지 않는 인수 (반환 `\N`)
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt32OrNull('0xc0fe');`.

:::note
입력 값이 [UInt32](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 32비트 부호 없는 정수 값, 그렇지 않으면 `NULL`. [UInt32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt32OrNull('32'),
    toUInt32OrNull('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt32OrNull('32'):  32
toUInt32OrNull('abc'): ᴺᵁᴸᴸ
```

**참조**

- [`toUInt32`](#touint32).
- [`toUInt32OrZero`](#touint32orzero).
- [`toUInt32OrDefault`](#touint32ordefault).
## toUInt32OrDefault {#touint32ordefault}

[`toUInt32`](#touint32)와 유사하게 이 함수는 입력 값을 [UInt32](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 기본 값을 반환합니다.
`default` 값이 제공되지 않으면 오류 발생 시 `0`이 반환됩니다.

**구문**

```sql
toUInt32OrDefault(expr[, default])
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택 사항) — `UInt32` 형식으로 구문 분석이 실패할 경우 반환할 기본 값. [UInt32](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt32OrDefault('0xc0fe', CAST('0', 'UInt32'));`.

:::note
입력 값이 [UInt32](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 32비트 부호 없는 정수 값, 그렇지 않으면 전달된 기본 값을 반환하거나 전달되지 않았을 경우 `0`을 반환합니다. [UInt32](../data-types/int-uint.md).

:::note
- 함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 형식은 캐스트 형식과 동일해야 합니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt32OrDefault('32', CAST('0', 'UInt32')),
    toUInt32OrDefault('abc', CAST('0', 'UInt32'))
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt32OrDefault('32', CAST('0', 'UInt32')):  32
toUInt32OrDefault('abc', CAST('0', 'UInt32')): 0
```

**참조**

- [`toUInt32`](#touint32).
- [`toUInt32OrZero`](#touint32orzero).
- [`toUInt32OrNull`](#touint32ornull).
## toUInt64 {#touint64}

입력 값을 [`UInt64`](../data-types/int-uint.md) 형식의 값으로 변환합니다. 오류 발생 시 예외를 발생시킵니다.

**구문**

```sql
toUInt64(expr)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

지원하지 않는 유형:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt64('0xc0fe');`.

:::note
입력 값이 [UInt64](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
예: `SELECT toUInt64(18446744073709551616) == 0;`
:::

**반환 값**

- 64비트 부호 없는 정수 값. [UInt64](../data-types/int-uint.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt64(64),
    toUInt64(64.64),
    toUInt64('64')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt64(64):    64
toUInt64(64.64): 64
toUInt64('64'):  64
```

**참조**

- [`toUInt64OrZero`](#touint64orzero).
- [`toUInt64OrNull`](#touint64ornull).
- [`toUInt64OrDefault`](#touint64ordefault).
## toUInt64OrZero {#touint64orzero}

[`toUInt64`](#touint64)와 유사하게 이 함수는 입력 값을 [UInt64](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 `0`을 반환합니다.

**구문**

```sql
toUInt64OrZero(x)
```

**인수**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원하지 않는 인수 (반환 `0`):
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt64OrZero('0xc0fe');`.

:::note
입력 값이 [UInt64](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 64비트 부호 없는 정수 값, 그렇지 않으면 `0`. [UInt64](../data-types/int-uint.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt64OrZero('64'),
    toUInt64OrZero('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt64OrZero('64'):  64
toUInt64OrZero('abc'): 0
```

**참조**

- [`toUInt64`](#touint64).
- [`toUInt64OrNull`](#touint64ornull).
- [`toUInt64OrDefault`](#touint64ordefault).
## toUInt64OrNull {#touint64ornull}

[`toUInt64`](#touint64)와 유사하게 이 함수는 입력 값을 [UInt64](../data-types/int-uint.md) 형식의 값으로 변환하지만, 오류 발생 시 `NULL`을 반환합니다.

**구문**

```sql
toUInt64OrNull(x)
```

**인수**

- `x` — 숫자의 문자열 표현. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원하지 않는 인수 (반환 `\N`)
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진수 및 16진수 값의 문자열 표현, 예: `SELECT toUInt64OrNull('0xc0fe');`.

:::note
입력 값이 [UInt64](../data-types/int-uint.md) 범위 내에서 표현할 수 없는 경우 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**반환 값**

- 성공 시 64비트 부호 없는 정수 값, 그렇지 않으면 `NULL`. [UInt64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
함수는 [0으로 향하는 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하여 숫자의 소수 자리를 잘라냅니다.
:::

**예제**

쿼리:

```sql
SELECT
    toUInt64OrNull('64'),
    toUInt64OrNull('abc')
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
toUInt64OrNull('64'):  64
toUInt64OrNull('abc'): ᴺᵁᴸᴸ
```

**참조**

- [`toUInt64`](#touint64).
- [`toUInt64OrZero`](#touint64orzero).
- [`toUInt64OrDefault`](#touint64ordefault).

## toUInt64OrDefault {#touint64ordefault}

Like [`toUInt64`](#touint64), 이 함수는 입력 값을 [UInt64](../data-types/int-uint.md) 형식으로 변환하지만 오류가 발생할 경우 기본 값을 반환합니다.
만약 `default` 값이 전달되지 않으면 오류 발생 시 `0`이 반환됩니다.

**Syntax**

```sql
toUInt64OrDefault(expr[, default])
```

**Arguments**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `defauult` (선택적) — `UInt64` 형식으로 구문 분석이 실패할 경우 반환할 기본 값. [UInt64](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toUInt64OrDefault('0xc0fe', CAST('0', 'UInt64'));`.

:::note
입력 값이 [UInt64](../data-types/int-uint.md) 범위 내에서 표현될 수 없으면 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**Returned value**

- 성공할 경우 64비트 부호 없는 정수 값을 반환하고, 그렇지 않으면 전달된 기본 값 또는 전달되지 않은 경우 `0`을 반환합니다. [UInt64](../data-types/int-uint.md).

:::note
- 이 함수는 [영으로 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하며, 이는 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 형식은 캐스트 형식과 동일해야 합니다.
:::

**Example**

Query:

```sql
SELECT
    toUInt64OrDefault('64', CAST('0', 'UInt64')),
    toUInt64OrDefault('abc', CAST('0', 'UInt64'))
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt64OrDefault('64', CAST('0', 'UInt64')):  64
toUInt64OrDefault('abc', CAST('0', 'UInt64')): 0
```

**See also**

- [`toUInt64`](#touint64).
- [`toUInt64OrZero`](#touint64orzero).
- [`toUInt64OrNull`](#touint64ornull).
## toUInt128 {#touint128}

입력 값을 [`UInt128`](../data-types/int-uint.md) 형식으로 변환합니다. 오류 발생 시 예외를 발생시킵니다.

**Syntax**

```sql
toUInt128(expr)
```

**Arguments**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

지원되지 않는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toUInt128('0xc0fe');`.

:::note
입력 값이 [UInt128](../data-types/int-uint.md) 범위 내에서 표현될 수 없으면 결과가 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**Returned value**

- 128비트 부호 없는 정수 값. [UInt128](../data-types/int-uint.md).

:::note
이 함수는 [영으로 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하며, 이는 숫자의 소수 자리를 잘라냅니다.
:::

**Example**

Query:

```sql
SELECT
    toUInt128(128),
    toUInt128(128.8),
    toUInt128('128')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt128(128):   128
toUInt128(128.8): 128
toUInt128('128'): 128
```

**See also**

- [`toUInt128OrZero`](#touint128orzero).
- [`toUInt128OrNull`](#touint128ornull).
- [`toUInt128OrDefault`](#touint128ordefault).
## toUInt128OrZero {#touint128orzero}

Like [`toUInt128`](#touint128), 이 함수는 입력 값을 [UInt128](../data-types/int-uint.md) 형식으로 변환하지만 오류 발생 시 `0`을 반환합니다.

**Syntax**

```sql
toUInt128OrZero(expr)
```

**Arguments**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수 (return `0`):
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toUInt128OrZero('0xc0fe');`.

:::note
입력 값이 [UInt128](../data-types/int-uint.md) 범위 내에서 표현될 수 없으면 결과가 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**Returned value**

- 성공할 경우 128비트 부호 없는 정수 값을 반환하고, 그렇지 않으면 `0`. [UInt128](../data-types/int-uint.md).

:::note
이 함수는 [영으로 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하며, 이는 숫자의 소수 자리를 잘라냅니다.
:::

**Example**

Query:

```sql
SELECT
    toUInt128OrZero('128'),
    toUInt128OrZero('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt128OrZero('128'): 128
toUInt128OrZero('abc'): 0
```

**See also**

- [`toUInt128`](#touint128).
- [`toUInt128OrNull`](#touint128ornull).
- [`toUInt128OrDefault`](#touint128ordefault).
## toUInt128OrNull {#touint128ornull}

Like [`toUInt128`](#touint128), 이 함수는 입력 값을 [UInt128](../data-types/int-uint.md) 형식으로 변환하지만 오류 발생 시 `NULL`을 반환합니다.

**Syntax**

```sql
toUInt128OrNull(x)
```

**Arguments**

- `x` — 숫자의 문자열 표현. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수 (return `\N`)
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toUInt128OrNull('0xc0fe');`.

:::note
입력 값이 [UInt128](../data-types/int-uint.md) 범위 내에서 표현될 수 없으면 결과가 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**Returned value**

- 성공할 경우 128비트 부호 없는 정수 값을 반환하고, 그렇지 않으면 `NULL`. [UInt128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
이 함수는 [영으로 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하며, 이는 숫자의 소수 자리를 잘라냅니다.
:::

**Example**

Query:

```sql
SELECT
    toUInt128OrNull('128'),
    toUInt128OrNull('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt128OrNull('128'): 128
toUInt128OrNull('abc'): ᴺᵁᴸᴸ
```

**See also**

- [`toUInt128`](#touint128).
- [`toUInt128OrZero`](#touint128orzero).
- [`toUInt128OrDefault`](#touint128ordefault).
## toUInt128OrDefault {#touint128ordefault}

Like [`toUInt128`](#toint128), 이 함수는 입력 값을 [UInt128](../data-types/int-uint.md) 형식으로 변환하지만 오류가 발생할 경우 기본 값을 반환합니다.
만약 `default` 값이 전달되지 않으면 오류 발생 시 `0`이 반환됩니다.

**Syntax**

```sql
toUInt128OrDefault(expr[, default])
```

**Arguments**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택적) — `UInt128` 형식으로 구문 분석이 실패할 경우 반환할 기본 값. [UInt128](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256.
- Float32/64.
- (U)Int8/16/32/128/256의 문자열 표현.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toUInt128OrDefault('0xc0fe', CAST('0', 'UInt128'));`.

:::note
입력 값이 [UInt128](../data-types/int-uint.md) 범위 내에서 표현될 수 없으면 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**Returned value**

- 성공할 경우 128비트 부호 없는 정수 값을 반환하고, 그렇지 않으면 전달된 기본 값 또는 전달되지 않은 경우 `0`을 반환합니다. [UInt128](../data-types/int-uint.md).

:::note
- 이 함수는 [영으로 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하며, 이는 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 형식은 캐스트 형식과 동일해야 합니다.
:::

**Example**

Query:

```sql
SELECT
    toUInt128OrDefault('128', CAST('0', 'UInt128')),
    toUInt128OrDefault('abc', CAST('0', 'UInt128'))
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt128OrDefault('128', CAST('0', 'UInt128')): 128
toUInt128OrDefault('abc', CAST('0', 'UInt128')): 0
```

**See also**

- [`toUInt128`](#touint128).
- [`toUInt128OrZero`](#touint128orzero).
- [`toUInt128OrNull`](#touint128ornull).
## toUInt256 {#touint256}

입력 값을 [`UInt256`](../data-types/int-uint.md) 형식으로 변환합니다. 오류 발생 시 예외를 발생시킵니다.

**Syntax**

```sql
toUInt256(expr)
```

**Arguments**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값 또는 문자열 표현.
- Float32/64 형식의 값.

지원되지 않는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toUInt256('0xc0fe');`.

:::note
입력 값이 [UInt256](../data-types/int-uint.md) 범위 내에서 표현될 수 없으면 결과가 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**Returned value**

- 256비트 부호 없는 정수 값. [Int256](../data-types/int-uint.md).

:::note
이 함수는 [영으로 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하며, 이는 숫자의 소수 자리를 잘라냅니다.
:::

**Example**

Query:

```sql
SELECT
    toUInt256(256),
    toUInt256(256.256),
    toUInt256('256')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt256(256):     256
toUInt256(256.256): 256
toUInt256('256'):   256
```

**See also**

- [`toUInt256OrZero`](#touint256orzero).
- [`toUInt256OrNull`](#touint256ornull).
- [`toUInt256OrDefault`](#touint256ordefault).
## toUInt256OrZero {#touint256orzero}

Like [`toUInt256`](#touint256), 이 함수는 입력 값을 [UInt256](../data-types/int-uint.md) 형식으로 변환하지만 오류 발생 시 `0`을 반환합니다.

**Syntax**

```sql
toUInt256OrZero(x)
```

**Arguments**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수 (return `0`):
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toUInt256OrZero('0xc0fe');`.

:::note
입력 값이 [UInt256](../data-types/int-uint.md) 범위 내에서 표현될 수 없으면 결과가 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**Returned value**

- 성공할 경우 256비트 부호 없는 정수 값을 반환하고, 그렇지 않으면 `0`. [UInt256](../data-types/int-uint.md).

:::note
이 함수는 [영으로 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하며, 이는 숫자의 소수 자리를 잘라냅니다.
:::

**Example**

Query:

```sql
SELECT
    toUInt256OrZero('256'),
    toUInt256OrZero('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt256OrZero('256'): 256
toUInt256OrZero('abc'): 0
```

**See also**

- [`toUInt256`](#touint256).
- [`toUInt256OrNull`](#touint256ornull).
- [`toUInt256OrDefault`](#touint256ordefault).
## toUInt256OrNull {#touint256ornull}

Like [`toUInt256`](#touint256), 이 함수는 입력 값을 [UInt256](../data-types/int-uint.md) 형식으로 변환하지만 오류 발생 시 `NULL`을 반환합니다.

**Syntax**

```sql
toUInt256OrNull(x)
```

**Arguments**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256의 문자열 표현.

지원되지 않는 인수 (return `\N`)
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toUInt256OrNull('0xc0fe');`.

:::note
입력 값이 [UInt256](../data-types/int-uint.md) 범위 내에서 표현될 수 없으면 결과가 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**Returned value**

- 성공할 경우 256비트 부호 없는 정수 값을 반환하고, 그렇지 않으면 `NULL`. [UInt256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md).

:::note
이 함수는 [영으로 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하며, 이는 숫자의 소수 자리를 잘라냅니다.
:::

**Example**

Query:

```sql
SELECT
    toUInt256OrNull('256'),
    toUInt256OrNull('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt256OrNull('256'): 256
toUInt256OrNull('abc'): ᴺᵁᴸᴸ
```

**See also**

- [`toUInt256`](#touint256).
- [`toUInt256OrZero`](#touint256orzero).
- [`toUInt256OrDefault`](#touint256ordefault).
## toUInt256OrDefault {#touint256ordefault}

Like [`toUInt256`](#touint256), 이 함수는 입력 값을 [UInt256](../data-types/int-uint.md) 형식으로 변환하지만 오류 발생 시 기본 값을 반환합니다.
만약 `default` 값이 전달되지 않으면 오류 발생 시 `0`이 반환됩니다.

**Syntax**

```sql
toUInt256OrDefault(expr[, default])
```

**Arguments**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택적) — `UInt256` 형식으로 구문 분석이 실패할 경우 반환할 기본 값. [UInt256](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256.
- Float32/64.
- (U)Int8/16/32/128/256의 문자열 표현.

기본 값이 반환되는 인수:
- `NaN` 및 `Inf`를 포함한 Float32/64 값의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toUInt256OrDefault('0xc0fe', CAST('0', 'UInt256'));`.

:::note
입력 값이 [UInt256](../data-types/int-uint.md) 범위 내에서 표현될 수 없으면 결과의 오버플로우 또는 언더플로우가 발생합니다.
이는 오류로 간주되지 않습니다.
:::

**Returned value**

- 성공할 경우 256비트 부호 없는 정수 값을 반환하고, 그렇지 않으면 전달된 기본 값 또는 전달되지 않은 경우 `0`을 반환합니다. [UInt256](../data-types/int-uint.md).

:::note
- 이 함수는 [영으로 반올림](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)을 사용하며, 이는 숫자의 소수 자리를 잘라냅니다.
- 기본 값의 형식은 캐스트 형식과 동일해야 합니다.
:::

**Example**

Query:

```sql
SELECT
    toUInt256OrDefault('-256', CAST('0', 'UInt256')),
    toUInt256OrDefault('abc', CAST('0', 'UInt256'))
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toUInt256OrDefault('-256', CAST('0', 'UInt256')): 0
toUInt256OrDefault('abc', CAST('0', 'UInt256')):  0
```

**See also**

- [`toUInt256`](#touint256).
- [`toUInt256OrZero`](#touint256orzero).
- [`toUInt256OrNull`](#touint256ornull).
## toFloat32 {#tofloat32}

입력 값을 [`Float32`](../data-types/float.md) 형식으로 변환합니다. 오류 발생 시 예외를 발생시킵니다.

**Syntax**

```sql
toFloat32(expr)
```

**Arguments**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값.
- (U)Int8/16/32/128/256의 문자열 표현.
- Float32/64 형식의 값, включая `NaN` 및 `Inf`.
- Float32/64의 문자열 표현, включая `NaN` 및 `Inf` (대소문자 구분 없음).

지원되지 않는 인수:
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toFloat32('0xc0fe');`.

**Returned value**

- 32비트 부동 소수점 값. [Float32](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat32(42.7),
    toFloat32('42.7'),
    toFloat32('NaN')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat32(42.7):   42.7
toFloat32('42.7'): 42.7
toFloat32('NaN'):  nan
```

**See also**

- [`toFloat32OrZero`](#tofloat32orzero).
- [`toFloat32OrNull`](#tofloat32ornull).
- [`toFloat32OrDefault`](#tofloat32ordefault).
## toFloat32OrZero {#tofloat32orzero}

Like [`toFloat32`](#tofloat32), 이 함수는 입력 값을 [Float32](../data-types/float.md) 형식으로 변환하지만 오류 발생 시 `0`을 반환합니다.

**Syntax**

```sql
toFloat32OrZero(x)
```

**Arguments**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256, Float32/64의 문자열 표현.

지원되지 않는 인수 (return `0`):
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toFloat32OrZero('0xc0fe');`.

**Returned value**

- 성공할 경우 32비트 Float 값을 반환하고, 그렇지 않으면 `0`. [Float32](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat32OrZero('42.7'),
    toFloat32OrZero('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat32OrZero('42.7'): 42.7
toFloat32OrZero('abc'):  0
```

**See also**

- [`toFloat32`](#tofloat32).
- [`toFloat32OrNull`](#tofloat32ornull).
- [`toFloat32OrDefault`](#tofloat32ordefault).
## toFloat32OrNull {#tofloat32ornull}

Like [`toFloat32`](#tofloat32), 이 함수는 입력 값을 [Float32](../data-types/float.md) 형식으로 변환하지만 오류 발생 시 `NULL`을 반환합니다.

**Syntax**

```sql
toFloat32OrNull(x)
```

**Arguments**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256, Float32/64의 문자열 표현.

지원되지 않는 인수 (return `\N`):
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toFloat32OrNull('0xc0fe');`.

**Returned value**

- 성공할 경우 32비트 Float 값을 반환하고, 그렇지 않으면 `\N`. [Float32](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat32OrNull('42.7'),
    toFloat32OrNull('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat32OrNull('42.7'): 42.7
toFloat32OrNull('abc'):  ᴺᵁᴸᴸ
```

**See also**

- [`toFloat32`](#tofloat32).
- [`toFloat32OrZero`](#tofloat32orzero).
- [`toFloat32OrDefault`](#tofloat32ordefault).
## toFloat32OrDefault {#tofloat32ordefault}

Like [`toFloat32`](#tofloat32), 이 함수는 입력 값을 [Float32](../data-types/float.md) 형식으로 변환하지만 오류 발생 시 기본 값을 반환합니다.
만약 `default` 값이 전달되지 않으면 오류 발생 시 `0`이 반환됩니다.

**Syntax**

```sql
toFloat32OrDefault(expr[, default])
```

**Arguments**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택적) — `Float32` 형식으로 구문 분석이 실패할 경우 반환할 기본 값. [Float32](../data-types/float.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값.
- (U)Int8/16/32/64/128/256의 문자열 표현.
- Float32/64 형식의 값, включая `NaN` 및 `Inf`.
- Float32/64의 문자열 표현, включая `NaN` 및 `Inf` (대소문자 구분 없음).

기본 값이 반환되는 인수:
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toFloat32OrDefault('0xc0fe', CAST('0', 'Float32'));`.

**Returned value**

- 성공할 경우 32비트 Float 값을 반환하고, 그렇지 않으면 전달된 기본 값 또는 전달되지 않은 경우 `0`을 반환합니다. [Float32](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat32OrDefault('8', CAST('0', 'Float32')),
    toFloat32OrDefault('abc', CAST('0', 'Float32'))
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat32OrDefault('8', CAST('0', 'Float32')):   8
toFloat32OrDefault('abc', CAST('0', 'Float32')): 0
```

**See also**

- [`toFloat32`](#tofloat32).
- [`toFloat32OrZero`](#tofloat32orzero).
- [`toFloat32OrNull`](#tofloat32ornull).
## toFloat64 {#tofloat64}

입력 값을 [`Float64`](../data-types/float.md) 형식으로 변환합니다. 오류 발생 시 예외를 발생시킵니다.

**Syntax**

```sql
toFloat64(expr)
```

**Arguments**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값.
- (U)Int8/16/32/128/256의 문자열 표현.
- Float32/64 형식의 값, включая `NaN` 및 `Inf`.
- Float32/64의 문자열 표현, включая `NaN` 및 `Inf` (대소문자 구분 없음).

지원되지 않는 인수:
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toFloat64('0xc0fe');`.

**Returned value**

- 64비트 부동 소수점 값. [Float64](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat64(42.7),
    toFloat64('42.7'),
    toFloat64('NaN')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat64(42.7):   42.7
toFloat64('42.7'): 42.7
toFloat64('NaN'):  nan
```

**See also**

- [`toFloat64OrZero`](#tofloat64orzero).
- [`toFloat64OrNull`](#tofloat64ornull).
- [`toFloat64OrDefault`](#tofloat64ordefault).
## toFloat64OrZero {#tofloat64orzero}

Like [`toFloat64`](#tofloat64), 이 함수는 입력 값을 [Float64](../data-types/float.md) 형식으로 변환하지만 오류 발생 시 `0`을 반환합니다.

**Syntax**

```sql
toFloat64OrZero(x)
```

**Arguments**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256, Float32/64의 문자열 표현.

지원되지 않는 인수 (return `0`):
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toFloat64OrZero('0xc0fe');`.

**Returned value**

- 성공할 경우 64비트 Float 값을 반환하고, 그렇지 않으면 `0`. [Float64](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat64OrZero('42.7'),
    toFloat64OrZero('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat64OrZero('42.7'): 42.7
toFloat64OrZero('abc'):  0
```

**See also**

- [`toFloat64`](#tofloat64).
- [`toFloat64OrNull`](#tofloat64ornull).
- [`toFloat64OrDefault`](#tofloat64ordefault).
## toFloat64OrNull {#tofloat64ornull}

Like [`toFloat64`](#tofloat64), 이 함수는 입력 값을 [Float64](../data-types/float.md) 형식으로 변환하지만 오류 발생 시 `NULL`을 반환합니다.

**Syntax**

```sql
toFloat64OrNull(x)
```

**Arguments**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:
- (U)Int8/16/32/128/256, Float32/64의 문자열 표현.

지원되지 않는 인수 (return `\N`):
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toFloat64OrNull('0xc0fe');`.

**Returned value**

- 성공할 경우 64비트 Float 값을 반환하고, 그렇지 않으면 `\N`. [Float64](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat64OrNull('42.7'),
    toFloat64OrNull('abc')
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat64OrNull('42.7'): 42.7
toFloat64OrNull('abc'):  ᴺᵁᴸᴸ
```

**See also**

- [`toFloat64`](#tofloat64).
- [`toFloat64OrZero`](#tofloat64orzero).
- [`toFloat64OrDefault`](#tofloat64ordefault).
## toFloat64OrDefault {#tofloat64ordefault}

Like [`toFloat64`](#tofloat64), 이 함수는 입력 값을 [Float64](../data-types/float.md) 형식으로 변환하지만 오류 발생 시 기본 값을 반환합니다.
만약 `default` 값이 전달되지 않으면 오류 발생 시 `0`이 반환됩니다.

**Syntax**

```sql
toFloat64OrDefault(expr[, default])
```

**Arguments**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md).
- `default` (선택적) — `Float64` 형식으로 구문 분석이 실패할 경우 반환할 기본 값. [Float64](../data-types/float.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값.
- (U)Int8/16/32/64/128/256의 문자열 표현.
- Float32/64 형식의 값, включая `NaN` 및 `Inf`.
- Float32/64의 문자열 표현, включая `NaN` 및 `Inf` (대소문자 구분 없음).

기본 값이 반환되는 인수:
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toFloat64OrDefault('0xc0fe', CAST('0', 'Float64'));`.

**Returned value**

- 성공할 경우 64비트 Float 값을 반환하고, 그렇지 않으면 전달된 기본 값 또는 전달되지 않은 경우 `0`을 반환합니다. [Float64](../data-types/float.md).

**Example**

Query:

```sql
SELECT
    toFloat64OrDefault('8', CAST('0', 'Float64')),
    toFloat64OrDefault('abc', CAST('0', 'Float64'))
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
toFloat64OrDefault('8', CAST('0', 'Float64')):   8
toFloat64OrDefault('abc', CAST('0', 'Float64')): 0
```

**See also**

- [`toFloat64`](#tofloat64).
- [`toFloat64OrZero`](#tofloat64orzero).
- [`toFloat64OrNull`](#tofloat64ornull).
## toBFloat16 {#tobfloat16}

입력 값을 [`BFloat16`](/sql-reference/data-types/float#bfloat16) 형식으로 변환합니다. 
오류 발생 시 예외를 발생시킵니다.

**Syntax**

```sql
toBFloat16(expr)
```

**Arguments**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).

지원되는 인수:
- (U)Int8/16/32/64/128/256 형식의 값.
- (U)Int8/16/32/64/128/256의 문자열 표현.
- Float32/64 형식의 값, включая `NaN` 및 `Inf`.
- Float32/64의 문자열 표현, включая `NaN` 및 `Inf` (대소문자 구분 없음).

**Returned value**

- 16비트 브레인 부동 소수점 값. [BFloat16](/sql-reference/data-types/float#bfloat16).

**Example**

```sql
SELECT toBFloat16(toFloat32(42.7))

42.5

SELECT toBFloat16(toFloat32('42.7'));

42.5

SELECT toBFloat16('42.7');

42.5
```

**See also**

- [`toBFloat16OrZero`](#tobfloat16orzero).
- [`toBFloat16OrNull`](#tobfloat16ornull).
## toBFloat16OrZero {#tobfloat16orzero}

문자열 입력 값을 [`BFloat16`](/sql-reference/data-types/float#bfloat16) 형식으로 변환합니다.
문자열이 부동 소수점 값을 나타내지 않으면 함수는 0을 반환합니다.

**Syntax**

```sql
toBFloat16OrZero(x)
```

**Arguments**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:

- 숫자 값의 문자열 표현.

지원되지 않는 인수 (return `0`):

- 이진 및 16진수 값의 문자열 표현.
- 숫자 값.

**Returned value**

- 16비트 브레인 부동 소수점 값을 반환하거나, 그렇지 않으면 `0`. [BFloat16](/sql-reference/data-types/float#bfloat16).

:::note
이 함수는 문자열 표현에서 변환 중 정밀도가 손실될 수 있는 것을 허용합니다.
:::

**Example**

```sql
SELECT toBFloat16OrZero('0x5E'); -- unsupported arguments

0

SELECT toBFloat16OrZero('12.3'); -- typical use

12.25

SELECT toBFloat16OrZero('12.3456789');

12.3125 -- silent loss of precision
```

**See also**

- [`toBFloat16`](#tobfloat16).
- [`toBFloat16OrNull`](#tobfloat16ornull).
## toBFloat16OrNull {#tobfloat16ornull}

문자열 입력 값을 [`BFloat16`](/sql-reference/data-types/float#bfloat16) 형식으로 변환하지만,
문자열이 부동 소수점 값을 나타내지 않으면 함수는 `NULL`을 반환합니다.

**Syntax**

```sql
toBFloat16OrNull(x)
```

**Arguments**

- `x` — 숫자의 문자열 표현. [String](../data-types/string.md).

지원되는 인수:

- 숫자 값의 문자열 표현.

지원되지 않는 인수 (return `NULL`):

- 이진 및 16진수 값의 문자열 표현.
- 숫자 값.

**Returned value**

- 16비트 브레인 부동 소수점 값을 반환하거나, 그렇지 않으면 `NULL` (`\N`). [BFloat16](/sql-reference/data-types/float#bfloat16).

:::note
이 함수는 문자열 표현에서 변환 중 정밀도가 손실될 수 있는 것을 허용합니다.
:::

**Example**

```sql
SELECT toBFloat16OrNull('0x5E'); -- unsupported arguments

\N

SELECT toBFloat16OrNull('12.3'); -- typical use

12.25

SELECT toBFloat16OrNull('12.3456789');

12.3125 -- silent loss of precision
```

**See also**

- [`toBFloat16`](#tobfloat16).
- [`toBFloat16OrZero`](#tobfloat16orzero).
## toDate {#todate}

인수를 [Date](../data-types/date.md) 데이터 유형으로 변환합니다.

인수가 [DateTime](../data-types/datetime.md) 또는 [DateTime64](../data-types/datetime64.md)인 경우, 날짜 구성 요소를 유지하고 잘라냅니다:

```sql
SELECT
    now() AS x,
    toDate(x)
```

```response
┌───────────────────x─┬─toDate(now())─┐
│ 2022-12-30 13:44:17 │    2022-12-30 │
└─────────────────────┴───────────────┘
```

인수가 [String](../data-types/string.md)인 경우, [Date](../data-types/date.md) 또는 [DateTime](../data-types/datetime.md)로 구문 분석됩니다. [DateTime](../data-types/datetime.md)로 구문 분석되면 날짜 구성 요소가 사용됩니다:

```sql
SELECT
    toDate('2022-12-30') AS x,
    toTypeName(x)
```

```response
┌──────────x─┬─toTypeName(toDate('2022-12-30'))─┐
│ 2022-12-30 │ Date                             │
└────────────┴──────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

```sql
SELECT
    toDate('2022-12-30 01:02:03') AS x,
    toTypeName(x)
```

```response
┌──────────x─┬─toTypeName(toDate('2022-12-30 01:02:03'))─┐
│ 2022-12-30 │ Date                                      │
└────────────┴───────────────────────────────────────────┘
```

인수가 숫자이고 UNIX 타임스탬프처럼 보이며 (65535보다 큼), [DateTime](../data-types/datetime.md)으로 해석된 후 현재 시간대에서 [Date](../data-types/date.md)로 잘려집니다. 시간대 인수는 함수의 두 번째 인수로 지정할 수 있습니다. [Date](../data-types/date.md)로 잘리는 것은 시간대에 따라 다릅니다:

```sql
SELECT
    now() AS current_time,
    toUnixTimestamp(current_time) AS ts,
    toDateTime(ts) AS time_Amsterdam,
    toDateTime(ts, 'Pacific/Apia') AS time_Samoa,
    toDate(time_Amsterdam) AS date_Amsterdam,
    toDate(time_Samoa) AS date_Samoa,
    toDate(ts) AS date_Amsterdam_2,
    toDate(ts, 'Pacific/Apia') AS date_Samoa_2
```

```response
Row 1:
──────
current_time:     2022-12-30 13:51:54
ts:               1672404714
time_Amsterdam:   2022-12-30 13:51:54
time_Samoa:       2022-12-31 01:51:54
date_Amsterdam:   2022-12-30
date_Samoa:       2022-12-31
date_Amsterdam_2: 2022-12-30
date_Samoa_2:     2022-12-31
```

위 예제는 동일한 UNIX 타임스탬프가 다른 시간대에서 어떻게 다른 날짜로 해석될 수 있는지를 보여줍니다.

인수가 숫자이고 65536보다 작은 경우, 1970-01-01 (첫 번째 UNIX 날짜)부터의 일 수로 해석되어 [Date](../data-types/date.md)로 변환됩니다. 이는 `Date` 데이터 유형의 내부 숫자 표현에 해당합니다. 예시:

```sql
SELECT toDate(12345)
```
```response
┌─toDate(12345)─┐
│    2003-10-20 │
└───────────────┘
```

이 변환은 시간대와 관계가 없습니다.

인수가 Date 유형의 범위에 맞지 않으면 구현 정의된 동작이 발생하고, 최대 지원 날짜로 포화되거나 오버플로우됩니다:
```sql
SELECT toDate(10000000000.)
```
```response
┌─toDate(10000000000.)─┐
│           2106-02-07 │
└──────────────────────┘
```

함수 `toDate`는 대체 형태로도 작성할 수 있습니다:

```sql
SELECT
    now() AS time,
    toDate(time),
    DATE(time),
    CAST(time, 'Date')
```
```response
┌────────────────time─┬─toDate(now())─┬─DATE(now())─┬─CAST(now(), 'Date')─┐
│ 2022-12-30 13:54:58 │    2022-12-30 │  2022-12-30 │          2022-12-30 │
└─────────────────────┴───────────────┴─────────────┴─────────────────────┘
```
## toDateOrZero {#todateorzero}

[toDate](#todate)와 동일하지만, 잘못된 인수가 수신된 경우 [Date](../data-types/date.md)의 하한 값을 반환합니다. 오직 [String](../data-types/string.md) 인수만 지원됩니다.

**Example**

Query:

```sql
SELECT toDateOrZero('2022-12-30'), toDateOrZero('');
```

Result:

```response
┌─toDateOrZero('2022-12-30')─┬─toDateOrZero('')─┐
│                 2022-12-30 │       1970-01-01 │
└────────────────────────────┴──────────────────┘
```
## toDateOrNull {#todateornull}

[toDate](#todate)와 동일하지만 잘못된 인수가 수신된 경우 `NULL`을 반환합니다. 오직 [String](../data-types/string.md) 인수만 지원됩니다.

**Example**

Query:

```sql
SELECT toDateOrNull('2022-12-30'), toDateOrNull('');
```

Result:

```response
┌─toDateOrNull('2022-12-30')─┬─toDateOrNull('')─┐
│                 2022-12-30 │             ᴺᵁᴸᴸ │
└────────────────────────────┴──────────────────┘
```
## toDateOrDefault {#todateordefault}

[toDate](#todate)와 같지만, 실패할 경우 기본 값을 반환하며, 이는 두 번째 인수(지정된 경우) 또는 그렇지 않으면 [Date](../data-types/date.md)의 하한 값입니다.

**Syntax**

```sql
toDateOrDefault(expr [, default_value])
```

**Example**

Query:

```sql
SELECT toDateOrDefault('2022-12-30'), toDateOrDefault('', '2023-01-01'::Date);
```

Result:

```response
┌─toDateOrDefault('2022-12-30')─┬─toDateOrDefault('', CAST('2023-01-01', 'Date'))─┐
│                    2022-12-30 │                                      2023-01-01 │
└───────────────────────────────┴─────────────────────────────────────────────────┘
```
## toDateTime {#todatetime}

입력 값을 [DateTime](../data-types/datetime.md)으로 변환합니다.

**Syntax**

```sql
toDateTime(expr[, time_zone ])
```

**Arguments**

- `expr` — 값. [String](../data-types/string.md), [Int](../data-types/int-uint.md), [Date](../data-types/date.md) 또는 [DateTime](../data-types/datetime.md).
- `time_zone` — 시간대. [String](../data-types/string.md).

:::note
`expr`가 숫자이면 이는 Unix Epoch 시작 이후의 초 수로 해석됩니다 (Unix 타임스탬프와 같음).
`expr`가 [String](../data-types/string.md)인 경우 Unix 타임스탬프이거나 날짜/날짜와 시간을 문자열로 표현한 것일 수 있습니다.
따라서 짧은 숫자의 문자열 표현(최대 4자리)을 모호성으로 인해 명시적으로 비활성화했습니다. 예를 들어 문자열 `'1999'`는 연도(불완전한 날짜/날짜 시간의 문자열 표현)가 될 수도 있고 Unix 타임스탬프일 수도 있습니다. 더 긴 숫자 문자열은 허용됩니다.
:::

**Returned value**

- 날짜 시간. [DateTime](../data-types/datetime.md)

**Example**

Query:

```sql
SELECT toDateTime('2022-12-30 13:44:17'), toDateTime(1685457500, 'UTC');
```

Result:

```response
┌─toDateTime('2022-12-30 13:44:17')─┬─toDateTime(1685457500, 'UTC')─┐
│               2022-12-30 13:44:17 │           2023-05-30 14:38:20 │
└───────────────────────────────────┴───────────────────────────────┘
```
## toDateTimeOrZero {#todatetimeorzero}

[toDateTime](#todatetime)와 동일하지만 잘못된 인수가 수신된 경우 [DateTime](../data-types/datetime.md)의 하한 값을 반환합니다. 오직 [String](../data-types/string.md) 인수만 지원됩니다.

**Example**

Query:

```sql
SELECT toDateTimeOrZero('2022-12-30 13:44:17'), toDateTimeOrZero('');
```

Result:

```response
┌─toDateTimeOrZero('2022-12-30 13:44:17')─┬─toDateTimeOrZero('')─┐
│                     2022-12-30 13:44:17 │  1970-01-01 00:00:00 │
└─────────────────────────────────────────┴──────────────────────┘
```
## toDateTimeOrNull {#todatetimeornull}

[toDateTime](#todatetime)와 동일하지만 잘못된 인수가 수신된 경우 `NULL`을 반환합니다. 오직 [String](../data-types/string.md) 인수만 지원됩니다.

**Example**

Query:

```sql
SELECT toDateTimeOrNull('2022-12-30 13:44:17'), toDateTimeOrNull('');
```

Result:

```response
┌─toDateTimeOrNull('2022-12-30 13:44:17')─┬─toDateTimeOrNull('')─┐
│                     2022-12-30 13:44:17 │                 ᴺᵁᴸᴸ │
└─────────────────────────────────────────┴──────────────────────┘
```
## toDateTimeOrDefault {#todatetimeordefault}

[toDateTime](#todatetime)와 같지만 실패할 경우 기본 값을 반환하며, 이는 세 번째 인수(지정된 경우) 또는 그렇지 않으면 [DateTime](../data-types/datetime.md)의 하한 값입니다.

**Syntax**

```sql
toDateTimeOrDefault(expr [, time_zone [, default_value]])
```

**Example**

Query:

```sql
SELECT toDateTimeOrDefault('2022-12-30 13:44:17'), toDateTimeOrDefault('', 'UTC', '2023-01-01'::DateTime('UTC'));
```

Result:

```response
┌─toDateTimeOrDefault('2022-12-30 13:44:17')─┬─toDateTimeOrDefault('', 'UTC', CAST('2023-01-01', 'DateTime(\'UTC\')'))─┐
│                        2022-12-30 13:44:17 │                                                     2023-01-01 00:00:00 │
└────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────┘
```
## toDate32 {#todate32}

인수를 [Date32](../data-types/date32.md) 데이터 유형으로 변환합니다. 값이 범위를 벗어나는 경우 `toDate32`는 [Date32](../data-types/date32.md)에서 지원되는 경계 값을 반환합니다. 인수가 [Date](../data-types/date.md) 형식을 가지면 그 경계가 고려됩니다.

**Syntax**

```sql
toDate32(expr)
```

**Arguments**

- `expr` — 값. [String](../data-types/string.md), [UInt32](../data-types/int-uint.md) 또는 [Date](../data-types/date.md).

**Returned value**

- 달력 날짜. [Date32](../data-types/date32.md) 형식.

**Example**

1. 값이 범위 내에 있는 경우:

```sql
SELECT toDate32('1955-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1925-01-01'))─┐
│ 1955-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

2. 값이 범위를 벗어나는 경우:

```sql
SELECT toDate32('1899-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1899-01-01'))─┐
│ 1900-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

3. [Date](../data-types/date.md) 인수와 함께:

```sql
SELECT toDate32(toDate('1899-01-01')) AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32(toDate('1899-01-01')))─┐
│ 1970-01-01 │ Date32                                     │
└────────────┴────────────────────────────────────────────┘
```
## toDate32OrZero {#todate32orzero}

[toDate32](#todate32)와 동일하지만 잘못된 인수가 수신된 경우 [Date32](../data-types/date32.md)의 최소 값을 반환합니다.

**Example**

Query:

```sql
SELECT toDate32OrZero('1899-01-01'), toDate32OrZero('');
```

Result:

```response
┌─toDate32OrZero('1899-01-01')─┬─toDate32OrZero('')─┐
│                   1900-01-01 │         1900-01-01 │
└──────────────────────────────┴────────────────────┘
```
## toDate32OrNull {#todate32ornull}

[toDate32](#todate32)와 동일하지만 잘못된 인수가 수신된 경우 `NULL`을 반환합니다.

**Example**

Query:

```sql
SELECT toDate32OrNull('1955-01-01'), toDate32OrNull('');
```

Result:

```response
┌─toDate32OrNull('1955-01-01')─┬─toDate32OrNull('')─┐
│                   1955-01-01 │               ᴺᵁᴸᴸ │
└──────────────────────────────┴────────────────────┘
```

## toDate32OrDefault {#todate32ordefault}

인수를 [Date32](../data-types/date32.md) 데이터 유형으로 변환합니다. 값이 범위를 벗어날 경우, `toDate32OrDefault`는 [Date32](../data-types/date32.md)에서 지원하는 하한값을 반환합니다. 인수가 [Date](../data-types/date.md) 유형인 경우, 그 경계가 고려됩니다. 잘못된 인수가 수신되면 기본 값을 반환합니다.

**예시**

쿼리:

```sql
SELECT
    toDate32OrDefault('1930-01-01', toDate32('2020-01-01')),
    toDate32OrDefault('xx1930-01-01', toDate32('2020-01-01'));
```

결과:

```response
┌─toDate32OrDefault('1930-01-01', toDate32('2020-01-01'))─┬─toDate32OrDefault('xx1930-01-01', toDate32('2020-01-01'))─┐
│                                              1930-01-01 │                                                2020-01-01 │
└─────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```
## toDateTime64 {#todatetime64}

입력 값을 [DateTime64](../data-types/datetime64.md) 유형의 값으로 변환합니다.

**구문**

```sql
toDateTime64(expr, scale, [timezone])
```

**인수**

- `expr` — 값. [String](../data-types/string.md), [UInt32](../data-types/int-uint.md), [Float](../data-types/float.md) 또는 [DateTime](../data-types/datetime.md).
- `scale` - 틱 크기 (정밀도): 10<sup>-precision</sup> 초. 유효 범위: [ 0 : 9 ].
- `timezone` (선택사항) - 지정된 datetime64 객체의 시간대.

**반환 값**

- 서브 초 정밀도의 달력 날짜와 하루의 시간. [DateTime64](../data-types/datetime64.md).

**예시**

1. 값이 범위 내에 있는 경우:

```sql
SELECT toDateTime64('1955-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('1955-01-01 00:00:00.000', 3))─┐
│ 1955-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

2. 정밀도가 있는 소수로:

```sql
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800., 3))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
```

소수점 없이도 값은 여전히 Unix 타임스탬프로 초 단위로 처리됩니다:

```sql
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

3. `timezone` 포함:

```sql
SELECT toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```
## toDateTime64OrZero {#todatetime64orzero}

[toDateTime64](#todatetime64)와 같이, 이 함수는 입력 값을 [DateTime64](../data-types/datetime64.md) 유형의 값으로 변환하지만, 잘못된 인수가 수신되면 [DateTime64](../data-types/datetime64.md)의 최소 값을 반환합니다.

**구문**

```sql
toDateTime64OrZero(expr, scale, [timezone])
```

**인수**

- `expr` — 값. [String](../data-types/string.md), [UInt32](../data-types/int-uint.md), [Float](../data-types/float.md) 또는 [DateTime](../data-types/datetime.md).
- `scale` - 틱 크기 (정밀도): 10<sup>-precision</sup> 초. 유효 범위: [ 0 : 9 ].
- `timezone` (선택사항) - 지정된 DateTime64 객체의 시간대.

**반환 값**

- 서브 초 정밀도의 달력 날짜와 하루의 시간, 그렇지 않으면 `DateTime64`의 최소 값: `1970-01-01 01:00:00.000`. [DateTime64](../data-types/datetime64.md).

**예시**

쿼리:

```sql
SELECT toDateTime64OrZero('2008-10-12 00:00:00 00:30:30', 3) AS invalid_arg
```

결과:

```response
┌─────────────invalid_arg─┐
│ 1970-01-01 01:00:00.000 │
└─────────────────────────┘
```

**참조**

- [toDateTime64](#todatetime64).
- [toDateTime64OrNull](#todatetime64ornull).
- [toDateTime64OrDefault](#todatetime64ordefault).
## toDateTime64OrNull {#todatetime64ornull}

[toDateTime64](#todatetime64)와 같이, 이 함수는 입력 값을 [DateTime64](../data-types/datetime64.md) 유형의 값으로 변환하지만, 잘못된 인수가 수신되면 `NULL`을 반환합니다.

**구문**

```sql
toDateTime64OrNull(expr, scale, [timezone])
```

**인수**

- `expr` — 값. [String](../data-types/string.md), [UInt32](../data-types/int-uint.md), [Float](../data-types/float.md) 또는 [DateTime](../data-types/datetime.md).
- `scale` - 틱 크기 (정밀도): 10<sup>-precision</sup> 초. 유효 범위: [ 0 : 9 ].
- `timezone` (선택사항) - 지정된 DateTime64 객체의 시간대.

**반환 값**

- 서브 초 정밀도의 달력 날짜와 하루의 시간, 그렇지 않으면 `NULL`. [DateTime64](../data-types/datetime64.md)/[NULL](../data-types/nullable.md).

**예시**

쿼리:

```sql
SELECT
    toDateTime64OrNull('1976-10-18 00:00:00.30', 3) AS valid_arg,
    toDateTime64OrNull('1976-10-18 00:00:00 30', 3) AS invalid_arg
```

결과:

```response
┌───────────────valid_arg─┬─invalid_arg─┐
│ 1976-10-18 00:00:00.300 │        ᴺᵁᴸᴸ │
└─────────────────────────┴─────────────┘
```

**참조**

- [toDateTime64](#todatetime64).
- [toDateTime64OrZero](#todatetime64orzero).
- [toDateTime64OrDefault](#todatetime64ordefault).
## toDateTime64OrDefault {#todatetime64ordefault}

[toDateTime64](#todatetime64)와 같이, 이 함수는 입력 값을 [DateTime64](../data-types/datetime64.md) 유형의 값으로 변환하지만, 잘못된 인수가 수신되면 [DateTime64](../data-types/datetime64.md)의 기본 값 또는 제공된 기본 값을 반환합니다.

**구문**

```sql
toDateTime64OrNull(expr, scale, [timezone, default])
```

**인수**

- `expr` — 값. [String](../data-types/string.md), [UInt32](../data-types/int-uint.md), [Float](../data-types/float.md) 또는 [DateTime](../data-types/datetime.md).
- `scale` - 틱 크기 (정밀도): 10<sup>-precision</sup> 초. 유효 범위: [ 0 : 9 ].
- `timezone` (선택사항) - 지정된 DateTime64 객체의 시간대.
- `default` (선택사항) - 잘못된 인수가 수신되면 반환할 기본 값. [DateTime64](../data-types/datetime64.md).

**반환 값**

- 서브 초 정밀도의 달력 날짜와 하루의 시간, 그렇지 않으면 `DateTime64`의 최소 값 또는 제공된 경우 `default` 값. [DateTime64](../data-types/datetime64.md).

**예시**

쿼리:

```sql
SELECT
    toDateTime64OrDefault('1976-10-18 00:00:00 30', 3) AS invalid_arg,
    toDateTime64OrDefault('1976-10-18 00:00:00 30', 3, 'UTC', toDateTime64('2001-01-01 00:00:00.00',3)) AS invalid_arg_with_default
```

결과:

```response
┌─────────────invalid_arg─┬─invalid_arg_with_default─┐
│ 1970-01-01 01:00:00.000 │  2000-12-31 23:00:00.000 │
└─────────────────────────┴──────────────────────────┘
```

**참조**

- [toDateTime64](#todatetime64).
- [toDateTime64OrZero](#todatetime64orzero).
- [toDateTime64OrNull](#todatetime64ornull).
## toDecimal32 {#todecimal32}

입력 값을 [`Decimal(9, S)`](../data-types/decimal.md)로 변환합니다. 오류가 발생할 경우 예외를 발생시킵니다.

**구문**

```sql
toDecimal32(expr, S)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).
- `S` — 0과 9 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 값이나 문자열 표현.
- Float32/64 유형의 값이나 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현(대소문자 구분하지 않음).
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal32('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal32`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 예외가 발생합니다.
:::

:::warning
변환 시 추가 자릿수가 삭제되며, Float32/Float64 입력과 작업할 때 예상치 못한 방식으로 작동할 수 있습니다. 이 작업은 부동 소수점 명령어를 사용하여 수행됩니다.
예를 들어: `toDecimal32(1.15, 2)`는 `1.14`와 같습니다. 왜냐하면 부동 소수점에서 1.15 * 100은 114.99이기 때문입니다.
문자열 입력을 사용하여 작업이 기본 정수 유형을 사용하도록 할 수 있습니다: `toDecimal32('1.15', 2) = 1.15`
:::

**반환 값**

- `Decimal(9, S)` 유형의 값. [Decimal32(S)](../data-types/int-uint.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal32(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal32(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal32('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:      2
type_a: Decimal(9, 1)
b:      4.2
type_b: Decimal(9, 2)
c:      4.2
type_c: Decimal(9, 3)
```

**참조**

- [`toDecimal32OrZero`](#todecimal32orzero).
- [`toDecimal32OrNull`](#todecimal32ornull).
- [`toDecimal32OrDefault`](#todecimal32ordefault).
## toDecimal32OrZero {#todecimal32orzero}

[`toDecimal32`](#todecimal32)와 같이, 이 함수는 입력 값을 [Decimal(9, S)](../data-types/decimal.md) 유형의 값으로 변환하지만, 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toDecimal32OrZero(expr, S)
```

**인수**

- `expr` — 숫자의 문자열 표현. [String](../data-types/string.md).
- `S` — 0과 9 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 문자열 표현.
- Float32/64 유형의 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal32OrZero('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal32`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 오류가 발생합니다.
:::

**반환 값**

- 성공적으로 변환되면 `Decimal(9, S)` 유형의 값, 그렇지 않으면 `0`과 `S` 소수 자릿수를 가진 값. [Decimal32(S)](../data-types/decimal.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal32OrZero(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrZero(toString('Inf'), 5) AS b,
    toTypeName(b)
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:             -1.111
toTypeName(a): Decimal(9, 5)
b:             0
toTypeName(b): Decimal(9, 5)
```

**참조**

- [`toDecimal32`](#todecimal32).
- [`toDecimal32OrNull`](#todecimal32ornull).
- [`toDecimal32OrDefault`](#todecimal32ordefault).
## toDecimal32OrNull {#todecimal32ornull}

[`toDecimal32`](#todecimal32)와 같이, 이 함수는 입력 값을 [Nullable(Decimal(9, S))](../data-types/decimal.md) 유형의 값으로 변환하지만, 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toDecimal32OrNull(expr, S)
```

**인수**

- `expr` — 숫자의 문자열 표현. [String](../data-types/string.md).
- `S` — 0과 9 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 문자열 표현.
- Float32/64 유형의 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal32OrNull('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal32`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 오류가 발생합니다.
:::

**반환 값**

- 성공적으로 변환되면 `Nullable(Decimal(9, S))` 유형의 값, 그렇지 않으면 동일한 유형의 값 `NULL`. [Decimal32(S)](../data-types/decimal.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal32OrNull(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrNull(toString('Inf'), 5) AS b,
    toTypeName(b)
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:             -1.111
toTypeName(a): Nullable(Decimal(9, 5))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(9, 5))
```

**참조**

- [`toDecimal32`](#todecimal32).
- [`toDecimal32OrZero`](#todecimal32orzero).
- [`toDecimal32OrDefault`](#todecimal32ordefault).
## toDecimal32OrDefault {#todecimal32ordefault}

[`toDecimal32`](#todecimal32)와 같이, 이 함수는 입력 값을 [Decimal(9, S)](../data-types/decimal.md) 유형으로 변환하지만, 오류가 발생할 경우 기본 값을 반환합니다.

**구문**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**인수**

- `expr` — 숫자의 문자열 표현. [String](../data-types/string.md).
- `S` — 0과 9 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).
- `default` (선택사항) — `Decimal32(S)` 유형으로 변환하는 데 실패할 경우 반환할 기본 값. [Decimal32(S)](../data-types/decimal.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 문자열 표현.
- Float32/64 유형의 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal32OrDefault('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal32`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 오류가 발생합니다.
:::

:::warning
변환 시 추가 자릿수가 삭제되며, Float32/Float64 입력과 작업할 때 예상치 못한 방식으로 작동할 수 있습니다. 이 작업은 부동 소수점 명령어를 사용하여 수행됩니다.
예를 들어: `toDecimal32OrDefault(1.15, 2)`는 `1.14`와 같습니다. 왜냐하면 부동 소수점에서 1.15 * 100은 114.99이기 때문입니다.
문자열 입력을 사용하여 작업이 기본 정수 유형을 사용하도록 할 수 있습니다: `toDecimal32OrDefault('1.15', 2) = 1.15`
:::

**반환 값**

- 성공적으로 변환되면 `Decimal(9, S)` 유형의 값, 그렇지 않으면 제공된 경우 기본 값을 반환하거나 그렇지 않으면 `0`을 반환합니다. [Decimal32(S)](../data-types/decimal.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal32OrDefault(toString(0.0001), 5) AS a,
    toTypeName(a),
    toDecimal32OrDefault('Inf', 0, CAST('-1', 'Decimal32(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(9, 5)
b:             -1
toTypeName(b): Decimal(9, 0)
```

**참조**

- [`toDecimal32`](#todecimal32).
- [`toDecimal32OrZero`](#todecimal32orzero).
- [`toDecimal32OrNull`](#todecimal32ornull).
## toDecimal64 {#todecimal64}

입력 값을 [`Decimal(18, S)`](../data-types/decimal.md) 유형으로 변환합니다. 오류가 발생할 경우 예외를 발생시킵니다.

**구문**

```sql
toDecimal64(expr, S)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).
- `S` — 0과 18 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 값이나 문자열 표현.
- Float32/64 유형의 값이나 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현(대소문자 구분하지 않음).
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal64('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal64`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 예외가 발생합니다.
:::

:::warning
변환 시 추가 자릿수가 삭제되며, Float32/Float64 입력과 작업할 때 예상치 못한 방식으로 작동할 수 있습니다. 이 작업은 부동 소수점 명령어를 사용하여 수행됩니다.
예를 들어: `toDecimal64(1.15, 2)`는 `1.14`와 같습니다. 왜냐하면 부동 소수점에서 1.15 * 100은 114.99이기 때문입니다.
문자열 입력을 사용하여 작업이 기본 정수 유형을 사용하도록 할 수 있습니다: `toDecimal64('1.15', 2) = 1.15`
:::

**반환 값**

- `Decimal(18, S)` 유형의 값. [Decimal64(S)](../data-types/int-uint.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal64(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal64(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal64('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:      2
type_a: Decimal(18, 1)
b:      4.2
type_b: Decimal(18, 2)
c:      4.2
type_c: Decimal(18, 3)
```

**참조**

- [`toDecimal64OrZero`](#todecimal64orzero).
- [`toDecimal64OrNull`](#todecimal64ornull).
- [`toDecimal64OrDefault`](#todecimal64ordefault).
## toDecimal64OrZero {#todecimal64orzero}

[`toDecimal64`](#todecimal64)와 같이, 이 함수는 입력 값을 [Decimal(18, S)](../data-types/decimal.md) 유형의 값으로 변환하지만, 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toDecimal64OrZero(expr, S)
```

**인수**

- `expr` — 숫자의 문자열 표현. [String](../data-types/string.md).
- `S` — 0과 18 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 문자열 표현.
- Float32/64 유형의 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal64OrZero('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal64`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 오류가 발생합니다.
:::

**반환 값**

- 성공적으로 변환되면 `Decimal(18, S)` 유형의 값, 그렇지 않으면 `0`과 `S` 소수 자릿수를 가진 값. [Decimal64(S)](../data-types/decimal.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal64OrZero(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrZero(toString('Inf'), 18) AS b,
    toTypeName(b)
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(18, 18)
b:             0
toTypeName(b): Decimal(18, 18)
```

**참조**

- [`toDecimal64`](#todecimal64).
- [`toDecimal64OrNull`](#todecimal64ornull).
- [`toDecimal64OrDefault`](#todecimal64ordefault).
## toDecimal64OrNull {#todecimal64ornull}

[`toDecimal64`](#todecimal64)와 같이, 이 함수는 입력 값을 [Nullable(Decimal(18, S))](../data-types/decimal.md) 유형의 값으로 변환하지만, 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toDecimal64OrNull(expr, S)
```

**인수**

- `expr` — 숫자의 문자열 표현. [String](../data-types/string.md).
- `S` — 0과 18 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 문자열 표현.
- Float32/64 유형의 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal64OrNull('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal64`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 오류가 발생합니다.
:::

**반환 값**

- 성공적으로 변환되면 `Nullable(Decimal(18, S))` 유형의 값, 그렇지 않으면 동일한 유형의 값 `NULL`. [Decimal64(S)](../data-types/decimal.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal64OrNull(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrNull(toString('Inf'), 18) AS b,
    toTypeName(b)
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Nullable(Decimal(18, 18))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(18, 18))
```

**참조**

- [`toDecimal64`](#todecimal64).
- [`toDecimal64OrZero`](#todecimal64orzero).
- [`toDecimal64OrDefault`](#todecimal64ordefault).
## toDecimal64OrDefault {#todecimal64ordefault}

[`toDecimal64`](#todecimal64)와 같이, 이 함수는 입력 값을 [Decimal(18, S)](../data-types/decimal.md) 유형으로 변환하지만, 오류가 발생할 경우 기본 값을 반환합니다.

**구문**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**인수**

- `expr` — 숫자의 문자열 표현. [String](../data-types/string.md).
- `S` — 0과 18 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).
- `default` (선택사항) — `Decimal64(S)`로 변환하는 데 실패할 경우 반환할 기본 값. [Decimal64(S)](../data-types/decimal.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 문자열 표현.
- Float32/64 유형의 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal64OrDefault('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal64`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 오류가 발생합니다.
:::

:::warning
변환 시 추가 자릿수가 삭제되며, Float32/Float64 입력과 작업할 때 예상치 못한 방식으로 작동할 수 있습니다. 이 작업은 부동 소수점 명령어를 사용하여 수행됩니다.
예를 들어: `toDecimal64OrDefault(1.15, 2)`는 `1.14`와 같습니다. 왜냐하면 부동 소수점에서 1.15 * 100은 114.99이기 때문입니다.
문자열 입력을 사용하여 작업이 기본 정수 유형을 사용하도록 할 수 있습니다: `toDecimal64OrDefault('1.15', 2) = 1.15`
:::

**반환 값**

- 성공적으로 변환되면 `Decimal(18, S)` 유형의 값, 그렇지 않으면 제공된 경우 기본 값을 반환하거나 그렇지 않으면 `0`을 반환합니다. [Decimal64(S)](../data-types/decimal.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal64OrDefault(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrDefault('Inf', 0, CAST('-1', 'Decimal64(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(18, 18)
b:             -1
toTypeName(b): Decimal(18, 0)
```

**참조**

- [`toDecimal64`](#todecimal64).
- [`toDecimal64OrZero`](#todecimal64orzero).
- [`toDecimal64OrNull`](#todecimal64ornull).
## toDecimal128 {#todecimal128}

입력 값을 [`Decimal(38, S)`](../data-types/decimal.md) 유형으로 변환합니다. 오류가 발생할 경우 예외를 발생시킵니다.

**구문**

```sql
toDecimal128(expr, S)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).
- `S` — 0과 38 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 값이나 문자열 표현.
- Float32/64 유형의 값이나 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현(대소문자 구분하지 않음).
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal128('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal128`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 예외가 발생합니다.
:::

:::warning
변환 시 추가 자릿수가 삭제되며, Float32/Float64 입력과 작업할 때 예상치 못한 방식으로 작동할 수 있습니다. 이 작업은 부동 소수점 명령어를 사용하여 수행됩니다.
예를 들어: `toDecimal128(1.15, 2)`는 `1.14`와 같습니다. 왜냐하면 부동 소수점에서 1.15 * 100은 114.99이기 때문입니다.
문자열 입력을 사용하여 작업이 기본 정수 유형을 사용하도록 할 수 있습니다: `toDecimal128('1.15', 2) = 1.15`
:::

**반환 값**

- `Decimal(38, S)` 유형의 값. [Decimal128(S)](../data-types/int-uint.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal128(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal128(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal128('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:      99
type_a: Decimal(38, 1)
b:      99.67
type_b: Decimal(38, 2)
c:      99.67
type_c: Decimal(38, 3)
```

**참조**

- [`toDecimal128OrZero`](#todecimal128orzero).
- [`toDecimal128OrNull`](#todecimal128ornull).
- [`toDecimal128OrDefault`](#todecimal128ordefault).
## toDecimal128OrZero {#todecimal128orzero}

[`toDecimal128`](#todecimal128)와 같이, 이 함수는 입력 값을 [Decimal(38, S)](../data-types/decimal.md) 유형으로 변환하지만, 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toDecimal128OrZero(expr, S)
```

**인수**

- `expr` — 숫자의 문자열 표현. [String](../data-types/string.md).
- `S` — 0과 38 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 문자열 표현.
- Float32/64 유형의 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal128OrZero('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal128`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 오류가 발생합니다.
:::

**반환 값**

- 성공적으로 변환되면 `Decimal(38, S)` 유형의 값, 그렇지 않으면 `0`과 `S` 소수 자릿수를 가진 값. [Decimal128(S)](../data-types/decimal.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal128OrZero(toString(0.0001), 38) AS a,
    toTypeName(a),
    toDecimal128OrZero(toString('Inf'), 38) AS b,
    toTypeName(b)
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(38, 38)
b:             0
toTypeName(b): Decimal(38, 38)
```

**참조**

- [`toDecimal128`](#todecimal128).
- [`toDecimal128OrNull`](#todecimal128ornull).
- [`toDecimal128OrDefault`](#todecimal128ordefault).
## toDecimal128OrNull {#todecimal128ornull}

[`toDecimal128`](#todecimal128)와 같이, 이 함수는 입력 값을 [Nullable(Decimal(38, S))](../data-types/decimal.md) 유형의 값으로 변환하지만, 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toDecimal128OrNull(expr, S)
```

**인수**

- `expr` — 숫자의 문자열 표현. [String](../data-types/string.md).
- `S` — 0과 38 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 문자열 표현.
- Float32/64 유형의 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal128OrNull('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal128`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 오류가 발생합니다.
:::

**반환 값**

- 성공적으로 변환되면 `Nullable(Decimal(38, S))` 유형의 값, 그렇지 않으면 동일한 유형의 값 `NULL`. [Decimal128(S)](../data-types/decimal.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal128OrNull(toString(1/42), 38) AS a,
    toTypeName(a),
    toDecimal128OrNull(toString('Inf'), 38) AS b,
    toTypeName(b)
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Nullable(Decimal(38, 38))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(38, 38))
```

**참조**

- [`toDecimal128`](#todecimal128).
- [`toDecimal128OrZero`](#todecimal128orzero).
- [`toDecimal128OrDefault`](#todecimal128ordefault).
## toDecimal128OrDefault {#todecimal128ordefault}

[`toDecimal128`](#todecimal128)와 같이, 이 함수는 입력 값을 [Decimal(38, S)](../data-types/decimal.md) 유형으로 변환하지만, 오류가 발생할 경우 기본 값을 반환합니다.

**구문**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**인수**

- `expr` — 숫자의 문자열 표현. [String](../data-types/string.md).
- `S` — 0과 38 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).
- `default` (선택사항) — `Decimal128(S)`로 변환하는 데 실패할 경우 반환할 기본 값. [Decimal128(S)](../data-types/decimal.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 문자열 표현.
- Float32/64 유형의 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal128OrDefault('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal128`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 오류가 발생합니다.
:::

:::warning
변환 시 추가 자릿수가 삭제되며, Float32/Float64 입력과 작업할 때 예상치 못한 방식으로 작동할 수 있습니다. 이 작업은 부동 소수점 명령어를 사용하여 수행됩니다.
예를 들어: `toDecimal128OrDefault(1.15, 2)`는 `1.14`와 같습니다. 왜냐하면 부동 소수점에서 1.15 * 100은 114.99이기 때문입니다.
문자열 입력을 사용하여 작업이 기본 정수 유형을 사용하도록 할 수 있습니다: `toDecimal128OrDefault('1.15', 2) = 1.15`
:::

**반환 값**

- 성공적으로 변환되면 `Decimal(38, S)` 유형의 값, 그렇지 않으면 제공된 경우 기본 값을 반환하거나 그렇지 않으면 `0`을 반환합니다. [Decimal128(S)](../data-types/decimal.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal128OrDefault(toString(1/42), 18) AS a,
    toTypeName(a),
    toDecimal128OrDefault('Inf', 0, CAST('-1', 'Decimal128(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(38, 18)
b:             -1
toTypeName(b): Decimal(38, 0)
```

**참조**

- [`toDecimal128`](#todecimal128).
- [`toDecimal128OrZero`](#todecimal128orzero).
- [`toDecimal128OrNull`](#todecimal128ornull).
## toDecimal256 {#todecimal256}

입력 값을 [`Decimal(76, S)`](../data-types/decimal.md) 유형으로 변환합니다. 오류가 발생할 경우 예외를 발생시킵니다.

**구문**

```sql
toDecimal256(expr, S)
```

**인수**

- `expr` — 숫자 또는 숫자의 문자열 표현을 반환하는 표현식. [Expression](/sql-reference/syntax#expressions).
- `S` — 0과 76 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 값이나 문자열 표현.
- Float32/64 유형의 값이나 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현(대소문자 구분하지 않음).
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal256('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal256`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 예외가 발생합니다.
:::

:::warning
변환 시 추가 자릿수가 삭제되며, Float32/Float64 입력과 작업할 때 예상치 못한 방식으로 작동할 수 있습니다. 이 작업은 부동 소수점 명령어를 사용하여 수행됩니다.
예를 들어: `toDecimal256(1.15, 2)`는 `1.14`와 같습니다. 왜냐하면 부동 소수점에서 1.15 * 100은 114.99이기 때문입니다.
문자열 입력을 사용하여 작업이 기본 정수 유형을 사용하도록 할 수 있습니다: `toDecimal256('1.15', 2) = 1.15`
:::

**반환 값**

- `Decimal(76, S)` 유형의 값. [Decimal256(S)](../data-types/int-uint.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal256(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal256(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal256('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:      99
type_a: Decimal(76, 1)
b:      99.67
type_b: Decimal(76, 2)
c:      99.67
type_c: Decimal(76, 3)
```

**참조**

- [`toDecimal256OrZero`](#todecimal256orzero).
- [`toDecimal256OrNull`](#todecimal256ornull).
- [`toDecimal256OrDefault`](#todecimal256ordefault).
## toDecimal256OrZero {#todecimal256orzero}

[`toDecimal256`](#todecimal256)와 같이, 이 함수는 입력 값을 [Decimal(76, S)](../data-types/decimal.md) 유형으로 변환하지만, 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toDecimal256OrZero(expr, S)
```

**인수**

- `expr` — 숫자의 문자열 표현. [String](../data-types/string.md).
- `S` — 0과 76 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 문자열 표현.
- Float32/64 유형의 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal256OrZero('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal256`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 오류가 발생합니다.
:::

**반환 값**

- 성공적으로 변환되면 `Decimal(76, S)` 유형의 값, 그렇지 않으면 `0`과 `S` 소수 자릿수를 가진 값. [Decimal256(S)](../data-types/decimal.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal256OrZero(toString(0.0001), 76) AS a,
    toTypeName(a),
    toDecimal256OrZero(toString('Inf'), 76) AS b,
    toTypeName(b)
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(76, 76)
b:             0
toTypeName(b): Decimal(76, 76)
```

**참조**

- [`toDecimal256`](#todecimal256).
- [`toDecimal256OrNull`](#todecimal256ornull).
- [`toDecimal256OrDefault`](#todecimal256ordefault).
## toDecimal256OrNull {#todecimal256ornull}

[`toDecimal256`](#todecimal256)와 같이, 이 함수는 입력 값을 [Nullable(Decimal(76, S))](../data-types/decimal.md) 유형의 값으로 변환하지만, 오류가 발생할 경우 `0`을 반환합니다.

**구문**

```sql
toDecimal256OrNull(expr, S)
```

**인수**

- `expr` — 숫자의 문자열 표현. [String](../data-types/string.md).
- `S` — 0과 76 사이의 스케일 매개변수로, 숫자의 소수 부분이 가질 수 있는 자리수를 지정합니다. [UInt8](../data-types/int-uint.md).

지원되는 인수:
- (U)Int8/16/32/64/128/256 유형의 문자열 표현.
- Float32/64 유형의 문자열 표현.

지원되지 않는 인수:
- Float32/64 값 `NaN` 및 `Inf`의 문자열 표현.
- 이진 및 16진수 값의 문자열 표현, 예: `SELECT toDecimal256OrNull('0xc0fe', 1);`.

:::note
`expr`의 값이 `Decimal256`의 경계를 초과할 경우 오버플로우가 발생할 수 있습니다: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
소수의 자릿수가 과도하면 버려집니다(반올림되지 않음).
정수 부분의 자릿수가 과도하면 오류가 발생합니다.
:::

**반환 값**

- 성공적으로 변환되면 `Nullable(Decimal(76, S))` 유형의 값, 그렇지 않으면 동일한 유형의 값 `NULL`. [Decimal256(S)](../data-types/decimal.md).

**예시**

쿼리:

```sql
SELECT
    toDecimal256OrNull(toString(1/42), 76) AS a,
    toTypeName(a),
    toDecimal256OrNull(toString('Inf'), 76) AS b,
    toTypeName(b)
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Nullable(Decimal(76, 76))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(76, 76))
```

**참조**

- [`toDecimal256`](#todecimal256).
- [`toDecimal256OrZero`](#todecimal256orzero).
- [`toDecimal256OrDefault`](#todecimal256ordefault).
## toDecimal256OrDefault {#todecimal256ordefault}

Like [`toDecimal256`](#todecimal256), this function converts an input value to a value of type [Decimal(76, S)](../data-types/decimal.md) but returns the default value in case of an error.

**Syntax**

```sql
toDecimal256OrDefault(expr, S[, default])
```

**Arguments**

- `expr` — A String representation of a number. [String](../data-types/string.md).
- `S` — Scale parameter between 0 and 76, specifying how many digits the fractional part of a number can have. [UInt8](../data-types/int-uint.md).
- `default` (optional) — The default value to return if parsing to type `Decimal256(S)` is unsuccessful. [Decimal256(S)](../data-types/decimal.md).

Supported arguments:
- String representations of type (U)Int8/16/32/64/128/256.
- String representations of type Float32/64.

Unsupported arguments:
- String representations of Float32/64 values `NaN` and `Inf`.
- String representations of binary and hexadecimal values, e.g. `SELECT toDecimal256OrDefault('0xc0fe', 1);`.

:::note
An overflow can occur if the value of `expr` exceeds the bounds of `Decimal256`: `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`.
Excessive digits in a fraction are discarded (not rounded).
Excessive digits in the integer part will lead to an error.
:::

:::warning
Conversions drop extra digits and could operate in an unexpected way when working with Float32/Float64 inputs as the operations are performed using floating point instructions.
For example: `toDecimal256OrDefault(1.15, 2)` is equal to `1.14` because 1.15 * 100 in floating point is 114.99.
You can use a String input so the operations use the underlying integer type: `toDecimal256OrDefault('1.15', 2) = 1.15`
:::

**Returned value**

- Value of type `Decimal(76, S)` if successful, otherwise returns the default value if passed or `0` if not. [Decimal256(S)](../data-types/decimal.md).

**Examples**

Query:

```sql
SELECT
    toDecimal256OrDefault(toString(1/42), 76) AS a,
    toTypeName(a),
    toDecimal256OrDefault('Inf', 0, CAST('-1', 'Decimal256(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

Result:

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(76, 76)
b:             -1
toTypeName(b): Decimal(76, 0)
```

**See also**

- [`toDecimal256`](#todecimal256).
- [`toDecimal256OrZero`](#todecimal256orzero).
- [`toDecimal256OrNull`](#todecimal256ornull).
## toString {#tostring}

Converts values to their string representation.
For DateTime arguments, the function can take a second String argument containing the name of the time zone.

**Syntax**

```sql
toString(value[, timezone])
```

**Arguments**
- `value`: Value to convert to string. [`Any`](/sql-reference/data-types).
- `timezone`: Optional. Timezone name for `DateTime` conversion. [`String`](/sql-reference/data-types/string).

**Returned value**
- Returns a string representation of the input value. [`String`](/sql-reference/data-types/string).

**Examples**

**Usage example**

```sql title="Query"
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10;
```

```response title="Response"
┌──────────────────ts─┬─time_zone─────────┬─str_tz_datetime─────┐
│ 2023-09-08 19:14:59 │ Europe/Amsterdam  │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Andorra    │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Astrakhan  │ 2023-09-08 23:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Athens     │ 2023-09-08 22:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belfast    │ 2023-09-08 20:14:59 │
└─────────────────────┴───────────────────┴─────────────────────┘
```
## toFixedString {#tofixedstring}

Converts a [String](../data-types/string.md) type argument to a [FixedString(N)](../data-types/fixedstring.md) type (a string of fixed length N).
If the string has fewer bytes than N, it is padded with null bytes to the right. If the string has more bytes than N, an exception is thrown.

**Syntax**

```sql
toFixedString(s, N)
```

**Arguments**

- `s` — A String to convert to a fixed string. [String](../data-types/string.md).
- `N` — Length N. [UInt8](../data-types/int-uint.md)

**Returned value**

- An N length fixed string of `s`. [FixedString](../data-types/fixedstring.md).

**Example**

Query:

```sql
SELECT toFixedString('foo', 8) AS s;
```

Result:

```response
┌─s─────────────┐
│ foo\0\0\0\0\0 │
└───────────────┘
```
## toStringCutToZero {#tostringcuttozero}

Accepts a String or FixedString argument. Returns the String with the content truncated at the first zero byte found.

**Syntax**

```sql
toStringCutToZero(s)
```

**Example**

Query:

```sql
SELECT toFixedString('foo', 8) AS s, toStringCutToZero(s) AS s_cut;
```

Result:

```response
┌─s─────────────┬─s_cut─┐
│ foo\0\0\0\0\0 │ foo   │
└───────────────┴───────┘
```

Query:

```sql
SELECT toFixedString('foo\0bar', 8) AS s, toStringCutToZero(s) AS s_cut;
```

Result:

```response
┌─s──────────┬─s_cut─┐
│ foo\0bar\0 │ foo   │
└────────────┴───────┘
```
## toDecimalString {#todecimalstring}

Converts a numeric value to String with the number of fractional digits in the output specified by the user.

**Syntax**

```sql
toDecimalString(number, scale)
```

**Arguments**

- `number` — Value to be represented as String, [Int, UInt](../data-types/int-uint.md), [Float](../data-types/float.md), [Decimal](../data-types/decimal.md),
- `scale` — Number of fractional digits, [UInt8](../data-types/int-uint.md).
  * Maximum scale for [Decimal](../data-types/decimal.md) and [Int, UInt](../data-types/int-uint.md) types is 77 (it is the maximum possible number of significant digits for Decimal),
  * Maximum scale for [Float](../data-types/float.md) is 60.

**Returned value**

- Input value represented as [String](../data-types/string.md) with given number of fractional digits (scale).
    The number is rounded up or down according to common arithmetic in case requested scale is smaller than original number's scale.

**Example**

Query:

```sql
SELECT toDecimalString(CAST('64.32', 'Float64'), 5);
```

Result:

```response
┌toDecimalString(CAST('64.32', 'Float64'), 5)─┐
│ 64.32000                                    │
└─────────────────────────────────────────────┘
```
## reinterpretAsUInt8 {#reinterpretasuint8}

Performs byte reinterpretation by treating the input value as a value of type UInt8. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsUInt8(x)
```

**Parameters**

- `x`: value to byte reinterpret as UInt8. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as UInt8. [UInt8](/sql-reference/data-types/int-uint).

**Example**

Query:

```sql
SELECT
    toInt8(257) AS x,
    toTypeName(x),
    reinterpretAsUInt8(x) AS res,
    toTypeName(res);
```

Result:

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ Int8          │   1 │ UInt8           │
└───┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsUInt16 {#reinterpretasuint16}

Performs byte reinterpretation by treating the input value as a value of type UInt16. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsUInt16(x)
```

**Parameters**

- `x`: value to byte reinterpret as UInt16. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as UInt16. [UInt16](/sql-reference/data-types/int-uint).

**Example**

Query:

```sql
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsUInt16(x) AS res,
    toTypeName(res);
```

Result:

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ UInt16          │
└───┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsUInt32 {#reinterpretasuint32}

Performs byte reinterpretation by treating the input value as a value of type UInt32. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsUInt32(x)
```

**Parameters**

- `x`: value to byte reinterpret as UInt32. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as UInt32. [UInt32](/sql-reference/data-types/int-uint).

**Example**

Query:

```sql
SELECT
    toUInt16(257) AS x,
    toTypeName(x),
    reinterpretAsUInt32(x) AS res,
    toTypeName(res)
```

Result:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt16        │ 257 │ UInt32          │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsUInt64 {#reinterpretasuint64}

Performs byte reinterpretation by treating the input value as a value of type UInt64. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsUInt64(x)
```

**Parameters**

- `x`: value to byte reinterpret as UInt64. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as UInt64. [UInt64](/sql-reference/data-types/int-uint).

**Example**

Query:

```sql
SELECT
    toUInt32(257) AS x,
    toTypeName(x),
    reinterpretAsUInt64(x) AS res,
    toTypeName(res)
```

Result:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt32        │ 257 │ UInt64          │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsUInt128 {#reinterpretasuint128}

Performs byte reinterpretation by treating the input value as a value of type UInt128. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsUInt128(x)
```

**Parameters**

- `x`: value to byte reinterpret as UInt128. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as UInt128. [UInt128](/sql-reference/data-types/int-uint).

**Example**

Query:

```sql
SELECT
    toUInt64(257) AS x,
    toTypeName(x),
    reinterpretAsUInt128(x) AS res,
    toTypeName(res)
```

Result:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt64        │ 257 │ UInt128         │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsUInt256 {#reinterpretasuint256}

Performs byte reinterpretation by treating the input value as a value of type UInt256. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsUInt256(x)
```

**Parameters**

- `x`: value to byte reinterpret as UInt256. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as UInt256. [UInt256](/sql-reference/data-types/int-uint).

**Example**

Query:

```sql
SELECT
    toUInt128(257) AS x,
    toTypeName(x),
    reinterpretAsUInt256(x) AS res,
    toTypeName(res)
```

Result:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt128       │ 257 │ UInt256         │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsInt8 {#reinterpretasint8}

Performs byte reinterpretation by treating the input value as a value of type Int8. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsInt8(x)
```

**Parameters**

- `x`: value to byte reinterpret as Int8. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as Int8. [Int8](/sql-reference/data-types/int-uint#integer-ranges).

**Example**

Query:

```sql
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt8(x) AS res,
    toTypeName(res);
```

Result:

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ Int8            │
└───┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsInt16 {#reinterpretasint16}

Performs byte reinterpretation by treating the input value as a value of type Int16. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsInt16(x)
```

**Parameters**

- `x`: value to byte reinterpret as Int16. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as Int16. [Int16](/sql-reference/data-types/int-uint#integer-ranges).

**Example**

Query:

```sql
SELECT
    toInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt16(x) AS res,
    toTypeName(res);
```

Result:

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ Int8          │   1 │ Int16           │
└───┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsInt32 {#reinterpretasint32}

Performs byte reinterpretation by treating the input value as a value of type Int32. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsInt32(x)
```

**Parameters**

- `x`: value to byte reinterpret as Int32. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as Int32. [Int32](/sql-reference/data-types/int-uint#integer-ranges).

**Example**

Query:

```sql
SELECT
    toInt16(257) AS x,
    toTypeName(x),
    reinterpretAsInt32(x) AS res,
    toTypeName(res);
```

Result:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int16         │ 257 │ Int32           │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsInt64 {#reinterpretasint64}

Performs byte reinterpretation by treating the input value as a value of type Int64. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsInt64(x)
```

**Parameters**

- `x`: value to byte reinterpret as Int64. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as Int64. [Int64](/sql-reference/data-types/int-uint#integer-ranges).

**Example**

Query:

```sql
SELECT
    toInt32(257) AS x,
    toTypeName(x),
    reinterpretAsInt64(x) AS res,
    toTypeName(res);
```

Result:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int32         │ 257 │ Int64           │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsInt128 {#reinterpretasint128}

Performs byte reinterpretation by treating the input value as a value of type Int128. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsInt128(x)
```

**Parameters**

- `x`: value to byte reinterpret as Int128. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as Int128. [Int128](/sql-reference/data-types/int-uint#integer-ranges).

**Example**

Query:

```sql
SELECT
    toInt64(257) AS x,
    toTypeName(x),
    reinterpretAsInt128(x) AS res,
    toTypeName(res);
```

Result:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int64         │ 257 │ Int128          │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsInt256 {#reinterpretasint256}

Performs byte reinterpretation by treating the input value as a value of type Int256. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsInt256(x)
```

**Parameters**

- `x`: value to byte reinterpret as Int256. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as Int256. [Int256](/sql-reference/data-types/int-uint#integer-ranges).

**Example**

Query:

```sql
SELECT
    toInt128(257) AS x,
    toTypeName(x),
    reinterpretAsInt256(x) AS res,
    toTypeName(res);
```

Result:

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int128        │ 257 │ Int256          │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsFloat32 {#reinterpretasfloat32}

Performs byte reinterpretation by treating the input value as a value of type Float32. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsFloat32(x)
```

**Parameters**

- `x`: value to reinterpret as Float32. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as Float32. [Float32](../data-types/float.md).

**Example**

Query:

```sql
SELECT reinterpretAsUInt32(toFloat32(0.2)) AS x, reinterpretAsFloat32(x);
```

Result:

```response
┌──────────x─┬─reinterpretAsFloat32(x)─┐
│ 1045220557 │                     0.2 │
└────────────┴─────────────────────────┘
```
## reinterpretAsFloat64 {#reinterpretasfloat64}

Performs byte reinterpretation by treating the input value as a value of type Float64. Unlike [`CAST`](#cast), the function does not attempt to preserve the original value - if the target type is not able to represent the input type, the output is meaningless.

**Syntax**

```sql
reinterpretAsFloat64(x)
```

**Parameters**

- `x`: value to reinterpret as Float64. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Reinterpreted value `x` as Float64. [Float64](../data-types/float.md).

**Example**

Query:

```sql
SELECT reinterpretAsUInt64(toFloat64(0.2)) AS x, reinterpretAsFloat64(x);
```

Result:

```response
┌───────────────────x─┬─reinterpretAsFloat64(x)─┐
│ 4596373779694328218 │                     0.2 │
└─────────────────────┴─────────────────────────┘
```
## reinterpretAsDate {#reinterpretasdate}

Accepts a string, fixed string or numeric value and interprets the bytes as a number in host order (little endian). It returns a date from the interpreted number as the number of days since the beginning of the Unix Epoch.

**Syntax**

```sql
reinterpretAsDate(x)
```

**Parameters**

- `x`: number of days since the beginning of the Unix Epoch. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Date. [Date](../data-types/date.md).

**Implementation details**

:::note
If the provided string isn't long enough, the function works as if the string is padded with the necessary number of null bytes. If the string is longer than needed, the extra bytes are ignored.
:::

**Example**

Query:

```sql
SELECT reinterpretAsDate(65), reinterpretAsDate('A');
```

Result:

```response
┌─reinterpretAsDate(65)─┬─reinterpretAsDate('A')─┐
│            1970-03-07 │             1970-03-07 │
└───────────────────────┴────────────────────────┘
```
## reinterpretAsDateTime {#reinterpretasdatetime}

These functions accept a string and interpret the bytes placed at the beginning of the string as a number in host order (little endian). Returns a date with time interpreted as the number of seconds since the beginning of the Unix Epoch.

**Syntax**

```sql
reinterpretAsDateTime(x)
```

**Parameters**

- `x`: number of seconds since the beginning of the Unix Epoch. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

**Returned value**

- Date and Time. [DateTime](../data-types/datetime.md).

**Implementation details**

:::note
If the provided string isn't long enough, the function works as if the string is padded with the necessary number of null bytes. If the string is longer than needed, the extra bytes are ignored.
:::

**Example**

Query:

```sql
SELECT reinterpretAsDateTime(65), reinterpretAsDateTime('A');
```

Result:

```response
┌─reinterpretAsDateTime(65)─┬─reinterpretAsDateTime('A')─┐
│       1970-01-01 01:01:05 │        1970-01-01 01:01:05 │
└───────────────────────────┴────────────────────────────┘
```
## reinterpretAsString {#reinterpretasstring}

This function accepts a number, date or date with time and returns a string containing bytes representing the corresponding value in host order (little endian). Null bytes are dropped from the end. For example, a UInt32 type value of 255 is a string that is one byte long.

**Syntax**

```sql
reinterpretAsString(x)
```

**Parameters**

- `x`: value to reinterpret to string. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md).

**Returned value**

- String containing bytes representing `x`. [String](../data-types/fixedstring.md).

**Example**

Query:

```sql
SELECT
    reinterpretAsString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsString(toDate('1970-03-07'));
```

Result:

```response
┌─reinterpretAsString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsString(toDate('1970-03-07'))─┐
│ A                                                      │ A                                         │
└────────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```
## reinterpretAsFixedString {#reinterpretasfixedstring}

This function accepts a number, date or date with time and returns a FixedString containing bytes representing the corresponding value in host order (little endian). Null bytes are dropped from the end. For example, a UInt32 type value of 255 is a FixedString that is one byte long.

**Syntax**

```sql
reinterpretAsFixedString(x)
```

**Parameters**

- `x`: value to reinterpret to string. [(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md).

**Returned value**

- Fixed string containing bytes representing `x`. [FixedString](../data-types/fixedstring.md).

**Example**

Query:

```sql
SELECT
    reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsFixedString(toDate('1970-03-07'));
```

Result:

```response
┌─reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsFixedString(toDate('1970-03-07'))─┐
│ A                                                           │ A                                              │
└─────────────────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```
## reinterpretAsUUID {#reinterpretasuuid}

:::note
In addition to the UUID functions listed here, there is dedicated [UUID function documentation](../functions/uuid-functions.md).
:::

Accepts a 16 byte string and returns a UUID by interpreting each 8-byte half in little-endian byte order. If the string isn't long enough, the function works as if the string is padded with the necessary number of null bytes to the end. If the string is longer than 16 bytes, the extra bytes at the end are ignored.

**Syntax**

```sql
reinterpretAsUUID(fixed_string)
```

**Arguments**

- `fixed_string` — Big-endian byte string. [FixedString](/sql-reference/data-types/fixedstring).

**Returned value**

- The UUID type value. [UUID](/sql-reference/data-types/uuid).

**Examples**

String to UUID.

Query:

```sql
SELECT reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')));
```

Result:

```response
┌─reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')))─┐
│                                  08090a0b-0c0d-0e0f-0001-020304050607 │
└───────────────────────────────────────────────────────────────────────┘
```

Going back and forth from String to UUID.

Query:

```sql
WITH
    generateUUIDv4() AS uuid,
    identity(lower(hex(reverse(reinterpretAsString(uuid))))) AS str,
    reinterpretAsUUID(reverse(unhex(str))) AS uuid2
SELECT uuid = uuid2;
```

Result:

```response
┌─equals(uuid, uuid2)─┐
│                   1 │
└─────────────────────┘
```
## reinterpret {#reinterpret}

Uses the same source in-memory bytes sequence for `x` value and reinterprets it to destination type.

**Syntax**

```sql
reinterpret(x, type)
```

**Arguments**

- `x` — Any type.
- `type` — Destination type. If it is an array, then the array element type must be a fixed length type.

**Returned value**

- Destination type value.

**Examples**

Query:
```sql
SELECT reinterpret(toInt8(-1), 'UInt8') AS int_to_uint,
    reinterpret(toInt8(1), 'Float32') AS int_to_float,
    reinterpret('1', 'UInt32') AS string_to_int;
```

Result:

```text
┌─int_to_uint─┬─int_to_float─┬─string_to_int─┐
│         255 │        1e-45 │            49 │
└─────────────┴──────────────┴───────────────┘
```

Query:
```sql
SELECT reinterpret(x'3108b4403108d4403108b4403108d440', 'Array(Float32)') AS string_to_array_of_Float32;
```

Result:

```text
┌─string_to_array_of_Float32─┐
│ [5.626,6.626,5.626,6.626]  │
└────────────────────────────┘
```
## CAST {#cast}

Converts an input value to the specified data type. Unlike the [reinterpret](#reinterpret) function, `CAST` tries to present the same value using the new data type. If the conversion can not be done then an exception is raised.
Several syntax variants are supported.

**Syntax**

```sql
CAST(x, T)
CAST(x AS t)
x::t
```

**Arguments**

- `x` — A value to convert. May be of any type.
- `T` — The name of the target data type. [String](../data-types/string.md).
- `t` — The target data type.

**Returned value**

- Converted value.

:::note
If the input value does not fit the bounds of the target type, the result overflows. For example, `CAST(-1, 'UInt8')` returns `255`.
:::

**Examples**

Query:

```sql
SELECT
    CAST(toInt8(-1), 'UInt8') AS cast_int_to_uint,
    CAST(1.5 AS Decimal(3,2)) AS cast_float_to_decimal,
    '1'::Int32 AS cast_string_to_int;
```

Result:

```yaml
┌─cast_int_to_uint─┬─cast_float_to_decimal─┬─cast_string_to_int─┐
│              255 │                  1.50 │                  1 │
└──────────────────┴───────────────────────┴────────────────────┘
```

Query:

```sql
SELECT
    '2016-06-15 23:00:00' AS timestamp,
    CAST(timestamp AS DateTime) AS datetime,
    CAST(timestamp AS Date) AS date,
    CAST(timestamp, 'String') AS string,
    CAST(timestamp, 'FixedString(22)') AS fixed_string;
```

Result:

```response
┌─timestamp───────────┬────────────datetime─┬───────date─┬─string──────────────┬─fixed_string──────────────┐
│ 2016-06-15 23:00:00 │ 2016-06-15 23:00:00 │ 2016-06-15 │ 2016-06-15 23:00:00 │ 2016-06-15 23:00:00\0\0\0 │
└─────────────────────┴─────────────────────┴────────────┴─────────────────────┴───────────────────────────┘
```

Conversion to [FixedString (N)](../data-types/fixedstring.md) only works for arguments of type [String](../data-types/string.md) or [FixedString](../data-types/fixedstring.md).

Type conversion to [Nullable](../data-types/nullable.md) and back is supported.

**Example**

Query:

```sql
SELECT toTypeName(x) FROM t_null;
```

Result:

```response
┌─toTypeName(x)─┐
│ Int8          │
│ Int8          │
└───────────────┘
```

Query:

```sql
SELECT toTypeName(CAST(x, 'Nullable(UInt16)')) FROM t_null;
```

Result:

```response
┌─toTypeName(CAST(x, 'Nullable(UInt16)'))─┐
│ Nullable(UInt16)                        │
│ Nullable(UInt16)                        │
└─────────────────────────────────────────┘
```

**See also**

- [cast_keep_nullable](../../operations/settings/settings.md/#cast_keep_nullable) setting
## accurateCast(x, T) {#accuratecastx-t}

Converts `x` to the `T` data type.

The difference from [cast](#cast) is that `accurateCast` does not allow overflow of numeric types during cast if type value `x` does not fit the bounds of type `T`. For example, `accurateCast(-1, 'UInt8')` throws an exception.

**Example**

Query:

```sql
SELECT cast(-1, 'UInt8') AS uint8;
```

Result:

```response
┌─uint8─┐
│   255 │
└───────┘
```

Query:

```sql
SELECT accurateCast(-1, 'UInt8') AS uint8;
```

Result:

```response
Code: 70. DB::Exception: Received from localhost:9000. DB::Exception: Value in column Int8 cannot be safely converted into type UInt8: While processing accurateCast(-1, 'UInt8') AS uint8.
```
## accurateCastOrNull(x, T) {#accuratecastornullx-t}

Converts input value `x` to the specified data type `T`. Always returns [Nullable](../data-types/nullable.md) type and returns [NULL](/sql-reference/syntax#null) if the cast value is not representable in the target type.

**Syntax**

```sql
accurateCastOrNull(x, T)
```

**Arguments**

- `x` — Input value.
- `T` — The name of the returned data type.

**Returned value**

- The value, converted to the specified data type `T`.

**Example**

Query:

```sql
SELECT toTypeName(accurateCastOrNull(5, 'UInt8'));
```

Result:

```response
┌─toTypeName(accurateCastOrNull(5, 'UInt8'))─┐
│ Nullable(UInt8)                            │
└────────────────────────────────────────────┘
```

Query:

```sql
SELECT
    accurateCastOrNull(-1, 'UInt8') AS uint8,
    accurateCastOrNull(128, 'Int8') AS int8,
    accurateCastOrNull('Test', 'FixedString(2)') AS fixed_string;
```

Result:

```response
┌─uint8─┬─int8─┬─fixed_string─┐
│  ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │
└───────┴──────┴──────────────┘
```
## accurateCastOrDefault(x, T[, default_value]) {#accuratecastordefaultx-t-default_value}

Converts input value `x` to the specified data type `T`. Returns default type value or `default_value` if specified if the cast value is not representable in the target type.

**Syntax**

```sql
accurateCastOrDefault(x, T)
```

**Arguments**

- `x` — Input value.
- `T` — The name of the returned data type.
- `default_value` — Default value of returned data type.

**Returned value**

- The value converted to the specified data type `T`.

**Example**

Query:

```sql
SELECT toTypeName(accurateCastOrDefault(5, 'UInt8'));
```

Result:

```response
┌─toTypeName(accurateCastOrDefault(5, 'UInt8'))─┐
│ UInt8                                         │
└───────────────────────────────────────────────┘
```

Query:

```sql
SELECT
    accurateCastOrDefault(-1, 'UInt8') AS uint8,
    accurateCastOrDefault(-1, 'UInt8', 5) AS uint8_default,
    accurateCastOrDefault(128, 'Int8') AS int8,
    accurateCastOrDefault(128, 'Int8', 5) AS int8_default,
    accurateCastOrDefault('Test', 'FixedString(2)') AS fixed_string,
    accurateCastOrDefault('Test', 'FixedString(2)', 'Te') AS fixed_string_default;
```

Result:

```response
┌─uint8─┬─uint8_default─┬─int8─┬─int8_default─┬─fixed_string─┬─fixed_string_default─┐
│     0 │             5 │    0 │            5 │              │ Te                   │
└───────┴───────────────┴──────┴──────────────┴──────────────┴──────────────────────┘
```
## toInterval {#toInterval}

Creates an [Interval](../../sql-reference/data-types/special-data-types/interval.md) data type value from a numeric value and interval unit (eg. 'second' or 'day').

**Syntax**

```sql
toInterval(value, unit)
```

**Arguments**

- `value` — Length of the interval. Integer numbers or string representations thereof, and float numbers. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

- `unit` — The type of interval to create. [String Literal](/sql-reference/syntax#string).
    Possible values:

  - `nanosecond`
  - `microsecond`
  - `millisecond`
  - `second`
  - `minute`
  - `hour`
  - `day`
  - `week`
  - `month`
  - `quarter`
  - `year`

  The `unit` argument is case-insensitive.

**Returned value**

- The resulting interval. [Interval](../../sql-reference/data-types/special-data-types/interval.md)

**Example**

```sql
SELECT toDateTime('2025-01-01 00:00:00') + toInterval(1, 'hour')
```

```response
┌─toDateTime('2025-01-01 00:00:00') + toInterval(1, 'hour') ─┐
│                                        2025-01-01 01:00:00 │
└────────────────────────────────────────────────────────────┘
```
## toIntervalYear {#tointervalyear}

Returns an interval of `n` years of data type [IntervalYear](../data-types/special-data-types/interval.md).

**Syntax**

```sql
toIntervalYear(n)
```

**Arguments**

- `n` — Number of years. Integer numbers or string representations thereof, and float numbers. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

**Returned values**

- Interval of `n` years. [IntervalYear](../data-types/special-data-types/interval.md).

**Example**

Query:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalYear(1) AS interval_to_year
SELECT date + interval_to_year AS result
```

Result:

```response
┌─────result─┐
│ 2025-06-15 │
└────────────┘
```
## toIntervalQuarter {#tointervalquarter}

Returns an interval of `n` quarters of data type [IntervalQuarter](../data-types/special-data-types/interval.md).

**Syntax**

```sql
toIntervalQuarter(n)
```

**Arguments**

- `n` — Number of quarters. Integer numbers or string representations thereof, and float numbers. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

**Returned values**

- Interval of `n` quarters. [IntervalQuarter](../data-types/special-data-types/interval.md).

**Example**

Query:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalQuarter(1) AS interval_to_quarter
SELECT date + interval_to_quarter AS result
```

Result:

```response
┌─────result─┐
│ 2024-09-15 │
└────────────┘
```
## toIntervalMonth {#tointervalmonth}

Returns an interval of `n` months of data type [IntervalMonth](../data-types/special-data-types/interval.md).

**Syntax**

```sql
toIntervalMonth(n)
```

**Arguments**

- `n` — Number of months. Integer numbers or string representations thereof, and float numbers. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

**Returned values**

- Interval of `n` months. [IntervalMonth](../data-types/special-data-types/interval.md).

**Example**

Query:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalMonth(1) AS interval_to_month
SELECT date + interval_to_month AS result
```

Result:

```response
┌─────result─┐
│ 2024-07-15 │
└────────────┘
```
## toIntervalWeek {#tointervalweek}

Returns an interval of `n` weeks of data type [IntervalWeek](../data-types/special-data-types/interval.md).

**Syntax**

```sql
toIntervalWeek(n)
```

**Arguments**

- `n` — Number of weeks. Integer numbers or string representations thereof, and float numbers. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

**Returned values**

- Interval of `n` weeks. [IntervalWeek](../data-types/special-data-types/interval.md).

**Example**

Query:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalWeek(1) AS interval_to_week
SELECT date + interval_to_week AS result
```

Result:

```response
┌─────result─┐
│ 2024-06-22 │
└────────────┘
```
## toIntervalDay {#tointervalday}

Returns an interval of `n` days of data type [IntervalDay](../data-types/special-data-types/interval.md).

**Syntax**

```sql
toIntervalDay(n)
```

**Arguments**

- `n` — Number of days. Integer numbers or string representations thereof, and float numbers. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

**Returned values**

- Interval of `n` days. [IntervalDay](../data-types/special-data-types/interval.md).

**Example**

Query:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalDay(5) AS interval_to_days
SELECT date + interval_to_days AS result
```

Result:

```response
┌─────result─┐
│ 2024-06-20 │
└────────────┘
```
## toIntervalHour {#tointervalhour}

Returns an interval of `n` hours of data type [IntervalHour](../data-types/special-data-types/interval.md).

**Syntax**

```sql
toIntervalHour(n)
```

**Arguments**

- `n` — Number of hours. Integer numbers or string representations thereof, and float numbers. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

**Returned values**

- Interval of `n` hours. [IntervalHour](../data-types/special-data-types/interval.md).

**Example**

Query:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalHour(12) AS interval_to_hours
SELECT date + interval_to_hours AS result
```

Result:

```response
┌──────────────result─┐
│ 2024-06-15 12:00:00 │
└─────────────────────┘
```
## toIntervalMinute {#tointervalminute}

Returns an interval of `n` minutes of data type [IntervalMinute](../data-types/special-data-types/interval.md).

**Syntax**

```sql
toIntervalMinute(n)
```

**Arguments**

- `n` — Number of minutes. Integer numbers or string representations thereof, and float numbers. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

**Returned values**

- Interval of `n` minutes. [IntervalMinute](../data-types/special-data-types/interval.md).

**Example**

Query:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalMinute(12) AS interval_to_minutes
SELECT date + interval_to_minutes AS result
```

Result:

```response
┌──────────────result─┐
│ 2024-06-15 00:12:00 │
└─────────────────────┘
```
## toIntervalSecond {#tointervalsecond}

Returns an interval of `n` seconds of data type [IntervalSecond](../data-types/special-data-types/interval.md).

**Syntax**

```sql
toIntervalSecond(n)
```

**Arguments**

- `n` — Number of seconds. Integer numbers or string representations thereof, and float numbers. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

**Returned values**

- Interval of `n` seconds. [IntervalSecond](../data-types/special-data-types/interval.md).

**Example**

Query:

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalSecond(30) AS interval_to_seconds
SELECT date + interval_to_seconds AS result
```

Result:

```response
┌──────────────result─┐
│ 2024-06-15 00:00:30 │
└─────────────────────┘
```
## toIntervalMillisecond {#tointervalmillisecond}

Returns an interval of `n` milliseconds of data type [IntervalMillisecond](../data-types/special-data-types/interval.md).

**Syntax**

```sql
toIntervalMillisecond(n)
```

**Arguments**

- `n` — Number of milliseconds. Integer numbers or string representations thereof, and float numbers. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

**Returned values**

- Interval of `n` milliseconds. [IntervalMilliseconds](../data-types/special-data-types/interval.md).

**Example**

Query:

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalMillisecond(30) AS interval_to_milliseconds
SELECT date + interval_to_milliseconds AS result
```

Result:

```response
┌──────────────────result─┐
│ 2024-06-15 00:00:00.030 │
└─────────────────────────┘
```
## toIntervalMicrosecond {#tointervalmicrosecond}

`n` 마이크로초의 간격을 [IntervalMicrosecond](../data-types/special-data-types/interval.md) 데이터 유형으로 반환합니다.

**구문**

```sql
toIntervalMicrosecond(n)
```

**인수**

- `n` — 마이크로초의 수. 정수 또는 문자열 표현, 그리고 부동 소수점 수. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

**반환 값**

- `n` 마이크로초의 간격. [IntervalMicrosecond](../data-types/special-data-types/interval.md).

**예시**

쿼리:

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalMicrosecond(30) AS interval_to_microseconds
SELECT date + interval_to_microseconds AS result
```

결과:

```response
┌─────────────────────result─┐
│ 2024-06-15 00:00:00.000030 │
└────────────────────────────┘
```
## toIntervalNanosecond {#tointervalnanosecond}

`n` 나노초의 간격을 [IntervalNanosecond](../data-types/special-data-types/interval.md) 데이터 유형으로 반환합니다.

**구문**

```sql
toIntervalNanosecond(n)
```

**인수**

- `n` — 나노초의 수. 정수 또는 문자열 표현, 그리고 부동 소수점 수. [(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md).

**반환 값**

- `n` 나노초의 간격. [IntervalNanosecond](../data-types/special-data-types/interval.md).

**예시**

쿼리:

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalNanosecond(30) AS interval_to_nanoseconds
SELECT date + interval_to_nanoseconds AS result
```

결과:

```response
┌────────────────────────result─┐
│ 2024-06-15 00:00:00.000000030 │
└───────────────────────────────┘
```
## parseDateTime {#parsedatetime}

[문자열](../data-types/string.md)을 [날짜 및 시간](../data-types/datetime.md)으로 변환합니다. [MySQL 형식 문자열](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)에 따라 변환됩니다.

이 기능은 함수 [formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime)의 반대 작업입니다.

**구문**

```sql
parseDateTime(str[, format[, timezone]])
```

**인수**

- `str` — 구문 분석할 문자열
- `format` — 형식 문자열. 선택 사항. 지정되지 않은 경우는 `%Y-%m-%d %H:%i:%s`입니다.
- `timezone` — [시간대](operations/server-configuration-parameters/settings.md#timezone). 선택 사항.

**반환 값**

MySQL 스타일 형식 문자열에 따라 입력 문자열에서 구문 분석된 [DateTime](../data-types/datetime.md) 값을 반환합니다.

**지원되는 형식 지정자**

다음 형식 지정자를 제외하고 [formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime)에 나열된 모든 형식 지정자:
- %Q: 분기 (1-4)

**예시**

```sql
SELECT parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')

┌─parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2021-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```

별칭: `TO_TIMESTAMP`.
## parseDateTimeOrZero {#parsedatetimeorzero}

구문 분석할 수 없는 날짜 형식을 만나면 제로 날짜를 반환한다는 점을 제외하고 [parseDateTime](#parsedatetime)과 동일합니다.
## parseDateTimeOrNull {#parsedatetimeornull}

구문 분석할 수 없는 날짜 형식을 만나면 `NULL`을 반환한다는 점을 제외하고 [parseDateTime](#parsedatetime)과 동일합니다.

별칭: `str_to_date`.
## parseDateTimeInJodaSyntax {#parsedatetimeinjodasyntax}

[parseDateTime](#parsedatetime)와 유사하지만, 형식 문자열이 MySQL 구문 대신 [Joda](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) 형식입니다.

이 기능은 함수 [formatDateTimeInJodaSyntax](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax)의 반대 작업입니다.

**구문**

```sql
parseDateTimeInJodaSyntax(str[, format[, timezone]])
```

**인수**

- `str` — 구문 분석할 문자열
- `format` — 형식 문자열. 선택 사항. 지정되지 않은 경우 `yyyy-MM-dd HH:mm:ss`입니다.
- `timezone` — [시간대](operations/server-configuration-parameters/settings.md#timezone). 선택 사항.

**반환 값**

입력 문자열에서 Joda 스타일 형식 문자열에 따라 구문 분석된 [DateTime](../data-types/datetime.md) 값을 반환합니다.

**지원되는 형식 지정자**

[`formatDateTimeInJodaSyntax`](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax)에 나열된 모든 형식 지정자 지원, 단 다음은 제외:
- S: 초의 분수
- z: 시간대
- Z: 시간대 오프셋/ID

**예시**

```sql
SELECT parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')

┌─parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')─┐
│                                                                     2023-02-24 14:53:31 │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```
## parseDateTimeInJodaSyntaxOrZero {#parsedatetimeinjodasyntaxorzero}

구문 분석할 수 없는 날짜 형식을 만나면 제로 날짜를 반환한다는 점을 제외하고 [parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax)와 동일합니다.
## parseDateTimeInJodaSyntaxOrNull {#parsedatetimeinjodasyntaxornull}

구문 분석할 수 없는 날짜 형식을 만나면 `NULL`을 반환한다는 점을 제외하고 [parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax)와 동일합니다.
## parseDateTime64 {#parsedatetime64}

[문자열](../data-types/string.md)을 [DateTime64](../data-types/datetime64.md)로 변환합니다. [MySQL 형식 문자열](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)에 따라 처리됩니다.

**구문**

```sql
parseDateTime64(str[, format[, timezone]])
```

**인수**

- `str` — 구문 분석할 문자열.
- `format` — 형식 문자열. 선택 사항. 지정되지 않은 경우 `%Y-%m-%d %H:%i:%s.%f`입니다.
- `timezone` — [시간대](/operations/server-configuration-parameters/settings.md#timezone). 선택 사항.

**반환 값**

입력 문자열에서 MySQL 스타일 형식 문자열에 따라 구문 분석된 [DateTime64](../data-types/datetime64.md) 값을 반환합니다.
반환된 값의 정밀도는 6입니다.
## parseDateTime64OrZero {#parsedatetime64orzero}

구문 분석할 수 없는 날짜 형식을 만나면 제로 날짜를 반환한다는 점을 제외하고 [parseDateTime64](#parsedatetime64)와 동일합니다.
## parseDateTime64OrNull {#parsedatetime64ornull}

구문 분석할 수 없는 날짜 형식을 만나면 `NULL`을 반환한다는 점을 제외하고 [parseDateTime64](#parsedatetime64)와 동일합니다.
## parseDateTime64InJodaSyntax {#parsedatetime64injodasyntax}

[문자열](../data-types/string.md)을 [DateTime64](../data-types/datetime64.md)로 변환합니다. [Joda 형식 문자열](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)에 따라 처리됩니다.

**구문**

```sql
parseDateTime64InJodaSyntax(str[, format[, timezone]])
```

**인수**

- `str` — 구문 분석할 문자열.
- `format` — 형식 문자열. 선택 사항. 지정되지 않은 경우 `yyyy-MM-dd HH:mm:ss`입니다.
- `timezone` — [시간대](/operations/server-configuration-parameters/settings.md#timezone). 선택 사항.

**반환 값**

입력 문자열에서 Joda 스타일 형식 문자열에 따라 구문 분석된 [DateTime64](../data-types/datetime64.md) 값을 반환합니다.
반환된 값의 정밀도는 형식 문자열에 있는 `S` 자리 수의 수와 같습니다(최대 6자리).
## parseDateTime64InJodaSyntaxOrZero {#parsedatetime64injodasyntaxorzero}

구문 분석할 수 없는 날짜 형식을 만나면 제로 날짜를 반환한다는 점을 제외하고 [parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax)와 동일합니다.
## parseDateTime64InJodaSyntaxOrNull {#parsedatetime64injodasyntaxornull}

구문 분석할 수 없는 날짜 형식을 만나면 `NULL`을 반환한다는 점을 제외하고 [parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax)와 동일합니다.
## parseDateTimeBestEffort {#parsedatetimebesteffort}
## parseDateTime32BestEffort {#parsedatetime32besteffort}

[문자열](../data-types/string.md) 형식의 날짜 및 시간을 [DateTime](/sql-reference/data-types/datetime) 데이터 유형으로 변환합니다.

이 함수는 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601), [RFC 1123 - 5.2.14 RFC-822 날짜 및 시간 사양](https://tools.ietf.org/html/rfc1123#page-55), ClickHouse의 및 기타 날짜 및 시간 형식을 구문 분석합니다.

**구문**

```sql
parseDateTimeBestEffort(time_string [, time_zone])
```

**인수**

- `time_string` — 변환할 날짜 및 시간을 포함하는 문자열. [문자열](../data-types/string.md).
- `time_zone` — 시간대. 함수는 시간대에 따라 `time_string`을 구문 분석합니다. [문자열](../data-types/string.md).

**지원되는 비표준 형식**

- 9..10 자릿수 [unix 타임스탬프](https://en.wikipedia.org/wiki/Unix_time)를 포함하는 문자열.
- 날짜 및 시간 구성 요소가 포함된 문자열: `YYYYMMDDhhmmss`, `DD/MM/YYYY hh:mm:ss`, `DD-MM-YY hh:mm`, `YYYY-MM-DD hh:mm:ss` 등.
- 날짜 구성 요소는 있지만 시간 구성 요소는 없는 문자열: `YYYY`, `YYYYMM`, `YYYY*MM`, `DD/MM/YYYY`, `DD-MM-YY` 등.
- 일 및 시간 구성 요소가 포함된 문자열: `DD`, `DD hh`, `DD hh:mm`. 이 경우 `MM`는 `01`로 대체됩니다.
- 날짜 및 시간을 포함하는 문자열: `YYYY-MM-DD hh:mm:ss ±h:mm` 등. 예를 들어, `2020-12-12 17:36:00 -5:00`.
- [syslog 타임스탬프](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2): `Mmm dd hh:mm:ss`. 예: `Jun  9 14:20:32`.

구분자가 있는 모든 형식의 경우, 함수는 월의 이름을 전체 이름 또는 월 이름의 처음 세 글자로 표현합니다. 예: `24/DEC/18`, `24-Dec-18`, `01-September-2018`.
해당 연도가 지정되지 않은 경우, 현재 연도로 간주됩니다. 만약 결과적인 DateTime이 미래에 발생할 경우(현재 순간 이후 1초라도), 현재 연도는 이전 연도로 대체됩니다.

**반환 값**

- `time_string`이 [DateTime](../data-types/datetime.md) 데이터 유형으로 변환됩니다.

**예시**

쿼리:

```sql
SELECT parseDateTimeBestEffort('23/10/2020 12:12:57')
AS parseDateTimeBestEffort;
```

결과:

```response
┌─parseDateTimeBestEffort─┐
│     2020-10-23 12:12:57 │
└─────────────────────────┘
```

쿼리:

```sql
SELECT parseDateTimeBestEffort('Sat, 18 Aug 2018 07:22:16 GMT', 'Asia/Istanbul')
AS parseDateTimeBestEffort;
```

결과:

```response
┌─parseDateTimeBestEffort─┐
│     2018-08-18 10:22:16 │
└─────────────────────────┘
```

쿼리:

```sql
SELECT parseDateTimeBestEffort('1284101485')
AS parseDateTimeBestEffort;
```

결과:

```response
┌─parseDateTimeBestEffort─┐
│     2015-07-07 12:04:41 │
└─────────────────────────┘
```

쿼리:

```sql
SELECT parseDateTimeBestEffort('2018-10-23 10:12:12')
AS parseDateTimeBestEffort;
```

결과:

```response
┌─parseDateTimeBestEffort─┐
│     2018-10-23 10:12:12 │
└─────────────────────────┘
```

쿼리:

```sql
SELECT toYear(now()) AS year, parseDateTimeBestEffort('10 20:19');
```

결과:

```response
┌─year─┬─parseDateTimeBestEffort('10 20:19')─┐
│ 2023 │                 2023-01-10 20:19:00 │
└──────┴─────────────────────────────────────┘
```

쿼리:

```sql
WITH
    now() AS ts_now,
    formatDateTime(ts_around, '%b %e %T') AS syslog_arg
SELECT
    ts_now,
    syslog_arg,
    parseDateTimeBestEffort(syslog_arg)
FROM (SELECT arrayJoin([ts_now - 30, ts_now + 30]) AS ts_around);
```

결과:

```response
┌──────────────ts_now─┬─syslog_arg──────┬─parseDateTimeBestEffort(syslog_arg)─┐
│ 2023-06-30 23:59:30 │ Jun 30 23:59:00 │                 2023-06-30 23:59:00 │
│ 2023-06-30 23:59:30 │ Jul  1 00:00:00 │                 2022-07-01 00:00:00 │
└─────────────────────┴─────────────────┴─────────────────────────────────────┘
```

**참고**

- [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123)
- [toDate](#todate)
- [toDateTime](#todatetime)
- [ISO 8601 발표 @xkcd](https://xkcd.com/1179/)
- [RFC 3164](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)
## parseDateTimeBestEffortUS {#parsedatetimebesteffortus}

이 함수는 ISO 날짜 형식(`YYYY-MM-DD hh:mm:ss` 등)과 기타 날짜 형식에서 월과 날짜 구성 요소를 명확하게 추출할 수 있는 경우 [parseDateTimeBestEffort](#parsedatetimebesteffort)처럼 작동합니다. 예를 들어 `YYYYMMDDhhmmss`, `YYYY-MM`, `DD hh`, 또는 `YYYY-MM-DD hh:mm:ss ±h:mm`입니다. 월과 날짜 구성 요소를 명확히 구분할 수 없는 경우, 예를 들어 `MM/DD/YYYY`, `MM-DD-YYYY`, 또는 `MM-DD-YY`, 미국 날짜 형식을 선호합니다. 단, 월이 12보다 크고 31 이하일 경우, 이 함수는 [parseDateTimeBestEffort](#parsedatetimebesteffort)의 동작으로 돌아갑니다. 예를 들어 `15/08/2020`은 `2020-08-15`로 구문 분석됩니다.
## parseDateTimeBestEffortOrNull {#parsedatetimebesteffortornull}
## parseDateTime32BestEffortOrNull {#parsedatetime32besteffortornull}

[parseDateTimeBestEffort](#parsedatetimebesteffort)와 동일하지만, 처리할 수 없는 날짜 형식을 만나면 `NULL`을 반환합니다.
## parseDateTimeBestEffortOrZero {#parsedatetimebesteffortorzero}
## parseDateTime32BestEffortOrZero {#parsedatetime32besteffortorzero}

[parseDateTimeBestEffort](#parsedatetimebesteffort)와 동일하지만, 처리할 수 없는 날짜 형식을 만나면 제로 날짜 또는 제로 날짜 시간(`1970-01-01` 또는 `1970-01-01 00:00:00`)을 반환합니다.
## parseDateTimeBestEffortUSOrNull {#parsedatetimebesteffortusornull}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 함수와 동일하지만, 처리할 수 없는 날짜 형식을 만나면 `NULL`을 반환합니다.
## parseDateTimeBestEffortUSOrZero {#parsedatetimebesteffortusorzero}

[parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 함수와 동일하지만, 처리할 수 없는 날짜 형식을 만나면 제로 날짜(`1970-01-01`) 또는 제로 날짜에 시간(`1970-01-01 00:00:00`)을 반환합니다.
## parseDateTime64BestEffort {#parsedatetime64besteffort}

[parseDateTimeBestEffort](#parsedatetimebesteffort) 함수와 동일하지만, 밀리초 및 마이크로초를 구문 분석하고 [DateTime](/sql-reference/data-types/datetime) 데이터 유형을 반환합니다.

**구문**

```sql
parseDateTime64BestEffort(time_string [, precision [, time_zone]])
```

**인수**

- `time_string` — 변환할 날짜 또는 날짜와 시간을 포함하는 문자열. [문자열](../data-types/string.md).
- `precision` — 필수 정밀도. `3` — 밀리초에 대한 것, `6` — 마이크로초에 대한 것. 기본값 - `3`. 선택 사항. [UInt8](../data-types/int-uint.md).
- `time_zone` — [시간대](/operations/server-configuration-parameters/settings.md#timezone). 함수는 시간대에 따라 `time_string`을 구문 분석합니다. 선택 사항. [문자열](../data-types/string.md).

**반환 값**

- `time_string`이 [DateTime](../data-types/datetime.md) 데이터 유형으로 변환됩니다.

**예시**

쿼리:

```sql
SELECT parseDateTime64BestEffort('2021-01-01') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2021-01-01 01:01:00.12346') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2021-01-01 01:01:00.12346',6) AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2021-01-01 01:01:00.12346',3,'Asia/Istanbul') AS a, toTypeName(a) AS t
FORMAT PrettyCompactMonoBlock;
```

결과:

```sql
┌──────────────────────────a─┬─t──────────────────────────────┐
│ 2021-01-01 01:01:00.123000 │ DateTime64(3)                  │
│ 2021-01-01 00:00:00.000000 │ DateTime64(3)                  │
│ 2021-01-01 01:01:00.123460 │ DateTime64(6)                  │
│ 2020-12-31 22:01:00.123000 │ DateTime64(3, 'Asia/Istanbul') │
└────────────────────────────┴────────────────────────────────┘
```
## parseDateTime64BestEffortUS {#parsedatetime64besteffortus}

[parseDateTime64BestEffort](#parsedatetime64besteffort)와 동일하지만, 애매할 경우 미국 날짜 형식(`MM/DD/YYYY` 등)을 선호합니다.
## parseDateTime64BestEffortOrNull {#parsedatetime64besteffortornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort)와 동일하지만, 처리할 수 없는 날짜 형식을 만나면 `NULL`을 반환합니다.
## parseDateTime64BestEffortOrZero {#parsedatetime64besteffortorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort)와 동일하지만, 처리할 수 없는 날짜 형식을 만나면 제로 날짜 또는 제로 날짜 시간(`1970-01-01` 또는 `1970-01-01 00:00:00`)을 반환합니다.
## parseDateTime64BestEffortUSOrNull {#parsedatetime64besteffortusornull}

[parseDateTime64BestEffort](#parsedatetime64besteffort)와 동일하지만, 모호한 경우 미국 날짜 형식(`MM/DD/YYYY` 등)을 선호하고 처리할 수 없는 날짜 형식을 만나면 `NULL`을 반환합니다.
## parseDateTime64BestEffortUSOrZero {#parsedatetime64besteffortusorzero}

[parseDateTime64BestEffort](#parsedatetime64besteffort)와 동일하지만, 모호한 경우 미국 날짜 형식(`MM/DD/YYYY` 등)을 선호하고 처리할 수 없는 날짜 형식을 만날 경우 제로 날짜 또는 제로 날짜 시간(`1970-01-01` 또는 `1970-01-01 00:00:00`)을 반환합니다.
## toLowCardinality {#tolowcardinality}

입력 매개변수를 같은 데이터 유형의 [LowCardinality](../data-types/lowcardinality.md) 버전으로 변환합니다.

`LowCardinality` 데이터 유형에서 데이터를 변환하려면 [CAST](#cast) 함수를 사용하십시오. 예를 들어 `CAST(x as String)`을 사용합니다.

**구문**

```sql
toLowCardinality(expr)
```

**인수**

- `expr` — [식](/sql-reference/syntax#expressions)로 결과를 얻는 모든 [지원되는 데이터 유형](/sql-reference/data-types).

**반환 값**

- `expr`의 결과. `expr` 유형의 [LowCardinality](../data-types/lowcardinality.md).

**예시**

쿼리:

```sql
SELECT toLowCardinality('1');
```

결과:

```response
┌─toLowCardinality('1')─┐
│ 1                     │
└───────────────────────┘
```
## toUnixTimestamp {#toUnixTimestamp}

`String`, `Date`, 또는 `DateTime`을 Unix 타임스탬프(초 단위 `1970-01-01 00:00:00 UTC`)로 변환하여 `UInt32`로 반환합니다.

**구문**

```sql
toUnixTimestamp(date, [timezone])
```

**인수**

- `date`: 변환할 값. [`Date`](/sql-reference/data-types/date) 또는 [`Date32`](/sql-reference/data-types/date32) 또는 [`DateTime`](/sql-reference/data-types/datetime) 또는 [`DateTime64`](/sql-reference/data-types/datetime64) 또는 [`String`](/sql-reference/data-types/string).
- `timezone`: 선택 사항. 변환에 사용할 시간대. 지정되지 않은 경우 서버의 시간대가 사용됩니다. [`String`](/sql-reference/data-types/string)

**반환 값**

Unix 타임스탬프를 반환합니다. [`UInt32`](/sql-reference/data-types/int-uint)

**예시**

**사용 예**

```sql title="Query"
SELECT
'2017-11-05 08:07:47' AS dt_str,
toUnixTimestamp(dt_str) AS from_str,
toUnixTimestamp(dt_str, 'Asia/Tokyo') AS from_str_tokyo,
toUnixTimestamp(toDateTime(dt_str)) AS from_datetime,
toUnixTimestamp(toDateTime64(dt_str, 0)) AS from_datetime64,
toUnixTimestamp(toDate(dt_str)) AS from_date,
toUnixTimestamp(toDate32(dt_str)) AS from_date32
FORMAT Vertical;
```

```response title="Response"
Row 1:
──────
dt_str:          2017-11-05 08:07:47
from_str:        1509869267
from_str_tokyo:  1509836867
from_datetime:   1509869267
from_datetime64: 1509869267
from_date:       1509840000
from_date32:     1509840000
```
## toUnixTimestamp64Second {#tounixtimestamp64second}

`DateTime64`를 고정 초 정밀도의 `Int64` 값으로 변환합니다. 입력 값은 정밀도에 따라 적절하게 스케일 업 또는 스케일 다운됩니다.

:::note
출력 값은 UTC의 타임스탬프이며, `DateTime64`의 시간대는 아닙니다.
:::

**구문**

```sql
toUnixTimestamp64Second(value)
```

**인수**

- `value` — 어떤 정밀도의 DateTime64 값. [DateTime64](../data-types/datetime64.md).

**반환 값**

- `value`가 `Int64` 데이터 유형으로 변환됩니다. [Int64](../data-types/int-uint.md).

**예시**

쿼리:

```sql
WITH toDateTime64('2009-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Second(dt64);
```

결과:

```response
┌─toUnixTimestamp64Second(dt64)─┐
│                    1234567891 │
└───────────────────────────────┘
```
## toUnixTimestamp64Milli {#tounixtimestamp64milli}

`DateTime64`를 고정 밀리초 정밀도의 `Int64` 값으로 변환합니다. 입력 값은 정밀도에 따라 적절하게 스케일 업 또는 스케일 다운됩니다.

:::note
출력 값은 UTC의 타임스탬프이며, `DateTime64`의 시간대는 아닙니다.
:::

**구문**

```sql
toUnixTimestamp64Milli(value)
```

**인수**

- `value` — 어떤 정밀도의 DateTime64 값. [DateTime64](../data-types/datetime64.md).

**반환 값**

- `value`가 `Int64` 데이터 유형으로 변환됩니다. [Int64](../data-types/int-uint.md).

**예시**

쿼리:

```sql
WITH toDateTime64('2009-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Milli(dt64);
```

결과:

```response
┌─toUnixTimestamp64Milli(dt64)─┐
│                1234567891011 │
└──────────────────────────────┘
```
## toUnixTimestamp64Micro {#tounixtimestamp64micro}

`DateTime64`를 고정 마이크로초 정밀도의 `Int64` 값으로 변환합니다. 입력 값은 정밀도에 따라 적절하게 스케일 업 또는 스케일 다운됩니다.

:::note
출력 값은 UTC의 타임스탬프이며, `DateTime64`의 시간대는 아닙니다.
:::

**구문**

```sql
toUnixTimestamp64Micro(value)
```

**인수**

- `value` — 어떤 정밀도의 DateTime64 값. [DateTime64](../data-types/datetime64.md).

**반환 값**

- `value`가 `Int64` 데이터 유형으로 변환됩니다. [Int64](../data-types/int-uint.md).

**예시**

쿼리:

```sql
WITH toDateTime64('1970-01-15 06:56:07.891011', 6, 'UTC') AS dt64
SELECT toUnixTimestamp64Micro(dt64);
```

결과:

```response
┌─toUnixTimestamp64Micro(dt64)─┐
│                1234567891011 │
└──────────────────────────────┘
```
## toUnixTimestamp64Nano {#tounixtimestamp64nano}

`DateTime64`를 고정 나노초 정밀도의 `Int64` 값으로 변환합니다. 입력 값은 정밀도에 따라 적절하게 스케일 업 또는 스케일 다운됩니다.

:::note
출력 값은 UTC의 타임스탬프이며, `DateTime64`의 시간대는 아닙니다.
:::

**구문**

```sql
toUnixTimestamp64Nano(value)
```

**인수**

- `value` — 어떤 정밀도의 DateTime64 값. [DateTime64](../data-types/datetime64.md).

**반환 값**

- `value`가 `Int64` 데이터 유형으로 변환됩니다. [Int64](../data-types/int-uint.md).

**예시**

쿼리:

```sql
WITH toDateTime64('1970-01-01 00:20:34.567891011', 9, 'UTC') AS dt64
SELECT toUnixTimestamp64Nano(dt64);
```

결과:

```response
┌─toUnixTimestamp64Nano(dt64)─┐
│               1234567891011 │
└─────────────────────────────┘
```
## fromUnixTimestamp64Second {#fromunixtimestamp64second}

`Int64` 값을 고정 초 정밀도의 `DateTime64` 값으로 변환하며, 선택적 시간대도 포함합니다. 입력 값은 정밀도에 따라 적절하게 스케일 업 또는 스케일 다운됩니다.

:::note
입력 값은 UTC 타임스탬프로 처리되며, 주어진(또는 묵시적인) 시간대의 타임스탬프가 아닙니다.
:::

**구문**

```sql
fromUnixTimestamp64Second(value[, timezone])
```

**인수**

- `value` — 어떤 정밀도의 값. [Int64](../data-types/int-uint.md).
- `timezone` — (선택 사항) 결과의 시간대 이름. [문자열](../data-types/string.md).

**반환 값**

- `value`가 정밀도 `0`의 DateTime64로 변환됩니다. [DateTime64](../data-types/datetime64.md).

**예시**

쿼리:

```sql
WITH CAST(1733935988, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Second(i64, 'UTC') AS x,
    toTypeName(x);
```

결과:

```response
┌───────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08 │ DateTime64(0, 'UTC') │
└─────────────────────┴──────────────────────┘
```
## fromUnixTimestamp64Milli {#fromunixtimestamp64milli}

`Int64` 값을 고정 밀리초 정밀도의 `DateTime64` 값으로 변환하며, 선택적 시간대도 포함합니다. 입력 값은 정밀도에 따라 적절하게 스케일 업 또는 스케일 다운됩니다.

:::note
입력 값은 UTC 타임스탬프로 처리되며, 주어진(또는 묵시적인) 시간대의 타임스탬프가 아닙니다.
:::

**구문**

```sql
fromUnixTimestamp64Milli(value[, timezone])
```

**인수**

- `value` — 어떤 정밀도의 값. [Int64](../data-types/int-uint.md).
- `timezone` — (선택 사항) 결과의 시간대 이름. [문자열](../data-types/string.md).

**반환 값**

- `value`가 정밀도 `3`의 DateTime64로 변환됩니다. [DateTime64](../data-types/datetime64.md).

**예시**

쿼리:

```sql
WITH CAST(1733935988123, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Milli(i64, 'UTC') AS x,
    toTypeName(x);
```

결과:

```response
┌───────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123 │ DateTime64(3, 'UTC') │
└─────────────────────────┴──────────────────────┘
```
## fromUnixTimestamp64Micro {#fromunixtimestamp64micro}

`Int64` 값을 고정 마이크로초 정밀도의 `DateTime64` 값으로 변환하며, 선택적 시간대도 포함합니다. 입력 값은 정밀도에 따라 적절하게 스케일 업 또는 스케일 다운됩니다.

:::note
입력 값은 UTC 타임스탬프로 처리되며, 주어진(또는 묵시적인) 시간대의 타임스탬프가 아닙니다.
:::

**구문**

```sql
fromUnixTimestamp64Micro(value[, timezone])
```

**인수**

- `value` — 어떤 정밀도의 값. [Int64](../data-types/int-uint.md).
- `timezone` — (선택 사항) 결과의 시간대 이름. [문자열](../data-types/string.md).

**반환 값**

- `value`가 정밀도 `6`의 DateTime64로 변환됩니다. [DateTime64](../data-types/datetime64.md).

**예시**

쿼리:

```sql
WITH CAST(1733935988123456, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Micro(i64, 'UTC') AS x,
    toTypeName(x);
```

결과:

```response
┌──────────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123456 │ DateTime64(6, 'UTC') │
└────────────────────────────┴──────────────────────┘
```
## fromUnixTimestamp64Nano {#fromunixtimestamp64nano}

`Int64` 값을 고정 나노초 정밀도의 `DateTime64` 값으로 변환하며, 선택적 시간대도 포함합니다. 입력 값은 정밀도에 따라 적절하게 스케일 업 또는 스케일 다운됩니다.

:::note
입력 값은 UTC 타임스탬프로 처리되며, 주어진(또는 묵시적인) 시간대의 타임스탬프가 아닙니다.
:::

**구문**

```sql
fromUnixTimestamp64Nano(value[, timezone])
```

**인수**

- `value` — 어떤 정밀도의 값. [Int64](../data-types/int-uint.md).
- `timezone` — (선택 사항) 결과의 시간대 이름. [문자열](../data-types/string.md).

**반환 값**

- `value`가 정밀도 `9`의 DateTime64로 변환됩니다. [DateTime64](../data-types/datetime64.md).

**예시**

쿼리:

```sql
WITH CAST(1733935988123456789, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Nano(i64, 'UTC') AS x,
    toTypeName(x);
```

결과:

```response
┌─────────────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123456789 │ DateTime64(9, 'UTC') │
└───────────────────────────────┴──────────────────────┘
```
## formatRow {#formatrow}

주어진 형식을 통해 임의의 표현식을 문자열로 변환합니다.

**구문**

```sql
formatRow(format, x, y, ...)
```

**인수**

- `format` — 텍스트 형식. 예를 들어 [CSV](/interfaces/formats/CSV), [TabSeparated (TSV)](/interfaces/formats/TabSeparated).
- `x`,`y`, ... — 표현식들.

**반환 값**

- 형식이 지정된 문자열. (텍스트 형식의 경우 일반적으로 줄 바꿈 문자로 종료됨).

**예시**

쿼리:

```sql
SELECT formatRow('CSV', number, 'good')
FROM numbers(3);
```

결과:

```response
┌─formatRow('CSV', number, 'good')─┐
│ 0,"good"
                         │
│ 1,"good"
                         │
│ 2,"good"
                         │
└──────────────────────────────────┘
```

**참고**: 형식에 접미사/접두사가 포함된 경우 각 행에 작성됩니다.

**예시**

쿼리:

```sql
SELECT formatRow('CustomSeparated', number, 'good')
FROM numbers(3)
SETTINGS format_custom_result_before_delimiter='<prefix>\n', format_custom_result_after_delimiter='<suffix>'
```

결과:

```response
┌─formatRow('CustomSeparated', number, 'good')─┐
│ <prefix>
0    good
<suffix>                   │
│ <prefix>
1    good
<suffix>                   │
│ <prefix>
2    good
<suffix>                   │
└──────────────────────────────────────────────┘
```

참고: 이 함수에서는 행 기반 형식만 지원됩니다.
## formatRowNoNewline {#formatrownonewline}

주어진 형식을 통해 임의의 표현식을 문자열로 변환합니다. 형식이 지정된 행에서 마지막 `\n`을 잘라낸다는 점에서 formatRow와 다릅니다.

**구문**

```sql
formatRowNoNewline(format, x, y, ...)
```

**인수**

- `format` — 텍스트 형식. 예를 들어 [CSV](/interfaces/formats/CSV), [TabSeparated (TSV)](/interfaces/formats/TabSeparated).
- `x`,`y`, ... — 표현식들.

**반환 값**

- 형식이 지정된 문자열.

**예시**

쿼리:

```sql
SELECT formatRowNoNewline('CSV', number, 'good')
FROM numbers(3);
```

결과:

```response
┌─formatRowNoNewline('CSV', number, 'good')─┐
│ 0,"good"                                  │
│ 1,"good"                                  │
│ 2,"good"                                  │
└───────────────────────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
