---
sidebar_label: 'Date/Time Values Guide'
sidebar_position: 4
keywords: ['clickhouse', 'java', 'jdbc', 'driver', 'integrate', 'Guide']
description: 'Guide about using Date/Time values in JDBC'
slug: /integrations/language-clients/java/jdbc_date_time_guide
title: 'Date/Time Values Guide'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---


# Date, Time and Timestamp

# Abstract

Date, Time and Timestamp requires attention because there is set of problems related to them. Most common problem is how to handle timezone. Another problem is string representation and how to use it. Besides that every database and DB driver has own specific and limitations. 

This document aimed to become a decision making guidance by describing tasks, giving implementation details and explaining problems.

# Timezones

We all know that timezones have hard to handle (daylight saving time, constant offset changes). But this section about another problem linked to timezones: how do they relate with timestamp string representation. 

First we need to consider next rules ClickHouse uses to convert Datetime string values: 

- If column defined with timezone (`DateTime64(9, ‘Asia/Tokyo’)`) then string value will be treated as timestamp in this timezone. `2026-01-01 13:00:00` will be `2026-01-01  04:00:00` in `UTC` time.
- If column has no timezone definition then only server timezone is used. Important: `session_timezone` setting has no effect. So if server timezone is in `UTC` and session timezone is in `America/Los_Angeles` then  `2026-01-01 13:00:00` will be written as `UTC` time.
- When value is read from column without timezone definition then `session_timezone` used or if not set - server timezone. That is why reading timestamps as string can be affected by `session_timezone` . Nothing wrong with that but should be kept in mind.

Now lets assume we have application running in `us-west` region and having local timezone `UTC-8` . And we need to write local timestamp `2026-01-01 02:00:00` what in `UTC` is `2026-01-01 10:00:00` 

- Writing as string looks like convert to server timezone or column timezone.
- Writing language native time structure requires driver to know target timezone but:
    - It is not always possible
    - Driver API is badly designed
    - The only way is to describe what transformations would be done so application can compensate it (or write unix timestamp as number)

:::note
Java and JDBC has different ways to set timestamp. 

1. Use `Timestap` class what is really a unix timestamp. 
    1. When used with `Calendar` object it make possible to reinterpret `Timestamp` in calendar timezone
    2. `Timestamp` has internal calendar that is not very obvious
2. Use `LocalDateTime` class what is easy to convert to any timezone but there is no method allowing to pass target timezone (haha).
3. Use `ZonedDateTime` class what helps with timezone convert when need to write to `DateTime` without timezone (because we know that need to use server timezone).
    1. But writing `ZonedDateTime` to column with defined timezone require user to compensate driver conversion.
4. Use `Long` to write Unix Timestamp milliseconds 
5. Use `String` to do all conversions on application side (what is not very portable).          
:::

:::note
⚠️

   Prefer to use `java.time.ZoneId#of(java.lang.String)` when searching for timezone by id. This method will throw exception if timezone is not found (`java.util.TimeZone#getTimeZone(java.lang.String)` will silently fallback to `GMT` ).

Right way to get `Tokyo` timezone: 

`TimeZone.getTimeZone(ZoneId.of("Asia/Tokyo"))`
:::

# Date

Dates are timezone agnostic by itself. There are `Date` and `Date32` to store date. Both types are use number of days since Epoch (1970-01-01). `Date` uses only positive number of day so its range ends on `2149-06-06` . `Date32` handles negative number of days to cover dates before `1970-01-01` but range is smaller ( from `1900-01-01` till `2100-01-01` , 0 - `1970-01-01` ). ClickHouse sees `2026-01-01` as `2026-01-1` in any timezone and there is no timezone parameter for column definition. 

In java most suitable class to represent date values are `java.time.LocalDate` . Client uses this class to store value of `Date` and `Date32` columns ( reading `LocalDate.ofEpochDay((long)readUnsignedShortLE())` ) . 

But `LocalDate` was introduced in Java 8. Before that time [`java.sql.Date`](http://java.sql.Date) was used to write/read dates. Internally this class is wrapper around instant (time value representing absolute time point). Because of this `toString()` of the class returns different date depending in what timezone JVM is. It requires driver to carefully construct values and requires user to be aware of this. 

`java.sql.ResultSet` has method for get date values that accepts `Calendar` and there is similar method in `java.sql.PreparedStatement` . This was designed to let JDBC driver reinterpret date value in specified timezone. For example, DB has value `2026-01-01` but application want to see this date as midnight in `Tokyo` . That means returned [`java.sql.Date`](http://java.sql.Date) object will get specific instant and when converted to local timezone may be a different date because difference in time. We can do the same by taking `LocalDate` by using `java.time.LocalDate#atStartOfDay(java.time.ZoneId)` .

ClickHouse JDBC driver always return [`java.sql.Date`](http://java.sql.Date) object that points to **local** date at midnight. In other words if date is `2026-01-01` we mean `2026-01-01 12:00 AM` of JVM timezone (the same done by PostgreSQL and MariaDB JDBC drivers).

We recommend using `java.time.LocalDate` because it is not affected by timezone transformations and is part of modern time API. 

# Time

Time values like a Date ones are timezone agnostic in most cases. And ClickHouse does no transformations of time literal values to any timezone - `‘6:30’` is the same whenever it read. 

`Time` and `Time64` were introduced in `25.6` .  Before that timestamp types `DateTime` and `DateTime64` were used instead (we will talk about it later). `Time` is stored as 32-bit integer number of seconds and is in range  `[-999:59:59, 999:59:59]`. `Time64` is encoded as unsigned Decimal64 and stores different time unit depending on precision. Common choices are 3 (milliseconds), 6 (microseconds), and 9 (nanoseconds). Precision value range is `[0, 9]`.

Client reads `Time` and `Time64` and stores as `LocalDateTime`. It is done to support negative time range (`LocalTime` doesn’t support it). In this case date part is Epoch date `1970-01-01` so negative values will be before this date.   

Main support of time types are implemented using `LocalTime` (when value is within day) and `Duration` to use full range of values. `LocalDateTime` can be used while reading only.  

Using `java.sql.Time` is limited to `LocalTime` range. Internally `java.sql.Time` is converted to a string literal. Value may be changed by using a Calendar parameter with `PreparedStatement#setTime()`. 

:::note
Function`toTime` 

- Always requires `Date` , `DateTime` or other similar type. But do not ever accept string. Related issue https://github.com/ClickHouse/ClickHouse/issues/89896
- Aliased to another function https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toTimeWithFixedDate

There is timezone related issue https://github.com/ClickHouse/ClickHouse/pull/90310 
:::

# Timestamp

Timestamp is some point in time. For example, Unix timestamp represents any point in time as number of seconds relatively to `1970-01-01 00:00:00` `UTC` ( negative number of seconds represent any timestamp before Unix time and positive - after). This representation is easy to calculate and handle if observer in `UTC` timezone or uses it over local one.  

There are `DateTime` (32-bit integer, resolution is seconds always) and `DateTime64` (64-bit integer, resolution depend on definition) timestamp types in ClickHouse. Values are always stored as UTC timestamps. It means that when represented as numbers no timezone conversion is applied. 

String representation has complexities: 

- If no timezone is specified in column definition and string is passed on write then it will be converted from server timezone to UTC timestamp number. When value is read from such column it will be converted from UTC timestamp to a literal timestamp using server or session timezone (similar approach applied to timestamp literals in expressions where timezone is not defined explicitly)
- If timezone is specified in column definition then only this timezone is used in all string conversions. It contradicts logic when not timezone is specified so requires good understanding how data is written for each column in the query.
- If date is passed as string in format including a timezone then conversion function is needed. Usually `parseDateTimeBestEffort` (https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#parseDateTimeBestEffort) is used.

In JDBC driver we convert timestamps to numeric representation: 

```java
"fromUnixTimestamp64Nano(" + epochSeconds * 1_000_000_000L + nanos + ")" 
```

This representation solves mostly all conversion issues with timestamp values because send data to server in unified format. However this approach requires a bit adjustment in SQL statements but provides most simple and straightforward way to write timestamps to any column. 

`DateTime` and `DateTime64` are read and stored on client as `java.time.ZonedDateTime` what helps to convert such values to any other (timezone information is preserved). 

:::note
Here is code example that looks correct but fails on assertion:

```java
String sql = "SELECT toDateTime64(?, 3)";
try (PreparedStatement stmt = conn.prepareStatement(sql)) {
    LocalDateTime localTs = LocalDateTime.parse("2021-01-01T01:34:56");
    stmt.setObject(1, localTs);
    try (ResultSet rs = stmt.executeQuery()) {
        rs.next();
        assertEquals(rs.getObject(1, LocalDateTime.class), localTs);
    }
}
```

This happens because `toDateTime64` uses server timezone and doesn’t know about source timezone. 
:::

# Conversion Tables

**Note:** If conversion pair is not mentioned then conversion is not supported. For example, `Date` columns cannot be read as `java.sql.Timestamp` because no time part.  

Table of conversions when set with `PrepareredStatement#setObject(column, value)`

| Class of `value`  | Conversion |
| --- | --- |
| `java.time.LocalDate`  | Formatted as `YYYY-MM-DD`  |
| `java.sql.Date`  | Converted with default calendar and formatted as `LocalDate` as `YYYY-MM-DD`  |
| `java.time.LocalTime`  | Formatted as `HH:mm:ss`  |
| `java.time.Duration` | Formatted as `HHH:mm:ss` 
Value can be negative |
| `java.sql.Time` | Converted with default calendar and formatted as `LocalTime` as `HH:mm`   |
| `java.time.LocalDatetime`  | Converted to Unix timestamp in nanoseconds and wrapped with `fromUnixTimestamp64Nano` |
| `java.time.ZonedDateTime`  | Converted to Unix timestamp in nanoseconds and wrapped with `fromUnixTimestamp64Nano` |
| `java.sql.Timestamp`  | Converted to Unix timestamp in nanoseconds and wrapped with `fromUnixTimestamp64Nano` |
- Type of the column should be considered as unknown. It is up to application what should be passed to prepared statement.

Table of conversions when read by `ResultSet#getObject(column, class)` 

| ClickHouse Data Type of `column`  | Value of `class`  | Conversion |
| --- | --- | --- |
| `Date`  or `Date32`  | `java.time.LocalDate`  | DB value of number of days converted to `LocalDate` .  |
| `Date` or `Date32`  | `java.sql.Date`  | DB value of number of days converted to `LocalDate` and then to [`java.sql.Date`](http://java.sql.Date) using local timezone midnight as time part. 
If calendar is used then its timezone will be used instead of local.
Ex. DB Value - `1970-01-10` - `LocalDate` is `1970-01-10`    |
| `Time` or `Time64`  | `java.time.LocalTime`  | DB value converted to `LocalDateTime` and then to `LocalTime` . This works only for time within a day.  |
| `Time` or `Time64`  | `java.time.LocalDateTime`  | DB value converted to `LocalDateTime`  |
| `Time` or `Time64`  | `java.sql.Time`  | DB value converted to `LocalDateTime` and then to `java.sql.Time` using default calendar. 
This works only for time within a day.  |
| `Time` or `Time64`  | `java.time.Duration`  | DB value converted to `LocalDateTime` and then to `Duration` . |
| `DateTime`  or `DateTime64`  | `java.time.LocalDateTime` | DB value converted to `ZonedDateTime` then to `LocalDateTime` |
| `DateTime`  or `DateTime64`  | `java.time.ZonedDateTime` | DB value converted to `ZonedDateTime`  |
| `DateTime`  or `DateTime64`  | `java.sql.Timestamp` | DB value converted to `ZonedDateTime` then to `java.sql.Timestamp` using default timezone.  |
- If conversion pair is not mentioned then conversion is not supported. For example, `Date` columns cannot be read as `java.sql.Timestamp` because no time part.
- Use `ResultSet#getTime(column, calendar)` and `ResultSet#getDate(column, calendar)` if values were stored using `PrepareredStatement#setTime(param, value, calendar)`  and `PrepareredStatement#setDate(param, value, calendar)`  accordingly.
