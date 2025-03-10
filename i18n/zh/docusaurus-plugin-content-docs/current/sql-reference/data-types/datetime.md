---
slug: /sql-reference/data-types/datetime
sidebar_position: 16
sidebar_label: DateTime
---


# DateTime

允许存储一个时间点，可以表示为一个日历日期和一天中的时间。

语法：

``` sql
DateTime([timezone])
```

支持的值范围：\[1970-01-01 00:00:00, 2106-02-07 06:28:15\]。

解析度：1 秒。

## Speed {#speed}

在_大多数_情况下，`Date` 数据类型比 `DateTime` 更快。

`Date` 类型需要 2 字节的存储，而 `DateTime` 需要 4 字节。然而，当数据库对数据进行压缩时，这种差异会被放大。这种放大是因为 `DateTime` 中的分钟和秒数不易压缩。过滤和聚合 `Date` 而不是 `DateTime` 的速度也更快。

## Usage Remarks {#usage-remarks}

时间点以 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time) 的形式保存，无论时区或夏令时如何。时区影响 `DateTime` 类型值以文本格式显示的方式，以及以字符串指定的值的解析方式（例如：`'2020-01-01 05:00:01'`）。

时间戳以时区无关的方式存储在表中，时区用于在数据导入/导出期间将其转换为文本格式或反向转换，或用于对值进行日历计算（例如：`toDate`、`toHour` 函数等）。时区不会存储在表的行中（或结果集中），而是存储在列元数据中。

支持的时区列表可以在 [IANA 时区数据库](https://www.iana.org/time-zones) 中找到，也可以通过 `SELECT * FROM system.time_zones` 查询。 [该列表](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 也可以在维基百科找到。

创建表时，您可以显式设置 `DateTime` 类型列的时区。例如：`DateTime('UTC')`。如果未设置时区，ClickHouse 将使用 ClickHouse 服务器启动时服务器设置中 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) 参数的值或操作系统设置中的值。

如果在初始化数据类型时未显式设置时区， [clickhouse-client](../../interfaces/cli.md) 将默认应用服务器时区。要使用客户端时区，请在运行 `clickhouse-client` 时添加 `--use_client_time_zone` 参数。

ClickHouse 输出值取决于 [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 设置的值。默认情况下为 `YYYY-MM-DD hh:mm:ss` 文本格式。此外，您可以使用 [formatDateTime](../../sql-reference/functions/date-time-functions.md#formatdatetime) 函数更改输出。

在将数据插入 ClickHouse 时，您可以根据 [date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 设置的值使用不同格式的日期和时间字符串。

## Examples {#examples}

**1.** 创建一个包含 `DateTime` 类型列的表并向其中插入数据：

``` sql
CREATE TABLE dt
(
    `timestamp` DateTime('Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- 解析 DateTime
-- - 从字符串中，
-- - 从被解释为自 1970-01-01 的秒数的整数中。
INSERT INTO dt VALUES ('2019-01-01 00:00:00', 1), (1546300800, 3);

SELECT * FROM dt;
```

``` text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        2 │
│ 2019-01-01 03:00:00 │        1 │
└─────────────────────┴──────────┘
```

- 将 datetime 作为整数插入时，它被视为 Unix 时间戳（UTC）。 `1546300800` 代表 `‘2019-01-01 00:00:00’` UTC。然而，由于 `timestamp` 列已指定了 `Asia/Istanbul`（UTC+3）时区，因此输出为字符串时，该值将显示为 `‘2019-01-01 03:00:00’`。
- 将字符串值作为 datetime 插入时，它被视为在列时区中。`‘2019-01-01 00:00:00’` 将被视为在 `Asia/Istanbul` 时区中，并保存为 `1546290000`。

**2.** 对 `DateTime` 值进行过滤

``` sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

``` text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime` 列值可以使用 `WHERE` 谓词中的字符串值进行过滤。它将自动转换为 `DateTime`：

``` sql
SELECT * FROM dt WHERE timestamp = '2019-01-01 00:00:00'
```

``` text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

**3.** 获取 `DateTime` 类型列的时区：

``` sql
SELECT toDateTime(now(), 'Asia/Istanbul') AS column, toTypeName(column) AS x
```

``` text
┌──────────────column─┬─x─────────────────────────┐
│ 2019-10-16 04:12:04 │ DateTime('Asia/Istanbul') │
└─────────────────────┴───────────────────────────┘
```

**4.** 时区转换

``` sql
SELECT
toDateTime(timestamp, 'Europe/London') as lon_time,
toDateTime(timestamp, 'Asia/Istanbul') as mos_time
FROM dt
```

``` text
┌───────────lon_time──┬────────────mos_time─┐
│ 2019-01-01 00:00:00 │ 2019-01-01 03:00:00 │
│ 2018-12-31 21:00:00 │ 2019-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```

由于时区转换仅更改元数据，该操作没有计算成本。


## Limitations on time zones support {#limitations-on-time-zones-support}

某些时区可能无法完全支持。存在以下几种情况：

如果与 UTC 的偏移量不是 15 分钟的倍数，则小时和分钟的计算可能不正确。例如，利比里亚蒙罗维亚的时区在 1972 年 1 月 7 日之前偏移 UTC -0:44:30。如果您在蒙罗维亚时区进行历史时间的计算，则时间处理函数可能会给出错误的结果。然而，在 1972 年 1 月 7 日之后的结果将是正确的。

如果由于夏令时或其他原因在非 15 分钟的时间点进行时间转换，您也可能会在特定日期获得不正确的结果。

非单调日历日期。例如，在哈皮峡谷 - 瓦尔哈拉，时间在 2010 年 11 月 7 日 00:01:00（午夜后一分钟）向后转换一个小时。因此，在 11 月 6 日结束后，人们观察到了 11 月 7 日的整整一分钟，然后时间被更改为 11 月 6 日 23:01，经过另一个 59 分钟再开始 11 月 7 日。ClickHouse 尚不支持这种情况。在这些日子里，时间处理函数的结果可能会略有不正确。

类似的问题存在于 2010 年的凯西南极站。他们在 3 月 5 日 02:00 将时间向后调整了三个小时。如果您在南极站工作，请不要害怕使用 ClickHouse。只需确保将时区设置为 UTC 或意识到不准确性即可。

多天的时间偏移。一些太平洋岛屿将其时区偏移从 UTC+14 更改为 UTC-12。这很好，但在转换日期的历史时间点进行计算时可能会出现一些不准确性。

## Handling Daylight Saving Time (DST) {#handling-daylight-saving-time-dst}

ClickHouse 的带时区的 DateTime 类型在夏令时（DST）过渡期间可能会表现出意外行为，尤其是当：

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) 设置为 `simple`。
- 时钟向后移动（“秋退”），导致一小时重叠。
- 时钟向前移动（“春进”），导致一小时缺口。

默认情况下，ClickHouse 始终选择重叠时间的早期出现，并可能在向前移动时解释不存在的时间。

例如，考虑从夏令时（DST）到标准时间的过渡。

- 在 2023 年 10 月 29 日，02:00:00，时钟向后移动到 01:00:00（BST → GMT）。
- 01:00:00 – 01:59:59 这一小时出现两次（一次在 BST 中，一次在 GMT 中）。
- ClickHouse 始终选择第一次出现（BST），在添加时间间隔时导致意外结果。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同样，在从标准时间到夏令时的过渡期间，会出现一小时的跳过情况。

例如：

- 在 2023 年 3 月 26 日，`00:59:59`，时钟向前跳到 02:00:00（GMT → BST）。
- 01:00:00 – 01:59:59 这一小时不存在。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

在这种情况下，ClickHouse 将不存在的时间 `2023-03-26 01:30:00` 向回调整为 `2023-03-26 00:30:00`。

## See Also {#see-also}

- [类型转换函数](../../sql-reference/functions/type-conversion-functions.md)
- [日期和时间处理函数](../../sql-reference/functions/date-time-functions.md)
- [处理数组的函数](../../sql-reference/functions/array-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 设置](../../operations/settings/settings-formats.md#session_timezone)
- [处理日期和时间的运算符](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`Date` 数据类型](../../sql-reference/data-types/date.md)
