---
slug: /sql-reference/data-types/datetime64
sidebar_position: 18
sidebar_label: DateTime64
---


# DateTime64

允许存储一个瞬时时间，可以用日历日期和一天的时间表示，具有定义的亚秒精度。

滴答大小（精度）：10<sup>-精度</sup>秒。有效范围：[ 0 : 9 ]。通常使用 - 3（毫秒），6（微秒），9（纳秒）。

**语法：**

``` sql
DateTime64(precision, [timezone])
```

内部将数据存储为自纪元开始（1970-01-01 00:00:00 UTC）以来的“滴答”数量，类型为 Int64。滴答分辨率由精度参数决定。此外，`DateTime64` 类型可以存储整个列的时区，这会影响 `DateTime64` 类型值在文本格式中如何显示，以及指定为字符串的值如何解析（'2020-01-01 05:00:01.000'）。时区不存储在表的行中（或在结果集中），而是存储在列元数据中。有关详细信息，请参见 [DateTime](../../sql-reference/data-types/datetime.md)。

支持的值范围：\[1900-01-01 00:00:00, 2299-12-31 23:59:59.99999999\]

注意：最大值的精度为8。如果使用最大精度为9位（纳秒），则最大支持值为 `2262-04-11 23:47:16` UTC。

## 示例 {#examples}

1. 创建一个带有 `DateTime64` 类型列的表并向其插入数据：

``` sql
CREATE TABLE dt64
(
    `timestamp` DateTime64(3, 'Asia/Istanbul'),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- 解析 DateTime
-- - 从整数解释为自1970-01-01以来的秒数。
-- - 从字符串，
INSERT INTO dt64 VALUES (1546300800123, 1), (1546300800.123, 2), ('2019-01-01 00:00:00', 3);

SELECT * FROM dt64;
```

``` text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

- 当将日期时间作为整数插入时，它被视为适当缩放的 Unix 时间戳（UTC）。`1546300800000`（精度 3）表示 `'2019-01-01 00:00:00'` UTC。但是，由于 `timestamp` 列指定了时区 `Asia/Istanbul`（UTC+3），因此输出为字符串时，该值将显示为 `'2019-01-01 03:00:00'`。将日期时间作为小数插入将与整数类似处理，除了小数点前的值是 Unix 时间戳，直到并包括秒，而小数点后的值将被视为精度。
- 当将字符串值作为日期时间插入时，它被视为在列时区中。`'2019-01-01 00:00:00'` 将被视为在 `Asia/Istanbul` 时区，并存储为 `1546290000000`。

2. 在 `DateTime64` 值上进行过滤

``` sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul');
```

``` text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 00:00:00.000 │        3 │
└─────────────────────────┴──────────┘
```

与 `DateTime` 不同，`DateTime64` 值不会自动从 `String` 转换。

``` sql
SELECT * FROM dt64 WHERE timestamp = toDateTime64(1546300800.123, 3);
```

``` text
┌───────────────timestamp─┬─event_id─┐
│ 2019-01-01 03:00:00.123 │        1 │
│ 2019-01-01 03:00:00.123 │        2 │
└─────────────────────────┴──────────┘
```

与插入相反，`toDateTime64` 函数会将所有值视为小数变体，因此需要在小数点后给出精度。

3. 获取 `DateTime64` 类型值的时区：

``` sql
SELECT toDateTime64(now(), 3, 'Asia/Istanbul') AS column, toTypeName(column) AS x;
```

``` text
┌──────────────────column─┬─x──────────────────────────────┐
│ 2023-06-05 00:09:52.000 │ DateTime64(3, 'Asia/Istanbul') │
└─────────────────────────┴────────────────────────────────┘
```

4. 时区转换

``` sql
SELECT
toDateTime64(timestamp, 3, 'Europe/London') as lon_time,
toDateTime64(timestamp, 3, 'Asia/Istanbul') as istanbul_time
FROM dt64;
```

``` text
┌────────────────lon_time─┬───────────istanbul_time─┐
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2019-01-01 00:00:00.123 │ 2019-01-01 03:00:00.123 │
│ 2018-12-31 21:00:00.000 │ 2019-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```

**另请参见**

- [类型转换函数](../../sql-reference/functions/type-conversion-functions.md)
- [处理日期和时间的函数](../../sql-reference/functions/date-time-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
- [处理日期和时间的操作符](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` 数据类型](../../sql-reference/data-types/date.md)
- [`DateTime` 数据类型](../../sql-reference/data-types/datetime.md)
