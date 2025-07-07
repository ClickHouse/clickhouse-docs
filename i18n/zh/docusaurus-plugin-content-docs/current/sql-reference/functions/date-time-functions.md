---
'description': '处理日期和时间的函数的文档'
'sidebar_label': '日期和时间'
'sidebar_position': 45
'slug': '/sql-reference/functions/date-time-functions'
'title': '处理日期和时间的函数'
---



# 处理日期和时间的函数

本节中的大多数函数接受一个可选的时区参数，例如 `Europe/Amsterdam`。在这种情况下，时区是指定的，而不是本地（默认）时区。

**示例**

```sql
SELECT
    toDateTime('2016-06-15 23:00:00') AS time,
    toDate(time) AS date_local,
    toDate(time, 'Asia/Yekaterinburg') AS date_yekat,
    toString(time, 'US/Samoa') AS time_samoa
```

```text
┌────────────────time─┬─date_local─┬─date_yekat─┬─time_samoa──────────┐
│ 2016-06-15 23:00:00 │ 2016-06-15 │ 2016-06-16 │ 2016-06-15 09:00:00 │
└─────────────────────┴────────────┴────────────┴─────────────────────┘
```
## makeDate {#makedate}

从年份、月份和日期参数创建一个 [Date](../data-types/date.md)
- 从年份、月份和日期参数，或
- 从年份和年份中的日期参数。

**语法**

```sql
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
- `day_of_year` — 年中的日期。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。

**返回值**

- 从参数创建的日期。 [Date](../data-types/date.md)。

**示例**

从年份、月份和日期创建一个日期：

```sql
SELECT makeDate(2023, 2, 28) AS Date;
```

结果：

```text
┌───────date─┐
│ 2023-02-28 │
└────────────┘
```

从年份和年份中的日期参数创建一个日期：

```sql
SELECT makeDate(2023, 42) AS Date;
```

结果：

```text
┌───────date─┐
│ 2023-02-11 │
└────────────┘
```
## makeDate32 {#makedate32}

从年份、月份、日（或可选的年份和一天）创建一个 [Date32](../../sql-reference/data-types/date32.md) 类型的值。

**语法**

```sql
makeDate32(year, [month,] day)
```

**参数**

- `year` — 年。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（可选）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。

:::note
如果省略 `month`，则 `day` 应取值在 `1` 到 `365` 之间，否则它应取值在 `1` 到 `31` 之间。
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

从年份和年份中的日期创建一个日期：

查询：

```sql
SELECT makeDate32(2024, 100);
```

结果：

```response
2024-04-09
```
## makeDateTime {#makedatetime}

从年份、月份、日、小时、分钟和秒参数创建一个 [DateTime](../data-types/datetime.md)。

**语法**

```sql
makeDateTime(year, month, day, hour, minute, second[, timezone])
```

**参数**

- `year` — 年。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `month` — 月。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `day` — 日。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `hour` — 时。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `minute` — 分。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `second` — 秒。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `timezone` — [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) 用于返回值（可选）。

**返回值**

- 从参数创建的日期和时间。 [DateTime](../data-types/datetime.md)。

**示例**

```sql
SELECT makeDateTime(2023, 2, 28, 17, 12, 33) AS DateTime;
```

结果：

```text
┌────────────DateTime─┐
│ 2023-02-28 17:12:33 │
└─────────────────────┘
```
## makeDateTime64 {#makedatetime64}

从其组件（年、月、日、小时、分钟、秒）创建一个 [DateTime64](../../sql-reference/data-types/datetime64.md) 数据类型值。具有可选的亚秒精度。

**语法**

```sql
makeDateTime64(year, month, day, hour, minute, second[, precision])
```

**参数**

- `year` — 年（0-9999）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `month` — 月（1-12）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `day` — 日（1-31）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `hour` — 时（0-23）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `minute` — 分（0-59）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `second` — 秒（0-59）。 [Integer](../../sql-reference/data-types/int-uint.md)、[Float](../../sql-reference/data-types/float.md) 或 [Decimal](../../sql-reference/data-types/decimal.md)。
- `precision` — 亚秒组成部分的可选精度（0-9）。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 从提供的参数创建的日期和时间。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

**示例**

```sql
SELECT makeDateTime64(2023, 5, 15, 10, 30, 45, 779, 5);
```

```response
┌─makeDateTime64(2023, 5, 15, 10, 30, 45, 779, 5)─┐
│                       2023-05-15 10:30:45.00779 │
└─────────────────────────────────────────────────┘
```
## timestamp {#timestamp}

将第一个参数 'expr' 转换为 [DateTime64(6)](../data-types/datetime64.md) 类型。
如果提供了第二个参数 'expr_time'，则将指定的时间添加到转换值。

**语法**

```sql
timestamp(expr[, expr_time])
```

别名： `TIMESTAMP`

**参数**

- `expr` - 日期或日期时间。 [String](../data-types/string.md)。
- `expr_time` - 可选参数。 要添加的时间。 [String](../data-types/string.md)。

**示例**

```sql
SELECT timestamp('2023-12-31') as ts;
```

结果：

```text
┌─────────────────────────ts─┐
│ 2023-12-31 00:00:00.000000 │
└────────────────────────────┘
```

```sql
SELECT timestamp('2023-12-31 12:00:00', '12:00:00.11') as ts;
```

结果：

```text
┌─────────────────────────ts─┐
│ 2024-01-01 00:00:00.110000 │
└────────────────────────────┘
```

**返回值**

- [DateTime64](../data-types/datetime64.md)(6)
## timeZone {#timezone}

返回当前会话的时区，即设定值 [session_timezone](../../operations/settings/settings.md#session_timezone) 的值。
如果在分布式表的上下文中执行此函数，则生成一个正常列，其值与每个分片相关，否则返回一个常量值。

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

返回服务器的时区，即设定值 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) 的值。
如果在分布式表的上下文中执行此函数，则生成一个正常列，其值与每个分片相关。否则，返回一个常量值。

**语法**

```sql
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

将日期或日期时间转换为指定的时区。并不改变数据的内部值（unix秒数），只改变值的时区属性和字符串表示。

**语法**

```sql
toTimezone(value, timezone)
```

别名： `toTimezone`。

**参数**

- `value` — 时间或日期和时间。 [DateTime64](../data-types/datetime64.md)。
- `timezone` — 返回值的时区。 [String](../data-types/string.md)。 这个参数是常量，因为 `toTimezone` 改变列的时区（timezone是 `DateTime*` 类型的属性）。

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

```sql
timeZoneOf(value)
```

别名： `timezoneOf`。

**参数**

- `value` — 日期和时间。 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 时区名称。 [String](../data-types/string.md)。

**示例**

```sql
SELECT timezoneOf(now());
```

结果：
```text
┌─timezoneOf(now())─┐
│ Etc/UTC           │
└───────────────────┘
```
## timeZoneOffset {#timezoneoffset}

返回与 [UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) 的时区偏移（以秒为单位）。
该函数考虑了 [夏令时](https://en.wikipedia.org/wiki/Daylight_saving_time) 和指定日期时间的历史时区变化。
使用 [IANA 时区数据库](https://www.iana.org/time-zones) 计算偏移。

**语法**

```sql
timeZoneOffset(value)
```

别名： `timezoneOffset`。

**参数**

- `value` — 日期和时间。 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 与 UTC 的偏移（以秒为单位）。 [Int32](../data-types/int-uint.md)。

**示例**

```sql
SELECT toDateTime('2021-04-21 10:20:30', 'America/New_York') AS Time, toTypeName(Time) AS Type,
       timeZoneOffset(Time) AS Offset_in_seconds, (Offset_in_seconds / 3600) AS Offset_in_hours;
```

结果：

```text
┌────────────────Time─┬─Type─────────────────────────┬─Offset_in_seconds─┬─Offset_in_hours─┐
│ 2021-04-21 10:20:30 │ DateTime('America/New_York') │            -14400 │              -4 │
└─────────────────────┴──────────────────────────────┴───────────────────┴─────────────────┘
```
## toYear {#toyear}

返回日期或日期时间的年份成分（公元）。

**语法**

```sql
toYear(value)
```

别名： `YEAR`

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的年份。 [UInt16](../data-types/int-uint.md)。

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

返回日期或日期时间的季度（1-4）。

**语法**

```sql
toQuarter(value)
```

别名： `QUARTER`

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的季度（1、2、3 或 4）。 [UInt8](../data-types/int-uint.md)。

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

返回日期或日期时间的月份成分（1-12）。

**语法**

```sql
toMonth(value)
```

别名： `MONTH`

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的月份（1 - 12）。 [UInt8](../data-types/int-uint.md)。

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

返回日期或日期时间在年内的天数（1-366）。

**语法**

```sql
toDayOfYear(value)
```

别名： `DAYOFYEAR`

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的天数（1 - 366）。 [UInt16](../data-types/int-uint.md)。

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

返回日期或日期时间在月份中的天数（1-31）。

**语法**

```sql
toDayOfMonth(value)
```

别名： `DAYOFMONTH`、`DAY`

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的天数（1 - 31）。 [UInt8](../data-types/int-uint.md)。

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

返回日期或日期时间在周内的天数。

`toDayOfWeek()` 的两个参数形式允许您指定一周的开始日是星期一还是星期天，以及返回值是否应在 0 到 6 或 1 到 7 的范围内。如果省略模式参数，默认模式为 0。日期的时区可以作为第三个参数指定。

| 模式 | 一周的第一天 | 范围                                          |
|------|---------------|------------------------------------------------|
| 0    | 星期一       | 1-7: 星期一 = 1，星期二 = 2，...，星期天 = 7  |
| 1    | 星期一       | 0-6: 星期一 = 0，星期二 = 1，...，星期天 = 6  |
| 2    | 星期天       | 0-6: 星期天 = 0，星期一 = 1，...，星期六 = 6 |
| 3    | 星期天       | 1-7: 星期天 = 1，星期一 = 2，...，星期六 = 7 |

**语法**

```sql
toDayOfWeek(t[, mode[, timezone]])
```

别名： `DAYOFWEEK`。

**参数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `mode` - 确定一周的第一天。可能的值为 0、1、2 或 3。请参见上表获取差异。
- `timezone` - 可选参数，它的行为与其他任何转换函数相同

第一个参数也可以指定为 [String](../data-types/string.md)，以 [parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort) 支持的格式。这种对字符串参数的支持仅出于与 MySQL 兼容的原因，某些第三方工具期待这样。由于字符串参数的支持可能在将来取决于新的 MySQL 兼容设置，并且字符串解析通常较慢，因此建议不要使用它。

**返回值**

- 所给日期/时间的星期几（1-7），取决于所选模式

**示例**

以下日期为 2023 年 4 月 21 日，为星期五：

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

返回带时间的日期的小时成分（0-24）。

假设如果时钟向前移动，则为一小时，并发生在凌晨 2 点；如果时钟向后移动，则为一小时，并发生在凌晨 3 点（这并不总是确切发生 - 取决于时区）。

**语法**

```sql
toHour(value)
```

别名： `HOUR`

**参数**

- `value` - [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的小时（0 - 23）。 [UInt8](../data-types/int-uint.md)。

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

返回带时间的日期的分钟成分（0-59）。

**语法**

```sql
toMinute(value)
```

别名： `MINUTE`

**参数**

- `value` - [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的分钟（0 - 59）。 [UInt8](../data-types/int-uint.md)。

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

返回带时间的日期的秒成分（0-59）。不考虑闰秒。

**语法**

```sql
toSecond(value)
```

别名： `SECOND`

**参数**

- `value` - [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的秒（0 - 59）。 [UInt8](../data-types/int-uint.md)。

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

返回带时间的日期的毫秒成分（0-999）。

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

- 所给日期/时间的毫秒（0 - 59）。 [UInt16](../data-types/int-uint.md)。
## toUnixTimestamp {#tounixtimestamp}

将字符串、日期或带时间的日期转换为 `UInt32` 表示的 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time)。

如果该函数以字符串形式调用，则接受一个可选的时区参数。

**语法**

```sql
toUnixTimestamp(date)
toUnixTimestamp(str, [timezone])
```

**返回值**

- 返回 unix 时间戳。 [UInt32](../data-types/int-uint.md)。

**示例**

```sql
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

```text
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
`toStartOf*`、`toLastDayOf*`、`toMonday`、`timeSlot` 函数的返回类型由配置参数 [enable_extended_results_for_datetime_functions](/operations/settings/settings#enable_extended_results_for_datetime_functions) 决定，默认值为 `0`。

行为如下：
* `enable_extended_results_for_datetime_functions = 0`：
  * 函数 `toStartOfYear`、`toStartOfISOYear`、`toStartOfQuarter`、`toStartOfMonth`、`toStartOfWeek`、`toLastDayOfWeek`、`toLastDayOfMonth`、`toMonday` 返回 `Date` 或 `DateTime`。
  * 函数 `toStartOfDay`、`toStartOfHour`、`toStartOfFifteenMinutes`、`toStartOfTenMinutes`、`toStartOfFiveMinutes`、`toStartOfMinute`、`timeSlot` 返回 `DateTime`。尽管这些函数可以接受扩展类型 `Date32` 和 `DateTime64` 的值作为参数，但传递超出正常范围的时间（对于 `Date` 从1970年到2149年/对于 `DateTime` 为2106年）将产生错误结果。
* `enable_extended_results_for_datetime_functions = 1`：
  * 函数 `toStartOfYear`、`toStartOfISOYear`、`toStartOfQuarter`、`toStartOfMonth`、`toStartOfWeek`、`toLastDayOfWeek`、`toLastDayOfMonth`、`toMonday` 返回 `Date` 或 `DateTime`（如果它们的参数是 `Date` 或 `DateTime`），并且如果参数是 `Date32` 或 `DateTime64`，则返回 `Date32` 或 `DateTime64`。
  * 函数 `toStartOfDay`、`toStartOfHour`、`toStartOfFifteenMinutes`、`toStartOfTenMinutes`、`toStartOfFiveMinutes`、`toStartOfMinute`、`timeSlot` 返回 `DateTime` （如果它们的参数是 `Date` 或 `DateTime`），并且如果参数是 `Date32` 或 `DateTime64`，则返回 `DateTime64`。
:::
## toStartOfYear {#tostartofyear}

将日期或日期时间向下取整到该年的第一天。返回值为 `Date` 对象。

**语法**

```sql
toStartOfYear(value)
```

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 输入日期/时间的第一天。 [Date](../data-types/date.md)。

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

将日期或日期时间向下取整到 ISO 年的第一天，这可能与“常规”年份不同。（请参阅 [https://en.wikipedia.org/wiki/ISO_week_date](https://en.wikipedia.org/wiki/ISO_week_date)）。

**语法**

```sql
toStartOfISOYear(value)
```

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 输入日期/时间的第一天。 [Date](../data-types/date.md)。

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

将日期或日期时间向下取整到该季度的第一天。季度的第一天为 1 月 1 日、4 月 1 日、7 月 1 日或 10 月 1 日。
返回日期。

**语法**

```sql
toStartOfQuarter(value)
```

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的季度的第一天。 [Date](../data-types/date.md)。

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

将日期或日期时间向下取整到该月的第一天。返回日期。

**语法**

```sql
toStartOfMonth(value)
```

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的月份的第一天。 [Date](../data-types/date.md)。

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
解析不正确日期的行为是实现特定的。 ClickHouse 可能返回零日期，抛出异常，或执行“自然”溢出。
:::
## toLastDayOfMonth {#tolastdayofmonth}

将日期或日期时间向上取整到该月的最后一天。返回日期。

**语法**

```sql
toLastDayOfMonth(value)
```

别名： `LAST_DAY`

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的月份的最后一天。 [Date](../data-types/date.md)。

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

将日期或日期时间向下取整到最靠近的星期一。返回日期。

**语法**

```sql
toMonday(value)
```

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期最靠近的星期一或之前的日期。 [Date](../data-types/date.md)。

**示例**

```sql
SELECT
    toMonday(toDateTime('2023-04-21 10:20:30')), /* a Friday */
    toMonday(toDate('2023-04-24')), /* already a Monday */
```

结果：

```response
┌─toMonday(toDateTime('2023-04-21 10:20:30'))─┬─toMonday(toDate('2023-04-24'))─┐
│                                  2023-04-17 │                     2023-04-24 │
└─────────────────────────────────────────────┴────────────────────────────────┘
```
## toStartOfWeek {#tostartofweek}

将日期或日期时间向下取整到最靠近的星期天或星期一。返回日期。模式参数的工作方式与函数 `toWeek()` 中的模式参数完全相同。如果没有指定模式，则默认值为 0。

**语法**

```sql
toStartOfWeek(t[, mode[, timezone]])
```

**参数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `mode` - 确定一周的第一天，如 [toWeek()](#toweek) 函数所述
- `timezone` - 可选参数，它的行为与其他任何转换函数相同

**返回值**

- 最靠近给定日期的星期天或星期一的日期，具体取决于模式。 [Date](../data-types/date.md)。

**示例**

```sql
SELECT
    toStartOfWeek(toDateTime('2023-04-21 10:20:30')), /* a Friday */
    toStartOfWeek(toDateTime('2023-04-21 10:20:30'), 1), /* a Friday */
    toStartOfWeek(toDate('2023-04-24')), /* a Monday */
    toStartOfWeek(toDate('2023-04-24'), 1) /* a Monday */
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

将日期或日期时间向上取整到最靠近的星期六或星期天。返回日期。
模式参数的工作方式与函数 `toWeek()` 中的模式参数完全相同。如果没有指定模式，则默认为 0。

**语法**

```sql
toLastDayOfWeek(t[, mode[, timezone]])
```

**参数**

- `t` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `mode` - 确定一周的最后一天，如 [toWeek](#toweek) 函数所述
- `timezone` - 可选参数，它的行为与其他任何转换函数相同

**返回值**

- 最靠近给定日期的星期天或星期一，具体取决于模式。 [Date](../data-types/date.md)。

**示例**

```sql
SELECT
    toLastDayOfWeek(toDateTime('2023-04-21 10:20:30')), /* a Friday */
    toLastDayOfWeek(toDateTime('2023-04-21 10:20:30'), 1), /* a Friday */
    toLastDayOfWeek(toDate('2023-04-22')), /* a Saturday */
    toLastDayOfWeek(toDate('2023-04-22'), 1) /* a Saturday */
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

将带时间的日期向下取整到该天的开始。

**语法**

```sql
toStartOfDay(value)
```

**参数**

- `value` - [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的开始。 [DateTime](../data-types/datetime.md)。

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

将带时间的日期向下取整到该小时的开始。

**语法**

```sql
toStartOfHour(value)
```

**参数**

- `value` - [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的开始（小时）。 [DateTime](../data-types/datetime.md)。

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

将带时间的日期向下取整到该分钟的开始。

**语法**

```sql
toStartOfMinute(value)
```

**参数**

- `value` - [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期/时间的开始（分钟）。 [DateTime](../data-types/datetime.md)。

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

截断亚秒。

**语法**

```sql
toStartOfSecond(value, [timezone])
```

**参数**

- `value` — 日期和时间。 [DateTime64](../data-types/datetime64.md)。
- `timezone` — [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) 用于返回值（可选）。如果未指定，函数使用 `value` 参数的时区。 [String](../data-types/string.md)。

**返回值**

- 不带亚秒的输入值。 [DateTime64](../data-types/datetime64.md)。

**示例**

不带时区的查询：

```sql
WITH toDateTime64('2020-01-01 10:20:30.999', 3) AS dt64
SELECT toStartOfSecond(dt64);
```

结果：

```text
┌───toStartOfSecond(dt64)─┐
│ 2020-01-01 10:20:30.000 │
└─────────────────────────┘
```

带时区的查询：

```sql
WITH toDateTime64('2020-01-01 10:20:30.999', 3) AS dt64
SELECT toStartOfSecond(dt64, 'Asia/Istanbul');
```

结果：

```text
┌─toStartOfSecond(dt64, 'Asia/Istanbul')─┐
│                2020-01-01 13:20:30.000 │
└────────────────────────────────────────┘
```

**另见**

- [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) 服务器配置参数。
## toStartOfMillisecond {#tostartofmillisecond}

将带时间的日期向下取整到毫秒的开始。

**语法**

```sql
toStartOfMillisecond(value, [timezone])
```

**参数**

- `value` — 日期和时间。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) 用于返回值（可选）。如果未指定，函数使用 `value` 参数的时区。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 输入值带亚毫秒。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

**示例**

不带时区的查询：

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMillisecond(dt64);
```

结果：

```text
┌────toStartOfMillisecond(dt64)─┐
│ 2020-01-01 10:20:30.999000000 │
└───────────────────────────────┘
```

带时区的查询：

```sql
┌─toStartOfMillisecond(dt64, 'Asia/Istanbul')─┐
│               2020-01-01 12:20:30.999000000 │
└─────────────────────────────────────────────┘
```

结果：

```text
┌─toStartOfMillisecond(dt64, 'Asia/Istanbul')─┐
│                     2020-01-01 12:20:30.999 │
└─────────────────────────────────────────────┘
```
## toStartOfMicrosecond {#tostartofmicrosecond}

将带时间的日期向下取整到微秒的开始。

**语法**

```sql
toStartOfMicrosecond(value, [timezone])
```

**参数**

- `value` — 日期和时间。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) 用于返回值（可选）。如果未指定，函数使用 `value` 参数的时区。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 输入值带亚微秒。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

**示例**

不带时区的查询：

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMicrosecond(dt64);
```

结果：

```text
┌────toStartOfMicrosecond(dt64)─┐
│ 2020-01-01 10:20:30.999999000 │
└───────────────────────────────┘
```

带时区的查询：

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfMicrosecond(dt64, 'Asia/Istanbul');
```

结果：

```text
┌─toStartOfMicrosecond(dt64, 'Asia/Istanbul')─┐
│               2020-01-01 12:20:30.999999000 │
└─────────────────────────────────────────────┘
```

**另见**

- [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) 服务器配置参数。
## toStartOfNanosecond {#tostartofnanosecond}

将带时间的日期向下取整到纳秒的开始。

**语法**

```sql
toStartOfNanosecond(value, [timezone])
```

**参数**

- `value` — 日期和时间。 [DateTime64](../../sql-reference/data-types/datetime64.md)。
- `timezone` — [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) 用于返回值（可选）。如果未指定，函数使用 `value` 参数的时区。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 输入值带纳秒。 [DateTime64](../../sql-reference/data-types/datetime64.md)。

**示例**

不带时区的查询：

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfNanosecond(dt64);
```

结果：

```text
┌─────toStartOfNanosecond(dt64)─┐
│ 2020-01-01 10:20:30.999999999 │
└───────────────────────────────┘
```

带时区的查询：

```sql
WITH toDateTime64('2020-01-01 10:20:30.999999999', 9) AS dt64
SELECT toStartOfNanosecond(dt64, 'Asia/Istanbul');
```

结果：

```text
┌─toStartOfNanosecond(dt64, 'Asia/Istanbul')─┐
│              2020-01-01 12:20:30.999999999 │
└────────────────────────────────────────────┘
```

**另见**

- [Timezone](../../operations/server-configuration-parameters/settings.md#timezone) 服务器配置参数。
## toStartOfFiveMinutes {#tostartoffiveminutes}

将带时间的日期向下取整到五分钟间隔的开始。

**语法**

```sql
toStartOfFiveMinutes(value)
```

**参数**

- `value` - [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期时间的五分钟间隔的开始。 [DateTime](../data-types/datetime.md)。

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

- `value` - [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期时间的十分钟间隔的开始。 [DateTime](../data-types/datetime.md)。

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

将带时间的日期取整到十五分钟间隔的开始。

**语法**

```sql
toStartOfFifteenMinutes(value)
```

**参数**

- `value` - [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 所给日期时间的十五分钟间隔的开始。 [DateTime](../data-types/datetime.md)。

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

此函数使用 `toStartOfInterval(date_or_date_with_time, INTERVAL x unit [, time_zone])` 语法概括了其他 `toStartOf*()` 函数。
例如，
- `toStartOfInterval(t, INTERVAL 1 YEAR)` 返回与 `toStartOfYear(t)` 相同的结果，
- `toStartOfInterval(t, INTERVAL 1 MONTH)` 返回与 `toStartOfMonth(t)` 相同的结果，
- `toStartOfInterval(t, INTERVAL 1 DAY)` 返回与 `toStartOfDay(t)` 相同的结果，
- `toStartOfInterval(t, INTERVAL 15 MINUTE)` 返回与 `toStartOfFifteenMinutes(t)` 相同的结果。

计算是相对于特定时间点进行的：

| Interval    | Start                  |
|-------------|------------------------|
| YEAR        | year 0                 |
| QUARTER     | 1900 Q1                |
| MONTH       | 1900 January           |
| WEEK        | 1970, 1st week (01-05) |
| DAY         | 1970-01-01             |
| HOUR        | (*)                    |
| MINUTE      | 1970-01-01 00:00:00    |
| SECOND      | 1970-01-01 00:00:00    |
| MILLISECOND | 1970-01-01 00:00:00    |
| MICROSECOND | 1970-01-01 00:00:00    |
| NANOSECOND  | 1970-01-01 00:00:00    |

(*) 小时间隔是特殊的：计算始终相对于当天的 00:00:00（午夜）进行。因此，只有范围在 1 到 23 之间的小时值是有用的。

如果指定了单位 `WEEK`，则 `toStartOfInterval` 假定周一为一周的开始。请注意，这种行为与函数 `toStartOfWeek` 不同，在该函数中，周日为默认的一周开始。

**语法**

```sql
toStartOfInterval(value, INTERVAL x unit[, time_zone])
toStartOfInterval(value, INTERVAL x unit[, origin[, time_zone]])
```
别名： `time_bucket`, `date_bin`。

第二个重载模拟了 TimescaleDB 的 `time_bucket()` 函数，分别是 PostgreSQL 的 `date_bin()` 函数，例如：

```SQL
SELECT toStartOfInterval(toDateTime('2023-01-01 14:45:00'), INTERVAL 1 MINUTE, toDateTime('2023-01-01 14:35:30'));
```

结果：

```reference
┌───toStartOfInterval(...)─┐
│      2023-01-01 14:44:30 │
└──────────────────────────┘
```

**参见**
- [date_trunc](#date_trunc)

## toTime {#totime}

将带时间的日期转换为某个固定日期，同时保留时间。

**语法**

```sql
toTime(date[,timezone])
```

**参数**

- `date` — 要转换为时间的日期。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `timezone` （可选） — 返回值的时区。 [String](../data-types/string.md)。

**返回值**

- DateTime，日期等于 `1970-01-02`，同时保留时间。 [DateTime](../data-types/datetime.md)。

:::note
如果输入参数 `date` 包含小于一秒的组件，
它们将在返回的 `DateTime` 值中以秒为精度被舍弃。
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

将日期或带时间的日期转换为自某个过去固定时间点以来经过的年数。

**语法**

```sql
toRelativeYearNum(date)
```

**参数**

- `date` — 日期或带时间的日期。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从过去某个固定参考点计算的年数。 [UInt16](../data-types/int-uint.md)。

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

将日期或带时间的日期转换为自某个过去固定时间点以来经过的季度数。

**语法**

```sql
toRelativeQuarterNum(date)
```

**参数**

- `date` — 日期或带时间的日期。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从过去某个固定参考点计算的季度数。 [UInt32](../data-types/int-uint.md)。

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

将日期或带时间的日期转换为自某个过去固定时间点以来经过的月数。

**语法**

```sql
toRelativeMonthNum(date)
```

**参数**

- `date` — 日期或带时间的日期。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从过去某个固定参考点计算的月数。 [UInt32](../data-types/int-uint.md)。

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

将日期或带时间的日期转换为自某个过去固定时间点以来经过的周数。

**语法**

```sql
toRelativeWeekNum(date)
```

**参数**

- `date` — 日期或带时间的日期。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从过去某个固定参考点计算的周数。 [UInt32](../data-types/int-uint.md)。

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

将日期或带时间的日期转换为自某个过去固定时间点以来经过的天数。

**语法**

```sql
toRelativeDayNum(date)
```

**参数**

- `date` — 日期或带时间的日期。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从过去某个固定参考点计算的天数。 [UInt32](../data-types/int-uint.md)。

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

将日期或带时间的日期转换为自某个过去固定时间点以来经过的小时数。

**语法**

```sql
toRelativeHourNum(date)
```

**参数**

- `date` — 日期或带时间的日期。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从过去某个固定参考点计算的小时数。 [UInt32](../data-types/int-uint.md)。

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

将日期或带时间的日期转换为自某个过去固定时间点以来经过的分钟数。

**语法**

```sql
toRelativeMinuteNum(date)
```

**参数**

- `date` — 日期或带时间的日期。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从过去某个固定参考点计算的分钟数。 [UInt32](../data-types/int-uint.md)。

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

将日期或带时间的日期转换为自某个过去固定时间点以来经过的秒数。

**语法**

```sql
toRelativeSecondNum(date)
```

**参数**

- `date` — 日期或带时间的日期。 [Date](../data-types/date.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

**返回值**

- 从过去某个固定参考点计算的秒数。 [UInt32](../data-types/int-uint.md)。

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

将日期或带时间的日期转换为 ISO 年，返回 UInt16 类型的数字。

**语法**

```sql
toISOYear(value)
```

**参数**

- `value` — 带日期或带时间的值。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)

**返回值**

- 输入值转换为 ISO 年的数字。 [UInt16](../data-types/int-uint.md)。

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

将日期或带时间的日期转换为包含 ISO 周数的 UInt8 数字。

**语法**

```sql
toISOWeek(value)
```

**参数**

- `value` — 带日期或带时间的值。

**返回值**

- `value` 转换为当前 ISO 周数。 [UInt8](../data-types/int-uint.md)。

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

此函数返回日期或日期时间的周数。 `toWeek()` 的两参数形式允许您指定一周是从周日开始还是周一开始，以及返回值是否应在 0 到 53 或 1 到 53 的范围内。如果省略 mode 参数，默认模式为 0。

`toISOWeek()` 是兼容函数，相当于 `toWeek(date,3)`。

以下表格描述了 mode 参数的工作方式。

| Mode | 一周的第一天 | 范围 | 第 1 周是这一年中的第一周 ...    |
|------|---------------|-------|----------------------------------|
| 0    | 周日          | 0-53  | 这一年内有一个周日                 |
| 1    | 周一          | 0-53  | 这一年内有 4 天或更多天          |
| 2    | 周日          | 1-53  | 这一年内有一个周日                 |
| 3    | 周一          | 1-53  | 这一年内有 4 天或更多天          |
| 4    | 周日          | 0-53  | 这一年内有 4 天或更多天          |
| 5    | 周一          | 0-53  | 这一年内有一个周一               |
| 6    | 周日          | 1-53  | 这一年内有 4 天或更多天          |
| 7    | 周一          | 1-53  | 这一年内有一个周一               |
| 8    | 周日          | 1-53  | 包含 1 月 1 日                     |
| 9    | 周一          | 1-53  | 包含 1 月 1 日                     |

适用于“这一年内有 4 天或更多天”模式的值，周按照 ISO 8601:1988 编号：

- 如果包含 1 月 1 日的周在新的一年中有 4 天或更多天，则这一周为第 1 周。

- 否则，它为前一年的最后一周，下一周为第 1 周。

适用于“包含 1 月 1 日”模式的值，其包含 1 月 1 日的那一周为第 1 周。
即使该周在新的一年中仅包含一天，结果也不影响。
也就是说，如果 12 月的最后一周包含下一年的 1 月 1 日，则该周为下一年的第 1 周。

**语法**

```sql
toWeek(t[, mode[, time_zone]])
```

别名： `WEEK`

**参数**

- `t` – 日期或日期时间。
- `mode` – 可选参数，值的范围为 \[0,9\]，默认为 0。
- `Timezone` – 可选参数，表现得像其他转换函数。

第一个参数也可以指定为 [String](../data-types/string.md)，格式由 [parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort) 支持。仅出于与某些第三方工具的 MySQL 兼容理由而存在字符串参数支持。因为字符串参数的支持在将来可能会依赖于新的 MySQL 兼容设置，并且字符串解析通常比较慢，建议不要使用它。

**示例**

```sql
SELECT toDate('2016-12-27') AS date, toWeek(date) AS week0, toWeek(date,1) AS week1, toWeek(date,9) AS week9;
```

```text
┌───────date─┬─week0─┬─week1─┬─week9─┐
│ 2016-12-27 │    52 │    52 │     1 │
└────────────┴───────┴───────┴───────┘
```
## toYearWeek {#toyearweek}

返回日期的年份和周数。结果中的年份可能与日期参数中的年份不同，适用于年份的第一周和最后一周。

mode 参数的工作方式与 `toWeek()` 的 mode 参数相同。对于单参数语法，使用 0 的 mode 值。

`toISOYear()` 是兼容函数，相当于 `intDiv(toYearWeek(date,3),100)`。

:::warning
`toYearWeek()` 返回的周数与 `toWeek()` 返回的周数可能不同。`toWeek()` 总是在给定年份的上下文中返回周数，如果 `toWeek()` 返回 `0`，则 `toYearWeek()` 返回对应于上一年最后一周的值。请参阅下面示例中的 `prev_yearWeek`。
:::

**语法**

```sql
toYearWeek(t[, mode[, timezone]])
```

别名： `YEARWEEK`

第一个参数也可以指定为 [String](../data-types/string.md)，格式由 [parseDateTime64BestEffort()](type-conversion-functions.md#parsedatetime64besteffort) 支持。仅出于与某些第三方工具的 MySQL 兼容理由而存在字符串参数支持。因为字符串参数的支持在将来可能会依赖于新的 MySQL 兼容设置，并且字符串解析通常比较慢，建议不要使用它。

**示例**

```sql
SELECT toDate('2016-12-27') AS date, toYearWeek(date) AS yearWeek0, toYearWeek(date,1) AS yearWeek1, toYearWeek(date,9) AS yearWeek9, toYearWeek(toDate('2022-01-01')) AS prev_yearWeek;
```

```text
┌───────date─┬─yearWeek0─┬─yearWeek1─┬─yearWeek9─┬─prev_yearWeek─┐
│ 2016-12-27 │    201652 │    201652 │    201701 │        202152 │
└────────────┴───────────┴───────────┴───────────┴───────────────┘
```
## toDaysSinceYearZero {#todayssinceyearzero}

在 [ISO 8601 定义的先行公历](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar) 中返回给定日期自 [公元 0000 年 1 月 1 日](https://en.wikipedia.org/wiki/Year_zero) 以来经过的天数。计算方式与 MySQL 的 [`TO_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_to-days) 函数相同。

**语法**

```sql
toDaysSinceYearZero(date[, time_zone])
```

别名： `TO_DAYS`

**参数**

- `date` — 计算自公元零年以来经过的天数的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。
- `time_zone` — 字符串类型常量值或表示时区的表达式。 [String types](../data-types/string.md)

**返回值**

自日期 0000-01-01 以来经过的天数。 [UInt32](../data-types/int-uint.md)。

**示例**

```sql
SELECT toDaysSinceYearZero(toDate('2023-09-08'));
```

结果：

```text
┌─toDaysSinceYearZero(toDate('2023-09-08')))─┐
│                                     713569 │
└────────────────────────────────────────────┘
```

**参见**

- [fromDaysSinceYearZero](#fromdayssinceyearzero)

## fromDaysSinceYearZero {#fromdayssinceyearzero}

返回给定的自 [公元 0000 年 1 月 1 日](https://en.wikipedia.org/wiki/Year_zero) 以来经过的天数对应的日期，在 [ISO 8601 定义的先行公历](https://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar) 中。计算方式与 MySQL 的 [`FROM_DAYS()`](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_from-days) 函数相同。

如果无法在 [Date](../data-types/date.md) 类型的范围内表示结果，则结果未定义。

**语法**

```sql
fromDaysSinceYearZero(days)
```

别名： `FROM_DAYS`

**参数**

- `days` — 自公元零年以来经过的天数。

**返回值**

与经过的天数相对应的日期。 [Date](../data-types/date.md)。

**示例**

```sql
SELECT fromDaysSinceYearZero(739136), fromDaysSinceYearZero(toDaysSinceYearZero(toDate('2023-09-08')));
```

结果：

```text
┌─fromDaysSinceYearZero(739136)─┬─fromDaysSinceYearZero(toDaysSinceYearZero(toDate('2023-09-08')))─┐
│                    2023-09-08 │                                                       2023-09-08 │
└───────────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

**参见**

- [toDaysSinceYearZero](#todayssinceyearzero)

## fromDaysSinceYearZero32 {#fromdayssinceyearzero32}

类似于 [fromDaysSinceYearZero](#fromdayssinceyearzero)，但返回 [Date32](../data-types/date32.md)。

## age {#age}

返回 `startdate` 和 `enddate` 之间差异的 `unit` 组件。差异是使用 1 纳秒的精度计算的。
例如，`2021-12-29` 和 `2022-01-01` 之间的差异在 `day` 单位上为 3 天，在 `month` 单位上为 0 个月，在 `year` 单位上为 0 年。

有关 `age` 的替代方案，请参见函数 `date_diff`。

**语法**

```sql
age('unit', startdate, enddate, [timezone])
```

**参数**

- `unit` — 结果的时间间隔类型。 [String](../data-types/string.md)。
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

- `startdate` — 第一个要相减的时间值（被减数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

- `enddate` — 第二个时间值（被减数的减数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。如果指定，则适用于 `startdate` 和 `enddate`。如果未指定，则使用 `startdate` 和 `enddate` 的时区。如果它们不相同，则结果未指定。 [String](../data-types/string.md)。

**返回值**

以 `unit` 表示的 `enddate` 和 `startdate` 之间的差异。 [Int](../data-types/int-uint.md)。

**示例**

```sql
SELECT age('hour', toDateTime('2018-01-01 22:30:00'), toDateTime('2018-01-02 23:00:00'));
```

结果：

```text
┌─age('hour', toDateTime('2018-01-01 22:30:00'), toDateTime('2018-01-02 23:00:00'))─┐
│                                                                                24 │
└───────────────────────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    toDate('2022-01-01') AS e,
    toDate('2021-12-29') AS s,
    age('day', s, e) AS day_age,
    age('month', s, e) AS month__age,
    age('year', s, e) AS year_age;
```

结果：

```text
┌──────────e─┬──────────s─┬─day_age─┬─month__age─┬─year_age─┐
│ 2022-01-01 │ 2021-12-29 │       3 │          0 │        0 │
└────────────┴────────────┴─────────┴────────────┴──────────┘
```

## date_diff {#date_diff}

返回在 `startdate` 和 `enddate` 之间跨越的指定 `unit` 边界的数量。
差异是使用相对单位计算的，例如  `2021-12-29` 和 `2022-01-01` 之间的差异在 `day` 单位上是 3 天（见 [toRelativeDayNum](#torelativedaynum)），在 `month` 单位上是 1 月（见 [toRelativeMonthNum](#torelativemonthnum)），在 `year` 单位上是 1 年（见 [toRelativeYearNum](#torelativeyearnum)）。

如果指定了单位 `week`，则 `date_diff` 假定周一为一周的开始。注意，这种行为与函数 `toWeek()` 中默认的周日开始不同。

有关 `date_diff` 的替代方案，请参见函数 `age`。

**语法**

```sql
date_diff('unit', startdate, enddate, [timezone])
```

别名： `dateDiff`, `DATE_DIFF`, `timestampDiff`, `timestamp_diff`, `TIMESTAMP_DIFF`。

**参数**

- `unit` — 结果的时间间隔类型。 [String](../data-types/string.md)。
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

- `startdate` — 第一个要相减的时间值（被减数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

- `enddate` — 第二个时间值（被减数的减数）。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

- `timezone` — [时区名称](../../operations/server-configuration-parameters/settings.md#timezone) （可选）。如果指定，则适用于 `startdate` 和 `enddate`。如果未指定，则使用 `startdate` 和 `enddate` 的时区。如果它们不相同，则结果未指定。 [String](../data-types/string.md)。

**返回值**

以 `unit` 表示的 `enddate` 和 `startdate` 之间的差异。 [Int](../data-types/int-uint.md)。

**示例**

```sql
SELECT dateDiff('hour', toDateTime('2018-01-01 22:00:00'), toDateTime('2018-01-02 23:00:00'));
```

结果：

```text
┌─dateDiff('hour', toDateTime('2018-01-01 22:00:00'), toDateTime('2018-01-02 23:00:00'))─┐
│                                                                                     25 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    toDate('2022-01-01') AS e,
    toDate('2021-12-29') AS s,
    dateDiff('day', s, e) AS day_diff,
    dateDiff('month', s, e) AS month__diff,
    dateDiff('year', s, e) AS year_diff;
```

结果：

```text
┌──────────e─┬──────────s─┬─day_diff─┬─month__diff─┬─year_diff─┐
│ 2022-01-01 │ 2021-12-29 │        3 │           1 │         1 │
└────────────┴────────────┴──────────┴─────────────┴───────────┘
```

## date\_trunc {#date_trunc}

将日期和时间数据截断到指定的日期部分。

**语法**

```sql
date_trunc(unit, value[, timezone])
```

别名： `dateTrunc`。

**参数**

- `unit` — 截断结果的时间间隔类型。 [String Literal](/sql-reference/syntax#string)。
    可能的值：

    - `nanosecond` - 仅与 DateTime64 兼容
    - `microsecond` - 仅与 DateTime64 兼容
    - `millisecond` - 仅与 DateTime64 兼容
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
- `timezone` — 返回值的 [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。如果未指定，则函数使用 `value` 参数的时区。 [String](../data-types/string.md)。

**返回值**

如果 unit 参数为 Year、Quarter、Month 或 Week，
- 且 value 参数为 Date32 或 DateTime64，则返回 [Date32](../data-types/date32.md)；
- 否则返回 [Date](../data-types/date.md)。

如果 unit 参数为 Day、Hour、Minute 或 Second，
- 且 value 参数为 Date32 或 DateTime64，则返回 [DateTime64](../data-types/datetime64.md)；
- 否则返回 [DateTime](../data-types/datetime.md)。

如果 unit 参数为 Millisecond、Microsecond 或 Nanosecond，则返回 [DateTime64](../data-types/datetime64.md)，其刻度为 3、6 或 9（取决于 unit 参数）。

**示例**

不带时区的查询：

```sql
SELECT now(), date_trunc('hour', now());
```

结果：

```text
┌───────────────now()─┬─date_trunc('hour', now())─┐
│ 2020-09-28 10:40:45 │       2020-09-28 10:00:00 │
└─────────────────────┴───────────────────────────┘
```

带指定时区的查询：

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

将时间间隔或日期间隔加到提供的日期或带时间的日期上。

如果加法结果超出数据类型的范围，则结果未定义。

**语法**

```sql
date_add(unit, value, date)
```

替代语法：

```sql
date_add(date, INTERVAL value unit)
```

别名： `dateAdd`, `DATE_ADD`。

**参数**

- `unit` — 要加的时间间隔类型。注意：这不是 [String](../data-types/string.md)，因此不能加引号。
    可能的值：

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 要加的间隔的值。 [Int](../data-types/int-uint.md)。
- `date` — 要将 `value` 加到的日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

通过将以 `unit` 表达的 `value` 加到 `date` 上获得的日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

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

从提供的日期或带时间的日期中减去时间间隔或日期间隔。

如果减法结果超出数据类型的范围，则结果未定义。

**语法**

```sql
date_sub(unit, value, date)
```

替代语法：

```sql
date_sub(date, INTERVAL value unit)
```

别名： `dateSub`, `DATE_SUB`。

**参数**

- `unit` — 要减去的时间间隔类型。注意：这不是 [String](../data-types/string.md)，因此不能加引号。

    可能的值：

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 要减去的间隔的值。 [Int](../data-types/int-uint.md)。
- `date` — 要从中减去 `value` 的日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

通过将以 `unit` 表达的 `value` 从 `date` 中减去获得的日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
SELECT date_sub(YEAR, 3, toDate('2018-01-01'));
```

结果：

```text
┌─minus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                     2015-01-01 │
└────────────────────────────────────────────────┘
```

```sql
SELECT date_sub(toDate('2018-01-01'), INTERVAL 3 YEAR);
```

结果：

```text
┌─minus(toDate('2018-01-01'), toIntervalYear(3))─┐
│                                     2015-01-01 │
└────────────────────────────────────────────────┘
```

**参见**

- [subDate](#subdate)

## timestamp\_add {#timestamp_add}

将指定的时间值与提供的日期或日期时间值相加。

如果加法结果超出数据类型的范围，则结果未定义。

**语法**

```sql
timestamp_add(date, INTERVAL value unit)
```

别名： `timeStampAdd`, `TIMESTAMP_ADD`。

**参数**

- `date` — 日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。
- `value` — 要加的间隔的值。 [Int](../data-types/int-uint.md)。
- `unit` — 要加的时间间隔类型。 [String](../data-types/string.md)。
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

在指定的 `unit` 中运算后，日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

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

从提供的日期或带时间的日期中减去时间间隔。

如果减法结果超出数据类型的范围，则结果未定义。

**语法**

```sql
timestamp_sub(unit, value, date)
```

别名： `timeStampSub`, `TIMESTAMP_SUB`。

**参数**

- `unit` — 要减去的时间间隔类型。 [String](../data-types/string.md)。
    可能的值：

    - `second`
    - `minute`
    - `hour`
    - `day`
    - `week`
    - `month`
    - `quarter`
    - `year`

- `value` — 要减去的间隔的值。 [Int](../data-types/int-uint.md)。
- `date` — 日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

通过将以 `unit` 表达的 `value` 从 `date` 中减去获得的日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

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

将时间间隔加到提供的日期、日期时间或字符串编码的日期/日期时间上。

如果加法结果超出数据类型的范围，则结果未定义。

**语法**

```sql
addDate(date, interval)
```

**参数**

- `date` — 要加上 `interval` 的日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、[DateTime64](../data-types/datetime64.md) 或 [String](../data-types/string.md)
- `interval` — 要加的间隔。 [Interval](../data-types/special-data-types/interval.md)。

**返回值**

通过将 `interval` 加到 `date` 上获得的日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

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

从提供的日期、带时间的日期或字符串编码的日期/日期时间中减去时间间隔。

如果减法结果超出数据类型的范围，则结果未定义。

**语法**

```sql
subDate(date, interval)
```

**参数**

- `date` — 要从中减去 `interval` 的日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md)、[DateTime64](../data-types/datetime64.md) 或 [String](../data-types/string.md)
- `interval` — 要减去的间隔。 [Interval](../data-types/special-data-types/interval.md)。

**返回值**

通过将 `interval` 从 `date` 中减去获得的日期或带时间的日期。 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

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

返回查询解析时当前的日期和时间。此函数是一个常量表达式。

别名： `current_timestamp`。

**语法**

```sql
now([timezone])
```

**参数**

- `timezone` — 返回值的 [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。 [String](../data-types/string.md)。

**返回值**

- 当前的日期和时间。 [DateTime](../data-types/datetime.md)。

**示例**

不带时区的查询：

```sql
SELECT now();
```

结果：

```text
┌───────────────now()─┐
│ 2020-10-17 07:42:09 │
└─────────────────────┘
```

带指定时区的查询：

```sql
SELECT now('Asia/Istanbul');
```

结果：

```text
┌─now('Asia/Istanbul')─┐
│  2020-10-17 10:42:23 │
└──────────────────────┘
```

## now64 {#now64}

返回查询解析时当前的日期和时间，带有子秒精度。此函数是一个常量表达式。

**语法**

```sql
now64([scale], [timezone])
```

**参数**

- `scale` - 时间戳精度: 10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。通常使用 - 3（默认）（毫秒）、6（微秒）、9（纳秒）。
- `timezone` — 返回值的 [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。 [String](../data-types/string.md)。

**返回值**

- 当前日期和时间，带有子秒的精度。 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
SELECT now64(), now64(9, 'Asia/Istanbul');
```

结果：

```text
┌─────────────────now64()─┬─────now64(9, 'Asia/Istanbul')─┐
│ 2022-08-21 19:34:26.196 │ 2022-08-21 22:34:26.196542766 │
└─────────────────────────┴───────────────────────────────┘
```

## nowInBlock {#nowInBlock}

返回在每个数据块处理时的当前日期和时间。与函数 [now](#now) 不同，它不是常量表达式，对于长时间运行的查询，不同的块返回的值可能不同。

在长时间运行的 INSERT SELECT 查询中生成当前时间时使用此函数是有意义的。

**语法**

```sql
nowInBlock([timezone])
```

**参数**

- `timezone` — 返回值的 [时区名称](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。 [String](../data-types/string.md)。

**返回值**

- 在每个数据块处理时的当前日期和时间。 [DateTime](../data-types/datetime.md)。

**示例**

```sql
SELECT
    now(),
    nowInBlock(),
    sleep(1)
FROM numbers(3)
SETTINGS max_block_size = 1
FORMAT PrettyCompactMonoBlock
```

结果：

```text
┌───────────────now()─┬────────nowInBlock()─┬─sleep(1)─┐
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:19 │        0 │
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:20 │        0 │
│ 2022-08-21 19:41:19 │ 2022-08-21 19:41:21 │        0 │
└─────────────────────┴─────────────────────┴──────────┘
```

## today {#today}

返回查询解析时的当前日期。它与 'toDate(now())' 相同，并具有别名： `curdate`, `current_date`。

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

接受零个参数并返回查询解析时的昨天的日期。
与 'today() - 1' 相同。

## timeSlot {#timeslot}

将时间四舍五入到半小时长度区间的开始。

**语法**

```sql
timeSlot(time[, time_zone])
```

**参数**

- `time` — 要四舍五入到半小时长度区间开始的时间。 [DateTime](../data-types/datetime.md)/[Date32](../data-types/date32.md)/[DateTime64](../data-types/datetime64.md)。
- `time_zone` — 表示时区的字符串类型常量值或表达式。 [String](../data-types/string.md)。

:::note
尽管此函数可以接受扩展类型 `Date32` 和 `DateTime64` 的值作为参数，但传递超出正常范围的时间（对于 `Date` 的年限为 1970 到 2149 / 对于 `DateTime` 为 2106）将会产生错误的结果。
:::

**返回类型**

- 返回四舍五入到半小时长度区间开始的时间。 [DateTime](../data-types/datetime.md)。

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

将日期或带时间的日期转换为一个包含年份和月份数字的 UInt32 数字（YYYY * 100 + MM）。接受第二个可选的时区参数。如果提供，那么时区必须是一个字符串常量。

此函数是 `YYYYMMDDToDate()` 函数的反向操作。

**示例**

```sql
SELECT
    toYYYYMM(now(), 'US/Eastern')
```

结果：

```text
┌─toYYYYMM(now(), 'US/Eastern')─┐
│                        202303 │
└───────────────────────────────┘
```
## toYYYYMMDD {#toyyyymmdd}

将日期或带时间的日期转换为一个包含年份和月份数字的 UInt32 数字（YYYY * 10000 + MM * 100 + DD）。接受第二个可选的时区参数。如果提供，那么时区必须是一个字符串常量。

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

将带时间的日期转换为一个 UInt64 数字，包含年份和月份数字（YYYY * 10000000000 + MM * 100000000 + DD * 1000000 + hh * 10000 + mm * 100 + ss）。接受第二个可选的时区参数。如果提供，那么时区必须是一个字符串常量。

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

将包含年份、月份和日期的数字转换为一个 [Date](../data-types/date.md)。

此函数是 `toYYYYMMDD()` 函数的反向操作。

如果输入未编码有效的 Date 值，输出将是未定义的。

**语法**

```sql
YYYYMMDDToDate(yyyymmdd);
```

**参数**

- `yyyymmdd` - 一个表示年份、月份和日期的数字。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。

**返回值**

- 从参数创建的日期。 [Date](../data-types/date.md)。

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

与 `YYYYMMDDToDate()` 函数类似，但生成一个 [Date32](../data-types/date32.md)。
## YYYYMMDDhhmmssToDateTime {#yyyymmddhhmmsstodatetime}

将数字中包含的年份、月份、日期、小时、分钟和秒转换为一个 [DateTime](../data-types/datetime.md)。

如果输入未编码有效的 DateTime 值，输出将是未定义的。

此函数是 `toYYYYMMDDhhmmss()` 函数的反向操作。

**语法**

```sql
YYYYMMDDhhmmssToDateTime(yyyymmddhhmmss[, timezone]);
```

**参数**

- `yyyymmddhhmmss` - 一个表示年份、月份和日期的数字。 [Integer](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。
- `timezone` - 返回值的 [Timezone](../../operations/server-configuration-parameters/settings.md#timezone)（可选）。

**返回值**

- 从参数创建的带时间的日期。 [DateTime](../data-types/datetime.md)。

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

与 `YYYYMMDDhhmmssToDate()` 函数类似，但生成一个 [DateTime64](../data-types/datetime64.md)。

在 `timezone` 参数后接受一个额外的可选 `precision` 参数。
## changeYear {#changeyear}

更改日期或带时间日期的年份组件。

**语法**
```sql

changeYear(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 新的年份值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 与 `date_or_datetime` 相同的类型。

**示例**

```sql
SELECT changeYear(toDate('1999-01-01'), 2000), changeYear(toDateTime64('1999-01-01 00:00:00.000', 3), 2000);
```

结果：

```sql
┌─changeYear(toDate('1999-01-01'), 2000)─┬─changeYear(toDateTime64('1999-01-01 00:00:00.000', 3), 2000)─┐
│                             2000-01-01 │                                      2000-01-01 00:00:00.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## changeMonth {#changemonth}

更改日期或带时间日期的月份组件。

**语法**

```sql
changeMonth(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 新的月份值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 返回与 `date_or_datetime` 相同类型的值。

**示例**

```sql
SELECT changeMonth(toDate('1999-01-01'), 2), changeMonth(toDateTime64('1999-01-01 00:00:00.000', 3), 2);
```

结果：

```sql
┌─changeMonth(toDate('1999-01-01'), 2)─┬─changeMonth(toDateTime64('1999-01-01 00:00:00.000', 3), 2)─┐
│                           1999-02-01 │                                    1999-02-01 00:00:00.000 │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```
## changeDay {#changeday}

更改日期或带时间日期的日期组件。

**语法**

```sql
changeDay(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 新的日期值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 返回与 `date_or_datetime` 相同类型的值。

**示例**

```sql
SELECT changeDay(toDate('1999-01-01'), 5), changeDay(toDateTime64('1999-01-01 00:00:00.000', 3), 5);
```

结果：

```sql
┌─changeDay(toDate('1999-01-01'), 5)─┬─changeDay(toDateTime64('1999-01-01 00:00:00.000', 3), 5)─┐
│                         1999-01-05 │                                  1999-01-05 00:00:00.000 │
└────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```
## changeHour {#changehour}

更改日期或带时间日期的小时组件。

**语法**

```sql
changeHour(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 新的小时值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 返回与 `date_or_datetime` 相同类型的值。如果输入是 [Date](../data-types/date.md)，返回 [DateTime](../data-types/datetime.md)。如果输入是 [Date32](../data-types/date32.md)，返回 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
SELECT changeHour(toDate('1999-01-01'), 14), changeHour(toDateTime64('1999-01-01 00:00:00.000', 3), 14);
```

结果：

```sql
┌─changeHour(toDate('1999-01-01'), 14)─┬─changeHour(toDateTime64('1999-01-01 00:00:00.000', 3), 14)─┐
│                  1999-01-01 14:00:00 │                                    1999-01-01 14:00:00.000 │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```
## changeMinute {#changeminute}

更改日期或带时间日期的分钟组件。

**语法**

```sql
changeMinute(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 新的分钟值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 返回与 `date_or_datetime` 相同类型的值。如果输入是 [Date](../data-types/date.md)，返回 [DateTime](../data-types/datetime.md)。如果输入是 [Date32](../data-types/date32.md)，返回 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
SELECT changeMinute(toDate('1999-01-01'), 15), changeMinute(toDateTime64('1999-01-01 00:00:00.000', 3), 15);
```

结果：

```sql
┌─changeMinute(toDate('1999-01-01'), 15)─┬─changeMinute(toDateTime64('1999-01-01 00:00:00.000', 3), 15)─┐
│                    1999-01-01 00:15:00 │                                      1999-01-01 00:15:00.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## changeSecond {#changesecond}

更改日期或带时间日期的秒组件。

**语法**

```sql
changeSecond(date_or_datetime, value)
```

**参数**

- `date_or_datetime` - 一个 [Date](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)
- `value` - 新的秒值。 [Integer](../../sql-reference/data-types/int-uint.md)。

**返回值**

- 返回与 `date_or_datetime` 相同类型的值。如果输入是 [Date](../data-types/date.md)，返回 [DateTime](../data-types/datetime.md)。如果输入是 [Date32](../data-types/date32.md)，返回 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
SELECT changeSecond(toDate('1999-01-01'), 15), changeSecond(toDateTime64('1999-01-01 00:00:00.000', 3), 15);
```

结果：

```sql
┌─changeSecond(toDate('1999-01-01'), 15)─┬─changeSecond(toDateTime64('1999-01-01 00:00:00.000', 3), 15)─┐
│                    1999-01-01 00:00:15 │                                      1999-01-01 00:00:15.000 │
└────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```
## addYears {#addyears}

向日期、带时间的日期或字符串编码的日期/带时间的日期添加指定数量的年份。

**语法**

```sql
addYears(date, num)
```

**参数**

- `date`: 要增加指定年份的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要添加的年份数量。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

向日期、带时间的日期或字符串编码的日期/带时间的日期添加指定数量的季度。

**语法**

```sql
addQuarters(date, num)
```

**参数**

- `date`: 要增加指定季度的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要添加的季度数量。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

向日期、带时间的日期或字符串编码的日期/带时间的日期添加指定数量的月份。

**语法**

```sql
addMonths(date, num)
```

**参数**

- `date`: 要增加指定月份的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要添加的月份数量。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 加上 `num` 月份。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

向日期、带时间的日期或字符串编码的日期/带时间的日期添加指定数量的周。

**语法**

```sql
addWeeks(date, num)
```

**参数**

- `date`: 要增加指定周数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要添加的周数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

向日期、带时间的日期或字符串编码的日期/带时间的日期添加指定数量的天。

**语法**

```sql
addDays(date, num)
```

**参数**

- `date`: 要增加指定天数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要添加的天数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

向日期、带时间的日期或字符串编码的日期/带时间的日期添加指定数量的小时。

**语法**

```sql
addHours(date, num)
```

**参数**

- `date`: 要增加指定小时数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要添加的小时数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返回值**
o
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

向日期、带时间的日期或字符串编码的日期/带时间的日期添加指定数量的分钟。

**语法**

```sql
addMinutes(date, num)
```

**参数**

- `date`: 要增加指定分钟数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要添加的分钟数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

向日期、带时间的日期或字符串编码的日期/带时间的日期添加指定数量的秒。

**语法**

```sql
addSeconds(date, num)
```

**参数**

- `date`: 要增加指定秒数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要添加的秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

向带时间的日期或字符串编码的带时间的日期添加指定数量的毫秒。

**语法**

```sql
addMilliseconds(date_time, num)
```

**参数**

- `date_time`: 带时间的日期，增加指定数量的毫秒。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要添加的毫秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

向带时间的日期或字符串编码的带时间的日期添加指定数量的微秒。

**语法**

```sql
addMicroseconds(date_time, num)
```

**参数**

- `date_time`: 带时间的日期，增加指定数量的微秒。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要添加的微秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

向带时间的日期或字符串编码的带时间的日期添加指定数量的纳秒。

**语法**

```sql
addNanoseconds(date_time, num)
```

**参数**

- `date_time`: 带时间的日期，增加指定数量的纳秒。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要添加的纳秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

将一个区间添加到另一个区间或区间的元组中。

**语法**

```sql
addInterval(interval_1, interval_2)
```

**参数**

- `interval_1`: 第一个区间或区间的元组。 [interval](../data-types/special-data-types/interval.md)、[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 要添加的第二个区间。 [interval](../data-types/special-data-types/interval.md)。

**返回值**

- 返回一个区间的元组。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
同类型的区间将被组合成单个区间。例如，如果传递了 `toIntervalDay(1)` 和 `toIntervalDay(2)`，则结果将是 `(3)` 而不是 `(1,1)`。
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

将一个区间的元组连续地添加到 Date 或 DateTime。

**语法**

```sql
addTupleOfIntervals(interval_1, interval_2)
```

**参数**

- `date`: 第一个区间或区间的元组。 [date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。
- `intervals`: 要添加到 `date` 的区间元组。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

**返回值**

- 返回加上 `intervals` 的 `date`。 [date](../data-types/date.md)/[date32](../data-types/date32.md)/[datetime](../data-types/datetime.md)/[datetime64](../data-types/datetime64.md)。

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

从日期、带时间的日期或字符串编码的日期/带时间的日期中减去指定数量的年份。

**语法**

```sql
subtractYears(date, num)
```

**参数**

- `date`: 从中减去指定年份的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要减去的年份数量。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

从日期、带时间的日期或字符串编码的日期/带时间的日期中减去指定数量的季度。

**语法**

```sql
subtractQuarters(date, num)
```

**参数**

- `date`: 从中减去指定季度的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要减去的季度数量。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

从日期、带时间的日期或字符串编码的日期/带时间的日期中减去指定数量的月份。

**语法**

```sql
subtractMonths(date, num)
```

**参数**

- `date`: 从中减去指定月份的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要减去的月份数量。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 减去 `num` 月份。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

从日期、带时间的日期或字符串编码的日期/带时间的日期中减去指定数量的周。

**语法**

```sql
subtractWeeks(date, num)
```

**参数**

- `date`: 从中减去指定周数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要减去的周数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

从日期、带时间的日期或字符串编码的日期/带时间的日期中减去指定数量的天。

**语法**

```sql
subtractDays(date, num)
```

**参数**

- `date`: 从中减去指定天数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要减去的天数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

从日期、带时间的日期或字符串编码的日期/带时间的日期中减去指定数量的小时。

**语法**

```sql
subtractHours(date, num)
```

**参数**

- `date`: 从中减去指定小时数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[Datetime](../data-types/datetime.md)/[Datetime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要减去的小时数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

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

结果：

```response
┌─subtract_hours_with_date─┬─subtract_hours_with_date_time─┬─subtract_hours_with_date_time_string─┐
│      2023-12-31 12:00:00 │           2023-12-31 12:00:00 │              2023-12-31 12:00:00.000 │
└──────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## subtractMinutes {#subtractminutes}

从日期、带时间的日期或字符串编码的日期/带时间的日期中减去指定数量的分钟。

**语法**

```sql
subtractMinutes(date, num)
```

**参数**

- `date`: 从中减去指定分钟数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要减去的分钟数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 减去 `num` 分钟。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

结果：

```response
┌─subtract_minutes_with_date─┬─subtract_minutes_with_date_time─┬─subtract_minutes_with_date_time_string─┐
│        2023-12-31 23:30:00 │             2023-12-31 23:30:00 │                2023-12-31 23:30:00.000 │
└────────────────────────────┴─────────────────────────────────┴────────────────────────────────────────┘
```
## subtractSeconds {#subtractseconds}

从日期、带时间的日期或字符串编码的日期/带时间的日期中减去指定数量的秒。

**语法**

```sql
subtractSeconds(date, num)
```

**参数**

- `date`: 从中减去指定秒数的日期/带时间的日期。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要减去的秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返回值**

- 返回 `date` 减去 `num` 秒。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

结果：

```response
┌─subtract_seconds_with_date─┬─subtract_seconds_with_date_time─┬─subtract_seconds_with_date_time_string─┐
│        2023-12-31 23:59:00 │             2023-12-31 23:59:00 │                2023-12-31 23:59:00.000 │
└────────────────────────────┴─────────────────────────────────┴────────────────────────────────────────┘
```
## subtractMilliseconds {#subtractmilliseconds}

从带时间的日期或字符串编码的带时间的日期中减去指定数量的毫秒。

**语法**

```sql
subtractMilliseconds(date_time, num)
```

**参数**

- `date_time`: 带时间的日期，从中减去指定数量的毫秒。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要减去的毫秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返回值**

- 返回 `date_time` 减去 `num` 毫秒。 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMilliseconds(date_time, 1000) AS subtract_milliseconds_with_date_time,
    subtractMilliseconds(date_time_string, 1000) AS subtract_milliseconds_with_date_time_string
```

结果：

```response
┌─subtract_milliseconds_with_date_time─┬─subtract_milliseconds_with_date_time_string─┐
│              2023-12-31 23:59:59.000 │                     2023-12-31 23:59:59.000 │
└──────────────────────────────────────┴─────────────────────────────────────────────┘
```
## subtractMicroseconds {#subtractmicroseconds}

从带时间的日期或字符串编码的带时间的日期中减去指定数量的微秒。

**语法**

```sql
subtractMicroseconds(date_time, num)
```

**参数**

- `date_time`: 带时间的日期，从中减去指定数量的微秒。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要减去的微秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返回值**

- 返回 `date_time` 减去 `num` 微秒。 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractMicroseconds(date_time, 1000000) AS subtract_microseconds_with_date_time,
    subtractMicroseconds(date_time_string, 1000000) AS subtract_microseconds_with_date_time_string
```

结果：

```response
┌─subtract_microseconds_with_date_time─┬─subtract_microseconds_with_date_time_string─┐
│           2023-12-31 23:59:59.000000 │                  2023-12-31 23:59:59.000000 │
└──────────────────────────────────────┴─────────────────────────────────────────────┘
```
## subtractNanoseconds {#subtractnanoseconds}

从带时间的日期或字符串编码的带时间的日期中减去指定数量的纳秒。

**语法**

```sql
subtractNanoseconds(date_time, num)
```

**参数**

- `date_time`: 带时间的日期，从中减去指定数量的纳秒。 [DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)、[String](../data-types/string.md)。
- `num`: 要减去的纳秒数。 [(U)Int*](../data-types/int-uint.md)、[Float*](../data-types/float.md)。

**返回值**

- 返回 `date_time` 减去 `num` 纳秒。 [DateTime64](../data-types/datetime64.md)。

**示例**

```sql
WITH
    toDateTime('2024-01-01 00:00:00') AS date_time,
    '2024-01-01 00:00:00' AS date_time_string
SELECT
    subtractNanoseconds(date_time, 1000) AS subtract_nanoseconds_with_date_time,
    subtractNanoseconds(date_time_string, 1000) AS subtract_nanoseconds_with_date_time_string
```

结果：

```response
┌─subtract_nanoseconds_with_date_time─┬─subtract_nanoseconds_with_date_time_string─┐
│       2023-12-31 23:59:59.999999000 │              2023-12-31 23:59:59.999999000 │
└─────────────────────────────────────┴────────────────────────────────────────────┘
```
## subtractInterval {#subtractinterval}

将负的区间添加到另一个区间或区间的元组中。

**语法**

```sql
subtractInterval(interval_1, interval_2)
```

**参数**

- `interval_1`: 第一个区间或区间的元组。 [interval](../data-types/special-data-types/interval.md)、[tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。
- `interval_2`: 要取反的第二个区间。 [interval](../data-types/special-data-types/interval.md)。

**返回值**

- 返回一个区间的元组。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

:::note
同类型的区间将被组合成单个区间。例如，如果传递了 `toIntervalDay(2)` 和 `toIntervalDay(1)`，则结果将是 `(1)` 而不是 `(2,1)`
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

连续地从 Date 或 DateTime 中减去区间的元组。

**语法**

```sql
subtractTupleOfIntervals(interval_1, interval_2)
```

**参数**

- `date`: 第一个区间或区间的元组。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。
- `intervals`: 要从 `date` 中减去的区间元组。 [tuple](../data-types/tuple.md)([interval](../data-types/special-data-types/interval.md))。

**返回值**

- 返回减去 `intervals` 的 `date`。 [Date](../data-types/date.md)/[Date32](../data-types/date32.md)/[DateTime](../data-types/datetime.md)/[DateTime64](../data-types/datetime64.md)。

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

对于从 'StartTime' 开始并持续 'Duration' 秒的时间间隔，它返回一个时间点的数组，由此区间的点向下舍入到 'Size' 秒。'Size' 是一个可选参数，默认为 1800（30 分钟）。
当搜索相应会话中的页面浏览量时，此功能非常必要。
接受 DateTime 和 DateTime64 作为 'StartTime' 参数。对于 DateTime，'Duration' 和 'Size' 参数必须为 `UInt32`。对于 'DateTime64'，它们必须为 `Decimal64`。
返回一组 DateTime/DateTime64（返回类型与 'StartTime' 的类型匹配）。对于 DateTime64，返回值的精度可能与 'StartTime' 的精度不同——所有给定参数中最高的精度将被采用。

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

```text
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

根据给定的格式字符串格式化时间。格式是常量表达式，因此无法为单个结果列设置多个格式。

formatDateTime 使用 MySQL 日期时间格式样式，参见 https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format。

该函数的相反操作是 [parseDateTime](/sql-reference/functions/type-conversion-functions#parsedatetime)。

别名：`DATE_FORMAT`。

**语法**

```sql
formatDateTime(Time, Format[, Timezone])
```

**返回值**

根据确定的格式返回时间和日期值。

**替换字段**

使用替换字段，您可以为结果字符串定义模式。“示例”列显示 `2018-01-02 22:33:44` 的格式化结果。

| 占位符   | 描述                                                                                                                                                                                         | 示例     |
|-------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| %a    | 简写的星期几名称（周一-周日）                                                                                                                                                                   | Mon    |
| %b    | 简写的月份名称（1月-12月）                                                                                                                                                                     | Jan    |
| %c    | 作为整数（01-12）表示的月份，参见下面的“注释 4”                                                                                                                                              | 01     |
| %C    | 年份除以 100 后向下取整（00-99）                                                                                                                                                               | 20     |
| %d    | 零填充的月份中的日期（01-31）                                                                                                                                                                  | 02     |
| %D    | 短格式 MM/DD/YY 日期，相当于 %m/%d/%y                                                                                                                                                         | 01/02/18|
| %e    | 零填充的月份中的日期（ 1-31），参见下面的“注释 5”                                                                                                                                          | &nbsp; 2 |
| %f    | 小数秒，参见下面的“注释 1”和“注释 2”                                                                                                                                                       | 123456 |
| %F    | 短格式 YYYY-MM-DD 日期，相当于 %Y-%m-%d                                                                                                                                                        | 2018-01-02 |
| %g    | 两位数字的年份格式，符合 ISO 8601，缩写自四位数字表示法                                                                                                                                        | 18     |
| %G    | ISO 周号的四位数字年份格式，按照 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates) 标准计算的基于周的年份，通常仅与 %V 一起使用                                       | 2018   |
| %h    | 12 小时制格式的小时（01-12）                                                                                                                                                                   | 09     |
| %H    | 24 小时制格式的小时（00-23）                                                                                                                                                                   | 22     |
| %i    | 分钟（00-59）                                                                                                                                                                               | 33     |
| %I    | 12 小时制格式的小时（01-12）                                                                                                                                                                   | 10     |
| %j    | 年中的天数（001-366）                                                                                                                                                                        | 002    |
| %k    | 24 小时制格式的小时（00-23），参见下面的“注释 4”                                                                                                                                                | 14     |
| %l    | 12 小时制格式的小时（01-12），参见下面的“注释 4”                                                                                                                                                | 09     |
| %m    | 作为整数（01-12）表示的月份                                                                                                                                                                     | 01     |
| %M    | 完整的月份名称（1月-12月），参见下面的“注释 3”                                                                                                                                           | January |
| %n    | 换行符（'')                                                                                                                                                                                  |        |
| %p    | AM 或 PM 的标志                                                                                                                                                                              | PM     |
| %Q    | 季度（1-4）                                                                                                                                                                                 | 1      |
| %r    | 12 小时制 HH:MM AM/PM 时间，相当于 %h:%i %p                                                                                                                                                   | 10:30 PM |
| %R    | 24 小时制 HH:MM 时间，相当于 %H:%i                                                                                                                                                            | 22:33  |
| %s    | 秒（00-59）                                                                                                                                                                                | 44     |
| %S    | 秒（00-59）                                                                                                                                                                                | 44     |
| %t    | 水平制表符（'）                                                                                                                                                                              |        |
| %T    | ISO 8601 时间格式（HH:MM:SS），相当于 %H:%i:%S                                                                                                                                                    | 22:33:44 |
| %u    | ISO 8601 星期几作为数字，周一为 1（1-7）                                                                                                                                                         | 2      |
| %V    | ISO 8601 周号（01-53）                                                                                                                                                                       | 01     |
| %w    | 星期几作为整数表示，周日为 0（0-6）                                                                                                                                                             | 2      |
| %W    | 完整的星期几名称（周一-周日）                                                                                                                                                                   | Monday  |
| %y    | 年，最后两位数字（00-99）                                                                                                                                                                       | 18     |
| %Y    | 年                                                                                                                                                                                          | 2018   |
| %z    | 相对于 UTC 的时间偏移，格式为 +HHMM 或 -HHMM                                                                                                                                                    | -0500  |
| %%    | 一个 % 符号                                                                                                                                                                                   | %      |

注释 1：在 ClickHouse v23.4 之前的版本中，如果格式化值为 Date，Date32 或 DateTime（没有小数秒）或 DateTime64 的精度为 0，则 `%f` 打印单个零（0）。可以通过设置 `formatdatetime_f_prints_single_zero = 1` 恢复以前的行为。

注释 2：在 ClickHouse v25.1 之前的版本中，`%f` 打印的位数由 DateTime64 的小数位数确定，而不是固定的 6 位数。可以通过设置 `formatdatetime_f_prints_scale_number_of_digits= 1` 恢复以前的行为。

注释 3：在 ClickHouse v23.4 之前的版本中，`%M` 打印分钟（00-59）而不是完整的月份名称（1月-12月）。可以通过设置 `formatdatetime_parsedatetime_m_is_month_name = 0` 恢复以前的行为。

注释 4：在 ClickHouse v23.11 之前的版本中，`parseDateTime` 函数要求格式化器 `%c`（月份）和 `%l`/`%k`（小时）有前导零，例如 `07`。在后来的版本中，可以省略前导零，例如 `7`。可以通过设置 `parsedatetime_parse_without_leading_zeros = 0` 恢复以前的行为。请注意，函数 `formatDateTime` 默认仍然为 `%c` 和 `%l`/`%k` 打印前导零，以不破坏现有用例。可以通过设置 `formatdatetime_format_without_leading_zeros = 1` 更改此行为。

注释 5：在 ClickHouse v25.5 之前的版本中，函数 `parseDateTime` 对于格式化器 `%e` 要求单数字天数进行空格填充，例如 ` 3`。在后来的版本中，空间填充是可选的，例如 `3` 和 ` 3` 都可以。要保留以前的行为，请设置 `parsedatetime_e_requires_space_padding = 1`。类似地，函数 `formatDateTime` 中的格式化器 `%e` 之前无条件地进行前导空格填充，而现在可以不带前导空格进行打印。要保留以前的行为，请设置 `formatdatetime_e_with_space_padding = 1`。

**示例**

```sql
SELECT formatDateTime(toDate('2010-01-04'), '%g')
```

结果：

```text
┌─formatDateTime(toDate('2010-01-04'), '%g')─┐
│ 10                                         │
└────────────────────────────────────────────┘
```

```sql
SELECT formatDateTime(toDateTime64('2010-01-04 12:34:56.123456', 7), '%f')
```

结果：

```sql
┌─formatDateTime(toDateTime64('2010-01-04 12:34:56.123456', 7), '%f')─┐
│ 1234560                                                             │
└─────────────────────────────────────────────────────────────────────┘
```

另外，`formatDateTime` 函数可以接受第三个字符串参数，包含时区的名称。例如：`Asia/Istanbul`。在这种情况下，时间将按照指定的时区格式化。

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

**另请参见**

- [formatDateTimeInJodaSyntax](#formatdatetimeinjodasyntax)

## formatDateTimeInJodaSyntax {#formatdatetimeinjodasyntax}

与 formatDateTime 类似，除了以 Joda 风格格式化日期时间，而不是 MySQL 风格。参见 https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html。

该函数的相反操作是 [parseDateTimeInJodaSyntax](/sql-reference/functions/type-conversion-functions#parsedatetimeinjodasyntax)。

**替换字段**

使用替换字段，您可以为结果字符串定义模式。

| 占位符   | 描述                                  | 表现         | 示例                             |
|-------|-------------------------------------|------------|----------------------------------|
| G     | 时代                                  | 文本         | AD                               |
| C     | 时代的世纪（>=0）                     | 数字         | 20                               |
| Y     | 时代的年份（>=0）                     | 年           | 1996                             |
| x     | 周年份（尚不支持）                    | 年           | 1996                             |
| w     | 周年份的周（尚不支持）                 | 数字         | 27                               |
| e     | 星期几                                | 数字         | 2                                |
| E     | 星期几                                | 文本         | Tuesday; Tue                     |
| y     | 年                                   | 年           | 1996                             |
| D     | 年中的天数                            | 数字         | 189                              |
| M     | 年中的月份                            | 月份         | July; Jul; 07                    |
| d     | 当月的天数                           | 数字         | 10                               |
| a     | 半天                               | 文本         | PM                               |
| K     | 半天的小时（0~11）                   | 数字         | 0                                |
| h     | 半天的时钟小时（1~12）                | 数字         | 12                               |
| H     | 一天的小时（0~23）                   | 数字         | 0                                |
| k     | 一天的时钟小时（1~24）                | 数字         | 24                               |
| m     | 小时中的分钟                        | 数字         | 30                               |
| s     | 分钟中的秒                          | 数字         | 55                               |
| S     | 小数秒                             | 数字         | 978                              |
| z     | 时区                               | 文本         | Eastern Standard Time; EST       |
| Z     | 时区偏移                           | 区域         | -0800; -0812                     |
| '     | 文本转义                          | 分隔符       |                                   |
| ''    | 单引号                             | 字面        | '                                |

**示例**

```sql
SELECT formatDateTimeInJodaSyntax(toDateTime('2010-01-04 12:34:56'), 'yyyy-MM-dd HH:mm:ss')
```

结果：

```java
┌─formatDateTimeInJodaSyntax(toDateTime('2010-01-04 12:34:56'), 'yyyy-MM-dd HH:mm:ss')─┐
│ 2010-01-04 12:34:56                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## dateName {#datename}

返回指定的日期部分。

**语法**

```sql
dateName(date_part, date)
```

**参数**

- `date_part` — 日期部分。可能的值：'year'，'quarter'，'month'，'week'，'dayofyear'，'day'，'weekday'，'hour'，'minute'，'second'。 [字符串](../data-types/string.md)。
- `date` — 日期。[日期](../data-types/date.md)， [Date32](../data-types/date32.md)， [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。
- `timezone` — 时区。可选。[字符串](../data-types/string.md)。

**返回值**

- 日期的指定部分。[字符串](/sql-reference/data-types/string)

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

返回月份名称。

**语法**

```sql
monthName(date)
```

**参数**

- `date` — 日期或带时间的日期。[日期](../data-types/date.md)， [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 月份名称。[字符串](/sql-reference/data-types/string)

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

此函数将 Unix 时间戳转换为日历日期和一天的时间。

它可以以两种方式调用：

当给定一个类型为 [整数](../data-types/int-uint.md) 的单个参数时，返回一个类型为 [DateTime](../data-types/datetime.md) 的值，即表现得像是 [toDateTime](../../sql-reference/functions/type-conversion-functions.md#todatetime)。

别名：`FROM_UNIXTIME`。

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

当给定两个或三个参数时，第一个参数是类型为 [整数](../data-types/int-uint.md)、[日期](../data-types/date.md)、[Date32](../data-types/date32.md)、[DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md) 的值，第二个参数是常量格式字符串，第三个参数是一个可选的常量时区字符串，该函数返回一个类型为 [字符串](/sql-reference/data-types/string) 的值，即它的表现像 [formatDateTime](#formatdatetime)。在这种情况下，使用 [MySQL 的日期时间格式样式](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)。

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

与 [fromUnixTimestamp](#fromunixtimestamp) 相同，但当以第二种方式调用（两个或三个参数）时，格式化使用 [Joda 风格](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)，而不是 MySQL 风格。

**示例：**

```sql
SELECT fromUnixTimestampInJodaSyntax(1234334543, 'yyyy-MM-dd HH:mm:ss', 'UTC') AS DateTime;
```

结果：

```text
┌─DateTime────────────┐
│ 2009-02-11 06:42:23 │
└─────────────────────┘
```

## toModifiedJulianDay {#tomodifiedjulianday}

将文本形式的 [先历格里历](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar) 日期 `YYYY-MM-DD` 转换为 Int32 的 [修订过的 Julian Day](https://en.wikipedia.org/wiki/Julian_day#Variants) 数字。此函数支持从 `0000-01-01` 到 `9999-12-31` 的日期。如果参数无法解析为日期，或者该日期无效，则会引发异常。

**语法**

```sql
toModifiedJulianDay(date)
```

**参数**

- `date` — 文本形式的日期。[字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md)。

**返回值**

- 修订过的 Julian Day 数字。[Int32](../data-types/int-uint.md)。

**示例**

```sql
SELECT toModifiedJulianDay('2020-01-01');
```

结果：

```text
┌─toModifiedJulianDay('2020-01-01')─┐
│                             58849 │
└───────────────────────────────────┘
```

## toModifiedJulianDayOrNull {#tomodifiedjuliandayornull}

类似于 [toModifiedJulianDay()](#tomodifiedjulianday)，但不引发异常，而是返回 `NULL`。

**语法**

```sql
toModifiedJulianDayOrNull(date)
```

**参数**

- `date` — 文本形式的日期。[字符串](../data-types/string.md) 或 [固定字符串](../data-types/fixedstring.md)。

**返回值**

- 修订过的 Julian Day 数字。[Nullable(Int32)](../data-types/int-uint.md)。

**示例**

```sql
SELECT toModifiedJulianDayOrNull('2020-01-01');
```

结果：

```text
┌─toModifiedJulianDayOrNull('2020-01-01')─┐
│                                   58849 │
└─────────────────────────────────────────┘
```

## fromModifiedJulianDay {#frommodifiedjulianday}

将 [修订过的 Julian Day](https://en.wikipedia.org/wiki/Julian_day#Variants) 数字转换为文本形式的 [先历格里历](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar) 日期 `YYYY-MM-DD`。此函数支持从 `-678941` 到 `2973483` 的天数（分别对应于 0000-01-01 和 9999-12-31）。如果天数超出支持的范围，则会引发异常。

**语法**

```sql
fromModifiedJulianDay(day)
```

**参数**

- `day` — 修订过的 Julian Day 数字。[任何整型](../data-types/int-uint.md)。

**返回值**

- 文本形式的日期。[字符串](../data-types/string.md)

**示例**

```sql
SELECT fromModifiedJulianDay(58849);
```

结果：

```text
┌─fromModifiedJulianDay(58849)─┐
│ 2020-01-01                   │
└──────────────────────────────┘
```

## fromModifiedJulianDayOrNull {#frommodifiedjuliandayornull}

类似于 [fromModifiedJulianDayOrNull()](#frommodifiedjuliandayornull)，但不引发异常，而是返回 `NULL`。

**语法**

```sql
fromModifiedJulianDayOrNull(day)
```

**参数**

- `day` — 修订过的 Julian Day 数字。[任何整型](../data-types/int-uint.md)。

**返回值**

- 文本形式的日期。[Nullable(String)](../data-types/string.md)

**示例**

```sql
SELECT fromModifiedJulianDayOrNull(58849);
```

结果：

```text
┌─fromModifiedJulianDayOrNull(58849)─┐
│ 2020-01-01                         │
└────────────────────────────────────┘
```

## toUTCTimestamp {#toutctimestamp}

将 DateTime/DateTime64 类型的值从其他时区转换为 UTC 时区的时间戳。此函数主要用于与 Apache Spark 和类似框架的兼容性。

**语法**

```sql
toUTCTimestamp(time_val, time_zone)
```

**参数**

- `time_val` — DateTime/DateTime64 类型的常量值或表达式。[DateTime/DateTime64 类型](../data-types/datetime.md)
- `time_zone` — 字符串类型的常量值或表示时区的表达式。[字符串类型](../data-types/string.md)

**返回值**

- 文本形式的 DateTime/DateTime64

**示例**

```sql
SELECT toUTCTimestamp(toDateTime('2023-03-16'), 'Asia/Shanghai');
```

结果：

```text
┌─toUTCTimestamp(toDateTime('2023-03-16'), 'Asia/Shanghai')┐
│                                     2023-03-15 16:00:00 │
└─────────────────────────────────────────────────────────┘
```

## fromUTCTimestamp {#fromutctimestamp}

将 DateTime/DateTime64 类型的值从 UTC 时区转换为其他时区的时间戳。此函数主要用于与 Apache Spark 和类似框架的兼容性。

**语法**

```sql
fromUTCTimestamp(time_val, time_zone)
```

**参数**

- `time_val` — DateTime/DateTime64 类型的常量值或表达式。[DateTime/DateTime64 类型](../data-types/datetime.md)
- `time_zone` — 字符串类型的常量值或表示时区的表达式。[字符串类型](../data-types/string.md)

**返回值**

- 文本形式的 DateTime/DateTime64

**示例**

```sql
SELECT fromUTCTimestamp(toDateTime64('2023-03-16 10:00:00', 3), 'Asia/Shanghai');
```

结果：

```text
┌─fromUTCTimestamp(toDateTime64('2023-03-16 10:00:00',3), 'Asia/Shanghai')─┐
│                                                 2023-03-16 18:00:00.000 │
└─────────────────────────────────────────────────────────────────────────┘
```

## UTCTimestamp {#utctimestamp}

返回查询分析时的当前日期和时间。该函数是常量表达式。

:::note
此函数提供的结果与 `now('UTC')` 相同。它仅为了支持 MySQL 而添加，而 [`now`](#now) 是首选用法。
:::

**语法**

```sql
UTCTimestamp()
```

别名：`UTC_timestamp`。

**返回值**

- 返回查询分析时的当前日期和时间。[DateTime](../data-types/datetime.md)。

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

返回两个日期或日期时间值之间的差值。差值以秒为单位计算。它与 `dateDiff` 相同，仅用于支持 MySQL。`dateDiff` 更受欢迎。

**语法**

```sql
timeDiff(first_datetime, second_datetime)
```

**参数**

- `first_datetime` — DateTime/DateTime64 类型的常量值或表达式。[DateTime/DateTime64 类型](../data-types/datetime.md)
- `second_datetime` — DateTime/DateTime64 类型的常量值或表达式。[DateTime/DateTime64 类型](../data-types/datetime.md)

**返回值**

两个日期或日期时间值之间的差值（以秒为单位）。

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

## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
