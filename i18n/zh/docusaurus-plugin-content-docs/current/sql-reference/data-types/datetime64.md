---
description: 'ClickHouse 中 DateTime64 数据类型文档，该类型用于存储具有亚秒级精度的时间戳'
sidebar_label: 'DateTime64'
sidebar_position: 18
slug: /sql-reference/data-types/datetime64
title: 'DateTime64'
doc_type: 'reference'
---

# DateTime64 {#datetime64}

用于存储某一瞬时时刻，该时刻可以表示为日历日期和一天中的时间，并具有可配置的子秒级精度。

时间刻度（精度）：10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。
常用的取值有 3（毫秒）、6（微秒）、9（纳秒）。

**语法：**

```sql
DateTime64(precision, [timezone])
```

在内部，数据以自纪元开始（1970-01-01 00:00:00 UTC）以来的若干个“tick”形式存储为 Int64。tick 的时间分辨率由 `precision` 参数决定。此外，`DateTime64` 类型可以存储一个对整列统一生效的时区，该时区会影响 `DateTime64` 类型值在文本格式中的显示方式，以及将字符串形式的值（如 `2020-01-01 05:00:01.000`）解析为 `DateTime64` 时的方式。时区不会存储在表的行（或结果集）中，而是存储在列的元数据中。详情参见 [DateTime](../../sql-reference/data-types/datetime.md)。

支持的取值范围：[1900-01-01 00:00:00, 2299-12-31 23:59:59.999999999]

小数点后的位数取决于 `precision` 参数。

注意：最大值的精度为 8。如果使用 9 位（纳秒级）的最大精度，则在 UTC 时区下支持的最大值为 `2262-04-11 23:47:16`。

## 示例 {#examples}

1. 创建一个包含 `DateTime64` 类型列的表，并向其中插入数据：

```sql
CREATE TABLE dt64
(
    `timestamp` DateTime64(3, 'Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse DateTime
-- - from integer interpreted as number of microseconds (because of precision 3) since 1970-01-01,
-- - from decimal interpreted as number of seconds before the decimal part, and based on the precision after the decimal point,
-- - from string.
INSERT INTO dt64 VALUES (1546300800123, 1), (1546300800.123, 2), ('2019-01-01 00:00:00', 3);

SELECT * FROM dt64;
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

* 当以整数形式插入 datetime 时，它会被视为按相应精度缩放的 Unix 时间戳（UTC）。`1546300800000`（精度为 3）表示 UTC 的 `'2019-01-01 00:00:00'`。但是，由于 `timestamp` 列指定的时区是 `Asia/Istanbul`（UTC+3），在以字符串形式输出时，该值会显示为 `'2019-01-01 03:00:00'`。当以小数形式插入 datetime 时，其处理方式与整数类似，只是小数点前的值是精确到秒的 Unix 时间戳，小数点后的部分将被视为精度。
* 当以字符串形式插入 datetime 值时，它会被视为处于该列所使用的时区中。`'2019-01-01 00:00:00'` 将被视为处于 `Asia/Istanbul` 时区，并以 `1546290000000` 的形式存储。

2. 对 `DateTime64` 值进行过滤

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul');
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

与 `DateTime` 不同，`DateTime64` 类型的值不会自动由 `String` 转换而来。

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64(1546300800.123, 3);
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
└─────────────────────────┴──────────┘
```

与插入操作不同，`toDateTime64` 函数会将所有值视为小数形式，因此需要在小数点后指定精度。

3. 获取 `DateTime64` 类型值的时区：

```sql
SELECT toDateTime64(now(), 3, 'Asia/Istanbul') AS column, toTypeName(column) AS x;
```

```text
┌──────────────────column─┬─x──────────────────────────────┐
│ 2023-06-05 00:09:52.000 │ DateTime64(3, 'Asia/Istanbul') │
└─────────────────────────┴────────────────────────────────┘
```

4. 时区转换

```sql
SELECT
toDateTime64(timestamp, 3, 'Europe/London') AS lon_time,
toDateTime64(timestamp, 3, 'Asia/Istanbul') AS istanbul_time
FROM dt64;
```

```text
┌────────────────lon_time─┬───────────istanbul_time─┐
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2018-12-31 21:00:00.000 │ 2019-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```

**另请参阅**

* [类型转换函数](../../sql-reference/functions/type-conversion-functions.md)
* [用于处理日期和时间的函数](../../sql-reference/functions/date-time-functions.md)
* [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
* [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
* [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
* [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
* [用于处理日期和时间的运算符](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
* [`Date` 数据类型](../../sql-reference/data-types/date.md)
* [`DateTime` 数据类型](../../sql-reference/data-types/datetime.md)
