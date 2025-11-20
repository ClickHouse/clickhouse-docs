---
'description': 'ClickHouse의 시간 데이터 타입에 대한 문서로, 초 정밀도로 시간 범위를 저장합니다.'
'slug': '/sql-reference/data-types/time'
'sidebar_position': 15
'sidebar_label': '시간'
'title': '시간'
'doc_type': 'reference'
---


# 시간

데이터 유형 `Time`은 시, 분 및 초 구성 요소를 가진 시간을 나타냅니다.
이는 특정 달력 날짜와 독립적이며, 일, 월 및 연 구성 요소가 필요 없는 값에 적합합니다. 

구문:

```sql
Time
```

텍스트 표현 범위: [-999:59:59, 999:59:59].

해상도: 1초.

## 구현 세부정보 {#implementation-details}

**표현 및 성능**.
데이터 유형 `Time`은 내부적으로 초를 인코딩하는 부호 있는 32비트 정수를 저장합니다.
`Time` 및 `DateTime` 유형의 값은 동일한 바이트 크기를 가지므로 성능이 비교 가능합니다.

**정규화**.
문자열을 `Time`으로 구문 분석할 때, 시간 구성 요소는 정규화되며 검증되지 않습니다.
예를 들어, `25:70:70`은 `26:11:10`으로 해석됩니다.

**음수 값**.
앞에 있는 음수 기호가 지원되며 보존됩니다.
음수 값은 일반적으로 `Time` 값에 대한 산술 연산에서 발생합니다.
`Time` 유형의 경우, 음수 입력은 텍스트(예: `'-01:02:03'`)와 숫자 입력(예: `-3723`) 모두 보존됩니다.

**포화**.
하루 중 시간 구성 요소는 범위 [-999:59:59, 999:59:59]로 제한됩니다.
999을 초과하는(또는 -999 미만의) 시간 값은 텍스트를 통해 `999:59:59`(또는 `-999:59:59`)로 기록 및 반환됩니다.

**시간대**.
`Time`은 시간대를 지원하지 않으며, 즉 `Time` 값은 지역적 맥락 없이 해석됩니다.
`Time`에 대해 타입 매개변수로 또는 값 생성을 하는 동안 시간대를 지정하면 오류가 발생합니다.
마찬가지로, `Time` 컬럼에서 시간대를 적용하거나 변경하려고 시도하면 지원되지 않으며 오류가 발생합니다.
`Time` 값은 다른 시간대에서 조용히 재해석되지 않습니다.

## 예제 {#examples}

**1.** `Time` 유형의 컬럼을 가진 테이블 생성 및 데이터 삽입:

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

**2.** `Time` 값 필터링

```sql
SELECT * FROM tab WHERE time = toTime('14:30:25')
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

`Time` 컬럼 값은 `WHERE` 절에서 문자열 값을 사용하여 필터링할 수 있습니다. 자동으로 `Time`으로 변환됩니다:

```sql
SELECT * FROM tab WHERE time = '14:30:25'
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**3.** 결과 유형 검사:

```sql
SELECT CAST('14:30:25' AS Time) AS column, toTypeName(column) AS type
```

```text
   ┌────column─┬─type─┐
1. │ 14:30:25 │ Time │
   └───────────┴──────┘
```

## 참고 {#see-also}

- [유형 변환 함수](../functions/type-conversion-functions.md)
- [날짜 및 시간 처리 함수](../functions/date-time-functions.md)
- [배열 작업 함수](../functions/array-functions.md)
- [`date_time_input_format` 설정](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 설정](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 서버 구성 매개변수](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 설정](../../operations/settings/settings.md#session_timezone)
- [`DateTime` 데이터 유형](datetime.md)
- [`Date` 데이터 유형](date.md)
