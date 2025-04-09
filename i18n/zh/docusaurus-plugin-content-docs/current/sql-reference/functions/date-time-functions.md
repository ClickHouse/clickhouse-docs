---
slug: /sql-reference/functions/date-time-functions
sidebar_position: 45
sidebar_label: 日期和时间
---

# 处理日期和时间的函数

本节中的大多数函数接受一个可选的时区参数，例如 `Europe/Amsterdam`。在这种情况下，时区是指定的，而不是当地（默认）时区。

**示例**

``` sql
SELECT
    toDateTime('2016-06-15 23:00:00') AS time,
    toDate(time) AS date_local,
    toDate(time, 'Asia/Yekaterinburg') AS date_yekat,
    toString(time, 'US/Samoa') AS time_samoa
```

``` text
┌────────────────time─┬─date_local─┬─date_yekat─┬─time_samoa──────────┐
│ 2016-06-15 23:00:00 │ 2016-06-15 │ 2016-06-16 │ 2016-06-15 09:00:00 │
└─────────────────────┴────────────┴────────────┴─────────────────────┘
```
## makeDate {#makedate}

创建一个 [Date](../data-types/date.md)
- 从年份、月份和日期参数，或
- 从年份和一年中的天数参数。

**语法**

``` sql
makeDate(year, month, day);
makeDate(year, day_of_year);
```

别名：
- `MAKEDATE(year, month, day);`
- `MAKEDATE(year, day_of_year);`

**参数**

- `year` — 年。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `month` — 月。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `day` — 日。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `day_of_year` — 一年中的天数。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。

**返回值**

- 从参数创建的日期。 [Date](../data-types/date.md)。

**示例**

从年份、月份和日期创建一个日期：

``` sql
SELECT makeDate(2023, 2, 28) AS Date;
```

结果：

``` text
┌───────date─┐
│ 2023-02-28 │
└────────────┘
```

从年份和一年中的天数参数创建一个日期：

``` sql
SELECT makeDate(2023, 42) AS Date;
```

结果：

``` text
┌───────date─┐
│ 2023-02-11 │
└────────────┘
```
## makeDate32 {#makedate32}

从年份、月份、日期（或可选的年份和天数）创建一个 [Date32](../../sql-reference/data-types/date32.md) 类型的日期。

**语法**

```sql
makeDate32(year, [month,] day)
```

**参数**

- `year` — 年。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（可选）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。

:::note
如果省略 `month`，则 `day` 应取值在 `1` 到 `365` 之间，否则应取值在 `1` 到 `31` 之间。
:::

**返回值**

- 从参数创建的日期。 [Date32](../../sql-reference/data-types/date32.md)。

**示例**

从年份、月份和日期创建一个日期：

查询：

```sql
SELECT makeDate32(2024, 1, 1);
```

结果：

```response
2024-01-01
```

从年份和一年中的天数创建一个日期：

查询：

``` sql
SELECT makeDate32(2024, 100);
```

结果：

```response
2024-04-09
```
## makeDateTime {#makedatetime}

从年份、月份、日期、小时、分钟和秒参数创建一个 [DateTime](../data-types/datetime.md)。

**语法**

``` sql
makeDateTime(year, month, day, hour, minute, second[, timezone])
```

**参数**

- `year` — 年。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `month` — 月。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `day` — 日。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `hour` — 小时。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `minute` — 分钟。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `second` — 秒。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `timezone` — 返回值的 [时区](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。

**返回值**

- 从参数创建的日期和时间。 [DateTime](../data-types/datetime.md)。

**示例**

``` sql
SELECT makeDateTime(2023, 2, 28, 17, 12, 33) AS DateTime;
```

结果：

``` text
┌────────────DateTime─┐
│ 2023-02-28 17:12:33 │
└─────────────────────┘
```
## makeDateTime64 {#makedatetime64}

从其组件（年份、月份、日期、小时、分钟、秒）创建一个 [DateTime64](../../sql-reference/data-types/datetime64.md) 数据类型值。可选的子秒精度。

**语法**

```sql
makeDateTime64(year, month, day, hour, minute, second[, precision])
```

**参数**

- `year` — 年（0-9999）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（1-12）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日（1-31）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `hour` — 小时（0-23）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `minute` — 分钟（0-59）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `second` — 秒（0-59）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `precision` — 子秒组件的可选精度（0-9）。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 从提供的参数创建的日期和时间。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

**示例**

``` sql
SELECT makeDateTime64(2023, 5, 15, 10, 30, 45, 779, 5);
```

```response
┌─makeDateTime64(2023, 5, 15, 10, 30, 45, 779, 5)─┐
│                       2023-05-15 10:30:45.00779 │
└─────────────────────────────────────────────────┘
```
## timestamp {#timestamp}

将第一个参数 'expr' 转换为类型 [DateTime64(6)](../data-types/datetime64.md)。
如果提供第二个参数 'expr_time'，则将指定的时间添加到转换后的值。

**语法**

``` sql
timestamp(expr[, expr_time])
```

别名： `TIMESTAMP`

**参数**

- `expr` - 日期或带时间的日期。 [String](../data-types/string.md)。
- `expr_time` - 可选参数。 要添加的时间。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT timestamp('2023-12-31') as ts;
```

结果：

``` text
┌─────────────────────────ts─┐
│ 2023-12-31 00:00:00.000000 │
└────────────────────────────┘
```

``` sql
SELECT timestamp('2023-12-31 12:00:00', '12:00:00.11') as ts;
```

结果：

``` text
┌─────────────────────────ts─┐
│ 2024-01-01 00:00:00.110000 │
└────────────────────────────┘
```

**返回值**

- [DateTime64](../data-types/datetime64.md)(6)
## timeZone {#timezone}

返回当前会话的时区，即设置 [session_timezone](../../operations/settings/settings.md#session_timezone) 的值。
如果在分布式表上下文中执行该函数，则生成与每个分片相关的正常列的值，否则生成恒定值。

**语法**

```sql
timeZone()
```

别名： `timezone`。

**返回值**

- 时区。 [String](../data-types/string.md)。

**示例**

```sql
SELECT timezone()
```

结果：

```response
┌─timezone()─────┐
│ America/Denver │
└────────────────┘
```

**另见**

- [serverTimeZone](#servertimezone)
## serverTimeZone {#servertimezone}

返回服务器的时区，即设置 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) 的值。
如果在分布式表上下文中执行该函数，则生成与每个分片相关的正常列的值。否则，生成恒定值。

**语法**

``` sql
serverTimeZone()
```

别名： `serverTimezone`。

**返回值**

- 时区。 [String](../data-types/string.md)。

**示例**

```sql
SELECT serverTimeZone()
```

结果：

```response
┌─serverTimeZone()─┐
│ UTC              │
└──────────────────┘
```

**另见**

- [timeZone](#timezone)
## toTimeZone {#totimezone}

将日期或带时间的日期转换为指定的时区。不会更改数据的内部值（Unix秒数），只有值的时区属性和值的字符串表示会发生变化。

**语法**

``` sql
toTimezone(value, timezone)
```

别名： `toTimezone`。

**参数**

- `value` — 时间或日期和时间。 [DateTime64](../data-types/datetime64.md)。
- `timezone` — 返回值的时区。 [String](../data-types/string.md)。这个参数是常量，因为 `toTimezone` 更改列的时区（时区是 `DateTime*` 类型的一个属性）。

**返回值**

- 日期和时间。 [DateTime](../data-types/datetime.md)。

**示例**

```sql
SELECT toDateTime('2019-01-01 00:00:00', 'UTC') AS time_utc,
    toTypeName(time_utc) AS type_utc,
    toInt32(time_utc) AS int32utc,
    toTimeZone(time_utc, 'Asia/Yekaterinburg') AS time_yekat,
    toTypeName(time_yekat) AS type_yekat,
    toInt32(time_yekat) AS int32yekat,
    toTimeZone(time_utc, 'US/Samoa') AS time_samoa,
    toTypeName(time_samoa) AS type_samoa,
    toInt32(time_samoa) AS int32samoa
FORMAT Vertical;
```

结果：

```text
Row 1:
──────
time_utc:   2019-01-01 00:00:00
type_utc:   DateTime('UTC')
int32utc:   1546300800
time_yekat: 2019-01-01 05:00:00
type_yekat: DateTime('Asia/Yekaterinburg')
int32yekat: 1546300800
time_samoa: 2018-12-31 13:00:00
type_samoa: DateTime('US/Samoa')
int32samoa: 1546300800
```

**另见**

- [formatDateTime](#formatdatetime) - 支持非恒定时区。
- [toString](type-conversion-functions.md#tostring) - 支持非恒定时区。
## timeZoneOf {#timezoneof}

返回 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md) 数据类型的时区名称。

**语法**

``` sql
timeZoneOf(value)
```

别名： `timezoneOf`。

**参数**

- `value` — 日期和时间。 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 时区名称。 [String](../data-types/string.md)。

**示例**

``` sql
SELECT timezoneOf(now());
```

结果：
``` text
┌─timezoneOf(now())─┐
│ Etc/UTC           │
└───────────────────┘
```
## timeZoneOffset {#timezoneoffset}

返回与 [UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) 的时区偏移（以秒为单位）。
此函数考虑 [夏令时](https://en.wikipedia.org/wiki/Daylight_saving_time) 和在指定日期和时间的历史时区变化。
使用 [IANA 时区数据库](https://www.iana.org/time-zones) 计算偏移。

**语法**

``` sql
timeZoneOffset(value)
```

别名： `timezoneOffset`。

**参数**

- `value` — 日期和时间。 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 从 UTC 的偏移，以秒为单位。 [Int32](../data-types/int-uint.md)。

**示例**

``` sql
SELECT toDateTime('2021-04-21 10:20:30', 'America/New_York') AS Time, toTypeName(Time) AS Type,
       timeZoneOffset(Time) AS Offset_in_seconds, (Offset_in_seconds / 3600) AS Offset_in_hours;
```

结果：

``` text
┌────────────────Time─┬─Type─────────────────────────┬─Offset_in_seconds─┬─Offset_in_hours─┐
│ 2021-04-21 10:20:30 │ DateTime('America/New_York') │            -14400 │              -4 │
└─────────────────────┴──────────────────────────────┴───────────────────┴─────────────────┘
```
## toYear {#toyear}

返回给定日期或带时间日期的年份组件（公元）。

**语法**

```sql
toYear(value)
```

别名： `YEAR`

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的年份。 [UInt16](../data-types/int-uint.md)。

**示例**

```sql
SELECT toYear(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                      2023 │
└───────────────────────────────────────────┘
```
## toQuarter {#toquarter}

返回给定日期或带时间日期的季度（1-4）。

**语法**

```sql
toQuarter(value)
```

别名： `QUARTER`

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的季度（1、2、3 或 4）。 [UInt8](../data-types/int-uint.md)。

**示例**

```sql
SELECT toQuarter(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toQuarter(toDateTime('2023-04-21 10:20:30'))─┐
│                                            2 │
└──────────────────────────────────────────────┘
```
## toMonth {#tomonth}

返回给定日期或带时间日期的月份组件（1-12）。

**语法**

```sql
toMonth(value)
```

别名：

`MONTH`

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的月份（1 - 12）。 [UInt8](../data-types/int-uint.md)。

**示例**

```sql
SELECT toMonth(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                          4 │
└────────────────────────────────────────────┘
```
## toDayOfYear {#todayofyear}

返回给定日期或带时间日期在一年中的日号（1-366）。

**语法**

```sql
toDayOfYear(value)
```

别名：

`DAYOFYEAR`

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的日号（1 - 366）。 [UInt16](../data-types/int-uint.md)。

**示例**

```sql
SELECT toDayOfYear(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toDayOfYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                            111 │
└────────────────────────────────────────────────┘
```
## toDayOfMonth {#todayofmonth}

返回给定日期或带时间日期在一个月中的日号（1-31）。

**语法**

```sql
toDayOfMonth(value)
```

别名： `DAYOFMONTH`、`DAY`

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的日号（1 - 31）。 [UInt8](../data-types/int-uint.md)。

**示例**

```sql
SELECT toDayOfMonth(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toDayOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                              21 │
└─────────────────────────────────────────────────┘
```
## toDayOfWeek {#todayofweek}

返回给定日期或带时间日期在一周中的日号。

`toDayOfWeek()` 的双参数形式允许您指定一周的开始日是星期一还是星期天，以及返回值的范围是从 0 到 6 还是 1 到 7。如果省略模式参数，默认模式为 0。可指定日期的时区作为第三个参数。

| 模式 | 星期的第一天 | 范围                                          |
|------|--------------|------------------------------------------------|
| 0    | 星期一      | 1-7: 星期一 = 1，星期二 = 2，..., 星期天 = 7  |
| 1    | 星期一      | 0-6: 星期一 = 0，星期二 = 1，..., 星期天 = 6  |
| 2    | 星期天      | 0-6: 星期天 = 0，星期一 = 1，..., 星期六 = 6 |
| 3    | 星期天      | 1-7: 星期天 = 1，星期一 = 2，..., 星期六 = 7 |

**语法**

``` sql
toDayOfWeek(t[, mode[, timezone]])
```

别名： `DAYOFWEEK`。

**参数**

- `t` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `mode` - 确定一周的第一天。可能的值为 0、1、2 或 3。参见上表以了解差异。
- `timezone` - 可选参数，它的行为类似于其他转换函数。

第一个参数也可以指定为支持 [parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort) 的格式的 [String](../data-types/string.md)。出于与期望某些第三方工具的 MySQL 相容的原因，存在对字符串参数的支持。由于字符串参数的支持将来可能取决于新的 MySQL 兼容性设置，并且字符串解析通常较慢，因此建议不要使用它。

**返回值**

- 给定日期/时间的星期几（1-7），具体取决于选择的模式。

**示例**

以下日期是 2023 年 4 月 21 日，星期五：

```sql
SELECT
    toDayOfWeek(toDateTime('2023-04-21')),
    toDayOfWeek(toDateTime('2023-04-21'), 1)
```

结果：

```response
┌─toDayOfWeek(toDateTime('2023-04-21'))─┬─toDayOfWeek(toDateTime('2023-04-21'), 1)─┐
│                                     5 │                                        4 │
└───────────────────────────────────────┴──────────────────────────────────────────┘
```
## toHour {#tohour}

返回带时间的日期的小时组件（0-24）。

假设，如果时钟提前调快，则提前一小时发生在凌晨2点；如果时钟倒退，则退后一小时发生在凌晨3点（尽管这并不总是确切地发生 - 这取决于时区）。

**语法**

```sql
toHour(value)
```

别名： `HOUR`

**参数**

- `value` - 一个 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的小时（0 - 23）。 [UInt8](../data-types/int-uint.md)。

**示例**

```sql
SELECT toHour(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toHour(toDateTime('2023-04-21 10:20:30'))─┐
│                                        10 │
└───────────────────────────────────────────┘
```
## toMinute {#tominute}

返回带时间的日期的分钟组件（0-59）。

**语法**

```sql
toMinute(value)
```

别名： `MINUTE`

**参数**

- `value` - 一个 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的分钟（0 - 59）。 [UInt8](../data-types/int-uint.md)。

**示例**

```sql
SELECT toMinute(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toMinute(toDateTime('2023-04-21 10:20:30'))─┐
│                                          20 │
└─────────────────────────────────────────────┘
```
## toSecond {#tosecond}

返回带时间的日期的秒组件（0-59）。不考虑闰秒。

**语法**

```sql
toSecond(value)
```

别名：

`SECOND`

**参数**

- `value` - 一个 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的秒数（0 - 59）。 [UInt8](../data-types/int-uint.md)。

**示例**

```sql
SELECT toSecond(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toSecond(toDateTime('2023-04-21 10:20:30'))─┐
│                                          30 │
└─────────────────────────────────────────────┘
```
## toMillisecond {#tomillisecond}

返回带时间的日期的毫秒组件（0-999）。

**语法**

```sql
toMillisecond(value)
```

**参数**

- `value` - [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

别名： `MILLISECOND`

```sql
SELECT toMillisecond(toDateTime64('2023-04-21 10:20:30.456', 3))
```

结果：

```response
┌──toMillisecond(toDateTime64('2023-04-21 10:20:30.456', 3))─┐
│                                                        456 │
└────────────────────────────────────────────────────────────┘
```

**返回值**

- 给定日期/时间的毫秒数（0 - 999）。 [UInt16](../data-types/int-uint.md)。
## toUnixTimestamp {#tounixtimestamp}

将字符串、日期或带时间的日期转换为 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time) 的 `UInt32` 表示。

如果函数以字符串调用，则接受一个可选的时区参数。

**语法**

``` sql
toUnixTimestamp(date)
toUnixTimestamp(str, [timezone])
```

**返回值**

- 返回 Unix 时间戳。 [UInt32](../data-types/int-uint.md)。

**示例**

``` sql
SELECT
    '2017-11-05 08:07:47' AS dt_str,
    toUnixTimestamp(dt_str) AS from_str,
    toUnixTimestamp(dt_str, 'Asia/Tokyo') AS from_str_tokyo,
    toUnixTimestamp(toDateTime(dt_str)) AS from_datetime,
    toUnixTimestamp(toDateTime64(dt_str, 0)) AS from_datetime64,
    toUnixTimestamp(toDate(dt_str)) AS from_date,
    toUnixTimestamp(toDate32(dt_str)) AS from_date32
FORMAT Vertical;
```

结果：

``` text
Row 1:
──────
dt_str:          2017-11-05 08:07:47
from_str:        1509869267
from_str_tokyo:  1509836867
from_datetime:   1509869267
from_datetime64: 1509869267
from_date:       1509840000
from_date32:     1509840000
```

:::note
`toStartOf*`、`toLastDayOf*`、`toMonday`、`timeSlot` 等函数的返回类型由配置参数 [enable_extended_results_for_datetime_functions](/operations/settings/settings#enable_extended_results_for_datetime_functions) 决定，默认值为 `0`。

* 当 `enable_extended_results_for_datetime_functions = 0` 时：
  * 函数 `toStartOfYear`、`toStartOfISOYear`、`toStartOfQuarter`、`toStartOfMonth`、`toStartOfWeek`、`toLastDayOfWeek`、`toLastDayOfMonth`、`toMonday` 返回 `Date` 或 `DateTime`。
  * 函数 `toStartOfDay`、`toStartOfHour`、`toStartOfFifteenMinutes`、`toStartOfTenMinutes`、`toStartOfFiveMinutes`、`toStartOfMinute`、`timeSlot` 返回 `DateTime`。虽然这些函数可以接收扩展类型 `Date32` 和 `DateTime64` 的值作为参数，但传递它们一个在正常范围之外的时间（年份 1970 到 2149 对于 `Date` / 2106 对于 `DateTime`）将产生错误的结果。
* 当 `enable_extended_results_for_datetime_functions = 1` 时：
  * 函数 `toStartOfYear`、`toStartOfISOYear`、`toStartOfQuarter`、`toStartOfMonth`、`toStartOfWeek`、`toLastDayOfWeek`、`toLastDayOfMonth`、`toMonday` 如果其参数是 `Date` 或 `DateTime`，则返回 `Date` 或 `DateTime`，如果其参数是 `Date32` 或 `DateTime64`，则返回 `Date32` 或 `DateTime64`。
  * 函数 `toStartOfDay`、`toStartOfHour`、`toStartOfFifteenMinutes`、`toStartOfTenMinutes`、`toStartOfFiveMinutes`、`toStartOfMinute`、`timeSlot` 如果其参数是 `Date` 或 `DateTime`，则返回 `DateTime`，如果其参数是 `Date32` 或 `DateTime64`，则返回 `DateTime64`。
:::
## toStartOfYear {#tostartofyear}

将日期或带时间的日期向下取整到该年的第一天。返回的日期为 `Date` 对象。

**语法**

```sql
toStartOfYear(value)
```

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 输入的日期/时间的第一天。 [Date](../data-types/date.md)。

**示例**

```sql
SELECT toStartOfYear(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toStartOfYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                       2023-01-01 │
└──────────────────────────────────────────────────┘
```
## toStartOfISOYear {#tostartofisoyear}

将日期或带时间的日期向下取整到 ISO 年的第一天，ISO 年可能与“常规”年份不同。 （请参阅 [https://en.wikipedia.org/wiki/ISO_week_date](https://en.wikipedia.org/wiki/ISO_week_date)。）

**语法**

```sql
toStartOfISOYear(value)
```

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 输入的日期/时间的第一天。 [Date](../data-types/date.md)。

**示例**

```sql
SELECT toStartOfISOYear(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toStartOfISOYear(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-01-02 │
└─────────────────────────────────────────────────────┘
```
## toStartOfQuarter {#tostartofquarter}

将日期或带时间的日期向下取整到该季度的第一天。季度的第一天为 1 月 1 日、4 月 1 日、7 月 1 日或 10 月 1 日。
返回日期。

**语法**

```sql
toStartOfQuarter(value)
```

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的季度的第一天。 [Date](../data-types/date.md)。

**示例**

```sql
SELECT toStartOfQuarter(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toStartOfQuarter(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-04-01 │
└─────────────────────────────────────────────────────┘
```
## toStartOfMonth {#tostartofmonth}

将日期或带时间的日期向下取整到该月的第一天。返回日期。

**语法**

```sql
toStartOfMonth(value)
```

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的月份的第一天。 [Date](../data-types/date.md)。

**示例**

```sql
SELECT toStartOfMonth(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toStartOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                        2023-04-01 │
└───────────────────────────────────────────────────┘
```

:::note
解析不正确日期的行为是特定于实现的。 ClickHouse 可能返回零日期、抛出异常或进行“自然”溢出。
:::
## toLastDayOfMonth {#tolastdayofmonth}

将日期或带时间的日期向上取整到该月的最后一天。返回日期。

**语法**

```sql
toLastDayOfMonth(value)
```

别名： `LAST_DAY`

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的月份的最后一天。 [Date](../data-types/date.md)。

**示例**

```sql
SELECT toLastDayOfMonth(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toLastDayOfMonth(toDateTime('2023-04-21 10:20:30'))─┐
│                                          2023-04-30 │
└─────────────────────────────────────────────────────┘
```
## toMonday {#tomonday}

将日期或带时间的日期向下取整到最近的星期一。返回日期。

**语法**

```sql
toMonday(value)
```

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 最近的星期一的日期或早于给定日期的日期。 [Date](../data-types/date.md)。

**示例**

```sql
SELECT
    toMonday(toDateTime('2023-04-21 10:20:30')), /* 星期五 */
    toMonday(toDate('2023-04-24')), /* 已经是星期一 */
```

结果：

```response
┌─toMonday(toDateTime('2023-04-21 10:20:30'))─┬─toMonday(toDate('2023-04-24'))─┐
│                                  2023-04-17 │                     2023-04-24 │
└─────────────────────────────────────────────┴────────────────────────────────┘
```
## toStartOfWeek {#tostartofweek}

将日期或带时间的日期向下取整到最近的星期天或星期一。返回日期。mode 参数的工作方式与函数 `toWeek()` 中的 mode 参数完全相同。如果未指定模式，则默认为 0。

**语法**

``` sql
toStartOfWeek(t[, mode[, timezone]])
```

**参数**

- `t` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `mode` - 确定星期的第一天，如 [toWeek()](#toweek) 函数所述
- `timezone` - 可选参数，其行为类似于其他转换函数

**返回值**

- 最近的星期天或星期一的日期，具体取决于模式。[Date](../data-types/date.md)。

**示例**

```sql
SELECT
    toStartOfWeek(toDateTime('2023-04-21 10:20:30')), /* 星期五 */
    toStartOfWeek(toDateTime('2023-04-21 10:20:30'), 1), /* 星期五 */
    toStartOfWeek(toDate('2023-04-24')), /* 星期一 */
    toStartOfWeek(toDate('2023-04-24'), 1) /* 星期一 */
FORMAT Vertical
```

结果：

```response
Row 1:
──────
toStartOfWeek(toDateTime('2023-04-21 10:20:30')):    2023-04-16
toStartOfWeek(toDateTime('2023-04-21 10:20:30'), 1): 2023-04-17
toStartOfWeek(toDate('2023-04-24')):                 2023-04-23
toStartOfWeek(toDate('2023-04-24'), 1):              2023-04-24
```

## toLastDayOfWeek {#tolastdayofweek}

将日期或带时间的日期向上取整到最近的星期六或星期天。返回日期。
mode 参数的工作方式与函数 `toWeek()` 中的 mode 参数完全相同。如果未指定模式，则假定模式为 0。

**语法**

``` sql
toLastDayOfWeek(t[, mode[, timezone]])
```

**参数**

- `t` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `mode` - 确定星期的最后一天，如 [toWeek](#toweek) 函数所述
- `timezone` - 可选参数，其行为类似于其他转换函数

**返回值**

- 最近的星期天或星期六的日期，具体取决于模式。[Date](../data-types/date.md)。

**示例**

```sql
SELECT
    toLastDayOfWeek(toDateTime('2023-04-21 10:20:30')), /* 星期五 */
    toLastDayOfWeek(toDateTime('2023-04-21 10:20:30'), 1), /* 星期五 */
    toLastDayOfWeek(toDate('2023-04-22')), /* 星期六 */
    toLastDayOfWeek(toDate('2023-04-22'), 1) /* 星期六 */
FORMAT Vertical
```

结果：

```response
Row 1:
──────
toLastDayOfWeek(toDateTime('2023-04-21 10:20:30')):    2023-04-22
toLastDayOfWeek(toDateTime('2023-04-21 10:20:30'), 1): 2023-04-23
toLastDayOfWeek(toDate('2023-04-22')):                 2023-04-22
toLastDayOfWeek(toDate('2023-04-22'), 1):              2023-04-23
```

## toStartOfDay {#tostartofday}

将带时间的日期向下取整到一天的开始。

**语法**

```sql
toStartOfDay(value)
```

**参数**

- `value` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的一天开始。[DateTime](../data-types/datetime.md)。

**示例**

```sql
SELECT toStartOfDay(toDateTime('2023-04-21 10:20:30'))
```

结果：

```response
┌─toStartOfDay(toDateTime('2023-04-21 10:20:30'))─┐
│                             2023-04-21 00:00:00 │
└─────────────────────────────────────────────────┘
```

## toStartOfHour {#tostartofhour}

将带时间的日期向下取整到小时的开始。

**语法**

```sql
toStartOfHour(value)
```

**参数**

- `value` - 一个 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的小时开始。[DateTime](../data-types/datetime.md)。

**示例**

```sql
SELECT
    toStartOfHour(toDateTime('2023-04-21 10:20:30')),
    toStartOfHour(toDateTime64('2023-04-21', 6))
```

结果：

```response
┌─toStartOfHour(toDateTime('2023-04-21 10:20:30'))─┬─toStartOfHour(toDateTime64('2023-04-21', 6))─┐
│                              2023-04-21 10:00:00 │                          2023-04-21 00:00:00 │
└──────────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

## toStartOfMinute {#tostartofminute}

将带时间的日期向下取整到分钟的开始。

**语法**

```sql
toStartOfMinute(value)
```

**参数**

- `value` - 一个 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的分钟开始。[DateTime](../data-types/datetime.md)。

**示例**

```sql
SELECT
    toStartOfMinute(toDateTime('2023-04-21 10:20:30')),
    toStartOfMinute(toDateTime64('2023-04-21 10:20:30.5300', 8))
FORMAT Vertical
```

结果：

```response
Row 1:
──────
toStartOfMinute(toDateTime('2023-04-21 10:20:30')):           2023-04-21 10:20:00
toStartOfMinute(toDateTime64('2023-04-21 10:20:30.5300', 8)): 2023-04-21 10:20:00
```

## toStartOfSecond {#tostartofsecond}

截断子秒。

**语法**

``` sql
toStartOfSecond(value, [timezone])
```

**参数**

- `value` — 日期和时间。 [DateTime64](../data-types/datetime64.md)。
- `timezone` — 返回值的 [时区](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。如果未指定，则函数使用 `value` 参数的时区。[String](../data-types/string.md)。

**返回值**

- 输入值不带子秒。[DateTime64](../data-types/datetime64.md)。

**示例**

没有时区的查询：

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999', 3) AS dt64
SELECT toStartOfSecond(dt64);
```

结果：

``` text
┌───toStartOfSecond(dt64)─┐
│ 2020-01-01 10:20:30.000 │
└─────────────────────────┘
```

带时区的查询：

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999', 3) AS dt64
SELECT toStartOfSecond(dt64, 'Asia/Istanbul');
```

结果：

``` text
┌─toStartOfSecond(dt64, 'Asia/Istanbul')─┐
│                2020-01-01 13:20:30.000 │
└────────────────────────────────────────┘
```

**另见**

- [时区](../../operations/server-configuration-parameters/settings.md#timezone) 服务器配置参数。

## toStartOfMillisecond {#tostartofmillisecond}

将带时间的日期向下取整到毫秒的开始。

**语法**

``` sql
toStartOfMillisecond(value, [timezone])
```

**参数**

- `value` — 日期和时间。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 返回值的 [时区](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。如果未指定，则函数使用 `value` 参数的时区。[String](../../sql-reference/data-types/string.md)。

**返回值**

- 输入值带子毫秒。[DateTime64](../../sql-reference/data-types/datetime64.md)。

**示例**

没有时区的查询：

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMillisecond(dt64);
```

结果：

``` text
┌────toStartOfMillisecond(dt64)─┐
│ 2020-01-01 10:20:30.999000000 │
└───────────────────────────────┘
```

带时区的查询：

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMillisecond(dt64, 'Asia/Istanbul');
```

结果：

``` text
┌─toStartOfMillisecond(dt64, 'Asia/Istanbul')─┐
│               2020-01-01 12:20:30.999000000 │
└─────────────────────────────────────────────┘
```

**另见**

- [时区](../../operations/server-configuration-parameters/settings.md#timezone) 服务器配置参数。

## toStartOfMicrosecond {#tostartofmicrosecond}

将带时间的日期向下取整到微秒的开始。

**语法**

``` sql
toStartOfMicrosecond(value, [timezone])
```

**参数**

- `value` — 日期和时间。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 返回值的 [时区](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。如果未指定，则函数使用 `value` 参数的时区。[String](../../sql-reference/data-types/string.md)。

**返回值**

- 输入值带子微秒。[DateTime64](../../sql-reference/data-types/datetime64.md)。

**示例**

没有时区的查询：

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMicrosecond(dt64);
```

结果：

``` text
┌────toStartOfMicrosecond(dt64)─┐
│ 2020-01-01 10:20:30.999999000 │
└───────────────────────────────┘
```

带时区的查询：

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMicrosecond(dt64, 'Asia/Istanbul');
```

结果：

``` text
┌─toStartOfMicrosecond(dt64, 'Asia/Istanbul')─┐
│               2020-01-01 12:20:30.999999000 │
└─────────────────────────────────────────────┘
```

**另见**

- [时区](../../operations/server-configuration-parameters/settings.md#timezone) 服务器配置参数。

## toStartOfNanosecond {#tostartofnanosecond}

将带时间的日期向下取整到纳秒的开始。

**语法**

``` sql
toStartOfNanosecond(value, [timezone])
```

**参数**

- `value` — 日期和时间。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — 返回值的 [时区](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。如果未指定，则函数使用 `value` 参数的时区。[String](../../sql-reference/data-types/string.md)。

**返回值**

- 输入值带纳秒。[DateTime64](../../sql-reference/data-types/datetime64.md)。

**示例**

没有时区的查询：

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfNanosecond(dt64);
```

结果：

``` text
┌─────toStartOfNanosecond(dt64)─┐
│ 2020-01-01 10:20:30.999999999 │
└───────────────────────────────┘
```

带时区的查询：

``` sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfNanosecond(dt64, 'Asia/Istanbul');
```

结果：

``` text
┌─toStartOfNanosecond(dt64, 'Asia/Istanbul')─┐
│              2020-01-01 12:20:30.999999999 │
└────────────────────────────────────────────┘
```

**另见**

- [时区](../../operations/server-configuration-parameters/settings.md#timezone) 服务器配置参数。

## toStartOfFiveMinutes {#tostartoffiveminutes}

将带时间的日期向下取整到五分钟间隔的开始。

**语法**

```sql
toStartOfFiveMinutes(value)
```

**参数**

- `value` - 一个 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的五分钟间隔的开始。[DateTime](../data-types/datetime.md)。

**示例**

```sql
SELECT
    toStartOfFiveMinutes(toDateTime('2023-04-21 10:17:00')),
    toStartOfFiveMinutes(toDateTime('2023-04-21 10:20:00')),
    toStartOfFiveMinutes(toDateTime('2023-04-21 10:23:00'))
FORMAT Vertical
```

结果：

```response
Row 1:
──────
toStartOfFiveMinutes(toDateTime('2023-04-21 10:17:00')): 2023-04-21 10:15:00
toStartOfFiveMinutes(toDateTime('2023-04-21 10:20:00')): 2023-04-21 10:20:00
toStartOfFiveMinutes(toDateTime('2023-04-21 10:23:00')): 2023-04-21 10:20:00
```

## toStartOfTenMinutes {#tostartoftenminutes}

将带时间的日期向下取整到十分钟间隔的开始。

**语法**

```sql
toStartOfTenMinutes(value)
```

**参数**

- `value` - 一个 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的十分钟间隔的开始。[DateTime](../data-types/datetime.md)。

**示例**

```sql
SELECT
    toStartOfTenMinutes(toDateTime('2023-04-21 10:17:00')),
    toStartOfTenMinutes(toDateTime('2023-04-21 10:20:00')),
    toStartOfTenMinutes(toDateTime('2023-04-21 10:23:00'))
FORMAT Vertical
```

结果：

```response
Row 1:
──────
toStartOfTenMinutes(toDateTime('2023-04-21 10:17:00')): 2023-04-21 10:10:00
toStartOfTenMinutes(toDateTime('2023-04-21 10:20:00')): 2023-04-21 10:20:00
toStartOfTenMinutes(toDateTime('2023-04-21 10:23:00')): 2023-04-21 10:20:00
```

## toStartOfFifteenMinutes {#tostartoffifteenminutes}

将带时间的日期向下取整到十五分钟间隔的开始。

**语法**

```sql
toStartOfFifteenMinutes(value)
```

**参数**

- `value` - 一个 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 给定日期/时间的十五分钟间隔的开始。[DateTime](../data-types/datetime.md)。

**示例**

```sql
SELECT
    toStartOfFifteenMinutes(toDateTime('2023-04-21 10:17:00')),
    toStartOfFifteenMinutes(toDateTime('2023-04-21 10:20:00')),
    toStartOfFifteenMinutes(toDateTime('2023-04-21 10:23:00'))
FORMAT Vertical
```

结果：

```response
Row 1:
──────
toStartOfFifteenMinutes(toDateTime('2023-04-21 10:17:00')): 2023-04-21 10:15:00
toStartOfFifteenMinutes(toDateTime('2023-04-21 10:20:00')): 2023-04-21 10:15:00
toStartOfFifteenMinutes(toDateTime('2023-04-21 10:23:00')): 2023-04-21 10:15:00
```

## toStartOfInterval {#tostartofinterval}

该函数以 `toStartOfInterval(date_or_date_with_time, INTERVAL x unit [, time_zone])` 语法概括其他 `toStartOf*()` 函数。
例如，
- `toStartOfInterval(t, INTERVAL 1 YEAR)` 返回的结果与 `toStartOfYear(t)` 相同，
- `toStartOfInterval(t, INTERVAL 1 MONTH)` 返回的结果与 `toStartOfMonth(t)` 相同，
- `toStartOfInterval(t, INTERVAL 1 DAY)` 返回的结果与 `toStartOfDay(t)` 相同，
- `toStartOfInterval(t, INTERVAL 15 MINUTE)` 返回的结果与 `toStartOfFifteenMinutes(t)` 相同。

计算是相对于特定时间点进行的：

| 间隔        | 开始                      |
|-------------|---------------------------|
| YEAR        | 年 0                      |
| QUARTER     | 1900 年第一季度          |
| MONTH       | 1900 年一月              |
| WEEK        | 1970 年第一周 (01-05)    |
| DAY         | 1970-01-01                |
| HOUR        | (*)                       |
| MINUTE      | 1970-01-01 00:00:00       |
| SECOND      | 1970-01-01 00:00:00       |
| MILLISECOND | 1970-01-01 00:00:00       |
| MICROSECOND | 1970-01-01 00:00:00       |
| NANOSECOND  | 1970-01-01 00:00:00       |

(*) 小时间隔是特殊的：计算始终相对于当前日期的 00:00:00 (午夜) 进行。因此，仅 1 到 23 之间的小时值是有用的。

如果指定了单位 `WEEK`，`toStartOfInterval` 假定周一为一周的开始。请注意，此行为与函数 `toStartOfWeek` 中的默认行为不同，后者的周开始为星期天。

**语法**

```sql
toStartOfInterval(value, INTERVAL x unit[, time_zone])
toStartOfInterval(value, INTERVAL x unit[, origin[, time_zone]])
```
别名：`time_bucket`，`date_bin`。

第二个重载模拟 TimescaleDB 的 `time_bucket()` 函数，以及 PostgreSQL 的 `date_bin()` 函数，例如：

``` SQL
SELECT toStartOfInterval(toDateTime('2023-01-01 14:45:00'), INTERVAL 1 MINUTE, toDateTime('2023-01-01 14:35:30'));
```

结果：

``` reference
┌───toStartOfInterval(...)─┐
│      2023-01-01 14:44:30 │
└──────────────────────────┘
```

**另见**
- [date_trunc](#date_trunc)

## toTime {#totime}

将带时间的日期转换为特定的固定日期，同时保留时间。

**语法**

```sql
toTime(date[,timezone])
```

**参数**

- `date` — 要转换为时间的日期。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `timezone`（可选）— 返回值的时区。[String](../data-types/string.md)。

**返回值**

- DateTime 的日期等同于 `1970-01-02`，同时保留时间。[DateTime](../data-types/datetime.md)。

:::note
如果 `date` 输入参数包含子秒组件，
则它们将被截断在返回的 `DateTime` 值中，精确到秒。
:::

**示例**

查询：

```sql
SELECT toTime(toDateTime64('1970-12-10 01:20:30.3000',3)) AS result, toTypeName(result);
```

结果：

```response
┌──────────────result─┬─toTypeName(result)─┐
│ 1970-01-02 01:20:30 │ DateTime           │
└─────────────────────┴────────────────────┘
```

## toRelativeYearNum {#torelativeyearnum}

将日期或带时间的日期转换为自某一固定过去时间点以来经过的年数。

**语法**

```sql
toRelativeYearNum(date)
```

**参数**

- `date` — 日期或带时间的日期。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从固定的过去参考点起的年数。[UInt16](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
    toRelativeYearNum(toDate('2002-12-08')) AS y1,
    toRelativeYearNum(toDate('2010-10-26')) AS y2
```

结果：

```response
┌───y1─┬───y2─┐
│ 2002 │ 2010 │
└──────┴──────┘
```

## toRelativeQuarterNum {#torelativequarternum}

将日期或带时间的日期转换为自某一固定过去时间点以来经过的季度数。

**语法**

```sql
toRelativeQuarterNum(date)
```

**参数**

- `date` — 日期或带时间的日期。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从固定的过去参考点起的季度数。[UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
  toRelativeQuarterNum(toDate('1993-11-25')) AS q1,
  toRelativeQuarterNum(toDate('2005-01-05')) AS q2
```

结果：

```response
┌───q1─┬───q2─┐
│ 7975 │ 8020 │
└──────┴──────┘
```

## toRelativeMonthNum {#torelativemonthnum}

将日期或带时间的日期转换为自某一固定过去时间点以来经过的月份数。

**语法**

```sql
toRelativeMonthNum(date)
```

**参数**

- `date` — 日期或带时间的日期。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从固定的过去参考点起的月份数。[UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
  toRelativeMonthNum(toDate('2001-04-25')) AS m1,
  toRelativeMonthNum(toDate('2009-07-08')) AS m2
```

结果：

```response
┌────m1─┬────m2─┐
│ 24016 │ 24115 │
└───────┴───────┘
```

## toRelativeWeekNum {#torelativeweeknum}

将日期或带时间的日期转换为自某一固定过去时间点以来经过的周数。

**语法**

```sql
toRelativeWeekNum(date)
```

**参数**

- `date` — 日期或带时间的日期。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从固定的过去参考点起的周数。[UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
  toRelativeWeekNum(toDate('2000-02-29')) AS w1,
  toRelativeWeekNum(toDate('2001-01-12')) AS w2
```

结果：

```response
┌───w1─┬───w2─┐
│ 1574 │ 1619 │
└──────┴──────┘
```

## toRelativeDayNum {#torelativedaynum}

将日期或带时间的日期转换为自某一固定过去时间点以来经过的天数。

**语法**

```sql
toRelativeDayNum(date)
```

**参数**

- `date` — 日期或带时间的日期。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从固定的过去参考点起的天数。[UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
  toRelativeDayNum(toDate('1993-10-05')) AS d1,
  toRelativeDayNum(toDate('2000-09-20')) AS d2
```

结果：

```response
┌───d1─┬────d2─┐
│ 8678 │ 11220 │
└──────┴───────┘
```

## toRelativeHourNum {#torelativehournum}

将日期或带时间的日期转换为自某一固定过去时间点以来经过的小时数。

**语法**

```sql
toRelativeHourNum(date)
```

**参数**

- `date` — 日期或带时间的日期。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从固定的过去参考点起的小时数。[UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
  toRelativeHourNum(toDateTime('1993-10-05 05:20:36')) AS h1,
  toRelativeHourNum(toDateTime('2000-09-20 14:11:29')) AS h2
```

结果：

```response
┌─────h1─┬─────h2─┐
│ 208276 │ 269292 │
└────────┴────────┘
```

## toRelativeMinuteNum {#torelativeminutenum}

将日期或带时间的日期转换为自某一固定过去时间点以来经过的分钟数。

**语法**

```sql
toRelativeMinuteNum(date)
```

**参数**

- `date` — 日期或带时间的日期。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从固定的过去参考点起的分钟数。[UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
  toRelativeMinuteNum(toDateTime('1993-10-05 05:20:36')) AS m1,
  toRelativeMinuteNum(toDateTime('2000-09-20 14:11:29')) AS m2
```

结果：

```response
┌───────m1─┬───────m2─┐
│ 12496580 │ 16157531 │
└──────────┴──────────┘
```

## toRelativeSecondNum {#torelativesecondnum}

将日期或带时间的日期转换为自某一固定过去时间点以来经过的秒数。

**语法**

```sql
toRelativeSecondNum(date)
```

**参数**

- `date` — 日期或带时间的日期。[Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从固定的过去参考点起的秒数。[UInt32](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
  toRelativeSecondNum(toDateTime('1993-10-05 05:20:36')) AS s1,
  toRelativeSecondNum(toDateTime('2000-09-20 14:11:29')) AS s2
```

结果：

```response
┌────────s1─┬────────s2─┐
│ 749794836 │ 969451889 │
└───────────┴───────────┘
```

## toISOYear {#toisoyear}

将日期或带时间的日期转换为 ISO 年作为 UInt16 数。

**语法**

```sql
toISOYear(value)
```

**参数**

- `value` — 带日期或带时间的值。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 将输入值转换为 ISO 年数。[UInt16](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
  toISOYear(toDate('2024/10/02')) as year1,
  toISOYear(toDateTime('2024-10-02 01:30:00')) as year2
```

结果：

```response
┌─year1─┬─year2─┐
│  2024 │  2024 │
└───────┴───────┘
```

## toISOWeek {#toisoweek}

将日期或带时间的日期转换为包含 ISO 周数的 UInt8 数。

**语法**

```sql
toISOWeek(value)
```

**参数**

- `value` — 带日期或带时间的值。

**返回值**

- 将 `value` 转换为当前的 ISO 周数。[UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
  toISOWeek(toDate('2024/10/02')) AS week1,
  toISOWeek(toDateTime('2024/10/02 01:30:00')) AS week2
```

响应：

```response
┌─week1─┬─week2─┐
│    40 │    40 │
└───────┴───────┘
```

## toWeek {#toweek}

该函数返回日期或日期时间的周数。`toWeek()` 的双参数形式使您能够指定周从星期天还是星期一开始，以及返回值是否应在 0 到 53 或 1 到 53 范围内。如果省略 mode 参数，默认模式为 0。

`toISOWeek()` 是一个兼容性函数，相当于 `toWeek(date,3)`。

以下表格描述了 mode 参数的工作方式。

| 模式 | 一周的第一天 | 范围 | 第 1 周是这一年的第一周...        |
|------|---------------|-------|-----------------------------------|
| 0    | 星期天          | 0-53  | 包含本年的一个星期天               |
| 1    | 星期一          | 0-53  | 包含本年 4 天或更多的日子          |
| 2    | 星期天          | 1-53  | 包含本年的一个星期天               |
| 3    | 星期一          | 1-53  | 包含本年 4 天或更多的日子          |
| 4    | 星期天          | 0-53  | 包含本年 4 天或更多的日子          |
| 5    | 星期一          | 0-53  | 包含本年的一个星期一               |
| 6    | 星期天          | 1-53  | 包含本年 4 天或更多的日子          |
| 7    | 星期一          | 1-53  | 包含本年的一个星期一               |
| 8    | 星期天          | 1-53  | 包含一月一日                      |
| 9    | 星期一          | 1-53  | 包含一月一日                      |

对于含有“包含本年 4 天或更多的日子”的模式值，周数根据 ISO 8601:1988 编号：

- 如果包含一月一日的那一周在新年中有 4 天或更多，则它为第 1 周。
  
- 否则，它是前一年的最后一周，下一周为第 1 周。

对于“包含一月一日”的模式值，包含一月一日的那一周即为第 1 周。
无论该周在新年中包含多少天，即使只包含一天。
例如，如果 12 月的最后一周包含下一年的一月一日，那么它将成为下一年的第 1 周。

**语法**

``` sql
toWeek(t[, mode[, time_zone]])
```

别名：`WEEK`

**参数**

- `t` – 日期或日期时间。
- `mode` – 可选参数，取值范围为 \[0,9\]，默认为 0。
- `timezone` – 可选参数，其行为类似于其他转换函数。

第一个参数也可以作为 [String](../data-types/string.md) 指定，格式为 [parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort) 所支持的格式。字符串参数的支持仅出于与 MySQL 的兼容性，特定第三方工具期望使用此格式。由于字符串参数的支持可能在未来依赖新的 MySQL 兼容性设置，并且字符串解析通常较慢，因此不建议使用它。

**示例**

``` sql
SELECT toDate('2016-12-27') AS date, toWeek(date) AS week0, toWeek(date,1) AS week1, toWeek(date,9) AS week9;
```

``` text
┌───────date─┬─week0─┬─week1─┬─week9─┐
│ 2016-12-27 │    52 │    52 │     1 │
└────────────┴───────┴───────┴───────┘
```

## toYearWeek {#toyearweek}

返回日期的年份和周数。结果中的年份可能与日期参数中的年份不同，特别是在年初和年末的第一周和最后一周。

mode 参数与 `toWeek()` 的 mode 参数工作方式相同。对于单参数语法，使用模式值 0。

`toISOYear()` 是一个兼容性函数，相当于 `intDiv(toYearWeek(date,3),100)`。

:::warning
`toYearWeek()` 返回的周数可能与 `toWeek()` 返回的周数不同。`toWeek()` 总是返回给定年份中的周数，如果 `toWeek()` 返回 `0`，则 `toYearWeek()` 返回对应于上一年的最后一周的值。请参见下面示例中的 `prev_yearWeek`。
:::

**语法**

``` sql
toYearWeek(t[, mode[, timezone]])
```

别名：`YEARWEEK`

第一个参数也可以作为 [String](../data-types/string.md) 指定，格式为 [parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort) 所支持的格式。字符串参数的支持仅出于与 MySQL 的兼容性，特定第三方工具期望使用此格式。由于字符串参数的支持可能在未来依赖新的 MySQL 兼容性设置，并且字符串解析通常较慢，因此不建议使用它。

**示例**

``` sql
SELECT toDate('2016-12-27') AS date, toYearWeek(date) AS yearWeek0, toYearWeek(date,1) AS yearWeek1, toYearWeek(date,9) AS yearWeek9, toYearWeek(toDate('2022-01-01')) AS prev_yearWeek;
```

``` text
┌───────date─┬─yearWeek0─┬─yearWeek1─┬─yearWeek9─┬─prev_yearWeek─┐
│ 2016-12-27 │    201652 │    201652 │    201701 │        202152 │
└────────────┴───────────┴───────────┴───────────┴───────────────┘
```

## toDaysSinceYearZero {#todayssinceyearzero}

返回给定日期以来，自 [公元 1 年 1 月 1 日](https://en.wikipedia.org/wiki/Year_zero) 在 [ISO 8601 定义的前瞻性公历](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar) 中经过的天数。计算与 MySQL 的 [`TO_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_to-days) 函数相同。

**语法**

``` sql
toDaysSinceYearZero(date[, time_zone])
```

别名：`TO_DAYS`

**参数**

- `date` — 用于计算自公元零年起经过天数的日期。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。
- `time_zone` — 一个字符串类型常量值或表示时区的表达式。[String types](../data-types/string.md)

**返回值**

自零年 0000-01-01 以来经过的天数。[UInt32](../data-types/int-uint.md)。

**示例**

``` sql
SELECT toDaysSinceYearZero(toDate('2023-09-08'));
```

结果：

``` text
┌─toDaysSinceYearZero(toDate('2023-09-08')))─┐
│                                     713569 │
└────────────────────────────────────────────┘
```

**另见**

- [fromDaysSinceYearZero](#fromdayssinceyearzero)

## fromDaysSinceYearZero {#fromdayssinceyearzero}

返回自 [0000年1月1日](https://en.wikipedia.org/wiki/Year_zero) 以来经过的天数对应的日期，该日期在 [ISO 8601 定义的推算格里历](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar) 中。计算与 MySQL 的 [`FROM_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_from-days) 函数相同。

如果结果无法在 [Date](../data-types/date.md) 类型的范围内表示，则结果未定义。

**语法**

``` sql
fromDaysSinceYearZero(days)
```

别名： `FROM_DAYS`

**参数**

- `days` — 自零年起经过的天数。

**返回值**

自零年起经过的天数对应的日期。 [Date](../data-types/date.md)。

**示例**

``` sql
SELECT fromDaysSinceYearZero(739136), fromDaysSinceYearZero(toDaysSinceYearZero(toDate('2023-09-08')));
```

结果：

``` text
┌─fromDaysSinceYearZero(739136)─┬─fromDaysSinceYearZero(toDaysSinceYearZero(toDate('2023-09-08')))─┐
│                    2023-09-08 │                                                       2023-09-08 │
└───────────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

**参见**

- [toDaysSinceYearZero](#todayssinceyearzero)
## fromDaysSinceYearZero32 {#fromdayssinceyearzero32}

类似于 [fromDaysSinceYearZero](#fromdayssinceyearzero)，但返回一个 [Date32](../data-types/date32.md)。
## age {#age}

返回 `startdate` 和 `enddate` 之间差异的 `unit` 组件。该差异使用 1 纳秒的精度计算。
例如，`2021-12-29` 和 `2022-01-01` 之间的差异为 `day` 单位 3 天，`month` 单位 0 个月，`year` 单位 0 年。

有关 `age` 的替代项，请参见函数 `date_diff`。

**语法**

``` sql
age('unit', startdate, enddate, [timezone])
```

**参数**

- `unit` — 返回结果的间隔类型。 [String](../data-types/string.md)。
    可能的值：

    - `nanosecond`, `nanoseconds`, `ns`
    - `microsecond`, `microseconds`, `us`, `u`
    - `millisecond`, `milliseconds`, `ms`
    - `second`, `seconds`, `ss`, `s`
    - `minute`, `minutes`, `mi`, `n`
    - `hour`, `hours`, `hh`, `h`
    - `day`, `days`, `dd`, `d`
    - `week`, `weeks`, `wk`, `ww`
    - `month`, `months`, `mm`, `m`
    - `quarter`, `quarters`, `qq`, `q`
    - `year`, `years`, `yyyy`, `yy`

- `startdate` — 第一个时间值以进行减法（被减数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

- `enddate` — 第二个时间值以进行减法（减数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。如果指定，它将应用于 `startdate` 和 `enddate`。如果未指定，则使用 `startdate` 和 `enddate` 的时区。如果它们不相同，结果是不确定的。 [String](../data-types/string.md)。

**返回值**

以 `unit` 表示的 `enddate` 和 `startdate` 之间的差异。 [Int](../data-types/int-uint.md)。

**示例**

``` sql
SELECT age('hour', toDateTime('2018-01-01 22:30:00'), toDateTime('2018-01-02 23:00:00'));
```

结果：

``` text
┌─age('hour', toDateTime('2018-01-01 22:30:00'), toDateTime('2018-01-02 23:00:00'))─┐
│                                                                                24 │
└───────────────────────────────────────────────────────────────────────────────────┘
```

``` sql
SELECT
    toDate('2022-01-01') AS e,
    toDate('2021-12-29') AS s,
    age('day', s, e) AS day_age,
    age('month', s, e) AS month__age,
    age('year', s, e) AS year_age;
```

结果：

``` text
┌──────────e─┬──────────s─┬─day_age─┬─month__age─┬─year_age─┐
│ 2022-01-01 │ 2021-12-29 │       3 │          0 │        0 │
└────────────┴────────────┴─────────┴────────────┴──────────┘
```
## date_diff {#date_diff}

返回在 `startdate` 和 `enddate` 之间跨越的指定 `unit` 边界的计数。
差异使用相对单位计算，例如，`2021-12-29` 和 `2022-01-01` 之间的差异为 `day` 单位 3 天（见 [toRelativeDayNum](#torelativedaynum)），`month` 单位 1 个月（见 [toRelativeMonthNum](#torelativemonthnum））和 `year` 单位 1 年（见 [toRelativeYearNum](#torelativeyearnum)）。

如果指定了 `week` 单位，则 `date_diff` 假定周从星期一开始。请注意，此行为与函数 `toWeek()` 不同，后者的默认周从星期天开始。

有关 `date_diff` 的替代项，请参见函数 `age`。

**语法**

``` sql
date_diff('unit', startdate, enddate, [timezone])
```

别名： `dateDiff`， `DATE_DIFF`， `timestampDiff`， `timestamp_diff`， `TIMESTAMP_DIFF`。

**参数**

- `unit` — 返回结果的间隔类型。[String](../data-types/string.md)。
    可能的值：

    - `nanosecond`, `nanoseconds`, `ns`
    - `microsecond`, `microseconds`, `us`, `u`
    - `millisecond`, `milliseconds`, `ms`
    - `second`, `seconds`, `ss`, `s`
    - `minute`, `minutes`, `mi`, `n`
    - `hour`, `hours`, `hh`, `h`
    - `day`, `days`, `dd`, `d`
    - `week`, `weeks`, `wk`, `ww`
    - `month`, `months`, `mm`, `m`
    - `quarter`, `quarters`, `qq`, `q`
    - `year`, `years`, `yyyy`, `yy`

- `startdate` — 第一个时间值进行减法（被减数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

- `enddate` — 第二个时间值进行减法（减数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。如果指定，它将应用于 `startdate` 和 `enddate`。如果未指定，则使用 `startdate` 和 `enddate` 的时区。如果它们不相同，结果是不确定的。[String](../data-types/string.md)。

**返回值**

以 `unit` 表示的 `enddate` 和 `startdate` 之间的差异。 [Int](../data-types/int-uint.md)。

**示例**

``` sql
SELECT dateDiff('hour', toDateTime('2018-01-01 22:00:00'), toDateTime('2018-01-02 23:00:00'));
```

结果：

``` text
┌─dateDiff('hour', toDateTime('2018-01-01 22:00:00'), toDateTime('2018-01-02 23:00:00'))─┐
│                                                                                     25 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

``` sql
SELECT
    toDate('2022-01-01') AS e,
    toDate('2021-12-29') AS s,
    dateDiff('day', s, e) AS day_diff,
    dateDiff('month', s, e) AS month__diff,
    dateDiff('year', s, e) AS year_diff;
```

结果：

``` text
┌──────────e─┬──────────s─┬─day_diff─┬─month__diff─┬─year_diff─┐
│ 2022-01-01 │ 2021-12-29 │        3 │           1 │         1 │
└────────────┴────────────┴──────────┴─────────────┴───────────┘
```
## date\_trunc {#date_trunc}

将日期和时间数据截断到指定的日期部分。

**语法**

``` sql
date_trunc(unit, value[, timezone])
```

别名： `dateTrunc`。

**参数**

- `unit` — 截断结果的间隔类型。 [字符串字面值](/sql-reference/syntax#string)。
    可能的值：

    - `nanosecond` - 仅与 DateTime64 兼容
    - `microsecond` - 仅与 DateTime64 兼容
    - `milisecond` - 仅与 DateTime64 兼容
    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

    `unit` 参数不区分大小写。

- `value` — 日期和时间。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。
- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选），用于返回值。如果未指定，函数使用 `value` 参数的时区。 [String](../data-types/string.md)。

**返回值**

- 被截断为指定日期部分的值。 [DateTime](../data-types/datetime.md)。

**示例**

没有时区查询：

``` sql
SELECT now(), date_trunc('hour', now());
```

结果：

``` text
┌───────────────now()─┬─date_trunc('hour', now())─┐
│ 2020-09-28 10:40:45 │       2020-09-28 10:00:00 │
└─────────────────────┴───────────────────────────┘
```

指定时区的查询：

```sql
SELECT now(), date_trunc('hour', now(), 'Asia/Istanbul');
```

结果：

```text
┌───────────────now()─┬─date_trunc('hour', now(), 'Asia/Istanbul')─┐
│ 2020-09-28 10:46:26 │                        2020-09-28 13:00:00 │
└─────────────────────┴────────────────────────────────────────────┘
```

**参见**

- [toStartOfInterval](#tostartofinterval)
## date\_add {#date_add}

将时间间隔或日期间隔添加到提供的日期或日期时间。

如果添加的结果超出数据类型的范围，结果未定义。

**语法**

``` sql
date_add(unit, value, date)
```

备用语法：

``` sql
date_add(date, INTERVAL value unit)
```

别名： `dateAdd`， `DATE_ADD`。

**参数**

- `unit` — 要添加的间隔类型。注意：这不是 [String](../data-types/string.md)，因此不能用引号括起来。
    可能的值：

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 要添加的间隔值。 [Int](../data-types/int-uint.md)。
- `date` — 要添加 `value` 的日期或日期时间。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

通过将 `value` 以 `unit` 表示添加到 `date` 获取的日期或日期时间。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
SELECT date_add(YEAR, 3, toDate('2018-01-01'));
```

结果：

```text
┌─plus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                    2021-01-01 │
└───────────────────────────────────────────────┘
```

```sql
SELECT date_add(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

结果：

```text
┌─plus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                    2021-01-01 │
└───────────────────────────────────────────────┘
```



**参见**

- [addDate](#adddate)
## date\_sub {#date_sub}

从提供的日期或日期时间中减去时间间隔或日期间隔。

如果减去的结果超出数据类型的范围，结果未定义。

**语法**

``` sql
date_sub(unit, value, date)
```

备用语法：

``` sql
date_sub(date, INTERVAL value unit)
```

别名： `dateSub`， `DATE_SUB`。

**参数**

- `unit` — 要减去的间隔类型。注意：这不是 [String](../data-types/string.md)，因此不能用引号括起来。

    可能的值：

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 要减去的间隔值。 [Int](../data-types/int-uint.md)。
- `date` — 要从中减去 `value` 的日期或日期时间。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

通过从 `date` 中减去以 `unit` 表示的 `value` 获得的日期或日期时间。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**示例**

``` sql
SELECT date_sub(YEAR, 3, toDate('2018-01-01'));
```

结果：

``` text
┌─minus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                     2015-01-01 │
└────────────────────────────────────────────────┘
```

``` sql
SELECT date_sub(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

结果：

``` text
┌─minus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                     2015-01-01 │
└────────────────────────────────────────────────┘
```


**参见**

- [subDate](#subdate)
## timestamp\_add {#timestamp_add}

将指定的时间值与提供的日期或日期时间值相加。

如果添加的结果超出数据类型的范围，结果未定义。

**语法**

``` sql
timestamp_add(date, INTERVAL value unit)
```

别名： `timeStampAdd`， `TIMESTAMP_ADD`。

**参数**

- `date` — 日期或日期时间。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。
- `value` — 要添加的间隔值。 [Int](../data-types/int-uint.md)。
- `unit` — 要添加的间隔类型。 [String](../data-types/string.md)。
    可能的值：

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

**返回值**

带有以 `unit` 表示的指定 `value` 添加到 `date` 的日期或日期时间。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
select timestamp_add(toDate('2018-01-01'), INTERVAL 3 MONTH);
```

结果：

```text
┌─plus(toDate('2018-01-01'), toIntervalMonth(3))─┐
│                                     2018-04-01 │
└────────────────────────────────────────────────┘
```
## timestamp\_sub {#timestamp_sub}

从提供的日期或日期时间中减去时间间隔。

如果减去的结果超出数据类型的范围，结果未定义。

**语法**

``` sql
timestamp_sub(unit, value, date)
```

别名： `timeStampSub`， `TIMESTAMP_SUB`。

**参数**

- `unit` — 要减去的间隔类型。 [String](../data-types/string.md)。
    可能的值：

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 要减去的间隔值。 [Int](../data-types/int-uint.md)。
- `date` — 日期或日期时间。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

通过从 `date` 中减去以 `unit` 表示的 `value` 获得的日期或日期时间。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
select timestamp_sub(MONTH, 5, toDateTime('2018-12-18 01:02:03'));
```

结果：

```text
┌─minus(toDateTime('2018-12-18 01:02:03'), toIntervalMonth(5))─┐
│                                          2018-07-18 01:02:03 │
└──────────────────────────────────────────────────────────────┘
```
## addDate {#adddate}

将时间间隔添加到提供的日期、日期时间或字符串编码的日期/日期时间。

如果添加的结果超出数据类型的范围，结果未定义。

**语法**

``` sql
addDate(date, interval)
```

**参数**

- `date` — 要添加 `interval` 的日期或日期时间。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、[DateTime64](../data-types/datetime64.md) 或 [String](../data-types/string.md)。
- `interval` — 要添加的间隔。[Interval](../data-types/special-data-types/interval.md)。

**返回值**

通过将 `interval` 添加到 `date` 获得的日期或日期时间。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
SELECT addDate(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

结果：

```text
┌─addDate(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                       2021-01-01 │
└──────────────────────────────────────────────────┘
```

别名： `ADDDATE`

**参见**

- [date_add](#date_add)
## subDate {#subdate}

从提供的日期、日期时间或字符串编码的日期/日期时间中减去时间间隔。

如果减去的结果超出数据类型的范围，结果未定义。

**语法**

``` sql
subDate(date, interval)
```

**参数**

- `date` — 要从中减去 `interval` 的日期或日期时间。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、[DateTime64](../data-types/datetime64.md) 或 [String](../data-types/string.md)。
- `interval` — 要减去的间隔。[Interval](../data-types/special-data-types/interval.md)。

**返回值**

通过从 `date` 中减去 `interval` 获得的日期或日期时间。[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
SELECT subDate(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

结果：

```text
┌─subDate(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                       2015-01-01 │
└──────────────────────────────────────────────────┘
```

别名： `SUBDATE`

**参见**

- [date_sub](#date_sub)
## now {#now}

返回查询分析时的当前日期和时间。该函数是常量表达式。

别名： `current_timestamp`。

**语法**

``` sql
now([timezone])
```

**参数**

- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选），用于返回值。[String](../data-types/string.md)。

**返回值**

- 当前日期和时间。 [DateTime](../data-types/datetime.md)。

**示例**

没有时区的查询：

``` sql
SELECT now();
```

结果：

``` text
┌───────────────now()─┐
│ 2020-10-17 07:42:09 │
└─────────────────────┘
```

指定时区的查询：

``` sql
SELECT now('Asia/Istanbul');
```

结果：

``` text
┌─now('Asia/Istanbul')─┐
│  2020-10-17 10:42:23 │
└──────────────────────┘
```
## now64 {#now64}

返回查询分析时当前日期和时间的亚秒精度。该函数是常量表达式。

**语法**

``` sql
now64([scale], [timezone])
```

**参数**

- `scale` - Tick 大小（精度）：10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。通常使用 - 3（默认为） （毫秒），6（微秒），9（纳秒）。
- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选），用于返回值。[String](../data-types/string.md)。

**返回值**

- 当前日期和时间的亚秒精度。 [DateTime64](../data-types/datetime64.md)。

**示例**

``` sql
SELECT now64(), now64(9, 'Asia/Istanbul');
```

结果：

``` text
┌─────────────────now64()─┬─────now64(9, 'Asia/Istanbul')─┐
│ 2022-08-21 19:34:26.196 │ 2022-08-21 22:34:26.196542766 │
└─────────────────────────┴───────────────────────────────┘
```
## nowInBlock {#nowInBlock}

返回每个数据块处理时的当前日期和时间。与函数 [now](#now) 相比，它不是常量表达式，且对于长时间运行的查询，不同块返回的值是不同的。

在长时间运行的 INSERT SELECT 查询中，可以使用此函数生成当前时间。

**语法**

``` sql
nowInBlock([timezone])
```

**参数**

- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选），用于返回值。[String](../data-types/string.md)。

**返回值**

- 当前日期和时间在每个数据块处理时的时间。 [DateTime](../data-types/datetime.md)。

**示例**

``` sql
SELECT
    now(),
    nowInBlock(),
    sleep(1)
FROM numbers(3)
SETTINGS max_block_size = 1
FORMAT PrettyCompactMonoBlock
```

结果：

``` text
┌───────────────now()─┬────────nowInBlock()─┬─sleep(1)─┐
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:19 │        0 │
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:20 │        0 │
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:21 │        0 │
└─────────────────────┴─────────────────────┴──────────┘
```
## today {#today}

返回查询分析时的当前日期。它与 `toDate(now())` 相同并且有别名： `curdate`， `current_date`。

**语法**

```sql
today()
```

**参数**

- 无

**返回值**

- 当前日期。 [DateTime](../data-types/datetime.md)。

**示例**

查询：

```sql
SELECT today() AS today, curdate() AS curdate, current_date() AS current_date FORMAT Pretty
```

**结果**：

在 2024 年 3 月 3 日运行上述查询将返回以下响应：

```response
┏━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━┓
┃      today ┃    curdate ┃ current_date ┃
┡━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━┩
│ 2024-03-03 │ 2024-03-03 │   2024-03-03 │
└────────────┴────────────┴──────────────┘
```
## yesterday {#yesterday}

接受零个参数并返回查询分析时的昨天日期。
与 'today() - 1' 相同。
## timeSlot {#timeslot}

将时间舍入到半小时长度间隔的开始。

**语法**

```sql
timeSlot(time[, time_zone])
```

**参数**

- `time` — 要舍入到半小时长度间隔开始的时间。[DateTime](../data-types/datetime.md)/[Date32](../data-types/date32.md)/[DateTime64](../data-types/datetime64.md)。
- `time_zone` — 代表时区的字符串类型常量值或表达式。[String](../data-types/string.md)。

:::note
尽管此函数可以接受扩展类型 `Date32` 和 `DateTime64` 的值作为参数，但传递超出正常范围的时间（对 `Date` 而言年1970到2149/ 对 `DateTime` 而言2106）将产生错误的结果。
:::

**返回类型**

- 返回舍入到半小时长度间隔起始的时间。 [DateTime](../data-types/datetime.md)。

**示例**

查询：

```sql
SELECT timeSlot(toDateTime('2000-01-02 03:04:05', 'UTC'));
```

结果：

```response
┌─timeSlot(toDateTime('2000-01-02 03:04:05', 'UTC'))─┐
│                                2000-01-02 03:00:00 │
└────────────────────────────────────────────────────┘
```
## toYYYYMM {#toyyyymm}

将日期或日期时间转换为包含年份和月份数字的 UInt32 数字（YYYY * 100 + MM）。接受第二个可选的时区参数。如果提供，时区必须是字符串常量。

此函数是函数 `YYYYMMDDToDate()` 的反向操作。

**示例**

``` sql
SELECT
    toYYYYMM(now(), 'US/Eastern')
```

结果：

``` text
┌─toYYYYMM(now(), 'US/Eastern')─┐
│                        202303 │
└───────────────────────────────┘
```
## toYYYYMMDD {#toyyyymmdd}

将日期或日期时间转换为包含年份、月份和日期数字的 UInt32 数字（YYYY * 10000 + MM * 100 + DD）。接受第二个可选的时区参数。如果提供，时区必须是字符串常量。

**示例**

```sql
SELECT toYYYYMMDD(now(), 'US/Eastern')
```

结果：

```response
┌─toYYYYMMDD(now(), 'US/Eastern')─┐
│                        20230302 │
└─────────────────────────────────┘
```
## toYYYYMMDDhhmmss {#toyyyymmddhhmmss}

将日期或日期时间转换为包含年份、月份、日期、小时、分钟和秒数字的 UInt64 数字（YYYY * 10000000000 + MM * 100000000 + DD * 1000000 + hh * 10000 + mm * 100 + ss）。接受第二个可选的时区参数。如果提供，时区必须是字符串常量。

**示例**

```sql
SELECT toYYYYMMDDhhmmss(now(), 'US/Eastern')
```

结果：

```response
┌─toYYYYMMDDhhmmss(now(), 'US/Eastern')─┐
│                        20230302112209 │
└───────────────────────────────────────┘
```
## YYYYMMDDToDate {#yyyymmddtodate}

将包含年份、月份和日期数字的数字转换为一个 [Date](../data-types/date.md)。

如果输入不编码有效的日期值，则输出未定义。

**语法**

```sql
YYYYMMDDToDate(yyyymmdd);
```

**参数**

- `yyyymmdd` - 表示年份、月份和日期的数字。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。

**返回值**

- 从参数中创建的日期。 [Date](../data-types/date.md)。

**示例**

```sql
SELECT YYYYMMDDToDate(20230911);
```

结果：

```response
┌─toYYYYMMDD(20230911)─┐
│           2023-09-11 │
└──────────────────────┘
```
## YYYYMMDDToDate32 {#yyyymmddtodate32}

与函数 `YYYYMMDDToDate()` 类似，但产生一个 [Date32](../data-types/date32.md)。
## YYYYMMDDhhmmssToDateTime {#yyyymmddhhmmsstodatetime}

将包含年份、月份、日期、小时、分钟和秒数字的数字转换为一个 [DateTime](../data-types/datetime.md)。

如果输入不编码有效的 DateTime 值，则输出未定义。

此函数是函数 `toYYYYMMDDhhmmss()` 的反向操作。

**语法**

```sql
YYYYMMDDhhmmssToDateTime(yyyymmddhhmmss[, timezone]);
```

**参数**

- `yyyymmddhhmmss` - 表示年份、月份和日期的数字。[Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `timezone` - [时区](../../operations/server-configuration-parameters/settings.md#timezone)（可选），用于返回值。

**返回值**

- 从参数创建的日期及时间。 [DateTime](../data-types/datetime.md)。

**示例**

```sql
SELECT YYYYMMDDToDateTime(20230911131415);
```

结果：

```response
┌──────YYYYMMDDhhmmssToDateTime(20230911131415)─┐
│                           2023-09-11 13:14:15 │
└───────────────────────────────────────────────┘
```
## YYYYMMDDhhmmssToDateTime64 {#yyyymmddhhmmsstodatetime64}

类似于函数 `YYYYMMDDhhmmssToDate()`，但产生一个 [DateTime64](../data-types/datetime64.md)。

接受 `timezone` 参数之后的额外可选 `precision` 参数。
## changeYear {#changeyear}

更改日期或日期时间的年份组件。

**语法**
``` sql

changeYear(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 新的年份值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 与 `date_or_datetime` 相同的类型。

**示例**

``` sql
SELECT changeYear(toDate('1999-01-01'), 2000), changeYear(toDateTime64('1999-01-01 00:00:00.000', 3), 2000);
```

结果：

```sql
┌─changeYear(toDate('1999-01-01'), 2000)─┬─changeYear(toDateTime64('1999-01-01 00:00:00.000', 3), 2000)─┐
│                             2000-01-01 │                                      2000-01-01 00:00:00.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## changeMonth {#changemonth}

更改日期或日期时间的月份组件。

**语法**

``` sql
changeMonth(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 新的月份值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 与 `date_or_datetime` 相同的类型。

**示例**

``` sql
SELECT changeMonth(toDate('1999-01-01'), 2), changeMonth(toDateTime64('1999-01-01 00:00:00.000', 3), 2);
```

结果：

```sql
┌─changeMonth(toDate('1999-01-01'), 2)─┬─changeMonth(toDateTime64('1999-01-01 00:00:00.000', 3), 2)─┐
│                           1999-02-01 │                                    1999-02-01 00:00:00.000 │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```
## changeDay {#changeday}

更改日期或日期时间的天数组件。

**语法**

``` sql
changeDay(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 新的天数值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 与 `date_or_datetime` 相同的类型。

**示例**

``` sql
SELECT changeDay(toDate('1999-01-01'), 5), changeDay(toDateTime64('1999-01-01 00:00:00.000', 3), 5);
```

结果：

```sql
┌─changeDay(toDate('1999-01-01'), 5)─┬─changeDay(toDateTime64('1999-01-01 00:00:00.000', 3), 5)─┐
│                         1999-01-05 │                                  1999-01-05 00:00:00.000 │
└────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

## changeHour {#changehour}

更改日期或日期时间的小时部分。

**语法**

``` sql
changeHour(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 小时的新值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 返回与 `date_or_datetime` 相同类型的值。如果输入是 [Date](../data-types/date.md)，则返回 [DateTime](../data-types/datetime.md)。如果输入是 [Date32](../data-types/date32.md)，则返回 [DateTime64](../data-types/datetime64.md)。

**示例**

``` sql
SELECT changeHour(toDate('1999-01-01'), 14), changeHour(toDateTime64('1999-01-01 00:00:00.000', 3), 14);
```

结果：

```sql
┌─changeHour(toDate('1999-01-01'), 14)─┬─changeHour(toDateTime64('1999-01-01 00:00:00.000', 3), 14)─┐
│                  1999-01-01 14:00:00 │                                    1999-01-01 14:00:00.000 │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```
## changeMinute {#changeminute}

更改日期或日期时间的分钟部分。

**语法**

``` sql
changeMinute(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 分钟的新值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 返回与 `date_or_datetime` 相同类型的值。如果输入是 [Date](../data-types/date.md)，则返回 [DateTime](../data-types/datetime.md)。如果输入是 [Date32](../data-types/date32.md)，则返回 [DateTime64](../data-types/datetime64.md)。

**示例**

``` sql
    SELECT changeMinute(toDate('1999-01-01'), 15), changeMinute(toDateTime64('1999-01-01 00:00:00.000', 3), 15);
```

结果：

```sql
┌─changeMinute(toDate('1999-01-01'), 15)─┬─changeMinute(toDateTime64('1999-01-01 00:00:00.000', 3), 15)─┐
│                    1999-01-01 00:15:00 │                                      1999-01-01 00:15:00.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## changeSecond {#changesecond}

更改日期或日期时间的秒部分。

**语法**

``` sql
changeSecond(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 秒的新值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 返回与 `date_or_datetime` 相同类型的值。如果输入是 [Date](../data-types/date.md)，则返回 [DateTime](../data-types/datetime.md)。如果输入是 [Date32](../data-types/date32.md)，则返回 [DateTime64](../data-types/datetime64.md)。

**示例**

``` sql
SELECT changeSecond(toDate('1999-01-01'), 15), changeSecond(toDateTime64('1999-01-01 00:00:00.000', 3), 15);
```

结果：

```sql
┌─changeSecond(toDate('1999-01-01'), 15)─┬─changeSecond(toDateTime64('1999-01-01 00:00:00.000', 3), 15)─┐
│                    1999-01-01 00:00:15 │                                      1999-01-01 00:00:15.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## addYears {#addyears}

向日期、日期时间或字符串编码的日期/日期时间添加指定数量的年。

**语法**

```sql
addYears(date, num)
```

**参数**

- `date`: 要添加指定年数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)， [String](../data-types/string.md)。
- `num`: 要添加的年数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 加上 `num` 年。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addYears(date, 1) AS add_years_with_date,
    addYears(date_time, 1) AS add_years_with_date_time,
    addYears(date_time_string, 1) AS add_years_with_date_time_string
```

```response
┌─add_years_with_date─┬─add_years_with_date_time─┬─add_years_with_date_time_string─┐
│          2025-01-01 │      2025-01-01 00:00:00 │         2025-01-01 00:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```
## addQuarters {#addquarters}

向日期、日期时间或字符串编码的日期/日期时间添加指定数量的季度。

**语法**

```sql
addQuarters(date, num)
```

**参数**

- `date`: 要添加指定季度数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)， [String](../data-types/string.md)。
- `num`: 要添加的季度数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 加上 `num` 季度。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addQuarters(date, 1) AS add_quarters_with_date,
    addQuarters(date_time, 1) AS add_quarters_with_date_time,
    addQuarters(date_time_string, 1) AS add_quarters_with_date_time_string
```

```response
┌─add_quarters_with_date─┬─add_quarters_with_date_time─┬─add_quarters_with_date_time_string─┐
│             2024-04-01 │         2024-04-01 00:00:00 │            2024-04-01 00:00:00.000 │
└────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```
## addMonths {#addmonths}

向日期、日期时间或字符串编码的日期/日期时间添加指定数量的月份。

**语法**

```sql
addMonths(date, num)
```

**参数**

- `date`: 要添加指定月份数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)， [String](../data-types/string.md)。
- `num`: 要添加的月份数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 加上 `num` 月。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMonths(date, 6) AS add_months_with_date,
    addMonths(date_time, 6) AS add_months_with_date_time,
    addMonths(date_time_string, 6) AS add_months_with_date_time_string
```

```response
┌─add_months_with_date─┬─add_months_with_date_time─┬─add_months_with_date_time_string─┐
│           2024-07-01 │       2024-07-01 00:00:00 │          2024-07-01 00:00:00.000 │
└──────────────────────┴───────────────────────────┴──────────────────────────────────┘
```
## addWeeks {#addweeks}

向日期、日期时间或字符串编码的日期/日期时间添加指定数量的周。

**语法**

```sql
addWeeks(date, num)
```

**参数**

- `date`: 要添加指定周数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)， [String](../data-types/string.md)。
- `num`: 要添加的周数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 加上 `num` 周。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addWeeks(date, 5) AS add_weeks_with_date,
    addWeeks(date_time, 5) AS add_weeks_with_date_time,
    addWeeks(date_time_string, 5) AS add_weeks_with_date_time_string
```

```response
┌─add_weeks_with_date─┬─add_weeks_with_date_time─┬─add_weeks_with_date_time_string─┐
│          2024-02-05 │      2024-02-05 00:00:00 │         2024-02-05 00:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```
## addDays {#adddays}

向日期、日期时间或字符串编码的日期/日期时间添加指定数量的天。

**语法**

```sql
addDays(date, num)
```

**参数**

- `date`: 要添加指定天数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)， [String](../data-types/string.md)。
- `num`: 要添加的天数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 加上 `num` 天。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addDays(date, 5) AS add_days_with_date,
    addDays(date_time, 5) AS add_days_with_date_time,
    addDays(date_time_string, 5) AS add_days_with_date_time_string
```

```response
┌─add_days_with_date─┬─add_days_with_date_time─┬─add_days_with_date_time_string─┐
│         2024-01-06 │     2024-01-06 00:00:00 │        2024-01-06 00:00:00.000 │
└────────────────────┴─────────────────────────┴────────────────────────────────┘
```
## addHours {#addhours}

向日期、日期时间或字符串编码的日期/日期时间添加指定数量的小时。

**语法**

```sql
addHours(date, num)
```

**参数**

- `date`: 要添加指定小时数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)， [String](../data-types/string.md)。
- `num`: 要添加的小时数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 加上 `num` 小时。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addHours(date, 12) AS add_hours_with_date,
    addHours(date_time, 12) AS add_hours_with_date_time,
    addHours(date_time_string, 12) AS add_hours_with_date_time_string
```

```response
┌─add_hours_with_date─┬─add_hours_with_date_time─┬─add_hours_with_date_time_string─┐
│ 2024-01-01 12:00:00 │      2024-01-01 12:00:00 │         2024-01-01 12:00:00.000 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────┘
```
## addMinutes {#addminutes}

向日期、日期时间或字符串编码的日期/日期时间添加指定数量的分钟。

**语法**

```sql
addMinutes(date, num)
```

**参数**

- `date`: 要添加指定分钟数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)， [String](../data-types/string.md)。
- `num`: 要添加的分钟数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 加上 `num` 分钟。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMinutes(date, 20) AS add_minutes_with_date,
    addMinutes(date_time, 20) AS add_minutes_with_date_time,
    addMinutes(date_time_string, 20) AS add_minutes_with_date_time_string
```

```response
┌─add_minutes_with_date─┬─add_minutes_with_date_time─┬─add_minutes_with_date_time_string─┐
│   2024-01-01 00:20:00 │        2024-01-01 00:20:00 │           2024-01-01 00:20:00.000 │
└───────────────────────┴────────────────────────────┴───────────────────────────────────┘
```
## addSeconds {#addseconds}

向日期、日期时间或字符串编码的日期/日期时间添加指定数量的秒。

**语法**

```sql
addSeconds(date, num)
```

**参数**

- `date`: 要添加指定秒数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)， [String](../data-types/string.md)。
- `num`: 要添加的秒数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 加上 `num` 秒。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addSeconds(date, 30) AS add_seconds_with_date,
    addSeconds(date_time, 30) AS add_seconds_with_date_time,
    addSeconds(date_time_string, 30) AS add_seconds_with_date_time_string
```

```response
┌─add_seconds_with_date─┬─add_seconds_with_date_time─┬─add_seconds_with_date_time_string─┐
│   2024-01-01 00:00:30 │        2024-01-01 00:00:30 │           2024-01-01 00:00:30.000 │
└───────────────────────┴────────────────────────────┴───────────────────────────────────┘
```
## addMilliseconds {#addmilliseconds}

向带时间的日期或字符串编码的日期添加指定数量的毫秒。

**语法**

```sql
addMilliseconds(date_time, num)
```

**参数**

- `date_time`: 带时间的日期，添加指定数量的毫秒。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)， [String](../data-types/string.md)。
- `num`: 要添加的毫秒数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date_time` 加上 `num` 毫秒。 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMilliseconds(date_time, 1000) AS add_milliseconds_with_date_time,
    addMilliseconds(date_time_string, 1000) AS add_milliseconds_with_date_time_string
```

```response
┌─add_milliseconds_with_date_time─┬─add_milliseconds_with_date_time_string─┐
│         2024-01-01 00:00:01.000 │                2024-01-01 00:00:01.000 │
└─────────────────────────────────┴────────────────────────────────────────┘
```
## addMicroseconds {#addmicroseconds}

向带时间的日期或字符串编码的日期添加指定数量的微秒。

**语法**

```sql
addMicroseconds(date_time, num)
```

**参数**

- `date_time`: 带时间的日期，添加指定数量的微秒。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)， [String](../data-types/string.md)。
- `num`: 要添加的微秒数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date_time` 加上 `num` 微秒。 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addMicroseconds(date_time, 1000000) AS add_microseconds_with_date_time,
    addMicroseconds(date_time_string, 1000000) AS add_microseconds_with_date_time_string
```

```response
┌─add_microseconds_with_date_time─┬─add_microseconds_with_date_time_string─┐
│      2024-01-01 00:00:01.000000 │             2024-01-01 00:00:01.000000 │
└─────────────────────────────────┴────────────────────────────────────────┘
```
## addNanoseconds {#addnanoseconds}

向带时间的日期或字符串编码的日期添加指定数量的纳秒。

**语法**

```sql
addNanoseconds(date_time, num)
```

**参数**

- `date_time`: 带时间的日期，添加指定数量的纳秒。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)， [String](../data-types/string.md)。
- `num`: 要添加的纳秒数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date_time` 加上 `num` 纳秒。 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    addNanoseconds(date_time, 1000) AS add_nanoseconds_with_date_time,
    addNanoseconds(date_time_string, 1000) AS add_nanoseconds_with_date_time_string
```

```response
┌─add_nanoseconds_with_date_time─┬─add_nanoseconds_with_date_time_string─┐
│  2024-01-01 00:00:00.000001000 │         2024-01-01 00:00:00.000001000 │
└────────────────────────────────┴───────────────────────────────────────┘
```
## addInterval {#addinterval}

将一个间隔添加到另一个间隔或间隔元组。

**语法**

```sql
addInterval(interval_1, interval_2)
```

**参数**

- `interval_1`: 第一个间隔或间隔元组。 [interval](../data-types/special-data-types/interval.md)、[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 要添加的第二个间隔。 [interval](../data-types/special-data-types/interval.md)。

**返回值**

- 返回一个间隔元组。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
相同类型的间隔将合并为单个间隔。例如，如果传入 `toIntervalDay(1)` 和 `toIntervalDay(2)`，则结果将是 `(3)` 而不是 `(1,1)`。
:::

**示例**

查询：

```sql
SELECT addInterval(INTERVAL 1 DAY, INTERVAL 1 MONTH);
SELECT addInterval((INTERVAL 1 DAY, INTERVAL 1 YEAR), INTERVAL 1 MONTH);
SELECT addInterval(INTERVAL 2 DAY, INTERVAL 1 DAY);
```

结果：

```response
┌─addInterval(toIntervalDay(1), toIntervalMonth(1))─┐
│ (1,1)                                             │
└───────────────────────────────────────────────────┘
┌─addInterval((toIntervalDay(1), toIntervalYear(1)), toIntervalMonth(1))─┐
│ (1,1,1)                                                                │
└────────────────────────────────────────────────────────────────────────┘
┌─addInterval(toIntervalDay(2), toIntervalDay(1))─┐
│ (3)                                             │
└─────────────────────────────────────────────────┘
```
## addTupleOfIntervals {#addtupleofintervals}

逐个将间隔元组添加到日期或日期时间。

**语法**

```sql
addTupleOfIntervals(interval_1, interval_2)
```

**参数**

- `date`: 第一个间隔或间隔元组。 [date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。
- `intervals`: 要添加到 `date` 的间隔元组。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

**返回值**

- 返回添加了 `intervals` 的 `date`。 [date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。

**示例**

查询：

```sql
WITH toDate('2018-01-01') AS date
SELECT addTupleOfIntervals(date, (INTERVAL 1 DAY, INTERVAL 1 MONTH, INTERVAL 1 YEAR))
```

结果：

```response
┌─addTupleOfIntervals(date, (toIntervalDay(1), toIntervalMonth(1), toIntervalYear(1)))─┐
│                                                                           2019-02-02 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```
## subtractYears {#subtractyears}

从日期、日期时间或字符串编码的日期/日期时间中减去指定数量的年。

**语法**

```sql
subtractYears(date, num)
```

**参数**

- `date`: 从中减去指定年数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、 [String](../data-types/string.md)。
- `num`: 要减去的年数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 减去 `num` 年。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractYears(date, 1) AS subtract_years_with_date,
    subtractYears(date_time, 1) AS subtract_years_with_date_time,
    subtractYears(date_time_string, 1) AS subtract_years_with_date_time_string
```

```response
┌─subtract_years_with_date─┬─subtract_years_with_date_time─┬─subtract_years_with_date_time_string─┐
│               2023-01-01 │           2023-01-01 00:00:00 │              2023-01-01 00:00:00.000 │
└──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## subtractQuarters {#subtractquarters}

从日期、日期时间或字符串编码的日期/日期时间中减去指定数量的季度。

**语法**

```sql
subtractQuarters(date, num)
```

**参数**

- `date`: 从中减去指定季度数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、 [String](../data-types/string.md)。
- `num`: 要减去的季度数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 减去 `num` 季度。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractQuarters(date, 1) AS subtract_quarters_with_date,
    subtractQuarters(date_time, 1) AS subtract_quarters_with_date_time,
    subtractQuarters(date_time_string, 1) AS subtract_quarters_with_date_time_string
```

```response
┌─subtract_quarters_with_date─┬─subtract_quarters_with_date_time─┬─subtract_quarters_with_date_time_string─┐
│                  2023-10-01 │              2023-10-01 00:00:00 │                 2023-10-01 00:00:00.000 │
└─────────────────────────────┴──────────────────────────────────┴─────────────────────────────────────────┘
```
## subtractMonths {#subtractmonths}

从日期、日期时间或字符串编码的日期/日期时间中减去指定数量的月份。

**语法**

```sql
subtractMonths(date, num)
```

**参数**

- `date`: 从中减去指定月份数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、 [String](../data-types/string.md)。
- `num`: 要减去的月份数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 减去 `num` 月。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMonths(date, 1) AS subtract_months_with_date,
    subtractMonths(date_time, 1) AS subtract_months_with_date_time,
    subtractMonths(date_time_string, 1) AS subtract_months_with_date_time_string
```

```response
┌─subtract_months_with_date─┬─subtract_months_with_date_time─┬─subtract_months_with_date_time_string─┐
│                2023-12-01 │            2023-12-01 00:00:00 │               2023-12-01 00:00:00.000 │
└───────────────────────────┴────────────────────────────────┴───────────────────────────────────────┘
```
## subtractWeeks {#subtractweeks}

从日期、日期时间或字符串编码的日期/日期时间中减去指定数量的周。

**语法**

```sql
subtractWeeks(date, num)
```

**参数**

- `date`: 从中减去指定周数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、 [String](../data-types/string.md)。
- `num`: 要减去的周数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 减去 `num` 周。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractWeeks(date, 1) AS subtract_weeks_with_date,
    subtractWeeks(date_time, 1) AS subtract_weeks_with_date_time,
    subtractWeeks(date_time_string, 1) AS subtract_weeks_with_date_time_string
```

```response
 ┌─subtract_weeks_with_date─┬─subtract_weeks_with_date_time─┬─subtract_weeks_with_date_time_string─┐
 │               2023-12-25 │           2023-12-25 00:00:00 │              2023-12-25 00:00:00.000 │
 └──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## subtractDays {#subtractdays}

从日期、日期时间或字符串编码的日期/日期时间中减去指定数量的天。

**语法**

```sql
subtractDays(date, num)
```

**参数**

- `date`: 从中减去指定天数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、 [String](../data-types/string.md)。
- `num`: 要减去的天数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 减去 `num` 天。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractDays(date, 31) AS subtract_days_with_date,
    subtractDays(date_time, 31) AS subtract_days_with_date_time,
    subtractDays(date_time_string, 31) AS subtract_days_with_date_time_string
```

```response
┌─subtract_days_with_date─┬─subtract_days_with_date_time─┬─subtract_days_with_date_time_string─┐
│              2023-12-01 │          2023-12-01 00:00:00 │             2023-12-01 00:00:00.000 │
└─────────────────────────┴──────────────────────────────┴─────────────────────────────────────┘
```
## subtractHours {#subtracthours}

从日期、日期时间或字符串编码的日期/日期时间中减去指定数量的小时。

**语法**

```sql
subtractHours(date, num)
```

**参数**

- `date`: 从中减去指定小时数的日期/日期时间。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[Datetime64](../data-types/datetime64.md), [String](../data-types/string.md)。
- `num`: 要减去的小时数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 减去 `num` 小时。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractHours(date, 12) AS subtract_hours_with_date,
    subtractHours(date_time, 12) AS subtract_hours_with_date_time,
    subtractHours(date_time_string, 12) AS subtract_hours_with_date_time_string
```

```response
┌─subtract_hours_with_date─┬─subtract_hours_with_date_time─┬─subtract_hours_with_date_time_string─┐
│      2023-12-31 12:00:00 │           2023-12-31 12:00:00 │              2023-12-31 12:00:00.000 │
└──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```

## subtractMinutes {#subtractminutes}

从日期、带时间的日期或字符串编码的日期/带时间的日期中减去指定的分钟数。

**语法**

```sql
subtractMinutes(date, num)
```

**参数**

- `date`: 要从中减去指定分钟数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md)。
- `num`: 要减去的分钟数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 减去 `num` 分钟的结果。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMinutes(date, 30) AS subtract_minutes_with_date,
    subtractMinutes(date_time, 30) AS subtract_minutes_with_date_time,
    subtractMinutes(date_time_string, 30) AS subtract_minutes_with_date_time_string
```

```response
┌─subtract_minutes_with_date─┬─subtract_minutes_with_date_time─┬─subtract_minutes_with_date_time_string─┐
│        2023-12-31 23:30:00 │             2023-12-31 23:30:00 │                2023-12-31 23:30:00.000 │
└────────────────────────────┴─────────────────────────────────┴────────────────────────────────────────┘
```
## subtractSeconds {#subtractseconds}

从日期、带时间的日期或字符串编码的日期/带时间的日期中减去指定的秒数。

**语法**

```sql
subtractSeconds(date, num)
```

**参数**

- `date`: 要从中减去指定秒数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md)。
- `num`: 要减去的秒数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 减去 `num` 秒的结果。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDate('2024-01-01') AS date,
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractSeconds(date, 60) AS subtract_seconds_with_date,
    subtractSeconds(date_time, 60) AS subtract_seconds_with_date_time,
    subtractSeconds(date_time_string, 60) AS subtract_seconds_with_date_time_string
```

```response
┌─subtract_seconds_with_date─┬─subtract_seconds_with_date_time─┬─subtract_seconds_with_date_time_string─┐
│        2023-12-31 23:59:00 │             2023-12-31 23:59:00 │                2023-12-31 23:59:00.000 │
└────────────────────────────┴─────────────────────────────────┴────────────────────────────────────────┘
```
## subtractMilliseconds {#subtractmilliseconds}

从带时间的日期或字符串编码的带时间的日期中减去指定的毫秒数。

**语法**

```sql
subtractMilliseconds(date_time, num)
```

**参数**

- `date_time`: 要从中减去指定毫秒数的带时间的日期。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md)。
- `num`: 要减去的毫秒数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date_time` 减去 `num` 毫秒的结果。 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMilliseconds(date_time, 1000) AS subtract_milliseconds_with_date_time,
    subtractMilliseconds(date_time_string, 1000) AS subtract_milliseconds_with_date_time_string
```

```response
┌─subtract_milliseconds_with_date_time─┬─subtract_milliseconds_with_date_time_string─┐
│              2023-12-31 23:59:59.000 │                     2023-12-31 23:59:59.000 │
└──────────────────────────────────────┴─────────────────────────────────────────────┘
```
## subtractMicroseconds {#subtractmicroseconds}

从带时间的日期或字符串编码的带时间的日期中减去指定的微秒数。

**语法**

```sql
subtractMicroseconds(date_time, num)
```

**参数**

- `date_time`: 要从中减去指定微秒数的带时间的日期。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md)。
- `num`: 要减去的微秒数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date_time` 减去 `num` 微秒的结果。 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMicroseconds(date_time, 1000000) AS subtract_microseconds_with_date_time,
    subtractMicroseconds(date_time_string, 1000000) AS subtract_microseconds_with_date_time_string
```

```response
┌─subtract_microseconds_with_date_time─┬─subtract_microseconds_with_date_time_string─┐
│           2023-12-31 23:59:59.000000 │                  2023-12-31 23:59:59.000000 │
└──────────────────────────────────────┴─────────────────────────────────────────────┘
```
## subtractNanoseconds {#subtractnanoseconds}

从带时间的日期或字符串编码的带时间的日期中减去指定的纳秒数。

**语法**

```sql
subtractNanoseconds(date_time, num)
```

**参数**

- `date_time`: 要从中减去指定纳秒数的带时间的日期。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md), [String](../data-types/string.md)。
- `num`: 要减去的纳秒数。 [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md)。

**返回值**

- 返回 `date_time` 减去 `num` 纳秒的结果。 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractNanoseconds(date_time, 1000) AS subtract_nanoseconds_with_date_time,
    subtractNanoseconds(date_time_string, 1000) AS subtract_nanoseconds_with_date_time_string
```

```response
┌─subtract_nanoseconds_with_date_time─┬─subtract_nanoseconds_with_date_time_string─┐
│       2023-12-31 23:59:59.999999000 │              2023-12-31 23:59:59.999999000 │
└─────────────────────────────────────┴────────────────────────────────────────────┘
```
## subtractInterval {#subtractinterval}

从一个间隔或间隔元组中减去一个负的间隔。

**语法**

```sql
subtractInterval(interval_1, interval_2)
```

**参数**

- `interval_1`: 第一个间隔或间隔元组。 [interval](../data-types/special-data-types/interval.md), [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 第二个要被取反的间隔。 [interval](../data-types/special-data-types/interval.md)。

**返回值**

- 返回一组间隔。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
相同类型的间隔将被合并为一个单一的间隔。例如，如果传入 `toIntervalDay(2)` 和 `toIntervalDay(1)`，则结果将是 `(1)` 而不是 `(2,1)`
:::

**示例**

查询：

```sql
SELECT subtractInterval(INTERVAL 1 DAY, INTERVAL 1 MONTH);
SELECT subtractInterval((INTERVAL 1 DAY, INTERVAL 1 YEAR), INTERVAL 1 MONTH);
SELECT subtractInterval(INTERVAL 2 DAY, INTERVAL 1 DAY);
```

结果：

```response
┌─subtractInterval(toIntervalDay(1), toIntervalMonth(1))─┐
│ (1,-1)                                                 │
└────────────────────────────────────────────────────────┘
┌─subtractInterval((toIntervalDay(1), toIntervalYear(1)), toIntervalMonth(1))─┐
│ (1,1,-1)                                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
┌─subtractInterval(toIntervalDay(2), toIntervalDay(1))─┐
│ (1)                                                  │
└──────────────────────────────────────────────────────┘
```
## subtractTupleOfIntervals {#subtracttupleofintervals}

连续地从一个日期或一个带时间的日期中减去一组间隔。

**语法**

```sql
subtractTupleOfIntervals(interval_1, interval_2)
```

**参数**

- `date`: 第一个间隔或间隔元组。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `intervals`: 要从 `date` 中减去的间隔元组。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

**返回值**

- 返回减去 `intervals` 后的 `date`。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**示例**

查询：

```sql
WITH toDate('2018-01-01') AS date SELECT subtractTupleOfIntervals(date, (INTERVAL 1 DAY, INTERVAL 1 YEAR))
```

结果：

```response
┌─subtractTupleOfIntervals(date, (toIntervalDay(1), toIntervalYear(1)))─┐
│                                                            2016-12-31 │
└───────────────────────────────────────────────────────────────────────┘
```
## timeSlots {#timeslots}

对于从 'StartTime' 开始并持续 'Duration' 秒的时间间隔，它返回由该间隔中的时刻组成的数组，这些时刻向下舍入到 'Size' 秒。 'Size' 是一个可选参数，默认设置为 1800（30分钟）。
例如，当搜索对应会话中的页面访问量时，这非常必要。
接受 DateTime 和 DateTime64 作为 'StartTime' 参数。对于 DateTime，'Duration' 和 'Size' 参数必须是 `UInt32`。对于 'DateTime64'，它们必须是 `Decimal64`。
返回一个 DateTime/DateTime64 数组（返回类型与 'StartTime' 的类型匹配）。对于 DateTime64，返回值的精度可以与 'StartTime' 的精度不同 --- 取所有给定参数中的最大精度。

**语法**

```sql
timeSlots(StartTime, Duration,\[, Size\])
```

**示例**

```sql
SELECT timeSlots(toDateTime('2012-01-01 12:20:00'), toUInt32(600));
SELECT timeSlots(toDateTime('1980-12-12 21:01:02', 'UTC'), toUInt32(600), 299);
SELECT timeSlots(toDateTime64('1980-12-12 21:01:02.1234', 4, 'UTC'), toDecimal64(600.1, 1), toDecimal64(299, 0));
```

结果：

``` text
┌─timeSlots(toDateTime('2012-01-01 12:20:00'), toUInt32(600))─┐
│ ['2012-01-01 12:00:00','2012-01-01 12:30:00']               │
└─────────────────────────────────────────────────────────────┘
┌─timeSlots(toDateTime('1980-12-12 21:01:02', 'UTC'), toUInt32(600), 299)─┐
│ ['1980-12-12 20:56:13','1980-12-12 21:01:12','1980-12-12 21:06:11']     │
└─────────────────────────────────────────────────────────────────────────┘
┌─timeSlots(toDateTime64('1980-12-12 21:01:02.1234', 4, 'UTC'), toDecimal64(600.1, 1), toDecimal64(299, 0))─┐
│ ['1980-12-12 20:56:13.0000','1980-12-12 21:01:12.0000','1980-12-12 21:06:11.0000']                        │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
## formatDateTime {#formatdatetime}

根据给定的格式字符串格式化时间。格式是常量表达式，因此你不能为单一结果列设置多个格式。

formatDateTime 使用 MySQL 日期时间格式风格，参考 [https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)。

此函数的相反操作是 [parseDateTime](/sql-reference/functions/type-conversion-functions#parsedatetime)。

别名: `DATE_FORMAT`。

**语法**

``` sql
formatDateTime(Time, Format[, Timezone])
```

**返回值**

根据所确定的格式返回时间和日期值。

**替换字段**

使用替换字段，你可以为结果字符串定义模式。“示例”列显示了 `2018-01-02 22:33:44` 的格式化结果。

| 占位符 | 描述                                                                                                                                                                                         | 示例   |
|------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| %a   | 简写的星期几名称（周一至周日）                                                                                                                                                                  | Mon    |
| %b   | 简写的月份名称（1月至12月）                                                                                                                                                                    | Jan    |
| %c   | 以整数表示的月份（01-12），见下文 '注 4'                                                                                                                                                    | 01     |
| %C   | 年份除以100，并截断为整数（00-99）                                                                                                                                                              | 20     |
| %d   | 零填充的月份日期（01-31）                                                                                                                                                                       | 02     |
| %D   | 短格式的MM/DD/YY日期，相当于 %m/%d/%y                                                                                                                                                        | 01/02/18|
| %e   | 空格填充的月份日期（1-31）                                                                                                                                                                       | &nbsp; 2 |
| %f   | 毫秒部分，见下文 '注 1' 和 '注 2'                                                                                                                                                               | 123456 |
| %F   | 短格式的YYYY-MM-DD日期，相当于 %Y-%m-%d                                                                                                                                                       | 2018-01-02 |
| %g   | 两位数的年份格式，与ISO 8601对齐，从四位数表示的年份中提取                                                                                                                       | 18     |
| %G   | 四位数的年份格式用于ISO周数，基于 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) 标准计算，通常只与 %V 一起使用                     | 2018   |
| %h   | 12小时格式的小时（01-12）                                                                                                                                                                      | 09     |
| %H   | 24小时格式的小时（00-23）                                                                                                                                                                      | 22     |
| %i   | 分钟（00-59）                                                                                                                                                                              | 33     |
| %I   | 12小时格式的小时（01-12）                                                                                                                                                                      | 10     |
| %j   | 一年中的日期（001-366）                                                                                                                                                                           | 002    |
| %k   | 24小时格式的小时（00-23），见下文 '注 4'                                                                                                                                                        | 14     |
| %l   | 12小时格式的小时（01-12），见下文 '注 4'                                                                                                                                                        | 09     |
| %m   | 以整数表示的月份（01-12）                                                                                                                                                                     | 01     |
| %M   | 完整的月份名称（1月-12月），见下文 '注 3'                                                                                                                                                        | January|
| %n   | 新行字符 ('\n')                                                                                                                                                                             |        |
| %p   | AM 或 PM 标识                                                                                                                                                                               | PM     |
| %Q   | 季度（1-4）                                                                                                                                                                                   | 1      |
| %r   | 12小时HH:MM AM/PM时间，相当于 %h:%i %p                                                                                                                                                       | 10:30 PM|
| %R   | 24小时HH:MM时间，相当于 %H:%i                                                                                                                                                                | 22:33  |
| %s   | 秒（00-59）                                                                                                                                                                                   | 44     |
| %S   | 秒（00-59）                                                                                                                                                                                   | 44     |
| %t   | 水平制表符字符 ('\t')                                                                                                                                                                    |        |
| %T   | ISO 8601时间格式 (HH:MM:SS)，相当于 %H:%i:%S                                                                                                                                                | 22:33:44|
| %u   | ISO 8601星期几作为数字，周一为1（1-7）                                                                                                                                                             | 2      |
| %V   | ISO 8601周数（01-53）                                                                                                                                                                          | 01     |
| %w   | 星期几作为整数（周日为0）（0-6）                                                                                                                                                                | 2      |
| %W   | 完整的星期几名称（周一-周日）                                                                                                                                                                 | Monday  |
| %y   | 年的最后两位数字（00-99）                                                                                                                                                                      | 18     |
| %Y   | 年                                                                                                                                                                                           | 2018   |
| %z   | 相对于UTC的时间偏移量，格式为 +HHMM 或 -HHMM                                                                                                                                                     | -0500  |
| %%   | 百分号                                                                                                                                                                                        | %      |

注 1: 在 ClickHouse 版本早于 v23.4 时，如果格式化值是日期、Date32 或 DateTime（不具备毫秒部分）或精度为0的 DateTime64，%f会打印单个零 (0)。可以通过设置 `formatdatetime_f_prints_single_zero = 1` 来恢复之前的行为。

注 2: 在 ClickHouse 版本早于 v25.1 时，%f 会打印 DateTime64 的精度指定的数字，而不是固定的6位数字。可以通过设置 `formatdatetime_f_prints_scale_number_of_digits= 1` 来恢复之前的行为。

注 3: 在 ClickHouse 版本早于 v23.4 时，%M 打印的是分钟（00-59），而不是完整的月份名称（1月-12月）。可以通过设置 `formatdatetime_parsedatetime_m_is_month_name = 0` 来恢复之前的行为。

注 4: 在 ClickHouse 版本早于 v23.11 时，函数 `parseDateTime()` 需要格式化器 `%c`（月份）和 `%l`/`%k`（小时）附加前导零，例如 `07`。在后续版本中，前导零可以省略，例如 `7`。可以通过设置 `parsedatetime_parse_without_leading_zeros = 0` 来恢复之前的行为。请注意，函数 `formatDateTime()` 默认仍然会为 `%c` 和 `%l`/`%k` 打印前导零，以避免破坏现有的用例。这个行为可以通过设置 `formatdatetime_format_without_leading_zeros = 1` 来更改。

**示例**

``` sql
SELECT formatDateTime(toDate('2010-01-04'), '%g')
```

结果：

```text
┌─formatDateTime(toDate('2010-01-04'), '%g')─┐
│ 10                                         │
└────────────────────────────────────────────┘
```

``` sql
SELECT formatDateTime(toDateTime64('2010-01-04 12:34:56.123456', 7), '%f')
```

结果：

```sql
┌─formatDateTime(toDateTime64('2010-01-04 12:34:56.123456', 7), '%f')─┐
│ 1234560                                                             │
└─────────────────────────────────────────────────────────────────────┘
```

此外，`formatDateTime` 函数可以接受一个第三个字符串参数，包含时区的名称。示例：`Asia/Istanbul`。在这种情况下，时间会根据指定的时区进行格式化。

**示例**

```sql
SELECT
    now() AS ts,
    time_zone,
    formatDateTime(ts, '%T', time_zone) AS str_tz_time
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10

┌──────────────────ts─┬─time_zone─────────┬─str_tz_time─┐
│ 2023-09-08 19:13:40 │ Europe/Amsterdam  │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Andorra    │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Astrakhan  │ 23:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Athens     │ 22:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Belfast    │ 20:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Belgrade   │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Berlin     │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Bratislava │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Brussels   │ 21:13:40    │
│ 2023-09-08 19:13:40 │ Europe/Bucharest  │ 22:13:40    │
└─────────────────────┴───────────────────┴─────────────┘
```

**另请参阅**

- [formatDateTimeInJodaSyntax](#formatdatetimeinjodasyntax)
## formatDateTimeInJodaSyntax {#formatdatetimeinjodasyntax}

类似于 formatDateTime，不同的是它以 Joda 风格而不是 MySQL 风格格式化日期时间。参考 [https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)。

此函数的相反操作是 [parseDateTimeInJodaSyntax](/sql-reference/functions/type-conversion-functions#parsedatetimeinjodasyntax)。

**替换字段**

使用替换字段，你可以为结果字符串定义模式。

| 占位符 | 描述                              | 表示方式       | 示例                              |
|------|-----------------------------------|----------------|-----------------------------------|
| G    | 时代                               | 文本           | AD                                |
| C    | 时代的世纪（>=0）                  | 数字           | 20                                |
| Y    | 时代的年份（>=0）                  | 年             | 1996                              |
| x    | 周年份（尚不支持）                  | 年             | 1996                              |
| w    | 周年份中的周数（尚不支持）          | 数字           | 27                                |
| e    | 星期几                             | 数字           | 2                                 |
| E    | 星期几                             | 文本           | Tuesday; Tue                      |
| y    | 年                               | 年             | 1996                              |
| D    | 一年的第几天                     | 数字           | 189                               |
| M    | 一年的月份                       | 月份           | July; Jul; 07                     |
| d    | 一个月中的日期                     | 数字           | 10                                |
| a    | 一天中的半天                      | 文本           | PM                                |
| K    | 半天的小时（0~11）                | 数字           | 0                                 |
| h    | 半天的钟点（1~12）                 | 数字           | 12                                |
| H    | 一天中的小时（0~23）              | 数字           | 0                                 |
| k    | 一天中的钟点（1~24）              | 数字           | 24                                |
| m    | 一小时中的分钟                     | 数字           | 30                                |
| s    | 一分钟中的秒数                     | 数字           | 55                                |
| S    | 秒的分数                          | 数字           | 978                               |
| z    | 时区                              | 文本           | Eastern Standard Time; EST         |
| Z    | 时区偏移                          | 区域           | -0800; -0812                       |
| '    | 文本转义                          | 分隔符         |                                   |
| ''   | 单引号                            | 字面值        | '                                 |

**示例**

``` sql
SELECT formatDateTimeInJodaSyntax(toDateTime('2010-01-04 12:34:56'), 'yyyy-MM-dd HH:mm:ss')
```

结果：

```java
┌─formatDateTimeInJodaSyntax(toDateTime('2010-01-04 12:34:56'), 'yyyy-MM-dd HH:mm:ss')─┐
│ 2010-01-04 12:34:56                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```
## dateName {#datename}

返回日期的指定部分。

**语法**

``` sql
dateName(date_part, date)
```

**参数**

- `date_part` — 日期部分。可选值：'year'、'quarter'、'month'、'week'、'dayofyear'、'day'、'weekday'、'hour'、'minute'、'second'。 [String](../data-types/string.md)。
- `date` — 日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。
- `timezone` — 时区。可选。 [String](../data-types/string.md)。

**返回值**

- 返回日期的指定部分。 [String](/sql-reference/data-types/string)

**示例**

```sql
WITH toDateTime('2021-04-14 11:22:33') AS date_value
SELECT
    dateName('year', date_value),
    dateName('month', date_value),
    dateName('day', date_value);
```

结果：

```text
┌─dateName('year', date_value)─┬─dateName('month', date_value)─┬─dateName('day', date_value)─┐
│ 2021                         │ April                         │ 14                          │
└──────────────────────────────┴───────────────────────────────┴─────────────────────────────┘
```
## monthName {#monthname}

返回月份的名称。

**语法**

``` sql
monthName(date)
```

**参数**

- `date` — 日期或带时间的日期。 [Date](../data-types/date.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 返回月份的名称。 [String](/sql-reference/data-types/string)

**示例**

```sql
WITH toDateTime('2021-04-14 11:22:33') AS date_value
SELECT monthName(date_value);
```

结果：

```text
┌─monthName(date_value)─┐
│ April                 │
└───────────────────────┘
```

## fromUnixTimestamp {#fromunixtimestamp}

这个函数将 Unix 时间戳转换为日历日期和一天中的时间。

它可以通过两种方式调用：

当给定一个类型为 [Integer](../data-types/int-uint.md) 的单一参数时，它返回一个类型为 [DateTime](../data-types/datetime.md) 的值，行为类似于 [toDateTime](../../sql-reference/functions/type-conversion-functions.md#todatetime)。

别名： `FROM_UNIXTIME`。

**示例：**

```sql
SELECT fromUnixTimestamp(423543535);
```

结果：

```text
┌─fromUnixTimestamp(423543535)─┐
│          1983-06-04 10:58:55 │
└──────────────────────────────┘
```

当给定两个或三个参数时，第一个参数是类型为 [Integer](../data-types/int-uint.md)、[Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md) 的值，第二个参数是常量格式字符串，第三个参数是可选的常量时区字符串，函数返回一个类型为 [String](/sql-reference/data-types/string) 的值，即它的行为类似于 [formatDateTime](#formatdatetime)。在这种情况下，使用的是 [MySQL 的datetime格式样式](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)。

**示例：**

```sql
SELECT fromUnixTimestamp(1234334543, '%Y-%m-%d %R:%S') AS DateTime;
```

结果：

```text
┌─DateTime────────────┐
│ 2009-02-11 14:42:23 │
└─────────────────────┘
```

**另请参见**

- [fromUnixTimestampInJodaSyntax](#fromunixtimestampinjodasyntax)
## fromUnixTimestampInJodaSyntax {#fromunixtimestampinjodasyntax}

与 [fromUnixTimestamp](#fromunixtimestamp) 相同，但在调用第二种方式（两个或三个参数）时，格式化使用的是 [Joda 风格](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)，而不是 MySQL 风格。

**示例：**

``` sql
SELECT fromUnixTimestampInJodaSyntax(1234334543, 'yyyy-MM-dd HH:mm:ss', 'UTC') AS DateTime;
```

结果：

```text
┌─DateTime────────────┐
│ 2009-02-11 06:42:23 │
└─────────────────────┘
```
## toModifiedJulianDay {#tomodifiedjulianday}

将文本形式的 [Proleptic Gregorian calendar](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar) 日期 `YYYY-MM-DD` 转换为 [Modified Julian Day](https://en.wikipedia.org/wiki/Julian_day#Variants) 数字，类型为 Int32。此函数支持日期范围从 `0000-01-01` 到 `9999-12-31`。如果参数无法解析为日期，或者日期无效，则会引发异常。

**语法**

``` sql
toModifiedJulianDay(date)
```

**参数**

- `date` — 文本形式的日期。类型为 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md) 的值。

**返回值**

- Modified Julian Day 数字。类型为 [Int32](../data-types/int-uint.md)。

**示例**

``` sql
SELECT toModifiedJulianDay('2020-01-01');
```

结果：

``` text
┌─toModifiedJulianDay('2020-01-01')─┐
│                             58849 │
└───────────────────────────────────┘
```
## toModifiedJulianDayOrNull {#tomodifiedjuliandayornull}

类似于 [toModifiedJulianDay()](#tomodifiedjulianday)，但不会引发异常，而是返回 `NULL`。

**语法**

``` sql
toModifiedJulianDayOrNull(date)
```

**参数**

- `date` — 文本形式的日期。类型为 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md) 的值。

**返回值**

- Modified Julian Day 数字。类型为 [Nullable(Int32)](../data-types/int-uint.md)。

**示例**

``` sql
SELECT toModifiedJulianDayOrNull('2020-01-01');
```

结果：

``` text
┌─toModifiedJulianDayOrNull('2020-01-01')─┐
│                                   58849 │
└─────────────────────────────────────────┘
```
## fromModifiedJulianDay {#frommodifiedjulianday}

将 [Modified Julian Day](https://en.wikipedia.org/wiki/Julian_day#Variants) 数字转换为文本形式的 [Proleptic Gregorian calendar](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar) 日期 `YYYY-MM-DD`。此函数支持的天数范围从 `-678941` 到 `2973483`（分别表示 0000-01-01 和 9999-12-31）。如果天数超出支持范围，则会引发异常。

**语法**

``` sql
fromModifiedJulianDay(day)
```

**参数**

- `day` — Modified Julian Day 数字。类型为 [Any integral types](../data-types/int-uint.md)。

**返回值**

- 文本形式的日期。类型为 [String](../data-types/string.md)。

**示例**

``` sql
SELECT fromModifiedJulianDay(58849);
```

结果：

``` text
┌─fromModifiedJulianDay(58849)─┐
│ 2020-01-01                   │
└──────────────────────────────┘
```
## fromModifiedJulianDayOrNull {#frommodifiedjuliandayornull}

类似于 [fromModifiedJulianDayOrNull()](#frommodifiedjuliandayornull)，但不会引发异常，而是返回 `NULL`。

**语法**

``` sql
fromModifiedJulianDayOrNull(day)
```

**参数**

- `day` — Modified Julian Day 数字。类型为 [Any integral types](../data-types/int-uint.md)。

**返回值**

- 文本形式的日期。类型为 [Nullable(String)](../data-types/string.md)。

**示例**

``` sql
SELECT fromModifiedJulianDayOrNull(58849);
```

结果：

``` text
┌─fromModifiedJulianDayOrNull(58849)─┐
│ 2020-01-01                         │
└────────────────────────────────────┘
```
## toUTCTimestamp {#toutctimestamp}

将 DateTime/DateTime64 类型值从其他时区转换为 UTC 时区时间戳。此函数主要是为了与 Apache Spark 和类似框架的兼容性而包含。

**语法**

``` sql
toUTCTimestamp(time_val, time_zone)
```

**参数**

- `time_val` — 常量的 DateTime/DateTime64 类型值或表达式。 [DateTime/DateTime64 types](../data-types/datetime.md)
- `time_zone` — 字符串类型的常量值或表示时区的表达式。 [String types](../data-types/string.md)

**返回值**

- 文本形式的 DateTime/DateTime64。

**示例**

``` sql
SELECT toUTCTimestamp(toDateTime('2023-03-16'), 'Asia/Shanghai');
```

结果：

``` text
┌─toUTCTimestamp(toDateTime('2023-03-16'), 'Asia/Shanghai')┐
│                                     2023-03-15 16:00:00 │
└─────────────────────────────────────────────────────────┘
```
## fromUTCTimestamp {#fromutctimestamp}

将 DateTime/DateTime64 类型值从 UTC 时区转换为其他时区时间戳。此函数主要是为了与 Apache Spark 和类似框架的兼容性而包含。

**语法**

``` sql
fromUTCTimestamp(time_val, time_zone)
```

**参数**

- `time_val` — 常量的 DateTime/DateTime64 类型值或表达式。 [DateTime/DateTime64 types](../data-types/datetime.md)
- `time_zone` — 字符串类型的常量值或表示时区的表达式。 [String types](../data-types/string.md)

**返回值**

- 文本形式的 DateTime/DateTime64。

**示例**

``` sql
SELECT fromUTCTimestamp(toDateTime64('2023-03-16 10:00:00', 3), 'Asia/Shanghai');
```

结果：

``` text
┌─fromUTCTimestamp(toDateTime64('2023-03-16 10:00:00',3), 'Asia/Shanghai')─┐
│                                                 2023-03-16 18:00:00.000 │
└─────────────────────────────────────────────────────────────────────────┘
```
## UTCTimestamp {#utctimestamp}

返回查询分析时刻的当前日期和时间。该函数是一个常量表达式。

:::note
此函数的结果与 `now('UTC')` 给出的结果相同。它的添加只是为了支持 MySQL，而 [`now`](#now) 是推荐的用法。
:::

**语法**

```sql
UTCTimestamp()
```

别名： `UTC_timestamp`。

**返回值**

- 返回查询分析时刻的当前日期和时间。 [DateTime](../data-types/datetime.md)。

**示例**

查询：

```sql
SELECT UTCTimestamp();
```

结果：

```response
┌──────UTCTimestamp()─┐
│ 2024-05-28 08:32:09 │
└─────────────────────┘
```
## timeDiff {#timediff}

返回两个日期或带有时间值的日期之间的差异。差异以秒为单位计算。它与 `dateDiff` 相同，并且仅为 MySQL 的支持而添加。推荐使用 `dateDiff`。

**语法**

```sql
timeDiff(first_datetime, second_datetime)
```

**参数**

- `first_datetime` — 常量的 DateTime/DateTime64 类型值或表达式。 [DateTime/DateTime64 types](../data-types/datetime.md)
- `second_datetime` — 常量的 DateTime/DateTime64 类型值或表达式。 [DateTime/DateTime64 types](../data-types/datetime.md)

**返回值**

两个日期或带有时间值的日期之间的差异，以秒为单位。

**示例**

查询：

```sql
timeDiff(toDateTime64('1927-01-01 00:00:00', 3), toDate32('1927-01-02'));
```

**结果**：

```response
┌─timeDiff(toDateTime64('1927-01-01 00:00:00', 3), toDate32('1927-01-02'))─┐
│                                                                    86400 │
└──────────────────────────────────────────────────────────────────────────┘
```
## Related content {#related-content}

- 博客: [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
