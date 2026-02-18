---
description: '초 단위 정밀도로 시간 구간을 저장하는 ClickHouse의 Time 데이터 타입에 대한 문서'
slug: /sql-reference/data-types/time
sidebar_position: 15
sidebar_label: 'Time'
title: 'Time'
doc_type: 'reference'
---



# Time \{#time\}

데이터 타입 `Time`은 시, 분, 초 구성 요소를 가진 시간을 나타냅니다.
달력상의 날짜와는 무관하며, 일·월·연도 구성 요소가 필요 없는 값에 적합합니다.

구문:

```sql
Time
```

텍스트로 표현 가능한 범위: [-999:59:59, 999:59:59].

해상도: 1초.


## 구현 세부 사항 \{#implementation-details\}

**표현 및 성능**.  
`Time` 데이터 타입은 내부적으로 초 단위를 인코딩한 부호 있는 32비트 정수를 저장합니다.  
`Time`과 `DateTime` 타입의 값은 바이트 크기가 동일하므로 성능도 유사합니다.

**정규화**.  
문자열을 `Time`으로 파싱할 때, 시간 구성 요소는 정규화되지만 유효성 검사는 수행하지 않습니다.  
예를 들어, `25:70:70`은 `26:11:10`으로 해석됩니다.

**음수 값**.  
선행 마이너스 기호는 지원되며 보존됩니다.  
음수 값은 일반적으로 `Time` 값에 대한 산술 연산에서 발생합니다.  
`Time` 타입의 경우, 음수 입력은 텍스트 입력(예: `'-01:02:03'`)과 숫자 입력(예: `-3723`) 모두에서 그대로 보존됩니다.

**포화(saturation)**.  
하루 중 시간(time-of-day) 구성 요소는 [-999:59:59, 999:59:59] 범위로 제한됩니다.  
시간이 999보다 크거나(또는 -999보다 작은) 값을 가지는 경우, 텍스트 표현 및 왕복 변환 시 `999:59:59`(또는 `-999:59:59`)로 표현됩니다.

**시간대(time zones)**.  
`Time`은 시간대를 지원하지 않으며, `Time` 값은 지역적 문맥 없이 해석됩니다.  
타입 매개변수로 또는 값 생성 중에 `Time`에 대해 시간대를 지정하면 에러가 발생합니다.  
마찬가지로, `Time` 컬럼에 시간대를 적용하거나 변경하려는 시도는 지원되지 않으며 에러가 발생합니다.  
`Time` 값은 서로 다른 시간대에서 암묵적으로 재해석되지 않습니다.



## 예시 \{#examples\}

**1.** `Time` 타입 컬럼이 있는 테이블을 생성하고 데이터에 값을 삽입합니다:

```sql
CREATE TABLE tab
(
    `event_id` UInt8,
    `time` Time
)
ENGINE = TinyLog;
```

```sql
-- Parse Time
-- - from string,
-- - from integer interpreted as number of seconds since 00:00:00.
INSERT INTO tab VALUES (1, '14:30:25'), (2, 52225);

SELECT * FROM tab ORDER BY event_id;
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**2.** `Time` 값 기준으로 필터링하기

```sql
SELECT * FROM tab WHERE time = toTime('14:30:25')
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

`Time` 컬럼 값은 `WHERE` 조건식에서 문자열 값으로 필터링할 수 있습니다. 이 값은 자동으로 `Time` 값으로 변환됩니다:

```sql
SELECT * FROM tab WHERE time = '14:30:25'
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**3.** 결과 타입 확인:

```sql
SELECT CAST('14:30:25' AS Time) AS column, toTypeName(column) AS type
```

```text
   ┌────column─┬─type─┐
1. │ 14:30:25 │ Time │
   └───────────┴──────┘
```


## 같이 보기 \{#see-also\}

- [변환 함수(Type conversion functions)](../functions/type-conversion-functions.md)
- [날짜와 시간 관련 함수](../functions/date-time-functions.md)
- [배열 관련 함수](../functions/array-functions.md)
- [`date_time_input_format` 설정](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 설정](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 서버 구성 파라미터](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 설정](../../operations/settings/settings.md#session_timezone)
- [`DateTime` 데이터 타입](datetime.md)
- [`Date` 데이터 타입](date.md)
