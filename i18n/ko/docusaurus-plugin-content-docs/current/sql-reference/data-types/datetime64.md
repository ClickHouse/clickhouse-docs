---
'description': 'ClickHouse에서 서브 초 정밀도로 타임스탬프를 저장하는 DateTime64 데이터 유형에 대한 문서'
'sidebar_label': 'DateTime64'
'sidebar_position': 18
'slug': '/sql-reference/data-types/datetime64'
'title': 'DateTime64'
'doc_type': 'reference'
---


# DateTime64

시간의 순간을 저장할 수 있게 해주며, 이는 정의된 서브-초 정밀도로 표현된 캘린더 날짜와 하루의 시간으로 나타낼 수 있습니다.

틱 크기(정밀도): 10<sup>-정밀도</sup> 초. 유효 범위: [ 0 : 9 ].
일반적으로 사용되는 값: 3 (밀리초), 6 (마이크로초), 9 (나노초).

**구문:**

```sql
DateTime64(precision, [timezone])
```

내부적으로는 epoch 시작(1970-01-01 00:00:00 UTC) 이후의 '틱' 수로 데이터를 Int64형으로 저장합니다. 틱 해상도는 정밀도 매개변수에 의해 결정됩니다. 추가적으로, `DateTime64` 유형은 전체 컬럼에 대해 동일한 시간대를 저장할 수 있으며, 이는 `DateTime64` 유형 값이 텍스트 형식으로 표시되는 방식과 문자열로 지정된 값이 파싱되는 방식에 영향을 미칩니다('2020-01-01 05:00:01.000'). 시간대는 테이블의 행(또는 결과 집합)에 저장되지 않지만, 컬럼 메타데이터에 저장됩니다. 자세한 내용은 [DateTime](../../sql-reference/data-types/datetime.md)를 참조하세요.

지원되는 값의 범위: \[1900-01-01 00:00:00, 2299-12-31 23:59:59.999999999\]

소수점 이하 숫자의 수는 정밀도 매개변수에 따라 달라집니다.

참고: 최대 값의 정밀도는 8입니다. 최대 정밀도가 9자리(나노초)로 사용될 경우, 최대 지원 값은 UTC에서 `2262-04-11 23:47:16`입니다.

## 예제 {#examples}

1. `DateTime64` 유형의 컬럼으로 테이블을 생성하고 데이터를 삽입하기:

```sql
CREATE TABLE dt64
(
    `timestamp` DateTime64(3, 'Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse DateTime
-- - from integer interpreted as number of microseconds (because of precision 3) since 1970-01-01,
-- - from decimal interpreted as number of seconds before the decimal part, and based on the precision after the decimal point,
-- - from string.
INSERT INTO dt64 VALUES (1546300800123, 1), (1546300800.123, 2), ('2019-01-01 00:00:00', 3);

SELECT * FROM dt64;
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

- 정수를 사용하여 날짜 및 시간을 삽입할 때, 적절하게 조정된 Unix Timestamp(UTC)로 처리됩니다. `1546300800000`(정밀도 3)은 `'2019-01-01 00:00:00'` UTC를 나타냅니다. 그러나 `timestamp` 컬럼에 `Asia/Istanbul` (UTC+3) 시간대가 지정되어 있기 때문에, 문자열로 출력할 때 해당 값은 `'2019-01-01 03:00:00'`으로 표시됩니다. 소수를 사용하여 날짜 및 시간을 삽입할 때는, 정수와 유사하게 처리되지만 소수점 앞의 값은 초까지 포함된 Unix Timestamp이고, 소수점 뒤의 값은 정밀도로 처리됩니다.
- 문자열 값을 날짜 및 시간으로 삽입할 때, 해당 컬럼의 시간대에 있는 것으로 처리됩니다. `'2019-01-01 00:00:00'`는 `Asia/Istanbul` 시간대에 있는 것으로 간주되며 `1546290000000`으로 저장됩니다.

2. `DateTime64` 값 필터링

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul');
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

`DateTime`과 달리, `DateTime64` 값은 자동으로 `String`에서 변환되지 않습니다.

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64(1546300800.123, 3);
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
└─────────────────────────┴──────────┘
```

삽입과 달리, `toDateTime64` 함수는 모든 값을 소수형으로 처리하므로, 정밀도를 소수점 뒤에 주어야 합니다.

3. `DateTime64` 유형 값에 대한 시간대 가져오기:

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

**참조**

- [형 변환 함수](../../sql-reference/functions/type-conversion-functions.md)
- [날짜 및 시간 작업을 위한 함수](../../sql-reference/functions/date-time-functions.md)
- [ `date_time_input_format` 설정](../../operations/settings/settings-formats.md#date_time_input_format)
- [ `date_time_output_format` 설정](../../operations/settings/settings-formats.md#date_time_output_format)
- [ `timezone` 서버 구성 매개변수](../../operations/server-configuration-parameters/settings.md#timezone)
- [ `session_timezone` 설정](../../operations/settings/settings.md#session_timezone)
- [날짜 및 시간을 작업하기 위한 연산자](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` 데이터 유형](../../sql-reference/data-types/date.md)
- [`DateTime` 데이터 유형](../../sql-reference/data-types/datetime.md)
