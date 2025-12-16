---
description: '类型转换函数参考文档'
sidebar_label: '类型转换'
slug: /sql-reference/functions/type-conversion-functions
title: '类型转换函数'
doc_type: 'reference'
---

# 类型转换函数 {#type-conversion-functions}

## 数据转换中的常见问题 {#common-issues-with-data-conversion}

ClickHouse 通常采用 [与 C++ 程序相同的隐式转换行为](https://en.cppreference.com/w/cpp/language/implicit_conversion)。

`to&lt;type&gt;` 函数和 [cast](#cast) 在某些情况下行为不同，例如在使用 [LowCardinality](../data-types/lowcardinality.md) 时：[cast](#cast) 会移除 [LowCardinality](../data-types/lowcardinality.md) 特征，而 `to&lt;type&gt;` 函数则不会。对于 [Nullable](../data-types/nullable.md) 也是如此。这种行为与 SQL 标准不兼容，可以通过 [cast&#95;keep&#95;nullable](../../operations/settings/settings.md/#cast_keep_nullable) 设置进行调整。

:::note
当某种数据类型的值被转换为更小的数据类型（例如从 `Int64` 转为 `Int32`）或在不兼容的数据类型之间转换（例如从 `String` 转为 `Int`）时，要注意可能发生的数据丢失。请务必仔细检查转换结果是否符合预期。
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

- 在与字符串之间进行转换时，值的格式化或解析使用与 TabSeparated 格式（以及几乎所有其他文本格式）相同的规则。如果字符串无法解析，则会抛出异常并取消请求。
- 在日期与数字之间互相转换时，日期对应于自 Unix 纪元开始以来的天数。
- 在带时间的日期与数字之间互相转换时，带时间的日期对应于自 Unix 纪元开始以来的秒数。
- 当参数为 `DateTime` 时，`toString` 函数可以接受第二个字符串参数，包含时区名称，例如：`Europe/Amsterdam`。在这种情况下，时间会根据指定的时区进行格式化。

## 关于 `toDate`/`toDateTime` 函数的说明 {#to-date-and-date-time-functions}

`toDate`/`toDateTime` 函数的日期和日期时间格式定义如下：

```response
YYYY-MM-DD
YYYY-MM-DD hh:mm:ss
```

作为例外情况，当从 `UInt32`、`Int32`、`UInt64` 或 `Int64` 数值类型转换为 `Date` 时，如果该数值大于或等于 65536，则该数值会被解释为 Unix 时间戳（而不是天数），并被舍入到对应的日期。
这使得常见的写法 `toDate(unix_timestamp)` 得到支持，否则这会是一个错误，并且需要写成更繁琐的 `toDate(toDateTime(unix_timestamp))`。

在日期与带时间的日期之间进行转换时，采用自然的方式：要么补零时间部分，要么丢弃时间部分。

数值类型之间的转换使用与 C++ 中不同数值类型之间赋值相同的规则。

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

将输入值转换为 [`Bool`](../data-types/boolean.md) 类型的值。出错时抛出异常。

**语法**

```sql
toBool(expr)
```

**参数**

* `expr` — 返回数字或字符串的表达式。[表达式](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值。
* 类型为 Float32/64 的值。
* 字符串 `true` 或 `false`（不区分大小写）。

**返回值**

* 根据参数求值结果返回 `true` 或 `false`。[Bool](../data-types/boolean.md)。

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

将输入值转换为 [`Int8`](../data-types/int-uint.md) 类型的值。如果发生错误，则抛出异常。

**语法**

```sql
toInt8(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt8('0xc0fe');`。

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
Row 1:
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

* `x` — 数字的 String 表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `0`）：

* 常规 Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt8OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 8 位整数值，否则返回 `0`。[Int8](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数值的小数部分。
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
Row 1:
──────
toInt8OrZero('-8'):  -8
toInt8OrZero('abc'): 0
```

**另请参阅**

* [`toInt8`](#toint8)。
* [`toInt8OrNull`](#toInt8OrNull)。
* [`toInt8OrDefault`](#toint8ordefault)。


## toInt8OrNull {#toInt8OrNull}

与 [`toInt8`](#toint8) 类似，此函数将输入值转换为 [Int8](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toInt8OrNull(x)
```

**参数**

* `x` — 数字的字符串表示。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt8OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的取值范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 8 位整数值，否则返回 `NULL`。[Int8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，即截断数字的小数部分。
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
Row 1:
──────
toInt8OrNull('-8'):  -8
toInt8OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toInt8`](#toint8)。
* [`toInt8OrZero`](#toint8orzero)。
* [`toInt8OrDefault`](#toint8ordefault)。


## toInt8OrDefault {#toint8ordefault}

与 [`toInt8`](#toint8) 类似，此函数将输入值转换为 [Int8](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt8OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Int8` 类型失败时返回的默认值。[Int8](../data-types/int-uint.md)。

支持的参数类型：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

会返回默认值的情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toInt8OrDefault('0xc0fe', CAST('-1', 'Int8'));`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 8 位整数值，否则在传入默认值时返回该默认值，若未传入则返回 `0`。[Int8](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
* 默认值的类型应与目标转换类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toInt8OrDefault('-8', CAST('-1', 'Int8')),
    toInt8OrDefault('abc', CAST('-1', 'Int8'))
FORMAT Vertical;
```

返回值：

```response
Row 1:
──────
toInt8OrDefault('-8', CAST('-1', 'Int8')):  -8
toInt8OrDefault('abc', CAST('-1', 'Int8')): -1
```

**另请参阅**

* [`toInt8`](#toint8).
* [`toInt8OrZero`](#toint8orzero).
* [`toInt8OrNull`](#toInt8OrNull).


## toInt16 {#toint16}

将输入值转换为 [`Int16`](../data-types/int-uint.md) 类型的值。在发生错误时抛出异常。

**语法**

```sql
toInt16(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。参见 [Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt16('0xc0fe');`。

:::note
如果输入值不能在 [Int16](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
例如：`SELECT toInt16(32768) == -32768;`。
:::

**返回值**

* 16 位整数值。[Int16](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说它会截断数字的小数部分。
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

返回结果：

```response
Row 1:
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

* `x` — 数字的 String 表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt16OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int16](../data-types/int-uint.md) 的范围内表示，结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 16 位整数值，否则返回 `0`。[Int16](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，这意味着它会截断数字的小数部分。
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
Row 1:
──────
toInt16OrZero('-16'): -16
toInt16OrZero('abc'): 0
```

**另请参阅**

* [`toInt16`](#toint16)。
* [`toInt16OrNull`](#toint16ornull)。
* [`toInt16OrDefault`](#toint16ordefault)。


## toInt16OrNull {#toint16ornull}

与 [`toInt16`](#toint16) 类似，此函数将输入值转换为 [Int16](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toInt16OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt16OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int16](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 成功时为 16 位整数值，否则为 `NULL`。[Int16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说会截断数字的小数部分。
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
Row 1:
──────
toInt16OrNull('-16'): -16
toInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**另见**

* [`toInt16`](#toint16)。
* [`toInt16OrZero`](#toint16orzero)。
* [`toInt16OrDefault`](#toint16ordefault)。


## toInt16OrDefault {#toint16ordefault}

与 [`toInt16`](#toint16) 类似，此函数将输入值转换为 [Int16](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未提供 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toInt16OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Int16` 类型失败时要返回的默认值。[Int16](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

下列情况将返回默认值：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toInt16OrDefault('0xc0fe', CAST('-1', 'Int16'));`。

:::note
如果输入值不能在 [Int16](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 16 位整数值，否则返回传入的默认值；如果未传入则返回 `0`。[Int16](../data-types/int-uint.md)。

:::note

* 函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
* 默认值的类型应与目标类型相同。
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
Row 1:
──────
toInt16OrDefault('-16', CAST('-1', 'Int16')): -16
toInt16OrDefault('abc', CAST('-1', 'Int16')): -1
```

**另请参阅**

* [`toInt16`](#toint16)。
* [`toInt16OrZero`](#toint16orzero)。
* [`toInt16OrNull`](#toint16ornull)。


## toInt32 {#toint32}

将输入值转换为 [`Int32`](../data-types/int-uint.md) 类型的值。如果出错则抛出异常。

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
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt32('0xc0fe');`。

:::note
如果输入值无法在 [Int32](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
例如：`SELECT toInt32(2147483648) == -2147483648;`
:::

**返回值**

* 32 位整数值。[Int32](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说，它会截断数字的小数部分。
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
Row 1:
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

与 [`toInt32`](#toint32) 类似，此函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toInt32OrZero(x)
```

**参数**

* `x` — 数值的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt32OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int32](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时为 32 位整数值，否则为 `0`。[Int32](../data-types/int-uint.md)

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
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
Row 1:
──────
toInt32OrZero('-32'): -32
toInt32OrZero('abc'): 0
```

**另请参阅**

* [`toInt32`](#toint32)。
* [`toInt32OrNull`](#toint32ornull)。
* [`toInt32OrDefault`](#toint32ordefault)。


## toInt32OrNull {#toint32ornull}

类似于 [`toInt32`](#toint32)，此函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

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
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt32OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int32](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 32 位整数值，否则返回 `NULL`。[Int32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说会截断数字的小数部分。
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
Row 1:
──────
toInt32OrNull('-32'): -32
toInt32OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toInt32`](#toint32)。
* [`toInt32OrZero`](#toint32orzero)。
* [`toInt32OrDefault`](#toint32ordefault)。


## toInt32OrDefault {#toint32ordefault}

与 [`toInt32`](#toint32) 类似，此函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt32OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 如果解析为 `Int32` 类型不成功时要返回的默认值。[Int32](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

会返回默认值的情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toInt32OrDefault('0xc0fe', CAST('-1', 'Int32'));`。

:::note
如果输入值无法在 [Int32](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 若转换成功，则返回 32 位整数值；否则返回传入的默认值，若未传入则返回 `0`。[Int32](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
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
Row 1:
──────
toInt32OrDefault('-32', CAST('-1', 'Int32')): -32
toInt32OrDefault('abc', CAST('-1', 'Int32')): -1
```

**另请参阅**

* [`toInt32`](#toint32)。
* [`toInt32OrZero`](#toint32orzero)。
* [`toInt32OrNull`](#toint32ornull)。


## toInt64 {#toint64}

将输入值转换为 [`Int64`](../data-types/int-uint.md) 类型的值。如果发生错误，则抛出异常。

**语法**

```sql
toInt64(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的类型：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt64('0xc0fe');`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
例如：`SELECT toInt64(9223372036854775808) == -9223372036854775808;`
:::

**返回值**

* 64 位整数值。[Int64](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
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
Row 1:
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

* `x` — 数字的 String 表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt64OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时返回 64 位整数值，否则返回 `0`。[Int64](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，也就是说会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt64OrZero('-64'),
    toInt64OrZero('abc')
FORMAT Vertical;
```

返回结果：

```response
Row 1:
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

* `x` — 数字的 String 表示形式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt64OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时返回 64 位整数值，否则返回 `NULL`。[Int64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
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
Row 1:
──────
toInt64OrNull('-64'): -64
toInt64OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toInt64`](#toint64)。
* [`toInt64OrZero`](#toint64orzero)。
* [`toInt64OrDefault`](#toint64ordefault)。


## toInt64OrDefault {#toint64ordefault}

与 [`toInt64`](#toint64) 类似，此函数将输入值转换为 [Int64](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt64OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 如果解析为 `Int64` 类型失败时返回的默认值。[Int64](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

会返回默认值的参数情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt64OrDefault('0xc0fe', CAST('-1', 'Int64'));`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 64 位整数值，否则如果传入默认值则返回该默认值，如果未传入则返回 `0`。[Int64](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
* 默认值的类型应与转换目标类型相同。
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
Row 1:
──────
toInt64OrDefault('-64', CAST('-1', 'Int64')): -64
toInt64OrDefault('abc', CAST('-1', 'Int64')): -1
```

**另请参阅**

* [`toInt64`](#toint64).
* [`toInt64OrZero`](#toint64orzero).
* [`toInt64OrNull`](#toint64ornull).


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
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt128('0xc0fe');`。

:::note
如果输入值无法在 [Int128](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 128 位整数值。[Int128](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说会截断数值的小数部分。
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
Row 1:
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

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt128OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int128](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 128 位整数值，否则返回 `0`。[Int128](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt128OrZero('-128'),
    toInt128OrZero('abc')
FORMAT Vertical;
```

返回值：

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

与 [`toInt128`](#toint128) 类似，此函数将输入值转换为 [Int128](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toInt128OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt128OrNull('0xc0fe');`。

:::note
如果输入值不能在 [Int128](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 成功时返回 128 位整数值，否则返回 `NULL`。[Int128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说会截断数字的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toInt128OrNull('-128'),
    toInt128OrNull('abc')
FORMAT Vertical;
```

返回结果：

```response
Row 1:
──────
toInt128OrNull('-128'): -128
toInt128OrNull('abc'):  ᴺᵁᴸᴸ
```

**另请参阅**

* [`toInt128`](#toint128)。
* [`toInt128OrZero`](#toint128orzero)。
* [`toInt128OrDefault`](#toint128ordefault)。


## toInt128OrDefault {#toint128ordefault}

与 [`toInt128`](#toint128) 类似，此函数将输入值转换为 [Int128](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt128OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字的字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Int128` 类型失败时要返回的默认值。[Int128](../data-types/int-uint.md)。

支持的参数：

* (U)Int8/16/32/64/128/256。
* Float32/64。
* (U)Int8/16/32/128/256 的字符串表示。

以下情况下将返回默认值：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt128OrDefault('0xc0fe', CAST('-1', 'Int128'));`。

:::note
如果输入值无法在 [Int128](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 128 位整数值，否则返回传入的默认值，如果未传入则返回 `0`。[Int128](../data-types/int-uint.md)。

:::note

* 该函数采用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，即截断数字的小数部分。
* 默认值的类型应与转换目标类型相同。
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

将输入值转换为 [`Int256`](../data-types/int-uint.md) 类型的值。如果出错则抛出异常。

**语法**

```sql
toInt256(expr)
```

**参数**

* `expr` — 返回数字或数字的字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt256('0xc0fe');`。

:::note
如果输入值无法在 [Int256](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 256 位整数值。[Int256](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
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
Row 1:
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
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt256OrZero('0xc0fe');`。

:::note
如果输入值不能在 [Int256](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 256 位整数值，否则返回 `0`。[Int256](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，这意味着它会截断数字的小数部分。
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
Row 1:
──────
toInt256OrZero('-256'): -256
toInt256OrZero('abc'):  0
```

**另请参阅**

* [`toInt256`](#toint256)。
* [`toInt256OrNull`](#toint256ornull)。
* [`toInt256OrDefault`](#toint256ordefault)。


## toInt256OrNull {#toint256ornull}

与 [`toInt256`](#toint256) 类似，此函数将输入值转换为 [Int256](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toInt256OrNull(x)
```

**参数**

* `x` — 数值的 String 表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toInt256OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int256](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 成功时为 256 位整数值，否则为 `NULL`。[Int256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数值的小数部分。
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
Row 1:
──────
toInt256OrNull('-256'): -256
toInt256OrNull('abc'):  ᴺᵁᴸᴸ
```

**另请参阅**

* [`toInt256`](#toint256)。
* [`toInt256OrZero`](#toint256orzero)。
* [`toInt256OrDefault`](#toint256ordefault)。


## toInt256OrDefault {#toint256ordefault}

与 [`toInt256`](#toint256) 类似，此函数将输入值转换为 [Int256](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt256OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 在解析为 `Int256` 类型不成功时返回的默认值。[Int256](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

会返回默认值的参数：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toInt256OrDefault('0xc0fe', CAST('-1', 'Int256'));`

:::note
如果输入值无法在 [Int256](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 256 位整数值，否则在传入默认值时返回该默认值，未传入则返回 `0`。[Int256](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，即截断数字的小数部分。
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

将输入值转换为 [`UInt8`](../data-types/int-uint.md) 类型的值。如果出错则抛出异常。

**语法**

```sql
toUInt8(expr)
```

**参数**

* `expr` — 返回数字或数字的字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toUInt8('0xc0fe');`。

:::note
如果输入值不能在 [UInt8](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
例如：`SELECT toUInt8(256) == 0;`。
:::

**返回值**

* 8 位无符号整数值。[UInt8](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
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
Row 1:
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

* 常规 Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt8OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的范围内表示，结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时为 8 位无符号整数值，否则为 `0`。[UInt8](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说它会截断数字的小数部分。
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
Row 1:
──────
toUInt8OrZero('-8'):  0
toUInt8OrZero('abc'): 0
```

**另请参阅**

* [`toUInt8`](#touint8)。
* [`toUInt8OrNull`](#touint8ornull)。
* [`toUInt8OrDefault`](#touint8ordefault)。


## toUInt8OrNull {#touint8ornull}

与 [`toUInt8`](#touint8) 类似，此函数将输入值转换为 [UInt8](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toUInt8OrNull(x)
```

**参数**

* `x` — 数字的 String 表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt8OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时为 8 位无符号整数值，否则为 `NULL`。[UInt8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
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
Row 1:
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
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toUInt8OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `UInt8` 类型失败时要返回的默认值。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值。

会返回默认值的参数：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt8OrDefault('0xc0fe', CAST('0', 'UInt8'));`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 8 位无符号整数值，否则在传入默认值时返回该默认值，未传入则返回 `0`。[UInt8](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
* 默认值的类型必须与目标类型相同。
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

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt16('0xc0fe');`。

:::note
如果输入值不能在 [UInt16](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
例如：`SELECT toUInt16(65536) == 0;`。
:::

**返回值**

* 16 位无符号整数值。[UInt16](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
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

返回结果：

```response
Row 1:
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

与 [`toUInt16`](#touint16) 类似，此函数将输入值转换为 [UInt16](../data-types/int-uint.md) 类型的值，但如果出错则返回 `0`。

**语法**

```sql
toUInt16OrZero(x)
```

**参数**

* `x` — 数字的 String 表示形式。 [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制值和十六进制值的字符串表示形式，例如 `SELECT toUInt16OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt16](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 成功时为 16 位无符号整数值，否则为 `0`。[UInt16](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数值的小数部分。
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
Row 1:
──────
toUInt16OrZero('16'):  16
toUInt16OrZero('abc'): 0
```

**另请参阅**

* [`toUInt16`](#touint16)。
* [`toUInt16OrNull`](#touint16ornull)。
* [`toUInt16OrDefault`](#touint16ordefault)。


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
如果输入值无法在 [UInt16](../data-types/int-uint.md) 的取值范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 成功时为 16 位无符号整数值，否则为 `NULL`。[UInt16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，即会截断数值的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt16OrNull('16'),
    toUInt16OrNull('abc')
FORMAT Vertical;
```

返回结果：

```response
Row 1:
──────
toUInt16OrNull('16'):  16
toUInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toUInt16`](#touint16)。
* [`toUInt16OrZero`](#touint16orzero)。
* [`toUInt16OrDefault`](#touint16ordefault)。


## toUInt16OrDefault {#touint16ordefault}

与 [`toUInt16`](#touint16) 类似，此函数将输入值转换为 [UInt16](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

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

会返回默认值的参数：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制数值的字符串表示形式，例如：`SELECT toUInt16OrDefault('0xc0fe', CAST('0', 'UInt16'));`。

:::note
如果输入值无法在 [UInt16](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 若成功，则返回 16 位无符号整数值；否则返回传入的默认值，如果未传入默认值则返回 `0`。[UInt16](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
* 默认值的类型应与转换目标类型相同。
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

将输入值转换为 [`UInt32`](../data-types/int-uint.md) 类型的值。如果出错则抛出异常。

**语法**

```sql
toUInt32(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toUInt32('0xc0fe');`。

:::note
如果输入值不能在 [UInt32](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
例如：`SELECT toUInt32(4294967296) == 0;`
:::

**返回值**

* 32 位无符号整数值。[UInt32](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
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

返回结果：

```response
Row 1:
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

与 [`toUInt32`](#touint32) 类似，此函数将输入值转换为 [UInt32](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toUInt32OrZero(x)
```

**参数**

* `x` — 数字的 String 表示。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt32OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt32](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时为 32 位无符号整数值，否则为 `0`。[UInt32](../data-types/int-uint.md)

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
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
Row 1:
──────
toUInt32OrZero('32'):  32
toUInt32OrZero('abc'): 0
```

**另请参阅**

* [`toUInt32`](#touint32)。
* [`toUInt32OrNull`](#touint32ornull)。
* [`toUInt32OrDefault`](#touint32ordefault)。


## toUInt32OrNull {#touint32ornull}

与 [`toUInt32`](#touint32) 类似，此函数将输入值转换为 [UInt32](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

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
如果输入值无法在 [UInt32](../data-types/int-uint.md) 的取值范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 成功时为 32 位无符号整数值，否则为 `NULL`。[UInt32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)
，即截断数字的小数部分。
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
Row 1:
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
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toUInt32OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字的字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当转换为 `UInt32` 类型失败时返回的默认值。[UInt32](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

将返回默认值的情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt32OrDefault('0xc0fe', CAST('0', 'UInt32'));`。

:::note
如果输入值无法在 [UInt32](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

**返回值**

* 成功时返回 32 位无符号整数值，否则在传入默认值时返回该默认值，未传入时返回 `0`。[UInt32](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
* 默认值的类型应与转换目标类型相同。
  :::

**示例**

查询：

```sql
SELECT
    toUInt32OrDefault('32', CAST('0', 'UInt32')),
    toUInt32OrDefault('abc', CAST('0', 'UInt32'))
FORMAT Vertical;
```

返回结果：

```response
Row 1:
──────
toUInt32OrDefault('32', CAST('0', 'UInt32')):  32
toUInt32OrDefault('abc', CAST('0', 'UInt32')): 0
```

**另请参阅**

* [`toUInt32`](#touint32)。
* [`toUInt32OrZero`](#touint32orzero)。
* [`toUInt32OrNull`](#touint32ornull)。


## toUInt64 {#touint64}

将输入值转换为 [`UInt64`](../data-types/int-uint.md) 类型的值。如果发生错误，则抛出异常。

**语法**

```sql
toUInt64(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的类型：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt64('0xc0fe');`。

:::note
如果输入值无法在 [UInt64](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出（上溢或下溢）。
这不会被视为错误。
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
Row 1:
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

与 [`toUInt64`](#touint64) 类似，此函数将输入值转换为 [UInt64](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toUInt64OrZero(x)
```

**参数**

* `x` — 数字的字符串形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串形式。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串形式，例如：`SELECT toUInt64OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt64](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 64 位无符号整数值，否则返回 `0`。[UInt64](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)规则，即将数字的小数部分截断。
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
Row 1:
──────
toUInt64OrZero('64'):  64
toUInt64OrZero('abc'): 0
```

**另请参见**

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

* `x` — 数值的字符串表示形式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示形式。

不支持的参数（返回 `\N`）：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制值和十六进制值的字符串表示形式，例如 `SELECT toUInt64OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt64](../data-types/int-uint.md) 的范围内表示，结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 转换成功时返回 64 位无符号整数值，否则返回 `NULL`。[UInt64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，也就是说会截断数值的小数部分。
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
Row 1:
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

* `expr` — 返回一个数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `defauult`（可选）— 当解析为 `UInt64` 类型失败时返回的默认值。[UInt64](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值。

会返回默认值的参数情况：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toUInt64OrDefault('0xc0fe', CAST('0', 'UInt64'));`。

:::note
如果输入值无法在 [UInt64](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 若转换成功，则返回 64 位无符号整数值；否则，如果传入了默认值则返回该默认值，未传入则返回 `0`。[UInt64](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，即会截断数字的小数部分。
* 默认值的类型应与转换目标类型相同。
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

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toUInt128('0xc0fe');`。

:::note
如果输入值无法在 [UInt128](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

**返回值**

* 128 位无符号整数值。[UInt128](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
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

返回结果：

```response
Row 1:
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

* `expr` — 返回数值或其字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt128OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt128](../data-types/int-uint.md) 的取值范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 128 位无符号整数值，否则返回 `0`。[UInt128](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数值的小数部分。
:::

**示例**

查询：

```sql
SELECT
    toUInt128OrZero('128'),
    toUInt128OrZero('abc')
FORMAT Vertical;
```

返回值：

```response
Row 1:
──────
toUInt128OrZero('128'): 128
toUInt128OrZero('abc'): 0
```

**另请参阅**

* [`toUInt128`](#touint128)。
* [`toUInt128OrNull`](#touint128ornull)。
* [`toUInt128OrDefault`](#touint128ordefault)。


## toUInt128OrNull {#touint128ornull}

与 [`toUInt128`](#touint128) 类似，此函数将输入值转换为 [UInt128](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toUInt128OrNull(x)
```

**参数**

* `x` — 数字的 String 类型表示。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt128OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt128](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 128 位无符号整数值，否则返回 `NULL`。[UInt128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
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
Row 1:
──────
toUInt128OrNull('128'): 128
toUInt128OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toUInt128`](#touint128)。
* [`toUInt128OrZero`](#touint128orzero)。
* [`toUInt128OrDefault`](#touint128ordefault)。


## toUInt128OrDefault {#touint128ordefault}

与 [`toUInt128`](#toint128) 类似，此函数将输入值转换为类型为 [UInt128](../data-types/int-uint.md) 的值，但在出错时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toUInt128OrDefault(expr[, default])
```

**参数**

* `expr` — 结果为数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `UInt128` 类型失败时要返回的默认值。[UInt128](../data-types/int-uint.md)。

支持的参数类型：

* (U)Int8/16/32/64/128/256。
* Float32/64。
* (U)Int8/16/32/128/256 的字符串表示。

会返回默认值的情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt128OrDefault('0xc0fe', CAST('0', 'UInt128'));`。

:::note
如果输入值无法在 [UInt128](../data-types/int-uint.md) 的范围内表示，将会发生结果的上溢或下溢。
这不被视为错误。
:::

**返回值**

* 若解析成功，则返回 128 位无符号整数值；否则在传入默认值的情况下返回该默认值，未传入时返回 `0`。[UInt128](../data-types/int-uint.md)。

:::note

* 该函数使用[趋零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)策略，即会截断数字的小数部分。
* 默认值的类型应与目标转换类型相同。
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
Row 1:
──────
toUInt128OrDefault('128', CAST('0', 'UInt128')): 128
toUInt128OrDefault('abc', CAST('0', 'UInt128')): 0
```

**另请参见**

* [`toUInt128`](#touint128)。
* [`toUInt128OrZero`](#touint128orzero)。
* [`toUInt128OrNull`](#touint128ornull)。


## toUInt256 {#touint256}

将输入值转换为 [`UInt256`](../data-types/int-uint.md) 类型的值。遇到错误时抛出异常。

**语法**

```sql
toUInt256(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。参见 [Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

不支持的参数：

* Float32/64 类型值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt256('0xc0fe');`。

:::note
如果输入值无法在 [UInt256](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 256 位无符号整数值。[Int256](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
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

返回结果：

```response
Row 1:
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

与 [`toUInt256`](#touint256) 类似，此函数将输入值转换为 [UInt256](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toUInt256OrZero(x)
```

**参数**

* `x` — 数字的 String 字符串表示。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制值和十六进制值的字符串表示，例如 `SELECT toUInt256OrZero('0xc0fe');`。

:::note
如果输入值不能在 [UInt256](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 256 位无符号整数值，否则返回 `0`。[UInt256](../data-types/int-uint.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
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
Row 1:
──────
toUInt256OrZero('256'): 256
toUInt256OrZero('abc'): 0
```

**另请参阅**

* [`toUInt256`](#touint256)。
* [`toUInt256OrNull`](#touint256ornull)。
* [`toUInt256OrDefault`](#touint256ordefault)。


## toUInt256OrNull {#touint256ornull}

与 [`toUInt256`](#touint256) 类似，此函数将输入值转换为 [UInt256](../data-types/int-uint.md) 类型的值，但在出错时返回 `NULL`。

**语法**

```sql
toUInt256OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt256OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt256](../data-types/int-uint.md) 的范围内表示，结果将发生溢出或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 256 位无符号整数值，否则返回 `NULL`。[UInt256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，这意味着它会截断数字的小数部分。
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
Row 1:
──────
toUInt256OrNull('256'): 256
toUInt256OrNull('abc'): ᴺᵁᴸᴸ
```

**另请参阅**

* [`toUInt256`](#touint256)。
* [`toUInt256OrZero`](#touint256orzero)。
* [`toUInt256OrDefault`](#touint256ordefault)。


## toUInt256OrDefault {#touint256ordefault}

与 [`toUInt256`](#touint256) 类似，此函数将输入值转换为 [UInt256](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toUInt256OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `UInt256` 类型失败时返回的默认值。[UInt256](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值。

会返回默认值的参数情况：

* Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt256OrDefault('0xc0fe', CAST('0', 'UInt256'));`。

:::note
如果输入值无法在 [UInt256](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

**返回值**

* 成功时返回 256 位无符号整数值，否则返回传入的默认值；如果未传入则返回 `0`。[UInt256](../data-types/int-uint.md)。

:::note

* 该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着会截断数字的小数部分。
* 默认值的类型应与转换的目标类型相同。
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
Row 1:
──────
toUInt256OrDefault('-256', CAST('0', 'UInt256')): 0
toUInt256OrDefault('abc', CAST('0', 'UInt256')):  0
```

**另请参阅**

* [`toUInt256`](#touint256)。
* [`toUInt256OrZero`](#touint256orzero)。
* [`toUInt256OrNull`](#touint256ornull)。


## toFloat32 {#tofloat32}

将输入值转换为 [`Float32`](../data-types/float.md) 类型的值。在发生错误时会抛出异常。

**语法**

```sql
toFloat32(expr)
```

**参数**

* `expr` — 其计算结果为数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值。
* (U)Int8/16/32/128/256 的字符串表示形式。
* 类型为 Float32/64 的值，包括 `NaN` 和 `Inf`。
* Float32/64 的字符串表示形式，包括 `NaN` 和 `Inf`（大小写不敏感）。

不支持的参数：

* 二进制和十六进制值的字符串表示形式，例如 `SELECT toFloat32('0xc0fe');`。

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
Row 1:
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

与 [`toFloat32`](#tofloat32) 类似，此函数将输入值转换为 [Float32](../data-types/float.md) 类型的值，但遇到错误时返回 `0`。

**语法**

```sql
toFloat32OrZero(x)
```

**参数**

* `x` — 数字的 String 字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256、Float32/64 的字符串表示形式。

不支持的参数（返回 `0`）：

* 二进制和十六进制值的字符串表示形式，例如 `SELECT toFloat32OrZero('0xc0fe');`。

**返回值**

* 成功时返回 32 位 Float 类型值，否则返回 `0`。[Float32](../data-types/float.md)。

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
Row 1:
──────
toFloat32OrZero('42.7'): 42.7
toFloat32OrZero('abc'):  0
```

**另请参阅**

* [`toFloat32`](#tofloat32)。
* [`toFloat32OrNull`](#tofloat32ornull)。
* [`toFloat32OrDefault`](#tofloat32ordefault)。


## toFloat32OrNull {#tofloat32ornull}

与 [`toFloat32`](#tofloat32) 类似，此函数将输入值转换为 [Float32](../data-types/float.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toFloat32OrNull(x)
```

**参数**

* `x` — 数值的 String 表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256、Float32/64 的字符串表示形式。

不支持的参数（返回 `\N`）：

* 二进制和十六进制值的字符串表示形式，例如：`SELECT toFloat32OrNull('0xc0fe');`。

**返回值**

* 成功时为 32 位 Float 值，否则为 `\N`。[Float32](../data-types/float.md)。

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
Row 1:
──────
toFloat32OrNull('42.7'): 42.7
toFloat32OrNull('abc'):  ᴺᵁᴸᴸ
```

**另请参阅**

* [`toFloat32`](#tofloat32)。
* [`toFloat32OrZero`](#tofloat32orzero)。
* [`toFloat32OrDefault`](#tofloat32ordefault)。


## toFloat32OrDefault {#tofloat32ordefault}

与 [`toFloat32`](#tofloat32) 类似，此函数将输入值转换为 [Float32](../data-types/float.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 参数，则在出错时返回 `0`。

**语法**

```sql
toFloat32OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或表示数字的字符串的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Float32` 类型失败时返回的默认值。[Float32](../data-types/float.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值。
* (U)Int8/16/32/128/256 的字符串表示形式。
* 类型为 Float32/64 的值，包括 `NaN` 和 `Inf`。
* Float32/64 的字符串表示形式，包括 `NaN` 和 `Inf`（大小写不敏感）。

会返回默认值的参数：

* 二进制和十六进制值的字符串表示形式，例如：`SELECT toFloat32OrDefault('0xc0fe', CAST('0', 'Float32'));`。

**返回值**

* 成功时返回 32 位 Float 值，否则如果传入了默认值则返回该默认值，如果未传入默认值则返回 `0`。[Float32](../data-types/float.md)。

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
Row 1:
──────
toFloat32OrDefault('8', CAST('0', 'Float32')):   8
toFloat32OrDefault('abc', CAST('0', 'Float32')): 0
```

**另请参阅**

* [`toFloat32`](#tofloat32).
* [`toFloat32OrZero`](#tofloat32orzero).
* [`toFloat32OrNull`](#tofloat32ornull).


## toFloat64 {#tofloat64}

将输入值转换为 [`Float64`](../data-types/float.md) 类型的值。发生错误时会抛出异常。

**语法**

```sql
toFloat64(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值。
* (U)Int8/16/32/128/256 的字符串表示形式。
* 类型为 Float32/64 的值，包括 `NaN` 和 `Inf`。
* 类型为 Float32/64 的字符串表示形式，包括 `NaN` 和 `Inf`（不区分大小写）。

不支持的参数：

* 二进制和十六进制值的字符串表示形式，例如 `SELECT toFloat64('0xc0fe');`。

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

返回结果：

```response
Row 1:
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

* `x` — 数字的字符串形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256、Float32/64 的字符串形式。

不支持的参数（返回 `0`）：

* 二进制和十六进制值的字符串形式，例如 `SELECT toFloat64OrZero('0xc0fe');`。

**返回值**

* 成功时返回 64 位浮点值，否则返回 `0`。[Float64](../data-types/float.md)。

**示例**

查询：

```sql
SELECT
    toFloat64OrZero('42.7'),
    toFloat64OrZero('abc')
FORMAT Vertical;
```

返回结果：

```response
Row 1:
──────
toFloat64OrZero('42.7'): 42.7
toFloat64OrZero('abc'):  0
```

**另请参阅**

* [`toFloat64`](#tofloat64)。
* [`toFloat64OrNull`](#tofloat64ornull)。
* [`toFloat64OrDefault`](#tofloat64ordefault)。


## toFloat64OrNull {#tofloat64ornull}

类似于 [`toFloat64`](#tofloat64)，此函数将输入值转换为 [Float64](../data-types/float.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toFloat64OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[String](../data-types/string.md)。

支持的参数：

* (U)Int8/16/32/128/256、Float32/64 的字符串表示形式。

不支持的参数（返回 `\N`）：

* 二进制和十六进制值的字符串表示形式，例如：`SELECT toFloat64OrNull('0xc0fe');`。

**返回值**

* 成功时返回 64 位 Float 值，否则返回 `\N`。[Float64](../data-types/float.md)。

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
Row 1:
──────
toFloat64OrNull('42.7'): 42.7
toFloat64OrNull('abc'):  ᴺᵁᴸᴸ
```

**另请参阅**

* [`toFloat64`](#tofloat64)。
* [`toFloat64OrZero`](#tofloat64orzero)。
* [`toFloat64OrDefault`](#tofloat64ordefault)。


## toFloat64OrDefault {#tofloat64ordefault}

类似于 [`toFloat64`](#tofloat64)，该函数会将输入值转换为 [Float64](../data-types/float.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 参数，则在出错时返回 `0`。

**语法**

```sql
toFloat64OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
* `default`（可选）— 当解析为 `Float64` 类型失败时返回的默认值。[Float64](../data-types/float.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值。
* (U)Int8/16/32/128/256 的字符串表示形式。
* 类型为 Float32/64 的值，包括 `NaN` 和 `Inf`。
* Float32/64 的字符串表示形式，包括 `NaN` 和 `Inf`（不区分大小写）。

会返回默认值的参数：

* 二进制和十六进制值的字符串表示形式，例如：`SELECT toFloat64OrDefault('0xc0fe', CAST('0', 'Float64'));`。

**返回值**

* 若转换成功则返回 64 位 Float 值，否则返回传入的默认值；如果未传入默认值则返回 `0`。[Float64](../data-types/float.md)。

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
Row 1:
──────
toFloat64OrDefault('8', CAST('0', 'Float64')):   8
toFloat64OrDefault('abc', CAST('0', 'Float64')): 0
```

**另请参阅**

* [`toFloat64`](#tofloat64).
* [`toFloat64OrZero`](#tofloat64orzero).
* [`toFloat64OrNull`](#tofloat64ornull).


## toBFloat16 {#tobfloat16}

将输入的值转换为 [`BFloat16`](/sql-reference/data-types/float#bfloat16) 类型的值。
出错时抛出异常。

**语法**

```sql
toBFloat16(expr)
```

**参数**

* `expr` — 计算结果为数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值。
* (U)Int8/16/32/128/256 的字符串表示形式。
* 类型为 Float32/64 的值，包括 `NaN` 和 `Inf`。
* Float32/64 的字符串表示形式，包括 `NaN` 和 `Inf`（大小写不敏感）。

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

将 String 类型的输入值转换为 [`BFloat16`](/sql-reference/data-types/float#bfloat16) 类型的值。
如果字符串不表示浮点数值，则函数返回 0。

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
* 数值。

**返回值**

* 16 位 brain-float 值，否则为 `0`。[BFloat16](/sql-reference/data-types/float#bfloat16)。

:::note
该函数在从字符串表示形式转换时会允许静默丢失精度。
:::

**示例**

```sql
SELECT toBFloat16OrZero('0x5E'); -- unsupported arguments

0

SELECT toBFloat16OrZero('12.3'); -- typical use

12.25

SELECT toBFloat16OrZero('12.3456789');

12.3125 -- silent loss of precision
```

**另请参阅**

* [`toBFloat16`](#tobfloat16)。
* [`toBFloat16OrNull`](#tobfloat16ornull)。


## toBFloat16OrNull {#tobfloat16ornull}

将 String 类型的输入值转换为 [`BFloat16`](/sql-reference/data-types/float#bfloat16) 类型的值，
但如果该字符串不表示浮点数，则函数返回 `NULL`。

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
该函数在将字符串表示形式转换为数值时允许静默的精度损失。
:::

**示例**

```sql
SELECT toBFloat16OrNull('0x5E'); -- unsupported arguments

\N

SELECT toBFloat16OrNull('12.3'); -- typical use

12.25

SELECT toBFloat16OrNull('12.3456789');

12.3125 -- silent loss of precision
```

**另请参阅**

* [`toBFloat16`](#tobfloat16)。
* [`toBFloat16OrZero`](#tobfloat16orzero)。


## toDate {#todate}

将参数转换为 [Date](../data-types/date.md) 数据类型的值。

如果参数是 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)，则会对其进行截断，只保留其日期部分：

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

如果参数是 [String](../data-types/string.md)，则会被解析为 [Date](../data-types/date.md) 或 [DateTime](../data-types/datetime.md)。如果被解析为 [DateTime](../data-types/datetime.md)，则只使用日期部分：

```sql
SELECT
    toDate('2022-12-30') AS x,
    toTypeName(x)
```

```response
┌──────────x─┬─toTypeName(toDate('2022-12-30'))─┐
│ 2022-12-30 │ Date                             │
└────────────┴──────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
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

如果参数是一个数字并且看起来像 UNIX 时间戳（大于 65535），则将其解释为 [DateTime](../data-types/datetime.md)，然后在当前时区将其截断为 [Date](../data-types/date.md)。时区参数可以作为该函数的第二个参数指定。截断为 [Date](../data-types/date.md) 的结果取决于时区：

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
Row 1:
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

上面的示例演示了相同的 UNIX 时间戳在不同时区中可以被解释为不同的日期。

如果参数是一个数字且小于 65536，则将其解释为自 1970-01-01（UNIX 纪元的第 1 天）以来的天数，并将其转换为 [Date](../data-types/date.md)。这对应于 `Date` 数据类型的内部数值表示。示例：

```sql
SELECT toDate(12345)
```

```response
┌─toDate(12345)─┐
│    2003-10-20 │
└───────────────┘
```

此转换不依赖于时区。

如果参数不在 `Date` 类型的取值范围内，其行为由具体实现定义，可能会被截断为支持的最大日期，或发生溢出：

```sql
SELECT toDate(10000000000.)
```

```response
┌─toDate(10000000000.)─┐
│           2106-02-07 │
└──────────────────────┘
```

函数 `toDate` 也可以写成以下几种形式：

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

与 [toDate](#todate) 相同，但在接收到无效参数时返回 [Date](../data-types/date.md) 类型的下界值。仅支持 [String](../data-types/string.md) 类型参数。

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

与 [toDate](#todate) 相同，但在参数无效时返回 `NULL`。仅支持 [String](../data-types/string.md) 类型的参数。

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

类似于 [toDate](#todate)，但在转换不成功时返回一个默认值：如果指定了第二个参数，则使用该参数，否则使用 [Date](../data-types/date.md) 的下界。

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
如果 `expr` 是 [String](../data-types/string.md)，则可以将其解释为 Unix 时间戳，或日期 / 日期时间的字符串表示。
因此，出于歧义考虑，明确禁止解析短数字串的字符串表示（长度不超过 4 位数字），例如字符串 `'1999'` 既可能是年份（Date / DateTime 的不完整字符串表示），也可能是 Unix 时间戳。更长的数字字符串则是允许的。
:::

**返回值**

* 日期时间。[DateTime](../data-types/datetime.md)

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

与 [toDateTime](#todatetime) 相同，但在收到无效参数时返回 [DateTime](../data-types/datetime.md) 的下界。仅支持 [String](../data-types/string.md) 参数。

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

与 [toDateTime](#todatetime) 相同，但在接收到无效参数时返回 `NULL`。仅支持 [String](../data-types/string.md) 类型参数。

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

类似于 [toDateTime](#todatetime)，但如果转换不成功，则返回一个默认值：若指定了第三个参数则返回该参数，否则返回 [DateTime](../data-types/datetime.md) 可表示的最小值。

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

将参数转换为 [Date32](../data-types/date32.md) 数据类型。如果值超出范围，`toDate32` 将返回 [Date32](../data-types/date32.md) 所支持的边界值。如果参数的类型为 [Date](../data-types/date.md)，则会考虑其自身的取值范围边界。

**语法**

```sql
toDate32(expr)
```

**参数**

* `expr` — 值。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md) 或 [Date](../data-types/date.md)。

**返回值**

* 日历日期。类型为 [Date32](../data-types/date32.md)。

**示例**

1. 值在有效范围内：

```sql
SELECT toDate32('1955-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1925-01-01'))─┐
│ 1955-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

2. 值超出取值范围：

```sql
SELECT toDate32('1899-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1899-01-01'))─┐
│ 1900-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

3. 使用 [Date](../data-types/date.md) 类型的参数：

```sql
SELECT toDate32(toDate('1899-01-01')) AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32(toDate('1899-01-01')))─┐
│ 1970-01-01 │ Date32                                     │
└────────────┴────────────────────────────────────────────┘
```


## toDate32OrZero {#todate32orzero}

与 [toDate32](#todate32) 相同，但在传入无效参数时返回 [Date32](../data-types/date32.md) 类型的最小值。

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

将参数转换为 [Date32](../data-types/date32.md) 数据类型。如果值超出范围，`toDate32OrDefault` 会返回 [Date32](../data-types/date32.md) 支持的下边界值。如果参数类型为 [Date](../data-types/date.md)，则会同时考虑其取值边界。当接收到无效参数时，返回默认值。

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

1. 值在有效范围内：

```sql
SELECT toDateTime64('1955-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('1955-01-01 00:00:00.000', 3))─┐
│ 1955-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

2. 作为具有指定精度的十进制数：

```sql
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800., 3))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
```

如果省略小数点，该值仍会被视为以秒为单位的 Unix 时间戳：

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

与 [toDateTime64](#todatetime64) 类似，此函数将输入值转换为 [DateTime64](../data-types/datetime64.md) 类型的值，但在接收到无效参数时返回 [DateTime64](../data-types/datetime64.md) 的最小值。

**语法**

```sql
toDateTime64OrZero(expr, scale, [timezone])
```

**参数**

* `expr` — 值。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [DateTime](../data-types/datetime.md)。
* `scale` - 刻度（精度）：10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。
* `timezone`（可选）- 指定的 DateTime64 对象使用的时区。

**返回值**

* 具有亚秒级精度的日历日期和时间，否则返回 `DateTime64` 的最小值：`1970-01-01 01:00:00.000`。[DateTime64](../data-types/datetime64.md)。

**示例**

查询语句：

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

与 [toDateTime64](#todatetime64) 类似，此函数将输入值转换成 [DateTime64](../data-types/datetime64.md) 类型的值，但在收到无效参数时返回 `NULL`。

**语法**

```sql
toDateTime64OrNull(expr, scale, [timezone])
```

**参数**

* `expr` — 值。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [DateTime](../data-types/datetime.md)。
* `scale` - 刻度（精度）：10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。
* `timezone`（可选）- 指定的 DateTime64 对象所使用的时区。

**返回值**

* 具有子秒级精度的日历日期和时间，否则为 `NULL`。[DateTime64](../data-types/datetime64.md)/[NULL](../data-types/nullable.md)。

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

与 [toDateTime64](#todatetime64) 类似，此函数将输入值转换为 [DateTime64](../data-types/datetime64.md) 类型的值，
但在收到无效参数时，将返回 [DateTime64](../data-types/datetime64.md) 的默认值，
或用户提供的默认值。

**语法**

```sql
toDateTime64OrNull(expr, scale, [timezone, default])
```

**参数**

* `expr` — 值。[String](../data-types/string.md)、[UInt32](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [DateTime](../data-types/datetime.md)。
* `scale` - 刻度（精度）：10<sup>-precision</sup> 秒。有效范围：[ 0 : 9 ]。
* `timezone`（可选）- 指定的 DateTime64 对象的时区。
* `default`（可选）- 当收到无效参数时返回的默认值。[DateTime64](../data-types/datetime64.md)。

**返回值**

* 具有亚秒级精度的日历日期和时间，否则为 `DateTime64` 的最小值，或（如果提供）`default` 值。[DateTime64](../data-types/datetime64.md)。

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

将输入值转换为标度为 `S` 的 [`Decimal(9, S)`](../data-types/decimal.md) 类型的值。出错时抛出异常。

**语法**

```sql
toDecimal32(expr, S)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 介于 0 和 9 之间的 scale 参数，用于指定数字小数部分可以有多少位。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值或其字符串表示形式。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf`（不区分大小写）的值或其字符串表示形式。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toDecimal32('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal32` 的边界 `( -1 * 10^(9 - S), 1 * 10^(9 - S) )`，可能会发生溢出。
小数部分中过多的数字会被丢弃（不会四舍五入）。
整数部分中过多的数字将导致抛出异常。
:::

:::warning
转换会截断多余的数字，并且在处理 Float32/Float64 输入时可能以非预期方式工作，因为这些操作是使用浮点数指令执行的。
例如：`toDecimal32(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 等于 114.99。
你可以使用 String 输入，这样操作将使用底层的整数类型：`toDecimal32('1.15', 2) = 1.15`
:::

**返回值**

* 类型为 `Decimal(9, S)` 的值。[Decimal32(S)](../data-types/int-uint.md)。

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
Row 1:
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

与 [`toDecimal32`](#todecimal32) 类似，此函数将输入值转换为 [Decimal(9, S)](../data-types/decimal.md) 类型的值，但在出错时返回 `0`。

**语法**

```sql
toDecimal32OrZero(expr, S)
```

**参数**

* `expr` — 数字的 String 表示。[String](../data-types/string.md)。
* `S` — 介于 0 到 9 之间的缩放参数，用于指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal32OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal32` 的取值范围，则可能发生溢出：`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部分中过多的数字会被截断（不会四舍五入）。
整数部分中过多的数字会导致错误。
:::

**返回值**

* 成功时返回类型为 `Decimal(9, S)` 的值，否则返回带有 `S` 位小数的 `0`。[Decimal32(S)](../data-types/decimal.md)。

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
Row 1:
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

与 [`toDecimal32`](#todecimal32) 类似，此函数将输入值转换为 [Nullable(Decimal(9, S))](../data-types/decimal.md) 类型的值，如果发生错误，则返回 `0`。

**语法**

```sql
toDecimal32OrNull(expr, S)
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 9 之间的 scale 参数，指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示形式。
* 类型为 Float32/64 的字符串表示形式。

不支持的参数：

* 值为 `NaN` 和 `Inf` 的 Float32/64 的字符串表示形式。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toDecimal32OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal32` 的范围，则可能发生溢出：`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部分中多余的数字会被丢弃（不会四舍五入）。
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

返回结果：

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

与 [`toDecimal32`](#todecimal32) 类似，此函数将输入值转换为 [Decimal(9, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**参数**

* `expr` — 数字的 String 表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 9 之间的 Scale 参数，用于指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。
* `default`（可选）— 当解析为 `Decimal32(S)` 类型失败时要返回的默认值。[Decimal32(S)](../data-types/decimal.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal32OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal32` 的范围，则可能会发生溢出：`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。
小数部分中多余的数字会被丢弃（不会被四舍五入）。
整数部分中多余的数字会导致错误。
:::

:::warning
在处理 Float32/Float64 输入时，由于转换使用浮点指令执行，会丢弃额外的数字，并且可能产生意料之外的结果。
例如：`toDecimal32OrDefault(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 的结果为 114.99。
你可以使用 String 作为输入，这样运算会使用底层整数类型：`toDecimal32OrDefault('1.15', 2) = 1.15`
:::

**返回值**

* 如果成功，返回类型为 `Decimal(9, S)` 的值，否则如果传入了默认值则返回默认值，如果未传入则返回 `0`。[Decimal32(S)](../data-types/decimal.md)。

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
Row 1:
──────
a:             0.0001
toTypeName(a): Decimal(9, 5)
b:             -1
toTypeName(b): Decimal(9, 0)
```

**另请参阅**

* [`toDecimal32`](#todecimal32)。
* [`toDecimal32OrZero`](#todecimal32orzero)。
* [`toDecimal32OrNull`](#todecimal32ornull)。


## toDecimal64 {#todecimal64}

将输入值转换为 [`Decimal(18, S)`](../data-types/decimal.md) 类型、标度（scale）为 `S` 的值。出错时抛出异常。

**语法**

```sql
toDecimal64(expr, S)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。参见 [Expression](/sql-reference/syntax#expressions)。
* `S` — 介于 0 和 18 之间的 scale 参数，用于指定数字小数部分最多可以有多少位。类型为 [UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值或其字符串表示形式。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf`（不区分大小写）的值或字符串表示形式。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toDecimal64('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal64` 的边界 `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`，则可能会发生溢出。
小数部分中多余的数字会被丢弃（不会进行四舍五入）。
整数部分中多余的数字会导致抛出异常。
:::

:::warning
进行转换时会丢弃多余的数字，并且在处理 Float32/Float64 输入时，可能会由于运算是通过浮点指令执行而出现非预期行为。
例如：`toDecimal64(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 得到的是 114.99。
可以使用 String 作为输入，这样运算将使用底层整数类型：`toDecimal64('1.15', 2) = 1.15`
:::

**返回值**

* 类型为 `Decimal(18, S)` 的值。参见 [Decimal64(S)](../data-types/int-uint.md)。

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

与 [`toDecimal64`](#todecimal64) 类似，此函数将输入值转换为 [Decimal(18, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal64OrZero(expr, S)
```

**参数**

* `expr` — 数字的字符串表示。[String](../data-types/string.md)。
* `S` — 介于 0 和 18 之间的 Scale 参数，用于指定数字小数部分可以具有的位数。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* 值为 `NaN` 和 `Inf` 的 Float32/64 字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal64OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal64` 的取值范围，则可能发生溢出：`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`。
小数部分中多余的位数会被截断（不进行四舍五入）。
整数部分中多余的位数会导致报错。
:::

**返回值**

* 成功时返回类型为 `Decimal(18, S)` 的值，否则返回带有 `S` 位小数的 `0`。[Decimal64(S)](../data-types/decimal.md)。

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
Row 1:
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

* `expr` — 数字的 String 表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 18 之间的 scale 参数，用于指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* 值为 `NaN` 和 `Inf` 的 Float32/64 的字符串表示。
* 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal64OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal64` 的范围 `( -1 * 10^(18 - S), 1 * 10^(18 - S) )`，可能会发生溢出。
小数部分中多余的数字会被丢弃（不会四舍五入）。
整数部分中多余的数字会导致错误。
:::

**返回值**

* 成功时返回类型为 `Nullable(Decimal(18, S))` 的值，否则返回相同类型的 `NULL` 值。[Decimal64(S)](../data-types/decimal.md)。

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

与 [`toDecimal64`](#todecimal64) 类似，此函数将输入值转换为 [Decimal(18, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**参数**

* `expr` — 数字的字符串形式。 [String](../data-types/string.md)。
* `S` — 介于 0 和 18 之间的 scale 参数，指定数字小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。
* `default`（可选）— 当解析为 `Decimal64(S)` 类型失败时要返回的默认值。 [Decimal64(S)](../data-types/decimal.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串形式。
* 类型为 Float32/64 的字符串形式。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串形式。
* 二进制和十六进制值的字符串形式，例如 `SELECT toDecimal64OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal64` 的范围，则可能发生溢出：`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`。
小数部分中过多的数字会被丢弃（不会四舍五入）。
整数部分中过多的数字会导致错误。
:::

:::warning
在使用 Float32/Float64 作为输入时，由于运算是使用浮点指令执行的，转换会丢弃多余的数字，并且可能产生非预期结果。
例如：`toDecimal64OrDefault(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 等于 114.99。
你可以使用 String 作为输入，这样运算将使用底层整数类型：`toDecimal64OrDefault('1.15', 2) = 1.15`
:::

**返回值**

* 成功时返回类型为 `Decimal(18, S)` 的值，否则返回传入的默认值，如果未传入则返回 `0`。 [Decimal64(S)](../data-types/decimal.md)。

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

将输入值转换为类型为 [`Decimal(38, S)`](../data-types/decimal.md)、小数位数为 `S` 的值。若发生错误，则抛出异常。

**语法**

```sql
toDecimal128(expr, S)
```

**参数**

* `expr` — 返回一个数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 介于 0 和 38 之间的 scale 参数，用于指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示形式。
* 类型为 Float32/64 的值或其字符串表示形式。

不支持的参数：

* Float32/64 类型中值为 `NaN` 和 `Inf`（大小写不敏感）的值或其字符串表示形式。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal128('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal128` 的范围，则可能会发生溢出：`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`。
小数部分中多余的数字会被舍弃（不会四舍五入）。
整数部分中多余的数字会导致抛出异常。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃额外的数字，并且由于操作是使用浮点指令执行的，可能会产生非预期的结果。
例如：`toDecimal128(1.15, 2)` 等于 `1.14`，因为在浮点数中 1.15 * 100 等于 114.99。
你可以使用 String 作为输入，使运算基于底层整数类型进行：`toDecimal128('1.15', 2) = 1.15`
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
Row 1:
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

与 [`toDecimal128`](#todecimal128) 类似，此函数将输入值转换为 [Decimal(38, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal128OrZero(expr, S)
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 38 之间的标度参数，用于指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示形式。
* 类型为 Float32/64 的字符串表示形式。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示形式。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toDecimal128OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal128` 的范围，则可能会发生溢出：`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`。
小数部分中多余的数字会被截断（不会四舍五入）。
整数部分中多余的数字会导致错误。
:::

**返回值**

* 成功时返回类型为 `Decimal(38, S)` 的值，否则返回值为带有 `S` 位小数的 `0`。[Decimal128(S)](../data-types/decimal.md)。

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
Row 1:
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

与 [`toDecimal128`](#todecimal128) 类似，此函数将输入值转换为类型为 [Nullable(Decimal(38, S))](../data-types/decimal.md) 的值，但在出错时返回 `0`。

**语法**

```sql
toDecimal128OrNull(expr, S)
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 38 之间的 scale 参数，指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示形式。
* 类型为 Float32/64 的字符串表示形式。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示形式。
* 二进制值和十六进制值的字符串表示形式，例如：`SELECT toDecimal128OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal128` 的范围，则会发生溢出：`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`。
小数部分中多余的数字会被丢弃（不会四舍五入）。
整数部分中多余的数字会导致错误。
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

与 [`toDecimal128`](#todecimal128) 类似，此函数将输入值转换为类型为 [Decimal(38, S)](../data-types/decimal.md) 的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**参数**

* `expr` — 数值的字符串表示。 [String](../data-types/string.md)。
* `S` — 介于 0 和 38 之间的刻度参数，用于指定数字小数部分最多可以有多少位。 [UInt8](../data-types/int-uint.md)。
* `default`（可选）— 当解析为 `Decimal128(S)` 类型失败时要返回的默认值。 [Decimal128(S)](../data-types/decimal.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal128OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal128` 的范围，则可能发生溢出：`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`。
多余的小数位会被丢弃（不会四舍五入）。
整数部分中的多余位数将导致错误。
:::

:::warning
在处理 Float32/Float64 输入时，由于操作是使用浮点指令执行的，转换会丢弃额外的位，并可能产生非预期的结果。
例如：`toDecimal128OrDefault(1.15, 2)` 等于 `1.14`，因为在浮点计算中 1.15 * 100 等于 114.99。
可以使用 String 输入，这样操作将使用底层整数类型：`toDecimal128OrDefault('1.15', 2) = 1.15`
:::

**返回值**

* 成功时返回类型为 `Decimal(38, S)` 的值，否则在传入默认值时返回该默认值，未传入时返回 `0`。 [Decimal128(S)](../data-types/decimal.md)。

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

返回结果：

```response
Row 1:
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

将输入值转换为小数位数为 `S` 的 [`Decimal(76, S)`](../data-types/decimal.md) 类型的值。若发生错误，则抛出异常。

**语法**

```sql
toDecimal256(expr, S)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[Expression](/sql-reference/syntax#expressions)。
* `S` — 取值范围为 0 到 76 的 scale 参数，用于指定数字小数部分最多可以有多少位数字。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的值或其字符串表示。
* 类型为 Float32/64 的值或其字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf`（不区分大小写）的值或字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal256('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal256` 的边界，则可能发生溢出：`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。
小数部分中多余的数字会被丢弃（不会四舍五入）。
整数部分中多余的数字将导致抛出异常。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃多余的位数，并且由于操作是使用浮点指令执行的，可能会以非预期的方式工作。
例如：`toDecimal256(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 的结果为 114.99。
可以使用 String 作为输入，使操作基于底层整数类型执行：`toDecimal256('1.15', 2) = 1.15`
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
Row 1:
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

与 [`toDecimal256`](#todecimal256) 类似，该函数将输入值转换为 [Decimal(76, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal256OrZero(expr, S)
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 76 之间的 scale 参数，用于指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal256OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal256` 的取值范围，则可能发生溢出：`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。
小数部分中多余的数字会被直接丢弃（不会四舍五入）。
整数部分中多余的数字会导致错误。
:::

**返回值**

* 成功时返回类型为 `Decimal(76, S)` 的值，否则返回保留 `S` 位小数的 `0`。[Decimal256(S)](../data-types/decimal.md)。

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
Row 1:
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

与 [`toDecimal256`](#todecimal256) 类似，此函数将输入值转换为类型为 [Nullable(Decimal(76, S))](../data-types/decimal.md) 的值，但在出现错误时返回 `0`。

**语法**

```sql
toDecimal256OrNull(expr, S)
```

**参数**

* `expr` — 数字的字符串表示形式。[String](../data-types/string.md)。
* `S` — 介于 0 和 76 之间的 scale 参数，用于指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
* 类型为 Float32/64 的字符串表示。

不支持的参数：

* Float32/64 值 `NaN` 和 `Inf` 的字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal256OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal256` 的范围，则可能会发生溢出：`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。
小数部分中多余的数字会被截断（不会进行四舍五入）。
整数部分中多余的数字会导致错误。
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

* `expr` — 数字的 String 表示形式。[String](../data-types/string.md)。
* `S` — 取值在 0 到 76 之间的 scale 参数，用于指定数字小数部分最多可以有多少位。[UInt8](../data-types/int-uint.md)。
* `default`（可选）— 当解析为 `Decimal256(S)` 类型失败时要返回的默认值。[Decimal256(S)](../data-types/decimal.md)。

支持的参数：

* 类型为 (U)Int8/16/32/64/128/256 的字符串表示形式。
* 类型为 Float32/64 的字符串表示形式。

不支持的参数：

* 值为 `NaN` 和 `Inf` 的 Float32/64 的字符串表示形式。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toDecimal256OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal256` 的范围 `( -1 * 10^(76 - S), 1 * 10^(76 - S) )`，可能会发生溢出。
小数部分中多余的数字会被截断（不会四舍五入）。
整数部分中多余的数字会导致错误。
:::

:::warning
当使用 Float32/Float64 作为输入时，转换会丢弃多余的数字，并且由于操作是通过浮点指令完成的，可能会产生非预期的结果。
例如：`toDecimal256OrDefault(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 的结果是 114.99。
可以使用 String 作为输入，这样运算会使用底层整数类型：`toDecimal256OrDefault('1.15', 2) = 1.15`
:::

**返回值**

* 成功时返回 `Decimal(76, S)` 类型的值，否则返回传入的默认值，如果未提供默认值则返回 `0`。[Decimal256(S)](../data-types/decimal.md)。

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
Row 1:
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
对于 DateTime 参数，该函数可以接受第二个 String 参数，用于指定时区名称。

**语法**

```sql
toString(value[, timezone])
```

**参数**

* `value`: 要转换为字符串的值。[`Any`](/sql-reference/data-types)。
* `timezone`: 可选。用于 `DateTime` 转换的时区名称。[`String`](/sql-reference/data-types/string)。

**返回值**

* 返回输入值的字符串形式。[`String`](/sql-reference/data-types/string)。

**示例**

**使用示例**

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

将 [String](../data-types/string.md) 类型的参数转换为 [FixedString(N)](../data-types/fixedstring.md) 类型（长度固定为 N 的字符串）。
如果字符串的字节数少于 N，则在右侧用空字节进行填充。如果字符串的字节数多于 N，则会抛出异常。

**语法**

```sql
toFixedString(s, N)
```

**参数**

* `s` — 要转换为定长字符串的字符串。[String](../data-types/string.md)。
* `N` — 目标长度 N。[UInt8](../data-types/int-uint.md)。

**返回值**

* 由 `s` 转换得到的、长度为 N 的定长字符串。[FixedString](../data-types/fixedstring.md)。

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

接受一个 String 或 FixedString 类型的参数。返回在遇到第一个零字节（\0）时将内容截断后的 String。

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

将数值转换为 String，输出中的小数位数由用户指定。

**语法**

```sql
toDecimalString(number, scale)
```

**参数**

* `number` — 要转换为 String 的值，[Int, UInt](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Decimal](../data-types/decimal.md)，
* `scale` — 小数位数，[UInt8](../data-types/int-uint.md)。
  * 对于 [Decimal](../data-types/decimal.md) 和 [Int, UInt](../data-types/int-uint.md) 类型，最大 scale 为 77（这是 Decimal 可能的最大有效数字位数），
  * 对于 [Float](../data-types/float.md)，最大 scale 为 60。

**返回值**

* 输入值以给定小数位数（scale）表示为 [String](../data-types/string.md)。
  当请求的 scale 小于原始数值的小数位数时，数字会根据常规算术规则进行四舍五入。

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

通过将输入值视为 `UInt8` 类型的值来进行字节级重新解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将是无意义的。

**语法**

```sql
reinterpretAsUInt8(x)
```

**参数**

* `x`：要按字节重新解释为 UInt8 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释为 UInt8 类型。[UInt8](/sql-reference/data-types/int-uint)。

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

通过将输入值视为 `UInt16` 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsUInt16(x)
```

**参数**

* `x`：要按字节重新解释为 UInt16 的值。类型可以是 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释为 UInt16。[UInt16](/sql-reference/data-types/int-uint)。

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

通过将输入值视为 `UInt32` 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出结果将毫无意义。

**语法**

```sql
reinterpretAsUInt32(x)
```

**参数**

* `x`：其字节将被重新解释为 UInt32 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 的字节重新解释为 UInt32 类型的结果。[UInt32](/sql-reference/data-types/int-uint)。

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

通过将输入值视为 `UInt64` 类型的值来重新解释其字节。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsUInt64(x)
```

**参数**

* `x`: 需要按字节重解释为 UInt64 的值。可以是 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重解释为 UInt64 类型。[UInt64](/sql-reference/data-types/int-uint)。

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

通过将输入值的字节按 `UInt128` 类型进行重新解释来转换。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始数值语义——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsUInt128(x)
```

**参数**

* `x`：要按字节重新解释为 UInt128 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释为 UInt128 类型。[UInt128](/sql-reference/data-types/int-uint)。

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

通过将输入值视为 `UInt256` 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsUInt256(x)
```

**参数**

* `x`：要按字节重新解释为 UInt256 的值。可以是 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释后的 UInt256 值。[UInt256](/sql-reference/data-types/int-uint)。

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

通过将输入值视为 Int8 类型的值来对字节进行重新解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，输出将毫无意义。

**语法**

```sql
reinterpretAsInt8(x)
```

**参数**

* `x`：要按字节重新解释为 Int8 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释后的 Int8 值。[Int8](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值视为 Int16 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsInt16(x)
```

**参数**

* `x`：要按字节重新解释为 Int16 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 重新解释为 Int16 后得到的结果。[Int16](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值视为 Int32 类型的值来按字节重新解释。与 [`CAST`](#cast) 不同，函数不会尝试保留原始数值——如果目标类型无法表示该输入值，输出将没有意义。

**语法**

```sql
reinterpretAsInt32(x)
```

**参数**

* `x`：要按字节重新解释为 Int32 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释为 Int32。[Int32](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值的字节按 `Int64` 类型重新解释来执行转换。与 [`CAST`](#cast) 不同，该函数**不会**尝试保留原始值——如果目标类型无法表示该输入值，则输出将是无意义的。

**语法**

```sql
reinterpretAsInt64(x)
```

**参数**

* `x`：要按字节重新解释为 Int64 的值。类型可以是 [(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释为 Int64 后得到的结果。[Int64](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值按字节重解释为 Int128 类型的值来执行转换。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入类型，则输出结果将没有意义。

**语法**

```sql
reinterpretAsInt128(x)
```

**参数**

* `x`: 按字节重新解释为 Int128 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 按字节重新解释后的 Int128 值。[Int128](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值按 `Int256` 类型进行解释来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，输出将是无意义的。

**语法**

```sql
reinterpretAsInt256(x)
```

**参数**

* `x`：要按字节重解释为 Int256 的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 的字节按 Int256 进行重解释后的结果。[Int256](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值视为 Float32 类型的值来进行字节重解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsFloat32(x)
```

**参数**

* `x`：要重新解释为 Float32 类型的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将 `x` 的值重新解释为 Float32 类型。[Float32](../data-types/float.md)。

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

通过将输入值视为 Float64 类型，对其字节内容进行重新解释。与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出将毫无意义。

**语法**

```sql
reinterpretAsFloat64(x)
```

**参数**

* `x`：要重新解释为 Float64 类型的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 将值 `x` 重新解释为 Float64 类型后的结果。[Float64](../data-types/float.md)。

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

接受一个字符串、定长字符串或数值，并将其字节按主机字节序（小端序）解释为一个数字。该数字被视为自 Unix 纪元开始以来经过的天数，并返回相应的日期。

**语法**

```sql
reinterpretAsDate(x)
```

**参数**

* `x`：自 Unix 纪元开始经过的天数。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* Date。[Date](../data-types/date.md)。

**实现细节**

:::note
如果提供的字符串长度不够，函数的行为如同该字符串已用所需数量的空字节（null byte）进行填充。如果字符串长于所需长度，则多余的字节会被忽略。
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

这些函数接受一个字符串，并将该字符串开头的字节按主机字节序（小端序）解释为一个数字。返回一个日期时间值，其中时间被解释为自 Unix 纪元（Unix Epoch）开始以来经过的秒数。

**语法**

```sql
reinterpretAsDateTime(x)
```

**参数**

* `x`: 自 Unix 纪元开始计算的秒数。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)、[UUID](../data-types/uuid.md)、[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

* 日期和时间。[DateTime](../data-types/datetime.md)。

**实现细节**

:::note
如果提供的字符串不够长，函数的行为等同于在字符串末尾填充所需数量的空字节。如果字符串长于所需长度，则会忽略多余的字节。
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

此函数接受一个数字、日期或日期时间值，并返回一个字符串，该字符串包含按主机字节序（小端序）表示相应值的字节。末尾的空字节会被丢弃。比如，类型为 UInt32、数值为 255 的值会对应一个仅 1 字节长的字符串。

**语法**

```sql
reinterpretAsString(x)
```

**参数**

* `x`：要重新解释为字符串的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**返回值**

* 一个字符串，其中的字节为 `x` 的逐字节表示。[String](../data-types/fixedstring.md)。

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

此函数接受一个数值、日期或日期时间值，并返回一个 `FixedString`，其内容为按主机字节序（小端序）表示对应值的字节序列。末尾的空字节会被去除。例如，类型为 `UInt32` 且值为 255 的数据将被表示为长度为 1 字节的 `FixedString`。

**语法**

```sql
reinterpretAsFixedString(x)
```

**参数**

* `x`：要重新解释成字符串的值。[(U)Int*](../data-types/int-uint.md)、[Float](../data-types/float.md)、[Date](../data-types/date.md)、[DateTime](../data-types/datetime.md)。

**返回值**

* 包含表示 `x` 的字节序列的定长字符串。[FixedString](../data-types/fixedstring.md)。

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
除了此处列出的 UUID 函数之外，还有专门的[UUID 函数文档](../functions/uuid-functions.md)。
:::

接受一个 16 字节的字符串，将其拆分为两个 8 字节部分，并按小端字节序解释每个部分，从而返回一个 UUID。 如果字符串长度不够，函数的行为就像在字符串末尾填充所需数量的空字节一样。 如果字符串长于 16 字节，则会忽略末尾的多余字节。

**语法**

```sql
reinterpretAsUUID(fixed_string)
```

**参数**

* `fixed_string` — 大端序字节串。[FixedString](/sql-reference/data-types/fixedstring)。

**返回值**

* UUID 类型的值。[UUID](/sql-reference/data-types/uuid)。

**示例**

字符串转 UUID。

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

使用 `x` 值在内存中的同一字节序列，并将其按目标类型重新解释。

**语法**

```sql
reinterpret(x, type)
```

**参数**

* `x` — 任意数据类型。
* `type` — 目标类型。如果是数组，则数组元素类型必须是定长类型。

**返回值**

* 转换后的目标类型的值。

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

将输入值转换为指定的数据类型。与 [reinterpret](#reinterpret) 函数不同，`CAST` 会尝试使用新的数据类型来表示相同的值。如果无法完成转换，则会抛出异常。
支持多种语法变体。

**语法**

```sql
CAST(x, T)
CAST(x AS t)
x::t
```

**参数**

* `x` — 要转换的值。可以是任意类型。
* `T` — 目标数据类型的名称。[String](../data-types/string.md)。
* `t` — 目标数据类型。

**返回值**

* 转换后的值。

:::note
如果输入值不在目标类型的取值范围内，则结果会发生溢出。例如，`CAST(-1, 'UInt8')` 返回 `255`。
:::

**示例**

查询：

```sql
SELECT
    CAST(toInt8(-1), 'UInt8') AS cast_int_to_uint,
    CAST(1.5 AS Decimal(3,2)) AS cast_float_to_decimal,
    '1'::Int32 AS cast_string_to_int;
```

返回值：

```yaml
┌─cast_int_to_uint─┬─cast_float_to_decimal─┬─cast_string_to_int─┐
│              255 │                  1.50 │                  1 │
└──────────────────┴───────────────────────┴────────────────────┘
```

查询语句：

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

转换为 [FixedString (N)](../data-types/fixedstring.md) 仅适用于参数类型为 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md) 的情况。

支持向 [Nullable](../data-types/nullable.md) 类型及从中进行类型转换。

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

将 `x` 转换为 `T` 数据类型。

它与 [cast](#cast) 的区别在于，如果值 `x` 超出了类型 `T` 的取值范围，`accurateCast` 在转换时不允许数值类型溢出。例如，`accurateCast(-1, 'UInt8')` 会抛出异常。

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
Code: 70. DB::Exception: Received from localhost:9000. DB::Exception: Value in column Int8 cannot be safely converted into type UInt8: While processing accurateCast(-1, 'UInt8') AS uint8.
```


## accurateCastOrNull(x, T) {#accuratecastornullx-t}

将输入值 `x` 转换为指定的数据类型 `T`。始终返回 [Nullable](../data-types/nullable.md) 类型，如果转换结果在目标类型中无法表示，则返回 [NULL](/sql-reference/syntax#null)。

**语法**

```sql
accurateCastOrNull(x, T)
```

**参数**

* `x` — 输入值。
* `T` — 返回数据类型的名称。

**返回值**

* 转换为指定数据类型 `T` 的值。

**示例**

查询：

```sql
SELECT toTypeName(accurateCastOrNull(5, 'UInt8'));
```

返回结果：

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

将输入值 `x` 转换为指定的数据类型 `T`。如果转换结果无法在目标类型中表示，则返回该类型的默认值；如果指定了 `default_value`，则返回 `default_value`。

**语法**

```sql
accurateCastOrDefault(x, T)
```

**参数**

* `x` — 输入值。
* `T` — 返回数据类型的名称。
* `default_value` — 返回数据类型的默认值。

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

根据数值和时间间隔单位（例如 &#39;second&#39; 或 &#39;day&#39;）创建一个 [Interval](../../sql-reference/data-types/special-data-types/interval.md) 数据类型的值。

**语法**

```sql
toInterval(value, unit)
```

**参数**

* `value` — 时间间隔的长度。可以是整数或其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

* `unit` — 要创建的时间间隔类型。[String Literal](/sql-reference/syntax#string)。
  可能的取值：

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

* 生成的时间间隔。[Interval](../../sql-reference/data-types/special-data-types/interval.md)

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

* `n` — 年数。可以是整数或其字符串表示，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 时长为 `n` 年的时间间隔。[IntervalYear](../data-types/special-data-types/interval.md)。

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

返回一个表示 `n` 个季度的 [IntervalQuarter](../data-types/special-data-types/interval.md) 类型时间间隔。

**语法**

```sql
toIntervalQuarter(n)
```

**参数**

* `n` — 季度数。可以是整数或其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 表示 `n` 个季度的时间间隔。[IntervalQuarter](../data-types/special-data-types/interval.md)。

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

返回一个长度为 `n` 个月、数据类型为 [IntervalMonth](../data-types/special-data-types/interval.md) 的时间区间。

**语法**

```sql
toIntervalMonth(n)
```

**参数**

* `n` — 月数。可以是整数或其字符串表示形式，也可以是浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 持续 `n` 个月的时间间隔。[IntervalMonth](../data-types/special-data-types/interval.md)。

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

返回一个 `n` 周的 [IntervalWeek](../data-types/special-data-types/interval.md) 类型时间间隔。

**语法**

```sql
toIntervalWeek(n)
```

**参数**

* `n` — 周数。可以是整数、其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 表示 `n` 周的时间间隔。[IntervalWeek](../data-types/special-data-types/interval.md)。

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

返回一个包含 `n` 天的、数据类型为 [IntervalDay](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalDay(n)
```

**参数**

* `n` — 天数。可以是整数或其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* `n` 天的时间间隔。[IntervalDay](../data-types/special-data-types/interval.md)。

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

返回一个值，表示 `n` 小时的时间间隔，数据类型为 [IntervalHour](../data-types/special-data-types/interval.md)。

**语法**

```sql
toIntervalHour(n)
```

**参数**

* `n` — 小时数。整数、其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 持续时间为 `n` 小时的时间间隔。[IntervalHour](../data-types/special-data-types/interval.md)。

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

返回一个数据类型为 [IntervalMinute](../data-types/special-data-types/interval.md) 的 `n` 分钟时间间隔。

**语法**

```sql
toIntervalMinute(n)
```

**参数**

* `n` — 分钟数。可以是整数、其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* `n` 分钟的时间间隔。[IntervalMinute](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalMinute(12) AS interval_to_minutes
SELECT date + interval_to_minutes AS result
```

返回结果：

```response
┌──────────────result─┐
│ 2024-06-15 00:12:00 │
└─────────────────────┘
```


## toIntervalSecond {#tointervalsecond}

返回一个时长为 `n` 秒、数据类型为 [IntervalSecond](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalSecond(n)
```

**参数**

* `n` — 秒数。可以是整数或其字符串表示形式，也可以是浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 长度为 `n` 秒的时间间隔。[IntervalSecond](../data-types/special-data-types/interval.md)。

**示例**

查询：

```sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalSecond(30) AS interval_to_seconds
SELECT date + interval_to_seconds AS result
```

返回结果：

```response
┌──────────────result─┐
│ 2024-06-15 00:00:30 │
└─────────────────────┘
```


## toIntervalMillisecond {#tointervalmillisecond}

返回一个长度为 `n` 毫秒、数据类型为 [IntervalMillisecond](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalMillisecond(n)
```

**参数**

* `n` — 毫秒数。可以是整数或其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 长度为 `n` 毫秒的时间间隔。[IntervalMilliseconds](../data-types/special-data-types/interval.md)。

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

返回一个长度为 `n` 微秒、数据类型为 [IntervalMicrosecond](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalMicrosecond(n)
```

**参数**

* `n` — 微秒数。可以是整数或其字符串表示形式，也可以是浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* 以 `n` 微秒为长度的时间区间。[IntervalMicrosecond](../data-types/special-data-types/interval.md)。

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

返回一个表示 `n` 个纳秒的时间间隔，数据类型为 [IntervalNanosecond](../data-types/special-data-types/interval.md)。

**语法**

```sql
toIntervalNanosecond(n)
```

**参数**

* `n` — 纳秒数。可以是整数或其字符串表示形式，或浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

* `n` 个纳秒的时间间隔。[IntervalNanosecond](../data-types/special-data-types/interval.md)。

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

根据 [MySQL 格式字符串](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)将 [String](../data-types/string.md) 转换为 [DateTime](../data-types/datetime.md)。

此函数与函数 [formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime) 执行相反的操作。

**语法**

```sql
parseDateTime(str[, format[, timezone]])
```

**参数**

* `str` — 要解析的字符串
* `format` — 格式字符串。可选。如果未指定，则为 `%Y-%m-%d %H:%i:%s`。
* `timezone` — [Timezone](operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

返回一个根据 MySQL 风格的格式字符串，从输入字符串中解析得到的 [DateTime](../data-types/datetime.md) 值。

**支持的格式说明符**

除以下格式说明符外，支持 [formatDateTime](/sql-reference/functions/date-time-functions#formatDateTime) 中列出的所有格式说明符：

* %Q: 季度 (1-4)

**示例**

```sql
SELECT parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')

┌─parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2021-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```

别名：`TO_TIMESTAMP`。


## parseDateTimeOrZero {#parsedatetimeorzero}

与 [parseDateTime](#parsedatetime) 相同，只是当遇到无法处理的日期格式时会返回零日期值。

## parseDateTimeOrNull {#parsedatetimeornull}

与 [parseDateTime](#parsedatetime) 相同，只是在遇到无法处理的日期格式时返回 `NULL`。

别名：`str_to_date`。

## parseDateTimeInJodaSyntax {#parsedatetimeinjodasyntax}

与 [parseDateTime](#parsedatetime) 类似，只是其格式字符串采用的是 [Joda](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) 语法，而不是 MySQL 语法。

此函数是函数 [formatDateTimeInJodaSyntax](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax) 的逆操作。

**语法**

```sql
parseDateTimeInJodaSyntax(str[, format[, timezone]])
```

**参数**

* `str` — 要解析的字符串。
* `format` — 格式字符串。可选。如果未指定，则为 `yyyy-MM-dd HH:mm:ss`。
* `timezone` — [时区](operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

根据 Joda 风格的格式字符串，从输入字符串中解析得到的 [DateTime](../data-types/datetime.md) 值。

**支持的格式说明符**

支持在 [`formatDateTimeInJodaSyntax`](/sql-reference/functions/date-time-functions#formatDateTimeInJodaSyntax) 中列出的所有格式说明符，但不支持：

* S：秒的小数部分
* z：时区
* Z：时区偏移量/ID

**示例**

```sql
SELECT parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')

┌─parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')─┐
│                                                                     2023-02-24 14:53:31 │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```


## parseDateTimeInJodaSyntaxOrZero {#parsedatetimeinjodasyntaxorzero}

与 [parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) 的行为相同，不同之处在于当遇到无法处理的日期格式时，它会返回零日期值。

## parseDateTimeInJodaSyntaxOrNull {#parsedatetimeinjodasyntaxornull}

与 [parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax) 相同，但在遇到无法处理的日期格式时会返回 `NULL`。

## parseDateTime64 {#parsedatetime64}

按照 [MySQL 格式字符串](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format) 将 [String](../data-types/string.md) 转换为 [DateTime64](../data-types/datetime64.md)。

**语法**

```sql
parseDateTime64(str[, format[, timezone]])
```

**参数**

* `str` — 要解析的字符串。
* `format` — 格式字符串。可选。未指定时为 `%Y-%m-%d %H:%i:%s.%f`。
* `timezone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

返回一个根据 MySQL 风格的格式字符串从输入字符串解析得到的 [DateTime64](../data-types/datetime64.md) 值。
返回值的精度为 6。


## parseDateTime64OrZero {#parsedatetime64orzero}

与 [parseDateTime64](#parsedatetime64) 相同，不同之处在于在遇到无法处理的日期格式时返回零日期值。

## parseDateTime64OrNull {#parsedatetime64ornull}

与 [parseDateTime64](#parsedatetime64) 相同，只是当遇到无法解析的日期格式时会返回 `NULL`。

## parseDateTime64InJodaSyntax {#parsedatetime64injodasyntax}

按照 [Joda 格式字符串](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)，将 [String](../data-types/string.md) 转换为 [DateTime64](../data-types/datetime64.md)。

**语法**

```sql
parseDateTime64InJodaSyntax(str[, format[, timezone]])
```

**参数**

* `str` — 要解析的字符串。
* `format` — 格式字符串。可选。未指定时为 `yyyy-MM-dd HH:mm:ss`。
* `timezone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

返回一个根据 Joda 风格的格式字符串从输入字符串解析得到的 [DateTime64](../data-types/datetime64.md) 值。
返回值的精度等于格式字符串中 `S` 占位符的数量（但最多为 6）。


## parseDateTime64InJodaSyntaxOrZero {#parsedatetime64injodasyntaxorzero}

与 [parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) 相同，只是当遇到无法处理的日期格式时，会返回零日期值。

## parseDateTime64InJodaSyntaxOrNull {#parsedatetime64injodasyntaxornull}

与 [parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax) 相同，唯一不同是当遇到无法处理的日期格式时会返回 `NULL`。

## parseDateTimeBestEffort {#parsedatetimebesteffort}

## parseDateTime32BestEffort {#parsedatetime32besteffort}

将 [String](../data-types/string.md) 表示形式的日期和时间转换为 [DateTime](/sql-reference/data-types/datetime) 数据类型。

该函数可以解析 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse 特有的以及其他一些日期和时间格式。

**语法**

```sql
parseDateTimeBestEffort(time_string [, time_zone])
```

**参数**

* `time_string` — 包含要转换的日期和时间的字符串。[String](../data-types/string.md)。
* `time_zone` — 时区。函数会根据该时区解析 `time_string`。[String](../data-types/string.md)。

**支持的非标准格式**

* 包含 9～10 位 [unix timestamp](https://en.wikipedia.org/wiki/Unix_time) 的字符串。
* 同时包含日期和时间部分的字符串：`YYYYMMDDhhmmss`、`DD/MM/YYYY hh:mm:ss`、`DD-MM-YY hh:mm`、`YYYY-MM-DD hh:mm:ss` 等。
* 只包含日期、不包含时间部分的字符串：`YYYY`、`YYYYMM`、`YYYY*MM`、`DD/MM/YYYY`、`DD-MM-YY` 等。
* 包含“日”和时间的字符串：`DD`、`DD hh`、`DD hh:mm`。在这种情况下，`MM` 会被替换为 `01`。
* 包含日期和时间以及时区偏移信息的字符串：`YYYY-MM-DD hh:mm:ss ±h:mm` 等。例如，`2020-12-12 17:36:00 -5:00`。
* [syslog 时间戳](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)：`Mmm dd hh:mm:ss`。例如，`Jun  9 14:20:32`。

对于所有带分隔符的格式，函数可以解析以完整名称或前三个字母表示的月份名称。例如：`24/DEC/18`、`24-Dec-18`、`01-September-2018`。
如果未指定年份，则视为当前年份。如果得到的 DateTime 落在未来时间（即便只是比当前时刻晚一秒），则会将当前年份替换为上一年。

**返回值**

* 将 `time_string` 转换为 [DateTime](../data-types/datetime.md) 数据类型的结果。

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
* [xkcd 关于 ISO 8601 的漫画](https://xkcd.com/1179/)
* [RFC 3164](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)


## parseDateTimeBestEffortUS {#parsedatetimebesteffortus}

此函数在处理 ISO 日期格式（例如 `YYYY-MM-DD hh:mm:ss`）以及其他可以无歧义提取出月和日组件的日期格式（例如 `YYYYMMDDhhmmss`、`YYYY-MM`、`DD hh` 或 `YYYY-MM-DD hh:mm:ss ±h:mm`）时，其行为与 [parseDateTimeBestEffort](#parsedatetimebesteffort) 相同。如果无法无歧义地提取出月和日组件（例如 `MM/DD/YYYY`、`MM-DD-YYYY` 或 `MM-DD-YY`），则该函数会优先按美国日期格式进行解析，而不是按 `DD/MM/YYYY`、`DD-MM-YYYY` 或 `DD-MM-YY` 解析。但有一个例外：如果月份数值大于 12 且小于等于 31，则该函数会回退到 [parseDateTimeBestEffort](#parsedatetimebesteffort) 的行为，例如 `15/08/2020` 将被解析为 `2020-08-15`。

## parseDateTimeBestEffortOrNull {#parsedatetimebesteffortornull}

## parseDateTime32BestEffortOrNull {#parsedatetime32besteffortornull}

与 [parseDateTimeBestEffort](#parsedatetimebesteffort) 相同，除了在遇到无法处理的日期格式时会返回 `NULL`。

## parseDateTimeBestEffortOrZero {#parsedatetimebesteffortorzero}

## parseDateTime32BestEffortOrZero {#parsedatetime32besteffortorzero}

与 [parseDateTimeBestEffort](#parsedatetimebesteffort) 相同，不同之处在于当遇到无法处理的日期格式时，它会返回零日期或零日期时间。

## parseDateTimeBestEffortUSOrNull {#parsedatetimebesteffortusornull}

与 [parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 函数相同，只是在遇到无法处理的日期格式时返回 `NULL`。

## parseDateTimeBestEffortUSOrZero {#parsedatetimebesteffortusorzero}

与 [parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 函数相同，只是当遇到无法解析的日期格式时，会返回零日期（`1970-01-01`）或带时间的零日期（`1970-01-01 00:00:00`）。

## parseDateTime64BestEffort {#parsedatetime64besteffort}

与 [parseDateTimeBestEffort](#parsedatetimebesteffort) 函数相同，但还会解析毫秒和微秒，并返回 [DateTime](/sql-reference/data-types/datetime) 类型。

**语法**

```sql
parseDateTime64BestEffort(time_string [, precision [, time_zone]])
```

**参数**

* `time_string` — 包含要转换的日期或日期时间的字符串。[String](../data-types/string.md)。
* `precision` — 所需精度。`3` — 毫秒，`6` — 微秒。默认值为 `3`。可选。[UInt8](../data-types/int-uint.md)。
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone)。函数会根据该时区解析 `time_string`。可选。[String](../data-types/string.md)。

**返回值**

* 将 `time_string` 转换为 [DateTime](../data-types/datetime.md) 数据类型的结果。

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

与 [parseDateTime64BestEffort](#parsedatetime64besteffort) 相同，只是在存在歧义时，该函数优先采用美国日期格式（`MM/DD/YYYY` 等）。

## parseDateTime64BestEffortOrNull {#parsedatetime64besteffortornull}

与 [parseDateTime64BestEffort](#parsedatetime64besteffort) 相同，唯一区别在于：当遇到无法处理的日期格式时，它会返回 `NULL`。

## parseDateTime64BestEffortOrZero {#parsedatetime64besteffortorzero}

与 [parseDateTime64BestEffort](#parsedatetime64besteffort) 相同，不同之处在于当遇到无法处理的日期格式时，会返回零日期或零日期时间值。

## parseDateTime64BestEffortUSOrNull {#parsedatetime64besteffortusornull}

与 [parseDateTime64BestEffort](#parsedatetime64besteffort) 的行为相同，只是当存在歧义时，该函数优先采用美国日期格式（如 `MM/DD/YYYY` 等），并在遇到无法处理的日期格式时返回 `NULL`。

## parseDateTime64BestEffortUSOrZero {#parsedatetime64besteffortusorzero}

与 [parseDateTime64BestEffort](#parsedatetime64besteffort) 的行为相同，不同之处在于，当存在歧义时，此函数会优先采用美国日期格式（如 `MM/DD/YYYY` 等），并在遇到无法处理的日期格式时返回全零日期或全零日期时间值。

## toLowCardinality {#tolowcardinality}

将输入参数转换为相同数据类型的 [LowCardinality](../data-types/lowcardinality.md) 版本。

要将 `LowCardinality` 数据类型的数据转换为其他数据类型，请使用 [CAST](#cast) 函数。例如，`CAST(x as String)`。

**语法**

```sql
toLowCardinality(expr)
```

**参数**

* `expr` — 其计算结果为[支持的数据类型](/sql-reference/data-types)之一的[表达式](/sql-reference/syntax#expressions)。

**返回值**

* `expr` 的结果，其类型为 `expr` 类型对应的 [LowCardinality](../data-types/lowcardinality.md)。

**示例**

查询：

```sql
SELECT toLowCardinality('1');
```

返回结果：

```response
┌─toLowCardinality('1')─┐
│ 1                     │
└───────────────────────┘
```


## toUnixTimestamp {#toUnixTimestamp}

将 `String`、`Date` 或 `DateTime` 转换为 Unix 时间戳（自 `1970-01-01 00:00:00 UTC` 起的秒数），返回 `UInt32` 类型。

**语法**

```sql
toUnixTimestamp(date, [timezone])
```

**参数**

* `date`: 待转换的值。[`Date`](/sql-reference/data-types/date) 或 [`Date32`](/sql-reference/data-types/date32) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64) 或 [`String`](/sql-reference/data-types/string)。
* `timezone`: 可选。用于转换的时区。如果未指定，则使用服务器的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回 Unix 时间戳。[`UInt32`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

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

将 `DateTime64` 转换为具有固定秒级精度的 `Int64` 值。输入值会根据其小数精度被相应地放大或缩小。

:::note
输出值是 UTC 时间戳，而不是 `DateTime64` 所在时区的时间戳。
:::

**语法**

```sql
toUnixTimestamp64Second(value)
```

**参数**

* `value` — 具有任意精度的 DateTime64 值。[DateTime64](../data-types/datetime64.md)。

**返回值**

* `value` 转换为 `Int64` 数据类型后的结果。[Int64](../data-types/int-uint.md)。

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

将 `DateTime64` 转换为具有固定毫秒精度的 `Int64` 值。输入值会根据其自身精度被相应放大或缩小。

:::note
输出值是 UTC 时间戳，而不是按 `DateTime64` 所在时区计算的时间戳。
:::

**语法**

```sql
toUnixTimestamp64Milli(value)
```

**参数**

* `value` — 具有任意精度的 DateTime64 值。[DateTime64](../data-types/datetime64.md)。

**返回值**

* 将 `value` 转换为 `Int64` 数据类型后的结果。[Int64](../data-types/int-uint.md)。

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

将 `DateTime64` 转换为具有固定微秒级精度的 `Int64` 值。输入值会根据其自身精度被适当地放大或缩小。

:::note
输出值是 UTC 时间戳，而不是根据 `DateTime64` 时区计算的时间戳。
:::

**语法**

```sql
toUnixTimestamp64Micro(value)
```

**参数**

* `value` — 任意精度的 DateTime64 值。[DateTime64](../data-types/datetime64.md)。

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

将 `DateTime64` 转换为具有固定纳秒精度的 `Int64` 值。输入值会根据其自身精度相应放大或缩小。

:::note
输出值是 UTC 时间戳，而不是采用 `DateTime64` 时区的时间戳。
:::

**语法**

```sql
toUnixTimestamp64Nano(value)
```

**参数**

* `value` — 任意精度的 DateTime64 值。[DateTime64](../data-types/datetime64.md)。

**返回值**

* 将 `value` 转换为 `Int64` 数据类型后的值。[Int64](../data-types/int-uint.md)。

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

将一个 `Int64` 转换为具有固定秒级精度并带有可选时区的 `DateTime64` 值。输入值会根据其原始精度按比例放大或缩小。

:::note
请注意，输入值被视为 UTC 时间戳，而不是给定（或隐式）时区下的时间戳。
:::

**语法**

```sql
fromUnixTimestamp64Second(value[, timezone])
```

**参数**

* `value` — 任意精度的数值。[Int64](../data-types/int-uint.md)。
* `timezone` — （可选）结果的时区名称。[String](../data-types/string.md)。

**返回值**

* 将 `value` 转换为精度为 `0` 的 DateTime64 值。[DateTime64](../data-types/datetime64.md)。

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

将 `Int64` 转换为具有固定毫秒精度、可选时区的 `DateTime64` 值。输入值会根据其自身的精度被相应地放大或缩小。

:::note
请注意，输入值被视为一个 UTC 时间戳，而不是给定（或隐式）时区中的时间戳。
:::

**语法**

```sql
fromUnixTimestamp64Milli(value[, timezone])
```

**参数**

* `value` — 任何精度的值。[Int64](../data-types/int-uint.md)。
* `timezone` — （可选）结果的时区名称。[String](../data-types/string.md)。

**返回值**

* 将 `value` 转换为精度为 `3` 的 DateTime64 类型的值。[DateTime64](../data-types/datetime64.md)。

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

将 `Int64` 转换为具有固定微秒精度并带有可选时区的 `DateTime64` 值。输入值会根据其实际精度被相应放大或缩小。

:::note
请注意，输入值被视为 UTC 时间戳，而不是给定（或隐含）时区下的时间戳。
:::

**语法**

```sql
fromUnixTimestamp64Micro(value[, timezone])
```

**参数**

* `value` — 具有任意精度的整数值。[Int64](../data-types/int-uint.md)。
* `timezone` — （可选）结果的时区名称。[String](../data-types/string.md)。

**返回值**

* 将 `value` 转换为精度为 `6` 的 DateTime64 类型的值。[DateTime64](../data-types/datetime64.md)。

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

将 `Int64` 转换为具有固定纳秒精度、可选时区的 `DateTime64` 值。输入值会根据其时间精度被相应地放大或缩小。

:::note
请注意，输入值会被视为 UTC 时间戳，而不是给定（或隐式）时区下的时间戳。
:::

**语法**

```sql
fromUnixTimestamp64Nano(value[, timezone])
```

**参数**

* `value` — 任意精度的值，[Int64](../data-types/int-uint.md)。
* `timezone` — （可选）结果的时区名称。[String](../data-types/string.md)。

**返回值**

* 将 `value` 转换为精度为 `9` 的 DateTime64 类型。[DateTime64](../data-types/datetime64.md)。

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

根据指定的格式将任意表达式转换为字符串。

**语法**

```sql
formatRow(format, x, y, ...)
```

**参数**

* `format` — 文本格式。例如，[CSV](/interfaces/formats/CSV)、[TabSeparated (TSV)](/interfaces/formats/TabSeparated)。
* `x`、`y`、... — 表达式。

**返回值**

* 格式化后的字符串（对于文本格式通常以换行符结尾）。

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

**注意**：如果 `format` 包含前缀或后缀，它们将会被写入每一行。

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

注意：此函数仅支持行格式。


## formatRowNoNewline {#formatrownonewline}

按照指定格式将任意表达式转换为字符串。与 `formatRow` 的不同之处在于，如果结果末尾存在 `\n`，该函数会将其移除。

**语法**

```sql
formatRowNoNewline(format, x, y, ...)
```

**参数**

* `format` — 文本格式。例如，[CSV](/interfaces/formats/CSV)、[TabSeparated (TSV)](/interfaces/formats/TabSeparated)。
* `x`、`y`，… — 表达式。

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
  下方标签内的内容会在文档框架构建期间
  被替换为由 system.functions 生成的文档。请不要修改或移除这些标签。
  参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }


## CAST {#CAST}

引入版本：v1.1

将一个值转换为指定的数据类型。
与 `reinterpret` 函数不同，CAST 会尝试在目标类型中产生相同的值。
如果无法做到，则会抛出异常。

**语法**

```sql
CAST(x, T)
or CAST(x AS T)
or x::T
```

**参数**

* `x` — 任意类型的值。[`Any`](/sql-reference/data-types)
* `T` — 目标数据类型。[`String`](/sql-reference/data-types/string)

**返回值**

返回转换为目标数据类型后的值。[`Any`](/sql-reference/data-types)

**示例**

**基本用法**

```sql title=Query
SELECT CAST(42, 'String')
```

```response title=Response
┌─CAST(42, 'String')─┐
│ 42                 │
└────────────────────┘
```

**使用 AS 语法**

```sql title=Query
SELECT CAST('2025-01-01' AS Date)
```

```response title=Response
┌─CAST('2025-01-01', 'Date')─┐
│                 2025-01-01 │
└────────────────────────────┘
```

**使用 :: 语法**

```sql title=Query
SELECT '123'::UInt32
```

```response title=Response
┌─CAST('123', 'UInt32')─┐
│                   123 │
└───────────────────────┘
```


## accurateCast {#accurateCast}

引入版本：v1.1

将一个值转换为指定的数据类型。与 [`CAST`](#CAST) 不同，`accurateCast` 会执行更严格的类型检查，如果转换会导致数据精度丢失或无法进行转换，则抛出异常。

该函数比常规的 `CAST` 更安全，因为它可以防止精度丢失和无效转换。

**语法**

```sql
accurateCast(x, T)
```

**参数**

* `x` — 要转换的值。[`Any`](/sql-reference/data-types)
* `T` — 目标数据类型的名称。[`String`](/sql-reference/data-types/string)

**返回值**

返回转换为目标数据类型后的值。[`Any`](/sql-reference/data-types)

**示例**

**转换成功示例**

```sql title=Query
SELECT accurateCast(42, 'UInt16')
```

```response title=Response
┌─accurateCast(42, 'UInt16')─┐
│                        42 │
└───────────────────────────┘
```

**字符串转数字**

```sql title=Query
SELECT accurateCast('123.45', 'Float64')
```

```response title=Response
┌─accurateCast('123.45', 'Float64')─┐
│                            123.45 │
└───────────────────────────────────┘
```


## accurateCastOrDefault {#accurateCastOrDefault}

引入版本：v21.1

将值转换为指定的数据类型。
与 [`accurateCast`](#accurateCast) 类似，但在无法精确完成转换时，会返回一个默认值而不是抛出异常。

如果将默认值作为第二个参数提供，则它必须是目标类型的值。
如果未提供默认值，则使用目标类型的默认值。

**语法**

```sql
accurateCastOrDefault(x, T[, default_value])
```

**参数**

* `x` — 要进行转换的值。[`Any`](/sql-reference/data-types)
* `T` — 目标数据类型的名称。[`const String`](/sql-reference/data-types/string)
* `default_value` — 可选。转换失败时返回的默认值。[`Any`](/sql-reference/data-types)

**返回值**

返回转换为目标数据类型的值；如果无法转换，则返回默认值。[`Any`](/sql-reference/data-types)

**示例**

**转换成功**

```sql title=Query
SELECT accurateCastOrDefault(42, 'String')
```

```response title=Response
┌─accurateCastOrDefault(42, 'String')─┐
│ 42                                  │
└─────────────────────────────────────┘
```

**转换失败并使用显式默认值**

```sql title=Query
SELECT accurateCastOrDefault('abc', 'UInt32', 999::UInt32)
```

```response title=Response
┌─accurateCastOrDefault('abc', 'UInt32', 999)─┐
│                                         999 │
└─────────────────────────────────────────────┘
```

**带隐式默认值的转换失败**

```sql title=Query
SELECT accurateCastOrDefault('abc', 'UInt32')
```

```response title=Response
┌─accurateCastOrDefault('abc', 'UInt32')─┐
│                                      0 │
└────────────────────────────────────────┘
```


## accurateCastOrNull {#accurateCastOrNull}

自 v1.1 引入

将一个值转换为指定的数据类型。
与 [`accurateCast`](#accurateCast) 类似，但如果无法精确完成转换，则返回 `NULL` 而不是抛出异常。

此函数将 [`accurateCast`](#accurateCast) 的安全性与优雅的错误处理相结合。

**语法**

```sql
accurateCastOrNull(x, T)
```

**参数**

* `x` — 要转换的值。[`Any`](/sql-reference/data-types)
* `T` — 目标数据类型名称。[`String`](/sql-reference/data-types/string)

**返回值**

返回转换为目标数据类型的值，如果无法转换则返回 `NULL`。[`Any`](/sql-reference/data-types)

**示例**

**转换成功**

```sql title=Query
SELECT accurateCastOrNull(42, 'String')
```

```response title=Response
┌─accurateCastOrNull(42, 'String')─┐
│ 42                               │
└──────────────────────────────────┘
```

**转换失败时返回 NULL**

```sql title=Query
SELECT accurateCastOrNull('abc', 'UInt32')
```

```response title=Response
┌─accurateCastOrNull('abc', 'UInt32')─┐
│                                ᴺᵁᴸᴸ │
└─────────────────────────────────────┘
```


## formatRow {#formatRow}

引入版本：v20.7

通过指定的格式将任意表达式转换为字符串。

:::note
如果格式中包含前缀或后缀，它会写入到每一行中。
此函数仅支持基于行的输出格式。
:::

**语法**

```sql
formatRow(format, x, y, ...)
```

**参数**

* `format` — 文本格式。例如 CSV、TSV。[`String`](/sql-reference/data-types/string)
* `x, y, ...` — 表达式。[`Any`](/sql-reference/data-types)

**返回值**

格式化后的字符串（对于文本格式，通常以换行符结尾）。[`String`](/sql-reference/data-types/string)

**示例**

**基本用法**

```sql title=Query
SELECT formatRow('CSV', number, 'good')
FROM numbers(3)
```

```response title=Response
┌─formatRow('CSV', number, 'good')─┐
│ 0,"good"
                         │
│ 1,"good"
                         │
│ 2,"good"
                         │
└──────────────────────────────────┘
```

**使用自定义格式**

```sql title=Query
SELECT formatRow('CustomSeparated', number, 'good')
FROM numbers(3)
SETTINGS format_custom_result_before_delimiter='<prefix>\n', format_custom_result_after_delimiter='<suffix>'
```

```response title=Response
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


## formatRowNoNewline {#formatRowNoNewline}

引入版本：v20.7

与 [`formatRow`](#formatRow) 相同，但会去除每一行末尾的换行符。

按给定格式将任意表达式转换为字符串，并从结果中移除所有末尾的换行符。

**语法**

```sql
formatRowNoNewline(format, x, y, ...)
```

**参数**

* `format` — 文本格式。例如 CSV、TSV。[`String`](/sql-reference/data-types/string)
* `x, y, ...` — 表达式。[`Any`](/sql-reference/data-types)

**返回值**

返回去除换行符的格式化字符串。[`String`](/sql-reference/data-types/string)

**示例**

**基础用法**

```sql title=Query
SELECT formatRowNoNewline('CSV', number, 'good')
FROM numbers(3)
```

```response title=Response
┌─formatRowNoNewline('CSV', number, 'good')─┐
│ 0,"good"                                  │
│ 1,"good"                                  │
│ 2,"good"                                  │
└───────────────────────────────────────────┘
```


## fromUnixTimestamp64Micro {#fromUnixTimestamp64Micro}

引入于：v20.5

将以微秒为单位的 Unix 时间戳转换为具有微秒精度的 `DateTime64` 值。

输入值被视为具有微秒精度的 Unix 时间戳（自 1970-01-01 00:00:00 UTC 起的微秒数）。

**语法**

```sql
fromUnixTimestamp64Micro(value[, timezone])
```

**参数**

* `value` — 以微秒为单位的 Unix 时间戳。[`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — 可选。返回值所使用的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回一个具有微秒级精度的 `DateTime64` 值。[`DateTime64(6)`](/sql-reference/data-types/datetime64)

**示例**

**用法示例**

```sql title=Query
SELECT fromUnixTimestamp64Micro(1640995200123456)
```

```response title=Response
┌─fromUnixTimestamp64Micro(1640995200123456)─┐
│                 2022-01-01 00:00:00.123456 │
└────────────────────────────────────────────┘
```


## fromUnixTimestamp64Milli {#fromUnixTimestamp64Milli}

自 v20.5 引入

将以毫秒为单位的 Unix 时间戳转换为具有毫秒级精度的 `DateTime64` 值。

输入值被视为一个具有毫秒级精度的 Unix 时间戳（自 1970-01-01 00:00:00 UTC 起的毫秒数）。

**语法**

```sql
fromUnixTimestamp64Milli(value[, timezone])
```

**参数**

* `value` — 以毫秒为单位的 Unix 时间戳。[`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — 可选。返回值所使用的时区。[`String`](/sql-reference/data-types/string)

**返回值**

具有毫秒精度的 `DateTime64` 值。[`DateTime64(3)`](/sql-reference/data-types/datetime64)

**示例**

**用法示例**

```sql title=Query
SELECT fromUnixTimestamp64Milli(1640995200123)
```

```response title=Response
┌─fromUnixTimestamp64Milli(1640995200123)─┐
│                 2022-01-01 00:00:00.123 │
└─────────────────────────────────────────┘
```


## fromUnixTimestamp64Nano {#fromUnixTimestamp64Nano}

自 v20.5 版本引入

将以纳秒为单位的 Unix 时间戳转换为具有纳秒精度的 [`DateTime64`](/sql-reference/data-types/datetime64) 值。

输入值被视为具有纳秒精度的 Unix 时间戳（自 1970-01-01 00:00:00 UTC 起的纳秒数）。

:::note
请注意，输入值被视为 UTC 时间戳，而不是使用输入值所指定时区的时间戳。
:::

**语法**

```sql
fromUnixTimestamp64Nano(value[, timezone])
```

**参数**

* `value` — 以纳秒为单位的 Unix 时间戳。[`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — 可选。返回值的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回一个具有纳秒精度的 `DateTime64` 值。[`DateTime64(9)`](/sql-reference/data-types/datetime64)

**示例**

**用法示例**

```sql title=Query
SELECT fromUnixTimestamp64Nano(1640995200123456789)
```

```response title=Response
┌─fromUnixTimestamp64Nano(1640995200123456789)─┐
│                2022-01-01 00:00:00.123456789 │
└──────────────────────────────────────────────┘
```


## fromUnixTimestamp64Second {#fromUnixTimestamp64Second}

引入于：v24.12

将以秒为单位的 Unix 时间戳转换为具有秒级精度的 `DateTime64` 值。

输入值被视为具有秒级精度的 Unix 时间戳（自 1970-01-01 00:00:00 UTC 起的秒数）。

**语法**

```sql
fromUnixTimestamp64Second(value[, timezone])
```

**参数**

* `value` — 以秒为单位的 Unix 时间戳。[`Int64`](/sql-reference/data-types/int-uint)
* `timezone` — 可选。用于返回值的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回一个秒级精度的 `DateTime64` 值。[`DateTime64(0)`](/sql-reference/data-types/datetime64)

**示例**

**使用示例**

```sql title=Query
SELECT fromUnixTimestamp64Second(1640995200)
```

```response title=Response
┌─fromUnixTimestamp64Second(1640995200)─┐
│                   2022-01-01 00:00:00 │
└───────────────────────────────────────┘
```


## parseDateTime {#parseDateTime}

引入于：v23.3

根据 MySQL 日期格式字符串解析日期和时间字符串。

此函数是 [`formatDateTime`](/sql-reference/functions/date-time-functions) 的逆函数。
它使用格式字符串解析一个字符串参数，返回一个 DateTime 类型的值。

**语法**

```sql
parseDateTime(time_string, format[, timezone])
```

**别名**: `TO_UNIXTIME`

**参数**

* `time_string` — 要解析为 DateTime 的字符串。[`String`](/sql-reference/data-types/string)
* `format` — 指定如何解析 `time_string` 的格式字符串。[`String`](/sql-reference/data-types/string)
* `timezone` — 可选。时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回根据 MySQL 风格的格式字符串从输入字符串解析得到的 DateTime。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTime('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')
```

```response title=Response
┌─parseDateTime('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2025-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```


## parseDateTime32BestEffort {#parseDateTime32BestEffort}

引入版本：v20.9

将日期和时间的字符串形式转换为 [`DateTime`](/sql-reference/data-types/datetime) 数据类型。

该函数可以解析 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse 自身格式以及其他一些日期和时间格式。

**语法**

```sql
parseDateTime32BestEffort(time_string[, time_zone])
```

**参数**

* `time_string` — 包含要转换的日期和时间的字符串。[`String`](/sql-reference/data-types/string)
* `time_zone` — 可选。解析 `time_string` 时使用的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回由 `time_string` 转换得到的 `DateTime` 值。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTime32BestEffort('23/10/2025 12:12:57')
AS parseDateTime32BestEffort
```

```response title=Response
┌─parseDateTime32BestEffort─┐
│       2025-10-23 12:12:57 │
└───────────────────────────┘
```

**包含时区**

```sql title=Query
SELECT parseDateTime32BestEffort('Sat, 18 Aug 2025 07:22:16 GMT', 'Asia/Istanbul')
AS parseDateTime32BestEffort
```

```response title=Response
┌─parseDateTime32BestEffort─┐
│       2025-08-18 10:22:16 │
└───────────────────────────┘
```

**Unix 时间戳**

```sql title=Query
SELECT parseDateTime32BestEffort('1284101485')
AS parseDateTime32BestEffort
```

```response title=Response
┌─parseDateTime32BestEffort─┐
│       2015-07-07 12:04:41 │
└───────────────────────────┘
```


## parseDateTime32BestEffortOrNull {#parseDateTime32BestEffortOrNull}

引入版本：v20.9

与 [`parseDateTime32BestEffort`](#parseDateTime32BestEffort) 相同，不同之处在于当遇到无法处理的日期格式时返回 `NULL`。

**语法**

```sql
parseDateTime32BestEffortOrNull(time_string[, time_zone])
```

**参数**

* `time_string` — 包含要转换的日期和时间的字符串。[`String`](/sql-reference/data-types/string)
* `time_zone` — 可选。用于解析 `time_string` 的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回从字符串解析得到的 `DateTime` 对象，如果解析失败，则返回 `NULL`。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**用法示例**

```sql title=Query
SELECT
    parseDateTime32BestEffortOrNull('23/10/2025 12:12:57') AS valid,
    parseDateTime32BestEffortOrNull('invalid date') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─┐
│ 2025-10-23 12:12:57 │    ᴺᵁᴸᴸ │
└─────────────────────┴─────────┘
```


## parseDateTime32BestEffortOrZero {#parseDateTime32BestEffortOrZero}

引入于：v20.9

与 [`parseDateTime32BestEffort`](#parseDateTime32BestEffort) 相同，不同之处在于当遇到无法处理的日期格式时，它会返回全零的日期或日期时间值。

**语法**

```sql
parseDateTime32BestEffortOrZero(time_string[, time_zone])
```

**参数**

* `time_string` — 包含要转换的日期和时间的字符串。[`String`](/sql-reference/data-types/string)
* `time_zone` — 可选。用于解析 `time_string` 的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回从字符串解析得到的 `DateTime` 对象，如果解析失败则返回零日期（`1970-01-01 00:00:00`）。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**使用示例**

```sql title=Query
SELECT
    parseDateTime32BestEffortOrZero('23/10/2025 12:12:57') AS valid,
    parseDateTime32BestEffortOrZero('invalid date') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─────────────┐
│ 2025-10-23 12:12:57 │ 1970-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```


## parseDateTime64BestEffort {#parseDateTime64BestEffort}

引入版本：v20.1

与 [`parseDateTimeBestEffort`](#parsedatetimebesteffort) 函数相同，但还会解析毫秒和微秒，并返回 [`DateTime64`](../../sql-reference/data-types/datetime64.md) 数据类型。

**语法**

```sql
parseDateTime64BestEffort(time_string[, precision[, time_zone]])
```

**参数**

* `time_string` — 包含要转换的日期或日期时间的字符串。[`String`](/sql-reference/data-types/string)
* `precision` — 可选。目标精度。`3` 表示毫秒，`6` 表示微秒。默认值：`3`。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — 可选。时区。函数会按照该时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回将 `time_string` 转换为 [`DateTime64`](../../sql-reference/data-types/datetime64.md) 数据类型的结果。[`DateTime64`](/sql-reference/data-types/datetime64)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTime64BestEffort('2025-01-01') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2025-01-01 01:01:00.12346') AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2025-01-01 01:01:00.12346',6) AS a, toTypeName(a) AS t
UNION ALL
SELECT parseDateTime64BestEffort('2025-01-01 01:01:00.12346',3,'Asia/Istanbul') AS a, toTypeName(a) AS t
FORMAT PrettyCompactMonoBlock
```

```response title=Response
┌──────────────────────────a─┬─t──────────────────────────────┐
│ 2025-01-01 01:01:00.123000 │ DateTime64(3)                  │
│ 2025-01-01 00:00:00.000000 │ DateTime64(3)                  │
│ 2025-01-01 01:01:00.123460 │ DateTime64(6)                  │
│ 2025-12-31 22:01:00.123000 │ DateTime64(3, 'Asia/Istanbul') │
└────────────────────────────┴────────────────────────────────┘
```


## parseDateTime64BestEffortOrNull {#parseDateTime64BestEffortOrNull}

引入于：v20.1

与 [`parseDateTime64BestEffort`](#parsedatetime64besteffort) 相同，不同之处在于，当遇到无法解析的日期格式时，它会返回 `NULL`。

**语法**

```sql
parseDateTime64BestEffortOrNull(time_string[, precision[, time_zone]])
```

**参数**

* `time_string` — 包含要转换的日期或日期时间的字符串。[`String`](/sql-reference/data-types/string)
* `precision` — 可选。所需精度。`3` 表示毫秒，`6` 表示微秒。默认值：`3`。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — 可选。时区。函数会依据该时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回将 `time_string` 转换得到的 [`DateTime64`](../../sql-reference/data-types/datetime64.md) 值；如果输入无法解析，则返回 `NULL`。[`DateTime64`](/sql-reference/data-types/datetime64) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTime64BestEffortOrNull('2025-01-01 01:01:00.123') AS valid,
       parseDateTime64BestEffortOrNull('invalid') AS invalid
```

```response title=Response
┌─valid───────────────────┬─invalid─┐
│ 2025-01-01 01:01:00.123 │    ᴺᵁᴸᴸ │
└─────────────────────────┴─────────┘
```


## parseDateTime64BestEffortOrZero {#parseDateTime64BestEffortOrZero}

引入版本：v20.1

与 [`parseDateTime64BestEffort`](#parsedatetime64besteffort) 相同，但在遇到无法解析的日期格式时，会返回零日期或零日期时间。

**语法**

```sql
parseDateTime64BestEffortOrZero(time_string[, precision[, time_zone]])
```

**参数**

* `time_string` — 要转换的日期或日期时间字符串。[`String`](/sql-reference/data-types/string)
* `precision` — 可选。所需精度。`3` 表示毫秒，`6` 表示微秒。默认值：`3`。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — 可选。时区。函数会根据该时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回将 `time_string` 转换为 [`DateTime64`](../../sql-reference/data-types/datetime64.md) 的结果；如果无法解析输入，则返回零日期/日期时间值（`1970-01-01 00:00:00.000`）。[`DateTime64`](/sql-reference/data-types/datetime64)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTime64BestEffortOrZero('2025-01-01 01:01:00.123') AS valid,
       parseDateTime64BestEffortOrZero('invalid') AS invalid
```

```response title=Response
┌─valid───────────────────┬─invalid─────────────────┐
│ 2025-01-01 01:01:00.123 │ 1970-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```


## parseDateTime64BestEffortUS {#parseDateTime64BestEffortUS}

自 v22.8 引入。

与 [`parseDateTime64BestEffort`](#parsedatetime64besteffort) 相同，只是在存在歧义时，该函数会优先采用美国日期格式（`MM/DD/YYYY` 等）。

**语法**

```sql
parseDateTime64BestEffortUS(time_string [, precision [, time_zone]])
```

**参数**

* `time_string` — 包含要转换的日期或日期时间的字符串。[`String`](/sql-reference/data-types/string)
* `precision` — 可选。所需精度。`3` 表示毫秒，`6` 表示微秒。默认值：`3`。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — 可选。时区。函数会根据该时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回将 `time_string` 按照美国日期格式习惯（用于解析存在歧义的情况）转换为 [`DateTime64`](../../sql-reference/data-types/datetime64.md) 的结果。[`DateTime64`](/sql-reference/data-types/datetime64)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTime64BestEffortUS('02/10/2025 12:30:45.123') AS us_format,
       parseDateTime64BestEffortUS('15/08/2025 10:15:30.456') AS fallback_to_standard
```

```response title=Response
┌─us_format───────────────┬─fallback_to_standard────┐
│ 2025-02-10 12:30:45.123 │ 2025-08-15 10:15:30.456 │
└─────────────────────────┴─────────────────────────┘
```


## parseDateTime64BestEffortUSOrNull {#parseDateTime64BestEffortUSOrNull}

引入自：v22.8

与 [`parseDateTime64BestEffort`](#parsedatetime64besteffort) 相同，只是在存在歧义时，该函数会优先采用美国日期格式（`MM/DD/YYYY` 等），并在遇到无法处理的日期格式时返回 `NULL`。

**语法**

```sql
parseDateTime64BestEffortUSOrNull(time_string[, precision[, time_zone]])
```

**参数**

* `time_string` — 包含要转换的日期或日期时间的字符串。[`String`](/sql-reference/data-types/string)
* `precision` — 可选。所需精度。`3` 表示毫秒，`6` 表示微秒。默认值：`3`。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — 可选。时区。函数会根据指定时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回按美国惯用格式将 `time_string` 转换为 [`DateTime64`](../../sql-reference/data-types/datetime64.md) 的结果，如果输入无法解析则返回 `NULL`。[`DateTime64`](/sql-reference/data-types/datetime64) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=Query
SELECT parseDateTime64BestEffortUSOrNull('02/10/2025 12:30:45.123') AS valid_us,
       parseDateTime64BestEffortUSOrNull('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────────┬─invalid─┐
│ 2025-02-10 12:30:45.123 │    ᴺᵁᴸᴸ │
└─────────────────────────┴─────────┘
```


## parseDateTime64BestEffortUSOrZero {#parseDateTime64BestEffortUSOrZero}

自 v22.8 引入

与 [`parseDateTime64BestEffort`](#parsedatetime64besteffort) 相同，只是在存在歧义时，此函数会优先采用美国日期格式（`MM/DD/YYYY` 等），并在遇到无法处理的日期格式时返回全零日期或全零日期时间值。

**语法**

```sql
parseDateTime64BestEffortUSOrZero(time_string [, precision [, time_zone]])
```

**参数**

* `time_string` — 包含要转换的日期或日期时间的字符串。[`String`](/sql-reference/data-types/string)
* `precision` — 可选。所需精度。`3` 表示毫秒，`6` 表示微秒。默认值：`3`。[`UInt8`](/sql-reference/data-types/int-uint)
* `time_zone` — 可选。时区。函数会根据该时区解析 `time_string`。[`String`](/sql-reference/data-types/string)

**返回值**

返回按美国格式习惯将 `time_string` 转换得到的 [`DateTime64`](../../sql-reference/data-types/datetime64.md)，如果输入无法解析，则返回零日期/日期时间值（`1970-01-01 00:00:00.000`）。[`DateTime64`](/sql-reference/data-types/datetime64)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTime64BestEffortUSOrZero('02/10/2025 12:30:45.123') AS valid_us,
       parseDateTime64BestEffortUSOrZero('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────────┬─invalid─────────────────┐
│ 2025-02-10 12:30:45.123 │ 1970-01-01 00:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```


## parseDateTimeBestEffort {#parseDateTimeBestEffort}

引入于：v1.1

将字符串形式的日期和时间转换为 DateTime 数据类型。
该函数可以解析 [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html)、[RFC 1123 - 5.2.14 RFC-822](https://datatracker.ietf.org/doc/html/rfc822) 日期和时间规范、ClickHouse 自身的格式以及其他一些日期和时间格式。

支持的非标准格式：

* 包含 9..10 位 Unix 时间戳的字符串。
* 同时包含日期和时间部分的字符串：`YYYYMMDDhhmmss`、`DD/MM/YYYY hh:mm:ss`、`DD-MM-YY hh:mm`、`YYYY-MM-DD hh:mm:ss` 等。
* 只包含日期而不包含时间部分的字符串：`YYYY`、`YYYYMM`、`YYYY*MM`、`DD/MM/YYYY`、`DD-MM-YY` 等。
* 仅包含日和时间的字符串：`DD`、`DD hh`、`DD hh:mm`。在这种情况下，`MM` 会被替换为 `01`。
* 包含日期和时间以及时区偏移信息的字符串：`YYYY-MM-DD hh:mm:ss ±h:mm` 等。
* syslog 时间戳：`Mmm dd hh:mm:ss`。例如，`Jun  9 14:20:32`。

对于所有带分隔符的格式，函数可以解析以月份全名或前三个字母表示的月份名称。
如果未指定年份，则默认使用当前年份。

**语法**

```sql
parseDateTimeBestEffort(time_string[, time_zone])
```

**参数**

* `time_string` — 包含要转换的日期和时间的字符串。[`String`](/sql-reference/data-types/string)
* `time_zone` — 可选。解析 `time_string` 时使用的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回由 `time_string` 解析得到的 `DateTime` 值。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**使用示例**

```sql title=Query
SELECT parseDateTimeBestEffort('23/10/2025 12:12:57') AS parseDateTimeBestEffort
```

```response title=Response
┌─parseDateTimeBestEffort─┐
│     2025-10-23 12:12:57 │
└─────────────────────────┘
```

**含时区**

```sql title=Query
SELECT parseDateTimeBestEffort('Sat, 18 Aug 2025 07:22:16 GMT', 'Asia/Istanbul') AS parseDateTimeBestEffort
```

```response title=Response
┌─parseDateTimeBestEffort─┐
│     2025-08-18 10:22:16 │
└─────────────────────────┘
```

**Unix 时间戳**

```sql title=Query
SELECT parseDateTimeBestEffort('1735689600') AS parseDateTimeBestEffort
```

```response title=Response
┌─parseDateTimeBestEffort─┐
│     2025-01-01 00:00:00 │
└─────────────────────────┘
```


## parseDateTimeBestEffortOrNull {#parseDateTimeBestEffortOrNull}

引入版本：v1.1

与 [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) 相同，不同之处在于当遇到无法处理的日期格式时会返回 `NULL`。
该函数可以解析 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse 特有以及其他部分日期和时间格式。

支持的非标准格式：

* 包含 9 到 10 位 Unix 时间戳的字符串。
* 同时包含日期和时间组件的字符串：`YYYYMMDDhhmmss`、`DD/MM/YYYY hh:mm:ss`、`DD-MM-YY hh:mm`、`YYYY-MM-DD hh:mm:ss` 等。
* 仅包含日期但不包含时间组件的字符串：`YYYY`、`YYYYMM`、`YYYY*MM`、`DD/MM/YYYY`、`DD-MM-YY` 等。
* 包含日和时间的字符串：`DD`、`DD hh`、`DD hh:mm`。在这种情况下，`MM` 会被填充为 `01`。
* 包含日期和时间以及时区偏移信息的字符串：`YYYY-MM-DD hh:mm:ss ±h:mm` 等。
* syslog 时间戳：`Mmm dd hh:mm:ss`。例如，`Jun  9 14:20:32`。

对于所有带分隔符的格式，函数都可以解析以完整名称或月份名称前三个字母表示的月份名。
如果未指定年份，则默认认为等于当前年份。

**语法**

```sql
parseDateTimeBestEffortOrNull(time_string[, time_zone])
```

**参数**

* `time_string` — 包含要转换日期和时间的字符串。[`String`](/sql-reference/data-types/string)
* `time_zone` — 可选。用于解析 `time_string` 的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `time_string` 对应的 DateTime 值，如果输入无法解析则返回 `NULL`。[`DateTime`](/sql-reference/data-types/datetime) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=Query
SELECT parseDateTimeBestEffortOrNull('23/10/2025 12:12:57') AS valid,
       parseDateTimeBestEffortOrNull('invalid') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─┐
│ 2025-10-23 12:12:57 │    ᴺᵁᴸᴸ │
└─────────────────────┴─────────┘
```


## parseDateTimeBestEffortOrZero {#parseDateTimeBestEffortOrZero}

引入于：v1.1

与 [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) 相同，不同之处在于，当遇到无法处理的日期格式时，它会返回零日期或零日期时间值。
该函数可以解析 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 Date and Time Specification](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse 自身的格式以及其他一些日期和时间格式。

支持的非标准格式：

* 包含 9～10 位 Unix 时间戳的字符串。
* 同时包含日期和时间部分的字符串：`YYYYMMDDhhmmss`、`DD/MM/YYYY hh:mm:ss`、`DD-MM-YY hh:mm`、`YYYY-MM-DD hh:mm:ss` 等。
* 仅包含日期、不包含时间部分的字符串：`YYYY`、`YYYYMM`、`YYYY*MM`、`DD/MM/YYYY`、`DD-MM-YY` 等。
* 仅包含日和时间的字符串：`DD`、`DD hh`、`DD hh:mm`。在这种情况下，`MM` 会被替换为 `01`。
* 包含日期、时间以及时区偏移信息的字符串：`YYYY-MM-DD hh:mm:ss ±h:mm` 等。
* syslog 时间戳：`Mmm dd hh:mm:ss`。例如，`Jun  9 14:20:32`。

对于所有带分隔符的格式，该函数可以解析以完整月份名称或月份名称前三个字母表示的月份。
如果未指定年份，则默认为当前年份。

**语法**

```sql
parseDateTimeBestEffortOrZero(time_string[, time_zone])
```

**参数**

* `time_string` — 包含要转换的日期和时间的字符串。[`String`](/sql-reference/data-types/string)
* `time_zone` — 可选。用于解析 `time_string` 的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回与 `time_string` 对应的 `DateTime` 值；如果输入无法解析，则返回零日期/日期时间（`1970-01-01` 或 `1970-01-01 00:00:00`）。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTimeBestEffortOrZero('23/10/2025 12:12:57') AS valid,
       parseDateTimeBestEffortOrZero('invalid') AS invalid
```

```response title=Response
┌─valid───────────────┬─invalid─────────────┐
│ 2025-10-23 12:12:57 │ 1970-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```


## parseDateTimeBestEffortUS {#parseDateTimeBestEffortUS}

引入于：v1.1

对于 ISO 日期格式（例如 `YYYY-MM-DD hh:mm:ss`）以及其他可以无歧义地提取出“月”和“日”组成部分的日期格式（例如 `YYYYMMDDhhmmss`、`YYYY-MM`、`DD hh` 或 `YYYY-MM-DD hh:mm:ss ±h:mm`），此函数的行为与 [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) 相同。
如果“月”和“日”组成部分无法被无歧义地确定，例如 `MM/DD/YYYY`、`MM-DD-YYYY` 或 `MM-DD-YY`，则此函数会优先按照美国日期格式进行解析，而不是按照 `DD/MM/YYYY`、`DD-MM-YYYY` 或 `DD-MM-YY` 进行解析。
作为对前述说明的一个例外，如果“月”的数值大于 12 且小于等于 31，则该函数会回退为 [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) 的行为，例如 `15/08/2020` 会被解析为 `2020-08-15`。

**语法**

```sql
parseDateTimeBestEffortUS(time_string[, time_zone])
```

**参数**

* `time_string` — 要转换的日期和时间字符串。[`String`](/sql-reference/data-types/string)
* `time_zone` — 可选。用于解析 `time_string` 的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回由 `time_string` 解析得到的 `DateTime`，在存在歧义时优先按照美国日期格式进行解析。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTimeBestEffortUS('02/10/2025') AS us_format,
       parseDateTimeBestEffortUS('15/08/2025') AS fallback_to_standard
```

```response title=Response
┌─us_format───────────┬─fallback_to_standard─┐
│ 2025-02-10 00:00:00 │  2025-08-15 00:00:00 │
└─────────────────────┴──────────────────────┘
```


## parseDateTimeBestEffortUSOrNull {#parseDateTimeBestEffortUSOrNull}

引入于：v1.1

与 [`parseDateTimeBestEffortUS`](#parseDateTimeBestEffortUS) 函数相同，只是当遇到无法处理的日期格式时会返回 `NULL`。

对于 ISO 日期格式，此函数的行为与 [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) 相同，但在存在歧义的情况下会优先采用美国日期格式，并在解析出错时返回 `NULL`。

**语法**

```sql
parseDateTimeBestEffortUSOrNull(time_string[, time_zone])
```

**参数**

* `time_string` — 包含要转换日期和时间的字符串。[`String`](/sql-reference/data-types/string)
* `time_zone` — 可选。解析 `time_string` 时使用的时区。[`String`](/sql-reference/data-types/string)

**返回值**

将 `time_string` 按美国格式优先解析为 DateTime 返回；若输入无法解析，则返回 `NULL`。[`DateTime`](/sql-reference/data-types/datetime) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTimeBestEffortUSOrNull('02/10/2025') AS valid_us,
       parseDateTimeBestEffortUSOrNull('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────┬─invalid─┐
│ 2025-02-10 00:00:00 │    ᴺᵁᴸᴸ │
└─────────────────────┴─────────┘
```


## parseDateTimeBestEffortUSOrZero {#parseDateTimeBestEffortUSOrZero}

引入自：v1.1

与 [`parseDateTimeBestEffortUS`](#parseDateTimeBestEffortUS) 函数相同，只是在遇到无法处理的日期格式时，会返回零日期（`1970-01-01`）或带时间的零日期（`1970-01-01 00:00:00`）。

对于 ISO 日期格式，此函数的行为与 [`parseDateTimeBestEffort`](#parseDateTimeBestEffort) 一致，但在存在歧义的情况下更偏向使用美国日期格式，并且在解析错误时返回零日期值。

**语法**

```sql
parseDateTimeBestEffortUSOrZero(time_string[, time_zone])
```

**参数**

* `time_string` — 包含要转换的日期和时间的字符串。[`String`](/sql-reference/data-types/string)
* `time_zone` — 可选。解析 `time_string` 时使用的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回按美国格式偏好将 `time_string` 解析得到的 `DateTime` 值；如果输入无法解析，则返回零日期/日期时间值（`1970-01-01` 或 `1970-01-01 00:00:00`）。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTimeBestEffortUSOrZero('02/10/2025') AS valid_us,
       parseDateTimeBestEffortUSOrZero('invalid') AS invalid
```

```response title=Response
┌─valid_us────────────┬─invalid─────────────┐
│ 2025-02-10 00:00:00 │ 1970-01-01 00:00:00 │
└─────────────────────┴─────────────────────┘
```


## parseDateTimeOrNull {#parseDateTimeOrNull}

自 v23.3 起引入

与 [`parseDateTime`](#parseDateTime) 相同，但在遇到无法解析的日期格式时返回 `NULL`。

**语法**

```sql
parseDateTimeOrNull(time_string, format[, timezone])
```

**别名**: `str_to_date`

**参数**

* `time_string` — 要解析为 DateTime 的字符串。[`String`](/sql-reference/data-types/string)
* `format` — 指定如何解析 `time_string` 的格式字符串。[`String`](/sql-reference/data-types/string)
* `timezone` — 可选。时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回从输入字符串解析得到的 DateTime，如果解析失败，则返回 NULL。[`Nullable(DateTime)`](/sql-reference/data-types/nullable)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTimeOrNull('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')
```

```response title=Response
┌─parseDateTimeOrNull('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                            2025-01-04 23:00:00  │
└─────────────────────────────────────────────────────────────────┘
```


## parseDateTimeOrZero {#parseDateTimeOrZero}

引入版本：v23.3

与 [`parseDateTime`](#parseDateTime) 相同，但在遇到无法解析的日期格式时返回零日期值。

**语法**

```sql
parseDateTimeOrZero(time_string, format[, timezone])
```

**参数**

* `time_string` — 将被解析为 DateTime 的字符串。[`String`](/sql-reference/data-types/string)
* `format` — 指定如何解析 `time_string` 的格式字符串。[`String`](/sql-reference/data-types/string)
* `timezone` — 可选。时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回从输入字符串解析得到的 DateTime，如果解析失败则返回零值 DateTime。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**用法示例**

```sql title=Query
SELECT parseDateTimeOrZero('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')
```

```response title=Response
┌─parseDateTimeOrZero('2025-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                             2025-01-04 23:00:00 │
└─────────────────────────────────────────────────────────────────┘
```


## reinterpret {#reinterpret}

自 v1.1 起引入

对给定值 `x` 复用其在内存中的原始字节序列，并将其重新解释为目标类型。

**语法**

```sql
reinterpret(x, type)
```

**参数**

* `x` — 任意类型。[`Any`](/sql-reference/data-types)
* `type` — 目标类型。如果是数组类型，则数组元素类型必须是定长类型。[`String`](/sql-reference/data-types/string)

**返回值**

目标类型的值。[`Any`](/sql-reference/data-types)

**示例**

**用法示例**

```sql title=Query
SELECT reinterpret(toInt8(-1), 'UInt8') AS int_to_uint,
    reinterpret(toInt8(1), 'Float32') AS int_to_float,
    reinterpret('1', 'UInt32') AS string_to_int
```

```response title=Response
┌─int_to_uint─┬─int_to_float─┬─string_to_int─┐
│         255 │        1e-45 │            49 │
└─────────────┴──────────────┴───────────────┘
```

**数组示例**

```sql title=Query
SELECT reinterpret(x'3108b4403108d4403108b4403108d440', 'Array(Float32)') AS string_to_array_of_Float32
```

```response title=Response
┌─string_to_array_of_Float32─┐
│ [5.626,6.626,5.626,6.626]  │
└────────────────────────────┘
```


## reinterpretAsDate {#reinterpretAsDate}

引入版本：v1.1

将输入值重新解释为一个 Date 值（假定为小端字节序），表示自 Unix 纪元起点 1970-01-01 以来经过的天数。

**语法**

```sql
reinterpretAsDate(x)
```

**参数**

* `x` — 自 Unix 纪元开始经过的天数。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`UUID`](/sql-reference/data-types/uuid) 或 [`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

日期。[`Date`](/sql-reference/data-types/date)

**示例**

**用法示例**

```sql title=Query
SELECT reinterpretAsDate(65), reinterpretAsDate('A')
```

```response title=Response
┌─reinterpretAsDate(65)─┬─reinterpretAsDate('A')─┐
│            1970-03-07 │             1970-03-07 │
└───────────────────────┴────────────────────────┘
```


## reinterpretAsDateTime {#reinterpretAsDateTime}

引入于：v1.1

将输入值重新解释为一个 DateTime 值（假设为小端序），该值表示自 Unix 纪元（1970-01-01）开始以来的天数。

**语法**

```sql
reinterpretAsDateTime(x)
```

**参数**

* `x` — 自 Unix 纪元开始起算的秒数。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`UUID`](/sql-reference/data-types/uuid) 或 [`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

日期和时间。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**用法示例**

```sql title=Query
SELECT reinterpretAsDateTime(65), reinterpretAsDateTime('A')
```

```response title=Response
┌─reinterpretAsDateTime(65)─┬─reinterpretAsDateTime('A')─┐
│       1970-01-01 01:01:05 │        1970-01-01 01:01:05 │
└───────────────────────────┴────────────────────────────┘
```


## reinterpretAsFixedString {#reinterpretAsFixedString}

自 v1.1 引入

将输入值重新解释为定长字符串（假定为小端字节序）。
末尾的空字节会被忽略，例如，对于 UInt32 值 255，该函数返回仅包含单个字符的字符串。

**语法**

```sql
reinterpretAsFixedString(x)
```

**参数**

* `x` — 要重新解释为字符串的值。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime)

**返回值**

定长字符串，其中的字节表示 `x`。[`FixedString`](/sql-reference/data-types/fixedstring)

**示例**

**使用示例**

```sql title=Query
SELECT
    reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsFixedString(toDate('1970-03-07'))
```

```response title=Response
┌─reinterpretAsFixedString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsFixedString(toDate('1970-03-07'))─┐
│ A                                                           │ A                                              │
└─────────────────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```


## reinterpretAsFloat32 {#reinterpretAsFloat32}

引入版本：v1.1

将输入值重新解释为 Float32 类型的值。
与 [`CAST`](#cast) 不同，该函数不尝试保留原始值——如果目标类型无法表示输入值，则输出结果未定义。

**语法**

```sql
reinterpretAsFloat32(x)
```

**参数**

* `x` — 要重新解释为 Float32 的值。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`UUID`](/sql-reference/data-types/uuid) 或 [`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

返回重新解释后的 `x` 值。[`Float32`](/sql-reference/data-types/float)

**示例**

**用法示例**

```sql title=Query
SELECT reinterpretAsUInt32(toFloat32(0.2)) AS x, reinterpretAsFloat32(x)
```

```response title=Response
┌──────────x─┬─reinterpretAsFloat32(x)─┐
│ 1045220557 │                     0.2 │
└────────────┴─────────────────────────┘
```


## reinterpretAsFloat64 {#reinterpretAsFloat64}

首次在 v1.1 中引入

将输入值重新解释为 Float64 类型的值。
与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入类型，则输出是未定义的。

**语法**

```sql
reinterpretAsFloat64(x)
```

**参数**

* `x` — 要按 Float64 重新解释的值。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`UUID`](/sql-reference/data-types/uuid) 或 [`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

返回按 Float64 重新解释后的值 `x`。[`Float64`](/sql-reference/data-types/float)

**示例**

**使用示例**

```sql title=Query
SELECT reinterpretAsUInt64(toFloat64(0.2)) AS x, reinterpretAsFloat64(x)
```

```response title=Response
┌───────────────────x─┬─reinterpretAsFloat64(x)─┐
│ 4596373779694328218 │                     0.2 │
└─────────────────────┴─────────────────────────┘
```


## reinterpretAsInt128 {#reinterpretAsInt128}

引入版本：v1.1

将输入值按 `Int128` 类型重新解释。
与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，其结果未定义。

**语法**

```sql
reinterpretAsInt128(x)
```

**参数**

* `x` — 按 Int128 重新解释的值。可以是 [`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、[`Date`](/sql-reference/data-types/date)、[`DateTime`](/sql-reference/data-types/datetime)、[`UUID`](/sql-reference/data-types/uuid)、[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)。

**返回值**

返回按 Int128 重新解释后的值 `x`。[`Int128`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toInt64(257) AS x,
    toTypeName(x),
    reinterpretAsInt128(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int64         │ 257 │ Int128          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt16 {#reinterpretAsInt16}

引入版本：v1.1

将输入值重新解释为 Int16 类型的值。
与 [`CAST`](#cast) 不同，函数不会尝试保留原始值——如果目标类型无法表示输入值，输出是未定义的。

**语法**

```sql
reinterpretAsInt16(x)
```

**参数**

* `x` — 要按 Int16 重新解释的值。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`UUID`](/sql-reference/data-types/uuid) 或 [`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

返回按 Int16 重新解释后的值 `x`。[`Int16`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt16(x) AS res,
    toTypeName(res)
```

```response title=Response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ Int8          │   1 │ Int16           │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt256 {#reinterpretAsInt256}

自 v1.1 引入

将输入值重新解释为 Int256 类型的值。
与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出结果未定义。

**语法**

```sql
reinterpretAsInt256(x)
```

**参数**

* `x` — 要按 Int256 重新解释的值。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`UUID`](/sql-reference/data-types/uuid) 或 [`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

返回按新类型重新解释后的值 `x`。[`Int256`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt128(257) AS x,
    toTypeName(x),
    reinterpretAsInt256(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int128        │ 257 │ Int256          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt32 {#reinterpretAsInt32}

引入版本：v1.1

将输入值重新解释为 Int32 类型的值。
与 [`CAST`](#cast) 不同，函数不会尝试保留原始值——如果目标类型无法表示该输入值，则输出结果未定义。

**语法**

```sql
reinterpretAsInt32(x)
```

**参数**

* `x` — 要按 Int32 重解释的值。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`UUID`](/sql-reference/data-types/uuid) 或 [`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

返回按 Int32 重解释后的值 `x`。[`Int32`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toInt16(257) AS x,
    toTypeName(x),
    reinterpretAsInt32(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int16         │ 257 │ Int32           │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt64 {#reinterpretAsInt64}

引入版本：v1.1

将输入值重新解释为 `Int64` 类型的值。
与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入类型，则输出结果未定义。

**语法**

```sql
reinterpretAsInt64(x)
```

**参数**

* `x` — 要按 Int64 重新解释的值。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`UUID`](/sql-reference/data-types/uuid) 或 [`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

返回按新类型重新解释后的值 `x`。[`Int64`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toInt32(257) AS x,
    toTypeName(x),
    reinterpretAsInt64(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ Int32         │ 257 │ Int64           │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsInt8 {#reinterpretAsInt8}

引入于：v1.1

将输入值重新解释为 Int8 类型的值。
与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入类型，则输出未定义。

**语法**

```sql
reinterpretAsInt8(x)
```

**参数**

* `x` — 要重新解释为 Int8 的值。可以为 [`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、[`Date`](/sql-reference/data-types/date)、[`DateTime`](/sql-reference/data-types/datetime)、[`UUID`](/sql-reference/data-types/uuid)、[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)。

**返回值**

返回将 `x` 重新解释后的值。[`Int8`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsInt8(x) AS res,
    toTypeName(res)
```

```response title=Response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ Int8            │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsString {#reinterpretAsString}

引入版本：v1.1

将输入值重新解释为字符串（假定为小端字节序）。
末尾的空字节会被忽略，例如，对于 UInt32 值 255，该函数会返回仅包含一个字符的字符串。

**语法**

```sql
reinterpretAsString(x)
```

**参数**

* `x` — 要按字节重新解释为字符串的值。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime)

**返回值**

包含表示 `x` 的字节序列的字符串。[`String`](/sql-reference/data-types/string)

**示例**

**用法示例**

```sql title=Query
SELECT
    reinterpretAsString(toDateTime('1970-01-01 01:01:05')),
    reinterpretAsString(toDate('1970-03-07'))
```

```response title=Response
┌─reinterpretAsString(toDateTime('1970-01-01 01:01:05'))─┬─reinterpretAsString(toDate('1970-03-07'))─┐
│ A                                                      │ A                                         │
└────────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```


## reinterpretAsUInt128 {#reinterpretAsUInt128}

引入版本：v1.1

将输入值重新解释为 `UInt128` 类型的值。
与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出是未定义的。

**语法**

```sql
reinterpretAsUInt128(x)
```

**参数**

* `x` — 要重新解释为 UInt128 的值。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`UUID`](/sql-reference/data-types/uuid) 或 [`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

返回重新解释后的值 `x`。[`UInt128`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toUInt64(257) AS x,
    toTypeName(x),
    reinterpretAsUInt128(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt64        │ 257 │ UInt128         │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt16 {#reinterpretAsUInt16}

自 v1.1 引入

将输入值重新解释为 `UInt16` 类型的值。
与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示该输入值，则输出是未定义的。

**语法**

```sql
reinterpretAsUInt16(x)
```

**参数**

* `x` — 要按 UInt16 重新解释的值。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`UUID`](/sql-reference/data-types/uuid) 或 [`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

返回按 UInt16 重新解释后的值 `x`。[`UInt16`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toUInt8(257) AS x,
    toTypeName(x),
    reinterpretAsUInt16(x) AS res,
    toTypeName(res)
```

```response title=Response
┌─x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 1 │ UInt8         │   1 │ UInt16          │
└───┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt256 {#reinterpretAsUInt256}

自 v1.1 起引入

将输入值重新解释为 `UInt256` 类型的值。
与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入类型，则输出未定义。

**语法**

```sql
reinterpretAsUInt256(x)
```

**参数**

* `x` — 要重新解释为 UInt256 类型的值。可以是 [`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、[`Date`](/sql-reference/data-types/date)、[`DateTime`](/sql-reference/data-types/datetime)、[`UUID`](/sql-reference/data-types/uuid)、[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)。

**返回值**

返回将 `x` 重新解释为 [`UInt256`](/sql-reference/data-types/int-uint) 类型后的值。

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt128(257) AS x,
    toTypeName(x),
    reinterpretAsUInt256(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt128       │ 257 │ UInt256         │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt32 {#reinterpretAsUInt32}

引入于：v1.1

将输入值按 `UInt32` 类型重新解释。
与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出是未定义的。

**语法**

```sql
reinterpretAsUInt32(x)
```

**参数**

* `x` — 要按 UInt32 重新解释的值。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`UUID`](/sql-reference/data-types/uuid) 或 [`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

返回被重新解释后的 `x` 值。[`UInt32`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt16(257) AS x,
    toTypeName(x),
    reinterpretAsUInt32(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt16        │ 257 │ UInt32          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt64 {#reinterpretAsUInt64}

引入版本：v1.1

将输入值按 `UInt64` 类型重新解释为该类型的值。
与 [`CAST`](#cast) 不同，函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出是未定义的。

**语法**

```sql
reinterpretAsUInt64(x)
```

**参数**

* `x` — 按 UInt64 重新解释的值。可以是 [`Int*`](/sql-reference/data-types/int-uint)、[`UInt*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、[`Date`](/sql-reference/data-types/date)、[`DateTime`](/sql-reference/data-types/datetime)、[`UUID`](/sql-reference/data-types/uuid)、[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)。

**返回值**

返回按 UInt64 重新解释后的 `x` 的值。[`UInt64`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toUInt32(257) AS x,
    toTypeName(x),
    reinterpretAsUInt64(x) AS res,
    toTypeName(res)
```

```response title=Response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt32        │ 257 │ UInt64          │
└─────┴───────────────┴─────┴─────────────────┘
```


## reinterpretAsUInt8 {#reinterpretAsUInt8}

自 v1.1 起引入

将输入值重新解释为 `UInt8` 类型的值。
与 [`CAST`](#cast) 不同，该函数不会尝试保留原始值——如果目标类型无法表示输入值，则输出未定义。

**语法**

```sql
reinterpretAsUInt8(x)
```

**参数**

* `x` — 要重新解释为 UInt8 类型的值。类型可以是 [`(U)Int*`](/sql-reference/data-types/int-uint)、[`Float*`](/sql-reference/data-types/float)、[`Date`](/sql-reference/data-types/date)、[`DateTime`](/sql-reference/data-types/datetime)、[`UUID`](/sql-reference/data-types/uuid)、[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)。

**返回值**

返回重新解释后的 `x` 值，类型为 [`UInt8`](/sql-reference/data-types/int-uint)。

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt8(-1) AS val,
    toTypeName(val),
    reinterpretAsUInt8(val) AS res,
    toTypeName(res);
```

```response title=Response
┌─val─┬─toTypeName(val)─┬─res─┬─toTypeName(res)─┐
│  -1 │ Int8            │ 255 │ UInt8           │
└─────┴─────────────────┴─────┴─────────────────┘
```


## reinterpretAsUUID {#reinterpretAsUUID}

自 v1.1 起引入

接受一个 16 字节的字符串，并通过将其分成两个 8 字节部分、按小端字节序解释来返回一个 UUID。如果字符串长度不足，函数的行为等同于在字符串末尾填充所需数量的空字节。如果字符串长度超过 16 字节，则会忽略末尾多余的字节。

**语法**

```sql
reinterpretAsUUID(fixed_string)
```

**参数**

* `fixed_string` — 大端序字节串。[`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

UUID 类型的值。[`UUID`](/sql-reference/data-types/uuid)

**示例**

**字符串转 UUID**

```sql title=Query
SELECT reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')))
```

```response title=Response
┌─reinterpretAsUUID(reverse(unhex('000102030405060708090a0b0c0d0e0f')))─┐
│                                  08090a0b-0c0d-0e0f-0001-020304050607 │
└───────────────────────────────────────────────────────────────────────┘
```


## toBFloat16 {#toBFloat16}

引入版本：v1.1

将输入值转换为 BFloat16 类型的值。
发生错误时抛出异常。

另请参阅：

* [`toBFloat16OrZero`](#toBFloat16OrZero)。
* [`toBFloat16OrNull`](#toBFloat16OrNull)。

**语法**

```sql
toBFloat16(expr)
```

**参数**

* `expr` — 求值结果为数字或数字字符串表示的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回一个 16 位 bfloat16 浮点值。[`BFloat16`](/sql-reference/data-types/float)

**示例**

**用法示例**

```sql title=Query
SELECT
toBFloat16(toFloat32(42.7)),
toBFloat16(toFloat32('42.7')),
toBFloat16('42.7')
FORMAT Vertical;
```

```response title=Response
toBFloat16(toFloat32(42.7)): 42.5
toBFloat16(t⋯32('42.7')):    42.5
toBFloat16('42.7'):          42.5
```


## toBFloat16OrNull {#toBFloat16OrNull}

引入版本：v1.1

将一个字符串类型的输入值转换为 BFloat16 类型的值。
如果该字符串不表示浮点数，则函数返回 NULL。

支持的参数：

* 数值的字符串表示。

不支持的参数（返回 `NULL`）：

* 二进制和十六进制数值的字符串表示。
* 数值类型的输入值。

:::note
该函数在从字符串表示进行转换时允许静默地损失精度。
:::

另请参阅：

* [`toBFloat16`](#toBFloat16)。
* [`toBFloat16OrZero`](#toBFloat16OrZero)。

**语法**

```sql
toBFloat16OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回一个 16 位 bfloat16 浮点数值，否则为 `NULL`。[`BFloat16`](/sql-reference/data-types/float) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT toBFloat16OrNull('0x5E'), -- unsupported arguments
       toBFloat16OrNull('12.3'), -- typical use
       toBFloat16OrNull('12.3456789') -- silent loss of precision
```

```response title=Response
\N
12.25
12.3125
```


## toBFloat16OrZero {#toBFloat16OrZero}

引入版本：v1.1

将 String 类型的输入值转换为 BFloat16 类型的值。
如果字符串不表示浮点数值，则函数返回 0。

支持的参数：

* 数值的字符串表示。

不支持的参数（返回 `0`）：

* 二进制和十六进制值的字符串表示。
* 数值类型的值。

:::note
该函数在从字符串表示进行转换时允许无提示的精度损失。
:::

另请参阅：

* [`toBFloat16`](#toBFloat16)。
* [`toBFloat16OrNull`](#toBFloat16OrNull)。

**语法**

```sql
toBFloat16OrZero(x)
```

**参数**

* `x` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回一个 16 位 BFloat16（brain floating point）值，否则返回 `0`。[`BFloat16`](/sql-reference/data-types/float)

**示例**

**用法示例**

```sql title=Query
SELECT toBFloat16OrZero('0x5E'), -- unsupported arguments
       toBFloat16OrZero('12.3'), -- typical use
       toBFloat16OrZero('12.3456789') -- silent loss of precision
```

```response title=Response
0
12.25
12.3125
```


## toBool {#toBool}

自 v22.2 起引入

将输入值转换为 Bool 类型的值。

**语法**

```sql
toBool(expr)
```

**参数**

* `expr` — 其结果为数字或字符串的表达式。对于字符串，接受 &#39;true&#39; 或 &#39;false&#39;（不区分大小写）。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string) 或 [`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

根据参数的求值结果返回 `true` 或 `false`。[`Bool`](/sql-reference/data-types/boolean)

**示例**

**用法示例**

```sql title=Query
SELECT
    toBool(toUInt8(1)),
    toBool(toInt8(-1)),
    toBool(toFloat32(1.01)),
    toBool('true'),
    toBool('false'),
    toBool('FALSE')
FORMAT Vertical
```

```response title=Response
toBool(toUInt8(1)):      true
toBool(toInt8(-1)):      true
toBool(toFloat32(1.01)): true
toBool('true'):          true
toBool('false'):         false
toBool('FALSE'):         false
```


## toDate {#toDate}

自 v1.1 引入

将输入值转换为 [`Date`](/sql-reference/data-types/date) 类型。
支持从 String、FixedString、DateTime 或数值类型进行转换。

**语法**

```sql
toDate(x)
```

**参数**

* `x` — 要转换的输入值。[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)

**返回值**

返回转换后的日期值。[`Date`](/sql-reference/data-types/date)

**示例**

**将 String 转换为 Date**

```sql title=Query
SELECT toDate('2025-04-15')
```

```response title=Response
2025-04-15
```

**将 DateTime 转换为 Date**

```sql title=Query
SELECT toDate(toDateTime('2025-04-15 10:30:00'))
```

```response title=Response
2025-04-15
```

**整数转换为 Date**

```sql title=Query
SELECT toDate(20297)
```

```response title=Response
2025-07-28
```


## toDate32 {#toDate32}

首次引入于：v21.9

将参数转换为 [Date32](../data-types/date32.md) 数据类型。
如果值超出范围，`toDate32` 会返回 [Date32](../data-types/date32.md) 所支持范围的边界值。
如果参数类型为 [`Date`](../data-types/date.md)，则会考虑其自身的取值边界。

**语法**

```sql
toDate32(expr)
```

**参数**

* `expr` — 要转换的值。[`String`](/sql-reference/data-types/string)、[`UInt32`](/sql-reference/data-types/int-uint) 或 [`Date`](/sql-reference/data-types/date)

**返回值**

返回一个日历日期。[`Date32`](/sql-reference/data-types/date32)

**示例**

**处于有效范围内**

```sql title=Query
SELECT toDate32('2025-01-01') AS value, toTypeName(value)
FORMAT Vertical
```

```response title=Response
Row 1:
──────
value:           2025-01-01
toTypeName(value): Date32
```

**超出有效范围**

```sql title=Query
SELECT toDate32('1899-01-01') AS value, toTypeName(value)
FORMAT Vertical
```

```response title=Response
Row 1:
──────
value:           1900-01-01
toTypeName(value): Date32
```


## toDate32OrDefault {#toDate32OrDefault}

引入版本：v21.11

将参数转换为 [Date32](../data-types/date32.md) 数据类型。如果值超出取值范围，`toDate32OrDefault` 会返回 [Date32](../data-types/date32.md) 支持的下边界值。如果参数的类型是 [Date](../data-types/date.md)，则会同时考虑该类型的取值边界。当接收到无效参数时，返回默认值。

**语法**

```sql
toDate32OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时返回的默认值。[`Date32`](/sql-reference/data-types/date32)

**返回值**

如果解析成功，则返回 Date32 类型的值；否则，如果传入了默认值则返回该默认值，如果未传入则返回 1900-01-01。[`Date32`](/sql-reference/data-types/date32)

**示例**

**成功的转换**

```sql title=Query
SELECT toDate32OrDefault('1930-01-01', toDate32('2020-01-01'))
```

```response title=Response
1930-01-01
```

**转换失败**

```sql title=Query
SELECT toDate32OrDefault('xx1930-01-01', toDate32('2020-01-01'))
```

```response title=Response
2020-01-01
```


## toDate32OrNull {#toDate32OrNull}

引入版本：v21.9

将输入值转换为 `Date32` 类型的值，但在传入无效参数时返回 `NULL`。
与 [`toDate32`](#toDate32) 相同，只是当传入无效参数时返回 `NULL`。

**语法**

```sql
toDate32OrNull(x)
```

**参数**

* `x` — 日期的字符串形式。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回一个 Date32 值，否则返回 `NULL`。[`Date32`](/sql-reference/data-types/date32) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=Query
SELECT toDate32OrNull('2025-01-01'), toDate32OrNull('invalid')
```

```response title=Response
┌─toDate32OrNull('2025-01-01')─┬─toDate32OrNull('invalid')─┐
│                   2025-01-01 │                      ᴺᵁᴸᴸ │
└──────────────────────────────┴───────────────────────────┘
```


## toDate32OrZero {#toDate32OrZero}

引入于：v21.9

将输入值转换为 [Date32](../data-types/date32.md) 类型的值，但在接收到无效参数时返回 [Date32](../data-types/date32.md) 的下限值。
与 [toDate32](#toDate32) 相同，但在接收到无效参数时返回 [Date32](../data-types/date32.md) 的下限值。

另请参阅：

* [`toDate32`](#toDate32)
* [`toDate32OrNull`](#toDate32OrNull)
* [`toDate32OrDefault`](#toDate32OrDefault)

**语法**

```sql
toDate32OrZero(x)
```

**参数**

* `x` — 日期的字符串形式。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回一个 Date32 值，否则返回 Date32 的下界值（`1900-01-01`）。[`Date32`](/sql-reference/data-types/date32)

**示例**

**用法示例**

```sql title=Query
SELECT toDate32OrZero('2025-01-01'), toDate32OrZero('')
```

```response title=Response
┌─toDate32OrZero('2025-01-01')─┬─toDate32OrZero('')─┐
│                   2025-01-01 │         1900-01-01 │
└──────────────────────────────┴────────────────────┘
```


## toDateOrDefault {#toDateOrDefault}

自 v21.11 引入

类似于 [toDate](#toDate)，但在转换失败时，会返回一个默认值：如果指定了第二个参数，则返回该参数的值；否则返回 [Date](../data-types/date.md) 的下界。

**语法**

```sql
toDateOrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时要返回的默认值。[`Date`](/sql-reference/data-types/date)

**返回值**

成功时返回类型为 Date 的值；否则，如果传入了默认值则返回该默认值，未传入时返回 1970-01-01。[`Date`](/sql-reference/data-types/date)

**示例**

**转换成功**

```sql title=Query
SELECT toDateOrDefault('2022-12-30')
```

```response title=Response
2022-12-30
```

**转换失败**

```sql title=Query
SELECT toDateOrDefault('', CAST('2023-01-01', 'Date'))
```

```response title=Response
2023-01-01
```


## toDateOrNull {#toDateOrNull}

引入版本：v1.1

将输入值转换为 `Date` 类型的值，但在传入无效参数时返回 `NULL`。
与 [`toDate`](#toDate) 相同，但在传入无效参数时返回 `NULL`。

**语法**

```sql
toDateOrNull(x)
```

**参数**

* `x` — 日期的字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回一个 Date 类型的值，否则返回 `NULL`。[`Date`](/sql-reference/data-types/date) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT toDateOrNull('2025-12-30'), toDateOrNull('invalid')
```

```response title=Response
┌─toDateOrNull('2025-12-30')─┬─toDateOrNull('invalid')─┐
│                 2025-12-30 │                   ᴺᵁᴸᴸ │
└────────────────────────────┴────────────────────────┘
```


## toDateOrZero {#toDateOrZero}

引入版本：v1.1

将输入值转换为 [`Date`](../data-types/date.md) 类型的值，但在接收到无效参数时返回 [`Date`](../data-types/date.md) 的下界值。
与 [toDate](#todate) 相同，但在接收到无效参数时会返回 [`Date`](../data-types/date.md) 的下界值。

另请参阅：

* [`toDate`](#toDate)
* [`toDateOrNull`](#toDateOrNull)
* [`toDateOrDefault`](#toDateOrDefault)

**语法**

```sql
toDateOrZero(x)
```

**参数**

* `x` — 日期的字符串表示。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回一个 Date 类型的值，否则返回 Date 类型的下界值（`1970-01-01`）。[`Date`](/sql-reference/data-types/date)

**示例**

**用法示例**

```sql title=Query
SELECT toDateOrZero('2025-12-30'), toDateOrZero('')
```

```response title=Response
┌─toDateOrZero('2025-12-30')─┬─toDateOrZero('')─┐
│                 2025-12-30 │       1970-01-01 │
└────────────────────────────┴──────────────────┘
```


## toDateTime {#toDateTime}

引入于：v1.1

将输入值转换为 [DateTime](../data-types/datetime.md) 类型。

:::note
如果 `expr` 是数字，则将其解释为自 Unix 纪元（Unix Epoch）开始以来经过的秒数（即 Unix 时间戳）。
如果 `expr` 是 [String](../data-types/string.md)，则可能被解释为 Unix 时间戳，或者是日期/日期时间的字符串表示。
因此，由于存在歧义，明确禁用了对长度较短的数字字符串（最多 4 位）的解析，例如字符串 `'1999'` 既可以表示年份（不完整的 Date / DateTime 字符串表示），也可以表示 Unix 时间戳。而长度更长的数字字符串是允许的。
:::

**语法**

```sql
toDateTime(expr[, time_zone])
```

**参数**

* `expr` — 值。[`String`](/sql-reference/data-types/string) 或 [`Int`](/sql-reference/data-types/int-uint) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime)
* `time_zone` — 时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回日期时间值。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**用法示例**

```sql title=Query
SELECT toDateTime('2025-01-01 00:00:00'), toDateTime(1735689600, 'UTC')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toDateTime('2025-01-01 00:00:00'): 2025-01-01 00:00:00
toDateTime(1735689600, 'UTC'):     2025-01-01 00:00:00
```


## toDateTime32 {#toDateTime32}

引入于：v20.9

将输入值转换为 `DateTime` 类型。
支持从 `String`、`FixedString`、`Date`、`Date32`、`DateTime` 或数值类型（`(U)Int*`、`Float*`、`Decimal`）进行转换。
与 `DateTime` 相比，DateTime32 提供了更大的取值范围，支持从 `1900-01-01` 到 `2299-12-31` 的日期。

**语法**

```sql
toDateTime32(x[, timezone])
```

**参数**

* `x` — 要转换的输入值。[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring) 或 [`UInt*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64)
* `timezone` — 可选。用于返回的 `DateTime` 值的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回转换后的值。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**值在有效范围内**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('20255-01-01 00:00:00.000', 3))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

**以指定精度的小数形式**

```sql title=Query
SELECT toDateTime64(1735689600.000, 3) AS value, toTypeName(value);
-- without the decimal point the value is still treated as Unix Timestamp in seconds
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64(1735689600.000, 3))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

**带时区**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```


## toDateTime64 {#toDateTime64}

引入版本：v20.1

将输入值转换为 [`DateTime64`](../data-types/datetime64.md) 类型的值。

**语法**

```sql
toDateTime64(expr, scale[, timezone])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `scale` — 刻度（精度）：10^(-scale) 秒。[`UInt8`](/sql-reference/data-types/int-uint)
* `timezone` — 可选。指定的 `DateTime64` 对象所使用的时区。[`String`](/sql-reference/data-types/string)

**返回值**

返回具有亚秒级精度的日历日期和时间。[`DateTime64`](/sql-reference/data-types/datetime64)

**示例**

**值在范围内时**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('2025-01-01 00:00:00.000', 3))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

**作为指定精度的 Decimal**

```sql title=Query
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
-- Without the decimal point the value is still treated as Unix Timestamp in seconds
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```

**含时区**

```sql title=Query
SELECT toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response title=Response
┌───────────────────value─┬─toTypeName(toDateTime64('2025-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2025-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```


## toDateTime64OrDefault {#toDateTime64OrDefault}

自 v21.11 引入

与 [toDateTime64](#todatetime64) 类似，此函数将输入值转换为 [DateTime64](../data-types/datetime64.md) 类型的值，
但在收到无效参数时，会返回 [DateTime64](../data-types/datetime64.md) 的默认值
或调用方提供的默认值。

**语法**

```sql
toDateTime64OrDefault(expr, scale[, timezone, default])
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `scale` — 刻度大小（精度）：10^-precision 秒。[`UInt8`](/sql-reference/data-types/int-uint)
* `timezone` — 可选。时区。[`String`](/sql-reference/data-types/string)
* `default` — 可选。解析失败时返回的默认值。[`DateTime64`](/sql-reference/data-types/datetime64)

**返回值**

如果转换成功，则返回 `DateTime64` 类型的值；否则在提供默认值时返回该默认值，未提供时返回 1970-01-01 00:00:00.000。[`DateTime64`](/sql-reference/data-types/datetime64)

**示例**

**转换成功**

```sql title=Query
SELECT toDateTime64OrDefault('1976-10-18 00:00:00.30', 3)
```

```response title=Response
1976-10-18 00:00:00.300
```

**转换失败**

```sql title=Query
SELECT toDateTime64OrDefault('1976-10-18 00:00:00 30', 3, 'UTC', toDateTime64('2001-01-01 00:00:00.00',3))
```

```response title=Response
2000-12-31 23:00:00.000
```


## toDateTime64OrNull {#toDateTime64OrNull}

引入于：v20.1

将输入值转换为 `DateTime64` 类型的值，但在传入无效参数时返回 `NULL`。
与 `toDateTime64` 相同，但在传入无效参数时返回 `NULL`。

**语法**

```sql
toDateTime64OrNull(x)
```

**参数**

* `x` — 包含日期、时间且具有子秒精度的字符串表示。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回一个 DateTime64 值，否则返回 `NULL`。[`DateTime64`](/sql-reference/data-types/datetime64) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT toDateTime64OrNull('2025-12-30 13:44:17.123'), toDateTime64OrNull('invalid')
```

```response title=Response
┌─toDateTime64OrNull('2025-12-30 13:44:17.123')─┬─toDateTime64OrNull('invalid')─┐
│                         2025-12-30 13:44:17.123 │                          ᴺᵁᴸᴸ │
└─────────────────────────────────────────────────┴───────────────────────────────┘
```


## toDateTime64OrZero {#toDateTime64OrZero}

自 v20.1 引入

将输入值转换为 [DateTime64](../data-types/datetime64.md) 类型的值，但如果接收到无效参数，则返回 [DateTime64](../data-types/datetime64.md) 的下界值。
与 [toDateTime64](#todatetime64) 相同，但如果接收到无效参数，则返回 [DateTime64](../data-types/datetime64.md) 的下界值。

另请参阅：

* [toDateTime64](#toDateTime64)。
* [toDateTime64OrNull](#toDateTime64OrNull)。
* [toDateTime64OrDefault](#toDateTime64OrDefault)。

**语法**

```sql
toDateTime64OrZero(x)
```

**参数**

* `x` — 具有时间和子秒级精度的日期的字符串表示。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回 DateTime64 值，否则返回 DateTime64 的下界（`1970-01-01 00:00:00.000`）。[`DateTime64`](/sql-reference/data-types/datetime64)

**示例**

**用法示例**

```sql title=Query
SELECT toDateTime64OrZero('2025-12-30 13:44:17.123'), toDateTime64OrZero('invalid')
```

```response title=Response
┌─toDateTime64OrZero('2025-12-30 13:44:17.123')─┬─toDateTime64OrZero('invalid')─┐
│                         2025-12-30 13:44:17.123 │             1970-01-01 00:00:00.000 │
└─────────────────────────────────────────────────┴─────────────────────────────────────┘
```


## toDateTimeOrDefault {#toDateTimeOrDefault}

引入版本：v21.11

与 [toDateTime](#todatetime) 类似，但在解析失败时会返回一个默认值。该默认值要么是第三个参数（如果指定），否则为 [DateTime](../data-types/datetime.md) 的下边界值。

**语法**

```sql
toDateTimeOrDefault(expr[, timezone, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `timezone` — 可选。时区。[`String`](/sql-reference/data-types/string)
* `default` — 可选。解析失败时返回的默认值。[`DateTime`](/sql-reference/data-types/datetime)

**返回值**

如果解析成功，则返回 `DateTime` 类型的值；否则，如果传入了默认值则返回该默认值，未传入则返回 1970-01-01 00:00:00。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**转换成功**

```sql title=Query
SELECT toDateTimeOrDefault('2022-12-30 13:44:17')
```

```response title=Response
2022-12-30 13:44:17
```

**转换失败**

```sql title=Query
SELECT toDateTimeOrDefault('', 'UTC', CAST('2023-01-01', 'DateTime(\'UTC\')'))
```

```response title=Response
2023-01-01 00:00:00
```


## toDateTimeOrNull {#toDateTimeOrNull}

引入于：v1.1

将输入值转换为 `DateTime` 类型的值，但在传入无效参数时返回 `NULL`。
与 [`toDateTime`](#toDateTime) 相同，但在传入无效参数时返回 `NULL`。

**语法**

```sql
toDateTimeOrNull(x)
```

**参数**

* `x` — 包含时间的日期字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

如果解析成功，则返回一个 `DateTime` 值，否则返回 `NULL`。[`DateTime`](/sql-reference/data-types/datetime) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=Query
SELECT toDateTimeOrNull('2025-12-30 13:44:17'), toDateTimeOrNull('invalid')
```

```response title=Response
┌─toDateTimeOrNull('2025-12-30 13:44:17')─┬─toDateTimeOrNull('invalid')─┐
│                     2025-12-30 13:44:17 │                        ᴺᵁᴸᴸ │
└─────────────────────────────────────────┴─────────────────────────────┘
```


## toDateTimeOrZero {#toDateTimeOrZero}

自 v1.1 起提供

将输入值转换为 [DateTime](../data-types/datetime.md) 类型的值，但在接收到无效参数时返回 [DateTime](../data-types/datetime.md) 的最小值。
与 [toDateTime](#todatetime) 相同，但在接收到无效参数时返回 [DateTime](../data-types/datetime.md) 的最小值。

**语法**

```sql
toDateTimeOrZero(x)
```

**参数**

* `x` — 含时间部分的日期字符串表示。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回一个 DateTime 值，否则返回 DateTime 的下限（`1970-01-01 00:00:00`）。[`DateTime`](/sql-reference/data-types/datetime)

**示例**

**使用示例**

```sql title=Query
SELECT toDateTimeOrZero('2025-12-30 13:44:17'), toDateTimeOrZero('invalid')
```

```response title=Response
┌─toDateTimeOrZero('2025-12-30 13:44:17')─┬─toDateTimeOrZero('invalid')─┐
│                     2025-12-30 13:44:17 │         1970-01-01 00:00:00 │
└─────────────────────────────────────────┴─────────────────────────────┘
```


## toDecimal128 {#toDecimal128}

引入于：v18.12

将输入值转换为类型为 [`Decimal(38, S)`](../data-types/decimal.md) 且 scale 为 `S` 的值。
在发生错误时抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值或其字符串表示。

不支持的参数：

* 取值为 `NaN` 和 `Inf`（不区分大小写）的 Float* 值或其字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal128('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal128` 的范围：`(-1*10^(38 - S), 1*10^(38 - S))`，可能会发生溢出。
小数部分中多余的数字会被丢弃（不会四舍五入）。
整数部分中多余的数字将导致异常。
:::

:::warning
在处理 Float32/Float64 输入时，由于运算是使用浮点指令完成的，转换会丢弃多余的数字，并可能产生非预期结果。
例如：`toDecimal128(1.15, 2)` 等于 `1.14`，因为在浮点数中 1.15 * 100 的结果是 114.99。
可以使用字符串（String）输入，使运算基于底层整数类型：`toDecimal128('1.15', 2) = 1.15`
:::

**语法**

```sql
toDecimal128(expr, S)
```

**参数**

* `expr` — 返回一个数字或数字字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 介于 0 和 38 之间的刻度（scale）参数，用于指定数字小数部分的位数上限。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

返回类型为 `Decimal(38, S)` 的值。[`Decimal128(S)`](/sql-reference/data-types/decimal)

**示例**

**使用示例**

```sql title=Query
SELECT
    toDecimal128(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal128(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal128('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      99
type_a: Decimal(38, 1)
b:      99.67
type_b: Decimal(38, 2)
c:      99.67
type_c: Decimal(38, 3)
```


## toDecimal128OrDefault {#toDecimal128OrDefault}

引入版本：v21.11

与 [`toDecimal128`](#toDecimal128) 类似，此函数将输入值转换为类型为 [Decimal(38, S)](../data-types/decimal.md) 的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**参数**

* `expr` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)
* `S` — 取值范围为 0 到 38 的 scale 参数，用于指定数值小数部分最多可以包含的位数。[`UInt8`](/sql-reference/data-types/int-uint)
* `default` — 可选。解析为 Decimal128(S) 类型失败时要返回的默认值。[`Decimal128(S)`](/sql-reference/data-types/decimal)

**返回值**

成功时返回 Decimal(38, S) 类型的值；否则如果传入了默认值则返回该默认值，如果未传入默认值则返回 0。[`Decimal128(S)`](/sql-reference/data-types/decimal)

**示例**

**转换成功**

```sql title=Query
SELECT toDecimal128OrDefault(toString(1/42), 18)
```

```response title=Response
0.023809523809523808
```

**转换失败**

```sql title=Query
SELECT toDecimal128OrDefault('Inf', 0, CAST('-1', 'Decimal128(0)'))
```

```response title=Response
-1
```


## toDecimal128OrNull {#toDecimal128OrNull}

引入于：v20.1

将输入值转换为 [`Decimal(38, S)`](../data-types/decimal.md) 类型的值，但在出错时返回 `NULL`。
类似于 [`toDecimal128`](#toDecimal128)，但在转换出错时返回 `NULL`，而不是抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示形式。
* 类型为 Float* 的值或其字符串表示形式。

不支持的参数（返回 `NULL`）：

* Float* 值 `NaN` 和 `Inf` 的值或其字符串表示形式（不区分大小写）。
* 二进制和十六进制值的字符串表示形式。
* 超出 `Decimal128` 范围的值：`(-1*10^(38 - S), 1*10^(38 - S))`。

另请参阅：

* [`toDecimal128`](#toDecimal128)。
* [`toDecimal128OrZero`](#toDecimal128OrZero)。
* [`toDecimal128OrDefault`](#toDecimal128OrDefault)。

**语法**

```sql
toDecimal128OrNull(expr, S)
```

**参数**

* `expr` — 返回数值或数值字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 介于 0 和 38 之间的标度（scale）参数，用于指定数字小数部分可以包含的位数。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

成功时返回 Decimal(38, S) 值，否则返回 `NULL`。[`Decimal128(S)`](/sql-reference/data-types/decimal) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT toDecimal128OrNull('42.7', 2), toDecimal128OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal128OrNull('42.7', 2)─┬─toDecimal128OrNull('invalid', 2)─┐
│                         42.70 │                             ᴺᵁᴸᴸ │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal128OrZero {#toDecimal128OrZero}

引入版本：v20.1

将输入值转换为 [Decimal(38, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回 `0`。
类似于 [`toDecimal128`](#todecimal128)，但在转换出错时返回 `0`，而不是抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值或其字符串表示。

不支持的参数（返回 `0`）：

* 类型为 Float* 的 `NaN` 和 `Inf` 值或其字符串表示（不区分大小写）。
* 二进制值和十六进制值的字符串表示。

:::note
如果输入值超出 `Decimal128` 的范围：`(-1*10^(38 - S), 1*10^(38 - S))`，函数返回 `0`。
:::

**语法**

```sql
toDecimal128OrZero(expr, S)
```

**参数**

* `expr` — 返回数值或其字符串表示的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 取值范围为 0 到 38 的 scale 参数，用于指定数值小数部分最多可以有多少位数字。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

成功时返回一个 Decimal(38, S) 值，否则返回 `0`。[`Decimal128(S)`](/sql-reference/data-types/decimal)

**示例**

**基本用法**

```sql title=Query
SELECT toDecimal128OrZero('42.7', 2), toDecimal128OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal128OrZero('42.7', 2)─┬─toDecimal128OrZero('invalid', 2)─┐
│                         42.70 │                             0.00 │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal256 {#toDecimal256}

引入版本：v20.8

将输入值转换为 [`Decimal(76, S)`](../data-types/decimal.md) 类型、scale 为 `S` 的值。若发生错误则抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值或其字符串表示。

不支持的参数：

* 取值为 `NaN` 和 `Inf`（不区分大小写）的 Float* 值或其字符串表示。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal256('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal256` 的边界 `(-1*10^(76 - S), 1*10^(76 - S))`，则可能发生溢出。
小数部分中过多的数字会被丢弃（不会四舍五入）。
整数部分中过多的数字将导致异常。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃额外的数字，并且由于操作是通过浮点指令完成的，可能会以意料之外的方式工作。
例如：`toDecimal256(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 等于 114.99。
可以使用 String 类型的输入，此时运算将使用底层的整数类型：`toDecimal256('1.15', 2) = 1.15`
:::

**语法**

```sql
toDecimal256(expr, S)
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 取值在 0 到 76 之间的 scale 参数，用于指定数字小数部分最多可以有多少位。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

返回类型为 `Decimal(76, S)` 的值。[`Decimal256(S)`](/sql-reference/data-types/decimal)

**示例**

**用法示例**

```sql title=Query
SELECT
    toDecimal256(99, 1) AS a, toTypeName(a) AS type_a,
    toDecimal256(99.67, 2) AS b, toTypeName(b) AS type_b,
    toDecimal256('99.67', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      99
type_a: Decimal(76, 1)
b:      99.67
type_b: Decimal(76, 2)
c:      99.67
type_c: Decimal(76, 3)
```


## toDecimal256OrDefault {#toDecimal256OrDefault}

自 v21.11 起引入

与 [`toDecimal256`](#toDecimal256) 类似，此函数将输入值转换为 [Decimal(76, S)](../data-types/decimal.md) 类型的值，但在出错时返回默认值。

**语法**

```sql
toDecimal256OrDefault(expr, S[, default])
```

**参数**

* `expr` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)
* `S` — 介于 0 和 76 之间的 scale 参数，指定数字小数部分最多可以有多少位。[`UInt8`](/sql-reference/data-types/int-uint)
* `default` — 可选。解析为 Decimal256(S) 类型失败时返回的默认值。[`Decimal256(S)`](/sql-reference/data-types/decimal)

**返回值**

成功时返回类型为 Decimal(76, S) 的值，否则如果传入了默认值则返回该默认值，未传入则返回 0。[`Decimal256(S)`](/sql-reference/data-types/decimal)

**示例**

**转换成功**

```sql title=Query
SELECT toDecimal256OrDefault(toString(1/42), 76)
```

```response title=Response
0.023809523809523808
```

**转换失败**

```sql title=Query
SELECT toDecimal256OrDefault('Inf', 0, CAST('-1', 'Decimal256(0)'))
```

```response title=Response
-1
```


## toDecimal256OrNull {#toDecimal256OrNull}

引入版本：v20.8

将输入值转换为 [`Decimal(76, S)`](../data-types/decimal.md) 类型的值，但在出错时返回 `NULL`。
类似于 [`toDecimal256`](#toDecimal256)，但在转换出错时返回 `NULL`，而不是抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示形式。
* 类型为 Float* 的值或其字符串表示形式。

不支持的参数（返回 `NULL`）：

* Float* 值 `NaN` 和 `Inf`（大小写不敏感）的值或字符串表示形式。
* 二进制和十六进制值的字符串表示形式。
* 超出 `Decimal256` 边界的值：`(-1 * 10^(76 - S), 1 * 10^(76 - S))`。

参见：

* [`toDecimal256`](#toDecimal256)。
* [`toDecimal256OrZero`](#toDecimal256OrZero)。
* [`toDecimal256OrDefault`](#toDecimal256OrDefault)。

**语法**

```sql
toDecimal256OrNull(expr, S)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 介于 0 和 76 之间的 scale 参数，用于指定数字的小数部分最多可以有多少位。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

转换成功时返回一个 Decimal(76, S) 值，否则返回 `NULL`。[`Decimal256(S)`](/sql-reference/data-types/decimal) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT toDecimal256OrNull('42.7', 2), toDecimal256OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal256OrNull('42.7', 2)─┬─toDecimal256OrNull('invalid', 2)─┐
│                         42.70 │                             ᴺᵁᴸᴸ │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal256OrZero {#toDecimal256OrZero}

引入于：v20.8

将输入值转换为类型为 [Decimal(76, S)](../data-types/decimal.md) 的值，但在出错时返回 `0`。
类似于 [`toDecimal256`](#todecimal256)，但在转换出错时返回 `0`，而不是抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值或其字符串表示。

不支持的参数（返回 `0`）：

* Float* 类型的 `NaN` 和 `Inf` 值或其字符串表示（不区分大小写）。
* 二进制值和十六进制值的字符串表示。

:::note
如果输入值超出 `Decimal256` 的范围：`(-1*10^(76 - S), 1*10^(76 - S))`，则函数返回 `0`。
:::

另请参阅：

* [`toDecimal256`](#toDecimal256)。
* [`toDecimal256OrNull`](#toDecimal256OrNull)。
* [`toDecimal256OrDefault`](#toDecimal256OrDefault)。

**语法**

```sql
toDecimal256OrZero(expr, S)
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 介于 0 到 76 之间的 scale 参数，用于指定数字小数部分可以包含的位数。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

成功时返回 Decimal(76, S) 类型的值，否则返回 `0`。[`Decimal256(S)`](/sql-reference/data-types/decimal)

**示例**

**用法示例**

```sql title=Query
SELECT toDecimal256OrZero('42.7', 2), toDecimal256OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal256OrZero('42.7', 2)─┬─toDecimal256OrZero('invalid', 2)─┐
│                         42.70 │                             0.00 │
└───────────────────────────────┴──────────────────────────────────┘
```


## toDecimal32 {#toDecimal32}

引入于：v18.12

将输入值转换为 [`Decimal(9, S)`](../data-types/decimal.md) 类型、标度为 `S` 的值。若发生错误则抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值或其字符串表示。

不支持的参数：

* 值或字符串表示为 Float* 的 `NaN` 和 `Inf`（不区分大小写）。
* 二进制和十六进制值的字符串表示，例如：`SELECT toDecimal32('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal32` 的范围：`(-1*10^(9 - S), 1*10^(9 - S))`，则可能发生溢出。
小数部分多余的数字会被丢弃（不会四舍五入）。
整数部分多余的数字会导致抛出异常。
:::

:::warning
当使用 Float32/Float64 作为输入时，由于运算是通过浮点指令执行的，转换会丢弃多余的数字，并且可能出现非预期的行为。
例如：`toDecimal32(1.15, 2)` 等于 `1.14`，因为在浮点数中 1.15 * 100 等于 114.99。
可以使用 String 作为输入，以便运算基于底层整数类型：`toDecimal32('1.15', 2) = 1.15`
:::

**语法**

```sql
toDecimal32(expr, S)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 介于 0 和 9 之间的标度参数，指定数字小数部分可以包含的位数。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

返回类型为 `Decimal(9, S)` 的值。[`Decimal32(S)`](/sql-reference/data-types/decimal)

**示例**

**用法示例**

```sql title=Query
SELECT
    toDecimal32(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal32(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal32('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      2
type_a: Decimal(9, 1)
b:      4.2
type_b: Decimal(9, 2)
c:      4.2
type_c: Decimal(9, 3)
```


## toDecimal32OrDefault {#toDecimal32OrDefault}

自 v21.11 引入

与 [`toDecimal32`](#toDecimal32) 类似，此函数将输入值转换为 [Decimal(9, S)](../data-types/decimal.md) 类型的值，但在出错时返回默认值。

**语法**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**参数**

* `expr` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)
* `S` — 介于 0 和 9 之间的小数位数参数，指定数字小数部分最多可以有多少位。[`UInt8`](/sql-reference/data-types/int-uint)
* `default` — 可选。如果解析为 Decimal32(S) 类型失败，返回的默认值。[`Decimal32(S)`](/sql-reference/data-types/decimal)

**返回值**

解析成功时返回类型为 Decimal(9, S) 的值，否则返回传入的默认值；如果未传入默认值，则返回 0。[`Decimal32(S)`](/sql-reference/data-types/decimal)

**示例**

**转换成功**

```sql title=Query
SELECT toDecimal32OrDefault(toString(0.0001), 5)
```

```response title=Response
0.0001
```

**转换失败**

```sql title=Query
SELECT toDecimal32OrDefault('Inf', 0, CAST('-1', 'Decimal32(0)'))
```

```response title=Response
-1
```


## toDecimal32OrNull {#toDecimal32OrNull}

自 v20.1 起引入

将输入值转换为 [`Decimal(9, S)`](../data-types/decimal.md) 类型的值，但在出错时返回 `NULL`。
与 [`toDecimal32`](#toDecimal32) 类似，但在转换出错时返回 `NULL`，而不是抛出异常。

支持的参数：

* (U)Int* 类型的值或其字符串表示。
* Float* 类型的值或其字符串表示。

不支持的参数（返回 `NULL`）：

* Float* 类型的 `NaN` 和 `Inf` 值或其字符串表示（不区分大小写）。
* 二进制和十六进制值的字符串表示。
* 超出 `Decimal32` 范围的值：`(-1*10^(9 - S), 1*10^(9 - S))`。

另请参阅：

* [`toDecimal32`](#toDecimal32)。
* [`toDecimal32OrZero`](#toDecimal32OrZero)。
* [`toDecimal32OrDefault`](#toDecimal32OrDefault)。

**语法**

```sql
toDecimal32OrNull(expr, S)
```

**参数**

* `expr` — 返回数值或数值字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 介于 0 到 9 之间的刻度参数，指定数字小数部分可以具有的位数。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

成功时返回一个 Decimal(9, S) 值，否则返回 `NULL`。[`Decimal32(S)`](/sql-reference/data-types/decimal) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=Query
SELECT toDecimal32OrNull('42.7', 2), toDecimal32OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal32OrNull('42.7', 2)─┬─toDecimal32OrNull('invalid', 2)─┐
│                        42.70 │                            ᴺᵁᴸᴸ │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimal32OrZero {#toDecimal32OrZero}

引入于：v20.1

将输入值转换为类型为 [Decimal(9, S)](../data-types/decimal.md) 的值，但在出错时返回 `0`。
类似于 [`toDecimal32`](#todecimal32)，但在转换出错时返回 `0`，而不是抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值或其字符串表示。

不支持的参数（返回 `0`）：

* 类型为 Float* 的 `NaN` 和 `Inf` 值或其字符串表示（不区分大小写）。
* 二进制和十六进制值的字符串表示。

:::note
如果输入值超出 `Decimal32` 的范围：`(-1*10^(9 - S), 1*10^(9 - S))`，则函数返回 `0`。
:::

**语法**

```sql
toDecimal32OrZero(expr, S)
```

**参数**

* `expr` — 返回一个数字或数字的字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 介于 0 和 9 之间的 scale 参数，用于指定数值小数部分的位数。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

转换成功时返回 `Decimal(9, S)` 值，否则返回 `0`。[`Decimal32(S)`](/sql-reference/data-types/decimal)

**示例**

**用法示例**

```sql title=Query
SELECT toDecimal32OrZero('42.7', 2), toDecimal32OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal32OrZero('42.7', 2)─┬─toDecimal32OrZero('invalid', 2)─┐
│                        42.70 │                            0.00 │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimal64 {#toDecimal64}

引入于：v18.12

将输入值转换为类型为 [`Decimal(18, S)`](../data-types/decimal.md)、小数位数为 `S` 的值。
在发生错误时抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值或其字符串表示。

不支持的参数：

* Float* 类型中的 `NaN` 和 `Inf` 值及其字符串表示（不区分大小写）。
* 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal64('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出 `Decimal64` 的范围：`(-1*10^(18 - S), 1*10^(18 - S))`，则可能发生溢出。
小数部分中过多的数字会被丢弃（不进行四舍五入）。
整数部分中过多的数字将导致异常。
:::

:::warning
在处理 Float32/Float64 输入时，由于转换操作是使用浮点指令执行的，会丢弃额外的数位，并且在实际行为上可能与预期不符。
例如：`toDecimal64(1.15, 2)` 等于 `1.14`，因为在浮点运算中 1.15 * 100 的结果是 114.99。
你可以使用 String 输入，以便这些操作使用底层的整数类型：`toDecimal64('1.15', 2) = 1.15`
:::

**语法**

```sql
toDecimal64(expr, S)
```

**参数**

* `expr` — 返回数值或其字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 介于 0 到 18 之间的刻度参数，用于指定数值小数部分可以包含的位数。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

返回一个 Decimal 值。[`Decimal(18, S)`](/sql-reference/data-types/decimal)

**示例**

**用法示例**

```sql title=Query
SELECT
    toDecimal64(2, 1) AS a, toTypeName(a) AS type_a,
    toDecimal64(4.2, 2) AS b, toTypeName(b) AS type_b,
    toDecimal64('4.2', 3) AS c, toTypeName(c) AS type_c
FORMAT Vertical
```

```response title=Response
Row 1:
──────
a:      2.0
type_a: Decimal(18, 1)
b:      4.20
type_b: Decimal(18, 2)
c:      4.200
type_c: Decimal(18, 3)
```


## toDecimal64OrDefault {#toDecimal64OrDefault}

自 v21.11 起提供

与 [`toDecimal64`](#toDecimal64) 类似，此函数将输入值转换为类型为 [Decimal(18, S)](../data-types/decimal.md) 的值，但在出错时返回默认值。

**语法**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**参数**

* `expr` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)
* `S` — 介于 0 和 18 之间的小数位数参数，指定数字小数部分最多可以包含的位数。[`UInt8`](/sql-reference/data-types/int-uint)
* `default` — 可选。将值解析为 Decimal64(S) 类型失败时返回的默认值。[`Decimal64(S)`](/sql-reference/data-types/decimal)

**返回值**

解析成功时返回类型为 Decimal(18, S) 的值；否则，如果传入了默认值则返回该默认值，否则返回 0。[`Decimal64(S)`](/sql-reference/data-types/decimal)

**示例**

**成功转换**

```sql title=Query
SELECT toDecimal64OrDefault(toString(0.0001), 18)
```

```response title=Response
0.0001
```

**转换失败**

```sql title=Query
SELECT toDecimal64OrDefault('Inf', 0, CAST('-1', 'Decimal64(0)'))
```

```response title=Response
-1
```


## toDecimal64OrNull {#toDecimal64OrNull}

引入自：v20.1

将输入值转换为类型为 [Decimal(18, S)](../data-types/decimal.md) 的值，但在出错时返回 `NULL`。
类似于 [`toDecimal64`](#todecimal64)，但在转换出错时返回 `NULL` 而不是抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值或其字符串表示。

不支持的参数（返回 `NULL`）：

* Float* 类型值 `NaN` 和 `Inf`（不区分大小写）或其字符串表示。
* 二进制和十六进制值的字符串表示。
* 超出 `Decimal64` 范围的值：`(-1*10^(18 - S), 1*10^(18 - S))`。

另请参阅：

* [`toDecimal64`](#toDecimal64)。
* [`toDecimal64OrZero`](#toDecimal64OrZero)。
* [`toDecimal64OrDefault`](#toDecimal64OrDefault)。

**语法**

```sql
toDecimal64OrNull(expr, S)
```

**参数**

* `expr` — 返回数字或其字符串形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 介于 0 到 18 之间的小数位精度参数，用于指定数字小数部分最多可以有多少位数字。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

成功时返回一个 Decimal(18, S) 值，否则返回 `NULL`。[`Decimal64(S)`](/sql-reference/data-types/decimal) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT toDecimal64OrNull('42.7', 2), toDecimal64OrNull('invalid', 2)
```

```response title=Response
┌─toDecimal64OrNull('42.7', 2)─┬─toDecimal64OrNull('invalid', 2)─┐
│                        42.70 │                            ᴺᵁᴸᴸ │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimal64OrZero {#toDecimal64OrZero}

引入于：v20.1

将输入值转换为类型为 [Decimal(18, S)](../data-types/decimal.md) 的值，但在出错时返回 `0`。
类似于 [`toDecimal64`](#todecimal64)，但在转换出错时返回 `0`，而不是抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值或其字符串表示。

不支持的参数（返回 `0`）：

* 值为 `NaN` 和 `Inf`（不区分大小写）的 Float* 值或其字符串表示。
* 二进制值和十六进制值的字符串表示。

:::note
如果输入值超出 `Decimal64` 的范围：`(-1*10^(18 - S), 1*10^(18 - S))`，函数将返回 `0`。
:::

另请参阅：

* [`toDecimal64`](#toDecimal64)。
* [`toDecimal64OrNull`](#toDecimal64OrNull)。
* [`toDecimal64OrDefault`](#toDecimal64OrDefault)。

**语法**

```sql
toDecimal64OrZero(expr, S)
```

**参数**

* `expr` — 返回数值或其字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)
* `S` — 介于 0 和 18 之间的 scale 参数，用于指定数值小数部分的小数位数。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

成功时返回 Decimal(18, S) 类型的值，否则返回 `0`。[`Decimal64(S)`](/sql-reference/data-types/decimal)

**示例**

**用法示例**

```sql title=Query
SELECT toDecimal64OrZero('42.7', 2), toDecimal64OrZero('invalid', 2)
```

```response title=Response
┌─toDecimal64OrZero('42.7', 2)─┬─toDecimal64OrZero('invalid', 2)─┐
│                        42.70 │                            0.00 │
└──────────────────────────────┴─────────────────────────────────┘
```


## toDecimalString {#toDecimalString}

自版本 v 起引入。

返回数字的字符串表示。第一个参数是任意数值类型的数字，第二个参数是期望的小数部分位数。返回 String。

**语法**

```sql
```

**参数**

* 无。

**返回值**

**示例**

**toDecimalString**

```sql title=Query
SELECT toDecimalString(2.1456,2)
```

```response title=Response
```


## toFixedString {#toFixedString}

引入版本：v1.1

将一个 [`String`](/sql-reference/data-types/string) 参数转换为 [`FixedString(N)`](/sql-reference/data-types/fixedstring) 类型（长度固定为 N 的字符串）。

如果字符串的字节数少于 N，则在右侧用空字节进行填充。
如果字符串的字节数多于 N，则会抛出异常。

**语法**

```sql
toFixedString(s, N)
```

**参数**

* `s` — 要转换的字符串。[`String`](/sql-reference/data-types/string)
* `N` — 结果 FixedString 的长度。[`const UInt*`](/sql-reference/data-types/int-uint)

**返回值**

返回长度为 N 的 FixedString。[`FixedString(N)`](/sql-reference/data-types/fixedstring)

**示例**

**用法示例**

```sql title=Query
SELECT toFixedString('foo', 8) AS s;
```

```response title=Response
┌─s─────────────┐
│ foo\0\0\0\0\0 │
└───────────────┘
```


## toFloat32 {#toFloat32}

引入于：v1.1

将输入值转换为 [Float32](/sql-reference/data-types/float) 类型的值。
在出错时抛出异常。

支持的参数：

* 类型为 (U)Int* 的值。
* (U)Int8/16/32/128/256 的字符串形式。
* 类型为 Float* 的值，包括 `NaN` 和 `Inf`。
* Float* 的字符串形式，包括 `NaN` 和 `Inf`（不区分大小写）。

不支持的参数：

* 二进制和十六进制值的字符串形式，例如 `SELECT toFloat32('0xc0fe');`。

另请参阅：

* [`toFloat32OrZero`](#toFloat32OrZero)。
* [`toFloat32OrNull`](#toFloat32OrNull)。
* [`toFloat32OrDefault`](#toFloat32OrDefault)。

**语法**

```sql
toFloat32(expr)
```

**参数**

* `expr` — 一个表达式，返回一个数字或该数字的字符串表示形式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回一个 32 位浮点值。[`Float32`](/sql-reference/data-types/float)

**示例**

**用法示例**

```sql title=Query
SELECT
    toFloat32(42.7),
    toFloat32('42.7'),
    toFloat32('NaN')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat32(42.7):   42.7
toFloat32('42.7'): 42.7
toFloat32('NaN'):  nan
```


## toFloat32OrDefault {#toFloat32OrDefault}

引入版本：v21.11

与 [`toFloat32`](#toFloat32) 类似，此函数会将输入值转换为 [Float32](../data-types/float.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toFloat32OrDefault(expr[, default])
```

**参数**

* `expr` — 结果为数字或数字字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时要返回的默认值。[`Float32`](/sql-reference/data-types/float)

**返回值**

解析成功时返回 `Float32` 类型的值；否则，如果传入了默认值则返回该默认值，如果未传入则返回 0。[`Float32`](/sql-reference/data-types/float)

**示例**

**成功转换**

```sql title=Query
SELECT toFloat32OrDefault('8', CAST('0', 'Float32'))
```

```response title=Response
8
```

**转换失败**

```sql title=Query
SELECT toFloat32OrDefault('abc', CAST('0', 'Float32'))
```

```response title=Response
0
```


## toFloat32OrNull {#toFloat32OrNull}

引入版本：v1.1

将输入值转换为 [Float32](../data-types/float.md) 类型的值，但在出错时返回 `NULL`。
类似于 [`toFloat32`](#toFloat32)，但在转换出错时返回 `NULL`，而不是抛出异常。

支持的参数：

* 类型为 (U)Int* 的值。
* (U)Int8/16/32/128/256 的字符串表示。
* 类型为 Float* 的值，包括 `NaN` 和 `Inf`。
* Float* 的字符串表示，包括 `NaN` 和 `Inf`（不区分大小写）。

不支持的参数（返回 `NULL`）：

* 二进制和十六进制值的字符串表示，例如：`SELECT toFloat32OrNull('0xc0fe');`。
* 无效的字符串格式。

另请参阅：

* [`toFloat32`](#toFloat32)。
* [`toFloat32OrZero`](#toFloat32OrZero)。
* [`toFloat32OrDefault`](#toFloat32OrDefault)。

**语法**

```sql
toFloat32OrNull(x)
```

**参数**

* `x` — 数字的字符串表示。[`String`](/sql-reference/data-types/string)

**返回值**

如果转换成功，返回 32 位浮点数，否则返回 `NULL`。[`Float32`](/sql-reference/data-types/float) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=Query
SELECT
    toFloat32OrNull('42.7'),
    toFloat32OrNull('NaN'),
    toFloat32OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat32OrNull('42.7'): 42.7
toFloat32OrNull('NaN'):  nan
toFloat32OrNull('abc'):  \N
```


## toFloat32OrZero {#toFloat32OrZero}

引入版本：v1.1

将输入值转换为 [Float32](../data-types/float.md) 类型的值，但在发生错误时返回 `0`。
类似于 [`toFloat32`](#tofloat32)，但在转换出错时返回 `0` 而不是抛出异常。

另请参阅：

* [`toFloat32`](#toFloat32)。
* [`toFloat32OrNull`](#toFloat32OrNull)。
* [`toFloat32OrDefault`](#toFloat32OrDefault)。

**语法**

```sql
toFloat32OrZero(x)
```

**参数**

* `x` — 数字的字符串形式。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回 32 位浮点数值，否则返回 `0`。[`Float32`](/sql-reference/data-types/float)

**示例**

**用法示例**

```sql title=Query
SELECT
    toFloat32OrZero('42.7'),
    toFloat32OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat32OrZero('42.7'): 42.7
toFloat32OrZero('abc'):  0
```


## toFloat64 {#toFloat64}

引入于：v1.1

将输入值转换为 [`Float64`](../data-types/float.md) 类型的值。
在发生错误时抛出异常。

支持的参数类型：

* 类型为 (U)Int* 的值。
* (U)Int8/16/32/128/256 的字符串形式。
* 类型为 Float* 的值，包括 `NaN` 和 `Inf`。
* 类型为 Float* 的字符串形式，包括 `NaN` 和 `Inf`（不区分大小写）。

不支持的参数类型：

* 二进制和十六进制值的字符串形式，例如：`SELECT toFloat64('0xc0fe');`。

另请参阅：

* [`toFloat64OrZero`](#toFloat64OrZero)。
* [`toFloat64OrNull`](#toFloat64OrNull)。
* [`toFloat64OrDefault`](#toFloat64OrDefault)。

**语法**

```sql
toFloat64(expr)
```

**参数**

* `expr` — 其结果为数字或数字的字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回 64 位浮点数值。[`Float64`](/sql-reference/data-types/float)

**示例**

**使用示例**

```sql title=Query
SELECT
    toFloat64(42.7),
    toFloat64('42.7'),
    toFloat64('NaN')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat64(42.7):   42.7
toFloat64('42.7'): 42.7
toFloat64('NaN'):  nan
```


## toFloat64OrDefault {#toFloat64OrDefault}

自 v21.11 引入

与 [`toFloat64`](#toFloat64) 类似，此函数将输入值转换为 [Float64](../data-types/float.md) 类型的值，但在出错时返回默认值。
如果未传递 `default` 参数，则在出错时返回 `0`。

**语法**

```sql
toFloat64OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时要返回的默认值。[`Float64`](/sql-reference/data-types/float)

**返回值**

转换成功时返回 `Float64` 类型的值；否则，如果传入了默认值则返回该默认值，否则返回 0。[`Float64`](/sql-reference/data-types/float)

**示例**

**成功的转换**

```sql title=Query
SELECT toFloat64OrDefault('8', CAST('0', 'Float64'))
```

```response title=Response
8
```

**转换失败**

```sql title=Query
SELECT toFloat64OrDefault('abc', CAST('0', 'Float64'))
```

```response title=Response
0
```


## toFloat64OrNull {#toFloat64OrNull}

引入版本：v1.1

将输入值转换为 [Float64](../data-types/float.md) 类型的值，但在发生错误时返回 `NULL`。
类似于 [`toFloat64`](#tofloat64)，但在转换出错时返回 `NULL`，而不是抛出异常。

支持的参数：

* 类型为 (U)Int* 的值。
* (U)Int8/16/32/128/256 的字符串形式。
* 类型为 Float* 的值，包括 `NaN` 和 `Inf`。
* 类型为 Float* 的字符串形式，包括 `NaN` 和 `Inf`（不区分大小写）。

不支持的参数（返回 `NULL`）：

* 二进制和十六进制值的字符串形式，例如 `SELECT toFloat64OrNull('0xc0fe');`。
* 无效的字符串格式。

另请参阅：

* [`toFloat64`](#toFloat64)。
* [`toFloat64OrZero`](#toFloat64OrZero)。
* [`toFloat64OrDefault`](#toFloat64OrDefault)。

**语法**

```sql
toFloat64OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

如果转换成功，返回 64 位浮点数，否则返回 `NULL`。[`Float64`](/sql-reference/data-types/float) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=Query
SELECT
    toFloat64OrNull('42.7'),
    toFloat64OrNull('NaN'),
    toFloat64OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat64OrNull('42.7'): 42.7
toFloat64OrNull('NaN'):  nan
toFloat64OrNull('abc'):  \N
```


## toFloat64OrZero {#toFloat64OrZero}

引入于：v1.1

将输入值转换为 [Float64](../data-types/float.md) 类型的值，但在发生错误时返回 `0`。
其行为类似于 [`toFloat64`](#toFloat64)，但在转换出错时返回 `0`，而不是抛出异常。

另请参阅：

* [`toFloat64`](#toFloat64)。
* [`toFloat64OrNull`](#toFloat64OrNull)。
* [`toFloat64OrDefault`](#toFloat64OrDefault)。

**语法**

```sql
toFloat64OrZero(x)
```

**参数**

* `x` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回 64 位浮点数值，否则返回 `0`。[`Float64`](/sql-reference/data-types/float)

**示例**

**用法示例**

```sql title=Query
SELECT
    toFloat64OrZero('42.7'),
    toFloat64OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toFloat64OrZero('42.7'): 42.7
toFloat64OrZero('abc'):  0
```


## toInt128 {#toInt128}

引入于：v1.1

将输入值转换为 [Int128](/sql-reference/data-types/int-uint) 类型的值。
出错时抛出异常。
该函数采用向零舍入，这意味着会截断数字的小数部分。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值。

不支持的参数：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toInt128('0xc0fe');`。

:::note
如果输入值不能在 Int128 的范围内表示，结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toInt128OrZero`](#toInt128OrZero)。
* [`toInt128OrNull`](#toInt128OrNull)。
* [`toInt128OrDefault`](#toInt128OrDefault)。

**语法**

```sql
toInt128(expr)
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回一个 128 位整数值。[`Int128`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toInt128(-128),
    toInt128(-128.8),
    toInt128('-128')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt128(-128):   -128
toInt128(-128.8): -128
toInt128('-128'): -128
```


## toInt128OrDefault {#toInt128OrDefault}

引入版本：v21.11

与 [`toInt128`](#toInt128) 类似，此函数将输入值转换为 [Int128](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 参数，则在出错时返回 `0`。

**语法**

```sql
toInt128OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数值或其字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时返回的默认值。[`Int128`](/sql-reference/data-types/int-uint)

**返回值**

如果转换成功，则返回 Int128 类型的值；否则，如果提供了默认值则返回该默认值，如果未提供则返回 0。[`Int128`](/sql-reference/data-types/int-uint)

**示例**

**成功转换**

```sql title=Query
SELECT toInt128OrDefault('-128', CAST('-1', 'Int128'))
```

```response title=Response
-128
```

**转换失败**

```sql title=Query
SELECT toInt128OrDefault('abc', CAST('-1', 'Int128'))
```

```response title=Response
-1
```


## toInt128OrNull {#toInt128OrNull}

引入版本：v20.8

与 [`toInt128`](#toInt128) 类似，此函数将输入值转换为 [Int128](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

支持的参数：

* (U)Int* 的字符串表示。

不支持的参数（返回 `NULL`）：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toInt128OrNull('0xc0fe');`。

:::note
如果输入值不能在 [Int128](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

另请参阅：

* [`toInt128`](#toInt128)。
* [`toInt128OrZero`](#toInt128OrZero)。
* [`toInt128OrDefault`](#toInt128OrDefault)。

**语法**

```sql
toInt128OrNull(x)
```

**参数**

* `x` — 数字的 String 类型表示。[`String`](/sql-reference/data-types/string)

**返回值**

返回类型为 Int128 的值，如果转换失败则返回 `NULL`。[`Int128`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt128OrNull('-128'),
    toInt128OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt128OrNull('-128'): -128
toInt128OrNull('abc'):  \N
```


## toInt128OrZero {#toInt128OrZero}

自 v20.8 引入

将输入值转换为 [Int128](/sql-reference/data-types/int-uint) 类型，但在出错时返回 `0`。
类似于 [`toInt128`](#toint128)，但会返回 `0` 而不是抛出异常。

另请参阅：

* [`toInt128`](#toInt128)。
* [`toInt128OrNull`](#toInt128OrNull)。
* [`toInt128OrDefault`](#toInt128OrDefault)。

**语法**

```sql
toInt128OrZero(x)
```

**参数**

* `x` — 要进行转换的输入值，可以是 [`String`](/sql-reference/data-types/string)、[`FixedString`](/sql-reference/data-types/fixedstring)、[`Float*`](/sql-reference/data-types/float)、[`Decimal`](/sql-reference/data-types/decimal)、[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime)。

**返回值**

返回转换后的输入值，如果转换失败则返回 `0`。[`Int128`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT toInt128OrZero('123')
```

```response title=Response
123
```

**转换失败时返回 0**

```sql title=Query
SELECT toInt128OrZero('abc')
```

```response title=Response
0
```


## toInt16 {#toInt16}

引入版本：v1.1

将输入值转换为 [`Int16`](../data-types/int-uint.md) 类型的值。
在发生错误时抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串形式。
* 类型为 Float* 的值。

不支持的参数：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt16('0xc0fe');`。

:::note
如果输入值不能在 [Int16](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
例如：`SELECT toInt16(32768) == -32768;`。
:::

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

另请参阅：

* [`toInt16OrZero`](#toInt16OrZero)。
* [`toInt16OrNull`](#toInt16OrNull)。
* [`toInt16OrDefault`](#toInt16OrDefault)。

**语法**

```sql
toInt16(expr)
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回一个 16 位整数值。[`Int16`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt16(-16),
    toInt16(-16.16),
    toInt16('-16')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt16(-16):    -16
toInt16(-16.16): -16
toInt16('-16'):  -16
```


## toInt16OrDefault {#toInt16OrDefault}

引入于：v21.11

与 [`toInt16`](#toInt16) 类似，此函数将输入值转换为 [Int16](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未指定 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt16OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时要返回的默认值。[`Int16`](/sql-reference/data-types/int-uint)

**返回值**

如果转换成功，则返回 `Int16` 类型的值；否则在传入默认值时返回该默认值，未传入则返回 0。[`Int16`](/sql-reference/data-types/int-uint)

**示例**

**转换成功**

```sql title=Query
SELECT toInt16OrDefault('-16', CAST('-1', 'Int16'))
```

```response title=Response
-16
```

**转换失败**

```sql title=Query
SELECT toInt16OrDefault('abc', CAST('-1', 'Int16'))
```

```response title=Response
-1
```


## toInt16OrNull {#toInt16OrNull}

引入版本：v1.1

与 [`toInt16`](#toInt16) 类似，此函数将输入值转换为 [Int16](../data-types/int-uint.md) 类型的值，但在出错时返回 `NULL`。

支持的参数：

* (U)Int* 的字符串表示。

不支持的参数（返回 `NULL`）：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt16OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int16](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

另请参阅：

* [`toInt16`](#toInt16)。
* [`toInt16OrZero`](#toInt16OrZero)。
* [`toInt16OrDefault`](#toInt16OrDefault)。

**语法**

```sql
toInt16OrNull(x)
```

**参数**

* `x` — 数字的 String 类型表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `Int16` 类型的值；如果转换失败，则返回 `NULL`。[`Int16`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt16OrNull('-16'),
    toInt16OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt16OrNull('-16'): -16
toInt16OrNull('abc'): \N
```


## toInt16OrZero {#toInt16OrZero}

引入版本：v1.1

与 [`toInt16`](#toInt16) 类似，此函数将输入值转换为 [Int16](../data-types/int-uint.md) 类型的值，但在出错时返回 `0`。

支持的参数：

* (U)Int* 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float* 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt16OrZero('0xc0fe');`。

:::note
如果输入值不能在 [Int16](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

另请参阅：

* [`toInt16`](#toInt16)。
* [`toInt16OrNull`](#toInt16OrNull)。
* [`toInt16OrDefault`](#toInt16OrDefault)。

**语法**

```sql
toInt16OrZero(x)
```

**参数**

* `x` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `Int16` 类型的值，如果转换失败则返回 `0`。[`Int16`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt16OrZero('16'),
    toInt16OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt16OrZero('16'): 16
toInt16OrZero('abc'): 0
```


## toInt256 {#toInt256}

引入版本：v1.1

将输入值转换为 [Int256](/sql-reference/data-types/int-uint) 类型的值。
出错时抛出异常。
该函数使用趋零舍入，这意味着会截断数值的小数部分。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值。

不支持的参数：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toInt256('0xc0fe');`。

:::note
如果输入值无法在 Int256 的数值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toInt256OrZero`](#toInt256OrZero)。
* [`toInt256OrNull`](#toInt256OrNull)。
* [`toInt256OrDefault`](#toInt256OrDefault)。

**语法**

```sql
toInt256(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回一个 256 位整数值。[`Int256`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toInt256(-256),
    toInt256(-256.256),
    toInt256('-256')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt256(-256):     -256
toInt256(-256.256): -256
toInt256('-256'):   -256
```


## toInt256OrDefault {#toInt256OrDefault}

引入于：v21.11

与 [`toInt256`](#toInt256) 类似，此函数将输入值转换为 [Int256](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt256OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时返回的默认值。[`Int256`](/sql-reference/data-types/int-uint)

**返回值**

如果转换成功，则返回 `Int256` 类型的值；否则，如果传入了默认值则返回该默认值，未传入则返回 0。[`Int256`](/sql-reference/data-types/int-uint)

**示例**

**成功转换**

```sql title=Query
SELECT toInt256OrDefault('-256', CAST('-1', 'Int256'))
```

```response title=Response
-256
```

**转换失败**

```sql title=Query
SELECT toInt256OrDefault('abc', CAST('-1', 'Int256'))
```

```response title=Response
-1
```


## toInt256OrNull {#toInt256OrNull}

引入于：v20.8

与 [`toInt256`](#toInt256) 类似，此函数将输入值转换为 [Int256](../data-types/int-uint.md) 类型的值，但在出错时返回 `NULL`。

支持的参数：

* (U)Int* 的字符串表示。

不支持的参数（返回 `NULL`）：

* Float* 浮点值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制值和十六进制值的字符串表示，例如 `SELECT toInt256OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int256](../data-types/int-uint.md) 的取值范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

另请参阅：

* [`toInt256`](#toInt256)。
* [`toInt256OrZero`](#toInt256OrZero)。
* [`toInt256OrDefault`](#toInt256OrDefault)。

**语法**

```sql
toInt256OrNull(x)
```

**参数**

* `x` — 数字的 String 类型表示。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `Int256` 类型的值；如果转换失败，则返回 `NULL`。[`Int256`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=Query
SELECT
    toInt256OrNull('-256'),
    toInt256OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt256OrNull('-256'): -256
toInt256OrNull('abc'):  \N
```


## toInt256OrZero {#toInt256OrZero}

引入于：v20.8

将输入值转换为 [Int256](/sql-reference/data-types/int-uint) 类型，但在发生错误时返回 `0`。
类似于 [`toInt256`](#toint256)，但不会抛出异常，而是返回 `0`。

另请参阅：

* [`toInt256`](#toInt256)。
* [`toInt256OrNull`](#toInt256OrNull)。
* [`toInt256OrDefault`](#toInt256OrDefault)。

**语法**

```sql
toInt256OrZero(x)
```

**参数**

* `x` — 要转换的输入值，类型可以是 [`String`](/sql-reference/data-types/string)、[`FixedString`](/sql-reference/data-types/fixedstring)、[`Float*`](/sql-reference/data-types/float)、[`Decimal`](/sql-reference/data-types/decimal)、[`(U)Int*`](/sql-reference/data-types/int-uint)、[`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime)

**返回值**

返回转换后的值；如果转换失败，则返回 `0`。[`Int256`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT toInt256OrZero('123')
```

```response title=Response
123
```

**转换失败时返回 0**

```sql title=Query
SELECT toInt256OrZero('abc')
```

```response title=Response
0
```


## toInt32 {#toInt32}

引入于：v1.1

将输入值转换为 [`Int32`](../data-types/int-uint.md) 类型的值。
如果发生错误，则抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值。

不支持的参数：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toInt32('0xc0fe');`。

:::note
如果输入值不能在 [Int32](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
例如：`SELECT toInt32(2147483648) == -2147483648;`
:::

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

另请参阅：

* [`toInt32OrZero`](#toInt32OrZero)。
* [`toInt32OrNull`](#toInt32OrNull)。
* [`toInt32OrDefault`](#toInt32OrDefault)。

**语法**

```sql
toInt32(expr)
```

**参数**

* `expr` — 返回数值或其字符串形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回一个 32 位整数值。[`Int32`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt32(-32),
    toInt32(-32.32),
    toInt32('-32')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt32(-32):    -32
toInt32(-32.32): -32
toInt32('-32'):  -32
```


## toInt32OrDefault {#toInt32OrDefault}

引入于：v21.11

与 [`toInt32`](#toInt32) 类似，此函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未指定 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toInt32OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或其字符串表示的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时返回的默认值。[`Int32`](/sql-reference/data-types/int-uint)

**返回值**

成功时返回 `Int32` 类型的值，否则如果传入了默认值则返回该默认值，如果未传入则返回 0。[`Int32`](/sql-reference/data-types/int-uint)

**示例**

**转换成功**

```sql title=Query
SELECT toInt32OrDefault('-32', CAST('-1', 'Int32'))
```

```response title=Response
-32
```

**转换失败**

```sql title=Query
SELECT toInt32OrDefault('abc', CAST('-1', 'Int32'))
```

```response title=Response
-1
```


## toInt32OrNull {#toInt32OrNull}

引入自：v1.1

与 [`toInt32`](#toInt32) 类似，此函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但在出错时返回 `NULL`。

支持的参数：

* (U)Int* 的字符串形式。

不支持的参数（返回 `NULL`）：

* Float* 值的字符串形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串形式，例如 `SELECT toInt32OrNull('0xc0fe');`。

:::note
如果输入值不能在 [Int32](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toInt32`](#toInt32)。
* [`toInt32OrZero`](#toInt32OrZero)。
* [`toInt32OrDefault`](#toInt32OrDefault)。

**语法**

```sql
toInt32OrNull(x)
```

**参数**

* `x` — 数字的 String 类型表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `Int32` 类型的值；如果转换失败则返回 `NULL`。[`Int32`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt32OrNull('-32'),
    toInt32OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt32OrNull('-32'): -32
toInt32OrNull('abc'): \N
```


## toInt32OrZero {#toInt32OrZero}

引入于：v1.1

与 [`toInt32`](#toInt32) 类似，此函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但在出错时返回 `0`。

支持的参数：

* (U)Int* 的字符串表示。

不支持的参数（返回 `0`）：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toInt32OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int32](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

另请参阅：

* [`toInt32`](#toInt32)。
* [`toInt32OrNull`](#toInt32OrNull)。
* [`toInt32OrDefault`](#toInt32OrDefault)。

**语法**

```sql
toInt32OrZero(x)
```

**参数**

* `x` — 表示数字的字符串。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `Int32` 类型的值；如果转换失败则返回 `0`。[`Int32`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt32OrZero('32'),
    toInt32OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt32OrZero('32'): 32
toInt32OrZero('abc'): 0
```


## toInt64 {#toInt64}

引入于：v1.1

将输入值转换为 [`Int64`](../data-types/int-uint.md) 类型的值。
如果发生错误，则抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值。

不支持的参数：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toInt64('0xc0fe');`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
例如：`SELECT toInt64(9223372036854775808) == -9223372036854775808;`
:::

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数字的小数部分。
:::

另请参阅：

* [`toInt64OrZero`](#toInt64OrZero)。
* [`toInt64OrNull`](#toInt64OrNull)。
* [`toInt64OrDefault`](#toInt64OrDefault)。

**语法**

```sql
toInt64(expr)
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。支持：类型为 (U)Int* 的值或其字符串表示、类型为 Float* 的值。不支持：类型为 Float* 的值（包括 NaN 和 Inf）的字符串表示，以及二进制值和十六进制值的字符串表示。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回 64 位整数值。[`Int64`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt64(-64),
    toInt64(-64.64),
    toInt64('-64')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt64(-64):    -64
toInt64(-64.64): -64
toInt64('-64'):  -64
```


## toInt64OrDefault {#toInt64OrDefault}

引入于：v21.11

与 [`toInt64`](#toInt64) 类似，此函数将输入值转换为 [Int64](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toInt64OrDefault(expr[, default])
```

**参数**

* `expr` — 计算结果为数字或数字字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时要返回的默认值。[`Int64`](/sql-reference/data-types/int-uint)

**返回值**

转换成功时返回 `Int64` 类型的值；否则，如果传入了默认值则返回默认值，未传入则返回 0。[`Int64`](/sql-reference/data-types/int-uint)

**示例**

**转换成功**

```sql title=Query
SELECT toInt64OrDefault('-64', CAST('-1', 'Int64'))
```

```response title=Response
-64
```

**转换失败**

```sql title=Query
SELECT toInt64OrDefault('abc', CAST('-1', 'Int64'))
```

```response title=Response
-1
```


## toInt64OrNull {#toInt64OrNull}

引入于：v1.1

与 [`toInt64`](#toInt64) 类似，此函数将输入值转换为 [Int64](../data-types/int-uint.md) 类型的值，但在出错时则返回 `NULL`。

支持的参数：

* (U)Int* 的字符串表示形式。

不支持的参数（返回 `NULL`）：

* Float* 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt64OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toInt64`](#toInt64)。
* [`toInt64OrZero`](#toInt64OrZero)。
* [`toInt64OrDefault`](#toInt64OrDefault)。

**语法**

```sql
toInt64OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `Int64` 类型的值，如果转换失败则返回 `NULL`。[`Int64`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt64OrNull('-64'),
    toInt64OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt64OrNull('-64'): -64
toInt64OrNull('abc'): \N
```


## toInt64OrZero {#toInt64OrZero}

自 v1.1 引入

将输入值转换为类型 [Int64](/sql-reference/data-types/int-uint)，但在出错时返回 `0`。
类似于 [`toInt64`](#toint64)，但在发生错误时返回 `0`，而不是抛出异常。

另请参阅：

* [`toInt64`](#toInt64)。
* [`toInt64OrNull`](#toInt64OrNull)。
* [`toInt64OrDefault`](#toInt64OrDefault)。

**语法**

```sql
toInt64OrZero(x)
```

**参数**

* `x` — 要转换的输入值。[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring) 或 [`Float*`](/sql-reference/data-types/float) 或 [`Decimal`](/sql-reference/data-types/decimal) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime)

**返回值**

返回转换后的值，如果转换失败则返回 `0`。[`Int64`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT toInt64OrZero('123')
```

```response title=Response
123
```

**失败的转换返回零**

```sql title=Query
SELECT toInt64OrZero('abc')
```

```response title=Response
0
```


## toInt8 {#toInt8}

引入于：v1.1

将输入值转换为 [`Int8`](../data-types/int-uint.md) 类型的值。
在发生错误时抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示形式。
* 类型为 Float* 的值。

不支持的参数：

* Float* 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt8('0xc0fe');`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
例如：`SELECT toInt8(128) == -128;`。
:::

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数字的小数部分。
:::

另请参阅：

* [`toInt8OrZero`](#toInt8OrZero)。
* [`toInt8OrNull`](#toInt8OrNull)。
* [`toInt8OrDefault`](#toInt8OrDefault)。

**语法**

```sql
toInt8(expr)
```

**参数**

* `expr` — 返回数值或其字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回一个 8 位整数值。[`Int8`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toInt8(-8),
    toInt8(-8.8),
    toInt8('-8')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt8(-8):   -8
toInt8(-8.8): -8
toInt8('-8'): -8
```


## toInt8OrDefault {#toInt8OrDefault}

自 v21.11 起引入

与 [`toInt8`](#toInt8) 类似，此函数将输入值转换为 [Int8](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt8OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时返回的默认值。[`Int8`](/sql-reference/data-types/int-uint)

**返回值**

如果转换成功，返回 `Int8` 类型的值；否则在传入默认值时返回该默认值，未传入则返回 0。[`Int8`](/sql-reference/data-types/int-uint)

**示例**

**转换成功**

```sql title=Query
SELECT toInt8OrDefault('-8', CAST('-1', 'Int8'))
```

```response title=Response
-8
```

**转换失败**

```sql title=Query
SELECT toInt8OrDefault('abc', CAST('-1', 'Int8'))
```

```response title=Response
-1
```


## toInt8OrNull {#toInt8OrNull}

引入于：v1.1

与 [`toInt8`](#toInt8) 类似，此函数将输入值转换为 [Int8](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

支持的参数：

* (U)Int* 的字符串表示。

不支持的参数（返回 `NULL`）：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toInt8OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

另请参阅：

* [`toInt8`](#toInt8)。
* [`toInt8OrZero`](#toInt8OrZero)。
* [`toInt8OrDefault`](#toInt8OrDefault)。

**语法**

```sql
toInt8OrNull(x)
```

**参数**

* `x` — 数字的字符串表示。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `Int8` 类型的值，如果转换失败则返回 `NULL`。[`Int8`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt8OrNull('-8'),
    toInt8OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt8OrNull('-8'):  -8
toInt8OrNull('abc'): \N
```


## toInt8OrZero {#toInt8OrZero}

引入于：v1.1

与 [`toInt8`](#toInt8) 类似，此函数将输入值转换为类型为 [Int8](../data-types/int-uint.md) 的值，但在出错时返回 `0`。

支持的参数：

* (U)Int* 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float* 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toInt8OrZero('0xc0fe');`。

:::note
如果输入值不能在 [Int8](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toInt8`](#toInt8)。
* [`toInt8OrNull`](#toInt8OrNull)。
* [`toInt8OrDefault`](#toInt8OrDefault)。

**语法**

```sql
toInt8OrZero(x)
```

**参数**

* `x` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `Int8` 类型的值，如果转换失败则返回 `0`。[`Int8`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toInt8OrZero('8'),
    toInt8OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toInt8OrZero('8'): 8
toInt8OrZero('abc'): 0
```


## toInterval {#toInterval}

引入版本：v

根据一个数值和一个单位创建一个时间间隔（interval）。

**语法**

```sql
```

**参数**

* 无。

**返回值**

**示例**


## toIntervalDay {#toIntervalDay}

自 v1.1 引入

返回一个长度为 `n` 天、数据类型为 [`IntervalDay`](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalDay(n)
```

**参数**

* `n` — 天数。可以是整数或其字符串形式，也可以是浮点数。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string)

**返回值**

返回一个表示 `n` 天的时间间隔。[`Interval`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalDay(5) AS interval_to_days
SELECT date + interval_to_days AS result
```

```response title=Response
┌─────result─┐
│ 2025-06-20 │
└────────────┘
```


## toIntervalHour {#toIntervalHour}

自 v1.1 引入

返回一个 [`IntervalHour`](../data-types/special-data-types/interval.md) 数据类型的、表示 `n` 小时的时间间隔。

**语法**

```sql
toIntervalHour(n)
```

**参数**

* `n` — 小时数。可以是整数、其字符串表示形式，或浮点数。[`Int*`](/sql-reference/data-types/int-uint) 或 [`UInt*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string)

**返回值**

返回一个持续 `n` 小时的时间间隔。[`Interval`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalHour(12) AS interval_to_hours
SELECT date + interval_to_hours AS result
```

```response title=Response
┌──────────────result─┐
│ 2025-06-15 12:00:00 │
└─────────────────────┘
```


## toIntervalMicrosecond {#toIntervalMicrosecond}

引入版本：v22.6

返回一个表示 `n` 微秒的时间间隔，数据类型为 [`IntervalMicrosecond`](../../sql-reference/data-types/special-data-types/interval.md)。

**语法**

```sql
toIntervalMicrosecond(n)
```

**参数**

* `n` — 微秒数。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string)

**返回值**

返回一个长度为 `n` 微秒的区间值。[`Interval`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
WITH
    toDateTime('2025-06-15') AS date,
    toIntervalMicrosecond(30) AS interval_to_microseconds
SELECT date + interval_to_microseconds AS result
```

```response title=Response
┌─────────────────────result─┐
│ 2025-06-15 00:00:00.000030 │
└────────────────────────────┘
```


## toIntervalMillisecond {#toIntervalMillisecond}

自 v22.6 起引入

返回一个时长为 `n` 毫秒、数据类型为 [IntervalMillisecond](../../sql-reference/data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalMillisecond(n)
```

**参数**

* `n` — 毫秒数。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string)

**返回值**

返回一个长度为 `n` 毫秒的时间间隔。[`Interval`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
WITH
    toDateTime('2025-06-15') AS date,
    toIntervalMillisecond(30) AS interval_to_milliseconds
SELECT date + interval_to_milliseconds AS result
```

```response title=Response
┌──────────────────result─┐
│ 2025-06-15 00:00:00.030 │
└─────────────────────────┘
```


## toIntervalMinute {#toIntervalMinute}

自 v1.1 版本引入

返回一个由 `n` 分钟组成、数据类型为 [`IntervalMinute`](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalMinute(n)
```

**参数**

* `n` — 分钟数。可以是整数、其字符串表示形式或浮点数。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string)

**返回值**

返回一个表示 `n` 分钟的时间间隔。[`Interval`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalMinute(12) AS interval_to_minutes
SELECT date + interval_to_minutes AS result
```

```response title=Response
┌──────────────result─┐
│ 2025-06-15 00:12:00 │
└─────────────────────┘
```


## toIntervalMonth {#toIntervalMonth}

引入版本：v1.1

返回一个长度为 `n` 个月、数据类型为 [`IntervalMonth`](../../sql-reference/data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalMonth(n)
```

**参数**

* `n` — 月份数。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string)

**返回值**

返回一个表示 `n` 个月的时间间隔。[`Interval`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalMonth(1) AS interval_to_month
SELECT date + interval_to_month AS result
```

```response title=Response
┌─────result─┐
│ 2025-07-15 │
└────────────┘
```


## toIntervalNanosecond {#toIntervalNanosecond}

引入于：v22.6

返回一个长度为 `n` 个纳秒的数据区间，数据类型为 [`IntervalNanosecond`](../../sql-reference/data-types/special-data-types/interval.md)。

**语法**

```sql
toIntervalNanosecond(n)
```

**参数**

* `n` — 纳秒数。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string)

**返回值**

返回一个表示 `n` 纳秒的时间间隔。[`Interval`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
WITH
    toDateTime('2025-06-15') AS date,
    toIntervalNanosecond(30) AS interval_to_nanoseconds
SELECT date + interval_to_nanoseconds AS result
```

```response title=Response
┌────────────────────────result─┐
│ 2025-06-15 00:00:00.000000030 │
└───────────────────────────────┘
```


## toIntervalQuarter {#toIntervalQuarter}

引入版本：v1.1

返回一个表示 `n` 个季度的 [`IntervalQuarter`](../../sql-reference/data-types/special-data-types/interval.md) 类型的时间间隔。

**语法**

```sql
toIntervalQuarter(n)
```

**参数**

* `n` — 季度数量。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string)

**返回值**

返回一个跨越 `n` 个季度的时间区间。[`Interval`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalQuarter(1) AS interval_to_quarter
SELECT date + interval_to_quarter AS result
```

```response title=Response
┌─────result─┐
│ 2025-09-15 │
└────────────┘
```


## toIntervalSecond {#toIntervalSecond}

引入版本：v1.1

返回一个长度为 `n` 秒、数据类型为 [`IntervalSecond`](../data-types/special-data-types/interval.md) 的时间间隔。

**语法**

```sql
toIntervalSecond(n)
```

**参数**

* `n` — 秒数。可以是整数、其字符串表示形式或浮点数。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string)

**返回值**

返回一个持续 `n` 秒的时间区间。[`Interval`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalSecond(30) AS interval_to_seconds
SELECT date + interval_to_seconds AS result
```

```response title=Response
┌──────────────result─┐
│ 2025-06-15 00:00:30 │
└─────────────────────┘
```


## toIntervalWeek {#toIntervalWeek}

引入版本：v1.1

返回一个表示 `n` 周的时间间隔，数据类型为 [`IntervalWeek`](../../sql-reference/data-types/special-data-types/interval.md)。

**语法**

```sql
toIntervalWeek(n)
```

**参数**

* `n` — 周数。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string)

**返回值**

返回一个持续 `n` 周的时间间隔。[`Interval`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
WITH
    toDate('2025-06-15') AS date,
    toIntervalWeek(1) AS interval_to_week
SELECT date + interval_to_week AS result
```

```response title=Response
┌─────result─┐
│ 2025-06-22 │
└────────────┘
```


## toIntervalYear {#toIntervalYear}

引入版本：v1.1

返回一个表示 `n` 年的 [`IntervalYear`](../../sql-reference/data-types/special-data-types/interval.md) 类型时间间隔。

**语法**

```sql
toIntervalYear(n)
```

**参数**

* `n` — 年数。[`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float) 或 [`String`](/sql-reference/data-types/string)

**返回值**

返回一个表示 `n` 年的时间间隔。[`Interval`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
WITH
    toDate('2024-06-15') AS date,
    toIntervalYear(1) AS interval_to_year
SELECT date + interval_to_year AS result
```

```response title=Response
┌─────result─┐
│ 2025-06-15 │
└────────────┘
```


## toLowCardinality {#toLowCardinality}

引入于：v18.12

将输入参数转换为相同数据类型的 [LowCardinality](../data-types/lowcardinality.md) 版本。

:::tip
要将 `LowCardinality` 数据类型转换为普通数据类型，请使用 [CAST](#cast) 函数。
例如：`CAST(x AS String)`。
:::

**语法**

```sql
toLowCardinality(expr)
```

**参数**

* `expr` — 其结果为受支持数据类型之一的表达式。[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring) 或 [`Date`](/sql-reference/data-types/date) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)

**返回值**

返回将输入值转换为 `LowCardinality` 数据类型的结果。[`LowCardinality`](/sql-reference/data-types/lowcardinality)

**示例**

**使用示例**

```sql title=Query
SELECT toLowCardinality('1')
```

```response title=Response
┌─toLowCardinality('1')─┐
│ 1                     │
└───────────────────────┘
```


## toString {#toString}

自 v1.1 起引入

将值转换为其字符串表示。
对于 DateTime 参数，该函数可以接收第二个 String 参数，用于指定时区名称。

**语法**

```sql
toString(value[, timezone])
```

**参数**

* `value` — 要转换为字符串的值。[`Any`](/sql-reference/data-types)
* `timezone` — 可选。用于 DateTime 转换的时区名称。[`String`](/sql-reference/data-types/string)

**返回值**

返回输入值的字符串表示形式。[`String`](/sql-reference/data-types/string)

**示例**

**使用示例**

```sql title=Query
SELECT
    now() AS ts,
    time_zone,
    toString(ts, time_zone) AS str_tz_datetime
FROM system.time_zones
WHERE time_zone LIKE 'Europe%'
LIMIT 10
```

```response title=Response
┌──────────────────ts─┬─time_zone─────────┬─str_tz_datetime─────┐
│ 2023-09-08 19:14:59 │ Europe/Amsterdam  │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Andorra    │ 2023-09-08 21:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Astrakhan  │ 2023-09-08 23:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Athens     │ 2023-09-08 22:14:59 │
│ 2023-09-08 19:14:59 │ Europe/Belfast    │ 2023-09-08 20:14:59 │
└─────────────────────┴───────────────────┴─────────────────────┘
```


## toStringCutToZero {#toStringCutToZero}

引入版本：v1.1

接受一个 [String](/sql-reference/data-types/string) 或 [FixedString](/sql-reference/data-types/fixedstring) 参数，并返回一个 String，其中包含原始字符串的副本，但在第一个空字节处被截断。

空字节（\0）被视为字符串终止符。
此函数适用于处理 C 风格字符串或二进制数据，在这些场景中空字节用于标记有效内容的结束。

**语法**

```sql
toStringCutToZero(s)
```

**参数**

* `s` — 要处理的 String 或 FixedString。[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

返回一个包含首个空字节（null byte）之前所有字符的 String。[`String`](/sql-reference/data-types/string)

**示例**

**使用示例**

```sql title=Query
SELECT
    toStringCutToZero('hello'),
    toStringCutToZero('hello\0world')
```

```response title=Response
┌─toStringCutToZero('hello')─┬─toStringCutToZero('hello\\0world')─┐
│ hello                      │ hello                             │
└────────────────────────────┴───────────────────────────────────┘
```


## toTime {#toTime}

在 v1.1 版本中引入

将输入值转换为 [Time](/sql-reference/data-types/time) 类型。
支持从 String、FixedString、DateTime 或表示自午夜起经过秒数的数值类型进行转换。

**语法**

```sql
toTime(x)
```

**参数**

* `x` — 要转换的输入值。[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring) 或 [`DateTime`](/sql-reference/data-types/datetime) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)

**返回值**

返回转换后的值。[`Time`](/sql-reference/data-types/time)

**示例**

**将 String 转换为 Time 的示例**

```sql title=Query
SELECT toTime('14:30:25')
```

```response title=Response
14:30:25
```

**将 DateTime 转换为 Time**

```sql title=Query
SELECT toTime(toDateTime('2025-04-15 14:30:25'))
```

```response title=Response
14:30:25
```

**整数到时间的类型转换**

```sql title=Query
SELECT toTime(52225)
```

```response title=Response
14:30:25
```


## toTime64 {#toTime64}

自 v25.6 起引入

将输入值转换为 [Time64](/sql-reference/data-types/time64) 类型。
支持从 String、FixedString、DateTime64，或数值类型（表示自午夜起经过的微秒数）进行转换。
为时间值提供微秒级精度。

**语法**

```sql
toTime64(x)
```

**参数**

* `x` — 要转换的输入值。[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring) 或 [`DateTime64`](/sql-reference/data-types/datetime64) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)

**返回值**

返回转换后的输入值，精度为微秒。[`Time64(6)`](/sql-reference/data-types/time64)

**示例**

**将 String 转换为 Time64**

```sql title=Query
SELECT toTime64('14:30:25.123456')
```

```response title=Response
14:30:25.123456
```

**将 DateTime64 转换为 Time64**

```sql title=Query
SELECT toTime64(toDateTime64('2025-04-15 14:30:25.123456', 6))
```

```response title=Response
14:30:25.123456
```

**整数到 Time64 的转换**

```sql title=Query
SELECT toTime64(52225123456)
```

```response title=Response
14:30:25.123456
```


## toTime64OrNull {#toTime64OrNull}

引入于：v25.6

将输入值转换为 `Time64` 类型的值，但在出错时返回 `NULL`。
类似于 [`toTime64`](#toTime64)，只是当转换出错时返回 `NULL`，而不是抛出异常。

另请参阅：

* [`toTime64`](#toTime64)
* [`toTime64OrZero`](#toTime64OrZero)

**语法**

```sql
toTime64OrNull(x)
```

**参数**

* `x` — 具有亚秒级精度的时间的字符串表示。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回 Time64 值，否则返回 `NULL`。[`Time64`](/sql-reference/data-types/time64) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT toTime64OrNull('12:30:45.123'), toTime64OrNull('invalid')
```

```response title=Response
┌─toTime64OrNull('12:30:45.123')─┬─toTime64OrNull('invalid')─┐
│                   12:30:45.123 │                      ᴺᵁᴸᴸ │
└────────────────────────────────┴───────────────────────────┘
```


## toTime64OrZero {#toTime64OrZero}

引入版本：v25.6

将输入值转换为 Time64 类型的值，但在发生错误时返回 `00:00:00.000`。
类似于 [`toTime64`](#toTime64)，但在转换出错时返回 `00:00:00.000`，而不是抛出异常。

**语法**

```sql
toTime64OrZero(x)
```

**参数**

* `x` — 具有亚秒级精度的时间字符串表示。[`String`](/sql-reference/data-types/string)

**返回值**

如果成功，则返回一个 Time64 值，否则返回 `00:00:00.000`。[`Time64`](/sql-reference/data-types/time64)

**示例**

**用法示例**

```sql title=Query
SELECT toTime64OrZero('12:30:45.123'), toTime64OrZero('invalid')
```

```response title=Response
┌─toTime64OrZero('12:30:45.123')─┬─toTime64OrZero('invalid')─┐
│                   12:30:45.123 │             00:00:00.000 │
└────────────────────────────────┴──────────────────────────┘
```


## toTimeOrNull {#toTimeOrNull}

引入版本：v1.1

将输入值转换为 `Time` 类型的值，但在出错时返回 `NULL`。
类似于 [`toTime`](#toTime)，但在转换出错时返回 `NULL`，而不是抛出异常。

另见：

* [`toTime`](#toTime)
* [`toTimeOrZero`](#toTimeOrZero)

**语法**

```sql
toTimeOrNull(x)
```

**参数**

* `x` — 表示时间的字符串。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回一个 Time 类型的值，否则返回 `NULL`。[`Time`](/sql-reference/data-types/time) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT toTimeOrNull('12:30:45'), toTimeOrNull('invalid')
```

```response title=Response
┌─toTimeOrNull('12:30:45')─┬─toTimeOrNull('invalid')─┐
│                 12:30:45 │                    ᴺᵁᴸᴸ │
└──────────────────────────┴─────────────────────────┘
```


## toTimeOrZero {#toTimeOrZero}

自 v1.1 引入

将输入值转换为 `Time` 类型的值，但在出错时返回 `00:00:00`。
与 `toTime` 类似，但在转换出错时返回 `00:00:00`，而不是抛出异常。

**语法**

```sql
toTimeOrZero(x)
```

**参数**

* `x` — 时间的字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

成功时返回一个 Time 类型的值，否则返回 `00:00:00`。[`Time`](/sql-reference/data-types/time)

**示例**

**使用示例**

```sql title=Query
SELECT toTimeOrZero('12:30:45'), toTimeOrZero('invalid')
```

```response title=Response
┌─toTimeOrZero('12:30:45')─┬─toTimeOrZero('invalid')─┐
│                 12:30:45 │                00:00:00 │
└──────────────────────────┴─────────────────────────┘
```


## toUInt128 {#toUInt128}

引入自：v1.1

将输入值转换为 [`UInt128`](/sql-reference/functions/type-conversion-functions#touint128) 类型的值。
在发生错误时抛出异常。
该函数使用向零舍入方式，即截断数值的小数部分。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示形式。
* 类型为 Float* 的值。

不支持的参数：

* Float* 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如 `SELECT toUInt128('0xc0fe');`。

:::note
如果输入值无法在 UInt128 的范围内表示，结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toUInt128OrZero`](#toUInt128OrZero)。
* [`toUInt128OrNull`](#toUInt128OrNull)。
* [`toUInt128OrDefault`](#toUInt128OrDefault)。

**语法**

```sql
toUInt128(expr)
```

**参数**

* `expr` — 返回一个数字或数字字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回一个 128 位无符号整数值。[`UInt128`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt128(128),
    toUInt128(128.8),
    toUInt128('128')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt128(128):   128
toUInt128(128.8): 128
toUInt128('128'): 128
```


## toUInt128OrDefault {#toUInt128OrDefault}

引入版本：v21.11

与 [`toUInt128`](#toUInt128) 类似，此函数将输入值转换为 [`UInt128`](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toUInt128OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时返回的默认值。[`UInt128`](/sql-reference/data-types/int-uint)

**返回值**

如果转换成功，则返回 `UInt128` 类型的值；否则，如果传入了默认值，则返回该默认值；未传入时返回 0。[`UInt128`](/sql-reference/data-types/int-uint)

**示例**

**成功转换**

```sql title=Query
SELECT toUInt128OrDefault('128', CAST('0', 'UInt128'))
```

```response title=Response
128
```

**转换失败**

```sql title=Query
SELECT toUInt128OrDefault('abc', CAST('0', 'UInt128'))
```

```response title=Response
0
```


## toUInt128OrNull {#toUInt128OrNull}

引入自：v21.6

与 [`toUInt128`](#toUInt128) 类似，此函数将输入值转换为 [`UInt128`](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

支持的参数：

* (U)Int* 的字符串表示形式。

不支持的参数（返回 `NULL`）：

* Float* 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toUInt128OrNull('0xc0fe');`。

:::note
如果输入值不能在 [`UInt128`](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

另请参见：

* [`toUInt128`](#toUInt128)。
* [`toUInt128OrZero`](#toUInt128OrZero)。
* [`toUInt128OrDefault`](#toUInt128OrDefault)。

**语法**

```sql
toUInt128OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `UInt128` 类型的值；如果转换失败，则返回 `NULL`。[`UInt128`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=Query
SELECT
    toUInt128OrNull('128'),
    toUInt128OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt128OrNull('128'): 128
toUInt128OrNull('abc'): \N
```


## toUInt128OrZero {#toUInt128OrZero}

引入于：v1.1

与 [`toUInt128`](#toUInt128) 类似，此函数将输入值转换为 [`UInt128`](../data-types/int-uint.md) 类型的值，但在出错时返回 `0`。

支持的参数：

* (U)Int* 的字符串表示形式。

不支持的参数（返回 `0`）：

* Float* 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toUInt128OrZero('0xc0fe');`。

:::note
如果输入值不能在 [`UInt128`](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toUInt128`](#toUInt128)。
* [`toUInt128OrNull`](#toUInt128OrNull)。
* [`toUInt128OrDefault`](#toUInt128OrDefault)。

**语法**

```sql
toUInt128OrZero(x)
```

**参数**

* `x` — 数字的 String 类型表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `UInt128` 类型的值，如果转换失败，则返回 `0`。[`UInt128`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt128OrZero('128'),
    toUInt128OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt128OrZero('128'): 128
toUInt128OrZero('abc'): 0
```


## toUInt16 {#toUInt16}

引入于：v1.1

将输入值转换为 [`UInt16`](../data-types/int-uint.md) 类型的值。
出错时会抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值。

不支持的参数：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt16('0xc0fe');`。

:::note
如果输入值无法在 [`UInt16`](../data-types/int-uint.md) 的取值范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
例如：`SELECT toUInt16(65536) == 0;`。
:::

:::note
该函数采用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即截断数值的小数部分。
:::

另请参阅：

* [`toUInt16OrZero`](#toUInt16OrZero)。
* [`toUInt16OrNull`](#toUInt16OrNull)。
* [`toUInt16OrDefault`](#toUInt16OrDefault)。

**语法**

```sql
toUInt16(expr)
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回一个 16 位无符号整数值。[`UInt16`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toUInt16(16),
    toUInt16(16.16),
    toUInt16('16')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt16(16):    16
toUInt16(16.16): 16
toUInt16('16'):  16
```


## toUInt16OrDefault {#toUInt16OrDefault}

引入于：v21.11

与 [`toUInt16`](#toUInt16) 类似，此函数将输入值转换为 [UInt16](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toUInt16OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时返回的默认值。[`UInt16`](/sql-reference/data-types/int-uint)

**返回值**

解析成功时返回 `UInt16` 类型的值；否则返回传入的默认值；如果未传入默认值，则返回 0。[`UInt16`](/sql-reference/data-types/int-uint)

**示例**

**成功转换**

```sql title=Query
SELECT toUInt16OrDefault('16', CAST('0', 'UInt16'))
```

```response title=Response
16
```

**转换失败**

```sql title=Query
SELECT toUInt16OrDefault('abc', CAST('0', 'UInt16'))
```

```response title=Response
0
```


## toUInt16OrNull {#toUInt16OrNull}

引入于：v1.1

与 [`toUInt16`](#toUInt16) 类似，此函数将输入值转换为 [`UInt16`](../data-types/int-uint.md) 类型的值，但在出错时返回 `NULL`。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `NULL`）：

* Float* 类型值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt16OrNull('0xc0fe');`。

:::note
如果输入值不能在 [`UInt16`](../data-types/int-uint.md) 的范围内表示，结果将发生溢出或下溢。
这不被视为错误。
:::

另请参阅：

* [`toUInt16`](#toUInt16)。
* [`toUInt16OrZero`](#toUInt16OrZero)。
* [`toUInt16OrDefault`](#toUInt16OrDefault)。

**语法**

```sql
toUInt16OrNull(x)
```

**参数**

* `x` — 数字的字符串表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `UInt16` 类型的值，如果转换失败则返回 `NULL`。[`UInt16`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt16OrNull('16'),
    toUInt16OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt16OrNull('16'):  16
toUInt16OrNull('abc'): \N
```


## toUInt16OrZero {#toUInt16OrZero}

引入于：v1.1

与 [`toUInt16`](#toUInt16) 类似，此函数将输入值转换为 [`UInt16`](../data-types/int-uint.md) 类型的值，但在出错时返回 `0`。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制值和十六进制值的字符串表示，例如：`SELECT toUInt16OrZero('0xc0fe');`。

:::note
如果输入值无法在 [`UInt16`](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toUInt16`](#toUInt16)。
* [`toUInt16OrNull`](#toUInt16OrNull)。
* [`toUInt16OrDefault`](#toUInt16OrDefault)。

**语法**

```sql
toUInt16OrZero(x)
```

**参数**

* `x` — 数字的 String 类型表示。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `UInt16` 类型的值，如果转换失败则返回 `0`。[`UInt16`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt16OrZero('16'),
    toUInt16OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt16OrZero('16'):  16
toUInt16OrZero('abc'): 0
```


## toUInt256 {#toUInt256}

自 v1.1 引入

将输入值转换为 `UInt256` 类型的值。
在发生错误时抛出异常。
该函数采用向零舍入方式，即会截断数字的小数部分。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值。

不支持的参数：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt256('0xc0fe');`。

:::note
如果输入值无法在 UInt256 的取值范围内表示，则结果会发生上溢或下溢。
这不会被视为错误。
:::

另请参阅：

* [`toUInt256OrZero`](#toUInt256OrZero)。
* [`toUInt256OrNull`](#toUInt256OrNull)。
* [`toUInt256OrDefault`](#toUInt256OrDefault)。

**语法**

```sql
toUInt256(expr)
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回 256 位无符号整数值。[`UInt256`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toUInt256(256),
    toUInt256(256.256),
    toUInt256('256')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt256(256):     256
toUInt256(256.256): 256
toUInt256('256'):   256
```


## toUInt256OrDefault {#toUInt256OrDefault}

引入自：v21.11

与 [`toUInt256`](#toUInt256) 类似，此函数将输入值转换为 [UInt256](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toUInt256OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字的字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时返回的默认值。[`UInt256`](/sql-reference/data-types/int-uint)

**返回值**

如果解析成功，返回 `UInt256` 类型的值；否则返回传入的默认值；如果未传入默认值，则返回 0。[`UInt256`](/sql-reference/data-types/int-uint)

**示例**

**转换成功**

```sql title=Query
SELECT toUInt256OrDefault('-256', CAST('0', 'UInt256'))
```

```response title=Response
0
```

**转换失败**

```sql title=Query
SELECT toUInt256OrDefault('abc', CAST('0', 'UInt256'))
```

```response title=Response
0
```


## toUInt256OrNull {#toUInt256OrNull}

引入于：v20.8

与 [`toUInt256`](#toUInt256) 类似，此函数将输入值转换为 [`UInt256`](../data-types/int-uint.md) 类型的值，但在出错时返回 `NULL`。

支持的参数：

* (U)Int* 的字符串表示。

不支持的参数（返回 `NULL`）：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt256OrNull('0xc0fe');`。

:::note
如果输入值不能在 [`UInt256`](../data-types/int-uint.md) 的取值范围内表示，结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toUInt256`](#toUInt256)。
* [`toUInt256OrZero`](#toUInt256OrZero)。
* [`toUInt256OrDefault`](#toUInt256OrDefault)。

**语法**

```sql
toUInt256OrNull(x)
```

**参数**

* `x` — 数字的 String 类型表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回类型为 UInt256 的值，如果转换失败则返回 `NULL`。[`UInt256`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt256OrNull('256'),
    toUInt256OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt256OrNull('256'): 256
toUInt256OrNull('abc'): \N
```


## toUInt256OrZero {#toUInt256OrZero}

引入版本：v20.8

与 [`toUInt256`](#toUInt256) 类似，此函数将输入值转换为 [`UInt256`](../data-types/int-uint.md) 类型的值，但在出错时返回 `0`。

支持的参数：

* (U)Int* 的字符串表示。

不支持的参数（返回 `0`）：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt256OrZero('0xc0fe');`。

:::note
如果输入值无法在 [`UInt256`](../data-types/int-uint.md) 的取值范围内表示，则结果会发生溢出或下溢。
这不视为错误。
:::

另请参阅：

* [`toUInt256`](#toUInt256)。
* [`toUInt256OrNull`](#toUInt256OrNull)。
* [`toUInt256OrDefault`](#toUInt256OrDefault)。

**语法**

```sql
toUInt256OrZero(x)
```

**参数**

* `x` — 数字的 String 类型表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回 UInt256 类型的值；如果转换失败，则返回 `0`。[`UInt256`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toUInt256OrZero('256'),
    toUInt256OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt256OrZero('256'): 256
toUInt256OrZero('abc'): 0
```


## toUInt32 {#toUInt32}

自 v1.1 起引入

将输入值转换为 [`UInt32`](../data-types/int-uint.md) 类型的值。
在发生错误时抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串形式。
* 类型为 Float* 的值。

不支持的参数：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt32('0xc0fe');`。

:::note
如果输入值无法在 [`UInt32`](../data-types/int-uint.md) 的取值范围内表示，结果会发生上溢或下溢。
这不被视为错误。
例如：`SELECT toUInt32(4294967296) == 0;`
:::

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，即会截断数字的小数部分。
:::

另请参阅：

* [`toUInt32OrZero`](#toUInt32OrZero)。
* [`toUInt32OrNull`](#toUInt32OrNull)。
* [`toUInt32OrDefault`](#toUInt32OrDefault)。

**语法**

```sql
toUInt32(expr)
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回一个 32 位无符号整数。[`UInt32`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
SELECT
    toUInt32(32),
    toUInt32(32.32),
    toUInt32('32')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt32(32):    32
toUInt32(32.32): 32
toUInt32('32'):  32
```


## toUInt32OrDefault {#toUInt32OrDefault}

引入于：v21.11

类似于 [`toUInt32`](#toUInt32)，此函数将输入值转换为类型为 [UInt32](../data-types/int-uint.md) 的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toUInt32OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或数字字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时要返回的默认值。[`UInt32`](/sql-reference/data-types/int-uint)

**返回值**

如果解析成功，则返回类型为 UInt32 的值；否则在传入默认值时返回该默认值，未传入时返回 0。[`UInt32`](/sql-reference/data-types/int-uint)

**示例**

**成功转换**

```sql title=Query
SELECT toUInt32OrDefault('32', CAST('0', 'UInt32'))
```

```response title=Response
32
```

**转换失败**

```sql title=Query
SELECT toUInt32OrDefault('abc', CAST('0', 'UInt32'))
```

```response title=Response
0
```


## toUInt32OrNull {#toUInt32OrNull}

引入于：v1.1

与 [`toUInt32`](#toUInt32) 类似，此函数将输入值转换为 [`UInt32`](../data-types/int-uint.md) 类型的值，但在出错时返回 `NULL`。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `NULL`）：

* Float* 类型值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt32OrNull('0xc0fe');`。

:::note
如果输入值无法在 [`UInt32`](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toUInt32`](#toUInt32)。
* [`toUInt32OrZero`](#toUInt32OrZero)。
* [`toUInt32OrDefault`](#toUInt32OrDefault)。

**语法**

```sql
toUInt32OrNull(x)
```

**参数**

* `x` — 数字的 String 类型表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `UInt32` 类型的值，如果转换不成功则返回 `NULL`。[`UInt32`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=Query
SELECT
    toUInt32OrNull('32'),
    toUInt32OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt32OrNull('32'):  32
toUInt32OrNull('abc'): \N
```


## toUInt32OrZero {#toUInt32OrZero}

引入于：v1.1

与 [`toUInt32`](#toUInt32) 类似，此函数将输入值转换为 [`UInt32`](../data-types/int-uint.md) 类型的值，但在出错时返回 `0`。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt32OrZero('0xc0fe');`。

:::note
如果输入值无法在 [`UInt32`](../data-types/int-uint.md) 的范围内表示，则结果将发生溢出或下溢。
这不被视为错误。
:::

另请参阅：

* [`toUInt32`](#toUInt32)。
* [`toUInt32OrNull`](#toUInt32OrNull)。
* [`toUInt32OrDefault`](#toUInt32OrDefault)。

**语法**

```sql
toUInt32OrZero(x)
```

**参数**

* `x` — 数字的 String 类型表示。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `UInt32` 类型的值，若转换失败则返回 `0`。[`UInt32`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt32OrZero('32'),
    toUInt32OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt32OrZero('32'):  32
toUInt32OrZero('abc'): 0
```


## toUInt64 {#toUInt64}

引入于：v1.1

将输入值转换为 [`UInt64`](../data-types/int-uint.md) 类型的值。
在出错时抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值。

不支持的类型：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt64('0xc0fe');`。

:::note
如果输入值无法在 [`UInt64`](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
例如：`SELECT toUInt64(18446744073709551616) == 0;`
:::

:::note
该函数采用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)方式，即截断数字的小数部分。
:::

另请参阅：

* [`toUInt64OrZero`](#toUInt64OrZero)。
* [`toUInt64OrNull`](#toUInt64OrNull)。
* [`toUInt64OrDefault`](#toUInt64OrDefault)。

**语法**

```sql
toUInt64(expr)
```

**参数**

* `expr` — 结果为数字或数字字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回 64 位无符号整数值。[`UInt64`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt64(64),
    toUInt64(64.64),
    toUInt64('64')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt64(64):    64
toUInt64(64.64): 64
toUInt64('64'):  64
```


## toUInt64OrDefault {#toUInt64OrDefault}

引入于：v21.11

与 [`toUInt64`](#toUInt64) 类似，此函数将输入值转换为 [UInt64](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果未传入 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toUInt64OrDefault(expr[, default])
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时返回的默认值。[`UInt64`](/sql-reference/data-types/int-uint)

**返回值**

如果转换成功，返回 `UInt64` 类型的值；否则，如果传入了默认值则返回该默认值，未传入则返回 0。[`UInt64`](/sql-reference/data-types/int-uint)

**示例**

**转换成功**

```sql title=Query
SELECT toUInt64OrDefault('64', CAST('0', 'UInt64'))
```

```response title=Response
64
```

**转换失败**

```sql title=Query
SELECT toUInt64OrDefault('abc', CAST('0', 'UInt64'))
```

```response title=Response
0
```


## toUInt64OrNull {#toUInt64OrNull}

引入版本：v1.1

与 [`toUInt64`](#toUInt64) 类似，此函数将输入值转换为 [`UInt64`](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

支持的参数：

* (U)Int* 的字符串表示形式。

不支持的参数（返回 `NULL`）：

* Float* 值的字符串表示形式，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示形式，例如：`SELECT toUInt64OrNull('0xc0fe');`。

:::note
如果输入值无法在 [`UInt64`](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

另请参阅：

* [`toUInt64`](#toUInt64)。
* [`toUInt64OrZero`](#toUInt64OrZero)。
* [`toUInt64OrDefault`](#toUInt64OrDefault)。

**语法**

```sql
toUInt64OrNull(x)
```

**参数**

* `x` — 数字的 String 类型表示形式。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `UInt64` 类型的值，若转换失败则返回 `NULL`。[`UInt64`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**使用示例**

```sql title=Query
SELECT
    toUInt64OrNull('64'),
    toUInt64OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt64OrNull('64'):  64
toUInt64OrNull('abc'): \N
```


## toUInt64OrZero {#toUInt64OrZero}

引入版本：v1.1

类似于 [`toUInt64`](#toUInt64)，此函数将输入值转换为 [`UInt64`](../data-types/int-uint.md) 类型的值，但在出错时返回 `0`。

支持的参数：

* (U)Int* 整数类型的字符串表示。

不支持的参数（返回 `0`）：

* Float* 浮点类型值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt64OrZero('0xc0fe');`。

:::note
如果输入值无法在 [`UInt64`](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toUInt64`](#toUInt64)。
* [`toUInt64OrNull`](#toUInt64OrNull)。
* [`toUInt64OrDefault`](#toUInt64OrDefault)。

**语法**

```sql
toUInt64OrZero(x)
```

**参数**

* `x` — 数字的 String 类型表示。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `UInt64` 类型的值，如果转换失败则返回 `0`。[`UInt64`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt64OrZero('64'),
    toUInt64OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt64OrZero('64'):  64
toUInt64OrZero('abc'): 0
```


## toUInt8 {#toUInt8}

引入于：v1.1

将输入值转换为 [`UInt8`](../data-types/int-uint.md) 类型的值。
在发生错误时抛出异常。

支持的参数：

* 类型为 (U)Int* 的值或其字符串表示。
* 类型为 Float* 的值。

不支持的参数：

* Float* 值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt8('0xc0fe');`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的取值范围内表示，则结果会发生上溢或下溢。
这不视为错误。
例如：`SELECT toUInt8(256) == 0;`。
:::

:::note
该函数使用[向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，即会截断数值的小数部分。
:::

另请参阅：

* [`toUInt8OrZero`](#toUInt8OrZero)。
* [`toUInt8OrNull`](#toUInt8OrNull)。
* [`toUInt8OrDefault`](#toUInt8OrDefault)。

**语法**

```sql
toUInt8(expr)
```

**参数**

* `expr` — 返回数字或其字符串表示形式的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

返回一个 8 位无符号整数值。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt8(8),
    toUInt8(8.8),
    toUInt8('8')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt8(8):   8
toUInt8(8.8): 8
toUInt8('8'): 8
```


## toUInt8OrDefault {#toUInt8OrDefault}

引入自：v21.11

与 [`toUInt8`](#toUInt8) 类似，此函数将输入值转换为 [UInt8](../data-types/int-uint.md) 类型的值，但在出错时返回默认值。
如果未传入 `default` 值，则在出错时返回 `0`。

**语法**

```sql
toUInt8OrDefault(expr[, default])
```

**参数**

* `expr` — 求值为数字或数字字符串表示形式的表达式。[`String`](/sql-reference/data-types/string) 或 [`(U)Int*`](/sql-reference/data-types/int-uint) 或 [`Float*`](/sql-reference/data-types/float)
* `default` — 可选。解析失败时要返回的默认值。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

如果转换成功，返回类型为 `UInt8` 的值；否则，如果传入了默认值则返回该默认值，如果未传入则返回 0。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**成功转换**

```sql title=Query
SELECT toUInt8OrDefault('8', CAST('0', 'UInt8'))
```

```response title=Response
8
```

**转换失败时**

```sql title=Query
SELECT toUInt8OrDefault('abc', CAST('0', 'UInt8'))
```

```response title=Response
0
```


## toUInt8OrNull {#toUInt8OrNull}

引入版本：v1.1

与 [`toUInt8`](#toUInt8) 类似，此函数将输入值转换为 [`UInt8`](../data-types/int-uint.md) 类型的值，但在出错时返回 `NULL`。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `NULL`）：

* 普通 Float* 类型值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如：`SELECT toUInt8OrNull('0xc0fe');`。

:::note
如果输入值不能在 [`UInt8`](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不视为错误。
:::

另请参阅：

* [`toUInt8`](#toUInt8)。
* [`toUInt8OrZero`](#toUInt8OrZero)。
* [`toUInt8OrDefault`](#toUInt8OrDefault)。

**语法**

```sql
toUInt8OrNull(x)
```

**参数**

* `x` — 数字的 String 类型表示。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `UInt8` 类型的值，如果转换失败则返回 `NULL`。[`UInt8`](/sql-reference/data-types/int-uint) 或 [`NULL`](/sql-reference/syntax#null)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt8OrNull('42'),
    toUInt8OrNull('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt8OrNull('42'):  42
toUInt8OrNull('abc'): \N
```


## toUInt8OrZero {#toUInt8OrZero}

自 v1.1 起提供

与 [`toUInt8`](#toUInt8) 类似，此函数会将输入值转换为 [`UInt8`](../data-types/int-uint.md) 类型的值，但在出错时返回 `0`。

支持的参数：

* (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：

* 常规 Float* 类型值的字符串表示，包括 `NaN` 和 `Inf`。
* 二进制和十六进制值的字符串表示，例如 `SELECT toUInt8OrZero('0xc0fe');`。

:::note
如果输入值无法在 [`UInt8`](../data-types/int-uint.md) 的范围内表示，则结果会发生上溢或下溢。
这不被视为错误。
:::

另请参阅：

* [`toUInt8`](#toUInt8)。
* [`toUInt8OrNull`](#toUInt8OrNull)。
* [`toUInt8OrDefault`](#toUInt8OrDefault)。

**语法**

```sql
toUInt8OrZero(x)
```

**参数**

* `x` — 表示数字的字符串。[`String`](/sql-reference/data-types/string)

**返回值**

返回 `UInt8` 类型的值，如果转换失败则返回 `0`。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUInt8OrZero('-8'),
    toUInt8OrZero('abc')
FORMAT Vertical
```

```response title=Response
Row 1:
──────
toUInt8OrZero('-8'):  0
toUInt8OrZero('abc'): 0
```


## toUUID {#toUUID}

自 v1.1 引入

将 String 类型的值转换为 UUID 类型的值。

**语法**

```sql
toUUID(string)
```

**参数**

* `string` — UUID 的字符串表示。[`String`](/sql-reference/data-types/string) 或 [`FixedString`](/sql-reference/data-types/fixedstring)

**返回值**

根据 UUID 的字符串表示返回一个 UUID 值。[`UUID`](/sql-reference/data-types/uuid)

**示例**

**用法示例**

```sql title=Query
SELECT toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0') AS uuid
```

```response title=Response
┌─────────────────────────────────uuid─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0 │
└──────────────────────────────────────┘
```


## toUUIDOrZero {#toUUIDOrZero}

自 v20.12 引入

将输入值转换为 [UUID](../data-types/uuid.md) 类型的值，但在发生错误时返回全零 UUID。
类似于 [`toUUID`](/sql-reference/functions/uuid-functions#touuid)，但在转换出错时返回全零 UUID（`00000000-0000-0000-0000-000000000000`），而不是抛出异常。

支持的参数：

* 标准格式的 UUID 字符串表示（8-4-4-4-12 个十六进制数字）。
* 不带连字符的 UUID 字符串表示（32 个十六进制数字）。

不支持的参数（返回全零 UUID）：

* 无效的字符串格式。
* 非字符串类型。

**语法**

```sql
toUUIDOrZero(x)
```

**参数**

* `x` — UUID 的字符串形式。[`String`](/sql-reference/data-types/string)

**返回值**

如果成功，则返回 UUID 值，否则返回全零 UUID（`00000000-0000-0000-0000-000000000000`）。[`UUID`](/sql-reference/data-types/uuid)

**示例**

**用法示例**

```sql title=Query
SELECT
    toUUIDOrZero('550e8400-e29b-41d4-a716-446655440000') AS valid_uuid,
    toUUIDOrZero('invalid-uuid') AS invalid_uuid
```

```response title=Response
┌─valid_uuid───────────────────────────┬─invalid_uuid─────────────────────────┐
│ 550e8400-e29b-41d4-a716-446655440000 │ 00000000-0000-0000-0000-000000000000 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## toUnixTimestamp64Micro {#toUnixTimestamp64Micro}

自 v20.5 引入

将 [`DateTime64`](/sql-reference/data-types/datetime64) 转换为具有固定微秒精度的 [`Int64`](/sql-reference/data-types/int-uint) 值。
输入值会根据其自身精度被相应地放大或缩小。

:::note
输出值是相对于 UTC 的，而不是相对于输入值所在的时区。
:::

**语法**

```sql
toUnixTimestamp64Micro(value)
```

**参数**

* `value` — 任意精度的 DateTime64 值。[`DateTime64`](/sql-reference/data-types/datetime64)

**返回值**

返回以微秒为单位的 Unix 时间戳。[`Int64`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011123', 6, 'UTC') AS dt64
SELECT toUnixTimestamp64Micro(dt64);
```

```response title=Response
┌─toUnixTimestamp64Micro(dt64)─┐
│               1739489491011123 │
└────────────────────────────────┘
```


## toUnixTimestamp64Milli {#toUnixTimestamp64Milli}

引入版本：v20.5

将 [`DateTime64`](/sql-reference/data-types/datetime64) 转换为具有固定毫秒精度的 [`Int64`](/sql-reference/data-types/int-uint) 值。
输入值会根据其精度适当放大或缩小。

:::note
输出值是相对于 UTC 的，而不是相对于输入值的时区。
:::

**语法**

```sql
toUnixTimestamp64Milli(value)
```

**参数**

* `value` — 具有任意精度的 DateTime64 值。[`DateTime64`](/sql-reference/data-types/datetime64)

**返回值**

返回以毫秒为单位的 Unix 时间戳。[`Int64`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Milli(dt64);
```

```response title=Response
┌─toUnixTimestamp64Milli(dt64)─┐
│                1739489491011 │
└──────────────────────────────┘
```


## toUnixTimestamp64Nano {#toUnixTimestamp64Nano}

引入版本：v20.5

将 [`DateTime64`](/sql-reference/data-types/datetime64) 转换为具有固定纳秒精度的 [`Int64`](/sql-reference/functions/type-conversion-functions#toint64) 值。
输入值会根据其精度被相应地放大或缩小。

:::note
输出值是相对于 UTC 的，而不是相对于输入值所在的时区。
:::

**语法**

```sql
toUnixTimestamp64Nano(value)
```

**参数**

* `value` — 任意精度的 DateTime64 值。[`DateTime64`](/sql-reference/data-types/datetime64)

**返回值**

返回以纳秒为单位的 Unix 时间戳。[`Int64`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011123456', 9, 'UTC') AS dt64
SELECT toUnixTimestamp64Nano(dt64);
```

```response title=Response
┌─toUnixTimestamp64Nano(dt64)────┐
│            1739489491011123456 │
└────────────────────────────────┘
```


## toUnixTimestamp64Second {#toUnixTimestamp64Second}

引入于：v24.12

将 [`DateTime64`](/sql-reference/data-types/datetime64) 转换为具有固定秒级精度的 [`Int64`](/sql-reference/data-types/int-uint) 值。
输入值会根据其自身精度按比例进行相应的放大或缩小。

:::note
输出值是相对于 UTC 的，而不是相对于输入值的时区。
:::

**语法**

```sql
toUnixTimestamp64Second(value)
```

**参数**

* `value` — 任意精度的 DateTime64 值。[`DateTime64`](/sql-reference/data-types/datetime64)

**返回值**

返回以秒为单位的 Unix 时间戳。[`Int64`](/sql-reference/data-types/int-uint)

**示例**

**使用示例**

```sql title=Query
WITH toDateTime64('2025-02-13 23:31:31.011', 3, 'UTC') AS dt64
SELECT toUnixTimestamp64Second(dt64);
```

```response title=Response
┌─toUnixTimestamp64Second(dt64)─┐
│                    1739489491 │
└───────────────────────────────┘
```

{/*AUTOGENERATED_END*/ }
