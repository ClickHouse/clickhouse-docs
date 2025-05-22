
# 时间

`Time` 数据类型用于存储独立于任何日历日期的时间值。它非常适合表示日常时间表、事件时间或任何只关注时间组件（小时、分钟、秒）的情况。

语法：

```sql
Time()
```

支持的值范围：\[-999:59:59, 999:59:59\]。

分辨率：1秒。

## 速度 {#speed}

在 _大多数_ 条件下，`Date` 数据类型比 `Time` 更快。但是，`Time` 数据类型的速度与 `DateTime` 数据类型大致相同。

由于实现细节，`Time` 和 `DateTime` 类型需要 4 字节的存储，而 `Date` 需要 2 字节。然而，当数据库对数据进行压缩时，这一差异会被放大。

## 使用备注 {#usage-remarks}

时间点以 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time) 存储，无论时区或夏令时如何。

**注意：** `Time` 数据类型不考虑时区。它代表独立的时间值，不包含任何日期或区域偏移上下文。尝试在 `Time` 列上应用或更改时区不会产生效果，并且不被支持。

## 示例 {#examples}

**1.** 创建一个包含 `Time` 类型列的表并插入数据：

```sql
CREATE TABLE dt
(
    `time` Time,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse Time
-- - from string,
-- - from integer interpreted as number of seconds since 1970-01-01.
INSERT INTO dt VALUES ('100:00:00', 1), (12453, 3);

SELECT * FROM dt;
```

```text
   ┌──────time─┬─event_id─┐
1. │ 100:00:00 │        1 │
2. │ 003:27:33 │        3 │
   └───────────┴──────────┘
```

**2.** 按 `Time` 值过滤

```sql
SELECT * FROM dt WHERE time = toTime('100:00:00')
```

```text
   ┌──────time─┬─event_id─┐
1. │ 100:00:00 │        1 │
   └───────────┴──────────┘
```

`Time` 列值可以在 `WHERE` 条件中使用字符串值进行过滤。它将自动转换为 `Time`：

```sql
SELECT * FROM dt WHERE time = '100:00:00'
```

```text
   ┌──────time─┬─event_id─┐
1. │ 100:00:00 │        1 │
   └───────────┴──────────┘
```

**3.** 获取 `Time` 类型列的时区：

```sql
SELECT toTime(now()) AS column, toTypeName(column) AS x
```

```text
   ┌────column─┬─x────┐
1. │ 018:55:15 │ Time │
   └───────────┴──────┘
```


## 另请参见 {#see-also}

- [类型转换函数](../functions/type-conversion-functions.md)
- [处理日期和时间的函数](../functions/date-time-functions.md)
- [处理数组的函数](../functions/array-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
- [`DateTime` 数据类型](datetime.md)
- [`Date` 数据类型](date.md)
