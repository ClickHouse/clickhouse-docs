---
'description': 'ClickHouse 中 Time 数据类型的文档，它以秒级精度存储时间范围'
'slug': '/sql-reference/data-types/time'
'sidebar_position': 15
'sidebar_label': '时间'
'title': '时间'
---


# 时间

`Time` 数据类型用于存储独立于任何日历日期的时间值。它非常适合表示日常日程、事件时间或任何只需时间组件（小时、分钟、秒）的情况。

语法：

```sql
Time()
```

支持的值范围：\[-999:59:59, 999:59:59\]。

分辨率：1秒。

## 速度 {#speed}

在 _大多数_ 情况下，`Date` 数据类型比 `Time` 更快。但 `Time` 数据类型与 `DateTime` 数据类型的速度大致相同。

由于实现细节，`Time` 和 `DateTime` 类型需要4个字节的存储，而 `Date` 需要2个字节。然而，当数据库对数据进行压缩时，这种差异会被放大。

## 使用备注 {#usage-remarks}

时间点以 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time) 的形式保存，与时区或夏令时无关。

**注意：** `Time` 数据类型不考虑时区。它表示一个独立的时间值，不带有任何日期或区域偏移上下文。尝试对 `Time` 列应用或更改时区是无效的，并且不支持。

## 示例 {#examples}

**1.** 创建一个带有 `Time` 类型列的表并插入数据：

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

**2.** 基于 `Time` 值进行过滤

```sql
SELECT * FROM dt WHERE time = toTime('100:00:00')
```

```text
   ┌──────time─┬─event_id─┐
1. │ 100:00:00 │        1 │
   └───────────┴──────────┘
```

`Time` 列值可以使用 `WHERE` 子句中的字符串值进行过滤。它将自动转换为 `Time`：

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


## 另请参阅 {#see-also}

- [类型转换函数](../functions/type-conversion-functions.md)
- [处理日期和时间的函数](../functions/date-time-functions.md)
- [处理数组的函数](../functions/array-functions.md)
- [设置 `date_time_input_format`](../../operations/settings/settings-formats.md#date_time_input_format)
- [设置 `date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)
- [服务器配置参数 `timezone`](../../operations/server-configuration-parameters/settings.md#timezone)
- [设置 `session_timezone`](../../operations/settings/settings.md#session_timezone)
- [`DateTime` 数据类型](datetime.md)
- [`Date` 数据类型](date.md)
