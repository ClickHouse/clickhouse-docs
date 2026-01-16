---
description: 'ClickHouse 中 Time64 数据类型的文档，用于以亚秒级精度存储时间'
slug: /sql-reference/data-types/time64
sidebar_position: 17
sidebar_label: 'Time64'
title: 'Time64'
doc_type: 'reference'
---

# Time64 \{#time64\}

数据类型 `Time64` 表示带有小数秒的一天中的时刻（time-of-day）。
它不包含任何日历日期组件（日、月、年）。
参数 `precision` 定义小数位数，因此也就定义了最小时间粒度（tick size）。

时间粒度（精度）：10<sup>-precision</sup> 秒。有效范围：0..9。常用取值为 3（毫秒）、6（微秒）和 9（纳秒）。

**语法：**

```sql
Time64(precision)
```

在内部，`Time64` 以有符号 64 位十进制数（Decimal64）的形式存储秒的小数部分。
时间精度由 `precision` 参数决定。
不支持时区：为 `Time64` 指定时区会抛出错误。

与 `DateTime64` 不同，`Time64` 不存储日期部分。
另见 [`Time`](../../sql-reference/data-types/time.md)。

文本表示范围：当 `precision = 3` 时为 [-999:59:59.000, 999:59:59.999]。一般情况下，最小值为 `-999:59:59`，最大值为 `999:59:59`，并且最多带有 `precision` 位小数（例如，当 `precision = 9` 时，最小值为 `-999:59:59.999999999`）。

## 实现细节 \{#implementation-details\}

**表示形式**。  
带符号的 `Decimal64` 值，用于表示具有 `precision` 位小数的秒的小数部分。

**规范化**。  
将字符串解析为 `Time64` 时，时间组件会被规范化，而不会进行合法性校验。  
例如，`25:70:70` 会被解释为 `26:11:10`。

**负值**。  
支持并保留前导负号。  
负值通常来源于对 `Time64` 值进行算术运算。  
对于 `Time64`，文本输入（例如 `'-01:02:03.123'`）和数值输入（例如 `-3723.123`）中的负值都会被保留。

**饱和**。  
在拆解为组件或序列化为文本时，一天中的时间部分会被限制在区间 [-999:59:59.xxx, 999:59:59.xxx] 内。  
存储的数值可能超出该范围；然而，任何组件提取（小时、分钟、秒）和文本表示都会使用饱和值。

**时区**。  
`Time64` 不支持时区。  
在创建 `Time64` 类型或值时指定时区会抛出错误。  
同样，尝试对 `Time64` 列应用或更改时区也不被支持，并会导致错误。

## 示例 \{#examples\}

1. 创建一个包含 `Time64` 类型列的表，并向其中插入数据：

```

```

```

```

```

2. Filtering on `Time64` values

```

2. 按 `Time64` 值进行过滤

```

```

```

```

```

```

```

Note: `toTime64` parses numeric literals as seconds with a fractional part according to the specified precision, so provide the intended fractional digits explicitly.

3. Inspecting the resulting type:

```

注意：`toTime64` 会根据指定的精度，将数字字面量解析为带有小数部分的秒数，因此请显式提供预期的小数位数。

3. 检查结果类型：

```

```

```text
   ┌────────column─┬─type──────┐
1. │ 14:30:25.250 │ Time64(3) │
   └───────────────┴───────────┘
```

**另请参阅**

* [类型转换函数](../../sql-reference/functions/type-conversion-functions.md)
* [处理日期和时间的函数](../../sql-reference/functions/date-time-functions.md)
* [`date_time_input_format` 设置](../../operations/settings/settings-formats.md#date_time_input_format)
* [`date_time_output_format` 设置](../../operations/settings/settings-formats.md#date_time_output_format)
* [`timezone` 服务器配置参数](../../operations/server-configuration-parameters/settings.md#timezone)
* [`session_timezone` 设置](../../operations/settings/settings.md#session_timezone)
* [处理日期和时间的运算符](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
* [`Date` 数据类型](../../sql-reference/data-types/date.md)
* [`Time` 数据类型](../../sql-reference/data-types/time.md)
* [`DateTime` 数据类型](../../sql-reference/data-types/datetime.md)
