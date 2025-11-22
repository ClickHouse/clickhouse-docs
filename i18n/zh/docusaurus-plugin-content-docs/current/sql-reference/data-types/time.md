---
description: 'ClickHouse 中 Time 数据类型的文档，用于以秒级精度存储时间范围'
slug: /sql-reference/data-types/time
sidebar_position: 15
sidebar_label: 'Time'
title: 'Time'
doc_type: 'reference'
---



# Time

数据类型 `Time` 表示由小时、分钟和秒组成的时间。
它不依赖任何日历日期，适用于不需要日、月和年部分的场景。

语法：

```sql
时间
```

文本表示形式的取值范围：[-999:59:59, 999:59:59]。

精度：1 秒。


## 实现细节 {#implementation-details}

**表示与性能**。
数据类型 `Time` 内部使用有符号 32 位整数存储秒数。
`Time` 和 `DateTime` 类型的值具有相同的字节大小,因此性能相当。

**规范化**。
将字符串解析为 `Time` 时,时间组件会被规范化而不进行验证。
例如,`25:70:70` 会被解释为 `26:11:10`。

**负值**。
支持并保留前导负号。
负值通常来自对 `Time` 值的算术运算。
对于 `Time` 类型,文本输入(如 `'-01:02:03'`)和数值输入(如 `-3723`)的负值都会被保留。

**饱和处理**。
时间组件被限制在 [-999:59:59, 999:59:59] 范围内。
小时数超过 999(或低于 -999)的值在文本表示和往返转换时会显示为 `999:59:59`(或 `-999:59:59`)。

**时区**。
`Time` 不支持时区,即 `Time` 值在解释时不考虑区域上下文。
将时区指定为 `Time` 的类型参数或在创建值时指定时区会引发错误。
同样,尝试对 `Time` 列应用或更改时区也不受支持,会导致错误。
`Time` 值不会在不同时区下被静默重新解释。


## 示例 {#examples}

**1.** 创建包含 `Time` 类型列的表并插入数据:

```sql
CREATE TABLE tab
(
    `event_id` UInt8,
    `time` Time
)
ENGINE = TinyLog;
```

```sql
-- 解析 Time
-- - 从字符串解析,
-- - 从整数解析(解释为自 00:00:00 起的秒数)。
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

可以在 `WHERE` 谓词中使用字符串值对 `Time` 列的值进行过滤。字符串值将自动转换为 `Time` 类型:

```sql
SELECT * FROM tab WHERE time = '14:30:25'
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**3.** 检查结果类型:

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
- [日期和时间函数](../functions/date-time-functions.md)
- [数组函数](../functions/array-functions.md)
- [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
- [`DateTime` 数据类型](datetime.md)
- [`Date` 数据类型](date.md)
