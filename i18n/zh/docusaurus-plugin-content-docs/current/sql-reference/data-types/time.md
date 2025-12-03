---
description: 'ClickHouse 中 Time 数据类型的文档，该类型以秒级精度存储时间'
slug: /sql-reference/data-types/time
sidebar_position: 15
sidebar_label: 'Time'
title: 'Time'
doc_type: 'reference'
---

# Time {#time}

数据类型 `Time` 表示一个由小时、分钟和秒组成的时间。
它独立于任何日历日期，适用于不需要日、月、年部分的取值。

语法：

```sql
时间
```

文本表示的范围：[-999:59:59, 999:59:59]。

精度：1 秒。

## 实现细节 {#implementation-details}

**表示与性能**。
数据类型 `Time` 在内部存储为一个带符号的 32 位整数，用于编码秒数。
`Time` 和 `DateTime` 类型的值具有相同的字节大小，因此性能相当。

**规范化**。
在将字符串解析为 `Time` 时，时间组件会被规范化，但不会进行有效性校验。
例如，`25:70:70` 会被解释为 `26:11:10`。

**负值**。
前导负号会被支持并保留。
负值通常源自对 `Time` 值进行算术运算。
对于 `Time` 类型，负输入在文本（例如 `'-01:02:03'`）和数值输入（例如 `-3723`）两种形式中都会被保留。

**饱和**。
一天中的时间组件会被限制在 [-999:59:59, 999:59:59] 范围内。
小时数超出 999（或小于 -999） 的值，在文本表示和往返时都会被表示为 `999:59:59`（或 `-999:59:59`）。

**时区**。
`Time` 不支持时区，即在解释 `Time` 值时不带区域上下文。
将时区作为类型参数指定给 `Time`，或在创建值时指定时区，都会抛出错误。
同样，对 `Time` 列应用或更改时区的尝试也不被支持，并会导致错误。
`Time` 值不会在不同的时区下被静默重新解释。

## 示例 {#examples}

**1.** 创建一个包含 `Time` 类型列的表，并向其中插入数据：

```sql
CREATE TABLE tab
(
    `event_id` UInt8,
    `time` Time
)
ENGINE = TinyLog;
```

```sql
-- 解析时间
-- - 从字符串解析，
-- - 从整数解析（解释为自 00:00:00 起的秒数）。
INSERT INTO tab VALUES (1, '14:30:25'), (2, 52225);

SELECT * FROM tab ORDER BY event_id;
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**2.** 按 `Time` 值过滤

```sql
SELECT * FROM tab WHERE time = toTime('14:30:25')
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

可以在 `WHERE` 谓词中使用字符串值来过滤 `Time` 列的值，它会被自动转换为 `Time`：

```sql
SELECT * FROM tab WHERE time = '14:30:25'
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**3.** 查看结果类型：

```sql
SELECT CAST('14:30:25' AS Time) AS column, toTypeName(column) AS type
```

```text
   ┌────column─┬─type─┐
1. │ 14:30:25 │ Time │
   └───────────┴──────┘
```

## 另请参阅 {#see-also}

- [类型转换函数](../functions/type-conversion-functions.md)
- [用于处理日期和时间的函数](../functions/date-time-functions.md)
- [用于处理数组的函数](../functions/array-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
- [`DateTime` 数据类型](datetime.md)
- [`Date` 数据类型](date.md)
