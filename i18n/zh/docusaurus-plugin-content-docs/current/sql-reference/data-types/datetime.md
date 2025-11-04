---
'description': 'ClickHouse中DateTime数据类型的文档，存储具有秒级精度的时间戳'
'sidebar_label': 'DateTime'
'sidebar_position': 16
'slug': '/sql-reference/data-types/datetime'
'title': 'DateTime'
'doc_type': 'reference'
---


# DateTime

允许存储一个瞬间，该瞬间可以表示为日历日期和一天中的时间。

语法：

```sql
DateTime([timezone])
```

支持的值范围：\[1970-01-01 00:00:00, 2106-02-07 06:28:15\]。

分辨率：1 秒。

## Speed {#speed}

在 _大多数_ 情况下，`Date` 数据类型比 `DateTime` 更快。

`Date` 类型需要 2 字节的存储，而 `DateTime` 需要 4 字节。然而，在压缩过程中，Date 和 DateTime 之间的大小差异变得更加显著。这种放大是因为 `DateTime` 中的分钟和秒更难压缩。对 `Date` 进行过滤和聚合也比对 `DateTime` 更快。

## Usage Remarks {#usage-remarks}

时间点作为 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time) 存储，不考虑时区或夏令时。时区影响 `DateTime` 类型的值在文本格式中的显示方式，以及作为字符串指定的值如何解析（例如：'2020-01-01 05:00:01'）。

时间无关的 Unix 时间戳存储在表中，时区用于在数据导入/导出或在值上进行日历计算时将其转换为文本格式或反向转换（示例：`toDate`，`toHour` 函数等）。时区不存储在表的行中（或结果集中），而是存储在列元数据中。

支持的时区列表可以在 [IANA 时区数据库](https://www.iana.org/time-zones) 中找到，也可以通过 `SELECT * FROM system.time_zones` 查询得到。[该列表](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 在维基百科上也可以找到。

在创建表时，可以显式设置 `DateTime` 类型列的时区。例如：`DateTime('UTC')`。如果未设置时区，ClickHouse 使用 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) 参数的值，或者在 ClickHouse 服务器启动时使用操作系统设置的值。

如果在初始化数据类型时未显式设置时区，则 [clickhouse-client](../../interfaces/cli.md) 默认应用服务器时区。要使用客户端时区，请在运行 `clickhouse-client` 时加上 `--use_client_time_zone` 参数。

ClickHouse 根据 [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 设置输出值。默认文本格式为 `YYYY-MM-DD hh:mm:ss`。此外，您还可以通过 [formatDateTime](../../sql-reference/functions/date-time-functions.md#formatDateTime) 函数更改输出格式。

在向 ClickHouse 插入数据时，您可以根据 [date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 设置的值使用不同格式的日期和时间字符串。

## Examples {#examples}

**1.** 创建一个带有 `DateTime` 类型列的表并向其中插入数据：

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

- 当以整数插入日期时间时，它被视为 Unix 时间戳 (UTC)。 `1546300800` 代表 `'2019-01-01 00:00:00'` UTC。然而，由于 `timestamp` 列具有指定的 `Asia/Istanbul` (UTC+3) 时区，因此以字符串输出时，该值将显示为 `'2019-01-01 03:00:00'`。
- 当将字符串值插入为日期时间时，它被视为列时区内的值。`'2019-01-01 00:00:00'` 将被视为处于 `Asia/Istanbul` 时区并保存为 `1546290000`。

**2.** 基于 `DateTime` 值进行过滤

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime` 列的值可以使用 `WHERE` 谓词中的字符串值进行过滤。它将自动转换为 `DateTime`：

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

由于时区转换仅更改元数据，因此该操作没有计算成本。

## Limitations on time zones support {#limitations-on-time-zones-support}

有些时区可能不完全支持。以下是几种情况：

如果与 UTC 的偏移量不是 15 分钟的倍数，则小时和分钟的计算可能不正确。例如，利比里亚的蒙罗维亚在 1972 年 1 月 7 日之前的时区偏移为 UTC -0:44:30。如果您在蒙罗维亚时区对历史时间进行计算，时间处理函数可能会给出不正确的结果。然而，1972 年 1 月 7 日之后的结果将是正确的。

如果时间转换（由于夏令时或其他原因）在不是 15 分钟倍数的时间点进行，您在该特定日子也可能会得到不正确的结果。

非单调的日历日期。例如，在快乐谷 - 鳕鱼湾，时间在 2010 年 11 月 7 日 00:01:00 向后转了一小时（午夜后一分钟）。因此，在 11 月 6 日结束后，人们目睹了 11 月 7 日整整一分钟，然后时间回到 11 月 6 日 23:01，在再过 59 分钟后，11 月 7 日再次开始。ClickHouse 目前不支持这种情况。在这些日子里，时间处理函数的结果可能会略有不正确。

类似的问题出现在 2010 年的凯西南极站。他们在 3 月 5 日 02:00 时将时间回拨了三个小时。如果您在南极站工作，请不要害怕使用 ClickHouse。只需确保将时区设置为 UTC 或了解不准确之处。

多天的时间偏移。一些太平洋岛屿将其时区偏移从 UTC+14 更改为 UTC-12。这没问题，但在转换日期的历史时间点计算时，可能会出现一些不准确的情况。

## Handling daylight saving time (DST) {#handling-daylight-saving-time-dst}

ClickHouse 的 DateTime 类型与时区在夏令时 (DST) 转换期间可能会表现出意外行为，特别是在以下情况下：

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) 设置为 `simple`。
- 时钟向后移动（“调回”），造成一小时重叠。
- 时钟向前移动（“调前”），造成一小时间隔。

默认情况下，ClickHouse 始终选择重叠时间的较早发生，可能会在向前移动时解释不存在的时间。

例如，考虑从夏令时 (DST) 转换到标准时间的以下情况。

- 在2023年10月29日，在 02:00:00，时钟向后调整到 01:00:00（BST → GMT）。
- 01:00:00 – 01:59:59 小时出现两次（一次在 BST，一次在 GMT）
- ClickHouse 始终选择第一次出现（BST），因此在添加时间间隔时会导致意外结果。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同样，在从标准时间转向夏令时的过程中，可能会有一个小时被跳过。

例如：

- 在 2023 年 3 月 26 日的 `00:59:59`，时钟跳转到 02:00:00（GMT → BST）。
- 01:00:00 – 01:59:59 小时不存在。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

在这种情况下，ClickHouse 将不存在的时间 `2023-03-26 01:30:00` 向后移动到 `2023-03-26 00:30:00`。

## See Also {#see-also}

- [类型转换函数](../../sql-reference/functions/type-conversion-functions.md)
- [处理日期和时间的函数](../../sql-reference/functions/date-time-functions.md)
- [处理数组的函数](../../sql-reference/functions/array-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
- [处理日期和时间的运算符](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`Date` 数据类型](../../sql-reference/data-types/date.md)
