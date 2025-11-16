---
'description': 'ClickHouse에서 서브초 정밀도로 시간 범위를 저장하는 Time64 데이터 유형에 대한 문서'
'slug': '/sql-reference/data-types/time64'
'sidebar_position': 17
'sidebar_label': 'Time64'
'title': 'Time64'
'doc_type': 'reference'
---


# Time64

데이터 유형 `Time64`는 소수 초와 함께 하루의 시간을 나타냅니다.  
캘린더 날짜 구성 요소(일, 월, 년)는 없습니다.  
`precision` 매개변수는 소수 자릿수의 수를 정의하고 따라서 틱 크기를 결정합니다.

틱 크기(정밀도): 10<sup>-precision</sup> 초. 유효 범위: 0..9. 일반적인 선택은 3(밀리초), 6(마이크로초), 9(나노초)입니다.

**구문:**

```sql
Time64(precision)
```

내부적으로, `Time64`는 서명된 64비트 십진수(Decimal64)로 소수 초의 수를 저장합니다.  
틱 해상도는 `precision` 매개변수에 의해 결정됩니다.  
시간대는 지원되지 않습니다: `Time64`와 함께 시간대를 지정하면 오류가 발생합니다.

`DateTime64`와 달리, `Time64`는 날짜 구성 요소를 저장하지 않습니다.  
자세한 내용은 [`Time`](../../sql-reference/data-types/time.md)을 참조하세요.

텍스트 표현 범위: `precision = 3`인 경우 [-999:59:59.000, 999:59:59.999]. 일반적으로 최소값은 `-999:59:59`이고 최대값은 `999:59:59`이며 최대 `precision` 소수 자릿수를 가집니다(예: `precision = 9`인 경우 최소값은 `-999:59:59.999999999`).

## Implementation details {#implementation-details}

**표현**.  
서명된 `Decimal64` 값을 소수 자릿수가 있는 소수 초로 계산합니다.

**정규화**.  
문자열을 `Time64`로 구문 분석할 때, 시간 구성 요소는 정규화되고 유효성이 검사되지 않습니다.  
예를 들어, `25:70:70`은 `26:11:10`으로 해석됩니다.

**부정 값**.  
앞쪽의 음수 기호는 지원되며 보존됩니다.  
부정 값은 일반적으로 `Time64` 값에 대한 산술 연산에서 발생합니다.  
`Time64`의 경우, 부정 입력은 텍스트(예: `'-01:02:03.123'`) 및 숫자 입력(예: `-3723.123`) 모두에서 보존됩니다.

**포화**.  
시간 구성 요소는 구성 요소로 변환하거나 텍스트로 직렬화할 때 [-999:59:59.xxx, 999:59:59.xxx] 범위로 제한됩니다.  
저장된 숫자 값은 이 범위를 초과할 수 있지만, 모든 구성 요소 추출(시, 분, 초) 및 텍스트 표현은 포화된 값을 사용합니다.

**시간대**.  
`Time64`는 시간대를 지원하지 않습니다.  
`Time64` 유형 또는 값을 생성할 때 시간대를 지정하면 오류가 발생합니다.  
마찬가지로, `Time64` 열에서 시간대를 적용하거나 변경하려는 시도는 지원되지 않으며 오류를 발생시킵니다.

## Examples {#examples}

1. `Time64` 유형 열이 있는 테이블 만들기 및 데이터 삽입:

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

2. `Time64` 값으로 필터링

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

참고: `toTime64`는 지정된 정밀도에 따라 소수 부분이 있는 초로 숫자 리터럴을 구문 분석하므로, 의도하는 소수 자릿수를 명시적으로 제공합니다.

3. 결과 유형 검사:

```sql
SELECT CAST('14:30:25.250' AS Time64(3)) AS column, toTypeName(column) AS type;
```

```text
   ┌────────column─┬─type──────┐
1. │ 14:30:25.250 │ Time64(3) │
   └───────────────┴───────────┘
```

**참고 문헌**

- [유형 변환 함수](../../sql-reference/functions/type-conversion-functions.md)
- [날짜 및 시간 작업을 위한 함수](../../sql-reference/functions/date-time-functions.md)
- [`date_time_input_format` 설정](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 설정](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 서버 구성 매개변수](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 설정](../../operations/settings/settings.md#session_timezone)
- [날짜 및 시간 작업을 위한 연산자](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` 데이터 유형](../../sql-reference/data-types/date.md)
- [`Time` 데이터 유형](../../sql-reference/data-types/time.md)
- [`DateTime` 데이터 유형](../../sql-reference/data-types/datetime.md)
