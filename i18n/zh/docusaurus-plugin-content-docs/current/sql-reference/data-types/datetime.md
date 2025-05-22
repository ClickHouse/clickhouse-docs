
# DateTime

允许存储一个时间点，可以表示为一个日历日期和一天的时间。

语法：

```sql
DateTime([timezone])
```

支持的值范围： \[1970-01-01 00:00:00, 2106-02-07 06:28:15\]。

分辨率：1 秒。

## Speed {#speed}

在 _大多数_ 情况下，`Date` 数据类型比 `DateTime` 更快。

`Date` 类型需要 2 字节的存储，而 `DateTime` 需要 4 字节。然而，当数据库进行压缩时，这种差异会被放大。这种放大的原因是 `DateTime` 中的分钟和秒数的压缩率较低。使用 `Date` 而不是 `DateTime` 进行过滤和聚合也更快。

## Usage Remarks {#usage-remarks}

时间点被保存为 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time)，无论时区或夏令时如何。时区会影响 `DateTime` 类型值以文本格式显示的方式以及作为字符串指定的值的解析方式（例如： '2020-01-01 05:00:01'）。

与时区无关的 Unix 时间戳存储在表中，而时区用于在数据导入/导出时将其转换为文本格式或反向转换，或者对值进行日历计算（例如： `toDate`、 `toHour` 函数等）。时区不存储在表的行中（或结果集中），而是存储在列的元数据中。

支持的时区列表可以在 [IANA 时区数据库](https://www.iana.org/time-zones) 中找到，也可以通过 `SELECT * FROM system.time_zones` 查询。 [该列表](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 也可在维基百科上找到。

创建表时，您可以显式为 `DateTime` 类型的列设置时区。例如： `DateTime('UTC')`。如果未设置时区，ClickHouse 使用服务器设置中 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) 参数的值或 ClickHouse 服务器启动时的操作系统设置。

如果在初始化数据类型时未显式设置时区， [clickhouse-client](../../interfaces/cli.md) 默认应用服务器时区。要使用客户端时区，请使用 `--use_client_time_zone` 参数启动 `clickhouse-client`。

ClickHouse 根据 [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 设置的值输出值。默认情况下文本格式为 `YYYY-MM-DD hh:mm:ss`。此外，您还可以使用 [formatDateTime](../../sql-reference/functions/date-time-functions.md#formatdatetime) 函数更改输出。

在将数据插入 ClickHouse 时，可以根据 [date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 设置的值使用不同格式的日期和时间字符串。

## Examples {#examples}

**1.** 创建一个包含 `DateTime` 类型列的表并向其中插入数据：

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
INSERT INTO dt VALUES ('2019-01-01 00:00:00', 1), (1546300800, 3);

SELECT * FROM dt;
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        2 │
│ 2019-01-01 03:00:00 │        1 │
└─────────────────────┴──────────┘
```

- 当将 datetime 作为整数插入时，它被视为 Unix 时间戳（UTC）。 `1546300800` 代表 `'2019-01-01 00:00:00'` UTC。然而，由于 `timestamp` 列指定了 `Asia/Istanbul` (UTC+3) 时区，因此以字符串输出时，该值将显示为 `'2019-01-01 03:00:00'`
- 当将字符串值插入为 datetime 时，它被视为在列时区内。 `'2019-01-01 00:00:00'` 将被视为在 `Asia/Istanbul` 时区内，并保存为 `1546290000`。

**2.** 按 `DateTime` 值过滤

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime` 列值可以使用 `WHERE` 谓词中的字符串值进行过滤。它将自动转换为 `DateTime`：

```sql
SELECT * FROM dt WHERE timestamp = '2019-01-01 00:00:00'
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

**3.** 获取 `DateTime` 类型列的时区：

```sql
SELECT toDateTime(now(), 'Asia/Istanbul') AS column, toTypeName(column) AS x
```

```text
┌──────────────column─┬─x─────────────────────────┐
│ 2019-10-16 04:12:04 │ DateTime('Asia/Istanbul') │
└─────────────────────┴───────────────────────────┘
```

**4.** 时区转换

```sql
SELECT
toDateTime(timestamp, 'Europe/London') as lon_time,
toDateTime(timestamp, 'Asia/Istanbul') as mos_time
FROM dt
```

```text
┌───────────lon_time──┬────────────mos_time─┐
│ 2019-01-01 00:00:00 │ 2019-01-01 03:00:00 │
│ 2018-12-31 21:00:00 │ 2019-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```

由于时区转换只改变元数据，因此该操作没有计算成本。

## Limitations on time zones support {#limitations-on-time-zones-support}

某些时区可能并未完全支持。有几种情况：

如果与 UTC 的偏移量不是 15 分钟的倍数，那么小时和分钟的计算可能不正确。例如，利比里亚的蒙罗维亚时区在 1972 年 1 月 7 日之前的偏移为 UTC -0:44:30。如果您在蒙罗维亚时区对历史时间进行计算，时间处理函数可能会返回不正确的结果。然而，1972 年 1 月 7 日之后的结果仍然是正确的。

如果由于夏令时或其他原因在某个不为 15 分钟的倍数的时间点进行的时间转换，您也可能在特定日子中得到不正确的结果。

非单调的日历日期。例如，在 Happy Valley - Goose Bay，时间在 2010 年 11 月 7 日的 00:01:00 时向后调整了一小时（午夜后的一分钟）。因此，在 11 月 6 日结束后，人们观察到整整一分钟的 11 月 7 日，然后时间被改回 11 月 6 日的 23:01，经过另外 59 分钟后，11 月 7 日又开始了。 ClickHouse 尚不支持这种情况。在这些日子里，时间处理函数的结果可能稍有不正确。

在 2010 年，Casey 南极站也存在类似问题。他们在 3 月 5 日的 02:00 将时间调整了三个小时。如果您在南极站工作，请不用担心使用 ClickHouse。只需确保将时区设置为 UTC 或意识到不精确性。

多天的时间变化。一些太平洋岛屿将其时区偏移从 UTC+14 改为 UTC-12。这没问题，但在转换日的历史时间点进行计算时，可能会出现一些不准确的问题。

## Handling Daylight Saving Time (DST) {#handling-daylight-saving-time-dst}

ClickHouse 的 DateTime 类型与时区在夏令时 (DST) 过渡期间可能会出现意外行为，特别是在以下情况下：

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) 设置为 `simple`。
- 时钟向回移动（“退回”），导致一个小时的重叠。
- 时钟向前移动（“春前”），导致一个小时的间隙。

默认情况下，ClickHouse 始终选择重叠时间的最早发生，可能会在向前偏移时解释不存在的时间。

例如，考虑以下从夏令时 (DST) 到标准时间的过渡。

- 在 2023 年 10 月 29 日 02:00:00，时钟向后移动至 01:00:00（BST → GMT）。
- 01:00:00 – 01:59:59 这一小时出现两次（一次在 BST 中，一次在 GMT 中）
- ClickHouse 始终选择第一次出现（BST），导致加时间间隔时产生意外结果。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同样，在从标准时间到夏令时的过渡期间，某些小时可能会被跳过。

例如：

- 在 2023 年 3 月 26 日的 `00:59:59`，时钟跳跃至 02:00:00（GMT → BST）。
- 这一小时 `01:00:00` – `01:59:59` 不存在。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

在这种情况下，ClickHouse 将不存在的时间 `2023-03-26 01:30:00` 向后调整为 `2023-03-26 00:30:00`。

## See Also {#see-also}

- [类型转换函数](../../sql-reference/functions/type-conversion-functions.md)
- [用于处理日期和时间的函数](../../sql-reference/functions/date-time-functions.md)
- [用于处理数组的函数](../../sql-reference/functions/array-functions.md)
- [date_time_input_format 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [date_time_output_format 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [timezone 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [session_timezone 设置](../../operations/settings/settings.md#session_timezone)
- [用于处理日期和时间的运算符](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [Date 数据类型](../../sql-reference/data-types/date.md)
