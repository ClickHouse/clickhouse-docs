---
description: '类型转换函数的文档'
sidebar_label: '类型转换'
slug: /sql-reference/functions/type-conversion-functions
title: '类型转换函数'
doc_type: 'reference'
---

# 类型转换函数 {#type-conversion-functions}

## 数据转换的常见问题 {#common-issues-with-data-conversion}

ClickHouse 通常遵循[与 C++ 程序相同的隐式转换行为](https://en.cppreference.com/w/cpp/language/implicit_conversion)。

`to<type>` 函数与 [cast](#cast) 在某些情况下会有不同的行为，例如在使用 [LowCardinality](../data-types/lowcardinality.md) 时：[cast](#cast) 会移除 [LowCardinality](../data-types/lowcardinality.md) 特性，而 `to<type>` 函数不会。对于 [Nullable](../data-types/nullable.md) 也是如此，这种行为不符合 SQL 标准，可以通过 [cast&#95;keep&#95;nullable](../../operations/settings/settings.md/#cast_keep_nullable) 设置进行修改。

:::note
当将某个数据类型的值转换为更小的数据类型（例如从 `Int64` 转换为 `Int32`），或在不兼容的数据类型之间转换（例如从 `String` 转换为 `Int`）时，请注意可能发生的数据丢失。务必仔细检查转换结果是否符合预期。
:::

示例：

```sql
SELECT
    toTypeName(toLowCardinality('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type

┌─source_type────────────┬─to_type_result_type────┬─cast_result_type─┐
│ LowCardinality(String) │ LowCardinality(String) │ String           │
└────────────────────────┴────────────────────────┴──────────────────┘

SELECT
    toTypeName(toNullable('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type

┌─source_type──────┬─to_type_result_type─┬─cast_result_type─┐
│ Nullable(String) │ Nullable(String)    │ String           │
└──────────────────┴─────────────────────┴──────────────────┘

SELECT
    toTypeName(toNullable('') AS val) AS source_type,
    toTypeName(toString(val)) AS to_type_result_type,
    toTypeName(CAST(val, 'String')) AS cast_result_type
SETTINGS cast_keep_nullable = 1

┌─source_type──────┬─to_type_result_type─┬─cast_result_type─┐
│ Nullable(String) │ Nullable(String)    │ Nullable(String) │
└──────────────────┴─────────────────────┴──────────────────┘
```

## 关于 `toString` 函数的说明 {#to-string-functions}

`toString` 函数族用于在数字、字符串（但不包括定长字符串）、日期以及带时间的日期之间进行转换。
所有这些函数都只接受一个参数。

- 在与字符串之间进行转换时，值的格式化或解析规则与 TabSeparated 格式（以及几乎所有其他文本格式）相同。如果字符串无法解析，将抛出异常并取消该查询。
- 在日期与数字之间进行转换时，日期对应于自 Unix 纪元开始以来的天数。
- 在带时间的日期与数字之间进行转换时，带时间的日期对应于自 Unix 纪元开始以来的秒数。
- 对于 `DateTime` 参数，`toString` 函数可以接收第二个字符串参数，其中包含时区名称，例如：`Europe/Amsterdam`。在这种情况下，时间将按照指定的时区进行格式化。

## 关于 `toDate`/`toDateTime` 函数的说明 {#to-date-and-date-time-functions}

`toDate`/`toDateTime` 函数的日期和日期时间格式定义如下：

```response
YYYY-MM-DD
YYYY-MM-DD hh:mm:ss
```

作为一个例外，当从 UInt32、Int32、UInt64 或 Int64 数值类型转换为 Date 时，如果该数值大于或等于 65536，则该数值会被解释为 Unix 时间戳（而不是天数），并被舍入到对应的日期。
这使得常见的写法 `toDate(unix_timestamp)` 得到支持，否则会报错，并且需要改为更繁琐的写法 `toDate(toDateTime(unix_timestamp))`。

日期与带时间的日期之间的转换是以自然方式执行的：要么添加零时间（00:00:00），要么丢弃时间部分。

数值类型之间的转换遵循与 C++ 中不同数值类型之间赋值相同的规则。

**示例**

查询：

```sql
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10
```

结果：

```response
┌──────────────────ts─┬─time_zone─────────┬─str_tz_datetime─────┐
│ 2023-09-08 19:14:59 │ Europe/Amsterdam  │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Andorra    │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Astrakhan  │ 2023-09-08 23:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Athens     │ 2023-09-08 22:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belfast    │ 2023-09-08 20:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belgrade   │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Berlin     │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Bratislava │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Brussels   │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Bucharest  │ 2023-09-08 22:14:59 │
└─────────────────────┴───────────────────┴─────────────────────┘
```

另请参阅 [`toUnixTimestamp`](#toUnixTimestamp) 函数。

## toBool {#tobool}

将输入值转换为 [`Bool`](../data-types/boolean.md) 类型的值。出现错误时抛出异常。

**语法**

```sql
toBool(expr)
```

**参数**

* `expr` — 返回数字或字符串的表达式。[表达式](/sql-reference/syntax#expressions)。

支持的参数类型：

* 类型为 (U)Int8/16/32/64/128/256 的值。
* 类型为 Float32/64 的值。
* 字符串 `true` 或 `false`（不区分大小写）。

**返回值**

* 根据对参数的求值结果返回 `true` 或 `false`。[Bool](../data-types/boolean.md)。

**示例**

查询：

```sql
SELECT
    toBool(toUInt8(1)),
    toBool(toInt8(-1)),
    toBool(toFloat32(1.01)),
    toBool('true'),
    toBool('false'),
    toBool('FALSE')
FORMAT Vertical
```

结果：

```response
toBool(toUInt8(1)):      true
toBool(toInt8(-1)):      true
toBool(toFloat32(1.01)): true
toBool('true'):          true
toBool('false'):         false
toBool('FALSE'):         false
```

## toInt8 {#toint8}

将输入值转换为 [`Int8`](../data-types/int-uint.md) 类型的值。发生错误时会抛出异常。

**语法**

```sql
toInt8(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt8('0xc0fe');`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
例如：`SELECT toInt8(128) == -128;`。
:::

**返回值**

* 8 位整数值。[Int8](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt8(-8),
    toInt8(-8.8),
    toInt8('-8')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toInt8(-8):   -8
toInt8(-8.8): -8
toInt8('-8'): -8
```

**另请参阅**

* [`toInt8OrZero`](#toint8orzero)。
* [`toInt8OrNull`](#toInt8OrNull)。
* [`toInt8OrDefault`](#toint8ordefault)。

## toInt8OrZero {#toint8orzero}

与 [`toInt8`](#toint8) 类似，此函数将输入值转换为 [Int8](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toInt8OrZero(x)
```

**参数**

* `x` — 数字的字符串表示。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：

* 普通 Float32/64 浮点数值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制数值的字符串表示，例如 `SELECT toInt8OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 8 位整数值，否则返回 `0`。[Int8](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt8OrZero('-8'),
    toInt8OrZero('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt8OrZero('-8'):  -8
toInt8OrZero('abc'): 0
```

**另请参阅**

* [`toInt8`](#toint8).
* [`toInt8OrNull`](#toInt8OrNull).
* [`toInt8OrDefault`](#toint8ordefault).

## toInt8OrNull {#toInt8OrNull}

类似于 [`toInt8`](#toint8)，此函数将输入值转换为 [Int8](../data-types/int-uint.md) 类型的值，但在出错时会返回 `NULL`。

**语法**

```sql
toInt8OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt8OrNull('0xc0fe');`。

:::note
如果输入值不能在 [Int8](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 8 位整数，否则返回 `NULL`。[Int8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt8OrNull('-8'),
    toInt8OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt8OrNull('-8'):  -8
toInt8OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toInt8`](#toint8)。
* [`toInt8OrZero`](#toint8orzero)。
* [`toInt8OrDefault`](#toint8ordefault)。

## toInt8OrDefault {#toint8ordefault}

与 [`toInt8`](#toint8) 类似，此函数将输入值转换为 [Int8](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toInt8OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Int8` 类型失败时要返回的默认值。[Int8](../data-types/int-uint.md)。

支持的参数类型：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

会返回默认值的情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt8OrDefault('0xc0fe', CAST('-1', 'Int8'));`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢出或下溢出。
这不被视为错误。
:::

**返回值**

* 成功时返回 8 位整数值，否则返回传入的默认值，如果未传入则返回 `0`。[Int8](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，这意味着它会截断数字的小数部分。
* 默认值的类型应与转换目标类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toInt8OrDefault('-8', CAST('-1', 'Int8')),
    toInt8OrDefault('abc', CAST('-1', 'Int8'))
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
toInt8OrDefault('-8', CAST('-1', 'Int8')):  -8
toInt8OrDefault('abc', CAST('-1', 'Int8')): -1
```

**另请参阅**

* [`toInt8`](#toint8)。
* [`toInt8OrZero`](#toint8orzero)。
* [`toInt8OrNull`](#toInt8OrNull)。

## toInt16 {#toint16}

将输入值转换为 [`Int16`](../data-types/int-uint.md) 类型的值。在出错时抛出异常。

**语法**

```sql
toInt16(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串形式。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串形式，例如 `SELECT toInt16('0xc0fe');`。

:::note
如果输入值无法在 [Int16](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不视为错误。
例如：`SELECT toInt16(32768) == -32768;`。
:::

**返回值**

* 16 位整数值。[Int16](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt16(-16),
    toInt16(-16.16),
    toInt16('-16')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toInt16(-16):    -16
toInt16(-16.16): -16
toInt16('-16'):  -16
```

**另请参阅**

* [`toInt16OrZero`](#toint16orzero)。
* [`toInt16OrNull`](#toint16ornull)。
* [`toInt16OrDefault`](#toint16ordefault)。

## toInt16OrZero {#toint16orzero}

与 [`toInt16`](#toint16) 类似，此函数将输入值转换为 [Int16](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toInt16OrZero(x)
```

**参数**

* `x` — 数值的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt16OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int16](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时返回 16 位整数值，否则返回 `0`。[Int16](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说，它会截断数值的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt16OrZero('-16'),
    toInt16OrZero('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt16OrZero('-16'): -16
toInt16OrZero('abc'): 0
```

**另请参阅**

* [`toInt16`](#toint16)。
* [`toInt16OrNull`](#toint16ornull)。
* [`toInt16OrDefault`](#toint16ordefault)。

## toInt16OrNull {#toint16ornull}

与 [`toInt16`](#toint16) 类似，此函数将输入值转换为 [Int16](../data-types/int-uint.md) 类型的值，但在出错时会返回 `NULL`。

**语法**

```sql
toInt16OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt16OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int16](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 16 位整数值，否则返回 `NULL`。[Int16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt16OrNull('-16'),
    toInt16OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt16OrNull('-16'): -16
toInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toInt16`](#toint16).
* [`toInt16OrZero`](#toint16orzero).
* [`toInt16OrDefault`](#toint16ordefault).

## toInt16OrDefault {#toint16ordefault}

与 [`toInt16`](#toint16) 类似，此函数将输入值转换为 [Int16](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt16OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Int16` 类型失败时返回的默认值。[Int16](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

会返回默认值的参数情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt16OrDefault('0xc0fe', CAST('-1', 'Int16'));`。

:::note
如果输入值无法在 [Int16](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 16 位整数值，否则返回传入的默认值；如果未传入则返回 `0`。[Int16](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
* 默认值的类型应与转换的目标类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toInt16OrDefault('-16', CAST('-1', 'Int16')),
    toInt16OrDefault('abc', CAST('-1', 'Int16'))
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt16OrDefault('-16', CAST('-1', 'Int16')): -16
toInt16OrDefault('abc', CAST('-1', 'Int16')): -1
```

**另请参阅**

* [`toInt16`](#toint16).
* [`toInt16OrZero`](#toint16orzero).
* [`toInt16OrNull`](#toint16ornull).

## toInt32 {#toint32}

将输入值转换为 [`Int32`](../data-types/int-uint.md) 类型的值。如果发生错误，则会抛出异常。

**语法**

```sql
toInt32(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt32('0xc0fe');`。

:::note
如果输入值不能在 [Int32](../data-types/int-uint.md) 的范围内表示，则结果会产生上溢或下溢。
这不被视为错误。
例如：`SELECT toInt32(2147483648) == -2147483648;`
:::

**返回值**

* 32 位整数值。[Int32](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt32(-32),
    toInt32(-32.32),
    toInt32('-32')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt32(-32):    -32
toInt32(-32.32): -32
toInt32('-32'):  -32
```

**另请参阅**

* [`toInt32OrZero`](#toint32orzero)。
* [`toInt32OrNull`](#toint32ornull)。
* [`toInt32OrDefault`](#toint32ordefault)。

## toInt32OrZero {#toint32orzero}

与 [`toInt32`](#toint32) 类似，此函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但如果发生错误则返回 `0`。

**语法**

```sql
toInt32OrZero(x)
```

**参数**

* `x` — 数字的字符串形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串形式，例如 `SELECT toInt32OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int32](../data-types/int-uint.md) 的取值范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 成功时为 32 位整数值，否则为 `0`。[Int32](../data-types/int-uint.md)

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt32OrZero('-32'),
    toInt32OrZero('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt32OrZero('-32'): -32
toInt32OrZero('abc'): 0
```

**另请参阅**

* [`toInt32`](#toint32)。
* [`toInt32OrNull`](#toint32ornull)。
* [`toInt32OrDefault`](#toint32ordefault)。

## toInt32OrNull {#toint32ornull}

与 [`toInt32`](#toint32) 类似，该函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但在出错时返回 `NULL`。

**语法**

```sql
toInt32OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt32OrNull('0xc0fe');`。

:::note
如果输入值不能在 [Int32](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 成功时为 32 位整数值，否则为 `NULL`。[Int32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt32OrNull('-32'),
    toInt32OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt32OrNull('-32'): -32
toInt32OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toInt32`](#toint32).
* [`toInt32OrZero`](#toint32orzero).
* [`toInt32OrDefault`](#toint32ordefault).

## toInt32OrDefault {#toint32ordefault}

与 [`toInt32`](#toint32) 类似，此函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 参数，则在发生错误时返回 `0`。

**语法**

```sql
toInt32OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Int32` 类型失败时要返回的默认值。[Int32](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的数值或其字符串表示。
* 类型为 Float32/64 的浮点数。

在以下情况下会返回默认值：

* Float32/64 数值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toInt32OrDefault('0xc0fe', CAST('-1', 'Int32'));`。

:::note
如果输入值不能在 [Int32](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 转换成功时返回 32 位整数值，否则在传入默认值时返回该默认值；如果未传入默认值，则返回 `0`。[Int32](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
* 默认值的类型应与目标转换类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toInt32OrDefault('-32', CAST('-1', 'Int32')),
    toInt32OrDefault('abc', CAST('-1', 'Int32'))
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt32OrDefault('-32', CAST('-1', 'Int32')): -32
toInt32OrDefault('abc', CAST('-1', 'Int32')): -1
```

**另请参阅**

* [`toInt32`](#toint32).
* [`toInt32OrZero`](#toint32orzero).
* [`toInt32OrNull`](#toint32ornull).

## toInt64 {#toint64}

将输入值转换为 [`Int64`](../data-types/int-uint.md) 类型的值。出错时会抛出异常。

**语法**

```sql
toInt64(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[表达式](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值。

不支持的类型：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt64('0xc0fe');`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的范围内表示，结果会发生上溢或下溢。
这不视为错误。
例如：`SELECT toInt64(9223372036854775808) == -9223372036854775808;`
:::

**返回值**

* 64 位整数值。[Int64](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt64(-64),
    toInt64(-64.64),
    toInt64('-64')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt64(-64):    -64
toInt64(-64.64): -64
toInt64('-64'):  -64
```

**另请参阅**

* [`toInt64OrZero`](#toint64orzero)。
* [`toInt64OrNull`](#toint64ornull)。
* [`toInt64OrDefault`](#toint64ordefault)。

## toInt64OrZero {#toint64orzero}

与 [`toInt64`](#toint64) 类似，此函数将输入值转换为 [Int64](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toInt64OrZero(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* Int8/16/32/128/256 及其无符号类型 (UInt8/16/32/128/256) 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt64OrZero('0xc0fe');`。

:::note
如果输入值不能在 [Int64](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 64 位整数值，否则返回 `0`。[Int64](../data-types/int-uint.md)。

:::note
该函数采用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt64OrZero('-64'),
    toInt64OrZero('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toInt64OrZero('-64'): -64
toInt64OrZero('abc'): 0
```

**另请参阅**

* [`toInt64`](#toint64)。
* [`toInt64OrNull`](#toint64ornull)。
* [`toInt64OrDefault`](#toint64ordefault)。

## toInt64OrNull {#toint64ornull}

与 [`toInt64`](#toint64) 类似，此函数将输入值转换为 [Int64](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toInt64OrNull(x)
```

**参数**

* `x` — 数字的字符串形式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串形式。

不支持的参数（返回 `\N`）

* Float32/64 值的字符串形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串形式，例如 `SELECT toInt64OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时为 64 位整数值，否则为 `NULL`。[Int64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说，它会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt64OrNull('-64'),
    toInt64OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toInt64OrNull('-64'): -64
toInt64OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toInt64`](#toint64)。
* [`toInt64OrZero`](#toint64orzero)。
* [`toInt64OrDefault`](#toint64ordefault)。

## toInt64OrDefault {#toint64ordefault}

与 [`toInt64`](#toint64) 类似，此函数将输入值转换为 [Int64](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toInt64OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Int64` 类型失败时返回的默认值。[Int64](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的数值。

以下情况将返回默认值：

* Float32/64 数值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt64OrDefault('0xc0fe', CAST('-1', 'Int64'));`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 64 位整数值，否则返回传入的默认值；如果未传入默认值则返回 `0`。[Int64](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数值的小数部分。
* 默认值的类型应与转换的目标类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toInt64OrDefault('-64', CAST('-1', 'Int64')),
    toInt64OrDefault('abc', CAST('-1', 'Int64'))
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toInt64OrDefault('-64', CAST('-1', 'Int64')): -64
toInt64OrDefault('abc', CAST('-1', 'Int64')): -1
```

**另请参阅**

* [`toInt64`](#toint64)。
* [`toInt64OrZero`](#toint64orzero)。
* [`toInt64OrNull`](#toint64ornull)。

## toInt128 {#toint128}

将输入值转换为 [`Int128`](../data-types/int-uint.md) 类型的值。发生错误时抛出异常。

**语法**

```sql
toInt128(expr)
```

**参数**

* `expr` — 返回数值或其字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt128('0xc0fe');`。

:::note
如果输入值无法在 [Int128](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 128 位整数值。[Int128](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数值的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt128(-128),
    toInt128(-128.8),
    toInt128('-128')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt128(-128):   -128
toInt128(-128.8): -128
toInt128('-128'): -128
```

**另请参阅**

* [`toInt128OrZero`](#toint128orzero)。
* [`toInt128OrNull`](#toint128ornull)。
* [`toInt128OrDefault`](#toint128ordefault)。

## toInt128OrZero {#toint128orzero}

与 [`toInt128`](#toint128) 类似，此函数将输入值转换为 [Int128](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toInt128OrZero(expr)
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt128OrZero('0xc0fe');`。

:::note
如果输入值不能在 [Int128](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时返回 128 位整数值，否则返回 `0`。[Int128](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt128OrZero('-128'),
    toInt128OrZero('abc')
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
toInt128OrZero('-128'): -128
toInt128OrZero('abc'):  0
```

**另请参阅**

* [`toInt128`](#toint128)。
* [`toInt128OrNull`](#toint128ornull)。
* [`toInt128OrDefault`](#toint128ordefault)。

## toInt128OrNull {#toint128ornull}

与 [`toInt128`](#toint128) 类似，此函数将输入值转换为 [Int128](../data-types/int-uint.md) 类型的值，如果发生错误则返回 `NULL`。

**语法**

```sql
toInt128OrNull(x)
```

**参数**

* `x` — 表示数字的字符串。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 表示二进制和十六进制值的字符串，例如 `SELECT toInt128OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int128](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时为 128 位整数值，否则为 `NULL`。[Int128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt128OrNull('-128'),
    toInt128OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt128OrNull('-128'): -128
toInt128OrNull('abc'):  ᴺᵁᴸᴸ
```

**另见**

* [`toInt128`](#toint128)。
* [`toInt128OrZero`](#toint128orzero)。
* [`toInt128OrDefault`](#toint128ordefault)。

## toInt128OrDefault {#toint128ordefault}

与 [`toInt128`](#toint128) 类似，此函数将输入值转换为 [Int128](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toInt128OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Int128` 类型失败时要返回的默认值。[Int128](../data-types/int-uint.md)。

支持的参数类型：

* (U)Int8/16/32/64/128/256。
* Float32/64。
* (U)Int8/16/32/128/256 的字符串表示形式。

会返回默认值的参数类型：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt128OrDefault('0xc0fe', CAST('-1', 'Int128'));`。

:::note
如果输入值无法在 [Int128](../data-types/int-uint.md) 的取值范围内表示，则结果会发生溢出或下溢。
这不会被视为错误。
:::

**返回值**

* 如果转换成功则返回 128 位整数值，否则返回传入的默认值；如果未传入默认值则返回 `0`。[Int128](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，也就是说会截断数字的小数部分。
* 默认值的类型应与转换的目标类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toInt128OrDefault('-128', CAST('-1', 'Int128')),
    toInt128OrDefault('abc', CAST('-1', 'Int128'))
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
toInt128OrDefault('-128', CAST('-1', 'Int128')): -128
toInt128OrDefault('abc', CAST('-1', 'Int128')):  -1
```

**另请参阅**

* [`toInt128`](#toint128)。
* [`toInt128OrZero`](#toint128orzero)。
* [`toInt128OrNull`](#toint128ornull)。

## toInt256 {#toint256}

将输入值转换为 [`Int256`](../data-types/int-uint.md) 类型的值。在出错时会抛出异常。

**语法**

```sql
toInt256(expr)
```

**参数**

* `expr` — 返回数字或数字字符串形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串形式。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串形式，例如 `SELECT toInt256('0xc0fe');`。

:::note
如果输入值无法在 [Int256](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 256 位整数值。[Int256](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说，它会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt256(-256),
    toInt256(-256.256),
    toInt256('-256')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt256(-256):     -256
toInt256(-256.256): -256
toInt256('-256'):   -256
```

**另请参阅**

* [`toInt256OrZero`](#toint256orzero)。
* [`toInt256OrNull`](#toint256ornull)。
* [`toInt256OrDefault`](#toint256ordefault)。

## toInt256OrZero {#toint256orzero}

与 [`toInt256`](#toint256) 类似，此函数将输入值转换为 [Int256](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toInt256OrZero(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt256OrZero('0xc0fe');`。

:::note
如果输入值不能在 [Int256](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 成功时为 256 位整数值，否则为 `0`。[Int256](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt256OrZero('-256'),
    toInt256OrZero('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toInt256OrZero('-256'): -256
toInt256OrZero('abc'):  0
```

**另请参阅**

* [`toInt256`](#toint256).
* [`toInt256OrNull`](#toint256ornull).
* [`toInt256OrDefault`](#toint256ordefault).

## toInt256OrNull {#toint256ornull}

与 [`toInt256`](#toint256) 类似，此函数将输入值转换为 [Int256](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toInt256OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt256OrNull('0xc0fe');`。

:::note
如果输入值不能在 [Int256](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 256 位整数值，否则返回 `NULL`。[Int256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说，它会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt256OrNull('-256'),
    toInt256OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toInt256OrNull('-256'): -256
toInt256OrNull('abc'):  ᴺᵁᴸᴸ
```

**另请参阅**

* [`toInt256`](#toint256).
* [`toInt256OrZero`](#toint256orzero).
* [`toInt256OrDefault`](#toint256ordefault).

## toInt256OrDefault {#toint256ordefault}

与 [`toInt256`](#toint256) 类似，此函数将输入值转换为 [Int256](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toInt256OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当转换为 `Int256` 类型失败时返回的默认值。[Int256](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

会返回默认值的情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt256OrDefault('0xc0fe', CAST('-1', 'Int256'));`。

:::note
如果输入值无法在 [Int256](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 如果成功，则返回 256 位整数值；否则，如果传入了默认值则返回默认值，未传入则返回 `0`。[Int256](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
* 默认值的类型应与转换目标类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toInt256OrDefault('-256', CAST('-1', 'Int256')),
    toInt256OrDefault('abc', CAST('-1', 'Int256'))
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
toInt256OrDefault('-256', CAST('-1', 'Int256')): -256
toInt256OrDefault('abc', CAST('-1', 'Int256')):  -1
```

**另请参阅**

* [`toInt256`](#toint256)。
* [`toInt256OrZero`](#toint256orzero)。
* [`toInt256OrNull`](#toint256ornull)。

## toUInt8 {#touint8}

将输入值转换为 [`UInt8`](../data-types/int-uint.md) 类型的值。出错时抛出异常。

**语法**

```sql
toUInt8(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[表达式](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt8('0xc0fe');`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不视为错误。
例如：`SELECT toUInt8(256) == 0;`。
:::

**返回值**

* 8 位无符号整数值。[UInt8](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt8(8),
    toUInt8(8.8),
    toUInt8('8')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toUInt8(8):   8
toUInt8(8.8): 8
toUInt8('8'): 8
```

**另请参阅**

* [`toUInt8OrZero`](#touint8orzero)。
* [`toUInt8OrNull`](#touint8ornull)。
* [`toUInt8OrDefault`](#touint8ordefault)。

## toUInt8OrZero {#touint8orzero}

与 [`toUInt8`](#touint8) 类似，此函数将输入值转换为 [UInt8](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toUInt8OrZero(x)
```

**参数**

* `x` — 数字的字符串形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：

* 常规 Float32/64 浮点值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt8OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 8 位无符号整数值，否则返回 `0`。[UInt8](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt8OrZero('-8'),
    toUInt8OrZero('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toUInt8OrZero('-8'):  0
toUInt8OrZero('abc'): 0
```

**另请参阅**

* [`toUInt8`](#touint8)。
* [`toUInt8OrNull`](#touint8ornull)。
* [`toUInt8OrDefault`](#touint8ordefault)。

## toUInt8OrNull {#touint8ornull}

与 [`toUInt8`](#touint8) 类似，此函数将输入值转换为 [UInt8](../data-types/int-uint.md) 类型的值，但在出错时返回 `NULL`。

**语法**

```sql
toUInt8OrNull(x)
```

**参数**

* `x` — 数值的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt8OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的取值范围内表示，将会导致结果发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 8 位无符号整数值，否则返回 `NULL`。[UInt8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)策略，即会截断数值的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt8OrNull('8'),
    toUInt8OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt8OrNull('8'):   8
toUInt8OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toUInt8`](#touint8)。
* [`toUInt8OrZero`](#touint8orzero)。
* [`toUInt8OrDefault`](#touint8ordefault)。

## toUInt8OrDefault {#touint8ordefault}

与 [`toUInt8`](#touint8) 类似，此函数将输入值转换为 [UInt8](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 参数，则在出错时返回 `0`。

**语法**

```sql
toUInt8OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 如果解析为 `UInt8` 类型失败时要返回的默认值。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

将返回默认值的情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt8OrDefault('0xc0fe', CAST('0', 'UInt8'));`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的范围内表示，则会发生结果的上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 如果解析成功，则返回 8 位无符号整数值；否则返回传入的默认值，如果未传入默认值则返回 `0`。[UInt8](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
* 默认值的类型应与目标类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toUInt8OrDefault('8', CAST('0', 'UInt8')),
    toUInt8OrDefault('abc', CAST('0', 'UInt8'))
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
toUInt8OrDefault('8', CAST('0', 'UInt8')):   8
toUInt8OrDefault('abc', CAST('0', 'UInt8')): 0
```

**另请参阅**

* [`toUInt8`](#touint8)。
* [`toUInt8OrZero`](#touint8orzero)。
* [`toUInt8OrNull`](#touint8ornull)。

## toUInt16 {#touint16}

将输入值转换为 [`UInt16`](../data-types/int-uint.md) 类型的值。如果出错则抛出异常。

**语法**

```sql
toUInt16(expr)
```

**参数**

* `expr` — 返回数字或数字字符串形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt16('0xc0fe');`。

:::note
如果输入值无法在 [UInt16](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
例如：`SELECT toUInt16(65536) == 0;`。
:::

**返回值**

* 16 位无符号整数值。[UInt16](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt16(16),
    toUInt16(16.16),
    toUInt16('16')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt16(16):    16
toUInt16(16.16): 16
toUInt16('16'):  16
```

**另请参阅**

* [`toUInt16OrZero`](#touint16orzero)。
* [`toUInt16OrNull`](#touint16ornull)。
* [`toUInt16OrDefault`](#touint16ordefault)。

## toUInt16OrZero {#touint16orzero}

与 [`toUInt16`](#touint16) 类似，此函数将输入值转换为 [UInt16](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toUInt16OrZero(x)
```

**参数**

* `x` — 数值的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt16OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt16](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时返回 16 位无符号整数值，否则返回 `0`。[UInt16](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说它会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt16OrZero('16'),
    toUInt16OrZero('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt16OrZero('16'):  16
toUInt16OrZero('abc'): 0
```

**另请参阅**

* [`toUInt16`](#touint16).
* [`toUInt16OrNull`](#touint16ornull).
* [`toUInt16OrDefault`](#touint16ordefault).

## toUInt16OrNull {#touint16ornull}

与 [`toUInt16`](#touint16) 类似，此函数将输入值转换为 [UInt16](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toUInt16OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toUInt16OrNull('0xc0fe');`。

:::note
如果输入值不能在 [UInt16](../data-types/int-uint.md) 的取值范围内表示，则结果会产生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时为 16 位无符号整数值，否则为 `NULL`。[UInt16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即直接截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt16OrNull('16'),
    toUInt16OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt16OrNull('16'):  16
toUInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toUInt16`](#touint16)。
* [`toUInt16OrZero`](#touint16orzero)。
* [`toUInt16OrDefault`](#touint16ordefault)。

## toUInt16OrDefault {#touint16ordefault}

与 [`toUInt16`](#touint16) 类似，此函数将输入值转换为类型为 [UInt16](../data-types/int-uint.md) 的值，但在出错时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toUInt16OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `UInt16` 类型失败时要返回的默认值。[UInt16](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

以下情况会返回默认值：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt16OrDefault('0xc0fe', CAST('0', 'UInt16'));`。

:::note
如果输入值不能在 [UInt16](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 16 位无符号整数值，否则返回传入的默认值；如果未传入，则返回 `0`。[UInt16](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
* 默认值的类型应与转换的目标类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toUInt16OrDefault('16', CAST('0', 'UInt16')),
    toUInt16OrDefault('abc', CAST('0', 'UInt16'))
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
toUInt16OrDefault('16', CAST('0', 'UInt16')):  16
toUInt16OrDefault('abc', CAST('0', 'UInt16')): 0
```

**另请参阅**

* [`toUInt16`](#touint16)。
* [`toUInt16OrZero`](#touint16orzero)。
* [`toUInt16OrNull`](#touint16ornull)。

## toUInt32 {#touint32}

将输入值转换为 [`UInt32`](../data-types/int-uint.md) 类型的值。如果发生错误，则抛出异常。

**语法**

```sql
toUInt32(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt32('0xc0fe');`。

:::note
如果输入值无法在 [UInt32](../data-types/int-uint.md) 的范围内表示，结果会发生上溢或下溢。
这不会被视为错误。
例如：`SELECT toUInt32(4294967296) == 0;`
:::

**返回值**

* 32 位无符号整数值。[UInt32](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt32(32),
    toUInt32(32.32),
    toUInt32('32')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toUInt32(32):    32
toUInt32(32.32): 32
toUInt32('32'):  32
```

**另请参阅**

* [`toUInt32OrZero`](#touint32orzero)。
* [`toUInt32OrNull`](#touint32ornull)。
* [`toUInt32OrDefault`](#touint32ordefault)。

## toUInt32OrZero {#touint32orzero}

与 [`toUInt32`](#touint32) 类似，此函数将输入值转换为 [UInt32](../data-types/int-uint.md) 类型的值，但在出错时返回 `0`。

**语法**

```sql
toUInt32OrZero(x)
```

**参数**

* `x` — 数值的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt32OrZero('0xc0fe');`。

:::note
如果输入值不能在 [UInt32](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 32 位无符号整数值，否则返回 `0`。[UInt32](../data-types/int-uint.md)

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)
方式，即截断数值的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt32OrZero('32'),
    toUInt32OrZero('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toUInt32OrZero('32'):  32
toUInt32OrZero('abc'): 0
```

**另请参阅**

* [`toUInt32`](#touint32)。
* [`toUInt32OrNull`](#touint32ornull)。
* [`toUInt32OrDefault`](#touint32ordefault)。

## toUInt32OrNull {#touint32ornull}

类似于 [`toUInt32`](#touint32)，此函数将输入值转换为 [UInt32](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toUInt32OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt32OrNull('0xc0fe');`。

:::note
如果输入值不能在 [UInt32](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 32 位无符号整数值，否则返回 `NULL`。[UInt32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，这意味着它会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt32OrNull('32'),
    toUInt32OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt32OrNull('32'):  32
toUInt32OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toUInt32`](#touint32)。
* [`toUInt32OrZero`](#touint32orzero)。
* [`toUInt32OrDefault`](#touint32ordefault)。

## toUInt32OrDefault {#touint32ordefault}

与 [`toUInt32`](#touint32) 类似，此函数将输入值转换为 [UInt32](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传递 `default` 参数，则在发生错误时返回 `0`。

**语法**

```sql
toUInt32OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `UInt32` 类型失败时要返回的默认值。[UInt32](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值。

会返回默认值的情况：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt32OrDefault('0xc0fe', CAST('0', 'UInt32'));`。

:::note
如果输入值无法在 [UInt32](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 32 位无符号整数值，否则返回传入的默认值，如果未传入则返回 `0`。[UInt32](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说会截断数字的小数部分。
* 默认值的类型应与转换的目标类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toUInt32OrDefault('32', CAST('0', 'UInt32')),
    toUInt32OrDefault('abc', CAST('0', 'UInt32'))
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt32OrDefault('32', CAST('0', 'UInt32')):  32
toUInt32OrDefault('abc', CAST('0', 'UInt32')): 0
```

**另请参阅**

* [`toUInt32`](#touint32)。
* [`toUInt32OrZero`](#touint32orzero)。
* [`toUInt32OrNull`](#touint32ornull)。

## toUInt64 {#touint64}

将输入值转换为 [`UInt64`](../data-types/int-uint.md) 类型的值。出错时抛出异常。

**语法**

```sql
toUInt64(expr)
```

**参数**

* `expr` — 返回数值或其字符串表示的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的类型：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt64('0xc0fe');`。

:::note
如果输入值不能在 [UInt64](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
例如：`SELECT toUInt64(18446744073709551616) == 0;`
:::

**返回值**

* 64 位无符号整数值。[UInt64](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt64(64),
    toUInt64(64.64),
    toUInt64('64')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toUInt64(64):    64
toUInt64(64.64): 64
toUInt64('64'):  64
```

**另请参阅**

* [`toUInt64OrZero`](#touint64orzero)。
* [`toUInt64OrNull`](#touint64ornull)。
* [`toUInt64OrDefault`](#touint64ordefault)。

## toUInt64OrZero {#touint64orzero}

与 [`toUInt64`](#touint64) 类似，该函数将输入值转换为 [UInt64](../data-types/int-uint.md) 类型的值，但在出错时返回 `0`。

**语法**

```sql
toUInt64OrZero(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt64OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt64](../data-types/int-uint.md) 的取值范围内表示，则结果会发生溢出（上溢或下溢）。
这不被视为错误。
:::

**返回值**

* 成功时为 64 位无符号整数值，否则为 `0`。[UInt64](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，这意味着会截断数值的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt64OrZero('64'),
    toUInt64OrZero('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toUInt64OrZero('64'):  64
toUInt64OrZero('abc'): 0
```

**另请参阅**

* [`toUInt64`](#touint64)。
* [`toUInt64OrNull`](#touint64ornull)。
* [`toUInt64OrDefault`](#touint64ordefault)。

## toUInt64OrNull {#touint64ornull}

与 [`toUInt64`](#touint64) 类似，此函数将输入值转换为 [UInt64](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toUInt64OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt64OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt64](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时返回 64 位无符号整数值，否则返回 `NULL`。[UInt64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt64OrNull('64'),
    toUInt64OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt64OrNull('64'):  64
toUInt64OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toUInt64`](#touint64)。
* [`toUInt64OrZero`](#touint64orzero)。
* [`toUInt64OrDefault`](#touint64ordefault)。

## toUInt64OrDefault {#touint64ordefault}

与 [`toUInt64`](#touint64) 类似，此函数将输入值转换为 [UInt64](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toUInt64OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `defauult`（可选）— 当解析为 `UInt64` 类型失败时要返回的默认值。[UInt64](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

会返回默认值的参数情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt64OrDefault('0xc0fe', CAST('0', 'UInt64'));`。

:::note
如果输入值不能在 [UInt64](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 如果转换成功，则返回 64 位无符号整数值；否则返回传入的默认值，如果未传入则返回 `0`。[UInt64](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
* 默认值的类型应与目标转换类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toUInt64OrDefault('64', CAST('0', 'UInt64')),
    toUInt64OrDefault('abc', CAST('0', 'UInt64'))
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
toUInt64OrDefault('64', CAST('0', 'UInt64')):  64
toUInt64OrDefault('abc', CAST('0', 'UInt64')): 0
```

**另请参阅**

* [`toUInt64`](#touint64)。
* [`toUInt64OrZero`](#touint64orzero)。
* [`toUInt64OrNull`](#touint64ornull)。

## toUInt128 {#touint128}

将输入值转换为 [`UInt128`](../data-types/int-uint.md) 类型的值。如果发生错误，会抛出异常。

**语法**

```sql
toUInt128(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[表达式](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt128('0xc0fe');`。

:::note
如果输入值无法在 [UInt128](../data-types/int-uint.md) 的范围内表示，结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 128 位无符号整数值。[UInt128](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt128(128),
    toUInt128(128.8),
    toUInt128('128')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toUInt128(128):   128
toUInt128(128.8): 128
toUInt128('128'): 128
```

**另请参阅**

* [`toUInt128OrZero`](#touint128orzero)。
* [`toUInt128OrNull`](#touint128ornull)。
* [`toUInt128OrDefault`](#touint128ordefault)。

## toUInt128OrZero {#touint128orzero}

与 [`toUInt128`](#touint128) 类似，此函数将输入值转换为 [UInt128](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toUInt128OrZero(expr)
```

**参数**

* `expr` — 返回数字或表示数字的字符串的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 类型值的字符串表示形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt128OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt128](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 如果转换成功，则返回 128 位无符号整数值，否则返回 `0`。[UInt128](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt128OrZero('128'),
    toUInt128OrZero('abc')
FORMAT Vertical;
```

结果：

```response
行 1:
──────
toUInt128OrZero('128'): 128
toUInt128OrZero('abc'): 0
```

**另请参阅**

* [`toUInt128`](#touint128)。
* [`toUInt128OrNull`](#touint128ornull)。
* [`toUInt128OrDefault`](#touint128ordefault)。

## toUInt128OrNull {#touint128ornull}

与 [`toUInt128`](#touint128) 类似，此函数将输入值转换为 [UInt128](../data-types/int-uint.md) 类型的值，但在出错时返回 `NULL`。

**语法**

```sql
toUInt128OrNull(x)
```

**参数**

* `x` — 数值的字符串表示形式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt128OrNull('0xc0fe');`。

:::note
如果输入值不能在 [UInt128](../data-types/int-uint.md) 的范围内表示，结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时返回 128 位无符号整数值，否则返回 `NULL`。[UInt128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，也就是说会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt128OrNull('128'),
    toUInt128OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt128OrNull('128'): 128
toUInt128OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toUInt128`](#touint128)。
* [`toUInt128OrZero`](#touint128orzero)。
* [`toUInt128OrDefault`](#touint128ordefault)。

## toUInt128OrDefault {#touint128ordefault}

与 [`toUInt128`](#toint128) 类似，此函数将输入值转换为 [UInt128](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未提供 `default` 值，则出错时返回 `0`。

**语法**

```sql
toUInt128OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `UInt128` 类型失败时要返回的默认值。[UInt128](../data-types/int-uint.md)。

支持的参数：

* (U)Int8/16/32/64/128/256。
* Float32/64。
* (U)Int8/16/32/128/256 的字符串表示形式。

会返回默认值的参数：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制值和十六进制值的字符串表示形式，例如：`SELECT toUInt128OrDefault('0xc0fe', CAST('0', 'UInt128'));`。

:::note
如果输入值无法在 [UInt128](../data-types/int-uint.md) 的取值范围内表示，则结果会发生溢出或下溢。
这不会被视为错误。
:::

**返回值**

* 成功时返回 128 位无符号整数值；否则，如果传入了默认值则返回默认值，如果未传入则返回 `0`。[UInt128](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说会截断数字的小数部分。
* 默认值的类型必须与目标转换类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toUInt128OrDefault('128', CAST('0', 'UInt128')),
    toUInt128OrDefault('abc', CAST('0', 'UInt128'))
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt128OrDefault('128', CAST('0', 'UInt128')): 128
toUInt128OrDefault('abc', CAST('0', 'UInt128')): 0
```

**另请参阅**

* [`toUInt128`](#touint128)。
* [`toUInt128OrZero`](#touint128orzero)。
* [`toUInt128OrNull`](#touint128ornull)。

## toUInt256 {#touint256}

将输入值转换为 [`UInt256`](../data-types/int-uint.md) 类型的值。如果发生错误，则会抛出异常。

**语法**

```sql
toUInt256(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[表达式](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toUInt256('0xc0fe');`。

:::note
如果输入值不能在 [UInt256](../data-types/int-uint.md) 的范围内表示，则结果将发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 256 位无符号整数值。[Int256](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt256(256),
    toUInt256(256.256),
    toUInt256('256')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toUInt256(256):     256
toUInt256(256.256): 256
toUInt256('256'):   256
```

**另请参阅**

* [`toUInt256OrZero`](#touint256orzero)。
* [`toUInt256OrNull`](#touint256ornull)。
* [`toUInt256OrDefault`](#touint256ordefault)。

## toUInt256OrZero {#touint256orzero}

与 [`toUInt256`](#touint256) 类似，此函数将输入值转换为 [UInt256](../data-types/int-uint.md) 类型的值；如果发生错误，则返回 `0`。

**语法**

```sql
toUInt256OrZero(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt256OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt256](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时返回 256 位无符号整数值，否则返回 `0`。[UInt256](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)的方式，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt256OrZero('256'),
    toUInt256OrZero('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt256OrZero('256'): 256
toUInt256OrZero('abc'): 0
```

**另请参阅**

* [`toUInt256`](#touint256)。
* [`toUInt256OrNull`](#touint256ornull)。
* [`toUInt256OrDefault`](#touint256ordefault)。

## toUInt256OrNull {#touint256ornull}

与 [`toUInt256`](#touint256) 类似，此函数将输入值转换为 [UInt256](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toUInt256OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt256OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt256](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时返回 256 位无符号整数值，否则返回 `NULL`。[UInt256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt256OrNull('256'),
    toUInt256OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt256OrNull('256'): 256
toUInt256OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toUInt256`](#touint256)。
* [`toUInt256OrZero`](#touint256orzero)。
* [`toUInt256OrDefault`](#touint256ordefault)。

## toUInt256OrDefault {#touint256ordefault}

类似于 [`toUInt256`](#touint256)，此函数将输入值转换为 [UInt256](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toUInt256OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数值或其字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `UInt256` 类型失败时返回的默认值。[UInt256](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

会返回默认值的参数情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt256OrDefault('0xc0fe', CAST('0', 'UInt256'));`

:::note
如果输入值无法在 [UInt256](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 256 位无符号整数值，否则返回传入的默认值，如果未传入则返回 `0`。[UInt256](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说会截断数值的小数部分。
* 默认值的类型应与转换目标类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toUInt256OrDefault('-256', CAST('0', 'UInt256')),
    toUInt256OrDefault('abc', CAST('0', 'UInt256'))
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toUInt256OrDefault('-256', CAST('0', 'UInt256')): 0
toUInt256OrDefault('abc', CAST('0', 'UInt256')):  0
```

**另请参见**

* [`toUInt256`](#touint256)。
* [`toUInt256OrZero`](#touint256orzero)。
* [`toUInt256OrNull`](#touint256ornull)。

## toFloat32 {#tofloat32}

将输入转换为 [`Float32`](../data-types/float.md) 类型的值。发生错误时会抛出异常。

**语法**

```sql
toFloat32(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* (U)Int8/16/32/64/128/256 类型的值。
* (U)Int8/16/32/128/256 类型值的字符串表示。
* Float32/64 类型的值，包括 `NaN` 和 `Inf`。
* Float32/64 类型值的字符串表示，包括不区分大小写的 `NaN` 和 `Inf`。

不支持的参数：

* 二进制和十六进制值的字符串表示，例如 `SELECT toFloat32('0xc0fe');`。

**返回值**

* 32 位浮点数值。[Float32](../data-types/float.md)。

**示例**

查询：

```sql
SELECT
    toFloat32(42.7),
    toFloat32('42.7'),
    toFloat32('NaN')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toFloat32(42.7):   42.7
toFloat32('42.7'): 42.7
toFloat32('NaN'):  nan
```

**另请参阅**

* [`toFloat32OrZero`](#tofloat32orzero)。
* [`toFloat32OrNull`](#tofloat32ornull)。
* [`toFloat32OrDefault`](#tofloat32ordefault)。

## toFloat32OrZero {#tofloat32orzero}

与 [`toFloat32`](#tofloat32) 类似，此函数将输入值转换为 [Float32](../data-types/float.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toFloat32OrZero(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 和 Float32/64 的字符串表示形式。

不支持的参数（返回 `0`）：

* 二进制和十六进制值的字符串表示形式，例如：`SELECT toFloat32OrZero('0xc0fe');`。

**返回值**

* 解析成功时返回 32 位 Float 值，否则返回 `0`。[Float32](../data-types/float.md)。

**示例**

查询：

```sql
SELECT
    toFloat32OrZero('42.7'),
    toFloat32OrZero('abc')
FORMAT Vertical;
```

结果：

```response
行 1:
──────
toFloat32OrZero('42.7'): 42.7
toFloat32OrZero('abc'):  0
```

**另请参阅**

* [`toFloat32`](#tofloat32).
* [`toFloat32OrNull`](#tofloat32ornull).
* [`toFloat32OrDefault`](#tofloat32ordefault).

## toFloat32OrNull {#tofloat32ornull}

与 [`toFloat32`](#tofloat32) 类似，此函数将输入值转换为 [Float32](../data-types/float.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toFloat32OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256、Float32/64 的字符串表示。

不支持的参数（返回 `\N`）：

* 二进制和十六进制值的字符串表示，例如 `SELECT toFloat32OrNull('0xc0fe');`。

**返回值**

* 成功时返回 32 位浮点值，否则返回 `\N`。[Float32](../data-types/float.md)。

**示例**

查询：

```sql
SELECT
    toFloat32OrNull('42.7'),
    toFloat32OrNull('abc')
FORMAT Vertical;
```

结果：

```response
行 1:
──────
toFloat32OrNull('42.7'): 42.7
toFloat32OrNull('abc'):  ᴺᵁᴸᴸ
```

**另请参阅**

* [`toFloat32`](#tofloat32).
* [`toFloat32OrZero`](#tofloat32orzero).
* [`toFloat32OrDefault`](#tofloat32ordefault).

## toFloat32OrDefault {#tofloat32ordefault}

与 [`toFloat32`](#tofloat32) 类似，此函数将输入值转换为 [Float32](../data-types/float.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toFloat32OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Float32` 类型失败时返回的默认值。[Float32](../data-types/float.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值。
* (U)Int8/16/32/128/256 的字符串表示。
* 类型为 Float32/64 的值，包括 `NaN` 和 `Inf`。
* Float32/64 的字符串表示，包括 `NaN` 和 `Inf`（不区分大小写）。

会返回默认值的参数：

* 二进制和十六进制值的字符串表示，例如：`SELECT toFloat32OrDefault('0xc0fe', CAST('0', 'Float32'));`。

**返回值**

* 成功时返回 32 位 Float 浮点值，否则如果传入了默认值则返回该默认值，如果未传入则返回 `0`。[Float32](../data-types/float.md)。

**示例**

查询：

```sql
SELECT
    toFloat32OrDefault('8', CAST('0', 'Float32')),
    toFloat32OrDefault('abc', CAST('0', 'Float32'))
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toFloat32OrDefault('8', CAST('0', 'Float32')):   8
toFloat32OrDefault('abc', CAST('0', 'Float32')): 0
```

**另请参阅**

* [`toFloat32`](#tofloat32).
* [`toFloat32OrZero`](#tofloat32orzero).
* [`toFloat32OrNull`](#tofloat32ornull).

## toFloat64 {#tofloat64}

将输入值转换为 [`Float64`](../data-types/float.md) 类型的值。出错时会抛出异常。

**语法**

```sql
toFloat64(expr)
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值。
* 类型为 (U)Int8/16/32/128/256 的字符串表示形式。
* 类型为 Float32/64 的值，包括 `NaN` 和 `Inf`。
* 类型为 Float32/64 的字符串表示形式，包括 `NaN` 和 `Inf`（不区分大小写）。

不支持的参数：

* 二进制值和十六进制值的字符串表示形式，例如 `SELECT toFloat64('0xc0fe');`。

**返回值**

* 64 位浮点数值。[Float64](../data-types/float.md)。

**示例**

查询：

```sql
SELECT
    toFloat64(42.7),
    toFloat64('42.7'),
    toFloat64('NaN')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toFloat64(42.7):   42.7
toFloat64('42.7'): 42.7
toFloat64('NaN'):  nan
```

**另请参阅**

* [`toFloat64OrZero`](#tofloat64orzero)。
* [`toFloat64OrNull`](#tofloat64ornull)。
* [`toFloat64OrDefault`](#tofloat64ordefault)。

## toFloat64OrZero {#tofloat64orzero}

与 [`toFloat64`](#tofloat64) 类似，此函数将输入值转换为 [Float64](../data-types/float.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toFloat64OrZero(x)
```

**参数**

* `x` — 数值的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256、Float32/64 的字符串表示形式。

不支持的参数（返回 `0`）：

* 二进制和十六进制值的字符串表示形式，例如 `SELECT toFloat64OrZero('0xc0fe');`。

**返回值**

* 成功时返回 64 位浮点数值，否则返回 `0`。[Float64](../data-types/float.md)。

**示例**

查询：

```sql
SELECT
    toFloat64OrZero('42.7'),
    toFloat64OrZero('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
toFloat64OrZero('42.7'): 42.7
toFloat64OrZero('abc'):  0
```

**另请参阅**

* [`toFloat64`](#tofloat64).
* [`toFloat64OrNull`](#tofloat64ornull).
* [`toFloat64OrDefault`](#tofloat64ordefault).

## toFloat64OrNull {#tofloat64ornull}

与 [`toFloat64`](#tofloat64) 类似，此函数将输入值转换为 [Float64](../data-types/float.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toFloat64OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256、Float32/64 的字符串表示形式。

不支持的参数（返回 `\N`）：

* 二进制和十六进制值的字符串表示形式，例如 `SELECT toFloat64OrNull('0xc0fe');`。

**返回值**

* 转换成功时返回 64 位浮点值，转换失败时返回 `\N`。[Float64](../data-types/float.md)。

**示例**

查询：

```sql
SELECT
    toFloat64OrNull('42.7'),
    toFloat64OrNull('abc')
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toFloat64OrNull('42.7'): 42.7
toFloat64OrNull('abc'):  ᴺᵁᴸᴸ
```

**另请参阅**

* [`toFloat64`](#tofloat64).
* [`toFloat64OrZero`](#tofloat64orzero).
* [`toFloat64OrDefault`](#tofloat64ordefault).

## toFloat64OrDefault {#tofloat64ordefault}

与 [`toFloat64`](#tofloat64) 类似，此函数将输入值转换为 [Float64](../data-types/float.md) 类型的值，但在出错时会返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toFloat64OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Float64` 类型失败时返回的默认值。[Float64](../data-types/float.md)。

支持的参数类型：

* 类型为 (U)Int8/16/32/64/128/256 的值。
* (U)Int8/16/32/128/256 的字符串表示形式。
* 类型为 Float32/64 的值，包括 `NaN` 和 `Inf`。
* Float32/64 的字符串表示形式，包括 `NaN` 和 `Inf`（不区分大小写）。

会返回默认值的情况：

* 二进制和十六进制值的字符串表示形式，例如：`SELECT toFloat64OrDefault('0xc0fe', CAST('0', 'Float64'));`。

**返回值**

* 成功时返回 64 位浮点数值，否则返回传入的默认值；如果未传入，则返回 `0`。[Float64](../data-types/float.md)。

**示例**

查询：

```sql
SELECT
    toFloat64OrDefault('8', CAST('0', 'Float64')),
    toFloat64OrDefault('abc', CAST('0', 'Float64'))
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
toFloat64OrDefault('8', CAST('0', 'Float64')):   8
toFloat64OrDefault('abc', CAST('0', 'Float64')): 0
```

**另请参阅**

* [`toFloat64`](#tofloat64).
* [`toFloat64OrZero`](#tofloat64orzero).
* [`toFloat64OrNull`](#tofloat64ornull).

## toBFloat16 {#tobfloat16}

将输入值转换为 [`BFloat16`](/sql-reference/data-types/float#bfloat16) 类型的值。
出错时会抛出异常。

**语法**

```sql
toBFloat16(expr)
```

**参数**

* `expr` — 返回数值或其字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值。
* (U)Int8/16/32/128/256 的字符串表示形式。
* 类型为 Float32/64 的值，包括 `NaN` 和 `Inf`。
* Float32/64 的字符串表示形式，包括 `NaN` 和 `Inf`（不区分大小写）。

**返回值**

* 16 位 brain-float 值。[BFloat16](/sql-reference/data-types/float#bfloat16)。

**示例**

```sql
SELECT toBFloat16(toFloat32(42.7))

42.5

SELECT toBFloat16(toFloat32('42.7'));

42.5

SELECT toBFloat16('42.7');

42.5
```

**另请参阅**

* [`toBFloat16OrZero`](#tobfloat16orzero)。
* [`toBFloat16OrNull`](#tobfloat16ornull)。

## toBFloat16OrZero {#tobfloat16orzero}

将 `String` 类型的输入值转换为 [`BFloat16`](/sql-reference/data-types/float#bfloat16) 类型的值。
如果字符串不能被解析为浮点数值，则函数返回零。

**语法**

```sql
toBFloat16OrZero(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* 数值的字符串表示形式。

不支持的参数（返回 `0`）：

* 二进制和十六进制值的字符串表示形式。
* 数值类型的值。

**返回值**

* 16 位 brain-float 值，否则返回 `0`。[BFloat16](/sql-reference/data-types/float#bfloat16)。

:::note
该函数在从字符串表示转换时允许静默发生精度损失。
:::

**示例**

```sql
SELECT toBFloat16OrZero('0x5E'); -- 不支持的参数

0

SELECT toBFloat16OrZero('12.3'); -- 典型用法

12.25

SELECT toBFloat16OrZero('12.3456789');

12.3125 -- 精度静默损失
```

**另见**

* [`toBFloat16`](#tobfloat16)。
* [`toBFloat16OrNull`](#tobfloat16ornull)。

## toBFloat16OrNull {#tobfloat16ornull}

将 String 类型的输入值转换为 [`BFloat16`](/sql-reference/data-types/float#bfloat16) 类型的值，
但如果该字符串不表示浮点数值，则函数返回 `NULL`。

**语法**

```sql
toBFloat16OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* 数值的字符串表示形式。

不支持的参数（返回 `NULL`）：

* 二进制和十六进制值的字符串表示形式。
* 数值类型的值。

**返回值**

* 16 位 brain-float 值，否则为 `NULL` (`\N`)。[BFloat16](/sql-reference/data-types/float#bfloat16)。

:::note
该函数在从字符串表示形式转换时可能会静默丢失精度。
:::

**示例**

```sql
SELECT toBFloat16OrNull('0x5E'); -- 不支持的参数

\N

SELECT toBFloat16OrNull('12.3'); -- 典型用法

12.25

SELECT toBFloat16OrNull('12.3456789');

12.3125 -- 精度静默损失
```

**另请参阅**

* [`toBFloat16`](#tobfloat16)。
* [`toBFloat16OrZero`](#tobfloat16orzero)。

## toDate {#todate}

将参数转换为 [Date](../data-types/date.md) 数据类型。

如果参数是 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)，则会将其截断，仅保留日期部分：

```sql
SELECT
    now() AS x,
    toDate(x)
```

```response
┌───────────────────x─┬─toDate(now())─┐
│ 2022-12-30 13:44:17 │    2022-12-30 │
└─────────────────────┴───────────────┘
```

如果参数是 [String](../data-types/string.md)，则会被解析为 [Date](../data-types/date.md) 或 [DateTime](../data-types/datetime.md)。如果被解析为 [DateTime](../data-types/datetime.md)，则仅使用其日期部分：

```sql
SELECT
    toDate('2022-12-30') AS x,
    toTypeName(x)
```

```response
┌──────────x─┬─toTypeName(toDate('2022-12-30'))─┐
│ 2022-12-30 │ Date                             │
└────────────┴──────────────────────────────────┘

返回 1 行。用时:0.001 秒。
```

```sql
SELECT
    toDate('2022-12-30 01:02:03') AS x,
    toTypeName(x)
```

```response
┌──────────x─┬─toTypeName(toDate('2022-12-30 01:02:03'))─┐
│ 2022-12-30 │ Date                                      │
└────────────┴───────────────────────────────────────────┘
```

如果参数是数字并且其值看起来像 UNIX 时间戳（大于 65535），则会将其解释为 [DateTime](../data-types/datetime.md)，然后在当前时区截断为 [Date](../data-types/date.md)。可以通过函数的第二个参数指定时区。截断为 [Date](../data-types/date.md) 的结果取决于所使用的时区：

```sql
SELECT
    now() AS current_time,
    toUnixTimestamp(current_time) AS ts,
    toDateTime(ts) AS time_Amsterdam,
    toDateTime(ts, 'Pacific/Apia') AS time_Samoa,
    toDate(time_Amsterdam) AS date_Amsterdam,
    toDate(time_Samoa) AS date_Samoa,
    toDate(ts) AS date_Amsterdam_2,
    toDate(ts, 'Pacific/Apia') AS date_Samoa_2
```

```response
第 1 行：
──────
current_time:     2022-12-30 13:51:54
ts:               1672404714
time_Amsterdam:   2022-12-30 13:51:54
time_Samoa:       2022-12-31 01:51:54
date_Amsterdam:   2022-12-30
date_Samoa:       2022-12-31
date_Amsterdam_2: 2022-12-30
date_Samoa_2:     2022-12-31
```

上面的示例演示了同一个 UNIX 时间戳如何在不同时区被解释为不同的日期。

如果参数是一个数字且小于 65536，则会被解释为自 1970-01-01（UNIX 纪元的第一天）以来的天数，并转换为 [Date](../data-types/date.md) 类型。它对应于 `Date` 数据类型的内部数值表示。示例：

```sql
SELECT toDate(12345)
```

```response
┌─toDate(12345)─┐
│    2003-10-20 │
└───────────────┘
```

此转换与时区无关。

如果参数超出 `Date` 类型的取值范围，其行为由具体实现决定，可能会饱和到所支持的最大日期值，或发生溢出：

```sql
SELECT toDate(10000000000.)
```

```response
┌─toDate(10000000000.)─┐
│           2106-02-07 │
└──────────────────────┘
```

`toDate` 函数还可以写成以下形式：

```sql
SELECT
    now() AS time,
    toDate(time),
    DATE(time),
    CAST(time, 'Date')
```

```response
┌────────────────time─┬─toDate(now())─┬─DATE(now())─┬─CAST(now(), 'Date')─┐
│ 2022-12-30 13:54:58 │    2022-12-30 │  2022-12-30 │          2022-12-30 │
└─────────────────────┴───────────────┴─────────────┴─────────────────────┘
```

## toDateOrZero {#todateorzero}

与 [toDate](#todate) 相同，但在收到无效参数时返回 [Date](../data-types/date.md) 的下界值。仅支持 [String](../data-types/string.md) 类型的参数。

**示例**

查询：

```sql
SELECT toDateOrZero('2022-12-30'), toDateOrZero('');
```

结果：

```response
┌─toDateOrZero('2022-12-30')─┬─toDateOrZero('')─┐
│                 2022-12-30 │       1970-01-01 │
└────────────────────────────┴──────────────────┘
```

## toDateOrNull {#todateornull}

与 [toDate](#todate) 相同，但在收到无效参数时返回 `NULL`。仅支持 [String](../data-types/string.md) 类型参数。

**示例**

查询：

```sql
SELECT toDateOrNull('2022-12-30'), toDateOrNull('');
```

结果：

```response
┌─toDateOrNull('2022-12-30')─┬─toDateOrNull('')─┐
│                 2022-12-30 │             ᴺᵁᴸᴸ │
└────────────────────────────┴──────────────────┘
```

## toDateOrDefault {#todateordefault}

与 [toDate](#todate) 类似，但在转换失败时会返回一个默认值。该默认值为第二个参数（如果提供），否则为 [Date](../data-types/date.md) 的下边界。

**语法**

```sql
toDateOrDefault(expr [, default_value])
```

**示例**

查询：

```sql
SELECT toDateOrDefault('2022-12-30'), toDateOrDefault('', '2023-01-01'::Date);
```

结果：

```response
┌─toDateOrDefault('2022-12-30')─┬─toDateOrDefault('', CAST('2023-01-01', 'Date'))─┐
│                    2022-12-30 │                                      2023-01-01 │
└───────────────────────────────┴─────────────────────────────────────────────────┘
```

## toDateTime {#todatetime}

将输入值转换为 [DateTime](../data-types/datetime.md)。

**语法**

```sql
toDateTime(expr[, time_zone ])
```

**参数**

* `expr` — 值。[String](../data-types/string.md)、[Int](../data-types/int-uint.md)、[Date](../data-types/date.md) 或 [DateTime](../data-types/datetime.md)。
* `time_zone` — 时区。[String](../data-types/string.md)。

:::note
如果 `expr` 是数字，则将其解释为自 Unix 纪元开始以来的秒数（即 Unix 时间戳）。
如果 `expr` 是 [String](../data-types/string.md)，则可以将其解释为 Unix 时间戳，或日期 / 含时间日期的字符串表示。
因此，由于存在歧义，明确禁止解析较短的数字字符串表示形式（最多 4 位数字），例如字符串 `'1999'` 既可以表示年份（Date / DateTime 的不完整字符串表示），也可以表示 Unix 时间戳。允许解析更长的数字字符串。
:::

**返回值**

* 一个 DateTime 值。[DateTime](../data-types/datetime.md)

**示例**

查询：

```sql
SELECT toDateTime('2022-12-30 13:44:17'), toDateTime(1685457500, 'UTC');
```

结果：

```response
┌─toDateTime('2022-12-30 13:44:17')─┬─toDateTime(1685457500, 'UTC')─┐
│               2022-12-30 13:44:17 │           2023-05-30 14:38:20 │
└───────────────────────────────────┴───────────────────────────────┘
```

## toDateTimeOrZero {#todatetimeorzero}

与 [toDateTime](#todatetime) 相同，但在收到无效参数时返回 [DateTime](../data-types/datetime.md) 的下界值。仅支持 [String](../data-types/string.md) 参数。

**示例**

查询：

```sql
SELECT toDateTimeOrZero('2022-12-30 13:44:17'), toDateTimeOrZero('');
```

结果：

```response
┌─toDateTimeOrZero('2022-12-30 13:44:17')─┬─toDateTimeOrZero('')─┐
│                     2022-12-30 13:44:17 │  1970-01-01 00:00:00 │
└─────────────────────────────────────────┴──────────────────────┘
```

## toDateTimeOrNull {#todatetimeornull}

与 [toDateTime](#todatetime) 相同，但在传入无效参数时返回 `NULL`。仅支持 [String](../data-types/string.md) 类型参数。

**示例**

查询：

```sql
SELECT toDateTimeOrNull('2022-12-30 13:44:17'), toDateTimeOrNull('');
```

结果：

```response
┌─toDateTimeOrNull('2022-12-30 13:44:17')─┬─toDateTimeOrNull('')─┐
│                     2022-12-30 13:44:17 │                 ᴺᵁᴸᴸ │
└─────────────────────────────────────────┴──────────────────────┘
```

## toDateTimeOrDefault {#todatetimeordefault}

类似于 [toDateTime](#todatetime)，但在转换失败时会返回一个默认值：如果指定了第三个参数，则使用该参数，否则使用 [DateTime](../data-types/datetime.md) 的最小值。

**语法**

```sql
toDateTimeOrDefault(expr [, time_zone [, default_value]])
```

**示例**

查询：

```sql
SELECT toDateTimeOrDefault('2022-12-30 13:44:17'), toDateTimeOrDefault('', 'UTC', '2023-01-01'::DateTime('UTC'));
```

结果：

```response
┌─toDateTimeOrDefault('2022-12-30 13:44:17')─┬─toDateTimeOrDefault('', 'UTC', CAST('2023-01-01', 'DateTime(\'UTC\')'))─┐
│                        2022-12-30 13:44:17 │                                                     2023-01-01 00:00:00 │
└────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────┘
```

## toDate32 {#todate32}

将参数转换为 [Date32](../data-types/date32.md) 数据类型。若值超出范围，`toDate32` 会返回 [Date32](../data-types/date32.md) 所支持的边界值。若参数类型为 [Date](../data-types/date.md)，则会同时考虑 Date 类型的取值边界。

**语法**

```sql
toDate32(expr)
```

**参数**

* `expr` — 表达式的值。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md) 或 [Date](../data-types/date.md)。

**返回值**

* 日历日期，类型为 [Date32](../data-types/date32.md)。

**示例**

1. 值在有效范围内时：

```sql
SELECT toDate32('1955-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1925-01-01'))─┐
│ 1955-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

2. 数值超出有效范围：

```sql
SELECT toDate32('1899-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1899-01-01'))─┐
│ 1900-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

3. 当使用 [Date](../data-types/date.md) 参数时：

```sql
SELECT toDate32(toDate('1899-01-01')) AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32(toDate('1899-01-01')))─┐
│ 1970-01-01 │ Date32                                     │
└────────────┴────────────────────────────────────────────┘
```

## toDate32OrZero {#todate32orzero}

与 [toDate32](#todate32) 相同，但如果接收到无效参数，则返回 [Date32](../data-types/date32.md) 的最小值。

**示例**

查询：

```sql
SELECT toDate32OrZero('1899-01-01'), toDate32OrZero('');
```

结果：

```response
┌─toDate32OrZero('1899-01-01')─┬─toDate32OrZero('')─┐
│                   1900-01-01 │         1900-01-01 │
└──────────────────────────────┴────────────────────┘
```

## toDate32OrNull {#todate32ornull}

与 [toDate32](#todate32) 相同，但在收到无效参数时返回 `NULL`。

**示例**

查询：

```sql
SELECT toDate32OrNull('1955-01-01'), toDate32OrNull('');
```

结果：

```response
┌─toDate32OrNull('1955-01-01')─┬─toDate32OrNull('')─┐
│                   1955-01-01 │               ᴺᵁᴸᴸ │
└──────────────────────────────┴────────────────────┘
```

## toDate32OrDefault {#todate32ordefault}

将参数转换为 [Date32](../data-types/date32.md) 数据类型。如果值超出范围，`toDate32OrDefault` 会返回 [Date32](../data-types/date32.md) 支持的下边界值。如果参数为 [Date](../data-types/date.md) 类型，则会考虑其取值范围的边界。若接收到无效参数，则返回默认值。

**示例**

查询：

```sql
SELECT
    toDate32OrDefault('1930-01-01', toDate32('2020-01-01')),
    toDate32OrDefault('xx1930-01-01', toDate32('2020-01-01'));
```

结果：

```response
┌─toDate32OrDefault('1930-01-01', toDate32('2020-01-01'))─┬─toDate32OrDefault('xx1930-01-01', toDate32('2020-01-01'))─┐
│                                              1930-01-01 │                                                2020-01-01 │
└─────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```

## toDateTime64 {#todatetime64}

将输入值转换为 [DateTime64](../data-types/datetime64.md) 类型的值。

**语法**

```sql
toDateTime64(expr, scale, [timezone])
```

**参数**

* `expr` — 值。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [DateTime](../data-types/datetime.md)。
* `scale` - 刻度大小（精度）：10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。
* `timezone`（可选）- 指定的 DateTime64 对象的时区。

**返回值**

* 具有亚秒级精度的日历日期和时间。[DateTime64](../data-types/datetime64.md)。

**示例**

1. 当取值在有效范围内时：

```sql
SELECT toDateTime64('1955-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('1955-01-01 00:00:00.000', 3))─┐
│ 1955-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

2. 作为具有精度的 Decimal 类型：

```sql
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800., 3))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
```

如果没有小数点，该值仍然会被解释为以秒为单位的 Unix 时间戳：

```sql
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

3. 使用 `timezone`：

```sql
SELECT toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```

## toDateTime64OrZero {#todatetime64orzero}

与 [toDateTime64](#todatetime64) 类似，此函数将输入值转换为 [DateTime64](../data-types/datetime64.md) 类型的值，但若参数无效，则返回 [DateTime64](../data-types/datetime64.md) 的最小值。

**语法**

```sql
toDateTime64OrZero(expr, scale, [timezone])
```

**参数**

* `expr` — 值。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [DateTime](../data-types/datetime.md)。
* `scale` - 刻度（精度）：10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。
* `timezone`（可选）- 指定 `DateTime64` 对象的时区。

**返回值**

* 具有亚秒级精度的日历日期和时间，否则为 `DateTime64` 的最小值：`1970-01-01 01:00:00.000`。[DateTime64](../data-types/datetime64.md)。

**示例**

查询：

```sql
SELECT toDateTime64OrZero('2008-10-12 00:00:00 00:30:30', 3) AS invalid_arg
```

结果：

```response
┌─────────────invalid_arg─┐
│ 1970-01-01 01:00:00.000 │
└─────────────────────────┘
```

**另请参阅**

* [toDateTime64](#todatetime64)。
* [toDateTime64OrNull](#todatetime64ornull)。
* [toDateTime64OrDefault](#todatetime64ordefault)。

## toDateTime64OrNull {#todatetime64ornull}

与 [toDateTime64](#todatetime64) 类似，此函数将输入值转换为 [DateTime64](../data-types/datetime64.md) 类型的值，但如果接收到无效参数则返回 `NULL`。

**语法**

```sql
toDateTime64OrNull(expr, scale, [timezone])
```

**参数**

* `expr` — 表达式的值。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [DateTime](../data-types/datetime.md)。
* `scale` - 刻度（精度）：10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。
* `timezone`（可选）- 指定的 DateTime64 对象的时区。

**返回值**

* 具有亚秒级精度的日历日期和时间，否则返回 `NULL`。[DateTime64](../data-types/datetime64.md)/[NULL](../data-types/nullable.md)。

**示例**

查询：

```sql
SELECT
    toDateTime64OrNull('1976-10-18 00:00:00.30', 3) AS valid_arg,
    toDateTime64OrNull('1976-10-18 00:00:00 30', 3) AS invalid_arg
```

结果：

```response
┌───────────────valid_arg─┬─invalid_arg─┐
│ 1976-10-18 00:00:00.300 │        ᴺᵁᴸᴸ │
└─────────────────────────┴─────────────┘
```

**另请参阅**

* [toDateTime64](#todatetime64)。
* [toDateTime64OrZero](#todatetime64orzero)。
* [toDateTime64OrDefault](#todatetime64ordefault)。

## toDateTime64OrDefault {#todatetime64ordefault}

与 [toDateTime64](#todatetime64) 类似，该函数将输入值转换为 [DateTime64](../data-types/datetime64.md) 类型的值，
但在接收到无效参数时，会返回 [DateTime64](../data-types/datetime64.md) 的默认值，
或返回提供的默认值。

**语法**

```sql
toDateTime64OrNull(expr, scale, [timezone, default])
```

**参数**

* `expr` — 值。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [DateTime](../data-types/datetime.md)。
* `scale` - 刻度大小（精度）：10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。
* `timezone`（可选）- 指定的 DateTime64 对象的时区。
* `default`（可选）- 当传入参数无效时要返回的默认值。[DateTime64](../data-types/datetime64.md)。

**返回值**

* 具有子秒精度的日历日期和时间；否则返回 `DateTime64` 的最小值，或在提供时返回 `default` 值。[DateTime64](../data-types/datetime64.md)。

**示例**

查询：

```sql
SELECT
    toDateTime64OrDefault('1976-10-18 00:00:00 30', 3) AS invalid_arg,
    toDateTime64OrDefault('1976-10-18 00:00:00 30', 3, 'UTC', toDateTime64('2001-01-01 00:00:00.00',3)) AS invalid_arg_with_default
```

结果：

```response
┌─────────────invalid_arg─┬─invalid_arg_with_default─┐
│ 1970-01-01 01:00:00.000 │  2000-12-31 23:00:00.000 │
└─────────────────────────┴──────────────────────────┘
```

**另请参阅**

* [toDateTime64](#todatetime64)。
* [toDateTime64OrZero](#todatetime64orzero)。
* [toDateTime64OrNull](#todatetime64ornull)。

## toDecimal32 {#todecimal32}

将输入值转换为 [`Decimal(9, S)`](../data-types/decimal.md) 类型且小数位数为 `S` 的值。发生错误时抛出异常。

**语法**

```sql
toDecimal32(expr, S)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。参见 [Expression](/sql-reference/syntax#expressions)。
* `S` — 介于 0 和 9 之间的 scale 参数，用于指定数字小数部分最多可以有多少位。类型为 [UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示形式。
* 类型为 Float32/64 的值或字符串表示形式。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf`（大小写不敏感）的值或字符串表示形式。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toDecimal32('0xc0fe', 1);`。

:::note
如果 `expr` 的值超过 `Decimal32` 的范围，则可能发生溢出：`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部分中多余的位数会被截断（不会四舍五入）。
整数部分中多余的位数将导致抛出异常。
:::

:::warning
进行转换时会截断多余的数字，并且在处理 Float32/Float64 输入时，由于操作是使用浮点指令执行的，其行为可能会出乎意料。
例如：`toDecimal32(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 的结果是 114.99。
可以使用 String 作为输入，使得运算使用底层整数类型：`toDecimal32('1.15', 2) = 1.15`
:::

**返回值**

* 类型为 `Decimal(9, S)` 的值。参见 [Decimal32(S)](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
    toDecimal32(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal32(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal32('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
a:      2
type_a: Decimal(9, 1)
b:      4.2
type_b: Decimal(9, 2)
c:      4.2
type_c: Decimal(9, 3)
```

**另请参阅**

* [`toDecimal32OrZero`](#todecimal32orzero)。
* [`toDecimal32OrNull`](#todecimal32ornull)。
* [`toDecimal32OrDefault`](#todecimal32ordefault)。

## toDecimal32OrZero {#todecimal32orzero}

与 [`toDecimal32`](#todecimal32) 类似，此函数将输入值转换为类型为 [Decimal(9, S)](../data-types/decimal.md) 的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal32OrZero(expr, S)
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 9 之间的 scale 参数，用于指定数字小数部分最多可以包含的位数。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示形式。
* 类型为 Float32/64 的字符串表示形式。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示形式。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toDecimal32OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal32` 的取值范围，则可能发生溢出：`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部分中过多的数字会被丢弃（不做四舍五入）。
整数部分中过多的数字会导致错误。
:::

**返回值**

* 若成功，则返回类型为 `Decimal(9, S)` 的值，否则返回带有 `S` 位小数的 `0`。[Decimal32(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal32OrZero(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrZero(toString('Inf'), 5) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
行 1:
──────
a:             -1.111
toTypeName(a): Decimal(9, 5)
b:             0
toTypeName(b): Decimal(9, 5)
```

**另请参阅**

* [`toDecimal32`](#todecimal32)。
* [`toDecimal32OrNull`](#todecimal32ornull)。
* [`toDecimal32OrDefault`](#todecimal32ordefault)。

## toDecimal32OrNull {#todecimal32ornull}

与 [`toDecimal32`](#todecimal32) 类似，此函数将输入值转换为类型为 [Nullable(Decimal(9, S))](../data-types/decimal.md) 的值，但在出错时返回 `0`。

**语法**

```sql
toDecimal32OrNull(expr, S)
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 9 之间的小数位数（scale）参数，用于指定数字的小数部分可以包含多少位数字。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* 值为 `NaN` 和 `Inf` 的 Float32/64 字符串表示。
* 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal32OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal32` 的取值范围，则可能发生溢出：`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部分中多余的数字会被截断（不进行四舍五入）。
整数部分中多余的数字将导致错误。
:::

**返回值**

* 成功时返回类型为 `Nullable(Decimal(9, S))` 的值，否则返回相同类型的 `NULL` 值。[Decimal32(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal32OrNull(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrNull(toString('Inf'), 5) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
a:             -1.111
toTypeName(a): Nullable(Decimal(9, 5))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(9, 5))
```

**另请参阅**

* [`toDecimal32`](#todecimal32)。
* [`toDecimal32OrZero`](#todecimal32orzero)。
* [`toDecimal32OrDefault`](#todecimal32ordefault)。

## toDecimal32OrDefault {#todecimal32ordefault}

与 [`toDecimal32`](#todecimal32) 类似，此函数将输入值转换为类型为 [Decimal(9, S)](../data-types/decimal.md) 的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 取值在 0 到 9 之间的 scale 参数，用于指定数字小数部分最多可以包含的位数。[UInt8](../data-types/int-uint.md)。
* `default`（可选）— 当解析为 `Decimal32(S)` 类型失败时返回的默认值。[Decimal32(S)](../data-types/decimal.md)。

支持的参数：

* (U)Int8/16/32/64/128/256 类型的字符串表示。
* Float32/64 类型的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal32OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal32` 的取值范围，可能会发生溢出：`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部分中过多的数字会被丢弃（不进行四舍五入）。
整数部分中过多的数字会导致错误。
:::

:::warning
当使用 Float32/Float64 作为输入时，由于转换是使用浮点指令执行的，会丢弃多余的数字，并且在某些情况下可能表现出意料之外的行为。
例如：`toDecimal32OrDefault(1.15, 2)` 等于 `1.14`，因为在浮点计算中 1.15 * 100 的结果是 114.99。
你可以使用 `String` 作为输入，从而让操作使用底层的整数类型：`toDecimal32OrDefault('1.15', 2) = 1.15`
:::

**返回值**

* 若转换成功，返回 `Decimal(9, S)` 类型的值，否则返回传入的默认值；如果未传入默认值，则返回 `0`。[Decimal32(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal32OrDefault(toString(0.0001), 5) AS a,
    toTypeName(a),
    toDecimal32OrDefault('Inf', 0, CAST('-1', 'Decimal32(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
行 1:
──────
a:             0.0001
toTypeName(a): Decimal(9, 5)
b:             -1
toTypeName(b): Decimal(9, 0)
```

**另请参阅**

* [`toDecimal32`](#todecimal32).
* [`toDecimal32OrZero`](#todecimal32orzero).
* [`toDecimal32OrNull`](#todecimal32ornull).

## toDecimal64 {#todecimal64}

将输入值转换为类型为 [`Decimal(18, S)`](../data-types/decimal.md)、小数位数为 `S` 的值。若发生错误则抛出异常。

**语法**

```sql
toDecimal64(expr, S)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 介于 0 和 18 之间的 Scale 参数，用于指定数字小数部分可以有多少位。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值或其字符串表示形式。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf`（不区分大小写）的值或字符串表示形式。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toDecimal64('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal64` 的范围，则可能发生溢出：`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`。
小数部分多余的位数将被丢弃（不会四舍五入）。
整数部分多余的位数将导致抛出异常。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃多余的数字，并且由于操作是使用浮点指令执行的，因此可能以出乎意料的方式运行。
例如：`toDecimal64(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 的结果是 114.99。
可以使用 String 类型的输入，从而使运算使用底层的整数类型：`toDecimal64('1.15', 2) = 1.15`
:::

**返回值**

* 类型为 `Decimal(18, S)` 的值。[Decimal64(S)](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
    toDecimal64(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal64(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal64('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
a:      2
type_a: Decimal(18, 1)
b:      4.2
type_b: Decimal(18, 2)
c:      4.2
type_c: Decimal(18, 3)
```

**另请参阅**

* [`toDecimal64OrZero`](#todecimal64orzero)。
* [`toDecimal64OrNull`](#todecimal64ornull)。
* [`toDecimal64OrDefault`](#todecimal64ordefault)。

## toDecimal64OrZero {#todecimal64orzero}

类似于 [`toDecimal64`](#todecimal64)，此函数将输入值转换为 [Decimal(18, S)](../data-types/decimal.md) 类型的值，但在出错时返回 `0`。

**语法**

```sql
toDecimal64OrZero(expr, S)
```

**参数**

* `expr` — 数值的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 18 之间的刻度参数，用于指定数值小数部分最多可以包含的位数。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* 值为 `NaN` 和 `Inf` 的 Float32/64 字符串表示。
* 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal64OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal64` 的取值范围，则可能发生溢出：`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`。
小数部分中多余的数字会被直接丢弃（不进行四舍五入）。
整数部分中多余的数字会导致报错。
:::

**返回值**

* 成功时返回类型为 `Decimal(18, S)` 的值，否则返回小数位数为 `S` 的 `0`。[Decimal64(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal64OrZero(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrZero(toString('Inf'), 18) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
行 1:
──────
a:             0.0001
toTypeName(a): Decimal(18, 18)
b:             0
toTypeName(b): Decimal(18, 18)
```

**另请参阅**

* [`toDecimal64`](#todecimal64)。
* [`toDecimal64OrNull`](#todecimal64ornull)。
* [`toDecimal64OrDefault`](#todecimal64ordefault)。

## toDecimal64OrNull {#todecimal64ornull}

与 [`toDecimal64`](#todecimal64) 类似，此函数将输入值转换为 [Nullable(Decimal(18, S))](../data-types/decimal.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal64OrNull(expr, S)
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 到 18 之间的标度（scale）参数，用于指定数字小数部分最多可以包含多少位数字。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示形式。
* 类型为 Float32/64 的字符串表示形式。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示形式。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toDecimal64OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的数值超出 `Decimal64` 的取值范围，则会发生溢出：`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`。
多余的小数位会被丢弃（不会进行四舍五入）。
整数部分多出的数字会导致错误。
:::

**返回值**

* 如果成功，返回类型为 `Nullable(Decimal(18, S))` 的值；否则返回相同类型的 `NULL` 值。[Decimal64(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal64OrNull(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrNull(toString('Inf'), 18) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Nullable(Decimal(18, 18))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(18, 18))
```

**另请参阅**

* [`toDecimal64`](#todecimal64)。
* [`toDecimal64OrZero`](#todecimal64orzero)。
* [`toDecimal64OrDefault`](#todecimal64ordefault)。

## toDecimal64OrDefault {#todecimal64ordefault}

类似于 [`toDecimal64`](#todecimal64)，此函数将输入值转换为 [Decimal(18, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 18 之间的 scale 参数，用于指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。
* `default`（可选）— 当解析为 `Decimal64(S)` 类型失败时返回的默认值。[Decimal64(S)](../data-types/decimal.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal64OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal64` 的取值范围 `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`，可能会发生溢出。
小数部分中多余的数字会被直接丢弃（不会四舍五入）。
整数部分中多余的数字会导致错误。
:::

:::warning
当处理 Float32/Float64 输入时，由于操作是使用浮点指令执行的，转换会丢弃额外的数字，并且可能会以非预期的方式工作。
例如：`toDecimal64OrDefault(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 等于 114.99。
您可以使用 String 作为输入，使操作使用底层整数类型：`toDecimal64OrDefault('1.15', 2) = 1.15`
:::

**返回值**

* 成功时返回 `Decimal(18, S)` 类型的值，否则返回传入的默认值，如果未传入则返回 `0`。[Decimal64(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal64OrDefault(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrDefault('Inf', 0, CAST('-1', 'Decimal64(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(18, 18)
b:             -1
toTypeName(b): Decimal(18, 0)
```

**另请参阅**

* [`toDecimal64`](#todecimal64)。
* [`toDecimal64OrZero`](#todecimal64orzero)。
* [`toDecimal64OrNull`](#todecimal64ornull)。

## toDecimal128 {#todecimal128}

将输入值转换为类型为 [`Decimal(38, S)`](../data-types/decimal.md)、标度（scale）为 `S` 的值。出错时抛出异常。

**语法**

```sql
toDecimal128(expr, S)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[表达式](/sql-reference/syntax#expressions)。
* `S` — 介于 0 和 38 之间的小数位数参数，用于指定数字小数部分最多可以有多少位数字。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值或其字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf`（不区分大小写）的值或其字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal128('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal128` 的范围，则可能发生溢出：`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`。
小数部分中过多的数字会被直接丢弃（不进行四舍五入）。
整数部分中过多的数字会导致抛出异常。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃多余的数字，并且由于运算是使用浮点指令执行的，因此可能出现非预期的结果。
例如：`toDecimal128(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 的结果是 114.99。
你可以使用字符串类型的输入，使运算基于底层整数类型进行：`toDecimal128('1.15', 2) = 1.15`
:::

**返回值**

* 类型为 `Decimal(38, S)` 的值。[Decimal128(S)](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
    toDecimal128(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal128(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal128('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
a:      99
type_a: Decimal(38, 1)
b:      99.67
type_b: Decimal(38, 2)
c:      99.67
type_c: Decimal(38, 3)
```

**另请参阅**

* [`toDecimal128OrZero`](#todecimal128orzero)。
* [`toDecimal128OrNull`](#todecimal128ornull)。
* [`toDecimal128OrDefault`](#todecimal128ordefault)。

## toDecimal128OrZero {#todecimal128orzero}

与 [`toDecimal128`](#todecimal128) 类似，此函数将输入值转换为 [Decimal(38, S)](../data-types/decimal.md) 类型的值，但在出错时返回 `0`。

**语法**

```sql
toDecimal128OrZero(expr, S)
```

**参数**

* `expr` — 数值的字符串表示。 [String](../data-types/string.md)。
* `S` — 介于 0 和 38 之间的 scale 参数，用于指定数字小数部分最多可以包含的位数。 [UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal128OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal128` 的范围 `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`，会发生溢出。
小数部分中过多的数字会被截断（不进行四舍五入）。
整数部分中过多的数字会导致错误。
:::

**返回值**

* 成功时返回类型为 `Decimal(38, S)` 的值，否则返回带有 `S` 位小数的 `0`。 [Decimal128(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal128OrZero(toString(0.0001), 38) AS a,
    toTypeName(a),
    toDecimal128OrZero(toString('Inf'), 38) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
行 1:
──────
a:             0.0001
toTypeName(a): Decimal(38, 38)
b:             0
toTypeName(b): Decimal(38, 38)
```

**另请参阅**

* [`toDecimal128`](#todecimal128)。
* [`toDecimal128OrNull`](#todecimal128ornull)。
* [`toDecimal128OrDefault`](#todecimal128ordefault)。

## toDecimal128OrNull {#todecimal128ornull}

与 [`toDecimal128`](#todecimal128) 类似，此函数将输入值转换为 [Nullable(Decimal(38, S))](../data-types/decimal.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal128OrNull(expr, S)
```

**参数**

* `expr` — 数值的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 到 38 之间的标度（scale）参数，用于指定数字小数部分最多可以包含的位数。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal128OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal128` 的范围，则可能发生溢出：`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`。
小数部分中多余的数字会被丢弃（不进行四舍五入）。
整数部分中多余的数字会导致报错。
:::

**返回值**

* 成功时返回类型为 `Nullable(Decimal(38, S))` 的值，否则返回相同类型的 `NULL` 值。[Decimal128(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal128OrNull(toString(1/42), 38) AS a,
    toTypeName(a),
    toDecimal128OrNull(toString('Inf'), 38) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Nullable(Decimal(38, 38))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(38, 38))
```

**另请参阅**

* [`toDecimal128`](#todecimal128)。
* [`toDecimal128OrZero`](#todecimal128orzero)。
* [`toDecimal128OrDefault`](#todecimal128ordefault)。

## toDecimal128OrDefault {#todecimal128ordefault}

与 [`toDecimal128`](#todecimal128) 类似，此函数将输入值转换为 [Decimal(38, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 38 之间的刻度（scale）参数，指定数字小数部分最多可以有多少位数字。[UInt8](../data-types/int-uint.md)。
* `default`（可选）— 当解析为 `Decimal128(S)` 类型失败时返回的默认值。[Decimal128(S)](../data-types/decimal.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal128OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal128` 的范围 `( -1 * 10^(38 - S), 1 * 10^(38 - S) )`，则可能发生溢出。
小数部分中多出的数字会被丢弃（不会四舍五入）。
整数部分中多出的数字会导致错误。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃多余的数字，并且由于运算是使用浮点指令执行的，因此可能会产生非预期的结果。
例如：`toDecimal128OrDefault(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 的结果是 114.99。
可以使用字符串形式的输入，这样运算会使用底层整数类型：`toDecimal128OrDefault('1.15', 2) = 1.15`
:::

**返回值**

* 若成功则返回类型为 `Decimal(38, S)` 的值，否则返回传入的默认值，如果未传入则返回 `0`。[Decimal128(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal128OrDefault(toString(1/42), 18) AS a,
    toTypeName(a),
    toDecimal128OrDefault('Inf', 0, CAST('-1', 'Decimal128(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(38, 18)
b:             -1
toTypeName(b): Decimal(38, 0)
```

**另请参阅**

* [`toDecimal128`](#todecimal128)。
* [`toDecimal128OrZero`](#todecimal128orzero)。
* [`toDecimal128OrNull`](#todecimal128ornull)。

## toDecimal256 {#todecimal256}

将输入值转换为类型为 [`Decimal(76, S)`](../data-types/decimal.md)、小数位数为 `S` 的值。发生错误时抛出异常。

**语法**

```sql
toDecimal256(expr, S)
```

**参数**

* `expr` — 返回数字或数字的字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 介于 0 和 76 之间的 scale（小数位数）参数，指定数字小数部分可以拥有的位数。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值或其字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf`（不区分大小写）的值或字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal256('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal256` 的边界，则可能发生溢出：`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。
多余的小数位会被丢弃（不会四舍五入）。
整数部分多出的位数会导致抛出异常。
:::

:::warning
在使用 Float32/Float64 作为输入时，由于转换是通过浮点指令执行的，会丢弃额外的数字，可能导致产生非预期的结果。
例如：`toDecimal256(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 等于 114.99。
可以使用 String 类型作为输入，使运算基于底层整数类型执行：`toDecimal256('1.15', 2) = 1.15`
:::

**返回值**

* 类型为 `Decimal(76, S)` 的值。[Decimal256(S)](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
    toDecimal256(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal256(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal256('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical;
```

结果：

```response
第 1 行：
──────
a:      99
type_a: Decimal(76, 1)
b:      99.67
type_b: Decimal(76, 2)
c:      99.67
type_c: Decimal(76, 3)
```

**另请参阅**

* [`toDecimal256OrZero`](#todecimal256orzero)。
* [`toDecimal256OrNull`](#todecimal256ornull)。
* [`toDecimal256OrDefault`](#todecimal256ordefault)。

## toDecimal256OrZero {#todecimal256orzero}

与 [`toDecimal256`](#todecimal256) 类似，此函数将输入值转换为 [Decimal(76, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal256OrZero(expr, S)
```

**参数**

* `expr` — 数值的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 76 之间的刻度参数，指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。

支持的参数：

* (U)Int8/16/32/64/128/256 类型值的字符串表示。
* Float32/64 类型值的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal256OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal256` 的范围，则可能发生溢出：`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。
小数部分中多余的位数会被截断（不会四舍五入）。
整数部分中多余的位数会导致错误。
:::

**返回值**

* 成功时返回类型为 `Decimal(76, S)` 的值，否则返回带有 `S` 位小数的 `0`。[Decimal256(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal256OrZero(toString(0.0001), 76) AS a,
    toTypeName(a),
    toDecimal256OrZero(toString('Inf'), 76) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
行 1:
──────
a:             0.0001
toTypeName(a): Decimal(76, 76)
b:             0
toTypeName(b): Decimal(76, 76)
```

**另请参阅**

* [`toDecimal256`](#todecimal256)。
* [`toDecimal256OrNull`](#todecimal256ornull)。
* [`toDecimal256OrDefault`](#todecimal256ordefault)。

## toDecimal256OrNull {#todecimal256ornull}

类似于 [`toDecimal256`](#todecimal256)，此函数将输入值转换为类型为 [Nullable(Decimal(76, S))](../data-types/decimal.md) 的值，但在出错时返回 `0`。

**语法**

```sql
toDecimal256OrNull(expr, S)
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 到 76 之间的 scale 参数，用于指定数字小数部分允许的位数。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal256OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal256` 的范围 `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`，则可能会发生溢出。
小数部分中过多的数字会被截断（不会四舍五入）。
整数部分中过多的数字会导致错误。
:::

**返回值**

* 成功时返回类型为 `Nullable(Decimal(76, S))` 的值，否则返回相同类型的 `NULL` 值。[Decimal256(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal256OrNull(toString(1/42), 76) AS a,
    toTypeName(a),
    toDecimal256OrNull(toString('Inf'), 76) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Nullable(Decimal(76, 76))
b:             ᴺᵁᴸᴸ
toTypeName(b): Nullable(Decimal(76, 76))
```

**另请参阅**

* [`toDecimal256`](#todecimal256)。
* [`toDecimal256OrZero`](#todecimal256orzero)。
* [`toDecimal256OrDefault`](#todecimal256ordefault)。

## toDecimal256OrDefault {#todecimal256ordefault}

与 [`toDecimal256`](#todecimal256) 类似，此函数将输入值转换为 [Decimal(76, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal256OrDefault(expr, S[, default])
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 76 之间的 scale 参数，指定数字的小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。
* `default`（可选）— 当解析为 `Decimal256(S)` 类型失败时返回的默认值。[Decimal256(S)](../data-types/decimal.md)。

支持的参数：

* (U)Int8/16/32/64/128/256 类型的字符串表示。
* Float32/64 类型的字符串表示。

不支持的参数：

* 值为 `NaN` 和 `Inf` 的 Float32/64 字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal256OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal256` 的取值范围，则可能发生溢出：`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。
小数部分中多余的数字会被丢弃（不会四舍五入）。
整数部分中多余的数字会导致报错。
:::

:::warning
在使用 Float32/Float64 输入时，转换会丢弃多余的数字，并且由于操作是使用浮点指令执行的，可能会出现非预期的行为。
例如：`toDecimal256OrDefault(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 的结果是 114.99。
可以使用 String 输入，使运算基于底层整数类型：`toDecimal256OrDefault('1.15', 2) = 1.15`
:::

**返回值**

* 成功时返回类型为 `Decimal(76, S)` 的值，否则返回传入的默认值，如果未传入则返回 `0`。[Decimal256(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal256OrDefault(toString(1/42), 76) AS a,
    toTypeName(a),
    toDecimal256OrDefault('Inf', 0, CAST('-1', 'Decimal256(0)')) AS b,
    toTypeName(b)
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(76, 76)
b:             -1
toTypeName(b): Decimal(76, 0)
```

**另请参阅**

* [`toDecimal256`](#todecimal256)。
* [`toDecimal256OrZero`](#todecimal256orzero)。
* [`toDecimal256OrNull`](#todecimal256ornull)。

## toString {#tostring}

将值转换为其字符串表示。
对于 DateTime 参数，该函数可以接受第二个 String 参数，其中包含时区名称。

**语法**

```sql
toString(值[, 时区])
```

**参数**

* `value`: 要转换为字符串的值。[`Any`](/sql-reference/data-types)。
* `timezone`: 可选。用于 `DateTime` 转换的时区名称。[`String`](/sql-reference/data-types/string)。

**返回值**

* 返回输入值的字符串形式。[`String`](/sql-reference/data-types/string)。

**示例**

**用法示例**

```sql title="Query"
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10;
```

```response title="Response"
┌──────────────────ts─┬─time_zone─────────┬─str_tz_datetime─────┐
│ 2023-09-08 19:14:59 │ Europe/Amsterdam  │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Andorra    │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Astrakhan  │ 2023-09-08 23:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Athens     │ 2023-09-08 22:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belfast    │ 2023-09-08 20:14:59 │
└─────────────────────┴───────────────────┴─────────────────────┘
```

## toFixedString {#tofixedstring}

将一个 [String](../data-types/string.md) 类型的参数转换为 [FixedString(N)](../data-types/fixedstring.md) 类型（长度固定为 N 的字符串）。\
如果字符串的字节数少于 N，则在右侧用空字节（null 字节）填充；如果字符串的字节数多于 N，则会抛出异常。

**语法**

```sql
toFixedString(s, N)
```

**参数**

* `s` — 要转换为定长字符串的字符串。[String](../data-types/string.md)。
* `N` — 长度 N。[UInt8](../data-types/int-uint.md)

**返回值**

* 长度为 N 的、由 `s` 转换得到的定长字符串。[FixedString](../data-types/fixedstring.md)。

**示例**

查询：

```sql
SELECT toFixedString('foo', 8) AS s;
```

结果：

```response
┌─s─────────────┐
│ foo\0\0\0\0\0 │
└───────────────┘
```

## toStringCutToZero {#tostringcuttozero}

接受一个 String 或 FixedString 参数。返回将内容在遇到的第一个零字节处截断后的 String。

**语法**

```sql
toStringCutToZero(s)
```

**示例**

查询：

```sql
SELECT toFixedString('foo', 8) AS s, toStringCutToZero(s) AS s_cut;
```

结果：

```response
┌─s─────────────┬─s_cut─┐
│ foo\0\0\0\0\0 │ foo   │
└───────────────┴───────┘
```

查询：

```sql
SELECT toFixedString('foo\0bar', 8) AS s, toStringCutToZero(s) AS s_cut;
```

结果：

```response
┌─s──────────┬─s_cut─┐
│ foo\0bar\0 │ foo   │
└────────────┴───────┘
```

## toDecimalString {#todecimalstring}

将数值转换为 String 类型，输出中的小数位数由用户指定。

**语法**

```sql
toDecimalString(number, scale)
```

**参数**

* `number` — 要转换为 String 的值，[Int, UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Decimal](../data-types/decimal.md)，
* `scale` — 小数位数，[UInt8](../data-types/int-uint.md)。
  * 对于 [Decimal](../data-types/decimal.md) 和 [Int, UInt](../data-types/int-uint.md) 类型，最大 `scale` 为 77（这是 Decimal 所能支持的最大有效数字位数），
  * 对于 [Float](../data-types/float.md)，最大 `scale` 为 60。

**返回值**

* 以给定小数位数（scale）表示的输入值，[String](../data-types/string.md) 类型。
  当所请求的 `scale` 小于原始数字的小数位数时，数值会按照常规算术规则进行四舍五入。

**示例**

查询：

```sql
SELECT toDecimalString(CAST('64.32', 'Float64'), 5);
```

结果：

```response
┌toDecimalString(CAST('64.32', 'Float64'), 5)─┐
│ 64.32000                                    │
└─────────────────────────────────────────────┘
```

## reinterpretAsUInt8 {#reinterpretasuint8}

通过将输入值视为 `UInt8` 类型的值来执行字节重解释操作。与 [`CAST`](#cast) 不同，此函数不会尝试保留原始数值——如果目标类型无法表示该输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsUInt8(x)
```

**参数**

* `x`：其字节将被重新解释为 UInt8 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将 `x` 的字节重新解释为 UInt8 类型的值。[UInt8](/sql-reference/data-types/int-uint)。

**示例**

查询：

```sql
SELECT
    toInt8(257) AS x,
    toTypeName(x),
    reinterpretAsUInt8(x) AS res,
    toTypeName(res);
```

结果：

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ Int8          │   1 │ UInt8           │
└───┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsUInt16 {#reinterpretasuint16}

通过将输入值视为 `UInt16` 类型的值来执行字节重解释操作。不同于 [`CAST`](#cast)，该函数不会尝试保留原始数值——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsUInt16(x)
```

**参数**

* `x`: 要按字节重新解释为 UInt16 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释为 UInt16 后得到的值。[UInt16](/sql-reference/data-types/int-uint)。

**示例**

查询：

```sql
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsUInt16(x) AS res,
    toTypeName(res);
```

结果：

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ UInt16          │
└───┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsUInt32 {#reinterpretasuint32}

通过将输入值视为 UInt32 类型的值来进行字节级重解释。与 [`CAST`](#cast) 不同，此函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsUInt32(x)
```

**参数**

* `x`: 要按字节重新解释为 UInt32 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释为 UInt32 后得到的结果。[UInt32](/sql-reference/data-types/int-uint)。

**示例**

查询：

```sql
SELECT
    toUInt16(257) AS x,
    toTypeName(x),
    reinterpretAsUInt32(x) AS res,
    toTypeName(res)
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt16        │ 257 │ UInt32          │
└─────┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsUInt64 {#reinterpretasuint64}

通过将输入值按字节重新解释为 `UInt64` 类型的值来执行转换。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始数值含义——如果目标类型无法表示输入类型，则输出结果将没有任何实际意义。

**语法**

```sql
reinterpretAsUInt64(x)
```

**参数**

* `x`：要按字节重新解释为 UInt64 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释为 UInt64 类型。[UInt64](/sql-reference/data-types/int-uint)。

**示例**

查询：

```sql
SELECT
    toUInt32(257) AS x,
    toTypeName(x),
    reinterpretAsUInt64(x) AS res,
    toTypeName(res)
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt32        │ 257 │ UInt64          │
└─────┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsUInt128 {#reinterpretasuint128}

按字节重新解释输入值，将其视为 `UInt128` 类型的值。与 [`CAST`](#cast) 不同，此函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出结果将毫无意义。

**语法**

```sql
reinterpretAsUInt128(x)
```

**参数**

* `x`：要按字节重解释为 UInt128 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将 `x` 按字节重解释为 UInt128 后得到的值。[UInt128](/sql-reference/data-types/int-uint)。

**示例**

查询：

```sql
SELECT
    toUInt64(257) AS x,
    toTypeName(x),
    reinterpretAsUInt128(x) AS res,
    toTypeName(res)
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt64        │ 257 │ UInt128         │
└─────┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsUInt256 {#reinterpretasuint256}

通过将输入值视为 `UInt256` 类型来执行字节重解释操作。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入类型，输出将毫无意义。

**语法**

```sql
reinterpretAsUInt256(x)
```

**参数**

* `x`：要按字节重新解释为 UInt256 类型的值。可以是 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 的字节重新解释为 UInt256 类型。[UInt256](/sql-reference/data-types/int-uint)。

**示例**

查询：

```sql
SELECT
    toUInt128(257) AS x,
    toTypeName(x),
    reinterpretAsUInt256(x) AS res,
    toTypeName(res)
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt128       │ 257 │ UInt256         │
└─────┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsInt8 {#reinterpretasint8}

通过将输入值视为 Int8 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示该输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsInt8(x)
```

**参数**

* `x`: 要按字节重新解释为 Int8 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释为 Int8 类型的值。[Int8](/sql-reference/data-types/int-uint#integer-ranges)。

**示例**

查询：

```sql
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt8(x) AS res,
    toTypeName(res);
```

结果：

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ Int8            │
└───┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsInt16 {#reinterpretasint16}

通过将输入值视为 `Int16` 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将没有意义。

**语法**

```sql
reinterpretAsInt16(x)
```

**参数**

* `x`：要按字节重新解释为 Int16 的值。类型可以是 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 按字节重新解释为 Int16 的 `x` 值。[Int16](/sql-reference/data-types/int-uint#integer-ranges)。

**示例**

查询：

```sql
SELECT
    toInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt16(x) AS res,
    toTypeName(res);
```

结果：

```response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ Int8          │   1 │ Int16           │
└───┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsInt32 {#reinterpretasint32}

通过将输入值的字节按 `Int32` 类型重新解释来执行转换。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入类型，则输出将是无意义的值。

**语法**

```sql
reinterpretAsInt32(x)
```

**参数**

* `x`：按字节重新解释为 Int32 的值。可以是 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释后的 Int32 值。[Int32](/sql-reference/data-types/int-uint#integer-ranges)。

**示例**

查询：

```sql
SELECT
    toInt16(257) AS x,
    toTypeName(x),
    reinterpretAsInt32(x) AS res,
    toTypeName(res);
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int16         │ 257 │ Int32           │
└─────┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsInt64 {#reinterpretasint64}

按字节重新解释输入值，将其视为 `Int64` 类型的值。不同于 [`CAST`](#cast)，该函数不会尝试保留原始值——如果目标类型无法表示该输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsInt64(x)
```

**参数**

* `x`: 要按字节重新解释为 Int64 类型的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释为 Int64 类型。[Int64](/sql-reference/data-types/int-uint#integer-ranges)。

**示例**

查询：

```sql
SELECT
    toInt32(257) AS x,
    toTypeName(x),
    reinterpretAsInt64(x) AS res,
    toTypeName(res);
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int32         │ 257 │ Int64           │
└─────┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsInt128 {#reinterpretasint128}

通过将输入值视为 `Int128` 类型的值来执行字节重解释。不同于 [`CAST`](#cast)，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsInt128(x)
```

**参数**

* `x`: 要按字节重新解释为 Int128 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 重新解释为 Int128。[Int128](/sql-reference/data-types/int-uint#integer-ranges)。

**示例**

查询：

```sql
SELECT
    toInt64(257) AS x,
    toTypeName(x),
    reinterpretAsInt128(x) AS res,
    toTypeName(res);
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int64         │ 257 │ Int128          │
└─────┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsInt256 {#reinterpretasint256}

通过将输入值视为 `Int256` 类型的值来对字节进行重解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将没有意义。

**语法**

```sql
reinterpretAsInt256(x)
```

**参数**

* `x`：要按字节重新解释为 Int256 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释为 Int256 后得到的结果。[Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**示例**

查询：

```sql
SELECT
    toInt128(257) AS x,
    toTypeName(x),
    reinterpretAsInt256(x) AS res,
    toTypeName(res);
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int128        │ 257 │ Int256          │
└─────┴───────────────┴─────┴─────────────────┘
```

## reinterpretAsFloat32 {#reinterpretasfloat32}

通过将输入值视为 `Float32` 类型的值来按字节重解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsFloat32(x)
```

**参数**

* `x`：要重新解释为 Float32 类型的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 重新解释为 Float32 类型。[Float32](../data-types/float.md)。

**示例**

查询：

```sql
SELECT reinterpretAsUInt32(toFloat32(0.2)) AS x, reinterpretAsFloat32(x);
```

结果：

```response
┌──────────x─┬─reinterpretAsFloat32(x)─┐
│ 1045220557 │                     0.2 │
└────────────┴─────────────────────────┘
```

## reinterpretAsFloat64 {#reinterpretasfloat64}

通过将输入值按字节重新解释为 `Float64` 类型来进行转换。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsFloat64(x)
```

**参数**

* `x`：要重新解释为 Float64 的值。类型可以是 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 重新解释为 Float64 类型的结果。[Float64](../data-types/float.md)。

**示例**

查询：

```sql
SELECT reinterpretAsUInt64(toFloat64(0.2)) AS x, reinterpretAsFloat64(x);
```

结果：

```response
┌───────────────────x─┬─reinterpretAsFloat64(x)─┐
│ 4596373779694328218 │                     0.2 │
└─────────────────────┴─────────────────────────┘
```

## reinterpretAsDate {#reinterpretasdate}

接受一个字符串、固定字符串或数值，并按主机字节序（小端序）将其字节解释为一个数字。函数将该数字视为自 Unix 纪元起始以来的天数，并返回对应的日期。

**语法**

```sql
reinterpretAsDate(x)
```

**参数**

* `x`: 自 Unix 纪元开始经过的天数。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 日期。[Date](../data-types/date.md)。

**实现细节**

:::note
如果提供的字符串长度不够，函数会将其视为在末尾用所需数量的空字节进行了填充。如果字符串长于所需长度，则会忽略多余的字节。
:::

**示例**

查询：

```sql
SELECT reinterpretAsDate(65), reinterpretAsDate('A');
```

结果：

```response
┌─reinterpretAsDate(65)─┬─reinterpretAsDate('A')─┐
│            1970-03-07 │             1970-03-07 │
└───────────────────────┴────────────────────────┘
```

## reinterpretAsDateTime {#reinterpretasdatetime}

这些函数接受一个字符串，并将其开头的字节按照主机字节序（小端序）解释为一个数字。返回一个日期时间值，将该数字视为自 Unix 纪元起经过的秒数。

**语法**

```sql
reinterpretAsDateTime(x)
```

**参数**

* `x`: 自 Unix 纪元开始经过的秒数。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 日期和时间。[DateTime](../data-types/datetime.md)。

**实现细节**

:::note
如果提供的字符串不够长，函数会将其视为在末尾填充了所需数量的零字节。如果字符串长于所需长度，则会忽略多余的字节。
:::

**示例**

查询：

```sql
SELECT reinterpretAsDateTime(65), reinterpretAsDateTime('A');
```

结果：

```response
┌─reinterpretAsDateTime(65)─┬─reinterpretAsDateTime('A')─┐
│       1970-01-01 01:01:05 │        1970-01-01 01:01:05 │
└───────────────────────────┴────────────────────────────┘
```

## reinterpretAsString {#reinterpretasstring}

此函数接收一个数字、日期或带时间的日期，并返回一个字符串，该字符串包含以主机字节序（小端序）表示对应值的字节序列。末尾的 null 字节会被去除。例如，一个 UInt32 类型且值为 255 的数据，其对应的字符串长度为 1 个字节。

**语法**

```sql
reinterpretAsString(x)
```

**参数**

* `x`: 要重新解释为字符串的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**返回值**

* 包含表示 `x` 的字节序列的字符串。[String](../data-types/fixedstring.md)。

**示例**

查询：

```sql
SELECT
    reinterpretAsString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsString(toDate('1970-03-07'));
```

结果：

```response
┌─reinterpretAsString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsString(toDate('1970-03-07'))─┐
│ A                                                      │ A                                         │
└────────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```

## reinterpretAsFixedString {#reinterpretasfixedstring}

此函数接受一个数字、日期或带时间的日期，并返回一个 `FixedString`，其内容为按主机字节序（小端序）表示相应值的字节序列。末尾的空字节会被丢弃。例如，当类型为 `UInt32` 的值为 255 时，返回的 `FixedString` 长度为 1 字节。

**语法**

```sql
reinterpretAsFixedString(x)
```

**参数**

* `x`：要按字符串重新解释的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**返回值**

* 包含 `x` 的字节表示形式的定长字符串。[FixedString](../data-types/fixedstring.md)。

**示例**

查询：

```sql
SELECT
    reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsFixedString(toDate('1970-03-07'));
```

结果：

```response
┌─reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsFixedString(toDate('1970-03-07'))─┐
│ A                                                           │ A                                              │
└─────────────────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```

## reinterpretAsUUID {#reinterpretasuuid}

:::note
除了此处列出的 UUID 函数外，还有一份专门的 [UUID 函数文档](../functions/uuid-functions.md)。
:::

接受一个 16 字节的字符串，将其视为由两个 8 字节部分组成，并按小端字节序进行解释，从而返回一个 UUID。如果字符串长度不足，函数的行为等同于在字符串末尾填充所需数量的空字节。如果字符串长于 16 字节，则会忽略末尾多出的字节。

**语法**

```sql
reinterpretAsUUID(fixed_string)
```

**参数**

* `fixed_string` — 大端序字节串。 [FixedString](/sql-reference/data-types/fixedstring)。

**返回值**

* 返回 UUID 类型的值。 [UUID](/sql-reference/data-types/uuid)。

**示例**

字符串转换为 UUID。

查询：

```sql
SELECT reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')));
```

结果：

```response
┌─reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')))─┐
│                                  08090a0b-0c0d-0e0f-0001-020304050607 │
└───────────────────────────────────────────────────────────────────────┘
```

在 String 与 UUID 之间相互转换。

查询：

```sql
WITH
    generateUUIDv4() AS uuid,
    identity(lower(hex(reverse(reinterpretAsString(uuid))))) AS str,
    reinterpretAsUUID(reverse(unhex(str))) AS uuid2
SELECT uuid = uuid2;
```

结果：

```response
┌─equals(uuid, uuid2)─┐
│                   1 │
└─────────────────────┘
```

## reinterpret {#reinterpret}

对 `x` 的值使用相同的源内存字节序列，并将其按目标类型重新解释。

**语法**

```sql
reinterpret(x, type)
```

**参数**

* `x` — 任意类型。
* `type` — 目标类型。如果是数组，则数组元素类型必须是定长类型。

**返回值**

* 目标类型的值。

**示例**

查询：

```sql
SELECT reinterpret(toInt8(-1), 'UInt8') AS int_to_uint,
    reinterpret(toInt8(1), 'Float32') AS int_to_float,
    reinterpret('1', 'UInt32') AS string_to_int;
```

结果：

```text
┌─int_to_uint─┬─int_to_float─┬─string_to_int─┐
│         255 │        1e-45 │            49 │
└─────────────┴──────────────┴───────────────┘
```

查询语句：

```sql
SELECT reinterpret(x'3108b4403108d4403108b4403108d440', 'Array(Float32)') AS string_to_array_of_Float32;
```

结果：

```text
┌─string_to_array_of_Float32─┐
│ [5.626,6.626,5.626,6.626]  │
└────────────────────────────┘
```

## CAST {#cast}

将输入值转换为指定的数据类型。与 [reinterpret](#reinterpret) 函数不同，`CAST` 会尝试改用新的数据类型来表示相同的值。如果无法完成转换，则会抛出异常。
支持多种语法形式。

**语法**

```sql
CAST(x, T)
CAST(x AS t)
x::t
```

**参数**

* `x` — 要转换的值，可以是任意类型。
* `T` — 目标数据类型的名称，类型为 [String](../data-types/string.md)。
* `t` — 目标数据类型。

**返回值**

* 转换后的值。

:::note
如果输入值超出了目标类型的取值范围，结果会发生溢出。例如，`CAST(-1, 'UInt8')` 返回 `255`。
:::

**示例**

查询：

```sql
SELECT
    CAST(toInt8(-1), 'UInt8') AS cast_int_to_uint,
    CAST(1.5 AS Decimal(3,2)) AS cast_float_to_decimal,
    '1'::Int32 AS cast_string_to_int;
```

结果：

```yaml
┌─cast_int_to_uint─┬─cast_float_to_decimal─┬─cast_string_to_int─┐
│              255 │                  1.50 │                  1 │
└──────────────────┴───────────────────────┴────────────────────┘
```

查询：

```sql
SELECT
    '2016-06-15 23:00:00' AS timestamp,
    CAST(timestamp AS DateTime) AS datetime,
    CAST(timestamp AS Date) AS date,
    CAST(timestamp, 'String') AS string,
    CAST(timestamp, 'FixedString(22)') AS fixed_string;
```

结果：

```response
┌─timestamp───────────┬────────────datetime─┬───────date─┬─string──────────────┬─fixed_string──────────────┐
│ 2016-06-15 23:00:00 │ 2016-06-15 23:00:00 │ 2016-06-15 │ 2016-06-15 23:00:00 │ 2016-06-15 23:00:00\0\0\0 │
└─────────────────────┴─────────────────────┴────────────┴─────────────────────┴───────────────────────────┘
```

转换为 [FixedString (N)](../data-types/fixedstring.md) 仅适用于类型为 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md) 的参数。

支持向 [Nullable](../data-types/nullable.md) 类型转换以及从该类型再转换回来。

**示例**

查询：

```sql
SELECT toTypeName(x) FROM t_null;
```

结果：

```response
┌─toTypeName(x)─┐
│ Int8          │
│ Int8          │
└───────────────┘
```

查询：

```sql
SELECT toTypeName(CAST(x, 'Nullable(UInt16)')) FROM t_null;
```

结果：

```response
┌─toTypeName(CAST(x, 'Nullable(UInt16)'))─┐
│ Nullable(UInt16)                        │
│ Nullable(UInt16)                        │
└─────────────────────────────────────────┘
```

**另请参阅**

* [cast&#95;keep&#95;nullable](../../operations/settings/settings.md/#cast_keep_nullable) 设置

## accurateCast(x, T) {#accuratecastx-t}

将 `x` 转换为数据类型 `T`。

与 [cast](#cast) 的区别在于，如果 `x` 的值超出类型 `T` 的取值范围，`accurateCast` 在转换时不允许数值类型溢出。例如，`accurateCast(-1, 'UInt8')` 会抛出异常。

**示例**

查询：

```sql
SELECT cast(-1, 'UInt8') AS uint8;
```

结果：

```response
┌─uint8─┐
│   255 │
└───────┘
```

查询：

```sql
SELECT accurateCast(-1, 'UInt8') AS uint8;
```

结果：

```response
代码:70. DB::Exception:从 localhost:9000 接收。DB::Exception:Int8 列中的值无法安全地转换为 UInt8 类型:处理 accurateCast(-1, 'UInt8') AS uint8 时。
```

## accurateCastOrNull(x, T) {#accuratecastornullx-t}

将输入值 `x` 转换为指定的数据类型 `T`。始终返回 [Nullable](../data-types/nullable.md) 类型，如果转换结果无法用目标类型表示，则返回 [NULL](/sql-reference/syntax#null)。

**语法**

```sql
accurateCastOrNull(x, T)
```

**参数**

* `x` — 输入值。
* `T` — 返回的数据类型名称。

**返回值**

* 将值转换为指定数据类型 `T` 后的结果。

**示例**

查询：

```sql
SELECT toTypeName(accurateCastOrNull(5, 'UInt8'));
```

结果：

```response
┌─toTypeName(accurateCastOrNull(5, 'UInt8'))─┐
│ Nullable(UInt8)                            │
└────────────────────────────────────────────┘
```

查询：

```sql
SELECT
    accurateCastOrNull(-1, 'UInt8') AS uint8,
    accurateCastOrNull(128, 'Int8') AS int8,
    accurateCastOrNull('Test', 'FixedString(2)') AS fixed_string;
```

结果：

```response
┌─uint8─┬─int8─┬─fixed_string─┐
│  ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │
└───────┴──────┴──────────────┘
```

## accurateCastOrDefault(x, T[, default&#95;value]) {#accuratecastordefaultx-t-default_value}

将输入值 `x` 转换为指定的数据类型 `T`。如果转换后的值无法用目标类型表示，则返回该类型的默认值；如果指定了 `default_value`，则返回 `default_value`。

**语法**

```sql
accurateCastOrDefault(x, T)
```

**参数**

* `x` — 输入值。
* `T` — 返回值类型的名称。
* `default_value` — 返回值类型的默认值。

**返回值**

* 转换为指定数据类型 `T` 后的值。

**示例**

查询：

```sql
SELECT toTypeName(accurateCastOrDefault(5, 'UInt8'));
```

结果：

```response
┌─toTypeName(accurateCastOrDefault(5, 'UInt8'))─┐
│ UInt8                                         │
└───────────────────────────────────────────────┘
```

查询：

```sql
SELECT
    accurateCastOrDefault(-1, 'UInt8') AS uint8,
    accurateCastOrDefault(-1, 'UInt8', 5) AS uint8_default,
    accurateCastOrDefault(128, 'Int8') AS int8,
    accurateCastOrDefault(128, 'Int8', 5) AS int8_default,
    accurateCastOrDefault('Test', 'FixedString(2)') AS fixed_string,
    accurateCastOrDefault('Test', 'FixedString(2)', 'Te') AS fixed_string_default;
```

结果：

```response
┌─uint8─┬─uint8_default─┬─int8─┬─int8_default─┬─fixed_string─┬─fixed_string_default─┐
│     0 │             5 │    0 │            5 │              │ Te                   │
└───────┴───────────────┴──────┴──────────────┴──────────────┴──────────────────────┘
```

## toInterval {#toInterval}

根据数值和时间间隔单位（例如 &#39;second&#39; 或 &#39;day&#39;）构造一个 [Interval](../../sql-reference/data-types/special-data-types/interval.md) 数据类型的值。

**语法**

```sql
toInterval(value, unit)
```

**参数**

* `value` — 时间间隔的长度。可以是整数或其字符串表示形式，也可以是浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

* `unit` — 要创建的时间间隔单位类型。[String Literal](/sql-reference/syntax#string)。
  可能的取值为：

  * `nanosecond`
  * `microsecond`
  * `millisecond`
  * `second`
  * `minute`
  * `hour`
  * `day`
  * `week`
  * `month`
  * `quarter`
  * `year`

  `unit` 参数不区分大小写。

**返回值**

* 生成的时间间隔值。[Interval](../../sql-reference/data-types/special-data-types/interval.md)

**示例**

```sql
SELECT toDateTime('2025-01-01 00:00:00') + toInterval(1, 'hour')
```

```response
┌─toDateTime('2025-01-01 00:00:00') + toInterval(1, 'hour') ─┐
│                                        2025-01-01 01:00:00 │
└────────────────────────────────────────────────────────────┘
```

## toIntervalYear {#tointervalyear}

返回一个长度为 `n` 年、数据类型为 [IntervalYear](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalYear(n)
```

**参数**

* `n` — 年数。可以是整数、其字符串表示形式或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* `n` 年的时间间隔。[IntervalYear](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalYear(1) AS interval_to_year
SELECT date + interval_to_year AS result
```

结果：

```response
┌─────result─┐
│ 2025-06-15 │
└────────────┘
```

## toIntervalQuarter {#tointervalquarter}

返回一个由 `n` 个季度组成、数据类型为 [IntervalQuarter](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalQuarter(n)
```

**参数**

* `n` — 季度数。可以是整数、其字符串表示形式或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 由 `n` 个季度组成的时间区间。[IntervalQuarter](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalQuarter(1) AS interval_to_quarter
SELECT date + interval_to_quarter AS result
```

结果：

```response
┌─────result─┐
│ 2024-09-15 │
└────────────┘
```

## toIntervalMonth {#tointervalmonth}

返回一个长度为 `n` 个月、数据类型为 [IntervalMonth](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalMonth(n)
```

**参数**

* `n` — 月数。可以是整数、其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 长度为 `n` 个月的区间。[IntervalMonth](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalMonth(1) AS interval_to_month
SELECT date + interval_to_month AS result
```

结果：

```response
┌─────result─┐
│ 2024-07-15 │
└────────────┘
```

## toIntervalWeek {#tointervalweek}

返回一个长度为 `n` 周、数据类型为 [IntervalWeek](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalWeek(n)
```

**参数**

* `n` — 周数。可以是整数、其字符串形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* `n` 周的时间间隔。[IntervalWeek](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalWeek(1) AS interval_to_week
SELECT date + interval_to_week AS result
```

结果：

```response
┌─────result─┐
│ 2024-06-22 │
└────────────┘
```

## toIntervalDay {#tointervalday}

返回一个由 `n` 天组成、数据类型为 [IntervalDay](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalDay(n)
```

**参数**

* `n` — 天数。可以是整数、其字符串表示形式或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 长度为 `n` 天的时间间隔。[IntervalDay](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalDay(5) AS interval_to_days
SELECT date + interval_to_days AS result
```

结果：

```response
┌─────result─┐
│ 2024-06-20 │
└────────────┘
```

## toIntervalHour {#tointervalhour}

返回一个表示 `n` 小时的 [IntervalHour](../data-types/special-data-types/interval.md) 类型时间间隔。

**语法**

```sql
toIntervalHour(n)
```

**参数**

* `n` — 小时数。可以是整数、整数的字符串表示形式或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* `n` 小时的时间间隔。[IntervalHour](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalHour(12) AS interval_to_hours
SELECT date + interval_to_hours AS result
```

结果：

```response
┌──────────────result─┐
│ 2024-06-15 12:00:00 │
└─────────────────────┘
```

## toIntervalMinute {#tointervalminute}

返回一个表示 `n` 分钟的 [IntervalMinute](../data-types/special-data-types/interval.md) 类型时间间隔。

**语法**

```sql
toIntervalMinute(n)
```

**参数**

* `n` — 分钟数。可以是整数、其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 时长为 `n` 分钟的时间间隔。[IntervalMinute](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalMinute(12) AS interval_to_minutes
SELECT date + interval_to_minutes AS result
```

结果：

```response
┌──────────────result─┐
│ 2024-06-15 00:12:00 │
└─────────────────────┘
```

## toIntervalSecond {#tointervalsecond}

返回一个 `n` 秒的时间间隔，数据类型为 [IntervalSecond](../data-types/special-data-types/interval.md)。

**语法**

```sql
toIntervalSecond(n)
```

**参数**

* `n` — 秒数。可以是整数、其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* `n` 秒的时间间隔。[IntervalSecond](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalSecond(30) AS interval_to_seconds
SELECT date + interval_to_seconds AS result
```

结果：

```response
┌──────────────结果─┐
│ 2024-06-15 00:00:30 │
└─────────────────────┘
```

## toIntervalMillisecond {#tointervalmillisecond}

返回一个时长为 `n` 毫秒、数据类型为 [IntervalMillisecond](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalMillisecond(n)
```

**参数**

* `n` — 毫秒数。可以是整数、其字符串表示形式或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 长度为 `n` 毫秒的区间。[IntervalMilliseconds](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalMillisecond(30) AS interval_to_milliseconds
SELECT date + interval_to_milliseconds AS result
```

结果：

```response
┌──────────────────result─┐
│ 2024-06-15 00:00:00.030 │
└─────────────────────────┘
```

## toIntervalMicrosecond {#tointervalmicrosecond}

返回一个表示 `n` 微秒的区间，数据类型为 [IntervalMicrosecond](../data-types/special-data-types/interval.md)。

**语法**

```sql
toIntervalMicrosecond(n)
```

**参数**

* `n` — 微秒数。可以是整数、其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 长度为 `n` 微秒的时间间隔。[IntervalMicrosecond](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalMicrosecond(30) AS interval_to_microseconds
SELECT date + interval_to_microseconds AS result
```

结果：

```response
┌─────────────────────result─┐
│ 2024-06-15 00:00:00.000030 │
└────────────────────────────┘
```

## toIntervalNanosecond {#tointervalnanosecond}

返回一个长度为 `n` 纳秒、数据类型为 [IntervalNanosecond](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalNanosecond(n)
```

**参数**

* `n` — 纳秒数。可以是整数或其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 长度为 `n` 纳秒的区间。[IntervalNanosecond](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDateTime('2024-06-15') AS date,
    toIntervalNanosecond(30) AS interval_to_nanoseconds
SELECT date + interval_to_nanoseconds AS result
```

结果：

```response
┌────────────────────────result─┐
│ 2024-06-15 00:00:00.000000030 │
└───────────────────────────────┘
```

## parseDateTime {#parsedatetime}

根据 [MySQL 格式字符串](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)，将 [String](../data-types/string.md) 转换为 [DateTime](../data-types/datetime.md)。

此函数是函数 [formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime) 的反向操作。

**语法**

```sql
parseDateTime(str[, format[, timezone]])
```

**参数**

* `str` — 要解析的字符串
* `format` — 格式字符串。可选。如果未指定，则为 `%Y-%m-%d %H:%i:%s`。
* `timezone` — [时区](operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

返回一个根据 MySQL 风格的格式字符串从输入字符串解析得到的 [DateTime](../data-types/datetime.md) 值。

**支持的格式说明符**

支持 [formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime) 中列出的所有格式说明符，但不支持以下说明符：

* %Q: 季度 (1-4)

**示例**

```sql
SELECT parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')

┌─parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2021-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```

别名为：`TO_TIMESTAMP`。

## parseDateTimeOrZero {#parsedatetimeorzero}

与 [parseDateTime](#parsedatetime) 相同，唯一区别是当遇到无法处理的日期格式时，会返回零日期值。

## parseDateTimeOrNull {#parsedatetimeornull}

与 [parseDateTime](#parsedatetime) 的行为相同，只是在遇到无法处理的日期格式时会返回 `NULL`。

别名：`str_to_date`。

## parseDateTimeInJodaSyntax {#parsedatetimeinjodasyntax}

与 [parseDateTime](#parsedatetime) 类似，只是该函数使用的是 [Joda](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) 的格式字符串，而不是 MySQL 语法。

此函数是函数 [formatDateTimeInJodaSyntax](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax) 的逆操作。

**语法**

```sql
parseDateTimeInJodaSyntax(str[, format[, timezone]])
```

**参数**

* `str` — 要解析的字符串
* `format` — 格式字符串。可选。如果未指定，则为 `yyyy-MM-dd HH:mm:ss`。
* `timezone` — [时区](operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

返回一个根据 Joda 风格的格式字符串从输入字符串中解析得到的 [DateTime](../data-types/datetime.md) 值。

**支持的格式说明符**

支持在 [`formatDateTimeInJodaSyntax`](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax) 中列出的所有格式说明符，以下除外：

* S: 秒的小数部分
* z: 时区
* Z: 时区偏移量/ID

**示例**

```sql
SELECT parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')

┌─parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')─┐
│                                                                     2023-02-24 14:53:31 │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## parseDateTimeInJodaSyntaxOrZero {#parsedatetimeinjodasyntaxorzero}

与 [parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) 的行为相同，区别在于当遇到无法处理的日期格式时会返回零日期。

## parseDateTimeInJodaSyntaxOrNull {#parsedatetimeinjodasyntaxornull}

与 [parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) 的行为相同，只是当遇到无法处理的日期格式时会返回 `NULL`。

## parseDateTime64 {#parsedatetime64}

根据 [MySQL 格式字符串](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)，将 [String](../data-types/string.md) 转换为 [DateTime64](../data-types/datetime64.md)。

**语法**

```sql
parseDateTime64(str[, format[, timezone]])
```

**参数**

* `str` — 要解析的字符串。
* `format` — 格式字符串。可选。如果未指定，默认为 `%Y-%m-%d %H:%i:%s.%f`。
* `timezone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

返回一个根据 MySQL 风格的格式字符串从输入字符串解析得到的 [DateTime64](../data-types/datetime64.md) 值。
返回值的精度为 6。

## parseDateTime64OrZero {#parsedatetime64orzero}

与 [parseDateTime64](#parsedatetime64) 的行为相同，不同之处在于当遇到无法处理的日期格式时，它会返回零日期。

## parseDateTime64OrNull {#parsedatetime64ornull}

与 [parseDateTime64](#parsedatetime64) 的行为相同，区别在于当遇到无法处理的日期格式时，它会返回 `NULL`。

## parseDateTime64InJodaSyntax {#parsedatetime64injodasyntax}

根据 [Joda 格式字符串](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)，将 [String](../data-types/string.md) 转换为 [DateTime64](../data-types/datetime64.md)。

**语法**

```sql
parseDateTime64InJodaSyntax(str[, format[, timezone]])
```

**参数**

* `str` — 要解析的字符串。
* `format` — 格式字符串。可选。未指定时默认为 `yyyy-MM-dd HH:mm:ss`。
* `timezone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

返回一个根据 Joda 风格的格式字符串从输入字符串解析得到的 [DateTime64](../data-types/datetime64.md) 值。\
返回值的精度等于格式字符串中 `S` 占位符的数量（最多为 6）。

## parseDateTime64InJodaSyntaxOrZero {#parsedatetime64injodasyntaxorzero}

与 [parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) 的行为相同，不同之处在于当遇到无法处理的日期格式时，它会返回零日期值。

## parseDateTime64InJodaSyntaxOrNull {#parsedatetime64injodasyntaxornull}

与 [parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) 相同，唯一不同是当遇到无法处理的日期格式时，它会返回 `NULL`。

## parseDateTimeBestEffort {#parsedatetimebesteffort}

## parseDateTime32BestEffort {#parsedatetime32besteffort}

将以 [String](../data-types/string.md) 类型表示的日期和时间转换为 [DateTime](/sql-reference/data-types/datetime) 数据类型。

该函数可以解析 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse 定义的以及其他一些日期和时间格式。

**语法**

```sql
parseDateTimeBestEffort(time_string [, time_zone])
```

**参数**

* `time_string` — 包含待转换日期和时间的字符串。[String](../data-types/string.md)。
* `time_zone` — 时区。函数会根据该时区解析 `time_string`。[String](../data-types/string.md)。

**支持的非标准格式**

* 包含 9 至 10 位 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time) 的字符串。
* 同时包含日期和时间组件的字符串：`YYYYMMDDhhmmss`、`DD/MM/YYYY hh:mm:ss`、`DD-MM-YY hh:mm`、`YYYY-MM-DD hh:mm:ss` 等。
* 仅包含日期但不包含时间组件的字符串：`YYYY`、`YYYYMM`、`YYYY*MM`、`DD/MM/YYYY`、`DD-MM-YY` 等。
* 包含日和时间的字符串：`DD`、`DD hh`、`DD hh:mm`。在这种情况下，`MM` 被替换为 `01`。
* 包含日期和时间以及时区偏移信息的字符串：`YYYY-MM-DD hh:mm:ss ±h:mm` 等。例如，`2020-12-12 17:36:00 -5:00`。
* [syslog 时间戳](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)：`Mmm dd hh:mm:ss`。例如，`Jun  9 14:20:32`。

对于所有带分隔符的格式，函数都可以解析用月份全名或前三个字母表示的月份名称。示例：`24/DEC/18`、`24-Dec-18`、`01-September-2018`。
如果未指定年份，则默认为当前年份。如果得到的 DateTime 恰好位于将来时间点（即使只比当前时刻晚一秒），则会将当前年份替换为上一年。

**返回值**

* 将 `time_string` 转换为 [DateTime](../data-types/datetime.md) 数据类型后的结果。

**示例**

查询：

```sql
SELECT parseDateTimeBestEffort('23/10/2020 12:12:57')
AS parseDateTimeBestEffort;
```

结果：

```response
┌─parseDateTimeBestEffort─┐
│     2020-10-23 12:12:57 │
└─────────────────────────┘
```

查询：

```sql
SELECT parseDateTimeBestEffort('Sat, 18 Aug 2018 07:22:16 GMT', 'Asia/Istanbul')
AS parseDateTimeBestEffort;
```

结果：

```response
┌─parseDateTimeBestEffort─┐
│     2018-08-18 10:22:16 │
└─────────────────────────┘
```

查询：

```sql
SELECT parseDateTimeBestEffort('1284101485')
AS parseDateTimeBestEffort;
```

结果：

```response
┌─parseDateTimeBestEffort─┐
│     2015-07-07 12:04:41 │
└─────────────────────────┘
```

查询：

```sql
SELECT parseDateTimeBestEffort('2018-10-23 10:12:12')
AS parseDateTimeBestEffort;
```

结果：

```response
┌─parseDateTimeBestEffort─┐
│     2018-10-23 10:12:12 │
└─────────────────────────┘
```

查询：

```sql
SELECT toYear(now()) AS year, parseDateTimeBestEffort('10 20:19');
```

结果：

```response
┌─year─┬─parseDateTimeBestEffort('10 20:19')─┐
│ 2023 │                 2023-01-10 20:19:00 │
└──────┴─────────────────────────────────────┘
```

查询：

```sql
WITH
    now() AS ts_now,
    formatDateTime(ts_around, '%b %e %T') AS syslog_arg
SELECT
    ts_now,
    syslog_arg,
    parseDateTimeBestEffort(syslog_arg)
FROM (SELECT arrayJoin([ts_now - 30, ts_now + 30]) AS ts_around);
```

结果：

```response
┌──────────────ts_now─┬─syslog_arg──────┬─parseDateTimeBestEffort(syslog_arg)─┐
│ 2023-06-30 23:59:30 │ Jun 30 23:59:00 │                 2023-06-30 23:59:00 │
│ 2023-06-30 23:59:30 │ Jul  1 00:00:00 │                 2022-07-01 00:00:00 │
└─────────────────────┴─────────────────┴─────────────────────────────────────┘
```

**另请参阅**

* [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123)
* [toDate](#todate)
* [toDateTime](#todatetime)
* [由 @xkcd 发布的 ISO 8601 公告](https://xkcd.com/1179/)
* [RFC 3164](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)

## parseDateTimeBestEffortUS {#parsedatetimebesteffortus}

此函数在处理 ISO 日期格式（例如 `YYYY-MM-DD hh:mm:ss`）以及其他可以无歧义提取出月份和日期组件的日期格式（例如 `YYYYMMDDhhmmss`、`YYYY-MM`、`DD hh` 或 `YYYY-MM-DD hh:mm:ss ±h:mm`）时，其行为与 [parseDateTimeBestEffort](#parsedatetimebesteffort) 相同。如果无法无歧义地提取月份和日期组件（例如 `MM/DD/YYYY`、`MM-DD-YYYY` 或 `MM-DD-YY`），则本函数会优先按美国日期格式进行解析，而不是按 `DD/MM/YYYY`、`DD-MM-YYYY` 或 `DD-MM-YY` 解析。作为上述后一种情况的一个例外，如果“月份”大于 12 且小于等于 31，则本函数会退回到 [parseDateTimeBestEffort](#parsedatetimebesteffort) 的行为，例如 `15/08/2020` 会被解析为 `2020-08-15`。

## parseDateTimeBestEffortOrNull {#parsedatetimebesteffortornull}
## parseDateTime32BestEffortOrNull {#parsedatetime32besteffortornull}

与 [parseDateTimeBestEffort](#parsedatetimebesteffort) 相同，区别在于当遇到无法处理的日期格式时返回 `NULL`。

## parseDateTimeBestEffortOrZero {#parsedatetimebesteffortorzero}
## parseDateTime32BestEffortOrZero {#parsedatetime32besteffortorzero}

与 [parseDateTimeBestEffort](#parsedatetimebesteffort) 相同，但在遇到无法解析的日期格式时，会返回 0 日期或 0 日期时间。

## parseDateTimeBestEffortUSOrNull {#parsedatetimebesteffortusornull}

与 [parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 函数相同，唯一不同在于当遇到无法解析的日期格式时返回 `NULL`。

## parseDateTimeBestEffortUSOrZero {#parsedatetimebesteffortusorzero}

与 [parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 函数相同，区别在于，当遇到无法处理的日期格式时，它会返回零日期（`1970-01-01`）或带时间的零日期（`1970-01-01 00:00:00`）。

## parseDateTime64BestEffort {#parsedatetime64besteffort}

与 [parseDateTimeBestEffort](#parsedatetimebesteffort) 函数相同，但额外支持解析毫秒和微秒，并返回 [DateTime](/sql-reference/data-types/datetime) 数据类型。

**语法**

```sql
parseDateTime64BestEffort(time_string [, precision [, time_zone]])
```

**参数**

* `time_string` — 要转换的日期或日期时间的字符串。[String](../data-types/string.md)。
* `precision` — 所需精度。`3` — 毫秒，`6` — 微秒。默认值为 `3`。可选。[UInt8](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。函数会根据该时区解析 `time_string`。可选。[String](../data-types/string.md)。

**返回值**

* 转换为 [DateTime](../data-types/datetime.md) 数据类型的 `time_string`。

**示例**

查询：

```sql
SELECT parseDateTime64BestEffort('2021-01-01') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2021-01-01 01:01:00.12346') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2021-01-01 01:01:00.12346',6) AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2021-01-01 01:01:00.12346',3,'Asia/Istanbul') AS a, toTypeName(a) AS t
FORMAT PrettyCompactMonoBlock;
```

结果：

```sql
┌──────────────────────────a─┬─t──────────────────────────────┐
│ 2021-01-01 01:01:00.123000 │ DateTime64(3)                  │
│ 2021-01-01 00:00:00.000000 │ DateTime64(3)                  │
│ 2021-01-01 01:01:00.123460 │ DateTime64(6)                  │
│ 2020-12-31 22:01:00.123000 │ DateTime64(3, 'Asia/Istanbul') │
└────────────────────────────┴────────────────────────────────┘
```

## parseDateTime64BestEffortUS {#parsedatetime64besteffortus}

与 [parseDateTime64BestEffort](#parsedatetime64besteffort) 相同，但在存在歧义时，该函数会优先按美国日期格式（`MM/DD/YYYY` 等）进行解析。

## parseDateTime64BestEffortOrNull {#parsedatetime64besteffortornull}

与 [parseDateTime64BestEffort](#parsedatetime64besteffort) 相同，只是当遇到无法处理的日期格式时会返回 `NULL`。

## parseDateTime64BestEffortOrZero {#parsedatetime64besteffortorzero}

与 [parseDateTime64BestEffort](#parsedatetime64besteffort) 相同，不同之处在于当遇到无法处理的日期格式时，会返回零日期或零日期时间。

## parseDateTime64BestEffortUSOrNull {#parsedatetime64besteffortusornull}

与 [parseDateTime64BestEffort](#parsedatetime64besteffort) 相同，不同之处在于，当存在歧义时，此函数优先采用美国日期格式（`MM/DD/YYYY` 等），并在遇到无法处理的日期格式时返回 `NULL`。

## parseDateTime64BestEffortUSOrZero {#parsedatetime64besteffortusorzero}

与 [parseDateTime64BestEffort](#parsedatetime64besteffort) 基本相同，只是在存在歧义时，此函数优先使用美国日期格式（`MM/DD/YYYY` 等），并在遇到无法处理的日期格式时返回零日期或零日期时间值。

## toLowCardinality {#tolowcardinality}

将输入参数转换为同一数据类型的 [LowCardinality](../data-types/lowcardinality.md) 版本。

要将 `LowCardinality` 数据类型的数据进行转换，请使用 [CAST](#cast) 函数。例如，`CAST(x as String)`。

**语法**

```sql
toLowCardinality(expr)
```

**参数**

* `expr` — [表达式](/sql-reference/syntax#expressions)，其结果为某种[受支持的数据类型](/sql-reference/data-types)。

**返回值**

* `expr` 的结果。类型为 `expr` 类型的 [LowCardinality](../data-types/lowcardinality.md)。

**示例**

查询：

```sql
SELECT toLowCardinality('1');
```

结果：

```response
┌─toLowCardinality('1')─┐
│ 1                     │
└───────────────────────┘
```

## toUnixTimestamp {#toUnixTimestamp}

将 `String`、`Date` 或 `DateTime` 转换为 Unix 时间戳（自 `1970-01-01 00:00:00 UTC` 起的秒数），返回 `UInt32` 类型的值。

**语法**

```sql
toUnixTimestamp(date, [timezone])
```

**参数**

* `date`: 要转换的值。[`Date`](/sql-reference/data-types/date) 或 [`Date32`](/sql-reference/data-types/date32) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64) 或 [`String`](/sql-reference/data-types/string)。
* `timezone`: 可选。用于转换的时区。如果未指定，则使用服务器时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回 Unix 时间戳。[`UInt32`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title="Query"
SELECT
'2017-11-05 08:07:47' AS dt_str,
toUnixTimestamp(dt_str) AS from_str,
toUnixTimestamp(dt_str, 'Asia/Tokyo') AS from_str_tokyo,
toUnixTimestamp(toDateTime(dt_str)) AS from_datetime,
toUnixTimestamp(toDateTime64(dt_str, 0)) AS from_datetime64,
toUnixTimestamp(toDate(dt_str)) AS from_date,
toUnixTimestamp(toDate32(dt_str)) AS from_date32
FORMAT Vertical;
```

```response title="Response"
Row 1:
──────
dt_str:          2017-11-05 08:07:47
from_str:        1509869267
from_str_tokyo:  1509836867
from_datetime:   1509869267
from_datetime64: 1509869267
from_date:       1509840000
from_date32:     1509840000
```

## toUnixTimestamp64Second {#tounixtimestamp64second}

将 `DateTime64` 转换为具有固定秒级精度的 `Int64` 值。输入值会根据其自身精度被按比例缩放。

:::note
输出值是 UTC 时区的时间戳，而不是 `DateTime64` 所在时区的时间戳。
:::

**语法**

```sql
toUnixTimestamp64Second(value)
```

**参数**

* `value` — 任意精度的 DateTime64 值。[DateTime64](../data-types/datetime64.md)。

**返回值**

* 将 `value` 转换为 `Int64` 数据类型的值。[Int64](../data-types/int-uint.md)。

**示例**

查询：

```sql
WITH toDateTime64('2009-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Second(dt64);
```

结果：

```response
┌─toUnixTimestamp64Second(dt64)─┐
│                    1234567891 │
└───────────────────────────────┘
```

## toUnixTimestamp64Milli {#tounixtimestamp64milli}

将 `DateTime64` 转换为具有固定毫秒精度的 `Int64` 整数值。输入值会根据其小数精度被相应放大或缩小。

:::note
输出值是 UTC 时区的时间戳，而不是 `DateTime64` 所在时区的时间戳。
:::

**语法**

```sql
toUnixTimestamp64Milli(value)
```

**参数**

* `value` — 任意精度的 DateTime64 值。[DateTime64](../data-types/datetime64.md)。

**返回值**

* 将 `value` 转换为 `Int64` 数据类型的值。[Int64](../data-types/int-uint.md)。

**示例**

查询：

```sql
WITH toDateTime64('2009-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Milli(dt64);
```

结果：

```response
┌─toUnixTimestamp64Milli(dt64)─┐
│                1234567891011 │
└──────────────────────────────┘
```

## toUnixTimestamp64Micro {#tounixtimestamp64micro}

将 `DateTime64` 转换为具有固定微秒精度的 `Int64` 值。输入值会根据其精度按比例放大或缩小。

:::note
输出值是 UTC 时间戳，而不是按 `DateTime64` 的时区计算的时间戳。
:::

**语法**

```sql
toUnixTimestamp64Micro(value)
```

**参数**

* `value` — 具有任意精度的 DateTime64 值。[DateTime64](../data-types/datetime64.md)。

**返回值**

* 将 `value` 转换为 `Int64` 数据类型后的结果。[Int64](../data-types/int-uint.md)。

**示例**

查询：

```sql
WITH toDateTime64('1970-01-15 06:56:07.891011', 6, 'UTC') AS dt64
SELECT toUnixTimestamp64Micro(dt64);
```

结果：

```response
┌─toUnixTimestamp64Micro(dt64)─┐
│                1234567891011 │
└──────────────────────────────┘
```

## toUnixTimestamp64Nano {#tounixtimestamp64nano}

将 `DateTime64` 转换为具有固定纳秒级精度的 `Int64` 值。输入值会根据其精度按比例放大或缩小。

:::note
输出值是 UTC 时间戳，而不是按 `DateTime64` 所在时区计算的时间戳。
:::

**语法**

```sql
toUnixTimestamp64Nano(value)
```

**参数**

* `value` — 具有任意精度的 DateTime64 值。[DateTime64](../data-types/datetime64.md)。

**返回值**

* 将 `value` 转换为 `Int64` 数据类型后的结果。[Int64](../data-types/int-uint.md)。

**示例**

查询：

```sql
WITH toDateTime64('1970-01-01 00:20:34.567891011', 9, 'UTC') AS dt64
SELECT toUnixTimestamp64Nano(dt64);
```

结果：

```response
┌─toUnixTimestamp64Nano(dt64)─┐
│               1234567891011 │
└─────────────────────────────┘
```

## fromUnixTimestamp64Second {#fromunixtimestamp64second}

将 `Int64` 转换为具有固定秒级精度、可选时区的 `DateTime64` 值。输入值会根据其当前精度被相应地放大或缩小。

:::note
请注意，输入值被视为 UTC 时间戳，而不是给定（或隐式）时区下的时间戳。
:::

**语法**

```sql
fromUnixTimestamp64Second(value[, timezone])
```

**参数**

* `value` — 任意精度的数值。[Int64](../data-types/int-uint.md)。
* `timezone` —（可选）结果使用的时区名称。[String](../data-types/string.md)。

**返回值**

* 将 `value` 转换为精度为 `0` 的 DateTime64 类型的值。[DateTime64](../data-types/datetime64.md)。

**示例**

查询：

```sql
WITH CAST(1733935988, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Second(i64, 'UTC') AS x,
    toTypeName(x);
```

结果：

```response
┌───────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08 │ DateTime64(0, 'UTC') │
└─────────────────────┴──────────────────────┘
```

## fromUnixTimestamp64Milli {#fromunixtimestamp64milli}

将 `Int64` 转换为具有固定毫秒精度、可选时区的 `DateTime64` 值。输入值会根据其精度被相应地放大或缩小。

:::note
请注意，输入值被视为 UTC 时间戳，而不是给定（或隐式）时区下的时间戳。
:::

**语法**

```sql
fromUnixTimestamp64Milli(value[, timezone])
```

**参数**

* `value` — 任意精度的值。[Int64](../data-types/int-uint.md)。
* `timezone` — （可选）结果的时区名称。[String](../data-types/string.md)。

**返回值**

* 将 `value` 转换为精度为 `3` 的 DateTime64 的结果。[DateTime64](../data-types/datetime64.md)。

**示例**

查询：

```sql
WITH CAST(1733935988123, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Milli(i64, 'UTC') AS x,
    toTypeName(x);
```

结果：

```response
┌───────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123 │ DateTime64(3, 'UTC') │
└─────────────────────────┴──────────────────────┘
```

## fromUnixTimestamp64Micro {#fromunixtimestamp64micro}

将 `Int64` 转换为具有固定微秒精度的 `DateTime64` 值，并可选指定时区。输入值会根据其精度被相应地按比例放大或缩小。

:::note
请注意，输入值会被解释为 UTC 时间戳，而不是给定（或隐含）时区下的时间戳。
:::

**语法**

```sql
fromUnixTimestamp64Micro(value[, timezone])
```

**参数**

* `value` — 任意精度的数值。[Int64](../data-types/int-uint.md)。
* `timezone` — （可选）结果的时区名称。[String](../data-types/string.md)。

**返回值**

* 将 `value` 转换为精度为 `6` 的 DateTime64。[DateTime64](../data-types/datetime64.md)。

**示例**

查询：

```sql
WITH CAST(1733935988123456, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Micro(i64, 'UTC') AS x,
    toTypeName(x);
```

结果：

```response
┌──────────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123456 │ DateTime64(6, 'UTC') │
└────────────────────────────┴──────────────────────┘
```

## fromUnixTimestamp64Nano {#fromunixtimestamp64nano}

将 `Int64` 转换为具有固定纳秒精度并可选时区的 `DateTime64` 值。输入值会根据其精度按比例放大或缩小。

:::note
请注意，输入值被视为 UTC 时间戳，而不是给定（或隐式）时区中的时间戳。
:::

**语法**

```sql
fromUnixTimestamp64Nano(value[, timezone])
```

**参数**

* `value` — 任意精度的整数值。[Int64](../data-types/int-uint.md)。
* `timezone` — （可选）结果的时区名称。[String](../data-types/string.md)。

**返回值**

* 将 `value` 转换为精度为 `9` 的 DateTime64 类型的值。[DateTime64](../data-types/datetime64.md)。

**示例**

查询：

```sql
WITH CAST(1733935988123456789, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Nano(i64, 'UTC') AS x,
    toTypeName(x);
```

结果：

```response
┌─────────────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123456789 │ DateTime64(9, 'UTC') │
└───────────────────────────────┴──────────────────────┘
```

## formatRow {#formatrow}

按指定格式将任意表达式转换为字符串。

**语法**

```sql
formatRow(format, x, y, ...)
```

**参数**

* `format` — 文本格式。例如，[CSV](/interfaces/formats/CSV)、[TabSeparated (TSV)](/interfaces/formats/TabSeparated)。
* `x`,`y`, ... — 表达式。

**返回值**

* 格式化后的字符串（对于文本格式，通常以换行符结尾）。

**示例**

查询：

```sql
SELECT formatRow('CSV', number, 'good')
FROM numbers(3);
```

结果：

```response
┌─formatRow('CSV', number, 'good')─┐
│ 0,"good"
                         │
│ 1,"good"
                         │
│ 2,"good"
                         │
└──────────────────────────────────┘
```

**注意**：如果格式中包含前缀或后缀，它将被写入每一行。

**示例**

查询：

```sql
SELECT formatRow('CustomSeparated', number, 'good')
FROM numbers(3)
SETTINGS format_custom_result_before_delimiter='<prefix>\n', format_custom_result_after_delimiter='<suffix>'
```

结果：

```response
┌─formatRow('CustomSeparated', number, 'good')─┐
│ <prefix>
0    good
<suffix>                   │
│ <prefix>
1    good
<suffix>                   │
│ <prefix>
2    good
<suffix>                   │
└──────────────────────────────────────────────┘
```

注意：此函数仅支持行式格式。

## formatRowNoNewline {#formatrownonewline}

通过指定的格式将任意表达式转换为字符串。与 `formatRow` 的区别在于，该函数会在存在最后一个 `\n` 时将其去除。

**语法**

```sql
formatRowNoNewline(format, x, y, ...)
```

**参数**

* `format` — 文本格式。例如，[CSV](/interfaces/formats/CSV)、[TabSeparated (TSV)](/interfaces/formats/TabSeparated)。
* `x`,`y`, ... — 表达式。

**返回值**

* 格式化后的字符串。

**示例**

查询：

```sql
SELECT formatRowNoNewline('CSV', number, 'good')
FROM numbers(3);
```

结果：

```response
┌─formatRowNoNewline('CSV', number, 'good')─┐
│ 0,"good"                                  │
│ 1,"good"                                  │
│ 2,"good"                                  │
└───────────────────────────────────────────┘
```

{/* 
  下面标签的内部内容会在文档框架构建时，
  被根据 system.functions 生成的文档所替换。请勿修改或删除这些标签。
  参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
