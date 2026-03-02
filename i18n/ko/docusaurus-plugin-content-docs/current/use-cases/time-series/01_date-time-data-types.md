---
title: '날짜 및 시간 데이터 타입 - 시계열'
sidebar_label: '날짜 및 시간 데이터 타입'
description: 'ClickHouse에서 사용하는 시계열 데이터 타입.'
slug: /use-cases/time-series/date-time-data-types
keywords: ['time-series', 'DateTime', 'DateTime64', 'Date', 'Time', 'Time64', 'data types', 'temporal data', 'timestamp']
show_related_blogs: true
doc_type: 'reference'
---

# 날짜 및 시간 데이터 타입 \{#date-and-time-data-types\}

효과적인 시계열 데이터 관리를 위해서는 다양한 날짜 및 시간 타입이 필요하며, ClickHouse는 이에 정확히 부합하는 기능을 제공합니다.
간결한 날짜 표현부터 나노초 정밀도의 고정밀 타임스탬프까지, 이러한 타입들은 다양한 시계열 애플리케이션의 실용적인 요구사항과 저장 효율성 간의 균형을 맞추도록 설계되었습니다.

과거 금융 데이터, IoT 센서 측정값, 미래 시점의 이벤트 등 어떤 데이터를 다루더라도, ClickHouse의 날짜 및 시간 타입은 다양한 시간 기반 데이터 시나리오를 처리하는 데 필요한 유연성을 제공합니다.
지원되는 타입의 범위를 통해 저장 공간과 쿼리 성능을 모두 최적화하면서, 사용 사례에서 요구하는 정밀도를 유지할 수 있습니다.

* [`Date`](/sql-reference/data-types/date) 타입은 대부분의 경우에 충분합니다. 이 타입은 날짜를 저장하는 데 2바이트가 필요하며, 범위는 `[1970-01-01, 2149-06-06]`로 제한됩니다.

* [`Date32`](/sql-reference/data-types/date32)는 더 넓은 날짜 범위를 다룹니다. 날짜를 저장하는 데 4바이트가 필요하며, 범위는 `[1900-01-01, 2299-12-31]`로 제한됩니다.

* [`DateTime`](/sql-reference/data-types/datetime)은 초 단위 정밀도의 날짜-시간 값을 저장하며, 범위는 `[1970-01-01 00:00:00, 2106-02-07 06:28:15]`입니다. 값 하나당 4바이트가 필요합니다.

* 더 높은 정밀도가 필요한 경우 [`DateTime64`](/sql-reference/data-types/datetime64)를 사용할 수 있습니다. 이는 최대 나노초 정밀도로 시간을 저장할 수 있으며, 범위는 `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]`입니다. 값 하나당 8바이트가 필요합니다.

다양한 날짜 타입을 저장하는 테이블을 생성해 보겠습니다:

```sql
CREATE TABLE dates
(
    `date` Date,
    `wider_date` Date32,
    `datetime` DateTime,
    `precise_datetime` DateTime64(3),
    `very_precise_datetime` DateTime64(9)
)
ENGINE = MergeTree
ORDER BY tuple();
```

[`now()`](/sql-reference/functions/date-time-functions#now) 함수를 사용하여 현재 시간을 반환할 수 있으며, 첫 번째 인자로 정밀도를 지정하여 시간을 얻으려면 [`now64()`](/sql-reference/functions/date-time-functions#now64)를 사용합니다.

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

이렇게 하면 각 컬럼의 유형에 맞는 시간 값으로 컬럼이 채워집니다.

```sql
SELECT * FROM dates
FORMAT Vertical;
```

```text
Row 1:
──────
date:                  2025-03-12
wider_date:            2125-03-12
datetime:              2025-03-12 11:39:07
precise_datetime:      2025-03-12 11:39:07.196
very_precise_datetime: 2025-03-12 11:39:07.196724000
```

## Time 및 Time64 타입 \{#time-series-time-types\}

날짜 구성 요소 없이 시각(time-of-day) 값만 저장해야 하는 시나리오를 위해, ClickHouse는 버전 25.6에서 도입된 [`Time`](/sql-reference/data-types/time) 및 [`Time64`](/sql-reference/data-types/time64) 타입을 제공합니다. 이는 반복 일정, 일별 패턴을 표현하거나 날짜와 시간 구성 요소를 분리하는 것이 적절한 상황에서 유용합니다.

:::note
`Time` 및 `Time64`를 사용하려면 다음 설정을 활성화해야 합니다: `SET enable_time_time64_type = 1;`

이 타입들은 버전 25.6에서 도입되었습니다.
:::

`Time` 타입은 시, 분, 초를 초 단위 정밀도로 저장합니다. 내부적으로 부호 있는 32비트 정수로 저장되며, `[-999:59:59, 999:59:59]` 범위를 지원하여 24시간을 초과하는 값도 허용합니다. 이는 경과 시간을 추적하거나 단일 날짜를 넘어서는 값을 결과로 만드는 산술 연산을 수행할 때 유용합니다.

초 단위 이하 정밀도가 필요한 경우, `Time64`는 분수 초(fractional seconds)를 포함해 시간을 부호 있는 Decimal64 값으로 저장합니다. 분수 자릿수의 개수를 정의하기 위해 0~9 사이의 정밀도(precision) 매개변수를 허용합니다. 일반적인 정밀도 값은 3(밀리초), 6(마이크로초), 9(나노초)입니다.

`Time`과 `Time64` 모두 타임존을 지원하지 않으며, 지역적 문맥이 없는 순수한 시각(time-of-day) 값만을 표현합니다.

시간 컬럼이 포함된 테이블을 생성해 보겠습니다:

```sql
SET enable_time_time64_type = 1;

CREATE TABLE time_examples
(
    `event_id` UInt8,
    `basic_time` Time,
    `precise_time` Time64(3)
)
ENGINE = MergeTree
ORDER BY event_id;
```

문자열 리터럴 또는 숫자 값을 사용하여 시간 값을 삽입할 수 있습니다. `Time`의 경우 숫자 값은 00:00:00 이후의 초로 해석됩니다. `Time64`의 경우 숫자 값은 00:00:00 이후의 초로 해석되며, 소수 부분은 해당 컬럼의 정밀도에 따라 해석됩니다:

```sql
INSERT INTO time_examples VALUES 
    (1, '14:30:25', '14:30:25.123'),
    (2, 52225, 52225.456),
    (3, '26:11:10', '26:11:10.789');  -- Values normalize beyond 24 hours

SELECT * FROM time_examples ORDER BY event_id;
```

```text
┌─event_id─┬─basic_time─┬─precise_time─┐
│        1 │ 14:30:25   │ 14:30:25.123 │
│        2 │ 14:30:25   │ 14:30:25.456 │
│        3 │ 26:11:10   │ 26:11:10.789 │
└──────────┴────────────┴──────────────┘
```

시간 값도 직관적으로 필터링할 수 있습니다.

```sql
SELECT * FROM time_examples WHERE basic_time = '14:30:25';
```

## 타임존 \{#time-series-timezones\}

많은 사용 사례에서는 시간대 정보도 함께 저장해야 합니다. `DateTime` 또는 `DateTime64` 형의 마지막 인수로 시간대를 설정할 수 있습니다:

```sql
CREATE TABLE dtz
(
    `id` Int8,
    `dt_1` DateTime('Europe/Berlin'),
    `dt_2` DateTime,
    `dt64_1` DateTime64(9, 'Europe/Berlin'),
    `dt64_2` DateTime64(9)
)
ENGINE = MergeTree
ORDER BY id;
```

DDL에서 시간대를 정의했으므로 이제 서로 다른 시간대를 사용해 시각 값을 삽입할 수 있습니다:

```sql
INSERT INTO dtz 
SELECT 1, 
       toDateTime('2022-12-12 12:13:14', 'America/New_York'),
       toDateTime('2022-12-12 12:13:14', 'America/New_York'),
       toDateTime64('2022-12-12 12:13:14.123456789', 9, 'America/New_York'),
       toDateTime64('2022-12-12 12:13:14.123456789', 9, 'America/New_York')
UNION ALL
SELECT 2, 
       toDateTime('2022-12-12 12:13:15'),
       toDateTime('2022-12-12 12:13:15'),
       toDateTime64('2022-12-12 12:13:15.123456789', 9),
       toDateTime64('2022-12-12 12:13:15.123456789', 9);
```

이제 테이블에 어떤 데이터가 들어 있는지 살펴보겠습니다.

```sql
SELECT dt_1, dt64_1, dt_2, dt64_2
FROM dtz
FORMAT Vertical;
```

```text
Row 1:
──────
dt_1:   2022-12-12 18:13:14
dt64_1: 2022-12-12 18:13:14.123456789
dt_2:   2022-12-12 17:13:14
dt64_2: 2022-12-12 17:13:14.123456789

Row 2:
──────
dt_1:   2022-12-12 13:13:15
dt64_1: 2022-12-12 13:13:15.123456789
dt_2:   2022-12-12 12:13:15
dt64_2: 2022-12-12 12:13:15.123456789
```

첫 번째 행에서는 `America/New_York` 시간대를 사용하여 모든 값을 삽입했습니다.

* `dt_1`과 `dt64_1`은 쿼리를 실행할 때 자동으로 `Europe/Berlin`으로 변환됩니다.
* `dt_2`와 `dt64_2`에는 시간대가 지정되어 있지 않으므로 이 경우 서버의 로컬 시간대인 `Europe/London`이 사용됩니다.

두 번째 행에서는 모든 값을 시간대를 지정하지 않고 삽입했기 때문에 서버의 로컬 시간대가 사용되었습니다.
첫 번째 행과 마찬가지로 `dt_1`과 `dt64_1`은 `Europe/Berlin`으로 변환되고, `dt_2`와 `dt64_2`는 서버의 로컬 시간대를 사용합니다.

## 날짜 및 시간 함수 \{#time-series-date-time-functions\}

ClickHouse에는 서로 다른 데이터 유형 간을 변환할 수 있게 해 주는 일련의 함수도 포함되어 있습니다.

예를 들어, [`toDate`](/sql-reference/functions/type-conversion-functions#toDate)를 사용하여 `DateTime` 값을 `Date` 타입으로 변환할 수 있습니다.

```sql
SELECT
    now() AS current_time,
    toTypeName(current_time),
    toDate(current_time) AS date_only,
    toTypeName(date_only)
FORMAT Vertical;    
```

```text
Row 1:
──────
current_time:             2025-03-12 12:32:54
toTypeName(current_time): DateTime
date_only:                2025-03-12
toTypeName(date_only):    Date
```

`DateTime` 값을 `DateTime64`로 변환할 때는 [`toDateTime64`](/sql-reference/functions/type-conversion-functions#toDateTime64) 함수를 사용할 수 있습니다.

```sql
SELECT
    now() AS current_time,
    toTypeName(current_time),
    toDateTime64(current_time, 3) AS date_only,
    toTypeName(date_only)
FORMAT Vertical;
```

```text
Row 1:
──────
current_time:             2025-03-12 12:35:01
toTypeName(current_time): DateTime
date_only:                2025-03-12 12:35:01.000
toTypeName(date_only):    DateTime64(3)
```

그리고 [`toDateTime`](/sql-reference/functions/type-conversion-functions#toDateTime)을 사용하여 `Date` 또는 `DateTime64` 값을 다시 `DateTime` 형으로 변환할 수 있습니다:

```sql
SELECT
    now64() AS current_time,
    toTypeName(current_time),
    toDateTime(current_time) AS date_time1,
    toTypeName(date_time1),
    today() AS current_date,
    toTypeName(current_date),
    toDateTime(current_date) AS date_time2,
    toTypeName(date_time2)
FORMAT Vertical;
```

```text
Row 1:
──────
current_time:             2025-03-12 12:41:00.598
toTypeName(current_time): DateTime64(3)
date_time1:               2025-03-12 12:41:00
toTypeName(date_time1):   DateTime
current_date:             2025-03-12
toTypeName(current_date): Date
date_time2:               2025-03-12 00:00:00
toTypeName(date_time2):   DateTime
```
