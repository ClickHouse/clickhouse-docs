---
'description': 'ClickHouse 中 DateTime 数据类型的文档，存储具有秒级精度的时间戳'
'sidebar_label': 'DateTime'
'sidebar_position': 16
'slug': '/sql-reference/data-types/datetime'
'title': 'DateTime'
---


# DateTime

允许存储一个时间瞬间，可以表示为日历日期和一天的时间。

语法：

```sql
DateTime([timezone])
```

支持的值范围：\[1970-01-01 00:00:00, 2106-02-07 06:28:15\]。

分辨率：1秒。

## Speed {#speed}

在 _大多数_ 条件下，`Date` 数据类型比 `DateTime` 更快。

`Date` 类型需要 2 字节的存储，而 `DateTime` 需要 4 字节。然而，当数据库压缩时，这种差异会加大。这种放大是因为 `DateTime` 中的分钟和秒数压缩效果较差。用 `Date` 代替 `DateTime` 进行过滤和聚合也更快。

## Usage Remarks {#usage-remarks}

时间点以 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time) 的形式保存，无论时区或夏令时。时区会影响 `DateTime` 类型值以文本格式显示的方式，以及以字符串指定的值（如 '2020-01-01 05:00:01'）的解析。

无时区的 Unix 时间戳存储在表中，时区用于在数据导入/导出时将其转换为文本格式或反向转换，或者对值进行日历计算（例如：`toDate`、`toHour` 函数等）。时区不存储在表的行中（或结果集中），而存储在列元数据中。

支持的时区列表可在 [IANA 时区数据库](https://www.iana.org/time-zones)中找到，也可以通过 `SELECT * FROM system.time_zones` 查询。维基百科上也提供了 [该列表](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)。

在创建表时，可以显式设置 `DateTime` 类型列的时区。例如：`DateTime('UTC')`。如果未设置时区，ClickHouse 将使用 ClickHouse 服务器启动时服务器设置中的 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) 参数或操作系统设置的值。

如果在初始化数据类型时未显式设置时区， [clickhouse-client](../../interfaces/cli.md) 默认应用服务器时区。要使用客户端时区，请使用 `--use_client_time_zone` 参数运行 `clickhouse-client`。

ClickHouse 的输出值取决于 [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 设置的值。默认情况下，文本格式为 `YYYY-MM-DD hh:mm:ss`。此外，可以使用 [formatDateTime](../../sql-reference/functions/date-time-functions.md#formatdatetime) 函数更改输出。

向 ClickHouse 插入数据时，可以根据 [date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 设置的值使用不同格式的日期和时间字符串。

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
INSERT INTO dt VALUES ('2019-01-01 00:00:00', 1), (1546300800, 3);

SELECT * FROM dt;
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        2 │
│ 2019-01-01 03:00:00 │        1 │
└─────────────────────┴──────────┘
```

- 当将 datetime 作为整数插入时，它被视为 Unix 时间戳（UTC）。 `1546300800` 表示 `'2019-01-01 00:00:00'` UTC。然而，由于 `timestamp` 列指定了 `Asia/Istanbul`（UTC+3）时区，因此以字符串形式输出时，值将显示为 `'2019-01-01 03:00:00'`。
- 当以字符串值插入 datetime 时，它被视为在列时区内。 `'2019-01-01 00:00:00'` 将被视为在 `Asia/Istanbul` 时区，并被保存为 `1546290000`。

**2.** 对 `DateTime` 值进行过滤

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

`DateTime` 列值可以使用 `WHERE` 谓词中的字符串值进行过滤。它将被自动转换为 `DateTime`：

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

由于时区转换仅更改元数据，因此该操作没有计算成本。


## Limitations on time zones support {#limitations-on-time-zones-support}

某些时区可能不完全受支持。存在少数情况：

如果与 UTC 的偏移不是 15 分钟的倍数，则小时和分钟的计算可能不正确。例如，利比里亚蒙罗维亚的时区在 1972年1月7日之前的偏移为 UTC -0:44:30。如果您在蒙罗维亚时区对历史时间进行计算，时间处理函数可能会给出不正确的结果。然而，1972年1月7日之后的结果将是正确的。

如果时区转换（由于夏令时或其他原因）在不是 15 分钟的倍数的时刻进行，您也可能在这个特定日期获得不正确的结果。

非单调日历日期。例如，在快乐谷 - 鹅湾，2010年11月7日的时间在 00:01:00 向后转换了一个小时（午夜后的一分钟）。因此，在 11 月 6 日结束后，人们观察到完整的一分钟在 11 月 7 日，然后时间被改回到 11 月 6 日的 23:01，经过59分钟，11 月 7 日再次开始。ClickHouse 还不支持这种情况。在这些天中，时间处理函数的结果可能是稍微不正确的。

2010年在凯西南极站也存在类似问题。他们在 3 月 5 日 02:00 向后调整时间 3小时。如果您在南极站工作，请不要害怕使用 ClickHouse。只需确保将时区设置为 UTC，或意识到不准确性。

多天的时间转换。一些太平洋岛屿将其时区偏移从 UTC+14 改为 UTC-12。这没问题，但如果您对转换日的历史时间点进行计算，可能会出现一些不准确性。

## Handling Daylight Saving Time (DST) {#handling-daylight-saving-time-dst}

ClickHouse 的带时区的 DateTime 类型在夏令时（DST）转换期间可能会出现意外行为，特别是当：

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) 设置为 `simple`。
- 时钟向后移动（“向后调整”），导致一小时重叠。
- 时钟向前移动（“向前调整”），导致一小时的间隔。

默认情况下，ClickHouse 始终选择重叠时间的较早出现，并可能在向前调整时解析不存在的时间。

例如，考虑从夏令时（DST）转换为标准时间的以下过渡。

- 在 2023 年 10 月 29 日 02:00:00，时钟向后调整至 01:00:00（BST → GMT）。
- 01:00:00 – 01:59:59 这一小时出现两次（一次在 BST ，一次在 GMT）。
- ClickHouse 始终选择第一次出现（BST），在添加时间间隔时会导致意外结果。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

类似地，在从标准时间到夏令时的转换期间，一小时可能会被跳过。

例如：

- 在2023年3月26日 `00:59:59` 时，时钟跳转到 `02:00:00`（GMT → BST）。
- `01:00:00` – `01:59:59` 这一小时并不存在。

```sql
SELECT '2023-03-26 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-03-26 00:30:00 │ 2023-03-26 02:30:00 │
└─────────────────────┴─────────────────────┘
```

在这种情况下，ClickHouse 将不存在的时间 `2023-03-26 01:30:00` 向后调整至 `2023-03-26 00:30:00`。

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
