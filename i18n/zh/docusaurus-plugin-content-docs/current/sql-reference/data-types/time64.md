---
description: 'ClickHouse 中 Time64 数据类型的文档，用于存储具有亚秒级精度的时间值'
slug: /sql-reference/data-types/time64
sidebar_position: 17
sidebar_label: 'Time64'
title: 'Time64'
doc_type: 'reference'
---



# Time64

数据类型 `Time64` 表示带有小数秒的**一天中的时间**。
它不包含任何日历日期组件（日、月、年）。
参数 `precision` 定义了小数位数，从而决定时间刻度大小。

时间刻度（精度）：10<sup>-precision</sup> 秒。有效范围：0..9。常见取值包括 3（毫秒）、6（微秒）和 9（纳秒）。

**语法：**

```sql
Time64(精度)
```

在内部，`Time64` 会将秒的小数部分存储为带符号的 64 位十进制数（Decimal64）。
时间分辨率由 `precision` 参数决定。
不支持时区：为 `Time64` 指定时区会抛出错误。

与 `DateTime64` 不同，`Time64` 不存储日期部分。
另请参阅 [`Time`](../../sql-reference/data-types/time.md)。

文本表示范围：对于 `precision = 3`，为 [-999:59:59.000, 999:59:59.999]。一般来说，最小值为 `-999:59:59`，最大值为 `999:59:59`，并带有最多 `precision` 位的小数位（例如，当 `precision = 9` 时，最小值为 `-999:59:59.999999999`）。


## 实现细节 {#implementation-details}

**表示方式**。
带符号的 `Decimal64` 值,用 `precision` 位小数表示秒的小数部分。

**规范化**。
将字符串解析为 `Time64` 时,时间组件会被规范化但不进行验证。
例如,`25:70:70` 会被解释为 `26:11:10`。

**负值**。
支持并保留前导负号。
负值通常来自对 `Time64` 值的算术运算。
对于 `Time64`,文本输入(如 `'-01:02:03.123'`)和数值输入(如 `-3723.123`)中的负值都会被保留。

**饱和处理**。
在转换为组件或序列化为文本时,时间组件被限制在 [-999:59:59.xxx, 999:59:59.xxx] 范围内。
存储的数值可能超出此范围;但任何组件提取(小时、分钟、秒)和文本表示都使用饱和后的值。

**时区**。
`Time64` 不支持时区。
在创建 `Time64` 类型或值时指定时区会抛出错误。
同样,尝试对 `Time64` 列应用或更改时区也不受支持,会导致错误。


## 示例 {#examples}

1. 创建包含 `Time64` 类型列的表并插入数据:

```sql
CREATE TABLE tab64
(
    `event_id` UInt8,
    `time` Time64(3)
)
ENGINE = TinyLog;
```

```sql
-- 解析 Time64
-- - 从字符串解析,
-- - 从自 00:00:00 起的秒数解析(小数部分根据精度确定)。
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

注意:`toTime64` 将数字字面量解析为秒数(根据指定精度包含小数部分),因此请明确提供预期的小数位数。

3. 检查结果类型:

```sql
SELECT CAST('14:30:25.250' AS Time64(3)) AS column, toTypeName(column) AS type;
```

```text
   ┌────────column─┬─type──────┐
1. │ 14:30:25.250 │ Time64(3) │
   └───────────────┴───────────┘
```

**另请参阅**

- [类型转换函数](../../sql-reference/functions/type-conversion-functions.md)
- [日期和时间函数](../../sql-reference/functions/date-time-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
- [日期和时间运算符](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` 数据类型](../../sql-reference/data-types/date.md)
- [`Time` 数据类型](../../sql-reference/data-types/time.md)
- [`DateTime` 数据类型](../../sql-reference/data-types/datetime.md)
