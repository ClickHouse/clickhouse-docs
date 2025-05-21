---
'description': 'Documentation for the Time64 data type in ClickHouse, which stores
  the time range with sub-second precision'
'slug': '/sql-reference/data-types/time64'
'sidebar_position': 17
'sidebar_label': 'Time64'
'title': 'Time64'
---




# Time64

Time64 数据类型允许以亚秒精度存储时间值。与 DateTime64 不同，它不包括日历日期，只表示时间。精度定义了以分数秒存储值的分辨率。

滴答大小（精度）：10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。
通常使用 - 3（毫秒），6（微秒），9（纳秒）。

**语法：**

```sql
Time64(precision)
```

在内部，Time64 将数据存储为从一天开始（000:00:00.000000000）起的 Int64 滴答数。滴答分辨率由精度参数决定。可以选择在列级别指定时区，这会影响时间值的解释和文本格式显示。

与 DateTime64 不同，Time64 不存储日期组件，这意味着它仅表示时间。有关详细信息，请参见 [Time](../../sql-reference/data-types/time.md)。

支持的值范围：\[000:00:00, 999:59:59.99999999\]

## 示例 {#examples}

1. 创建一个带有 `Time64` 类型列的表并插入数据：

```sql
CREATE TABLE t64
(
    `timestamp` Time64(3),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse Time
-- - from integer interpreted as number of seconds since 1970-01-01.
-- - from string,
INSERT INTO t64 VALUES (15463123, 1), (154600.123, 2), ('100:00:00', 3);

SELECT * FROM t64;
```

```text
   ┌─────timestamp─┬─event_id─┐
1. │ 004:17:43.123 │        1 │
2. │ 042:56:40.123 │        2 │
3. │ 100:00:00.000 │        3 │
   └───────────────┴──────────┘
```

2. 基于 `Time64` 值过滤

```sql
SELECT * FROM t64 WHERE timestamp = toTime64('100:00:00', 3);
```

```text
   ┌─────timestamp─┬─event_id─┐
1. │ 100:00:00.000 │        3 │
   └───────────────┴──────────┘
```

与 `Time` 不同，`Time64` 值不会自动从 `String` 转换。

```sql
SELECT * FROM t64 WHERE timestamp = toTime64(154600.123, 3);
```

```text
   ┌─────timestamp─┬─event_id─┐
1. │ 042:56:40.123 │        2 │
   └───────────────┴──────────┘
```

与插入相反，`toTime64` 函数将把所有值视为十进制变量，因此精度需要在小数点后给出。

3. 获取 `Time64` 类型值的时区：

```sql
SELECT toTime64(now(), 3) AS column, toTypeName(column) AS x;
```

```text
   ┌────────column─┬─x─────────┐
1. │ 019:14:16.000 │ Time64(3) │
   └───────────────┴───────────┘
```

**另请参阅**

- [类型转换函数](../../sql-reference/functions/type-conversion-functions.md)
- [处理日期和时间的函数](../../sql-reference/functions/date-time-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
- [处理日期和时间的操作符](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` 数据类型](../../sql-reference/data-types/date.md)
- [`Time` 数据类型](../../sql-reference/data-types/time.md)
- [`DateTime` 数据类型](../../sql-reference/data-types/datetime.md)
