---
'description': 'ClickHouse 中时间数据类型的文档，用于以秒为精度存储时间范围'
'slug': '/sql-reference/data-types/time'
'sidebar_position': 15
'sidebar_label': '时间'
'title': '时间'
---




# Time

`Time` 数据类型用于存储独立于任何日历日期的时间值。它非常适合表示日常安排、事件时间或任何只关注时间组件（小时、分钟、秒）的情况。

语法：

```sql
Time()
```

支持的值范围： \[-999:59:59, 999:59:59\]。

分辨率：1秒。

## Speed {#speed}

在 _大多数_ 条件下，`Date` 数据类型比 `Time` 更快。但 `Time` 数据类型的速度与 `DateTime` 数据类型大致相同。

由于实现细节，`Time` 和 `DateTime` 类型需要 4 字节的存储，而 `Date` 仅需要 2 字节。然而，当数据库压缩数据时，这一差异会被放大。

## Usage Remarks {#usage-remarks}

时刻以 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time) 形式保存，而不考虑时区或夏令时。

**注意：** `Time` 数据类型不遵循时区。它独立地表示一天中的时间值，而没有任何日期或地区偏移上下文。尝试对 `Time` 列应用或更改时区没有效果且不受支持。

## Examples {#examples}

**1.** 创建一个包含 `Time` 类型列的表并向其中插入数据：

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

**2.** 在 `Time` 值上进行过滤

```sql
SELECT * FROM dt WHERE time = toTime('100:00:00')
```

```text
   ┌──────time─┬─event_id─┐
1. │ 100:00:00 │        1 │
   └───────────┴──────────┘
```

`Time` 列的值可以使用 `WHERE` 谓词中的字符串值进行过滤，它会自动转换为 `Time`：

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


## See Also {#see-also}

- [类型转换函数](../functions/type-conversion-functions.md)
- [处理日期和时间的函数](../functions/date-time-functions.md)
- [处理数组的函数](../functions/array-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
- [`DateTime` 数据类型](datetime.md)
- [`Date` 数据类型](date.md)
