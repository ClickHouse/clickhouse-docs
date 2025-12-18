---
description: '关于 ClickHouse 中 DateTime 数据类型的文档，用于存储秒级精度的时间戳'
sidebar_label: 'DateTime'
sidebar_position: 16
slug: /sql-reference/data-types/datetime
title: 'DateTime'
doc_type: 'reference'
---

# DateTime {#datetime}

用于存储某一时刻，该时刻可以表示为日历日期和一天中的时间。

语法：

```sql
DateTime([timezone])
```

支持的取值范围：[1970-01-01 00:00:00, 2106-02-07 06:28:15]。

时间精度：1 秒。

## 速度 {#speed}

在 _大多数_ 情况下，`Date` 数据类型比 `DateTime` 更快。

`Date` 类型只需要 2 字节存储，而 `DateTime` 需要 4 字节。不过，在压缩时，`Date` 和 `DateTime` 之间的大小差异会变得更为显著。这种差异被放大是因为 `DateTime` 中的分钟和秒不如日期部分易于压缩。对 `Date` 而不是 `DateTime` 进行过滤和聚合也会更快。

## 使用说明 {#usage-remarks}

时间点一律以[Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time)的形式存储，与时区或夏令时无关。时区会影响 `DateTime` 类型值在文本格式中的显示方式，以及以字符串形式指定的值（如 `2020-01-01 05:00:01`）的解析方式。

与时区无关的 Unix 时间戳会被存储在表中，而时区则用于在数据导入/导出期间将其与文本格式互相转换，或者用于对这些值进行日历计算（例如：`toDate`、`toHour` 函数等）。时区不会存储在表的行中（或结果集中），而是存储在列的元数据中。

支持的时区列表可以在 [IANA Time Zone Database](https://www.iana.org/time-zones) 中找到，也可以通过 `SELECT * FROM system.time_zones` 查询。[该列表](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 也可以在 Wikipedia 上查看。

在创建表时，可以为 `DateTime` 类型的列显式设置时区。例如：`DateTime('UTC')`。如果未设置时区，ClickHouse 会使用服务器设置中 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) 参数的值，或者 ClickHouse 服务器启动时操作系统中的时区设置。

如果在初始化数据类型时没有显式设置时区，[clickhouse-client](../../interfaces/cli.md) 会默认应用服务器时区。要使用客户端时区，请在运行 `clickhouse-client` 时加上 `--use_client_time_zone` 参数。

ClickHouse 会根据 [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 设置的值输出时间值。默认的文本格式为 `YYYY-MM-DD hh:mm:ss`。此外，还可以使用 [formatDateTime](../../sql-reference/functions/date-time-functions.md#formatDateTime) 函数更改输出格式。

向 ClickHouse 插入数据时，可以使用不同格式的日期和时间字符串，具体取决于 [date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 设置的值。

## 示例 {#examples}

**1.** 创建一个包含 `DateTime` 类型列的表，并向其中插入数据：

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

* 将整数插入到 `DateTime` 列时，会被视为 Unix 时间戳（UTC）。`1546300800` 表示 UTC 时间 `'2019-01-01 00:00:00'`。但是，由于 `timestamp` 列指定了 `Asia/Istanbul`（UTC+3）时区，在以字符串形式输出时，该值会显示为 `'2019-01-01 03:00:00'`。
* 将字符串值插入到 `DateTime` 列时，会被视为处于该列的时区内。`'2019-01-01 00:00:00'` 会被视为 `Asia/Istanbul` 时区的时间，并以 `1546290000` 存储。

**2.** 基于 `DateTime` 值进行过滤

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

可以在 `WHERE` 子句中使用字符串值来过滤 `DateTime` 列的值。该字符串会被自动转换为 `DateTime` 类型：

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

由于时区转换只会更改元数据，因此该操作不会产生计算开销。

## 对时区支持的限制 {#limitations-on-time-zones-support}

部分时区可能无法得到完全支持，主要存在以下几种情况：

如果与 UTC 的偏移量不是 15 分钟的整数倍，则小时和分钟的计算可能不正确。比如，利比里亚蒙罗维亚的时区在 1972 年 1 月 7 日之前的偏移量是 UTC -0:44:30。如果你对蒙罗维亚的历史时间进行计算，时间处理函数可能会返回错误结果。不过，在 1972 年 1 月 7 日之后的结果则是正确的。

如果时间转换（由于夏令时或其他原因）发生在某个不是 15 分钟整数倍的时间点上，那么在这一天的这一特定时刻，你同样可能得到不正确的结果。

非单调的日历日期。例如，在 Happy Valley - Goose Bay，当地时间在 2010 年 11 月 7 日 00:01:00（午夜过后一分钟）向后拨回了一小时。因此，在 11 月 6 日结束后，人们先经历了完整的一分钟 11 月 7 日时间，随后时间又被拨回到 11 月 6 日 23:01，再过 59 分钟之后，11 月 7 日又重新开始。ClickHouse 目前尚不支持这种“有趣”的情况。在这些日期内，时间处理函数的结果可能会略有偏差。

类似的问题也出现在 2010 年的 Casey 南极站。他们在 3 月 5 日 02:00 将时间往回拨了三小时。如果你在南极站工作，请放心使用 ClickHouse。只要确保将时区设置为 UTC，或者清楚了解可能存在的误差即可。

跨多天的时间偏移。一些太平洋岛屿将其时区偏移从 UTC+14 改为 UTC-12。这本身没有问题，但如果你在处理这些地区时区的历史时间点，且时间恰好处在转换日期附近，可能会出现一定的不准确。

## 处理夏令时（DST） {#handling-daylight-saving-time-dst}

ClickHouse 的带时区 `DateTime` 类型在夏令时（DST）切换期间可能会表现出意外行为，特别是在以下情况：

* [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) 被设置为 `simple`。
* 时钟被向后拨（“Fall Back”），导致出现一小时的重叠时间。
* 时钟被向前拨（“Spring Forward”），导致出现一小时的时间缺口。

默认情况下，ClickHouse 始终选择重叠时间中较早的一次，并且在向前拨时可能会将本不应存在的时间解释为有效时间。

例如，考虑以下从夏令时切换到标准时间的场景。

* 在 2023 年 10 月 29 日 02:00:00，时钟被向后拨到 01:00:00（BST → GMT）。
* 01:00:00 – 01:59:59 这一小时会出现两次（一次在 BST，一次在 GMT）。
* ClickHouse 始终选择第一次出现的时间（BST），在增加时间间隔时会导致意外结果。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

类似地，在从标准时间切换到夏令时的过程中，看起来会“跳过”一个小时。

例如：

* 在 2023 年 3 月 26 日 `00:59:59` 时，时钟会向前跳到 02:00:00（GMT → BST）。
* 时间段 `01:00:00` – `01:59:59` 实际上不存在。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

在这种情况下，ClickHouse 会将不存在的时间 `2023-03-26 01:30:00` 调整为 `2023-03-26 00:30:00`。

## 另请参阅 {#see-also}

- [类型转换函数](../../sql-reference/functions/type-conversion-functions.md)
- [日期和时间函数](../../sql-reference/functions/date-time-functions.md)
- [数组函数](../../sql-reference/functions/array-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
- [日期和时间运算符](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`Date` 数据类型](../../sql-reference/data-types/date.md)
