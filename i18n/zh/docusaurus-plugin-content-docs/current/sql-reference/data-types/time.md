---
'description': 'ClickHouse 中 Time 数据类型的文档，它以秒的精度存储时间范围'
'slug': '/sql-reference/data-types/time'
'sidebar_position': 15
'sidebar_label': 'Time'
'title': 'Time'
'doc_type': 'reference'
---


# Time

数据类型 `Time` 表示具有小时、分钟和秒组成部分的时间。它独立于任何日历日期，适用于不需要日期、月份和年份组成部分的值。

语法：

```sql
Time
```

文本表示范围：[-999:59:59, 999:59:59]。

分辨率：1秒。

## 实现细节 {#implementation-details}

**表示和性能**。  
数据类型 `Time` 内部存储一个编码秒数的带符号32位整数。类型为 `Time` 和 `DateTime` 的值具有相同的字节大小，因此性能可比较。

**规范化**。  
在解析字符串为 `Time` 时，时间组成部分是被规范化而不是被验证的。例如，`25:70:70` 被解释为 `26:11:10`。

**负值**。  
支持并保留前导负号。负值通常来自对 `Time` 值的算术运算。对于 `Time` 类型，负输入在文本（例如，`'-01:02:03'`）和数字输入（例如，`-3723`）中都被保留。

**饱和**。  
一天中的时间组件被限制在范围[-999:59:59, 999:59:59]内。超出999小时（或低于-999）的值通过文本表示为 `999:59:59`（或 `-999:59:59`）。

**时区**。  
`Time` 不支持时区，即 `Time` 值在没有区域上下文的情况下被解释。将时区指定为 `Time` 的类型参数或在值创建期间会引发错误。同样，尝试在 `Time` 列上应用或更改时区也不被支持，结果会导致错误。`Time` 值不会在不同的时区下被静默重新解释。

## 示例 {#examples}

**1.** 创建一个具有 `Time` 类型列的表并向其中插入数据：

```sql
CREATE TABLE tab
(
    `event_id` UInt8,
    `time` Time
)
ENGINE = TinyLog;
```

```sql
-- Parse Time
-- - from string,
-- - from integer interpreted as number of seconds since 00:00:00.
INSERT INTO tab VALUES (1, '14:30:25'), (2, 52225);

SELECT * FROM tab ORDER BY event_id;
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**2.** 对 `Time` 值进行过滤

```sql
SELECT * FROM tab WHERE time = toTime('14:30:25')
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

`Time` 列的值可以使用 `WHERE` 谓词中的字符串值进行过滤。它将自动转换为 `Time`：

```sql
SELECT * FROM tab WHERE time = '14:30:25'
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**3.** 检查结果类型：

```sql
SELECT CAST('14:30:25' AS Time) AS column, toTypeName(column) AS type
```

```text
   ┌────column─┬─type─┐
1. │ 14:30:25 │ Time │
   └───────────┴──────┘
```

## 另请参见 {#see-also}

- [类型转换函数](../functions/type-conversion-functions.md)
- [用于处理日期和时间的函数](../functions/date-time-functions.md)
- [用于处理数组的函数](../functions/array-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
- [类型 `DateTime`](datetime.md)
- [类型 `Date`](date.md)
