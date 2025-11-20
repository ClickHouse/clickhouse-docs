---
'description': 'ClickHouse의 DateTime 데이터 타입에 대한 문서로, 초精度 타임스탬프를 저장합니다.'
'sidebar_label': 'DateTime'
'sidebar_position': 16
'slug': '/sql-reference/data-types/datetime'
'title': 'DateTime'
'doc_type': 'reference'
---


# DateTime

시간의 순간을 저장할 수 있게 해주며, 이는 달력 날짜와 하루의 시간을 표현할 수 있습니다.

문법:

```sql
DateTime([timezone])
```

지원되는 값의 범위: \[1970-01-01 00:00:00, 2106-02-07 06:28:15\].

해상도: 1초.

## Speed {#speed}

`Date` 데이터 유형은 _대부분_의 조건에서 `DateTime`보다 빠릅니다.

`Date` 유형은 2바이트의 저장 공간을 요구하며, `DateTime`은 4바이트를 요구합니다. 그러나 압축 중에는 `Date`와 `DateTime` 간의 크기 차이가 더 커집니다. 이는 `DateTime`에서 분과 초가 덜 압축 가능하기 때문입니다. `Date` 대신 `DateTime`을 필터링하고 집계하는 것도 더 빠릅니다.

## Usage Remarks {#usage-remarks}

특정 시점은 시간대나 일광 절약 시간을 무시하고 [Unix timestamp](https://en.wikipedia.org/wiki/Unix_time)로 저장됩니다. 시간대는 `DateTime` 유형 값의 텍스트 형식으로 표시되는 방식과 문자열로 지정된 값을 파싱하는 방법에 영향을 미칩니다 ('2020-01-01 05:00:01').

시간대에 구애받지 않는 Unix timestamp는 테이블에 저장되며, 시간대는 데이터 가져오기/내보내기 중 텍스트 형식으로 변환하거나 값에 대한 캘린더 계산을 수행하는 데 사용됩니다 (예: `toDate`, `toHour` 함수 등). 시간대는 테이블의 행(또는 결과 집합)에는 저장되지 않지만, 열 메타데이터에 저장됩니다.

지원되는 시간대 목록은 [IANA Time Zone Database](https://www.iana.org/time-zones)에서 확인할 수 있으며, `SELECT * FROM system.time_zones`로 쿼리할 수도 있습니다. [이 목록](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)은 Wikipedia에서도 확인할 수 있습니다.

테이블 생성 시 `DateTime` 유형의 열에 대해 명시적으로 시간대를 설정할 수 있습니다. 예: `DateTime('UTC')`. 시간대가 설정되지 않은 경우, ClickHouse는 ClickHouse 서버 시작 시점에 서버 설정의 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) 매개변수나 운영 체제 설정의 값을 사용합니다.

[clickhouse-client](../../interfaces/cli.md)는 데이터 유형을 초기화할 때 시간대가 명시적으로 설정되지 않으면 기본적으로 서버 시간대를 적용합니다. 클라이언트 시간대를 사용하려면 `--use_client_time_zone` 매개변수로 `clickhouse-client`을 실행하세요.

ClickHouse는 [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 설정의 값에 따라 값을 출력합니다. 기본적으로 `YYYY-MM-DD hh:mm:ss` 텍스트 형식입니다. 추가로, [formatDateTime](../../sql-reference/functions/date-time-functions.md#formatDateTime) 함수를 사용하여 출력을 변경할 수 있습니다.

ClickHouse에 데이터를 삽입할 때는 [date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 설정의 값에 따라 서로 다른 형식의 날짜 및 시간 문자열을 사용할 수 있습니다.

## Examples {#examples}

**1.** `DateTime` 유형의 열로 테이블을 생성하고 데이터를 삽입합니다:

```sql
CREATE TABLE dt
(
    `timestamp` DateTime('Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse DateTime
-- - from string,
-- - from integer interpreted as number of seconds since 1970-01-01.
INSERT INTO dt VALUES ('2019-01-01 00:00:00', 1), (1546300800, 2);

SELECT * FROM dt;
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
│ 2019-01-01 03:00:00 │        2 │
└─────────────────────┴──────────┘
```

- 정수로 datetime을 삽입할 때, 이는 Unix Timestamp (UTC)로 처리됩니다. `1546300800`은 UTC의 `'2019-01-01 00:00:00'`을 나타냅니다. 그러나 `timestamp` 열에 `Asia/Istanbul` (UTC+3) 시간대가 지정되어 있기 때문에 문자열로 출력할 경우 값은 `'2019-01-01 03:00:00'`으로 표시됩니다.
- 문자열 값을 datetime으로 삽입할 때, 이는 열 시간대에 있는 것으로 간주됩니다. `'2019-01-01 00:00:00'`는 `Asia/Istanbul` 시간대에 있는 것으로 처리되며 `1546290000`으로 저장됩니다.

**2.** `DateTime` 값으로 필터링

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime` 열 값은 `WHERE` 술어에서 문자열 값을 사용하여 필터링할 수 있습니다. 자동으로 `DateTime`으로 변환됩니다:

```sql
SELECT * FROM dt WHERE timestamp = '2019-01-01 00:00:00'
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

**3.** `DateTime` 유형 열의 시간대 얻기:

```sql
SELECT toDateTime(now(), 'Asia/Istanbul') AS column, toTypeName(column) AS x
```

```text
┌──────────────column─┬─x─────────────────────────┐
│ 2019-10-16 04:12:04 │ DateTime('Asia/Istanbul') │
└─────────────────────┴───────────────────────────┘
```

**4.** 시간대 변환

```sql
SELECT
toDateTime(timestamp, 'Europe/London') AS lon_time,
toDateTime(timestamp, 'Asia/Istanbul') AS mos_time
FROM dt
```

```text
┌───────────lon_time──┬────────────mos_time─┐
│ 2019-01-01 00:00:00 │ 2019-01-01 03:00:00 │
│ 2018-12-31 21:00:00 │ 2019-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```

시간대 변환은 메타데이터만 변경하므로, 이 작업에는 계산 비용이 없습니다.

## Limitations on time zones support {#limitations-on-time-zones-support}

일부 시간대는 완전히 지원되지 않을 수 있습니다. 몇 가지 경우가 있습니다:

UTC로부터의 오프셋이 15분의 배수가 아닐 경우, 시간과 분의 계산이 부정확할 수 있습니다. 예를 들어, 라이베리아의 몬로비아 시간대는 1972년 1월 7일 이전에 UTC -0:44:30의 오프셋을 가졌습니다. 몬로비아 시간대에서 역사적 시간의 계산을 수행할 경우, 시간 처리 함수가 부정확한 결과를 줄 수 있습니다. 그러나 1972년 1월 7일 이후의 결과는 여전히 정확합니다.

시간 전환(일광 절약 시간이나 기타 이유로 수행된)은 15분의 배수가 아닌 시점에서 이루어진 경우, 특정 날에 부정확한 결과가 나올 수 있습니다.

비단조적 달력 날짜. 예를 들어, 해피 밸리 - 구스 베이에서는 2010년 11월 7일 00:01:00에 시간이 1시간 뒤로 전환되었습니다(자정이 지난 후 1분). 따라서 11월 6일이 끝나고 사람들은 11월 7일의 전체 1분을 관찰한 후, 시간이 다시 11월 6일 23:01로 변경되고 59분이 지나면 11월 7일이 다시 시작되었습니다. ClickHouse는 (아직) 이런 종류의 문제를 지원하지 않습니다. 이와 같은 날에 시간 처리 함수의 결과가 약간 부정확할 수 있습니다.

2010년 케이스 앤타르틱 스테이션에서도 비슷한 문제가 발생했습니다. 그들은 3월 5일 02:00에 시간을 3시간 뒤로 변경했습니다. 앤타르틱 스테이션에서 작업하고 있다면 ClickHouse를 사용하는 것을 두려워하지 마십시오. 다만 UTC로 시간대를 설정하거나 부정확성에 대해 인지하십시오.

여러 날에 대한 시간 이동. 일부 태평양 섬들은 UTC+14에서 UTC-12로 시간대 오프셋을 변경했습니다. 이는 문제 없지만 이러한 시간대에 대한 역사적 시간 포인트에서 계산을 수행할 때 부정확성이 발생할 수 있습니다.

## Handling daylight saving time (DST) {#handling-daylight-saving-time-dst}

ClickHouse의 DateTime 유형과 시간대는 일광 절약 시간(DST) 전환 동안 예기치 않은 동작을 나타낼 수 있습니다. 특히 다음과 같은 경우에 그렇습니다:

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) 설정이 `simple`로 설정된 경우.
- 시계가 뒤로 움직이는("Fall Back") 경우, 1시간 중복 발생.
- 시계가 앞으로 움직이는("Spring Forward") 경우, 1시간의 간격 발생.

기본적으로 ClickHouse는 항상 중복되는 시간의 더 이른 발생을 선택하며, 앞쪽 이동에서 비존재 시간을 해석할 수 있습니다.

예를 들어, 일광 절약 시간(DST)에서 표준 시간으로의 전환을 고려해 보십시오.

- 2023년 10월 29일 02:00:00에 시계가 01:00:00으로 뒤로 이동합니다 (BST → GMT).
- 01:00:00 – 01:59:59 시간대가 두 번 나타납니다(한 번은 BST에서, 한 번은 GMT에서).
- ClickHouse는 항상 첫 번째 발생(BST)을 선택하여 시간 간격 추가 시 예기치 않은 결과를 초래합니다.

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

유사하게, 표준 시간에서 일광 절약 시간으로의 전환 동안 한 시간이 건너뛸 수 있습니다.

예를 들어:

- 2023년 3월 26일 00:59:59에 시계가 02:00:00으로 점프합니다 (GMT → BST).
- `01:00:00` – `01:59:59` 시간대는 존재하지 않습니다.

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

이 경우 ClickHouse는 존재하지 않는 시간 `2023-03-26 01:30:00`를 `2023-03-26 00:30:00`으로 이동시킵니다.

## See Also {#see-also}

- [타입 변환 함수](../../sql-reference/functions/type-conversion-functions.md)
- [날짜와 시간 작업을 위한 함수](../../sql-reference/functions/date-time-functions.md)
- [배열 작업을 위한 함수](../../sql-reference/functions/array-functions.md)
- [date_time_input_format 설정](../../operations/settings/settings-formats.md#date_time_input_format)
- [date_time_output_format 설정](../../operations/settings/settings-formats.md#date_time_output_format)
- [timezone 서버 구성 매개변수](../../operations/server-configuration-parameters/settings.md#timezone)
- [session_timezone 설정](../../operations/settings/settings.md#session_timezone)
- [날짜와 시간 작업을 위한 연산자](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [Date 데이터 유형](../../sql-reference/data-types/date.md)
