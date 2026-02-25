---
description: '초 단위 이하 정밀도의 타임스탬프를 저장하는 ClickHouse의 DateTime64 데이터 타입에 대한 문서'
sidebar_label: 'DateTime64'
sidebar_position: 18
slug: /sql-reference/data-types/datetime64
title: 'DateTime64'
doc_type: 'reference'
---

# DateTime64 \{#datetime64\}

캘린더 날짜와 하루 중 시간을 초 미만 단위까지의 정밀도로 표현할 수 있는 특정 시점을 저장하는 데 사용됩니다.

틱 크기(정밀도): 10<sup>-precision</sup>초. 유효 범위: [ 0 : 9 ].
보통 정밀도 3(밀리초), 6(마이크로초), 9(나노초)를 사용합니다.

**구문:**

```sql
DateTime64(precision, [timezone])
```

내부적으로는 epoch 시작(1970-01-01 00:00:00 UTC) 이후의 &#39;tick&#39; 개수를 Int64로 저장합니다. tick 해상도는 `precision` 매개변수에 의해 결정됩니다. 추가로, `DateTime64` 타입은 전체 컬럼에 공통으로 적용되는 시간대를 저장할 수 있으며, 이는 `DateTime64` 타입 값이 텍스트 형식으로 표시되는 방식과 문자열로 지정된 값(&#39;2020-01-01 05:00:01.000&#39;)이 파싱되는 방식에 영향을 줍니다. 시간대는 테이블의 행(또는 결과 세트)에는 저장되지 않으며, 컬럼 메타데이터에 저장됩니다. 자세한 내용은 [DateTime](../../sql-reference/data-types/datetime.md)을 참조하십시오.

지원되는 값 범위: [1900-01-01 00:00:00, 2299-12-31 23:59:59.999999999]

소수점 이하 자릿수는 `precision` 매개변수에 따라 달라집니다.

주의: 최대값에서의 정밀도는 8입니다. 최대 정밀도인 9자리(나노초)를 사용하는 경우, UTC에서 지원되는 최대 값은 `2262-04-11 23:47:16`입니다.

## 예시 \{#examples\}

1. `DateTime64` 타입 컬럼이 있는 테이블을 생성한 다음 데이터를 삽입합니다:

```sql
CREATE TABLE dt64
(
    `timestamp` DateTime64(3, 'Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = MergeTree;
```

```sql
-- Parse DateTime
-- - from an integer interpreted as the number of milliseconds (because of precision 3) since 1970-01-01,
-- - from a decimal interpreted as the number of seconds before the decimal part, and based on the precision after the decimal point,
-- - from a string.

INSERT INTO dt64
VALUES
(1546300800123, 1),
(1546300800.123, 2),
('2019-01-01 00:00:00', 3);

SELECT * FROM dt64;
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

* datetime을 정수로 삽입하면, 적절히 스케일된 Unix Timestamp(UTC)로 처리됩니다. 정수 `1546300800000`(정밀도 3)은 UTC 기준 `'2019-01-01 00:00:00'`을 나타냅니다. 그러나 `timestamp` 컬럼에 `Asia/Istanbul`(UTC+3) 타임존이 지정되어 있으므로, 문자열로 출력할 때 값은 `'2019-01-01 03:00:00'`으로 표시됩니다. datetime을 소수로 삽입하면 정수로 삽입할 때와 유사하게 처리되지만, 소수점 앞의 값은 초 단위까지의 Unix Timestamp로, 소수점 뒤의 값은 정밀도로 처리됩니다.
* 문자열 값을 datetime으로 삽입하면, 컬럼에 지정된 타임존을 기준으로 처리됩니다. `'2019-01-01 00:00:00'`은 `Asia/Istanbul` 타임존의 값으로 간주되어 `1546290000000`으로 저장됩니다.

2. `DateTime64` 값 필터링

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul');
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

`DateTime`과는 달리 `DateTime64` 값은 `String` 값에서 자동으로 변환되지 않습니다.

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64(1546300800.123, 3);
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
└─────────────────────────┴──────────┘
```

삽입(insert)과는 달리 `toDateTime64` 함수는 모든 값을 소수 형태로 처리하므로, 소수점 이하 자릿수(precision)를 소수점 뒤에 지정해야 합니다.

3. `DateTime64` 타입 값에 대한 시간대(time zone)를 구하기:

```sql
SELECT toDateTime64(now(), 3, 'Asia/Istanbul') AS column, toTypeName(column) AS x;
```

```text
┌──────────────────column─┬─x──────────────────────────────┐
│ 2023-06-05 00:09:52.000 │ DateTime64(3, 'Asia/Istanbul') │
└─────────────────────────┴────────────────────────────────┘
```

4. 시간대 변환

```sql
SELECT
toDateTime64(timestamp, 3, 'Europe/London') AS lon_time,
toDateTime64(timestamp, 3, 'Asia/Istanbul') AS istanbul_time
FROM dt64;
```

```text
┌────────────────lon_time─┬───────────istanbul_time─┐
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2018-12-31 21:00:00.000 │ 2019-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```

**참고**

* [변환 함수](../../sql-reference/functions/type-conversion-functions.md)
* [날짜 및 시간을 다루는 함수](../../sql-reference/functions/date-time-functions.md)
* [`date_time_input_format` 설정](../../operations/settings/settings-formats.md#date_time_input_format)
* [`date_time_output_format` 설정](../../operations/settings/settings-formats.md#date_time_output_format)
* [`timezone` 서버 구성 매개변수](../../operations/server-configuration-parameters/settings.md#timezone)
* [`session_timezone` 설정](../../operations/settings/settings.md#session_timezone)
* [날짜 및 시간을 다루는 연산자](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
* [`Date` 데이터 타입](../../sql-reference/data-types/date.md)
* [`DateTime` 데이터 타입](../../sql-reference/data-types/datetime.md)
