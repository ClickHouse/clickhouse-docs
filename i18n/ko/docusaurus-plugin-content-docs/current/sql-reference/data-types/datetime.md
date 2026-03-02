---
description: 'ClickHouse의 DateTime 데이터 타입에 대한 문서로, 초 단위 정밀도로 타임스탬프를 저장합니다'
sidebar_label: 'DateTime'
sidebar_position: 16
slug: /sql-reference/data-types/datetime
title: 'DateTime'
doc_type: 'reference'
---

# DateTime \{#datetime\}

달력 날짜와 하루 중 시간으로 표현할 수 있는 특정 시점을 저장하는 데 사용합니다.

구문:

```sql
DateTime([timezone])
```

지원되는 값의 범위: [1970-01-01 00:00:00, 2106-02-07 06:28:15].

정밀도: 1초.


## 속도 \{#speed\}

대부분의 상황에서 `Date` 데이터 타입이 `DateTime`보다 더 빠릅니다.

`Date` 타입은 2바이트의 저장 공간이 필요한 반면 `DateTime`은 4바이트가 필요합니다. 그러나 압축을 수행할 때는 `Date`와 `DateTime` 간의 크기 차이가 더욱 커집니다. 이는 `DateTime`의 분과 초 값이 상대적으로 압축되기 어렵기 때문에 발생하는 현상입니다. 또한 `DateTime` 대신 `Date`로 필터링하고 집계하는 작업이 더 빠르게 수행됩니다.

## 사용 시 유의사항 \{#usage-remarks\}

시점은 시간대나 일광 절약 시간제 여부와 관계없이 [Unix timestamp](https://en.wikipedia.org/wiki/Unix_time)로 저장됩니다. 시간대는 `DateTime` 타입 값이 텍스트 형식으로 표시되는 방식과, 문자열로 지정된 값('2020-01-01 05:00:01')을 파싱하는 방식에 영향을 줍니다.

시간대에 독립적인 Unix timestamp가 테이블에 저장되며, 데이터 import/export를 수행하거나 값에 대해 달력 연산을 수행할 때(예: `toDate`, `toHour` 함수 등) 이를 텍스트 형식으로 변환하거나 그 반대로 변환하는 데 시간대가 사용됩니다. 시간대는 테이블의 행(또는 결과 집합(result set))에는 저장되지 않고, 컬럼 메타데이터에 저장됩니다.

지원되는 시간대 목록은 [IANA Time Zone Database](https://www.iana.org/time-zones)에서 찾을 수 있으며, `SELECT * FROM system.time_zones` 쿼리로도 확인할 수 있습니다. [목록](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)은 Wikipedia에서도 제공합니다.

테이블을 생성할 때 `DateTime` 타입 컬럼에 대해 시간대를 명시적으로 설정할 수 있습니다. 예: `DateTime('UTC')`. 시간대를 설정하지 않으면 ClickHouse는 서버 설정의 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) 파라미터 값이나 ClickHouse 서버가 시작되는 시점의 운영 체제 설정 값을 사용합니다.

[clickhouse-client](../../interfaces/cli.md)는 데이터 타입을 초기화할 때 시간대를 명시적으로 지정하지 않으면 기본적으로 서버 시간대를 적용합니다. 클라이언트 시간대를 사용하려면 `--use_client_time_zone` 파라미터와 함께 `clickhouse-client`를 실행하십시오.

ClickHouse는 [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 설정 값에 따라 값을 출력합니다. 기본 텍스트 형식은 `YYYY-MM-DD hh:mm:ss`입니다. 또한 [formatDateTime](../../sql-reference/functions/date-time-functions.md#formatDateTime) 함수를 사용해 출력 형식을 변경할 수 있습니다.

ClickHouse에 데이터를 삽입할 때는 [date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 설정 값에 따라 서로 다른 형식의 날짜 및 시간 문자열을 사용할 수 있습니다.

## 예제 \{#examples\}

**1.** `DateTime` 타입 컬럼이 있는 테이블을 생성하고 데이터를 삽입합니다:

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

* datetime 값을 정수로 삽입하면 Unix Timestamp(UTC)로 처리됩니다. `1546300800`은 UTC 기준 `'2019-01-01 00:00:00'`을 나타냅니다. 그러나 `timestamp` 컬럼에 `Asia/Istanbul` (UTC+3) 시간대가 지정되어 있으므로, 문자열로 출력할 때 해당 값은 `'2019-01-01 03:00:00'`으로 표시됩니다.
* 문자열 값을 datetime으로 삽입하면 컬럼의 시간대를 기준으로 처리됩니다. `'2019-01-01 00:00:00'`은 `Asia/Istanbul` 시간대로 간주되어 `1546290000`으로 저장됩니다.

**2.** `DateTime` 값 필터링

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime` 컬럼 값은 `WHERE` 절에서 문자열 값을 사용해 필터링할 수 있습니다. 이 값은 자동으로 `DateTime`으로 변환됩니다:

```sql
SELECT * FROM dt WHERE timestamp = '2019-01-01 00:00:00'
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

**3.** `DateTime` 타입 컬럼에서 시간대 조회하기:

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
toDateTime(timestamp, 'Asia/Istanbul') AS istanbul_time
FROM dt
```

```text
┌───────────lon_time──┬───────istanbul_time─┐
│ 2019-01-01 00:00:00 │ 2019-01-01 03:00:00 │
│ 2018-12-31 21:00:00 │ 2019-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```

시간대 변환은 메타데이터만 변경하므로 이 연산에는 추가 연산 비용이 발생하지 않습니다.


## 시간대 지원의 제한 사항 \{#limitations-on-time-zones-support\}

일부 시간대는 완전히 지원되지 않습니다. 다음과 같은 몇 가지 경우가 있습니다.

UTC로부터의 오프셋이 15분 단위의 배수가 아닐 경우, 시와 분 계산이 올바르지 않을 수 있습니다. 예를 들어, Monrovia, Liberia의 시간대는 1972년 1월 7일 이전에는 UTC -0:44:30 오프셋을 가집니다. Monrovia 시간대를 사용하는 과거 시각에 대해 계산을 수행하는 경우, 시간 처리 함수가 잘못된 결과를 반환할 수 있습니다. 1972년 1월 7일 이후의 결과는 올바르게 반환됩니다.

시간 전환(서머타임(DST) 또는 기타 이유로 인한)이 15분 단위가 아닌 시점에 수행된 경우, 해당 특정 일자에 대해서도 잘못된 결과가 나올 수 있습니다.

단조롭지 않은(비단조적) 달력 날짜의 존재입니다. 예를 들어, Happy Valley - Goose Bay에서는 2010년 11월 7일 00:01:00(자정 1분 후)에 시간이 한 시간 뒤로 전환되었습니다. 따라서 11월 6일이 끝난 후 사람들은 11월 7일의 1분 전체를 경험한 다음, 시간이 11월 6일 23:01로 되돌려졌고, 다시 59분이 지난 후에 11월 7일이 다시 시작되었습니다. ClickHouse는 아직 이러한 형태의 시간 전환은 지원하지 않습니다. 이러한 날들에는 시간 처리 함수의 결과가 다소 부정확할 수 있습니다.

유사한 문제가 2010년 Casey Antarctic station에서도 발생했습니다. 이곳에서는 3월 5일 02:00에 시간을 세 시간 뒤로 돌렸습니다. 남극 기지에서 작업 중이라면 ClickHouse 사용을 걱정할 필요는 없습니다. 다만 시간대를 UTC로 설정하거나, 약간의 부정확성이 있을 수 있음을 인지하면 됩니다.

여러 날에 걸친 시간 이동. 일부 태평양 섬들은 시간대 오프셋을 UTC+14에서 UTC-12로 변경했습니다. 이는 허용되지만, 해당 섬들의 시간대를 사용하여 변환이 이루어지던 날의 과거 시각에 대해 계산을 수행하면 약간의 부정확성이 발생할 수 있습니다.

## 일광 절약 시간제(DST) 처리 \{#handling-daylight-saving-time-dst\}

ClickHouse의 시간대가 있는 DateTime 타입은 일광 절약 시간제(DST) 전환 시 다음과 같은 경우 예기치 않은 동작을 보일 수 있습니다.

* [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)이 `simple`로 설정된 경우
* 시계가 뒤로 이동(「Fall Back」)하여 1시간이 겹치는 경우
* 시계가 앞으로 이동(「Spring Forward」)하여 1시간이 비는 경우

기본적으로 ClickHouse는 시간이 겹치는 구간에서 항상 더 이른 시각을 선택하며, 시계가 앞으로 이동하는 구간에서 존재하지 않는 시각도 해석할 수 있습니다.

예를 들어, 다음과 같은 일광 절약 시간제(DST)에서 표준시로의 전환을 살펴보십시오.

* 2023년 10월 29일 02:00:00에 시계가 01:00:00으로 뒤로 이동합니다(BST → GMT).
* 01:00:00–01:59:59 구간이 두 번 나타납니다(BST에서 한 번, GMT에서 한 번).
* ClickHouse는 항상 첫 번째 발생(BST)을 선택하므로, 시간 간격을 더할 때 예기치 않은 결과가 발생할 수 있습니다.

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

마찬가지로, 표준시에서 일광 절약 시간제로 전환되는 동안에는 1시간이 건너뛴 것처럼 보일 수 있습니다.

예를 들어:

* 2023년 3월 26일 `00:59:59`에 시계가 02:00:00으로 앞으로 이동합니다 (GMT → BST).
* `01:00:00`부터 `01:59:59`까지의 한 시간 구간은 존재하지 않습니다.

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

이 경우 ClickHouse는 존재하지 않는 시각 `2023-03-26 01:30:00`을(를) `2023-03-26 00:30:00`으로 이전 시각으로 조정합니다.


## 같이 보기 \{#see-also\}

- [타입 변환 함수](../../sql-reference/functions/type-conversion-functions.md)
- [날짜와 시간 관련 함수](../../sql-reference/functions/date-time-functions.md)
- [배열 관련 함수](../../sql-reference/functions/array-functions.md)
- [`date_time_input_format` 설정](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 설정](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 서버 구성 매개변수](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 설정](../../operations/settings/settings.md#session_timezone)
- [날짜와 시간 관련 연산자](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`Date` 데이터 타입](../../sql-reference/data-types/date.md)