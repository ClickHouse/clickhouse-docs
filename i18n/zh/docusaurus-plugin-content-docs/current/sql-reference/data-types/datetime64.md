---
description: 'ClickHouse 中 DateTime64 数据类型的文档，用于存储具备亚秒级精度的时间戳'
sidebar_label: 'DateTime64'
sidebar_position: 18
slug: /sql-reference/data-types/datetime64
title: 'DateTime64'
doc_type: 'reference'
---



# DateTime64

用于存储时间点，可以表示为日历日期和一天中的时间，并具有指定的亚秒级精度。

时间刻度（精度）：10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。\
通常使用的值为 3（毫秒）、6（微秒）、9（纳秒）。

**语法：**

```sql
DateTime64(precision, [timezone])
```

在内部，数据以自纪元起始时间（1970-01-01 00:00:00 UTC）以来的“tick”数量形式存储为 Int64。tick 的精度由 precision 参数决定。此外，`DateTime64` 类型可以为整个列存储一个统一的时区，这会影响 `DateTime64` 类型的值以文本格式显示的方式，以及以字符串形式指定的值（`'2020-01-01 05:00:01.000'`）的解析方式。时区不会存储在表的行（或结果集）中，而是存储在列的元数据中。详情参见 [DateTime](../../sql-reference/data-types/datetime.md)。

支持的取值范围：[1900-01-01 00:00:00, 2299-12-31 23:59:59.999999999]

小数点后的位数取决于 precision 参数。

注意：最大时间值所支持的小数精度为 8 位。如果使用 9 位数字（纳秒）的最大精度，在 UTC 中支持的最大值为 `2262-04-11 23:47:16`。


## 示例 {#examples}

1. 创建包含 `DateTime64` 类型列的表并插入数据:

```sql
CREATE TABLE dt64
(
    `timestamp` DateTime64(3, 'Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- 解析 DateTime
-- - 从整数解析,整数被解释为自 1970-01-01 以来的微秒数(因为精度为 3),
-- - 从十进制数解析,小数点前的部分被解释为秒数,小数点后的部分基于精度,
-- - 从字符串解析。
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

- 当以整数形式插入日期时间时,它会被视为经过适当缩放的 Unix 时间戳(UTC)。`1546300800000`(精度为 3)表示 UTC 时间 `'2019-01-01 00:00:00'`。然而,由于 `timestamp` 列指定了 `Asia/Istanbul`(UTC+3)时区,当以字符串形式输出时,该值将显示为 `'2019-01-01 03:00:00'`。以十进制数形式插入日期时间的处理方式与整数类似,不同之处在于小数点前的值是 Unix 时间戳(精确到秒),小数点后的部分将根据精度处理。
- 当以字符串值形式插入日期时间时,它会被视为列所在时区的时间。`'2019-01-01 00:00:00'` 将被视为 `Asia/Istanbul` 时区的时间,并存储为 `1546290000000`。

2. 对 `DateTime64` 值进行过滤

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul');
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

与 `DateTime` 不同,`DateTime64` 值不会自动从 `String` 转换。

```sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64(1546300800.123, 3);
```

```text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
└─────────────────────────┴──────────┘
```

与插入操作相反,`toDateTime64` 函数会将所有值视为十进制变体,因此需要在小数点后指定精度。

3. 获取 `DateTime64` 类型值的时区:

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
