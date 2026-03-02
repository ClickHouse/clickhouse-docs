---
description: 'ClickHouse에서 초 이하 단위 정밀도로 시간 범위를 저장하는
  Time64 데이터 타입에 대한 문서'
slug: /sql-reference/data-types/time64
sidebar_position: 17
sidebar_label: 'Time64'
title: 'Time64'
doc_type: 'reference'
---



# Time64 \{#time64\}

`Time64` 데이터 타입은 소수 초를 포함한 하루 중 시각을 표현합니다.
날짜(일, 월, 연도)에 해당하는 달력 구성 요소는 포함하지 않습니다.
`precision` 파라미터는 소수 자릿수의 개수를 정의하며, 이에 따라 틱 크기(tick size)가 결정됩니다.

틱 크기(precision): 10<sup>-precision</sup>초. 유효 범위: 0..9. 일반적으로 3(밀리초), 6(마이크로초), 9(나노초)를 사용합니다.

**Syntax:**

```sql
Time64(precision)
```

내부적으로 `Time64`는 부호 있는 64비트 10진수(Decimal64) 형식의 초 단위 소수 값을 저장합니다.
틱 해상도는 `precision` 매개변수에 의해 결정됩니다.
시간대는 지원되지 않습니다. `Time64`에 시간대를 지정하면 오류가 발생합니다.

`DateTime64`와 달리 `Time64`는 날짜 구성 요소를 저장하지 않습니다.
[`Time`](../../sql-reference/data-types/time.md)도 참고하십시오.

텍스트 표현 가능 범위: `precision = 3`인 경우 [-999:59:59.000, 999:59:59.999]입니다. 일반적으로 최소값은 `-999:59:59`, 최대값은 `999:59:59`이며, 분수 자릿수는 최대 `precision`자리까지 가질 수 있습니다 (`precision = 9`인 경우 최소값은 `-999:59:59.999999999`입니다).


## 구현 세부 사항 \{#implementation-details\}

**표현(Representation)**.
부호 있는 `Decimal64` 값을 사용하여 초 단위의 소수 부분을 `precision` 자릿수까지 계산합니다.

**정규화(Normalization)**.
문자열을 `Time64`로 파싱할 때, 시간 구성 요소는 정규화되지만 유효성 검사는 수행하지 않습니다.
예를 들어, `25:70:70`은 `26:11:10`으로 해석됩니다.

**음수 값(Negative values)**.
선행 마이너스 기호를 지원하며 그대로 유지합니다.
음수 값은 일반적으로 `Time64` 값에 대한 산술 연산에서 발생합니다.
`Time64`의 경우, 음수 입력은 텍스트 입력(`'-01:02:03.123'` 등)과 숫자 입력(`-3723.123` 등) 모두에서 그대로 유지됩니다.

**포화(Saturation)**.
구성 요소로 변환하거나 텍스트로 직렬화할 때, 하루 중 시간(time-of-day) 구성 요소는 [-999:59:59.xxx, 999:59:59.xxx] 범위로 제한됩니다.
저장된 숫자 값은 이 범위를 초과할 수 있지만, 어떤 구성 요소(시, 분, 초)를 추출하거나 텍스트로 표현할 때는 항상 이 범위로 포화된 값이 사용됩니다.

**시간대(Time zones)**.
`Time64`는 시간대를 지원하지 않습니다.
`Time64` 타입 또는 값을 생성할 때 시간대를 지정하면 오류가 발생합니다.
마찬가지로, `Time64` 컬럼에 시간대를 적용하거나 변경하려는 시도는 지원되지 않으며 오류가 발생합니다.



## 예시 \{#examples\}

1. `Time64` 타입 컬럼을 가진 테이블을 생성하고 데이터를 삽입합니다:

```sql
CREATE TABLE tab64
(
    `event_id` UInt8,
    `time` Time64(3)
)
ENGINE = TinyLog;
```

```sql
-- Parse Time64
-- - from string,
-- - from a number of seconds since 00:00:00 (fractional part according to precision).
INSERT INTO tab64 VALUES (1, '14:30:25'), (2, 52225.123), (3, '14:30:25');

SELECT * FROM tab64 ORDER BY event_id;
```

```text
   ┌─event_id─┬────────time─┐
1. │        1 │ 14:30:25.000 │
2. │        2 │ 14:30:25.123 │
3. │        3 │ 14:30:25.000 │
   └──────────┴──────────────┘
```

2. `Time64` 값에 대한 필터링

```sql
SELECT * FROM tab64 WHERE time = toTime64('14:30:25', 3);
```

```text
   ┌─event_id─┬────────time─┐
1. │        1 │ 14:30:25.000 │
2. │        3 │ 14:30:25.000 │
   └──────────┴──────────────┘
```

```sql
SELECT * FROM tab64 WHERE time = toTime64(52225.123, 3);
```

```text
   ┌─event_id─┬────────time─┐
1. │        2 │ 14:30:25.123 │
   └──────────┴──────────────┘
```

참고: `toTime64`는 지정된 정밀도에 따라 숫자 리터럴을 소수 부분을 포함한 초 단위로 해석하므로, 의도한 소수 자릿수를 명시적으로 지정해야 합니다.

3. 결과 타입 확인:

```sql
SELECT CAST('14:30:25.250' AS Time64(3)) AS column, toTypeName(column) AS type;
```

```text
   ┌────────column─┬─type──────┐
1. │ 14:30:25.250 │ Time64(3) │
   └───────────────┴───────────┘
```

**함께 보기**

* [형 변환 함수(변환 함수, Type conversion functions)](../../sql-reference/functions/type-conversion-functions.md)
* [날짜와 시간 처리용 함수(Functions for working with dates and times)](../../sql-reference/functions/date-time-functions.md)
* [`date_time_input_format` 설정](../../operations/settings/settings-formats.md#date_time_input_format)
* [`date_time_output_format` 설정](../../operations/settings/settings-formats.md#date_time_output_format)
* [`timezone` 서버 구성 매개변수](../../operations/server-configuration-parameters/settings.md#timezone)
* [`session_timezone` 설정](../../operations/settings/settings.md#session_timezone)
* [날짜와 시간 처리용 연산자(Operators for working with dates and times)](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
* [`Date` 데이터 타입](../../sql-reference/data-types/date.md)
* [`Time` 데이터 타입](../../sql-reference/data-types/time.md)
* [`DateTime` 데이터 타입](../../sql-reference/data-types/datetime.md)
