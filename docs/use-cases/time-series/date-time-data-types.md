---
title: 'Date and time data types - Time-series'
sidebar_label: 'Date and time data types'
description: 'Time-series data types in ClickHouse.'
slug: /use-cases/time-series/date-time-data-types
keywords: ['time-series']
---

# Date and time data types

Having a comprehensive suite of date and time types is necessary for effective time series data management, and ClickHouse delivers exactly that. 
From compact date representations to high-precision timestamps with nanosecond accuracy, these types are designed to balance storage efficiency with practical requirements for different time series applications.

Whether you're working with historical financial data, IoT sensor readings, or future-dated events, ClickHouse's date and time types provide the flexibility needed to handle various temporal data scenarios. 
The range of supported types allows you to optimize both storage space and query performance while maintaining the precision your use case demands.

* The [`Date`](/docs/sql-reference/data-types/date) type should be sufficient in most cases. This type requires 2 bytes to store a date and limits the range to `[1970-01-01, 2149-06-06]`. 

* [`Date32`](/docs/sql-reference/data-types/date32) covers a wider range of dates. It requires 4 bytes to store a date and limits the range to `[1900-01-01, 2299-12-31]`

* [`DateTime`](/docs/sql-reference/data-types/datetime) stores date time values with second precision and a range of `[1970-01-01 00:00:00, 2106-02-07 06:28:15]` It requires 4 bytes per value.

* For cases where more precision is required, [`DateTime64`](/docs/sql-reference/data-types/datetime64) can be used. This allows storing time with up to nanoseconds precision, with a range of `[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999]`. It requires 8 bytes per value.

Let's create a table that stores various date types:


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

We can use the [`now()`](/docs/sql-reference/functions/date-time-functions#now) function to return the current time and [`now64()`](/docs/sql-reference/functions/date-time-functions#now64) to get it in a specified precision via the first argument.

```sql
INSERT INTO dates 
SELECT now(), 
       now()::Date32 + toIntervalYear(100),
       now(), 
       now64(3), 
       now64(9) + toIntervalYear(200);
```

This will populate our columns with time accordingly to the column type:

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

## Timezones {#time-series-timezones}

Many use cases require having timezones stored as well. We can set the timezone as the last argument to the `DateTime` or `DateTime64` types:


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

Having defined a timezone in our DDL, we can now insert times using different timezones:


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

And now let's have a look what's in our table:

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

In the first row, we inserted all values using the `America/New_York` timezone.
* `dt_1` and `dt64_1` are automatically converted to `Europe/Berlin` at query time.
* `dt_2` and `dt64_2` didn't have a time zone specified, so they use the server's local time zone, which in this case is `Europe/London`.

In the second row, we inserted all the values without a timezone, so the server's local time zone was used.
As in the first row, `dt_1` and `dt_3` are converted to `Europe/Berlin`, while `dt_2` and `dt64_2` use the server's local time zone.


## Date and time functions {#time-series-date-time-functions}

ClickHouse also comes with a set of functions that let us convert between the different data types.

For example, we can use [`toDate`](/docs/sql-reference/functions/type-conversion-functions#todate) to convert a `DateTime` value to the `Date` type:

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

We can use [`toDateTime64`](/docs/sql-reference/functions/type-conversion-functions#todatetime64) to convert `DateTime` to `DateTime64`:

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

And we can use [`toDateTime`](/docs/sql-reference/functions/type-conversion-functions#todatetime) to go from `Date` or `DateTime64` back to `DateTime`:

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
