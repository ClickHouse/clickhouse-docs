---
"description": "UUIDs로 작업하기 위한 함수에 대한 문서"
"sidebar_label": "UUIDs"
"slug": "/sql-reference/functions/uuid-functions"
"title": "UUIDs로 작업하기 위한 함수"
"doc_type": "reference"
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

# UUID 작업을 위한 함수

## UUIDv7 생성 {#uuidv7-generation}

생성된 UUID는 유닉스 밀리초로 된 48비트 타임스탬프, 이어서 버전 "7" (4비트), 밀리초 내에서 UUID를 구분하기 위한 카운터 (42비트, 변형 필드 "2" (2비트) 포함), 그리고 랜덤 필드 (32비트)를 포함합니다. 주어진 타임스탬프 (`unix_ts_ms`)에 대해 카운터는 무작위 값에서 시작하며, 타임스탬프가 변경될 때까지 새로운 UUID마다 1씩 증가합니다. 카운터가 오버플로우하는 경우, 타임스탬프 필드는 1만큼 증가하고 카운터는 새로운 무작위 시작값으로 리셋됩니다. UUID 생성 함수는 동시 실행되는 스레드와 쿼리에서 모든 함수 호출 간에 타임스탬프 내에서 카운터 필드가 단조롭게 증가하도록 보장합니다.

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|                           unix_ts_ms                          |
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|          unix_ts_ms           |  ver  |   counter_high_bits   |
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|var|                   counter_low_bits                        |
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|                            rand_b                             |
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
```

## 스노우플레이크 ID 생성 {#snowflake-id-generation}

생성된 스노우플레이크 ID는 밀리초로 된 현재 유닉스 타임스탬프 (41 + 1 상위 영 비트), 이어서 머신 ID (10비트), 그리고 밀리초 내에서 ID를 구분하기 위한 카운터 (12비트)를 포함합니다. 주어진 타임스탬프 (`unix_ts_ms`)에 대해 카운터는 0에서 시작하며 타임스탬프가 변경될 때까지 새로운 스노우플레이크 ID마다 1씩 증가합니다. 카운터가 오버플로우하는 경우, 타임스탬프 필드는 1만큼 증가하고 카운터는 0으로 리셋됩니다.

:::note
생성된 스노우플레이크 ID는 UNIX 에포크 1970-01-01을 기준으로 합니다. 스노우플레이크 ID의 에포크에 대한 표준이나 권장 사항은 없지만, 다른 시스템의 구현은 다른 에포크를 사용할 수 있습니다. 예: 트위터/X (2010-11-04) 또는 마스토돈 (2015-01-01).
:::

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|0|                         timestamp                           |
├─┼                 ┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|                   |     machine_id    |    machine_seq_num    |
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
```

## generateUUIDv4 {#generateuuidv4}

[버전 4](https://tools.ietf.org/html/rfc4122#section-4.4) [UUID](../data-types/uuid.md)를 생성합니다.

**구문**

```sql
generateUUIDv4([expr])
```

**인수**

- `expr` — 쿼리에서 함수가 여러 번 호출될 경우 [공통 하위 표현 제거](/sql-reference/functions/overview#common-subexpression-elimination)를 우회하는 데 사용되는 임의의 [표현식](/sql-reference/syntax#expressions). 표현식의 값은 반환된 UUID에 영향을 미치지 않습니다. 선택 사항.

**반환 값**

UUIDv4 유형의 값.

**예제**

먼저 UUID 유형의 컬럼이 있는 테이블을 생성한 다음, 생성된 UUIDv4를 테이블에 삽입합니다.

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;

INSERT INTO tab SELECT generateUUIDv4();

SELECT * FROM tab;
```

결과:

```response
┌─────────────────────────────────uuid─┐
│ f4bf890f-f9dc-4332-ad5c-0c18e73f28e9 │
└──────────────────────────────────────┘
```

**행마다 여러 UUID가 생성된 예제**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

[버전 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [UUID](../data-types/uuid.md)를 생성합니다.

UUID 구조, 카운터 관리, 및 동시성 보장에 대한 자세한 내용은 ["UUIDv7 생성"](#uuidv7-generation)를 참조하십시오.

:::note
2024년 4월 현재, 버전 7 UUID는 초안 상태에 있으며 향후 레이아웃이 변경될 수 있습니다.
:::

**구문**

```sql
generateUUIDv7([expr])
```

**인수**

- `expr` — 쿼리에서 함수가 여러 번 호출될 경우 [공통 하위 표현 제거](/sql-reference/functions/overview#common-subexpression-elimination)를 우회하는 데 사용되는 임의의 [표현식](/sql-reference/syntax#expressions). 표현식의 값은 반환된 UUID에 영향을 미치지 않습니다. 선택 사항.

**반환 값**

UUIDv7 유형의 값.

**예제**

먼저 UUID 유형의 컬럼이 있는 테이블을 생성한 다음, 생성된 UUIDv7를 테이블에 삽입합니다.

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;

INSERT INTO tab SELECT generateUUIDv7();

SELECT * FROM tab;
```

결과:

```response
┌─────────────────────────────────uuid─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b │
└──────────────────────────────────────┘
```

**행마다 여러 UUID가 생성된 예제**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## dateTimeToUUIDv7 {#datetimetouuidv7}

주어진 시간에 [DateTime](../data-types/datetime.md) 값을 [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7)로 변환합니다.

UUID 구조, 카운터 관리, 및 동시성 보장에 대한 자세한 내용은 ["UUIDv7 생성"](#uuidv7-generation)를 참조하십시오.

:::note
2024년 4월 현재, 버전 7 UUID는 초안 상태에 있으며 향후 레이아웃이 변경될 수 있습니다.
:::

**구문**

```sql
dateTimeToUUIDv7(value)
```

**인수**

- `value` — 시간과 함께한 날짜. [DateTime](../data-types/datetime.md).

**반환 값**

UUIDv7 유형의 값.

**예제**

```sql
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

결과:

```response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**같은 타임스탬프에 대해 여러 UUID의 예제**

```sql
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
```

**결과**

```response
   ┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
1. │ 017b4b2d-7720-76ed-ae44-bbcc23a8c550 │
   └──────────────────────────────────────┘

   ┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
1. │ 017b4b2d-7720-76ed-ae44-bbcf71ed0fd3 │
   └──────────────────────────────────────┘
```

이 함수는 같은 타임스탬프에 대해 여러 번 호출할 때 고유하게 단조 증가하는 UUID를 생성하도록 보장합니다.

## empty {#empty}

입력 UUID가 비어 있는지 확인합니다.

**구문**

```sql
empty(UUID)
```

UUID가 모두 0일 경우 비어 있는 것으로 간주합니다 (제로 UUID).

이 함수는 배열 및 문자열에도 적용됩니다.

**인수**

- `x` — UUID. [UUID](../data-types/uuid.md).

**반환 값**

- 비어 있는 UUID에 대해 `1`, 비어 있지 않은 UUID에 대해 `0`을 반환합니다. [UInt8](../data-types/int-uint.md).

**예제**

UUID 값을 생성하기 위해 ClickHouse는 [generateUUIDv4](#generateuuidv4) 함수를 제공합니다.

쿼리:

```sql
SELECT empty(generateUUIDv4());
```

결과:

```response
┌─empty(generateUUIDv4())─┐
│                       0 │
└─────────────────────────┘
```

## notEmpty {#notempty}

입력 UUID가 비어 있지 않은지 확인합니다.

**구문**

```sql
notEmpty(UUID)
```

UUID가 모두 0일 경우 비어 있는 것으로 간주합니다 (제로 UUID).

이 함수는 배열 및 문자열에도 적용됩니다.

**인수**

- `x` — UUID. [UUID](../data-types/uuid.md).

**반환 값**

- 비어 있지 않은 UUID에 대해 `1`, 비어 있는 UUID에 대해 `0`을 반환합니다. [UInt8](../data-types/int-uint.md).

**예제**

UUID 값을 생성하기 위해 ClickHouse는 [generateUUIDv4](#generateuuidv4) 함수를 제공합니다.

쿼리:

```sql
SELECT notEmpty(generateUUIDv4());
```

결과:

```response
┌─notEmpty(generateUUIDv4())─┐
│                          1 │
└────────────────────────────┘
```

## toUUID {#touuid}

문자열 유형의 값을 UUID로 변환합니다.

```sql
toUUID(string)
```

**반환 값**

UUID 유형 값.

**사용 예제**

```sql
SELECT toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0') AS uuid
```

결과:

```response
┌─────────────────────────────────uuid─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0 │
└──────────────────────────────────────┘
```

## toUUIDOrDefault {#touuidordefault}

**인수**

- `string` — 36자 문자열 또는 FixedString(36). [String](../syntax.md#string).
- `default` — 첫 번째 인수를 UUID 유형으로 변환할 수 없을 경우 기본값으로 사용할 UUID. [UUID](../data-types/uuid.md).

**반환 값**

UUID

```sql
toUUIDOrDefault(string, default)
```

**반환 값**

UUID 유형 값.

**사용 예제**

첫 번째 예제는 UUID 유형으로 변환할 수 있는 첫 번째 인수를 반환합니다:

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

결과:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

두 번째 예제는 첫 번째 인수를 UUID 유형으로 변환할 수 없는 경우 두 번째 인수(제공된 기본 UUID)를 반환합니다:

```sql
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

결과:

```response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## toUUIDOrNull {#touuidornull}

문자열 유형의 인수를 받아 UUID로 구문 분석합니다. 실패할 경우 NULL을 반환합니다.

```sql
toUUIDOrNull(string)
```

**반환 값**

Nullable(UUID) 유형 값.

**사용 예제**

```sql
SELECT toUUIDOrNull('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

결과:

```response
┌─uuid─┐
│ ᴺᵁᴸᴸ │
└──────┘
```

## toUUIDOrZero {#touuidorzero}

문자열 유형의 인수를 받아 UUID로 구문 분석합니다. 실패할 경우 제로 UUID를 반환합니다.

```sql
toUUIDOrZero(string)
```

**반환 값**

UUID 유형 값.

**사용 예제**

```sql
SELECT toUUIDOrZero('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

결과:

```response
┌─────────────────────────────────uuid─┐
│ 00000000-0000-0000-0000-000000000000 │
└──────────────────────────────────────┘
```

## UUIDStringToNum {#uuidstringtonum}

`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` 형식의 36자를 포함하는 `string`을 수용하고, 이진 표현으로서 [FixedString(16)](../data-types/fixedstring.md)을 반환하며, 형식은 선택적으로 `variant`에 의해 지정됩니다 (기본적으로 `Big-endian`).

**구문**

```sql
UUIDStringToNum(string[, variant = 1])
```

**인수**

- `string` — 36자의 [String](/sql-reference/data-types/string) 또는 [FixedString](/sql-reference/data-types/string)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)에서 지정된 변형을 나타내는 정수. 1 = `Big-endian` (기본값), 2 = `Microsoft`.

**반환 값**

FixedString(16)

**사용 예제**

```sql
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid) AS bytes
```

결과:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

```sql
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid, 2) AS bytes
```

결과:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

## UUIDNumToString {#uuidnumtostring}

UUID의 이진 표현을 수용하고, 선택적으로 `variant`에 의해 형식을 지정한 후 (기본값은 `Big-endian`) 36자의 문자열을 반환합니다.

**구문**

```sql
UUIDNumToString(binary[, variant = 1])
```

**인수**

- `binary` — UUID의 이진 표현. [FixedString(16)](../data-types/fixedstring.md)로.
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)에서 지정된 변형. 1 = `Big-endian` (기본값), 2 = `Microsoft`.

**반환 값**

문자열.

**사용 예제**

```sql
SELECT
    'a/<@];!~p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16)) AS uuid
```

결과:

```response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ a/<@];!~p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

```sql
SELECT
    '@</a;]~!p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16), 2) AS uuid
```

결과:

```response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ @</a;]~!p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

## UUIDToNum {#uuidtonum}

[UUID](../data-types/uuid.md)를 수용하고 이를 [FixedString(16)](../data-types/fixedstring.md)로 이진 표현으로 변환하며, 선택적으로 `variant`에 의해 형식을 지정합니다 (기본적으로 `Big-endian`). 이 함수는 `UUIDStringToNum(toString(uuid))`라는 두 개의 별도 함수 호출을 대체하므로 UUID에서 문자열로의 중간 변환이 필요하지 않습니다.

**구문**

```sql
UUIDToNum(uuid[, variant = 1])
```

**인수**

- `uuid` — [UUID](../data-types/uuid.md).
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)에서 지정된 변형을 나타내는 정수. 1 = `Big-endian` (기본값), 2 = `Microsoft`.

**반환 값**

UUID의 이진 표현.

**사용 예제**

```sql
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid) AS bytes
```

결과:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

```sql
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid, 2) AS bytes
```

결과:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

## UUIDv7ToDateTime {#uuidv7todatetime}

버전 7 UUID의 타임스탬프 구성 요소를 반환합니다.

**구문**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**인수**

- `uuid` — 버전 7의 [UUID](../data-types/uuid.md).
- `timezone` — 반환 값에 대한 [타임존 이름](../../operations/server-configuration-parameters/settings.md#timezone) (선택 사항). [String](../data-types/string.md).

**반환 값**

- 밀리초 정밀도의 타임스탬프. UUID가 유효한 버전 7 UUID가 아닐 경우 `1970-01-01 00:00:00.000`을 반환합니다. [DateTime64(3)](../data-types/datetime64.md).

**사용 예제**

```sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

결과:

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

```sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

결과:

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                              2024-04-22 08:30:29.048 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## serverUUID {#serveruuid}

ClickHouse 서버의 첫 시작 시 생성된 랜덤 UUID를 반환합니다. UUID는 ClickHouse 서버 디렉토리 (예: `/var/lib/clickhouse/`)의 파일 `uuid`에 저장되며, 서버 재시작 간에 유지됩니다.

**구문**

```sql
serverUUID()
```

**반환 값**

- 서버의 UUID. [UUID](../data-types/uuid.md).

## generateSnowflakeID {#generatesnowflakeid}

[스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)를 생성합니다. 이 함수는 동시 실행되는 스레드와 쿼리에서 모든 함수 호출 간에 타임스탬프 내에서 카운터 필드가 단조롭게 증가하도록 보장합니다.

스노우플레이크 ID 생성을 위한 구현 세부사항은 ["스노우플레이크 ID 생성"](#snowflake-id-generation)를 참조하십시오.

**구문**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**인수**

- `expr` — 쿼리에서 함수가 여러 번 호출될 경우 [공통 하위 표현 제거](/sql-reference/functions/overview#common-subexpression-elimination)를 우회하는 데 사용되는 임의의 [표현식](/sql-reference/syntax#expressions). 표현식의 값은 반환된 스노우플레이크 ID에 영향을 미치지 않습니다. 선택 사항.
- `machine_id` — 머신 ID, 하위 10비트가 사용됩니다. [Int64](../data-types/int-uint.md). 선택 사항.

**반환 값**

UInt64 유형의 값.

**예제**

먼저 UInt64 유형의 컬럼이 있는 테이블을 생성한 다음, 생성된 스노우플레이크 ID를 테이블에 삽입합니다.

```sql
CREATE TABLE tab (id UInt64) ENGINE = Memory;

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

결과:

```response
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**행마다 여러 스노우플레이크 ID가 생성된 예제**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**표현식 및 머신 ID가 포함된 예제**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge/>

:::warning
이 함수는 사용 중단되었으며 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 설정이 활성화된 경우에만 사용할 수 있습니다. 이 함수는 미래에 제거될 것입니다.

대신 [snowflakeIDToDateTime](#snowflakeidtodatetime) 함수를 사용하십시오.
:::

[스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)의 타임스탬프 구성 요소를 [DateTime](../data-types/datetime.md) 형식으로 추출합니다.

**구문**

```sql
snowflakeToDateTime(value[, time_zone])
```

**인수**

- `value` — 스노우플레이크 ID. [Int64](../data-types/int-uint.md).
- `time_zone` — [타임존](/operations/server-configuration-parameters/settings.md#timezone). 함수는 시간 문자열을 타임존에 따라 구문 분석합니다. 선택 사항. [String](../data-types/string.md).

**반환 값**

- `value`의 타임스탬프 구성 요소를 [DateTime](../data-types/datetime.md) 값으로 반환합니다.

**예제**

쿼리:

```sql
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

결과:

```response

┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```

## snowflakeToDateTime64 {#snowflaketodatetime64}

<DeprecatedBadge/>

:::warning
이 함수는 사용 중단되었으며 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 설정이 활성화된 경우에만 사용할 수 있습니다. 이 함수는 미래에 제거될 것입니다.

대신 [snowflakeIDToDateTime64](#snowflakeidtodatetime64) 함수를 사용하십시오.
:::

[스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)의 타임스탬프 구성 요소를 [DateTime64](../data-types/datetime64.md) 형식으로 추출합니다.

**구문**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**인수**

- `value` — 스노우플레이크 ID. [Int64](../data-types/int-uint.md).
- `time_zone` — [타임존](/operations/server-configuration-parameters/settings.md#timezone). 함수는 시간 문자열을 타임존에 따라 구문 분석합니다. 선택 사항. [String](../data-types/string.md).

**반환 값**

- `value`의 타임스탬프 구성 요소를 [DateTime64](../data-types/datetime64.md)로, 스케일 = 3 (즉, 밀리초 정밀도)로 반환합니다.

**예제**

쿼리:

```sql
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

결과:

```response

┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```

## dateTimeToSnowflake {#datetimetosnowflake}

<DeprecatedBadge/>

:::warning
이 함수는 사용 중단되었으며 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 설정이 활성화된 경우에만 사용할 수 있습니다. 이 함수는 미래에 제거될 것입니다.

대신 [dateTimeToSnowflakeID](#datetimetosnowflakeid) 함수를 사용하십시오.
:::

[DateTime](../data-types/datetime.md) 값을 주어진 시간에 첫 번째 [스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)로 변환합니다.

**구문**

```sql
dateTimeToSnowflake(value)
```

**인수**

- `value` — 시간과 함께한 날짜. [DateTime](../data-types/datetime.md).

**반환 값**

- 입력 값이 해당 시간의 첫 번째 스노우플레이크 ID로 변환됩니다.

**예제**

쿼리:

```sql
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

결과:

```response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```

## dateTime64ToSnowflake {#datetime64tosnowflake}

<DeprecatedBadge/>

:::warning
이 함수는 사용 중단되었으며 [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 설정이 활성화된 경우에만 사용할 수 있습니다. 이 함수는 미래에 제거될 것입니다.

대신 [dateTime64ToSnowflakeID](#datetime64tosnowflakeid) 함수를 사용하십시오.
:::

[DateTime64](../data-types/datetime64.md)를 주어진 시간에 첫 번째 [스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)로 변환합니다.

**구문**

```sql
dateTime64ToSnowflake(value)
```

**인수**

- `value` — 시간과 함께한 날짜. [DateTime64](../data-types/datetime64.md).

**반환 값**

- 입력 값이 해당 시간의 첫 번째 스노우플레이크 ID로 변환됩니다.

**예제**

쿼리:

```sql
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

결과:

```response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```

## snowflakeIDToDateTime {#snowflakeidtodatetime}

[스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)의 타임스탬프 구성 요소를 [DateTime](../data-types/datetime.md) 형식으로 반환합니다.

**구문**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**인수**

- `value` — 스노우플레이크 ID. [UInt64](../data-types/int-uint.md).
- `epoch` - 스노우플레이크 ID의 에포크, 1970년 1월 1일부터 밀리초로 측정됩니다. 기본 값은 0 (1970년 1월 1일). 트위터/X 에포크 (2015년 1월 1일)를 위해 1288834974657을 제공합니다. 선택 사항. [UInt\*](../data-types/int-uint.md).
- `time_zone` — [타임존](/operations/server-configuration-parameters/settings.md#timezone). 함수는 시간 문자열을 타임존에 따라 구문 분석합니다. 선택 사항. [String](../data-types/string.md).

**반환 값**

- `value`의 타임스탬프 구성 요소를 [DateTime](../data-types/datetime.md) 값으로 반환합니다.

**예제**

쿼리:

```sql
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

결과:

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## snowflakeIDToDateTime64 {#snowflakeidtodatetime64}

[스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)의 타임스탬프 구성 요소를 [DateTime64](../data-types/datetime64.md) 형식으로 반환합니다.

**구문**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**인수**

- `value` — 스노우플레이크 ID. [UInt64](../data-types/int-uint.md).
- `epoch` - 스노우플레이크 ID의 에포크, 1970년 1월 1일부터 밀리초로 측정됩니다. 기본 값은 0 (1970년 1월 1일). 트위터/X 에포크 (2015년 1월 1일)을 위해 1288834974657을 제공합니다. 선택 사항. [UInt\*](../data-types/int-uint.md).
- `time_zone` — [타임존](/operations/server-configuration-parameters/settings.md#timezone). 함수는 시간 문자열을 타임존에 따라 구문 분석합니다. 선택 사항. [String](../data-types/string.md).

**반환 값**

- `value`의 타임스탬프 구성 요소를 [DateTime64](../data-types/datetime64.md)로, 스케일 = 3 (즉, 밀리초 정밀도)로 반환합니다.

**예제**

쿼리:

```sql
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

결과:

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## dateTimeToSnowflakeID {#datetimetosnowflakeid}

[DateTime](../data-types/datetime.md) 값을 주어진 시간에 첫 번째 [스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)로 변환합니다.

**구문**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**인수**

- `value` — 시간과 함께한 날짜. [DateTime](../data-types/datetime.md).
- `epoch` - 스노우플레이크 ID의 에포크, 1970년 1월 1일부터 밀리초로 측정됩니다. 기본 값은 0 (1970년 1월 1일)을 제공합니다. 트위터/X 에포크 (2015년 1월 1일) 위해 1288834974657을 제공합니다. 선택 사항. [UInt\*](../data-types/int-uint.md).

**반환 값**

- 입력 값을 해당 시간에 첫 번째 스노우플레이크 ID로 변환합니다.

**예제**

쿼리:

```sql
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

결과:

```response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```

## dateTime64ToSnowflakeID {#datetime64tosnowflakeid}

[DateTime64](../data-types/datetime64.md)를 주어진 시간에 첫 번째 [스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)로 변환합니다.

**구문**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**인수**

- `value` — 시간과 함께한 날짜. [DateTime64](../data-types/datetime64.md).
- `epoch` - 스노우플레이크 ID의 에포크. 1970년 1월 1일부터 밀리초로 측정됩니다. 기본 값은 0 (1970년 1월 1일)을 제공합니다. 트위터/X 에포크 (2015년 1월 1일) 위해 1288834974657을 제공합니다. 선택 사항. [UInt\*](../data-types/int-uint.md).

**반환 값**

- 입력 값을 해당 시간에 첫 번째 스노우플레이크 ID로 변환합니다.

**예제**

쿼리:

```sql
SELECT toDateTime('2021-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

결과:

```yaml
┌──────────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56.493 │ 6832626394434895872 │
└─────────────────────────┴─────────────────────┘
```

## 또한 보기 {#see-also}

- [dictGetUUID](/sql-reference/functions/ext-dict-functions#other-functions)

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->

## UUIDNumToString {#UUIDNumToString}

도입된 버전: v1.1

UUID의 이진 표현을 수용하고, 선택적으로 `variant`에 의해 형식을 지정한 후 (기본값은 `Big-endian`) 36자의 문자열을 반환합니다.

**구문**

```sql
UUIDNumToString(binary[, variant])
```

**인수**

- `binary` — UUID의 이진 표현. [`FixedString(16)`](/sql-reference/data-types/fixedstring)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)에서 지정된 변형. 1 = `Big-endian` (기본값), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)

**반환 값**

UUID를 문자열로 반환합니다. [`String`](/sql-reference/data-types/string)

**예제**

**사용 예제**

```sql title=Query
SELECT
    'a/<@];!~p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16)) AS uuid
```

```response title=Response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ a/<@];!~p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

**Microsoft 변형**

```sql title=Query
SELECT
    '@</a;]~!p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16), 2) AS uuid
```

```response title=Response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ @</a;]~!p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

## UUIDStringToNum {#UUIDStringToNum}

도입된 버전: v1.1

`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` 형식의 36자를 포함하는 문자열을 수용하고, [FixedString(16)](../data-types/fixedstring.md)으로서 이진 표현을 반환하며, 형식은 선택적으로 `variant`에 의해 지정됩니다 (기본값은 `Big-endian`).

**구문**

```sql
UUIDStringToNum(string[, variant = 1])
```

**인수**

- `string` — 36자의 문자열 또는 고정 문자열 [`String`](/sql-reference/data-types/string) 또는 [`FixedString(36)`](/sql-reference/data-types/fixedstring)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)에서 지정된 변형. 1 = `Big-endian` (기본값), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)

**반환 값**

문자열의 이진 표현을 반환합니다. [`FixedString(16)`](/sql-reference/data-types/fixedstring)

**예제**

**사용 예제**

```sql title=Query
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

**Microsoft 변형**

```sql title=Query
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid, 2) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

## UUIDToNum {#UUIDToNum}

도입된 버전: v24.5

[UUID](../data-types/uuid.md)를 수용하고 이를 [FixedString(16)](../data-types/fixedstring.md)으로 이진 표현으로 변환하며, 선택적으로 `variant`에 의해 형식을 지정합니다 (기본적으로 `Big-endian`). 이 함수는 `UUIDStringToNum(toString(uuid))`라는 두 개의 별도 함수 호출을 대체하므로 UUID에서 문자열로의 중간 변환이 필요하지 않습니다.

**구문**

```sql
UUIDToNum(uuid[, variant = 1])
```

**인수**

- `uuid` — UUID. [`String`](/sql-reference/data-types/string) 또는 [`FixedString`](/sql-reference/data-types/fixedstring)
- `variant` — [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1)에서 지정된 변형. 1 = `Big-endian` (기본값), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)

**반환 값**

UUID의 이진 표현을 반환합니다. [`FixedString(16)`](/sql-reference/data-types/fixedstring)

**예제**

**사용 예제**

```sql title=Query
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

**Microsoft 변형**

```sql title=Query
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid, 2) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

## UUIDv7ToDateTime {#UUIDv7ToDateTime}

도입된 버전: v24.5

버전 7 UUID의 타임스탬프 구성 요소를 반환합니다.

**구문**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**인수**

- `uuid` — 버전 7의 UUID. [`String`](/sql-reference/data-types/string)
- `timezone` — 선택 사항. 반환 값에 대한 [타임존 이름](../../operations/server-configuration-parameters/settings.md#timezone). [`String`](/sql-reference/data-types/string)

**반환 값**

밀리초 정밀도로 타임스탬프를 반환합니다. UUID가 유효한 버전 7 UUID가 아닐 경우 `1970-01-01 00:00:00.000`을 반환합니다. [`DateTime64(3)`](/data-types/datetime64)

**예제**

**사용 예제**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

**타임존과 함께**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                             2024-04-22 11:30:29.048 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## dateTime64ToSnowflake {#dateTime64ToSnowflake}

도입된 버전: v21.10

<DeprecatedBadge/>

:::warning
이 함수는 사용 중단되었으며, [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 설정이 활성화된 경우에만 사용할 수 있습니다. 이 함수는 미래에 제거될 것입니다.

대신 [dateTime64ToSnowflakeID](#dateTime64ToSnowflakeID) 함수를 사용하십시오.
:::

[DateTime64](../data-types/datetime64.md)를 주어진 시간에 첫 번째 [스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)로 변환합니다.

**구문**

```sql
dateTime64ToSnowflake(value)
```

**인수**

- `value` — 시간과 함께한 날짜. [`DateTime64`](/sql-reference/data-types/datetime64)

**반환 값**

해당 시간의 첫 번째 스노우플레이크 ID로 변환된 입력 값이 반환됩니다. [`Int64`](/sql-reference/data-types/int-uint)

**예제**

**사용 예제**

```sql title=Query
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

```response title=Response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```

## dateTime64ToSnowflakeID {#dateTime64ToSnowflakeID}

도입된 버전: v24.6

[`DateTime64`](../data-types/datetime64.md)를 주어진 시간에 첫 번째 [스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)로 변환합니다.

스노우플레이크 ID 생성을 위한 구현 세부사항은 ["스노우플레이크 ID 생성"](#snowflake-id-generation)를 참조하십시오.

**구문**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**인수**

- `value` — 시간과 함께한 날짜. [`DateTime`](/sql-reference/data-types/datetime) 또는 [`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — 스노우플레이크 ID의 에포크, 1970년 1월 1일부터 밀리초로 측정됩니다. 기본 값은 0 (1970년 1월 1일). 트위터/X 에포크 (2015년 1월 1일)을 위해 1288834974657을 제공합니다. [`UInt*`](/sql-reference/data-types/int-uint)

**반환 값**

해당 시간의 첫 번째 스노우플레이크 ID로 변환된 입력 값이 반환됩니다. [`UInt64`](/sql-reference/data-types/int-uint)

**예제**

**사용 예제**

```sql title=Query
SELECT toDateTime64('2025-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────────dt─┬─────────────────res─┐
│ 2025-08-15 18:57:56.493 │ 7362075066076495872 │
└─────────────────────────┴─────────────────────┘
```

## dateTimeToSnowflake {#dateTimeToSnowflake}

도입된 버전: v21.10

<DeprecatedBadge/>

:::warning
이 함수는 사용 중단되었으며, [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) 설정이 활성화된 경우에만 사용할 수 있습니다. 이 함수는 미래에 제거될 것입니다.

대신 [dateTimeToSnowflakeID](#dateTimeToSnowflakeID) 함수를 사용하십시오.
:::

[DateTime](../data-types/datetime.md) 값을 주어진 시간에 첫 번째 [스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)로 변환합니다.

**구문**

```sql
dateTimeToSnowflake(value)
```

**인수**

- `value` — 시간과 함께한 날짜. [`DateTime`](/sql-reference/data-types/datetime)

**반환 값**

해당 시간의 첫 번째 스노우플레이크 ID로 변환된 입력 값이 반환됩니다. [`Int64`](/sql-reference/data-types/int-uint)

**예제**

**사용 예제**

```sql title=Query
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

```response title=Response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```

## dateTimeToSnowflakeID {#dateTimeToSnowflakeID}

도입된 버전: v24.6

[DateTime](../data-types/datetime.md) 값을 주어진 시간에 첫 번째 [스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)로 변환합니다.

**구문**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**인수**

- `value` — 시간과 함께한 날짜. [`DateTime`](/sql-reference/data-types/datetime) 또는 [`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — 선택 사항. 스노우플레이크 ID의 에포크로, 1970년 1월 1일부터 밀리초로 측정됩니다. 기본 값은 0 (1970년 1월 1일). 트위터/X 에포크 (2015년 1월 1일) 위해 1288834974657을 제공합니다. [`UInt*`](/sql-reference/data-types/int-uint)

**반환 값**

해당 시간의 첫 번째 스노우플레이크 ID로 변환된 입력 값이 반환됩니다. [`UInt64`](/sql-reference/data-types/int-uint)

**예제**

**사용 예제**

```sql title=Query
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```

## dateTimeToUUIDv7 {#dateTimeToUUIDv7}

도입된 버전: v25.9

[DateTime](../data-types/datetime.md) 값을 주어진 시간에 [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7)로 변환합니다.

UUID 구조, 카운터 관리, 및 동시성 보장에 대한 세부사항은 ["UUIDv7 생성"](#uuidv7-generation)를 참조하십시오.

:::note
2025년 9월 현재, 버전 7 UUID는 초안 상태이며 향후 레이아웃이 변경될 수 있습니다.
:::

**구문**

```sql
dateTimeToUUIDv7(value)
```

**인수**

- `value` — 시간과 함께한 날짜. [`DateTime`](/sql-reference/data-types/datetime)

**반환 값**

UUIDv7을 반환합니다. [`UUID`](/sql-reference/data-types/uuid)

**예제**

**사용 예제**

```sql title=Query
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

```response title=Response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**같은 타임스탬프에 대해 여러 UUID의 예제**

```sql title=Query
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
```

```response title=Response
┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
│ 017b4b2d-7720-76ed-ae44-bbcc23a8c550 │
└──────────────────────────────────────┘
┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
│ 017b4b2d-7720-76ed-ae44-bbcf71ed0fd3 │
└──────────────────────────────────────┘
```

## generateSnowflakeID {#generateSnowflakeID}

도입된 버전: v24.6

[스노우플레이크 ID](https://en.wikipedia.org/wiki/Snowflake_ID)를 생성합니다.

`generateSnowflakeID` 함수는 동시 실행되는 스레드와 쿼리에서 모든 함수 호출 간에 타임스탬프 내에서 카운터 필드가 단조롭게 증가하도록 보장합니다.

스노우플레이크 ID 생성을 위한 구현 세부사항은 ["스노우플레이크 ID 생성"](#snowflake-id-generation)를 참조하십시오.

**구문**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**인수**

- `expr` — 쿼리에서 함수가 여러 번 호출될 경우 [공통 하위 표현 제거](/sql-reference/functions/overview#common-subexpression-elimination)를 우회하는 데 사용되는 임의의 [표현식](/sql-reference/syntax#expressions). 표현식의 값은 반환된 스노우플레이크 ID에 영향을 미치지 않습니다. 선택 사항.
- `machine_id` — 머신 ID, 하위 10비트가 사용됩니다. [Int64](../data-types/int-uint.md). 선택 사항.

**반환 값**

스노우플레이크 ID를 반환합니다. [`UInt64`](/sql-reference/data-types/int-uint)

**예제**

**사용 예제**

```sql title=Query
CREATE TABLE tab (id UInt64)
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

```response title=Response
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**행마다 여러 스노우플레이크 ID 생성 예제**

```sql title=Query
SELECT generateSnowflakeID(1), generateSnowflakeID(2);
```

**표현식 및 머신 ID가 포함된 예제**

```response title=Response
┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

## UUIDv4 생성 {#generateUUIDv4}

도입된 버전: v1.1

[버전 4](https://tools.ietf.org/html/rfc4122#section-4.4) [UUID](../data-types/uuid.md)를 생성합니다.

**구문**

```sql
generateUUIDv4([expr])
```

**인수**

- `expr` — 선택 사항. 쿼리에서 함수가 여러 번 호출될 경우 [공통 하위 표현 제거](/sql-reference/functions/overview#common-subexpression-elimination)를 우회하는 데 사용되는 임의의 표현식. 표현식의 값은 반환된 UUID에 영향을 미치지 않습니다.

**반환 값**

UUIDv4를 반환합니다. [`UUID`](/sql-reference/data-types/uuid)

**예제**

**사용 예제**

```sql title=Query
SELECT generateUUIDv4(number) FROM numbers(3);
```

```response title=Response
┌─generateUUIDv4(number)───────────────┐
│ fcf19b77-a610-42c5-b3f5-a13c122f65b6 │
│ 07700d36-cb6b-4189-af1d-0972f23dc3bc │
│ 68838947-1583-48b0-b9b7-cf8268dd343d │
└──────────────────────────────────────┘
```

**공통 하위 표현 제거**

```sql title=Query
SELECT generateUUIDv4(1), generateUUIDv4(1);
```

```response title=Response
┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## UUIDv7 생성 {#generateUUIDv7}

도입된 버전: v24.5

[버전 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [UUID](../data-types/uuid.md)를 생성합니다.

UUID 구조, 카운터 관리, 및 동시성 보장에 대한 세부사항은 ["UUIDv7 생성"](#uuidv7-generation)를 참조하십시오.

:::note
2025년 9월 현재, 버전 7 UUID는 초안 상태이며 향후 레이아웃이 변경될 수 있습니다.
:::

**구문**

```sql
generateUUIDv7([expr])
```

**인수**

- `expr` — 선택 사항. 쿼리에서 함수가 여러 번 호출될 경우 [공통 하위 표현 제거](/sql-reference/functions/overview#common-subexpression-elimination)를 우회하는 데 사용되는 임의의 [표현식](/sql-reference/syntax#expressions). 표현식의 값은 반환된 UUID에 영향을 미치지 않습니다. [`Any`](/sql-reference/data-types)

**반환 값**

UUIDv7을 반환합니다. [`UUID`](/sql-reference/data-types/uuid)

**예제**

**사용 예제**

```sql title=Query
SELECT generateUUIDv7(number) FROM numbers(3);
```

```response title=Response
┌─generateUUIDv7(number)───────────────┐
│ 019947fb-5766-7ed0-b021-d906f8f7cebb │
│ 019947fb-5766-7ed0-b021-d9072d0d1e07 │
│ 019947fb-5766-7ed0-b021-d908dca2cf63 │
└──────────────────────────────────────┘
```

**공통 하위 표현 제거**

```sql title=Query
SELECT generateUUIDv7(1), generateUUIDv7(1);
```

```response title=Response
┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(1)────────────────────┐
│ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## readWKTLineString {#readWKTLineString}

Introduced in: v

Well-Known Text (WKT) 형식의 LineString 기하학을 구문 분석하고 ClickHouse 내부 형식으로 반환합니다.

**구문**

```sql
readWKTLineString(wkt_string)
```

**인수**

- `wkt_string` — LineString 기하학을 나타내는 입력 WKT 문자열입니다. [`String`](/sql-reference/data-types/string)

**반환 값**

이 함수는 linestring 기하학의 ClickHouse 내부 표현을 반환합니다.

**예시**

**첫 번째 호출**

```sql title=Query
SELECT readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)');
```

```response title=Response
┌─readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)')─┐
│ [(1,1),(2,2),(3,3),(1,1)]                            │
└──────────────────────────────────────────────────────┘
```

**두 번째 호출**

```sql title=Query
SELECT toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'));
```

```response title=Response
┌─toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'))─┐
│ LineString                                                       │
└──────────────────────────────────────────────────────────────────┘
```

## snowflakeIDToDateTime {#snowflakeIDToDateTime}

Introduced in: v24.6

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)의 타임스탬프 구성 요소를 [DateTime](../data-types/datetime.md) 형식으로 반환합니다.

**구문**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**인수**

- `value` — Snowflake ID입니다. [`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — 선택 사항. 1970-01-01 이후 밀리초 단위로 Snowflake ID의 epoch입니다. 기본값은 0 (1970-01-01)입니다. Twitter/X epoch (2015-01-01)의 경우 1288834974657을 제공하십시오. [`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — 선택 사항. [타임존](/operations/server-configuration-parameters/settings.md#timezone). 이 함수는 타임존에 따라 `time_string`을 구문 분석합니다. [`String`](/sql-reference/data-types/string)

**반환 값**

`value`의 타임스탬프 구성 요소를 반환합니다. [`DateTime`](/sql-reference/data-types/datetime)

**예시**

**사용 예시**

```sql title=Query
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## snowflakeIDToDateTime64 {#snowflakeIDToDateTime64}

Introduced in: v24.6

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)의 타임스탬프 구성 요소를 [DateTime64](../data-types/datetime64.md) 형식으로 반환합니다.

**구문**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**인수**

- `value` — Snowflake ID입니다. [`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — 선택 사항. 1970-01-01 이후 밀리초 단위로 Snowflake ID의 epoch입니다. 기본값은 0 (1970-01-01)입니다. Twitter/X epoch (2015-01-01)의 경우 1288834974657을 제공하십시오. [`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — 선택 사항. [타임존](/operations/server-configuration-parameters/settings.md#timezone). 이 함수는 타임존에 따라 `time_string`을 구문 분석합니다. [`String`](/sql-reference/data-types/string)

**반환 값**

`value`의 타임스탬프 구성 요소를 밀리초 정밀도와 함께 `DateTime64`로 반환합니다. 즉, 스케일 = 3입니다. [`DateTime64`](/sql-reference/data-types/datetime64)

**예시**

**사용 예시**

```sql title=Query
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## snowflakeToDateTime {#snowflakeToDateTime}

Introduced in: v21.10

<DeprecatedBadge/>

:::warning
이 함수는 더 이상 사용되지 않으며, 설정 [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)가 활성화된 경우에만 사용할 수 있습니다.
이 함수는 미래에 어느 시점에 제거될 것입니다.

대신 함수 [`snowflakeIDToDateTime`](#snowflakeIDToDateTime)를 사용하십시오.
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)의 타임스탬프 구성 요소를 [DateTime](../data-types/datetime.md) 형식으로 추출합니다.

**구문**

```sql
snowflakeToDateTime(value[, time_zone])
```

**인수**

- `value` — Snowflake ID입니다. [`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — 선택 사항. [타임존](/operations/server-configuration-parameters/settings.md#timezone). 이 함수는 타임존에 따라 `time_string`을 구문 분석합니다. [`String`](/sql-reference/data-types/string)

**반환 값**

`value`의 타임스탬프 구성 요소를 반환합니다. [`DateTime`](/sql-reference/data-types/datetime)

**예시**

**사용 예시**

```sql title=Query
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```

## snowflakeToDateTime64 {#snowflakeToDateTime64}

Introduced in: v21.10

<DeprecatedBadge/>

:::warning
이 함수는 더 이상 사용되지 않으며, 설정 [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions)가 활성화된 경우에만 사용할 수 있습니다.
이 함수는 미래에 어느 시점에 제거될 것입니다.

대신 함수 [`snowflakeIDToDateTime64`](#snowflakeIDToDateTime64)를 사용하십시오.
:::

[Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID)의 타임스탬프 구성 요소를 [DateTime64](../data-types/datetime64.md) 형식으로 추출합니다.

**구문**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**인수**

- `value` — Snowflake ID입니다. [`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — 선택 사항. [타임존](/operations/server-configuration-parameters/settings.md#timezone). 이 함수는 타임존에 따라 `time_string`을 구문 분석합니다. [`String`](/sql-reference/data-types/string)

**반환 값**

`value`의 타임스탬프 구성 요소를 반환합니다. [`DateTime64(3)`](/sql-reference/data-types/datetime64)

**예시**

**사용 예시**

```sql title=Query
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```

## toUUIDOrDefault {#toUUIDOrDefault}

Introduced in: v21.1

문자열 값을 UUID 형식으로 변환합니다. 변환에 실패할 경우 오류를 발생시키지 않고 기본 UUID 값을 반환합니다.

이 함수는 표준 UUID 형식 (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)의 36자 문자열을 구문 분석하려고 시도합니다.
문자열을 유효한 UUID로 변환할 수 없는 경우, 함수는 제공된 기본 UUID 값을 반환합니다.

**구문**

```sql
toUUIDOrDefault(string, default)
```

**인수**

- `string` — UUID로 변환할 36자 문자열 또는 FixedString(36)입니다.
- `default` — 첫 번째 인수를 UUID 형식으로 변환할 수 없을 경우 반환할 UUID 값입니다.

**반환 값**

변환이 성공하면 변환된 UUID를 반환하며, 변환에 실패할 경우 기본 UUID를 반환합니다. [`UUID`](/sql-reference/data-types/uuid)

**예시**

**성공적인 변환으로 파싱된 UUID를 반환**

```sql title=Query
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**변환 실패 시 기본 UUID를 반환**

```sql title=Query
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## toUUIDOrNull {#toUUIDOrNull}

Introduced in: v20.12

입력 값을 `UUID` 형식으로 변환하지만 오류가 발생한 경우 `NULL`을 반환합니다.
[`toUUID`](#touuid)와 비슷하지만 변환 오류가 발생할 경우 예외를 발생시키는 대신 `NULL`을 반환합니다.

지원되는 인수:

- 표준 형식 (8-4-4-4-12 16진수 숫자)의 UUID 문자열 표현.
- 하이픈 없는 UUID 문자열 표현 (32 16진수 숫자).

지원되지 않는 인수 (반환 `NULL`):

- 잘못된 문자열 형식.
- 비문자열 유형.
- 잘못된 형식의 UUID.

**구문**

```sql
toUUIDOrNull(x)
```

**인수**

- `x` — UUID의 문자열 표현입니다. [`String`](/sql-reference/data-types/string)

**반환 값**

성공하면 UUID 값을 반환하지만, 그렇지 않으면 `NULL`을 반환합니다. [`UUID`](/sql-reference/data-types/uuid) 또는 [`NULL`](/sql-reference/syntax#null)

**예시**

**사용 예시**

```sql title=Query
SELECT
    toUUIDOrNull('550e8400-e29b-41d4-a716-446655440000') AS valid_uuid,
    toUUIDOrNull('invalid-uuid') AS invalid_uuid
```

```response title=Response
┌─valid_uuid───────────────────────────┬─invalid_uuid─┐
│ 550e8400-e29b-41d4-a716-446655440000 │         ᴺᵁᴸᴸ │
└──────────────────────────────────────┴──────────────┘
```
