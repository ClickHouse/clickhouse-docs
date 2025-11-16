---
'title': '날짜 및 시간 데이터 유형 - 시계열'
'sidebar_label': '날짜 및 시간 데이터 유형'
'description': 'ClickHouse의 시계열 데이터 유형.'
'slug': '/use-cases/time-series/date-time-data-types'
'keywords':
- 'time-series'
- 'DateTime'
- 'DateTime64'
- 'Date'
- 'data types'
- 'temporal data'
- 'timestamp'
'show_related_blogs': true
'doc_type': 'reference'
---


# 날짜 및 시간 데이터 유형

날짜 및 시간 유형의 종합적인 패키지는 효과적인 시계열 데이터 관리를 위해 필수적이며, ClickHouse는 바로 그 기능을 제공합니다.
Compact date 표현에서 나노초 정확도로 고정밀 타임스탬프에 이르기까지 이러한 유형은 다양한 시계열 애플리케이션의 저장 효율성과 실용적인 요구 사항 간의 균형을 맞추도록 설계되었습니다.

역사적 금융 데이터, IoT 센서 판독값 또는 미래 날짜의 이벤트를 다루든, ClickHouse의 날짜 및 시간 유형은 다양한 시간 데이터 시나리오를 처리하는 데 필요한 유연성을 제공합니다.
지원되는 유형의 범위는 저장 공간과 쿼리 성능을 최적화하면서 사용 사례에서 요구하는 정밀도를 유지할 수 있도록 합니다.

* [`Date`](/sql-reference/data-types/date) 유형은 대부분의 경우 충분해야 합니다. 이 유형은 날짜를 저장하기 위해 2바이트가 필요하고 범위를 `[1970-01-01, 2149-06-06]`로 제한합니다.

* [`Date32`](/sql-reference/data-types/date32)는 더 넓은 범위의 날짜를 포함합니다. 이는 날짜를 저장하기 위해 4바이트가 필요하며 범위를 `[1900-01-01, 2299-12-31]`로 제한합니다.

* [`DateTime`](/sql-reference/data-types/datetime)은 초 단위 정밀도로 날짜 시간 값을 저장하며 범위는 `[1970-01-01 00:00:00, 2106-02-07 06:28:15]`입니다. 각 값에는 4바이트가 필요합니다.

* 더 높은 정밀도가 필요한 경우, [`DateTime64`](/sql-reference/data-types/datetime64)를 사용할 수 있습니다. 이는 나노초 정밀도로 시간을 저장할 수 있으며, 범위는 `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]`입니다. 각 값에는 8바이트가 필요합니다.

여러 날짜 유형을 저장하는 테이블을 만들어 봅시다:

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

현재 시간을 반환하는 [`now()`](/sql-reference/functions/date-time-functions#now) 함수와, 첫 번째 인수를 통해 지정된 정밀도로 시간을 가져오는 [`now64()`](/sql-reference/functions/date-time-functions#now64) 함수를 사용할 수 있습니다.

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

이렇게 하면 각 컬럼 유형에 따라 시간이 채워집니다:

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

## 타임존 {#time-series-timezones}

많은 사용 사례에서는 타임존을 저장할 필요가 있습니다. `DateTime` 또는 `DateTime64` 유형에 마지막 인수로 타임존을 설정할 수 있습니다:

```sql
CREATE TABLE dtz
(
    `id` Int8,
    `dt_1` DateTime('Europe/Berlin'),
    `dt_2` DateTime,
    `dt64_1` DateTime64(9, 'Europe/Berlin'),
    `dt64_2` DateTime64(9),
)
ENGINE = MergeTree
ORDER BY id;
```

DDL에서 타임존을 정의한 후, 이제 다양한 타임존을 사용하여 시간을 삽입할 수 있습니다:

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

이제 테이블의 내용을 살펴보겠습니다:

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

첫 번째 행에서는 모든 값을 `America/New_York` 타임존을 사용하여 삽입했습니다.
* `dt_1`과 `dt64_1`은 쿼리 시 자동으로 `Europe/Berlin`으로 변환됩니다.
* `dt_2`와 `dt64_2`는 타임존이 지정되지 않았으므로 서버의 로컬 타임존을 사용하며, 이 경우는 `Europe/London`입니다.

두 번째 행에서는 타임존 없이 모든 값을 삽입하였으므로 서버의 로컬 타임존이 사용되었습니다.
첫 번째 행과 마찬가지로 `dt_1`과 `dt64_1`은 `Europe/Berlin`으로 변환되고, `dt_2`와 `dt64_2`는 서버의 로컬 타임존을 사용합니다.

## 날짜 및 시간 함수 {#time-series-date-time-functions}

ClickHouse는 다양한 데이터 유형 간의 변환을 가능하게 하는 함수 세트도 함께 제공합니다.

예를 들어, [`toDate`](/sql-reference/functions/type-conversion-functions#todate)를 사용하여 `DateTime` 값을 `Date` 유형으로 변환할 수 있습니다:

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

[`toDateTime64`](/sql-reference/functions/type-conversion-functions#todatetime64)를 사용하여 `DateTime`을 `DateTime64`로 변환할 수 있습니다:

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

그리고 [`toDateTime`](/sql-reference/functions/type-conversion-functions#todatetime) 함수를 사용하여 `Date` 또는 `DateTime64`에서 `DateTime`으로 되돌릴 수 있습니다:

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
