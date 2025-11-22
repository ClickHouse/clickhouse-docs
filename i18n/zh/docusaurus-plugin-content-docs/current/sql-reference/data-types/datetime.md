---
description: 'ClickHouse 中 DateTime 数据类型的说明文档，用于存储秒级精度的时间戳'
sidebar_label: 'DateTime'
sidebar_position: 16
slug: /sql-reference/data-types/datetime
title: 'DateTime'
doc_type: 'reference'
---



# DateTime

用于存储时间点，该时间点可以表示为日历日期和一天中的具体时间。

语法：

```sql
DateTime([timezone])
```

支持的数值范围：[1970-01-01 00:00:00, 2106-02-07 06:28:15]。

精度：1秒。


## 速度 {#speed}

在_大多数_情况下，`Date` 数据类型比 `DateTime` 更快。

`Date` 类型需要 2 字节的存储空间，而 `DateTime` 需要 4 字节。然而，在压缩过程中，Date 和 DateTime 之间的大小差异会变得更加显著。这种放大是由于 `DateTime` 中的分钟和秒部分的可压缩性较低。使用 `Date` 而非 `DateTime` 进行过滤和聚合操作也更快。


## 使用说明 {#usage-remarks}

时间点以 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time)形式保存,不受时区或夏令时影响。时区会影响 `DateTime` 类型值以文本格式显示的方式,以及字符串形式指定的值的解析方式(如 '2020-01-01 05:00:01')。

与时区无关的 Unix 时间戳存储在表中,时区用于在数据导入/导出期间将其转换为文本格式或进行反向转换,或对值进行日历计算(例如:`toDate`、`toHour` 等函数)。时区不存储在表的行中(或结果集中),而是存储在列元数据中。

支持的时区列表可在 [IANA 时区数据库](https://www.iana.org/time-zones)中查找,也可以通过 `SELECT * FROM system.time_zones` 查询获取。[该列表](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)也可在 Wikipedia 上查看。

创建表时,可以为 `DateTime` 类型列显式设置时区。示例:`DateTime('UTC')`。如果未设置时区,ClickHouse 将使用服务器配置中的 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) 参数值,或 ClickHouse 服务器启动时的操作系统设置。

如果在初始化数据类型时未显式设置时区,[clickhouse-client](../../interfaces/cli.md) 默认使用服务器时区。要使用客户端时区,请使用 `--use_client_time_zone` 参数运行 `clickhouse-client`。

ClickHouse 根据 [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 设置的值输出值。默认使用 `YYYY-MM-DD hh:mm:ss` 文本格式。此外,可以使用 [formatDateTime](../../sql-reference/functions/date-time-functions.md#formatDateTime) 函数更改输出格式。

向 ClickHouse 插入数据时,可以根据 [date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 设置的值使用不同格式的日期和时间字符串。


## 示例 {#examples}

**1.** 创建一个包含 `DateTime` 类型列的表并插入数据：

```sql
CREATE TABLE dt
(
    `timestamp` DateTime('Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- 解析 DateTime
-- - 从字符串解析，
-- - 从整数解析（解释为自 1970-01-01 以来的秒数）。
INSERT INTO dt VALUES ('2019-01-01 00:00:00', 1), (1546300800, 2);

SELECT * FROM dt;
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
│ 2019-01-01 03:00:00 │        2 │
└─────────────────────┴──────────┘
```

- 当以整数形式插入日期时间时,它会被视为 Unix 时间戳(UTC)。`1546300800` 表示 UTC 时间 `'2019-01-01 00:00:00'`。但是,由于 `timestamp` 列指定了 `Asia/Istanbul`(UTC+3)时区,因此以字符串形式输出时,该值将显示为 `'2019-01-01 03:00:00'`
- 当以字符串值形式插入日期时间时,它会被视为列所在的时区。`'2019-01-01 00:00:00'` 将被视为 `Asia/Istanbul` 时区,并保存为 `1546290000`。

**2.** 对 `DateTime` 值进行过滤

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

可以在 `WHERE` 谓词中使用字符串值对 `DateTime` 列值进行过滤。字符串值将自动转换为 `DateTime`：

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

由于时区转换仅更改元数据,因此该操作无需计算开销。


## 时区支持的限制 {#limitations-on-time-zones-support}

某些时区可能无法完全支持。存在以下几种情况:

如果与 UTC 的偏移量不是 15 分钟的倍数,小时和分钟的计算可能不正确。例如,利比里亚蒙罗维亚的时区在 1972 年 1 月 7 日之前的偏移量为 UTC -0:44:30。如果您对蒙罗维亚时区的历史时间进行计算,时间处理函数可能会给出不正确的结果。不过,1972 年 1 月 7 日之后的结果将是正确的。

如果时间转换(由于夏令时或其他原因)发生在不是 15 分钟倍数的时间点,您也可能在该特定日期获得不正确的结果。

非单调的日历日期。例如,在 Happy Valley - Goose Bay,时间在 2010 年 11 月 7 日 00:01:00(午夜后一分钟)向后调整了一小时。因此,在 11 月 6 日结束后,人们经历了整整一分钟的 11 月 7 日,然后时间被调回到 11 月 6 日 23:01,再过 59 分钟后 11 月 7 日才重新开始。ClickHouse(目前)尚不支持这种情况。在这些日期期间,时间处理函数的结果可能会略有不准确。

Casey 南极站在 2010 年也存在类似问题。他们在 3 月 5 日 02:00 将时间向后调整了三小时。如果您在南极站工作,请不必担心使用 ClickHouse。只需确保将时区设置为 UTC 或注意可能存在的不准确性即可。

跨越多天的时间转换。一些太平洋岛屿将其时区偏移量从 UTC+14 更改为 UTC-12。这本身没有问题,但如果您使用其时区对转换日期的历史时间点进行计算,可能会出现一些不准确性。


## 处理夏令时 (DST) {#handling-daylight-saving-time-dst}

ClickHouse 的带时区 DateTime 类型在夏令时 (DST) 转换期间可能会出现意外行为,特别是在以下情况下:

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) 设置为 `simple`。
- 时钟向后调整("秋季回拨"),导致一小时重叠。
- 时钟向前调整("春季前拨"),导致一小时间隙。

默认情况下,ClickHouse 总是选择重叠时间中较早的那次出现,并可能在向前调整期间解释不存在的时间。

例如,考虑以下从夏令时 (DST) 到标准时间的转换。

- 在 2023 年 10 月 29 日 02:00:00,时钟向后调整到 01:00:00 (BST → GMT)。
- 01:00:00 – 01:59:59 这一小时出现两次(一次在 BST 中,一次在 GMT 中)
- ClickHouse 总是选择第一次出现 (BST),在添加时间间隔时会导致意外结果。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同样,在从标准时间转换到夏令时期间,可能会出现跳过一小时的情况。

例如:

- 在 2023 年 3 月 26 日 `00:59:59`,时钟向前跳转到 02:00:00 (GMT → BST)。
- `01:00:00` – `01:59:59` 这一小时不存在。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

在这种情况下,ClickHouse 将不存在的时间 `2023-03-26 01:30:00` 向后调整到 `2023-03-26 00:30:00`。


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
