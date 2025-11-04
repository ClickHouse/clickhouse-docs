---
'description': 'ClickHouse中Time64数据类型的文档，它以亚秒精度存储时间范围'
'slug': '/sql-reference/data-types/time64'
'sidebar_position': 17
'sidebar_label': 'Time64'
'title': 'Time64'
'doc_type': 'reference'
---


# Time64

数据类型 `Time64` 表示一天中的时间，精确到分秒。
它没有日历日期组件（天，月，年）。
`precision` 参数定义了小数位数，因此也定义了刻度大小。

刻度大小（精度）：10<sup>-precision</sup> 秒。有效范围：0..9。常见选择包括 3（毫秒）、6（微秒）和 9（纳秒）。

**语法：**

```sql
Time64(precision)
```

在内部，`Time64` 存储一个带符号的 64 位十进制（Decimal64）表示的小数秒数。
刻度分辨率由 `precision` 参数决定。
不支持时区：使用 `Time64` 指定时区将导致错误。

与 `DateTime64` 不同，`Time64` 不存储日期组件。
另请参阅 [`Time`](../../sql-reference/data-types/time.md)。

文本表示范围：对于 `precision = 3`，范围为 [-999:59:59.000, 999:59:59.999]。一般来说，最小值为 `-999:59:59`，最大值为 `999:59:59`，精确到 `precision` 小数位（对于 `precision = 9`，最小值为 `-999:59:59.999999999`）。

## 实现细节 {#implementation-details}

**表示**。
带符号的 `Decimal64` 值，计算带 `precision` 小数位的秒数。

**规范化**。
在将字符串解析为 `Time64` 时，时间组件被规范化而不是验证。
例如，`25:70:70` 被解析为 `26:11:10`。

**负值**。
支持并保留前导负号。
负值通常源自对 `Time64` 值的算术操作。
对于 `Time64`，负输入在文本（例如，`'-01:02:03.123'`）和数字输入（例如，`-3723.123`）中都被保留。

**饱和**。
在转换为组件或序列化为文本时，时间组件被限制在范围 [-999:59:59.xxx, 999:59:59.xxx] 内。
存储的数值可能超出此范围；但是，任何组件提取（小时、分钟、秒）和文本表示使用的是饱和值。

**时区**。
`Time64` 不支持时区。
在创建 `Time64` 类型或值时指定时区将导致错误。
同样，尝试在 `Time64` 列上应用或更改时区不被支持，并会导致错误。

## 示例 {#examples}

1. 创建带有 `Time64` 类型列的表并插入数据：

```sql
CREATE TABLE tab64
(
    `event_id` UInt8,
    `time` Time64(3)
)
ENGINE = TinyLog;
```

```sql
-- Parse Time64
-- - from string,
-- - from a number of seconds since 00:00:00 (fractional part according to precision).
INSERT INTO tab64 VALUES (1, '14:30:25'), (2, 52225.123), (3, '14:30:25');

SELECT * FROM tab64 ORDER BY event_id;
```

```text
   ┌─event_id─┬────────time─┐
1. │        1 │ 14:30:25.000 │
2. │        2 │ 14:30:25.123 │
3. │        3 │ 14:30:25.000 │
   └──────────┴──────────────┘
```

2. 对 `Time64` 值进行过滤

```sql
SELECT * FROM tab64 WHERE time = toTime64('14:30:25', 3);
```

```text
   ┌─event_id─┬────────time─┐
1. │        1 │ 14:30:25.000 │
2. │        3 │ 14:30:25.000 │
   └──────────┴──────────────┘
```

```sql
SELECT * FROM tab64 WHERE time = toTime64(52225.123, 3);
```

```text
   ┌─event_id─┬────────time─┐
1. │        2 │ 14:30:25.123 │
   └──────────┴──────────────┘
```

注意：`toTime64` 根据指定的精度将数字字面量解析为带小数部分的秒数，因此请显式提供预期的小数位。

3. 检查结果类型：

```sql
SELECT CAST('14:30:25.250' AS Time64(3)) AS column, toTypeName(column) AS type;
```

```text
   ┌────────column─┬─type──────┐
1. │ 14:30:25.250 │ Time64(3) │
   └───────────────┴───────────┘
```

**参见**

- [类型转换函数](../../sql-reference/functions/type-conversion-functions.md)
- [处理日期和时间的函数](../../sql-reference/functions/date-time-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [服务器配置参数 `timezone`](../../operations/server-configuration-parameters/settings.md#timezone)
- [会话设置 `session_timezone`](../../operations/settings/settings.md#session_timezone)
- [处理日期和时间的运算符](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` 数据类型](../../sql-reference/data-types/date.md)
- [`Time` 数据类型](../../sql-reference/data-types/time.md)
- [`DateTime` 数据类型](../../sql-reference/data-types/datetime.md)
