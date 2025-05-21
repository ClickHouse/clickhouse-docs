---
'description': 'ClickHouse中的DateTime数据类型文档，用于存储具有秒精度的时间戳'
'sidebar_label': '日期时间'
'sidebar_position': 16
'slug': '/sql-reference/data-types/datetime'
'title': 'DateTime'
---




# DateTime

允许存储一个时间点，可以表示为一个日历日期和一天中的时刻。

语法：

```sql
DateTime([timezone])
```

支持的值范围：\[1970-01-01 00:00:00, 2106-02-07 06:28:15\]。

分辨率：1秒。

## Speed {#speed}

在 _大多数_ 情况下，`Date` 数据类型比 `DateTime` 更快。

`Date` 类型需要 2 字节的存储，而 `DateTime` 需要 4 字节。然而，当数据库进行压缩时，这种差异会被放大。这种放大是由于 `DateTime` 中的分钟和秒数不易压缩。过滤和聚合 `Date` 而不是 `DateTime` 也更快。

## Usage Remarks {#usage-remarks}

时间点保存为 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time)，无论时区或夏令时如何影响。时区影响 `DateTime` 类型值在文本格式中的显示方式，以及作为字符串指定的值是如何解析的（例如：'2020-01-01 05:00:01'）。

不依赖时区的 Unix 时间戳存储在表中，时区用于在数据导入/导出期间转换为文本格式或反向转换，或者对值进行日历计算（示例：`toDate`、`toHour` 函数等）。时区不存储在表的行中（或结果集中），而是存储在列的元数据中。

支持的时区列表可以在 [IANA 时区数据库](https://www.iana.org/time-zones) 中找到，并且也可以通过 `SELECT * FROM system.time_zones` 查询。 [该列表](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 也可以在维基百科上找到。

在创建表时，您可以显式地为 `DateTime` 类型的列设置时区。示例：`DateTime('UTC')`。如果未设置时区，ClickHouse 将使用在启动 ClickHouse 服务器时 [timezone](../../operations/server-configuration-parameters/settings.md#timezone) 参数的服务器设置或操作系统设置的值。

如果初始化数据类型时未显式设置时区，[clickhouse-client](../../interfaces/cli.md) 默认应用服务器时区。要使用客户端时区，请使用 `--use_client_time_zone` 参数运行 `clickhouse-client`。

ClickHouse 根据 [date_time_output_format](../../operations/settings/settings-formats.md#date_time_output_format) 设置输出值。默认情况下为 `YYYY-MM-DD hh:mm:ss` 文本格式。此外，您可以使用 [formatDateTime](../../sql-reference/functions/date-time-functions.md#formatdatetime) 函数更改输出。

在向 ClickHouse 插入数据时，可以使用不同格式的日期和时间字符串，这取决于 [date_time_input_format](../../operations/settings/settings-formats.md#date_time_input_format) 设置的值。

## Examples {#examples}

**1.** 创建一个 `DateTime` 类型列的表并插入数据：

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

- 当以整数形式插入日期时间时，它被视为 Unix 时间戳 (UTC)。 `1546300800` 代表 `'2019-01-01 00:00:00'` UTC。然而，由于 `timestamp` 列指定了 `Asia/Istanbul`（UTC+3）时区，在以字符串形式输出时，该值将显示为 `'2019-01-01 03:00:00'`。
- 当以字符串值插入日期时间时，它被视为在列时区中。 `'2019-01-01 00:00:00'` 将视为在 `Asia/Istanbul` 时区中并保存为 `1546290000`。

**2.** 过滤 `DateTime` 值

```sql
SELECT * FROM dt WHERE timestamp = toDateTime('2019-01-01 00:00:00', 'Asia/Istanbul')
```

```text
┌───────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00 │        1 │
└─────────────────────┴──────────┘
```

可以使用 `WHERE` 谓词中的字符串值过滤 `DateTime` 列的值。它将自动转换为 `DateTime`：

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

由于时区转换只是改变元数据，因此该操作没有计算成本。

## Limitations on time zones support {#limitations-on-time-zones-support}

某些时区可能并未完全支持。以下是几个情况：

如果与 UTC 的偏移不是 15 分钟的倍数，小时和分钟的计算可能会不正确。例如，利比里亚蒙罗维亚的时区在1972年1月7日之前的偏移为 UTC -0:44:30。如果您在蒙罗维亚时区进行历史时间的计算，时间处理函数可能会给出不正确的结果。尽管1972年1月7日之后的结果仍然是正确的。

如果由于夏令时或其他原因的时间过渡在不是 15 分钟的倍数的时间点上执行，您也可能在这一特定日期得到不正确的结果。

非单调日历日期。例如，在幸福谷 - 鳄鱼湾，时钟在2010年11月7日00:01:00时向后调整了一个小时（午夜后一分钟）。因此，在6日结束后，人们观察到整整一分钟的7日，然后时间被改回到6日23:01，并在59分钟后再一次开始7日。ClickHouse 目前不支持这种情况。在这些天，时间处理函数的结果可能会略微不正确。

2010年在凯西南极站也存在类似问题。他们在3月5日02:00时向后调整了三个小时。如果您在南极站工作，请不要害怕使用 ClickHouse。只需确保将时区设置为 UTC 或了解不准确之处。

多天的时间偏移。在某些太平洋岛屿上，它们的时区偏移从 UTC+14 调整为 UTC-12。虽然没问题，但在转换的那几天，如果对历史时间点进行计算，可能会出现一些不准确。

## Handling Daylight Saving Time (DST) {#handling-daylight-saving-time-dst}

ClickHouse 带时区的 DateTime 类型在夏令时 (DST) 转换期间可能会表现出意外行为，特别是在：

- [`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format) 设置为 `simple` 时。
- 时钟向后移动（“后退”），造成一小时的重叠。
- 时钟向前移动（“前进”），造成一小时的间隙。

默认情况下，ClickHouse 总是选择重叠时间的较早发生，并可能在向前移动时解释不存在的时间。

例如，考虑从夏令时 (DST) 到标准时间的以下转换。

- 在2023年10月29日02:00:00时，时钟向后移动到01:00:00（BST → GMT）。
- 时段 01:00:00 – 01:59:59 出现两次（一次在 BST，另一次在 GMT）。
- ClickHouse 总是选择第一次出现（BST），在添加时间间隔时造成意外结果。

```sql
SELECT '2023-10-29 01:30:00'::DateTime('Europe/London') AS time, time + toIntervalHour(1) AS one_hour_later

┌────────────────time─┬──────one_hour_later─┐
│ 2023-10-29 01:30:00 │ 2023-10-29 01:30:00 │
└─────────────────────┴─────────────────────┘
```

同样，在从标准时间转换到夏令时时，一小时可能看起来被跳过。

例如：

- 在2023年3月26日`00:59:59`时，时钟跳转到02:00:00（GMT → BST）。
- 时段 `01:00:00` – `01:59:59` 不存在。

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
- [处理日期和时间的运算符](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [Date 数据类型](../../sql-reference/data-types/date.md)
