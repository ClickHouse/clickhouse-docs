---
slug: /sql-reference/functions/type-conversion-functions
sidebar_position: 185
sidebar_label: 类型转换
---

# 类型转换函数
## 数据转换的常见问题 {#common-issues-with-data-conversion}

ClickHouse 通常采用 [与 C++ 程序相同的行为](https://en.cppreference.com/w/cpp/language/implicit_conversion)。

在某些情况下，`to<type>` 函数与 [cast](#cast) 的行为有所不同，例如在 [LowCardinality](../data-types/lowcardinality.md) 的情况下：[cast](#cast) 会去除 [LowCardinality](../data-types/lowcardinality.md) 特性，而 `to<type>` 函数则不会。对于 [Nullable](../data-types/nullable.md) 也是如此，这种行为与 SQL 标准不兼容，并且可以通过 [cast_keep_nullable](../../operations/settings/settings.md/#cast_keep_nullable) 设置来更改。

:::note
请注意，如果数据类型的值被转换为较小的数据类型（例如从 `Int64` 转换为 `Int32`）或在不兼容的数据类型之间转换（例如从 `String` 转换为 `Int`），可能会导致潜在的数据丢失。请确保仔细检查结果是否如预期。
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
## toBool {#tobool}

将输入值转换为 [`Bool`](../data-types/boolean.md) 类型的值。如果发生错误，则抛出异常。

**语法**

```sql
toBool(expr)
```

**参数**

- `expr` — 返回数字或字符串的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值。
- 类型为 Float32/64 的值。
- 字符串 `true` 或 `false`（不区分大小写）。

**返回值**

- 基于对参数的评估返回 `true` 或 `false`。 [Bool](../data-types/boolean.md)。

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

- `expr` — 返回数字或字符串表示数字的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

不支持的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt8('0xc0fe');`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
例如：`SELECT toInt8(128) == -128;`。
:::

**返回值**

- 8 位整数值。 [Int8](../data-types/int-uint.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
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

**另见**

- [`toInt8OrZero`](#toint8orzero)。
- [`toInt8OrNull`](#toInt8OrNull)。
- [`toInt8OrDefault`](#toint8ordefault)。
## toInt8OrZero {#toint8orzero}

与 [`toInt8`](#toint8) 类似，该函数将输入值转换为 [Int8](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toInt8OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- 普通 Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt8OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 成功时返回 8 位整数值，否则返回 `0`。 [Int8](../data-types/int-uint.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
:::

**示例**

查询：

``` sql
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

**另见**

- [`toInt8`](#toint8)。
- [`toInt8OrNull`](#toInt8OrNull)。
- [`toInt8OrDefault`](#toint8ordefault)。
## toInt8OrNull {#toInt8OrNull}

与 [`toInt8`](#toint8) 类似，该函数将输入值转换为 [Int8](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toInt8OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt8OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 成功时返回 8 位整数值，否则返回 `NULL`。 [Int8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
:::

**示例**

查询：

``` sql
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

**另见**

- [`toInt8`](#toint8)。
- [`toInt8OrZero`](#toint8orzero)。
- [`toInt8OrDefault`](#toint8ordefault)。
## toInt8OrDefault {#toint8ordefault}

与 [`toInt8`](#toint8) 类似，该函数将输入值转换为 [Int8](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。如果没有传递 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt8OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default`（可选） — 如果解析到 `Int8` 类型不成功，则返回的默认值。 [Int8](../data-types/int-uint.md)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

在以下情况下返回默认值：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt8OrDefault('0xc0fe', CAST('-1', 'Int8'));`。

:::note
如果输入值无法在 [Int8](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 成功时返回 8 位整数值，否则返回传入的默认值（如果提供）或 `0`（如果未提供）。 [Int8](../data-types/int-uint.md)。

:::note
- 该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
- 默认值类型应与转换类型相同。
:::

**示例**

查询：

``` sql
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

**另见**

- [`toInt8`](#toint8)。
- [`toInt8OrZero`](#toint8orzero)。
- [`toInt8OrNull`](#toInt8OrNull)。
## toInt16 {#toint16}

将输入值转换为 [`Int16`](../data-types/int-uint.md) 类型的值。如果发生错误，则抛出异常。

**语法**

```sql
toInt16(expr)
```

**参数**

- `expr` — 返回数字或字符串表示数字的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

不支持的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt16('0xc0fe');`。

:::note
如果输入值无法在 [Int16](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
例如：`SELECT toInt16(32768) == -32768;`。
:::

**返回值**

- 16 位整数值。 [Int16](../data-types/int-uint.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
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
Row 1:
──────
toInt16(-16):    -16
toInt16(-16.16): -16
toInt16('-16'):  -16
```

**另见**

- [`toInt16OrZero`](#toint16orzero)。
- [`toInt16OrNull`](#toint16ornull)。
- [`toInt16OrDefault`](#toint16ordefault)。
## toInt16OrZero {#toint16orzero}

与 [`toInt16`](#toint16) 类似，该函数将输入值转换为 [Int16](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toInt16OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt16OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int16](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 16 位整数值如果成功，否则返回 `0`。 [Int16](../data-types/int-uint.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
:::

**示例**

查询：

``` sql
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

**另见**

- [`toInt16`](#toint16)。
- [`toInt16OrNull`](#toint16ornull)。
- [`toInt16OrDefault`](#toint16ordefault)。
## toInt16OrNull {#toint16ornull}

与 [`toInt16`](#toint16) 类似，该函数将输入值转换为 [Int16](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toInt16OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt16OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int16](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 成功时返回 16 位整数值，否则返回 `NULL`。 [Int16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
:::

**示例**

查询：

``` sql
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

- [`toInt16`](#toint16)。
- [`toInt16OrZero`](#toint16orzero)。
- [`toInt16OrDefault`](#toint16ordefault)。
## toInt16OrDefault {#toint16ordefault}

与 [`toInt16`](#toint16) 类似，该函数将输入值转换为 [Int16](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。如果没有传递 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt16OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default`（可选） — 如果解析到 `Int16` 类型不成功，则返回的默认值。 [Int16](../data-types/int-uint.md)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

在以下情况下返回默认值：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt16OrDefault('0xc0fe', CAST('-1', 'Int16'));`。

:::note
如果输入值无法在 [Int16](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 成功时返回 16 位整数值，否则返回传入的默认值（如果提供）或 `0`（如果未提供）。 [Int16](../data-types/int-uint.md)。

:::note
- 该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
- 默认值类型应与转换类型相同。
:::

**示例**

查询：

``` sql
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

**另见**

- [`toInt16`](#toint16)。
- [`toInt16OrZero`](#toint16orzero)。
- [`toInt16OrNull`](#toint16ornull)。
## toInt32 {#toint32}

将输入值转换为 [`Int32`](../data-types/int-uint.md) 类型的值。如果发生错误，则抛出异常。

**语法**

```sql
toInt32(expr)
```

**参数**

- `expr` — 返回数字或字符串表示数字的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

不支持的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt32('0xc0fe');`。

:::note
如果输入值无法在 [Int32](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
例如：`SELECT toInt32(2147483648) == -2147483648;`。
:::

**返回值**

- 32 位整数值。 [Int32](../data-types/int-uint.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
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

**另见**

- [`toInt32OrZero`](#toint32orzero)。
- [`toInt32OrNull`](#toint32ornull)。
- [`toInt32OrDefault`](#toint32ordefault)。
## toInt32OrZero {#toint32orzero}

与 [`toInt32`](#toint32) 类似，该函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toInt32OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt32OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int32](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 32 位整数值如果成功，否则返回 `0`。 [Int32](../data-types/int-uint.md) 

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
:::

**示例**

查询：

``` sql
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
**另见**

- [`toInt32`](#toint32)。
- [`toInt32OrNull`](#toint32ornull)。
- [`toInt32OrDefault`](#toint32ordefault)。
## toInt32OrNull {#toint32ornull}

与 [`toInt32`](#toint32) 类似，该函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toInt32OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt32OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int32](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 成功时返回 32 位整数值，否则返回 `NULL`。 [Int32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
:::

**示例**

查询：

``` sql
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

**另见**

- [`toInt32`](#toint32)。
- [`toInt32OrZero`](#toint32orzero)。
- [`toInt32OrDefault`](#toint32ordefault)。
## toInt32OrDefault {#toint32ordefault}

与 [`toInt32`](#toint32) 类似，该函数将输入值转换为 [Int32](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。如果没有传递 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt32OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default`（可选） — 如果解析到 `Int32` 类型不成功，则返回的默认值。 [Int32](../data-types/int-uint.md)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

在以下情况下返回默认值：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt32OrDefault('0xc0fe', CAST('-1', 'Int32'));`。

:::note
如果输入值无法在 [Int32](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 成功时返回 32 位整数值，否则返回传入的默认值（如果提供）或 `0`（如果未提供）。 [Int32](../data-types/int-uint.md)。

:::note
- 该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
- 默认值类型应与转换类型相同。
:::

**示例**

查询：

``` sql
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

**另见**

- [`toInt32`](#toint32)。
- [`toInt32OrZero`](#toint32orzero)。
- [`toInt32OrNull`](#toint32ornull)。
## toInt64 {#toint64}

将输入值转换为 [`Int64`](../data-types/int-uint.md) 类型的值。如果发生错误，则抛出异常。

**语法**

```sql
toInt64(expr)
```

**参数**

- `expr` — 返回数字或字符串表示数字的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

不支持的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt64('0xc0fe');`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
例如：`SELECT toInt64(9223372036854775808) == -9223372036854775808;`。
:::

**返回值**

- 64 位整数值。 [Int64](../data-types/int-uint.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
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

**另见**

- [`toInt64OrZero`](#toint64orzero)。
- [`toInt64OrNull`](#toint64ornull)。
- [`toInt64OrDefault`](#toint64ordefault)。
## toInt64OrZero {#toint64orzero}

与 [`toInt64`](#toint64) 类似，该函数将输入值转换为 [Int64](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toInt64OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt64OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 64 位整数值如果成功，否则返回 `0`。 [Int64](../data-types/int-uint.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
:::


**示例**

查询：

``` sql
SELECT
    toInt64OrZero('-64'),
    toInt64OrZero('abc')
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
toInt64OrZero('-64'): -64
toInt64OrZero('abc'): 0
```

**另见**

- [`toInt64`](#toint64)。
- [`toInt64OrNull`](#toint64ornull)。
- [`toInt64OrDefault`](#toint64ordefault)。
## toInt64OrNull {#toint64ornull}

与 [`toInt64`](#toint64) 类似，该函数将输入值转换为 [Int64](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toInt64OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt64OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 成功时返回 64 位整数值，否则返回 `NULL`。 [Int64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
:::

**示例**

查询：

``` sql
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

**另见**

- [`toInt64`](#toint64)。
- [`toInt64OrZero`](#toint64orzero)。
- [`toInt64OrDefault`](#toint64ordefault)。
## toInt64OrDefault {#toint64ordefault}

与 [`toInt64`](#toint64) 类似，该函数将输入值转换为 [Int64](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。如果没有传递 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toInt64OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default`（可选） — 如果解析到 `Int64` 类型不成功，则返回的默认值。 [Int64](../data-types/int-uint.md)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

在以下情况下返回默认值：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt64OrDefault('0xc0fe', CAST('-1', 'Int64'));`。

:::note
如果输入值无法在 [Int64](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 成功时返回 64 位整数值，否则返回传入的默认值（如果提供）或 `0`（如果未提供）。 [Int64](../data-types/int-uint.md)。

:::note
- 该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
- 默认值类型应与转换类型相同。
:::

**示例**

查询：

``` sql
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

**另见**

- [`toInt64`](#toint64)。
- [`toInt64OrZero`](#toint64orzero)。
- [`toInt64OrNull`](#toint64ornull)。
## toInt128 {#toint128}

将输入值转换为 [`Int128`](../data-types/int-uint.md) 类型的值。如果发生错误，则抛出异常。

**语法**

```sql
toInt128(expr)
```

**参数**

- `expr` — 返回数字或字符串表示数字的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

不支持的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt128('0xc0fe');`。

:::note
如果输入值无法在 [Int128](../data-types/int-uint.md) 的范围内表示，则会发生溢出或下溢。这不算作错误。
:::

**返回值**

- 128 位整数值。 [Int128](../data-types/int-uint.md)。

:::note
该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 的方式，即截断数字的分数位。
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

**另见**

- [`toInt128OrZero`](#toint128orzero)。
- [`toInt128OrNull`](#toint128ornull)。
- [`toInt128OrDefault`](#toint128ordefault)。

## toInt128OrZero {#toint128orzero}

像 [`toInt128`](#toint128) 这个函数一样，转换输入值为 [Int128](../data-types/int-uint.md) 类型的值，但在出现错误时返回 `0`。

**语法**

```sql
toInt128OrZero(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt128OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int128](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 128 位整数值，否则返回 `0`。 [Int128](../data-types/int-uint.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
:::

**示例**

查询：

``` sql
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

**参见**

- [`toInt128`](#toint128)。
- [`toInt128OrNull`](#toint128ornull)。
- [`toInt128OrDefault`](#toint128ordefault)。
## toInt128OrNull {#toint128ornull}

像 [`toInt128`](#toint128) 这个函数一样，转换输入值为 [Int128](../data-types/int-uint.md) 类型的值，但在出现错误时返回 `NULL`。

**语法**

```sql
toInt128OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt128OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int128](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 128 位整数值，否则返回 `NULL`。 [Int128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
:::

**示例**

查询：

``` sql
SELECT
    toInt128OrNull('-128'),
    toInt128OrNull('abc')
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
toInt128OrNull('-128'): -128
toInt128OrNull('abc'):  ᴺᵁᴸᴸ
```

**参见**

- [`toInt128`](#toint128)。
- [`toInt128OrZero`](#toint128orzero)。
- [`toInt128OrDefault`](#toint128ordefault)。
## toInt128OrDefault {#toint128ordefault}

像 [`toInt128`](#toint128) 这个函数一样，将输入值转换为 [Int128](../data-types/int-uint.md) 类型的值，但在出现错误时返回默认值。
如果未传递 `default` 值，则在出现错误时返回 `0`。

**语法**

```sql
toInt128OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default` （可选）— 如果解析为 `Int128` 类型不成功时要返回的默认值。 [Int128](../data-types/int-uint.md)。

支持的参数：
- (U)Int8/16/32/64/128/256。
- Float32/64。
- (U)Int8/16/32/128/256 的字符串表示。

为默认值返回的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt128OrDefault('0xc0fe', CAST('-1', 'Int128'));`。

:::note
如果输入值无法在 [Int128](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 128 位整数值，否则返回传递的默认值，如果没有则返回 `0`。 [Int128](../data-types/int-uint.md)。

:::note
- 该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
- 默认值类型应与转换类型相同。
:::

**示例**

查询：

``` sql
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

**参见**

- [`toInt128`](#toint128)。
- [`toInt128OrZero`](#toint128orzero)。
- [`toInt128OrNull`](#toint128ornull)。
## toInt256 {#toint256}

将输入值转换为 [`Int256`](../data-types/int-uint.md) 类型的值。在出现错误时抛出异常。

**语法**

```sql
toInt256(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

不支持的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt256('0xc0fe');`。

:::note
如果输入值无法在 [Int256](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 256 位整数值。 [Int256](../data-types/int-uint.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
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

**参见**

- [`toInt256OrZero`](#toint256orzero)。
- [`toInt256OrNull`](#toint256ornull)。
- [`toInt256OrDefault`](#toint256ordefault)。
## toInt256OrZero {#toint256orzero}

像 [`toInt256`](#toint256) 这个函数一样，将输入值转换为 [Int256](../data-types/int-uint.md) 类型的值，但在出现错误时返回 `0`。

**语法**

```sql
toInt256OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt256OrZero('0xc0fe');`。

:::note
如果输入值无法在 [Int256](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 256 位整数值，否则返回 `0`。 [Int256](../data-types/int-uint.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
:::

**示例**

查询：

``` sql
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

**参见**

- [`toInt256`](#toint256)。
- [`toInt256OrNull`](#toint256ornull)。
- [`toInt256OrDefault`](#toint256ordefault)。
## toInt256OrNull {#toint256ornull}

像 [`toInt256`](#toint256) 这个函数一样，将输入值转换为 [Int256](../data-types/int-uint.md) 类型的值，但在出现错误时返回 `NULL`。

**语法**

```sql
toInt256OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt256OrNull('0xc0fe');`。

:::note
如果输入值无法在 [Int256](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 256 位整数值，否则返回 `NULL`。 [Int256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
:::

**示例**

查询：

``` sql
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

**参见**

- [`toInt256`](#toint256)。
- [`toInt256OrZero`](#toint256orzero)。
- [`toInt256OrDefault`](#toint256ordefault)。
## toInt256OrDefault {#toint256ordefault}

像 [`toInt256`](#toint256) 这个函数一样，将输入值转换为 [Int256](../data-types/int-uint.md) 类型的值，但在出现错误时返回默认值。
如果未传递 `default` 值，则在出现错误时返回 `0`。

**语法**

```sql
toInt256OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default` （可选）— 如果解析为 `Int256` 类型不成功时要返回的默认值。 [Int256](../data-types/int-uint.md)。

支持的参数：
- (U)Int8/16/32/64/128/256 的值或字符串表示。
- Float32/64 的值。

为默认值返回的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toInt256OrDefault('0xc0fe', CAST('-1', 'Int256'));`。

:::note
如果输入值无法在 [Int256](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 256 位整数值，否则返回传递的默认值，如果没有则返回 `0`。 [Int256](../data-types/int-uint.md)。

:::note
- 该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
- 默认值类型应与转换类型相同。
:::

**示例**

查询：

``` sql
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

**参见**

- [`toInt256`](#toint256)。
- [`toInt256OrZero`](#toint256orzero)。
- [`toInt256OrNull`](#toint256ornull)。
## toUInt8 {#touint8}

将输入值转换为 [`UInt8`](../data-types/int-uint.md) 类型的值。如果出现错误则抛出异常。

**语法**

```sql
toUInt8(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- (U)Int8/16/32/64/128/256 类型的值或字符串表示。
- Float32/64 型的值。

不支持的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt8('0xc0fe');`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
例如：`SELECT toUInt8(256) == 0;`。
:::

**返回值**

- 8 位无符号整数值。 [UInt8](../data-types/int-uint.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
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

**参见**

- [`toUInt8OrZero`](#touint8orzero)。
- [`toUInt8OrNull`](#touint8ornull)。
- [`toUInt8OrDefault`](#touint8ordefault)。
## toUInt8OrZero {#touint8orzero}

像 [`toUInt8`](#touint8) 这个函数一样，将输入值转换为 [UInt8](../data-types/int-uint.md) 类型的值，但在出现错误时返回 `0`。

**语法**

```sql
toUInt8OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- 普通 Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt8OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 8 位无符号整数值，否则返回 `0`。 [UInt8](../data-types/int-uint.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
:::

**示例**

查询：

``` sql
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

**参见**

- [`toUInt8`](#touint8)。
- [`toUInt8OrNull`](#touint8ornull)。
- [`toUInt8OrDefault`](#touint8ordefault)。
## toUInt8OrNull {#touint8ornull}

像 [`toUInt8`](#touint8) 这个函数一样，将输入值转换为 [UInt8](../data-types/int-uint.md) 类型的值，但在出现错误时返回 `NULL`。

**语法**

```sql
toUInt8OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt8OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 8 位无符号整数值，否则返回 `NULL`。 [UInt8](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
:::

**示例**

查询：

``` sql
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

**参见**

- [`toUInt8`](#touint8)。
- [`toUInt8OrZero`](#touint8orzero)。
- [`toUInt8OrDefault`](#touint8ordefault)。
## toUInt8OrDefault {#touint8ordefault}

像 [`toUInt8`](#touint8) 这个函数一样，将输入值转换为 [UInt8](../data-types/int-uint.md) 类型的值，但在出现错误时返回默认值。
如果未传递 `default` 值，则在出现错误时返回 `0`。

**语法**

```sql
toUInt8OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default` （可选）— 如果解析为 `UInt8` 类型不成功时要返回的默认值。 [UInt8](../data-types/int-uint.md)。

支持的参数：
- (U)Int8/16/32/64/128/256 类型的值或字符串表示。
- Float32/64 类型的值。

为默认值返回的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt8OrDefault('0xc0fe', CAST('0', 'UInt8'));`。

:::note
如果输入值无法在 [UInt8](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 8 位无符号整数值，否则返回传递的默认值，如果没有则返回 `0`。 [UInt8](../data-types/int-uint.md)。

:::note
- 该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
- 默认值类型应与转换类型相同。
:::

**示例**

查询：

``` sql
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

**参见**

- [`toUInt8`](#touint8)。
- [`toUInt8OrZero`](#touint8orzero)。
- [`toUInt8OrNull`](#touint8ornull)。
## toUInt16 {#touint16}

将输入值转换为 [`UInt16`](../data-types/int-uint.md) 类型的值。如果出现错误则抛出异常。

**语法**

```sql
toUInt16(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- (U)Int8/16/32/64/128/256 类型的值或字符串表示。
- Float32/64 类型的值。

不支持的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt16('0xc0fe');`。

:::note
如果输入值无法在 [UInt16](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
例如：`SELECT toUInt16(65536) == 0;`。
:::

**返回值**

- 16 位无符号整数值。 [UInt16](../data-types/int-uint.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
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
Row 1:
──────
toUInt16(16):    16
toUInt16(16.16): 16
toUInt16('16'):  16
```

**参见**

- [`toUInt16OrZero`](#touint16orzero)。
- [`toUInt16OrNull`](#touint16ornull)。
- [`toUInt16OrDefault`](#touint16ordefault)。
## toUInt16OrZero {#touint16orzero}

像 [`toUInt16`](#touint16) 这个函数一样，将输入值转换为 [UInt16](../data-types/int-uint.md) 类型的值，但在出现错误时返回 `0`。

**语法**

```sql
toUInt16OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt16OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt16](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 16 位无符号整数值，否则返回 `0`。 [UInt16](../data-types/int-uint.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
:::

**示例**

查询：

``` sql
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

**参见**

- [`toUInt16`](#touint16)。
- [`toUInt16OrNull`](#touint16ornull)。
- [`toUInt16OrDefault`](#touint16ordefault)。
## toUInt16OrNull {#touint16ornull}

像 [`toUInt16`](#touint16) 这个函数一样，将输入值转换为 [UInt16](../data-types/int-uint.md) 类型的值，但在出现错误时返回 `NULL`。

**语法**

```sql
toUInt16OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt16OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt16](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 16 位无符号整数值，否则返回 `NULL`。 [UInt16](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
:::

**示例**

查询：

``` sql
SELECT
    toUInt16OrNull('16'),
    toUInt16OrNull('abc')
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
toUInt16OrNull('16'):  16
toUInt16OrNull('abc'): ᴺᵁᴸᴸ
```

**参见**

- [`toUInt16`](#touint16)。
- [`toUInt16OrZero`](#touint16orzero)。
- [`toUInt16OrDefault`](#touint16ordefault)。
## toUInt16OrDefault {#touint16ordefault}

像 [`toUInt16`](#touint16) 这个函数一样，将输入值转换为 [UInt16](../data-types/int-uint.md) 类型的值，但在出现错误时返回默认值。
如果未传递 `default` 值，则在出现错误时返回 `0`。

**语法**

```sql
toUInt16OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default` （可选）— 如果解析为 `UInt16` 类型不成功时要返回的默认值。 [UInt16](../data-types/int-uint.md)。

支持的参数：
- (U)Int8/16/32/64/128/256 类型的值或字符串表示。
- Float32/64 类型的值。

为默认值返回的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt16OrDefault('0xc0fe', CAST('0', 'UInt16'));`。

:::note
如果输入值无法在 [UInt16](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 16 位无符号整数值，否则返回传递的默认值，如果没有则返回 `0`。 [UInt16](../data-types/int-uint.md)。

:::note
- 该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
- 默认值类型应与转换类型相同。
:::

**示例**

查询：

``` sql
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

**参见**

- [`toUInt16`](#touint16)。
- [`toUInt16OrZero`](#touint16orzero)。
- [`toUInt16OrNull`](#touint16ornull)。
## toUInt32 {#touint32}

将输入值转换为 [`UInt32`](../data-types/int-uint.md) 类型的值。如果出现错误则抛出异常。

**语法**

```sql
toUInt32(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- (U)Int8/16/32/64/128/256 类型的值或字符串表示。
- Float32/64 类型的值。

不支持的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt32('0xc0fe');`。

:::note
如果输入值无法在 [UInt32](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
例如：`SELECT toUInt32(4294967296) == 0;`。
:::

**返回值**

- 32 位无符号整数值。 [UInt32](../data-types/int-uint.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
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
Row 1:
──────
toUInt32(32):    32
toUInt32(32.32): 32
toUInt32('32'):  32
```

**参见**

- [`toUInt32OrZero`](#touint32orzero)。
- [`toUInt32OrNull`](#touint32ornull)。
- [`toUInt32OrDefault`](#touint32ordefault)。
## toUInt32OrZero {#touint32orzero}

像 [`toUInt32`](#touint32) 这个函数一样，将输入值转换为 [UInt32](../data-types/int-uint.md) 类型的值，但在出现错误时返回 `0`。

**语法**

```sql
toUInt32OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt32OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt32](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 32 位无符号整数值，否则返回 `0`。[UInt32](../data-types/int-uint.md)

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
:::

**示例**

查询：

``` sql
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
**参见**

- [`toUInt32`](#touint32)。
- [`toUInt32OrNull`](#touint32ornull)。
- [`toUInt32OrDefault`](#touint32ordefault)。
## toUInt32OrNull {#touint32ornull}

像 [`toUInt32`](#touint32) 这个函数一样，将输入值转换为 [UInt32](../data-types/int-uint.md) 类型的值，但在出现错误时返回 `NULL`。

**语法**

```sql
toUInt32OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt32OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt32](../data-types/int-uint.md) 的范围内表示，则结果会发生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，返回 32 位无符号整数值，否则返回 `NULL`。 [UInt32](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数使用 [向零舍入](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它截断数字的小数位。
:::

**示例**

查询：

``` sql
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

**参见**

- [`toUInt32`](#touint32)。
- [`toUInt32OrZero`](#touint32orzero)。
- [`toUInt32OrDefault`](#touint32ordefault)。
```

## toUInt32OrDefault {#touint32ordefault}

像 [`toUInt32`](#touint32)，这个函数将输入值转换为 [UInt32](../data-types/int-uint.md) 类型的值，但在出现错误的情况下返回默认值。
如果没有传递 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toUInt32OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default`（可选）— 如果解析为 `UInt32` 类型不成功时返回的默认值。 [UInt32](../data-types/int-uint.md)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

返回默认值的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt32OrDefault('0xc0fe', CAST('0', 'UInt32'));`。

:::note
如果输入值无法在 [UInt32](../data-types/int-uint.md) 的范围内表示，则会发生结果的溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，则返回 32 位无符号整数值；如果失败，则返回传递的默认值或 `0`（如果没有传递）。 [UInt32](../data-types/int-uint.md)。

:::note
- 该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
- 默认值类型应与转换类型相同。
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
Row 1:
──────
toUInt32OrDefault('32', CAST('0', 'UInt32')):  32
toUInt32OrDefault('abc', CAST('0', 'UInt32')): 0
```

**另请参阅**

- [`toUInt32`](#touint32).
- [`toUInt32OrZero`](#touint32orzero).
- [`toUInt32OrNull`](#touint32ornull).

## toUInt64 {#touint64}

将输入值转换为 [`UInt64`](../data-types/int-uint.md) 类型的值。如果发生错误，将抛出异常。

**语法**

```sql
toUInt64(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值。

不支持的类型：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt64('0xc0fe');`。

:::note
如果输入值无法在 [UInt64](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
例如：`SELECT toUInt64(18446744073709551616) == 0;`
:::

**返回值**

- 64 位无符号整数值。 [UInt64](../data-types/int-uint.md)。

:::note
该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
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

- [`toUInt64OrZero`](#touint64orzero).
- [`toUInt64OrNull`](#touint64ornull).
- [`toUInt64OrDefault`](#touint64ordefault).

## toUInt64OrZero {#touint64orzero}

像 [`toUInt64`](#touint64)，这个函数将输入值转换为 [UInt64](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toUInt64OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt64OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt64](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，则返回 64 位无符号整数值；否则返回 `0`。 [UInt64](../data-types/int-uint.md)。

:::note
该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
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

**另请参阅**

- [`toUInt64`](#touint64).
- [`toUInt64OrNull`](#touint64ornull).
- [`toUInt64OrDefault`](#touint64ordefault).

## toUInt64OrNull {#touint64ornull}

像 [`toUInt64`](#touint64)，这个函数将输入值转换为 [UInt64](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toUInt64OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt64OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt64](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，则返回 64 位无符号整数值；否则返回 `NULL`。 [UInt64](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
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

- [`toUInt64`](#touint64).
- [`toUInt64OrZero`](#touint64orzero).
- [`toUInt64OrDefault`](#touint64ordefault).

## toUInt64OrDefault {#touint64ordefault}

像 [`toUInt64`](#touint64)，这个函数将输入值转换为 [UInt64](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果没有传递 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toUInt64OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default`（可选）— 如果解析为 `UInt64` 类型不成功时返回的默认值。 [UInt64](../data-types/int-uint.md)。

支持的参数：
- (U)Int8/16/32/64/128/256 的值或字符串表示。
- Float32/64 的值。

返回默认值的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt64OrDefault('0xc0fe', CAST('0', 'UInt64'));`。

:::note
如果输入值无法在 [UInt64](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，则返回 64 位无符号整数值；否则返回传递的默认值（如果有）或 `0`（如果没有）。 [UInt64](../data-types/int-uint.md)。

:::note
- 该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
- 默认值类型应与转换类型相同。
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

- [`toUInt64`](#touint64).
- [`toUInt64OrZero`](#touint64orzero).
- [`toUInt64OrNull`](#touint64ornull).

## toUInt128 {#touint128}

将输入值转换为 [`UInt128`](../data-types/int-uint.md) 类型的值。如果发生错误，将抛出异常。

**语法**

```sql
toUInt128(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- (U)Int8/16/32/64/128/256 的值或字符串表示。
- Float32/64 类型的值。

不支持的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt128('0xc0fe');`。

:::note
如果输入值无法在 [UInt128](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 128 位无符号整数值。 [UInt128](../data-types/int-uint.md)。

:::note
该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
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
Row 1:
──────
toUInt128(128):   128
toUInt128(128.8): 128
toUInt128('128'): 128
```

**另请参阅**

- [`toUInt128OrZero`](#touint128orzero).
- [`toUInt128OrNull`](#touint128ornull).
- [`toUInt128OrDefault`](#touint128ordefault).

## toUInt128OrZero {#touint128orzero}

像 [`toUInt128`](#touint128)，这个函数将输入值转换为 [UInt128](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toUInt128OrZero(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt128OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt128](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，则返回 128 位无符号整数值；否则返回 `0`。 [UInt128](../data-types/int-uint.md)。

:::note
该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
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
Row 1:
──────
toUInt128OrZero('128'): 128
toUInt128OrZero('abc'): 0
```

**另请参阅**

- [`toUInt128`](#touint128).
- [`toUInt128OrNull`](#touint128ornull).
- [`toUInt128OrDefault`](#touint128ordefault).

## toUInt128OrNull {#touint128ornull}

像 [`toUInt128`](#touint128)，这个函数将输入值转换为 [UInt128](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toUInt128OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt128OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt128](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，则返回 128 位无符号整数值；否则返回 `NULL`。 [UInt128](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
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

- [`toUInt128`](#touint128).
- [`toUInt128OrZero`](#touint128orzero).
- [`toUInt128OrDefault`](#touint128ordefault).

## toUInt128OrDefault {#touint128ordefault}

像 [`toUInt128`](#toint128)，这个函数将输入值转换为 [UInt128](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果没有传递 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toUInt128OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default`（可选）— 如果解析为 `UInt128` 类型不成功时返回的默认值。 [UInt128](../data-types/int-uint.md)。

支持的参数：
- (U)Int8/16/32/64/128/256。
- Float32/64。
- (U)Int8/16/32/128/256 的字符串表示。

返回默认值的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt128OrDefault('0xc0fe', CAST('0', 'UInt128'));`。

:::note
如果输入值无法在 [UInt128](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，则返回 128 位无符号整数值；否则返回传递的默认值（如果有）或 `0`（如果没有）。 [UInt128](../data-types/int-uint.md)。

:::note
- 该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
- 默认值类型应与转换类型相同。
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

**另请参阅**

- [`toUInt128`](#touint128).
- [`toUInt128OrZero`](#touint128orzero).
- [`toUInt128OrNull`](#touint128ornull).

## toUInt256 {#touint256}

将输入值转换为 [`UInt256`](../data-types/int-uint.md) 类型的值。如果发生错误，将抛出异常。

**语法**

```sql
toUInt256(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- (U)Int8/16/32/64/128/256 的值或字符串表示。
- Float32/64 类型的值。

不支持的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt256('0xc0fe');`。

:::note
如果输入值无法在 [UInt256](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 256 位无符号整数值。 [Int256](../data-types/int-uint.md)。

:::note
该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
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
Row 1:
──────
toUInt256(256):     256
toUInt256(256.256): 256
toUInt256('256'):   256
```

**另请参阅**

- [`toUInt256OrZero`](#touint256orzero).
- [`toUInt256OrNull`](#touint256ornull).
- [`toUInt256OrDefault`](#touint256ordefault).

## toUInt256OrZero {#touint256orzero}

像 [`toUInt256`](#touint256)，这个函数将输入值转换为 [UInt256](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toUInt256OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `0`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt256OrZero('0xc0fe');`。

:::note
如果输入值无法在 [UInt256](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，则返回 256 位无符号整数值；否则返回 `0`。 [UInt256](../data-types/int-uint.md)。

:::note
该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
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

- [`toUInt256`](#touint256).
- [`toUInt256OrNull`](#touint256ornull).
- [`toUInt256OrDefault`](#touint256ordefault).

## toUInt256OrNull {#touint256ornull}

像 [`toUInt256`](#touint256)，这个函数将输入值转换为 [UInt256](../data-types/int-uint.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toUInt256OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256 的字符串表示。

不支持的参数（返回 `\N`）：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt256OrNull('0xc0fe');`。

:::note
如果输入值无法在 [UInt256](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，则返回 256 位无符号整数值；否则返回 `NULL`。 [UInt256](../data-types/int-uint.md) / [NULL](../data-types/nullable.md)。

:::note
该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
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

- [`toUInt256`](#touint256).
- [`toUInt256OrZero`](#touint256orzero).
- [`toUInt256OrDefault`](#touint256ordefault).

## toUInt256OrDefault {#touint256ordefault}

像 [`toUInt256`](#touint256)，这个函数将输入值转换为 [UInt256](../data-types/int-uint.md) 类型的值，但在发生错误时返回默认值。
如果没有传递 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toUInt256OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default`（可选）— 如果解析为 `UInt256` 类型不成功时返回的默认值。 [UInt256](../data-types/int-uint.md)。

支持的参数：
- (U)Int8/16/32/64/128/256。
- Float32/64。
- (U)Int8/16/32/128/256 的字符串表示。

返回默认值的参数：
- Float32/64 值的字符串表示，包括 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toUInt256OrDefault('0xc0fe', CAST('0', 'UInt256'));`。

:::note
如果输入值无法在 [UInt256](../data-types/int-uint.md) 的范围内表示，则结果会产生溢出或下溢。
这不被视为错误。
:::

**返回值**

- 如果成功，则返回 256 位无符号整数值；否则返回传递的默认值（如果有）或 `0`（如果没有）。 [UInt256](../data-types/int-uint.md)。

:::note
- 该函数采用 [四舍五入到零](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)，意味着它会截断数字的小数位。
- 默认值类型应与转换类型相同。
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

- [`toUInt256`](#touint256).
- [`toUInt256OrZero`](#touint256orzero).
- [`toUInt256OrNull`](#touint256ornull).

## toFloat32 {#tofloat32}

将输入值转换为 [`Float32`](../data-types/float.md) 类型的值。如果发生错误，将抛出异常。

**语法**

```sql
toFloat32(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- (U)Int8/16/32/64/128/256 的值。
- (U)Int8/16/32/128/256 的字符串表示。
- Float32/64 类型的值，包括 `NaN` 和 `Inf`。
- Float32/64 的字符串表示，包括 `NaN` 和 `Inf`（不区分大小写）。

不支持的参数：
- 二进制和十六进制值的字符串表示，例如 `SELECT toFloat32('0xc0fe');`。

**返回值**

- 32 位浮点值。 [Float32](../data-types/float.md)。

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

- [`toFloat32OrZero`](#tofloat32orzero).
- [`toFloat32OrNull`](#tofloat32ornull).
- [`toFloat32OrDefault`](#tofloat32ordefault).

## toFloat32OrZero {#tofloat32orzero}

像 [`toFloat32`](#tofloat32)，这个函数将输入值转换为 [Float32](../data-types/float.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toFloat32OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256、Float32/64 的字符串表示。

不支持的参数（返回 `0`）：
- 二进制和十六进制值的字符串表示，例如 `SELECT toFloat32OrZero('0xc0fe');`。

**返回值**

- 如果成功，则返回 32 位浮点值；否则返回 `0`。 [Float32](../data-types/float.md)。

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

- [`toFloat32`](#tofloat32).
- [`toFloat32OrNull`](#tofloat32ornull).
- [`toFloat32OrDefault`](#tofloat32ordefault).

## toFloat32OrNull {#tofloat32ornull}

像 [`toFloat32`](#tofloat32)，这个函数将输入值转换为 [Float32](../data-types/float.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toFloat32OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256、Float32/64 的字符串表示。

不支持的参数（返回 `\N`）：
- 二进制和十六进制值的字符串表示，例如 `SELECT toFloat32OrNull('0xc0fe');`。

**返回值**

- 如果成功，则返回 32 位浮点值；否则返回 `\N`。 [Float32](../data-types/float.md)。

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

- [`toFloat32`](#tofloat32).
- [`toFloat32OrZero`](#tofloat32orzero).
- [`toFloat32OrDefault`](#tofloat32ordefault).

## toFloat32OrDefault {#tofloat32ordefault}

像 [`toFloat32`](#tofloat32)，这个函数将输入值转换为 [Float32](../data-types/float.md) 类型的值，但在发生错误时返回默认值。
如果没有传递 `default` 值，则在发生错误时返回 `0`。

**语法**

```sql
toFloat32OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions) / [字符串](../data-types/string.md)。
- `default`（可选）— 如果解析为 `Float32` 类型不成功时返回的默认值。 [Float32](../data-types/float.md)。

支持的参数：
- (U)Int8/16/32/64/128/256 的值。
- (U)Int8/16/32/128/256 的字符串表示。
- Float32/64 类型的值，包括 `NaN` 和 `Inf`。
- Float32/64 字符串表示，包括 `NaN` 和 `Inf`（不区分大小写）。

返回默认值的参数：
- 二进制和十六进制值的字符串表示，例如 `SELECT toFloat32OrDefault('0xc0fe', CAST('0', 'Float32'));`。

**返回值**

- 如果成功，则返回 32 位浮点值；否则返回传递的默认值（如果有）或 `0`（如果没有）。 [Float32](../data-types/float.md)。

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

- [`toFloat32`](#tofloat32).
- [`toFloat32OrZero`](#tofloat32orzero).
- [`toFloat32OrNull`](#tofloat32ornull).

## toFloat64 {#tofloat64}

将输入值转换为 [`Float64`](../data-types/float.md) 类型的值。如果发生错误，将抛出异常。

**语法**

```sql
toFloat64(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [表达式](/sql-reference/syntax#expressions)。

支持的参数：
- (U)Int8/16/32/64/128/256 的值。
- (U)Int8/16/32/128/256 的字符串表示。
- Float32/64 类型的值，包括 `NaN` 和 `Inf`。
- Float32/64 的字符串表示，包括 `NaN` 和 `Inf`（不区分大小写）。

不支持的参数：
- 二进制和十六进制值的字符串表示，例如 `SELECT toFloat64('0xc0fe');`。

**返回值**

- 64 位浮点值。 [Float64](../data-types/float.md)。

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
Row 1:
──────
toFloat64(42.7):   42.7
toFloat64('42.7'): 42.7
toFloat64('NaN'):  nan
```

**另请参阅**

- [`toFloat64OrZero`](#tofloat64orzero).
- [`toFloat64OrNull`](#tofloat64ornull).
- [`toFloat64OrDefault`](#tofloat64ordefault).

## toFloat64OrZero {#tofloat64orzero}

像 [`toFloat64`](#tofloat64)，这个函数将输入值转换为 [Float64](../data-types/float.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toFloat64OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256、Float32/64 的字符串表示。

不支持的参数（返回 `0`）：
- 二进制和十六进制值的字符串表示，例如 `SELECT toFloat64OrZero('0xc0fe');`。

**返回值**

- 如果成功，则返回 64 位浮点值；否则返回 `0`。 [Float64](../data-types/float.md)。

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
Row 1:
──────
toFloat64OrZero('42.7'): 42.7
toFloat64OrZero('abc'):  0
```

**另请参阅**

- [`toFloat64`](#tofloat64).
- [`toFloat64OrNull`](#tofloat64ornull).
- [`toFloat64OrDefault`](#tofloat64ordefault).

## toFloat64OrNull {#tofloat64ornull}

像 [`toFloat64`](#tofloat64)，这个函数将输入值转换为 [Float64](../data-types/float.md) 类型的值，但在发生错误时返回 `NULL`。

**语法**

```sql
toFloat64OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [字符串](../data-types/string.md)。

支持的参数：
- (U)Int8/16/32/128/256、Float32/64 的字符串表示。

不支持的参数（返回 `\N`）：
- 二进制和十六进制值的字符串表示，例如 `SELECT toFloat64OrNull('0xc0fe');`。

**返回值**

- 如果成功，则返回 64 位浮点值；否则返回 `\N`。 [Float64](../data-types/float.md)。

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

- [`toFloat64`](#tofloat64).
- [`toFloat64OrZero`](#tofloat64orzero).
- [`toFloat64OrDefault`](#tofloat64ordefault).
```
```yaml
title: 'toFloat64OrDefault'
sidebar_label: 'toFloat64OrDefault'
keywords: ['toFloat64OrDefault', 'ClickHouse', '函数']
description: '将输入值转换为 Float64 类型的值，但在出错时返回默认值。'
```

## toFloat64OrDefault {#tofloat64ordefault}

与 [`toFloat64`](#tofloat64) 相似，此函数将输入值转换为 [Float64](../data-types/float.md) 类型的值，但在出现错误时返回默认值。
如果没有传递 `default` 值，则在出现错误时返回 `0`。

**语法**

```sql
toFloat64OrDefault(expr[, default])
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [Expression](/sql-reference/syntax#expressions) / [String](../data-types/string.md)。
- `default` （可选） — 解析为 `Float64` 类型失败时返回的默认值。 [Float64](../data-types/float.md)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值。
- (U)Int8/16/32/128/256 的字符串表示。
- 类型为 Float32/64 的值，包括 `NaN` 和 `Inf`。
- 类型为 Float32/64 的字符串表示，包括 `NaN` 和 `Inf`（不区分大小写）。

返回默认值的参数：
- 二进制和十六进制值的字符串表示，例如 `SELECT toFloat64OrDefault('0xc0fe', CAST('0', 'Float64'));`。

**返回值**

- 如果成功则返回 64 位 Float 值，否则返回传递的默认值，如果没有则返回 `0`。 [Float64](../data-types/float.md)。

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

**另见**

- [`toFloat64`](#tofloat64).
- [`toFloat64OrZero`](#tofloat64orzero).
- [`toFloat64OrNull`](#tofloat64ornull).
## toBFloat16 {#tobfloat16}

将输入值转换为 [`BFloat16`](../data-types/float.md/#bfloat16) 类型的值。
在出错时抛出异常。

**语法**

```sql
toBFloat16(expr)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [Expression](/sql-reference/syntax#expressions)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值。
- (U)Int8/16/32/128/256 的字符串表示。
- 类型为 Float32/64 的值，包括 `NaN` 和 `Inf`。
- 类型为 Float32/64 的字符串表示，包括 `NaN` 和 `Inf`（不区分大小写）。

**返回值**

- 16 位脑浮点值。 [BFloat16](../data-types/float.md/#bfloat16)。

**示例**

```sql
SELECT toBFloat16(toFloat32(42.7))

42.5

SELECT toBFloat16(toFloat32('42.7'));

42.5

SELECT toBFloat16('42.7');

42.5
```

**另见**

- [`toBFloat16OrZero`](#tobfloat16orzero).
- [`toBFloat16OrNull`](#tobfloat16ornull).
## toBFloat16OrZero {#tobfloat16orzero}

将字符串输入值转换为 [`BFloat16`](../data-types/float.md/#bfloat16) 类型的值。
如果字符串不表示浮点值，则函数返回零。

**语法**

```sql
toBFloat16OrZero(x)
```

**参数**

- `x` — 数字的字符串表示。 [String](../data-types/string.md)。

支持的参数：

- 数字值的字符串表示。

不支持的参数（返回 `0`）：

- 二进制和十六进制值的字符串表示。
- 数值。

**返回值**

- 16 位脑浮点值，否则为 `0`。 [BFloat16](../data-types/float.md/#bfloat16)。

:::note
该函数允许在从字符串表示转换时的精度无声损失。
:::

**示例**

```sql
SELECT toBFloat16OrZero('0x5E'); -- 不支持的参数

0

SELECT toBFloat16OrZero('12.3'); -- 典型用法

12.25

SELECT toBFloat16OrZero('12.3456789');

12.3125 -- 无声损失精度
```

**另见**

- [`toBFloat16`](#tobfloat16).
- [`toBFloat16OrNull`](#tobfloat16ornull).
## toBFloat16OrNull {#tobfloat16ornull}

将字符串输入值转换为 [`BFloat16`](../data-types/float.md/#bfloat16) 类型的值。
但如果字符串不表示浮点值，则该函数返回 `NULL`。

**语法**

```sql
toBFloat16OrNull(x)
```

**参数**

- `x` — 数字的字符串表示。 [String](../data-types/string.md)。

支持的参数：

- 数字值的字符串表示。

不支持的参数（返回 `NULL`）：

- 二进制和十六进制值的字符串表示。
- 数值。

**返回值**

- 16 位脑浮点值，否则为 `NULL`（`\N`）。 [BFloat16](../data-types/float.md/#bfloat16)。

:::note
该函数允许在从字符串表示转换时的精度无声损失。
:::

**示例**

```sql
SELECT toBFloat16OrNull('0x5E'); -- 不支持的参数

\N

SELECT toBFloat16OrNull('12.3'); -- 典型用法

12.25

SELECT toBFloat16OrNull('12.3456789');

12.3125 -- 无声损失精度
```

**另见**

- [`toBFloat16`](#tobfloat16).
- [`toBFloat16OrZero`](#tobfloat16orzero).
## toDate {#todate}

将参数转换为 [Date](../data-types/date.md) 数据类型。

如果参数是 [DateTime](../data-types/datetime.md) 或 [DateTime64](../data-types/datetime64.md)，它将被截断，并保留 DateTime 的日期部分：

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

如果参数是 [String](../data-types/string.md)，它会被解析为 [Date](../data-types/date.md) 或 [DateTime](../data-types/datetime.md)。如果它被解析为 [DateTime](../data-types/datetime.md)，则使用日期部分：

```sql
SELECT
    toDate('2022-12-30') AS x,
    toTypeName(x)
```

```response
┌──────────x─┬─toTypeName(toDate('2022-12-30'))─┐
│ 2022-12-30 │ Date                             │
└────────────┴──────────────────────────────────┘

1 行在集合中。耗时: 0.001 秒。
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

如果参数是一个数字，并且看起来像 UNIX 时间戳（大于 65535），则将其解释为 [DateTime](../data-types/datetime.md)，然后在当前时区下截断为 [Date](../data-types/date.md)。时区参数可以作为函数的第二个参数指定。截断为 [Date](../data-types/date.md) 取决于时区：

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

以上示例演示了如何在不同的时区中，以相同的 UNIX 时间戳可以被解释为不同的日期。

如果参数是一个数字且小于 65536，则将其解释为自 1970-01-01（第一个 UNIX 天）以来的天数，并转换为 [Date](../data-types/date.md)。它对应于 `Date` 数据类型的内部数值表示。示例：

```sql
SELECT toDate(12345)
```
```response
┌─toDate(12345)─┐
│    2003-10-20 │
└───────────────┘
```

此转换不依赖时区。

如果参数不适合 `Date` 类型的范围，则会导致实现定义的行为，可能饱和到支持的最大日期或溢出：
```sql
SELECT toDate(10000000000.)
```
```response
┌─toDate(10000000000.)─┐
│           2106-02-07 │
└──────────────────────┘
```

函数 `toDate` 也可以用其他形式书写：

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

与 [toDate](#todate) 相同，但在收到无效参数时返回 [Date](../data-types/date.md) 的下边界。仅支持 [String](../data-types/string.md) 参数。

**示例**

查询：

``` sql
SELECT toDateOrZero('2022-12-30'), toDateOrZero('');
```

结果：

```response
┌─toDateOrZero('2022-12-30')─┬─toDateOrZero('')─┐
│                 2022-12-30 │       1970-01-01 │
└────────────────────────────┴──────────────────┘
```
## toDateOrNull {#todateornull}

与 [toDate](#todate) 相同，但在收到无效参数时返回 `NULL`。仅支持 [String](../data-types/string.md) 参数。

**示例**

查询：

``` sql
SELECT toDateOrNull('2022-12-30'), toDateOrNull('');
```

结果：

```response
┌─toDateOrNull('2022-12-30')─┬─toDateOrNull('')─┐
│                 2022-12-30 │             ᴺᵁᴸᴸ │
└────────────────────────────┴──────────────────┘
```
## toDateOrDefault {#todateordefault}

与 [toDate](#todate) 相同，但如果不成功，则返回默认值，该默认值为第二个参数（如果指定），否则为 [Date](../data-types/date.md) 的下边界。

**语法**

``` sql
toDateOrDefault(expr [, default_value])
```

**示例**

查询：

``` sql
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

``` sql
toDateTime(expr[, time_zone ])
```

**参数**

- `expr` — 该值。 [String](../data-types/string.md), [Int](../data-types/int-uint.md), [Date](../data-types/date.md) 或 [DateTime](../data-types/datetime.md)。
- `time_zone` — 时区。 [String](../data-types/string.md)。

:::note
如果 `expr` 是一个数字，则它被解释为自 Unix 纪元开始以来的秒数（作为 Unix 时间戳）。
如果 `expr` 是一个 [String](../data-types/string.md)，它可以被解释为 Unix 时间戳或日期/时间的字符串表示。
因此，短数字字符串表示（最多 4 位数字）的解析因歧义而被显式禁用，例如字符串 `'1999'` 可能既是年份（日期/ DateTime 的不完整字符串表示）或 Unix 时间戳。更长的数字字符串是允许的。
:::

**返回值**

- 一个时间日期。 [DateTime](../data-types/datetime.md)

**示例**

查询：

``` sql
SELECT toDateTime('2022-12-30 13:44:17'), toDateTime(1685457500, 'UTC');
```

结果：

```response
┌─toDateTime('2022-12-30 13:44:17')─┬─toDateTime(1685457500, 'UTC')─┐
│               2022-12-30 13:44:17 │           2023-05-30 14:38:20 │
└───────────────────────────────────┴───────────────────────────────┘
```
## toDateTimeOrZero {#todatetimeorzero}

与 [toDateTime](#todatetime) 相同，但在收到无效参数时返回 [DateTime](../data-types/datetime.md) 的下边界。仅支持 [String](../data-types/string.md) 参数。

**示例**

查询：

``` sql
SELECT toDateTimeOrZero('2022-12-30 13:44:17'), toDateTimeOrZero('');
```

结果：

```response
┌─toDateTimeOrZero('2022-12-30 13:44:17')─┬─toDateTimeOrZero('')─┐
│                     2022-12-30 13:44:17 │  1970-01-01 00:00:00 │
└─────────────────────────────────────────┴──────────────────────┘
```
## toDateTimeOrNull {#todatetimeornull}

与 [toDateTime](#todatetime) 相同，但在收到无效参数时返回 `NULL`。仅支持 [String](../data-types/string.md) 参数。

**示例**

查询：

``` sql
SELECT toDateTimeOrNull('2022-12-30 13:44:17'), toDateTimeOrNull('');
```

结果：

```response
┌─toDateTimeOrNull('2022-12-30 13:44:17')─┬─toDateTimeOrNull('')─┐
│                     2022-12-30 13:44:17 │                 ᴺᵁᴸᴸ │
└─────────────────────────────────────────┴──────────────────────┘
```
## toDateTimeOrDefault {#todatetimeordefault}

与 [toDateTime](#todatetime) 相同，但如果不成功，则返回默认值，该默认值可以是第三个参数（如果指定），否则为 [DateTime](../data-types/datetime.md) 的下边界。

**语法**

``` sql
toDateTimeOrDefault(expr [, time_zone [, default_value]])
```

**示例**

查询：

``` sql
SELECT toDateTimeOrDefault('2022-12-30 13:44:17'), toDateTimeOrDefault('', 'UTC', '2023-01-01'::DateTime('UTC'));
```

结果：

```response
┌─toDateTimeOrDefault('2022-12-30 13:44:17')─┬─toDateTimeOrDefault('', 'UTC', CAST('2023-01-01', 'DateTime(\'UTC\')'))─┐
│                        2022-12-30 13:44:17 │                                                     2023-01-01 00:00:00 │
└────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────┘
```
## toDate32 {#todate32}

将参数转换为 [Date32](../data-types/date32.md) 数据类型。如果值超出范围，`toDate32` 将返回 [Date32](../data-types/date32.md) 支持的边界值。如果参数具有 [Date](../data-types/date.md) 类型，则考虑到其边界。

**语法**

``` sql
toDate32(expr)
```

**参数**

- `expr` — 该值。 [String](../data-types/string.md), [UInt32](../data-types/int-uint.md) 或 [Date](../data-types/date.md)。

**返回值**

- 一个日历日期。类型为 [Date32](../data-types/date32.md)。

**示例**

1. 值在范围内：

``` sql
SELECT toDate32('1955-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1925-01-01'))─┐
│ 1955-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

2. 值超出范围：

``` sql
SELECT toDate32('1899-01-01') AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32('1899-01-01'))─┐
│ 1900-01-01 │ Date32                             │
└────────────┴────────────────────────────────────┘
```

3. 使用 [Date](../data-types/date.md) 参数：

``` sql
SELECT toDate32(toDate('1899-01-01')) AS value, toTypeName(value);
```

```response
┌──────value─┬─toTypeName(toDate32(toDate('1899-01-01')))─┐
│ 1970-01-01 │ Date32                                     │
└────────────┴────────────────────────────────────────────┘
```
## toDate32OrZero {#todate32orzero}

与 [toDate32](#todate32) 相同，但如果收到无效参数，则返回 [Date32](../data-types/date32.md) 的最小值。

**示例**

查询：

``` sql
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

``` sql
SELECT toDate32OrNull('1955-01-01'), toDate32OrNull('');
```

结果：

```response
┌─toDate32OrNull('1955-01-01')─┬─toDate32OrNull('')─┐
│                   1955-01-01 │               ᴺᵁᴸᴸ │
└──────────────────────────────┴────────────────────┘
```
## toDate32OrDefault {#todate32ordefault}

将参数转换为 [Date32](../data-types/date32.md) 数据类型。如果值超出范围，`toDate32OrDefault` 将返回 [Date32](../data-types/date32.md) 支持的下边界值。如果参数具有 [Date](../data-types/date.md) 类型，则考虑到其边界。如果收到无效参数，则返回默认值。

**示例**

查询：

``` sql
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

``` sql
toDateTime64(expr, scale, [timezone])
```

**参数**

- `expr` — 该值。 [String](../data-types/string.md), [UInt32](../data-types/int-uint.md), [Float](../data-types/float.md) 或 [DateTime](../data-types/datetime.md)。
- `scale` - 像素大小（精度）：10<sup>-精度</sup>秒。有效范围：[ 0 : 9 ]。
- `timezone` （可选） - 指定的 datetime64 对象的时区。

**返回值**

- 一个带有亚秒精度的日历日期和时间。 [DateTime64](../data-types/datetime64.md)。

**示例**

1. 值在范围内：

``` sql
SELECT toDateTime64('1955-01-01 00:00:00.000', 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('1955-01-01 00:00:00.000', 3))─┐
│ 1955-01-01 00:00:00.000 │ DateTime64(3)                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

2. 作为具有精度的小数：

``` sql
SELECT toDateTime64(1546300800.000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800., 3))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3)                            │
└─────────────────────────┴──────────────────────────────────────────┘
```

没有小数点，值仍被视为以秒为单位的 Unix 时间戳：

``` sql
SELECT toDateTime64(1546300800000, 3) AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64(1546300800000, 3))─┐
│ 2282-12-31 00:00:00.000 │ DateTime64(3)                              │
└─────────────────────────┴────────────────────────────────────────────┘
```


3. 带有 `timezone`：

``` sql
SELECT toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul') AS value, toTypeName(value);
```

```response
┌───────────────────value─┬─toTypeName(toDateTime64('2019-01-01 00:00:00', 3, 'Asia/Istanbul'))─┐
│ 2019-01-01 00:00:00.000 │ DateTime64(3, 'Asia/Istanbul')                                      │
└─────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```
## toDateTime64OrZero {#todatetime64orzero}

与 [toDateTime64](#todatetime64) 相同，此函数将输入值转换为 [DateTime64](../data-types/datetime64.md) 类型的值，但如果收到无效参数，则返回 [DateTime64](../data-types/datetime64.md) 的最小值。

**语法**

``` sql
toDateTime64OrZero(expr, scale, [timezone])
```

**参数**

- `expr` — 该值。 [String](../data-types/string.md), [UInt32](../data-types/int-uint.md), [Float](../data-types/float.md) 或 [DateTime](../data-types/datetime.md)。
- `scale` - 像素大小（精度）：10<sup>-精度</sup>秒。有效范围：[ 0 : 9 ]。
- `timezone` （可选） - 指定的 DateTime64 对象的时区。

**返回值**

- 一个带有亚秒精度的日历日期和时间，否则为 [DateTime64]：`1970-01-01 01:00:00.000` 的最小值。 [DateTime64](../data-types/datetime64.md)。

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

**另见**

- [toDateTime64](#todatetime64).
- [toDateTime64OrNull](#todatetime64ornull).
- [toDateTime64OrDefault](#todatetime64ordefault).
## toDateTime64OrNull {#todatetime64ornull}

与 [toDateTime64](#todatetime64) 相同，此函数将输入值转换为 [DateTime64](../data-types/datetime64.md) 类型的值，但如果收到无效参数，则返回 `NULL`。

**语法**

``` sql
toDateTime64OrNull(expr, scale, [timezone])
```

**参数**

- `expr` — 该值。 [String](../data-types/string.md), [UInt32](../data-types/int-uint.md), [Float](../data-types/float.md) 或 [DateTime](../data-types/datetime.md)。
- `scale` - 像素大小（精度）：10<sup>-精度</sup>秒。有效范围：[ 0 : 9 ]。
- `timezone` （可选） - 指定的 DateTime64 对象的时区。

**返回值**

- 一个带有亚秒精度的日历日期和时间，否则为 `NULL`。 [DateTime64](../data-types/datetime64.md)/[NULL](../data-types/nullable.md)。

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

**另见**

- [toDateTime64](#todatetime64).
- [toDateTime64OrZero](#todatetime64orzero).
- [toDateTime64OrDefault](#todatetime64ordefault).
## toDateTime64OrDefault {#todatetime64ordefault}

与 [toDateTime64](#todatetime64) 相同，此函数将输入值转换为 [DateTime64](../data-types/datetime64.md) 类型的值，
但如果收到无效参数，则返回 [DateTime64](../data-types/datetime64.md) 的默认值 或提供的默认值。

**语法**

``` sql
toDateTime64OrDefault(expr, scale, [timezone, default])
```

**参数**

- `expr` — 该值。 [String](../data-types/string.md), [UInt32](../data-types/int-uint.md), [Float](../data-types/float.md) 或 [DateTime](../data-types/datetime.md)。
- `scale` - 像素大小（精度）：10<sup>-精度</sup>秒。有效范围：[ 0 : 9 ]。
- `timezone` （可选） - 指定的 DateTime64 对象的时区。
- `default` （可选） - 如果收到无效参数，则返回的默认值。 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 一个带有亚秒精度的日历日期和时间，否则返回 [DateTime64] 的最小值或提供的 `default` 值（如果有）。 [DateTime64](../data-types/datetime64.md)。

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

**另见**

- [toDateTime64](#todatetime64).
- [toDateTime64OrZero](#todatetime64orzero).
- [toDateTime64OrNull](#todatetime64ornull).
## toDecimal32 {#todecimal32}

将输入值转换为类型为 [`Decimal(9, S)`](../data-types/decimal.md) 的值，精度为 `S`。在发生错误时抛出异常。

**语法**

```sql
toDecimal32(expr, S)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [Expression](/sql-reference/syntax#expressions)。
- `S` — 在 0 到 9 之间的精度参数，指定数字的小数部分可以有多少位数。 [UInt8](../data-types/int-uint.md)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的值或字符串表示。
- 类型为 Float32/64 的值或字符串表示。

不支持的参数：
- 类型为 Float32/64 的值 `NaN` 和 `Inf` (不区分大小写) 的值或字符串表示。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal32('0xc0fe', 1);`。

:::note
如果 `expr` 的值超过 `Decimal32` 的边界：`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`，则可能发生溢出。
小数中的多余位数被丢弃（未四舍五入）。
整数部分中的多余位数会导致异常。
:::

:::warning
转换会丢弃额外的数字，并且在使用 Float32/Float64 输入时可能会以意想不到的方式操作，因为操作是使用浮点指令进行的。
例如： `toDecimal32(1.15, 2)` 等于 `1.14`，因为 1.15 * 100 在浮点中是 114.99。
您可以使用字符串输入，这样操作会使用底层整数类型：`toDecimal32('1.15', 2) = 1.15`
:::

**返回值**

- 类型为 `Decimal(9, S)` 的值。 [Decimal32(S)](../data-types/int-uint.md)。

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

**另见**

- [`toDecimal32OrZero`](#todecimal32orzero).
- [`toDecimal32OrNull`](#todecimal32ornull).
- [`toDecimal32OrDefault`](#todecimal32ordefault).
## toDecimal32OrZero {#todecimal32orzero}

与 [`toDecimal32`](#todecimal32) 相同，此函数将输入值转换为类型为 [Decimal(9, S)](../data-types/decimal.md) 的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal32OrZero(expr, S)
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 在 0 到 9 之间的精度参数，指定数字的小数部分可以有多少位数。 [UInt8](../data-types/int-uint.md)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
- 类型为 Float32/64 的字符串表示。

不支持的参数：
- 类型为 Float32/64 的值 `NaN` 和 `Inf` 的字符串表示。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal32OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超过 `Decimal32` 的边界：`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`，则可能发生溢出。
小数中的多余位数被丢弃（未四舍五入）。
整数部分中的多余位数会导致错误。
:::

**返回值**

- 如果成功，则返回类型为 `Decimal(9, S)` 的值，否则返回 `0`，并保留 `S` 位小数。 [Decimal32(S)](../data-types/decimal.md)。

**示例**

查询：

``` sql
SELECT
    toDecimal32OrZero(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrZero(toString('Inf'), 5) as b,
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

**另见**

- [`toDecimal32`](#todecimal32).
- [`toDecimal32OrNull`](#todecimal32ornull).
- [`toDecimal32OrDefault`](#todecimal32ordefault).
## toDecimal32OrNull {#todecimal32ornull}

与 [`toDecimal32`](#todecimal32) 相同，此函数将输入值转换为类型为 [Nullable(Decimal(9, S))](../data-types/decimal.md) 的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal32OrNull(expr, S)
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 在 0 到 9 之间的精度参数，指定数字的小数部分可以有多少位数。 [UInt8](../data-types/int-uint.md)。

支持的参数：
- 类型为 (U)Int8/16/32/64/128/256 的字符串表示。
- 类型为 Float32/64 的字符串表示。

不支持的参数：
- 类型为 Float32/64 的值 `NaN` 和 `Inf` 的字符串表示。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal32OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的值超过 `Decimal32` 的边界：`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`，则可能发生溢出。
小数中的多余位数被丢弃（未四舍五入）。
整数部分中的多余位数会导致错误。
:::

**返回值**

- 如果成功，则返回类型为 `Nullable(Decimal(9, S))` 的值，否则返回相同类型的值 `NULL`。 [Decimal32(S)](../data-types/decimal.md)。

**示例**

查询：

``` sql
SELECT
    toDecimal32OrNull(toString(-1.111), 5) AS a,
    toTypeName(a),
    toDecimal32OrNull(toString('Inf'), 5) as b,
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

**另见**

- [`toDecimal32`](#todecimal32).
- [`toDecimal32OrZero`](#todecimal32orzero).
- [`toDecimal32OrDefault`](#todecimal32ordefault).
```

## toDecimal32OrDefault {#todecimal32ordefault}

与 [`toDecimal32`](#todecimal32) 类似，此函数将输入值转换为 [Decimal(9, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal32OrDefault(expr, S[, default])
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 范围在 0 到 9 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。
- `default`（可选）— 如果解析为 `Decimal32(S)` 类型失败，则返回的默认值。 [Decimal32(S)](../data-types/decimal.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的字符串表示。
- Float32/64 类型的字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal32OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal32` 的边界，则可能发生溢出：`( -1 * 10^(9 - S), 1 * 10^(9 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致错误。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃多余的位数，并可能以意想不到的方式执行，因为操作是使用浮点指令执行的。例如：`toDecimal32OrDefault(1.15, 2)` 等于 `1.14`，因为 1.15 * 100 在浮点中为 114.99。您可以使用字符串输入，以便操作使用底层整数类型：`toDecimal32OrDefault('1.15', 2) = 1.15`
:::

**返回值**

- 如果成功，则返回类型为 `Decimal(9, S)` 的值，否则返回默认值（如果提供了）或 `0`（如果未提供）。 [Decimal32(S)](../data-types/decimal.md)。

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

**另见**

- [`toDecimal32`](#todecimal32)。
- [`toDecimal32OrZero`](#todecimal32orzero)。
- [`toDecimal32OrNull`](#todecimal32ornull)。
## toDecimal64 {#todecimal64}

将输入值转换为类型 [`Decimal(18, S)`](../data-types/decimal.md) 的值，比例为 `S`。在发生错误时会抛出异常。

**语法**

```sql
toDecimal64(expr, S)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [Expression](/sql-reference/syntax#expressions)。
- `S` — 范围在 0 到 18 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的值或字符串表示。
- Float32/64 类型的值或字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`（不区分大小写）。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal64('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal64` 的边界，则可能发生溢出：`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致异常。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃多余的位数，并可能以意想不到的方式执行，因为操作是使用浮点指令执行的。例如：`toDecimal64(1.15, 2)` 等于 `1.14`，因为 1.15 * 100 在浮点中为 114.99。您可以使用字符串输入，以便操作使用底层整数类型：`toDecimal64('1.15', 2) = 1.15`
:::

**返回值**

- 类型为 `Decimal(18, S)` 的值。 [Decimal64(S)](../data-types/int-uint.md)。

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

**另见**

- [`toDecimal64OrZero`](#todecimal64orzero)。
- [`toDecimal64OrNull`](#todecimal64ornull)。
- [`toDecimal64OrDefault`](#todecimal64ordefault)。
## toDecimal64OrZero {#todecimal64orzero}

与 [`toDecimal64`](#todecimal64) 类似，此函数将输入值转换为 [Decimal(18, S)](../data-types/decimal.md) 类型的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal64OrZero(expr, S)
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 范围在 0 到 18 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的字符串表示。
- Float32/64 类型的字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal64OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal64` 的边界，则可能发生溢出：`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致错误。
:::

**返回值**

- 如果成功，则返回类型为 `Decimal(18, S)` 的值，否则返回 `0`，带有 `S` 位小数。 [Decimal64(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal64OrZero(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrZero(toString('Inf'), 18) as b,
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

**另见**

- [`toDecimal64`](#todecimal64)。
- [`toDecimal64OrNull`](#todecimal64ornull)。
- [`toDecimal64OrDefault`](#todecimal64ordefault)。
## toDecimal64OrNull {#todecimal64ornull}

与 [`toDecimal64`](#todecimal64) 类似，此函数将输入值转换为类型 [Nullable(Decimal(18, S))](../data-types/decimal.md) 的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal64OrNull(expr, S)
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 范围在 0 到 18 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的字符串表示。
- Float32/64 类型的字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal64OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal64` 的边界，则可能发生溢出：`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致错误。
:::

**返回值**

- 如果成功，则返回类型为 `Nullable(Decimal(18, S))` 的值，否则返回同类型的值 `NULL`。 [Decimal64(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal64OrNull(toString(0.0001), 18) AS a,
    toTypeName(a),
    toDecimal64OrNull(toString('Inf'), 18) as b,
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

**另见**

- [`toDecimal64`](#todecimal64)。
- [`toDecimal64OrZero`](#todecimal64orzero)。
- [`toDecimal64OrDefault`](#todecimal64ordefault)。
## toDecimal64OrDefault {#todecimal64ordefault}

与 [`toDecimal64`](#todecimal64) 类似，此函数将输入值转换为类型 [Decimal(18, S)](../data-types/decimal.md) 的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal64OrDefault(expr, S[, default])
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 范围在 0 到 18 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。
- `default`（可选）— 如果解析为 `Decimal64(S)` 类型失败，则返回的默认值。 [Decimal64(S)](../data-types/decimal.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的字符串表示。
- Float32/64 类型的字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal64OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal64` 的边界，则可能发生溢出：`( -1 * 10^(18 - S), 1 * 10^(18 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致错误。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃多余的位数，并可能以意想不到的方式执行，因为操作是使用浮点指令执行的。例如：`toDecimal64OrDefault(1.15, 2)` 等于 `1.14`，因为 1.15 * 100 在浮点中为 114.99。您可以使用字符串输入，以便操作使用底层整数类型：`toDecimal64OrDefault('1.15', 2) = 1.15`
:::

**返回值**

- 如果成功，则返回类型为 `Decimal(18, S)` 的值，否则返回提供的默认值，若未提供则返回 `0`。 [Decimal64(S)](../data-types/decimal.md)。

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

**另见**

- [`toDecimal64`](#todecimal64)。
- [`toDecimal64OrZero`](#todecimal64orzero)。
- [`toDecimal64OrNull`](#todecimal64ornull)。
## toDecimal128 {#todecimal128}

将输入值转换为类型 [`Decimal(38, S)`](../data-types/decimal.md) 的值，比例为 `S`。在发生错误时会抛出异常。

**语法**

```sql
toDecimal128(expr, S)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [Expression](/sql-reference/syntax#expressions)。
- `S` — 范围在 0 到 38 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的值或字符串表示。
- Float32/64 类型的值或字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`（不区分大小写）。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal128('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal128` 的边界，则可能发生溢出：`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致异常。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃多余的位数，并可能以意想不到的方式执行，因为操作是使用浮点指令执行的。例如：`toDecimal128(1.15, 2)` 等于 `1.14`，因为 1.15 * 100 在浮点中为 114.99。您可以使用字符串输入，以便操作使用底层整数类型：`toDecimal128('1.15', 2) = 1.15`
:::

**返回值**

- 类型为 `Decimal(38, S)` 的值。 [Decimal128(S)](../data-types/int-uint.md)。

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

**另见**

- [`toDecimal128OrZero`](#todecimal128orzero)。
- [`toDecimal128OrNull`](#todecimal128ornull)。
- [`toDecimal128OrDefault`](#todecimal128ordefault)。
## toDecimal128OrZero {#todecimal128orzero}

与 [`toDecimal128`](#todecimal128) 类似，此函数将输入值转换为类型 [Decimal(38, S)](../data-types/decimal.md) 的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal128OrZero(expr, S)
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 范围在 0 到 38 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的字符串表示。
- Float32/64 类型的字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal128OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal128` 的边界，则可能发生溢出：`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致错误。
:::

**返回值**

- 如果成功，则返回类型为 `Decimal(38, S)` 的值，否则返回 `0`，带有 `S` 位小数。 [Decimal128(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal128OrZero(toString(0.0001), 38) AS a,
    toTypeName(a),
    toDecimal128OrZero(toString('Inf'), 38) as b,
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

**另见**

- [`toDecimal128`](#todecimal128)。
- [`toDecimal128OrNull`](#todecimal128ornull)。
- [`toDecimal128OrDefault`](#todecimal128ordefault)。
## toDecimal128OrNull {#todecimal128ornull}

与 [`toDecimal128`](#todecimal128) 类似，此函数将输入值转换为类型 [Nullable(Decimal(38, S))](../data-types/decimal.md) 的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal128OrNull(expr, S)
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 范围在 0 到 38 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的字符串表示。
- Float32/64 类型的字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal128OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal128` 的边界，则可能发生溢出：`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致错误。
:::

**返回值**

- 如果成功，则返回类型为 `Nullable(Decimal(38, S))` 的值，否则返回同类型的值 `NULL`。 [Decimal128(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal128OrNull(toString(1/42), 38) AS a,
    toTypeName(a),
    toDecimal128OrNull(toString('Inf'), 38) as b,
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

**另见**

- [`toDecimal128`](#todecimal128)。
- [`toDecimal128OrZero`](#todecimal128orzero)。
- [`toDecimal128OrDefault`](#todecimal128ordefault)。
## toDecimal128OrDefault {#todecimal128ordefault}

与 [`toDecimal128`](#todecimal128) 类似，此函数将输入值转换为类型 [Decimal(38, S)](../data-types/decimal.md) 的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal128OrDefault(expr, S[, default])
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 范围在 0 到 38 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。
- `default`（可选）— 如果解析为 `Decimal128(S)` 类型失败，则返回的默认值。 [Decimal128(S)](../data-types/decimal.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的字符串表示。
- Float32/64 类型的字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal128OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal128` 的边界，则可能发生溢出：`( -1 * 10^(38 - S), 1 * 10^(38 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致错误。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃多余的位数，并可能以意想不到的方式执行，因为操作是使用浮点指令执行的。例如：`toDecimal128OrDefault(1.15, 2)` 等于 `1.14`，因为 1.15 * 100 在浮点中为 114.99。您可以使用字符串输入，以便操作使用底层整数类型：`toDecimal128OrDefault('1.15', 2) = 1.15`
:::

**返回值**

- 如果成功，则返回类型为 `Decimal(38, S)` 的值，否则返回提供的默认值，若未提供则返回 `0`。 [Decimal128(S)](../data-types/decimal.md)。

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
Row 1:
──────
a:             0.023809523809523808
toTypeName(a): Decimal(38, 18)
b:             -1
toTypeName(b): Decimal(38, 0)
```

**另见**

- [`toDecimal128`](#todecimal128)。
- [`toDecimal128OrZero`](#todecimal128orzero)。
- [`toDecimal128OrNull`](#todecimal128ornull)。
## toDecimal256 {#todecimal256}

将输入值转换为类型 [`Decimal(76, S)`](../data-types/decimal.md) 的值，比例为 `S`。在发生错误时会抛出异常。

**语法**

```sql
toDecimal256(expr, S)
```

**参数**

- `expr` — 返回数字或数字字符串表示的表达式。 [Expression](/sql-reference/syntax#expressions)。
- `S` — 范围在 0 到 76 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的值或字符串表示。
- Float32/64 类型的值或字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`（不区分大小写）。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal256('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal256` 的边界，则可能发生溢出：`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致异常。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃多余的位数，并可能以意想不到的方式执行，因为操作是使用浮点指令执行的。例如：`toDecimal256(1.15, 2)` 等于 `1.14`，因为 1.15 * 100 在浮点中为 114.99。您可以使用字符串输入，以便操作使用底层整数类型：`toDecimal256('1.15', 2) = 1.15`
:::

**返回值**

- 类型为 `Decimal(76, S)` 的值。 [Decimal256(S)](../data-types/int-uint.md)。

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

**另见**

- [`toDecimal256OrZero`](#todecimal256orzero)。
- [`toDecimal256OrNull`](#todecimal256ornull)。
- [`toDecimal256OrDefault`](#todecimal256ordefault)。
## toDecimal256OrZero {#todecimal256orzero}

与 [`toDecimal256`](#todecimal256) 类似，此函数将输入值转换为类型 [Decimal(76, S)](../data-types/decimal.md) 的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal256OrZero(expr, S)
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 范围在 0 到 76 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的字符串表示。
- Float32/64 类型的字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal256OrZero('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal256` 的边界，则可能发生溢出：`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致错误。
:::

**返回值**

- 如果成功，则返回类型为 `Decimal(76, S)` 的值，否则返回 `0`，带有 `S` 位小数。 [Decimal256(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal256OrZero(toString(0.0001), 76) AS a,
    toTypeName(a),
    toDecimal256OrZero(toString('Inf'), 76) as b,
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

**另见**

- [`toDecimal256`](#todecimal256)。
- [`toDecimal256OrNull`](#todecimal256ornull)。
- [`toDecimal256OrDefault`](#todecimal256ordefault)。
## toDecimal256OrNull {#todecimal256ornull}

与 [`toDecimal256`](#todecimal256) 类似，此函数将输入值转换为类型 [Nullable(Decimal(76, S))](../data-types/decimal.md) 的值，但在发生错误时返回 `0`。

**语法**

```sql
toDecimal256OrNull(expr, S)
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 范围在 0 到 76 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的字符串表示。
- Float32/64 类型的字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal256OrNull('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal256` 的边界，则可能发生溢出：`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致错误。
:::

**返回值**

- 如果成功，则返回类型为 `Nullable(Decimal(76, S))` 的值，否则返回同类型的值 `NULL`。 [Decimal256(S)](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT
    toDecimal256OrNull(toString(1/42), 76) AS a,
    toTypeName(a),
    toDecimal256OrNull(toString('Inf'), 76) as b,
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

**另见**

- [`toDecimal256`](#todecimal256)。
- [`toDecimal256OrZero`](#todecimal256orzero)。
- [`toDecimal256OrDefault`](#todecimal256ordefault)。
## toDecimal256OrDefault {#todecimal256ordefault}

与 [`toDecimal256`](#todecimal256) 类似，此函数将输入值转换为类型 [Decimal(76, S)](../data-types/decimal.md) 的值，但在发生错误时返回默认值。

**语法**

```sql
toDecimal256OrDefault(expr, S[, default])
```

**参数**

- `expr` — 数字的字符串表示。 [String](../data-types/string.md)。
- `S` — 范围在 0 到 76 之间的比例参数，指定数字的小数部分可以有多少位。 [UInt8](../data-types/int-uint.md)。
- `default`（可选）— 如果解析为 `Decimal256(S)` 类型失败，则返回的默认值。 [Decimal256(S)](../data-types/decimal.md)。

受支持的参数：
- (U)Int8/16/32/64/128/256 类型的字符串表示。
- Float32/64 类型的字符串表示。

不支持的参数：
- Float32/64 值的字符串表示 `NaN` 和 `Inf`。
- 二进制和十六进制值的字符串表示，例如 `SELECT toDecimal256OrDefault('0xc0fe', 1);`。

:::note
如果 `expr` 的值超出了 `Decimal256` 的边界，则可能发生溢出：`( -1 * 10^(76 - S), 1 * 10^(76 - S) )`。小数部分的多余位数会被丢弃（而不是四舍五入）。整数部分的多余位数会导致错误。
:::

:::warning
在处理 Float32/Float64 输入时，转换会丢弃多余的位数，并可能以意想不到的方式执行，因为操作是使用浮点指令执行的。例如：`toDecimal256OrDefault(1.15, 2)` 等于 `1.14`，因为 1.15 * 100 在浮点中为 114.99。您可以使用字符串输入，以便操作使用底层整数类型：`toDecimal256OrDefault('1.15', 2) = 1.15`
:::

**返回值**

- 如果成功，则返回类型为 `Decimal(76, S)` 的值，否则返回提供的默认值，若未提供则返回 `0`。 [Decimal256(S)](../data-types/decimal.md)。

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

**另见**

- [`toDecimal256`](#todecimal256)。
- [`toDecimal256OrZero`](#todecimal256orzero)。
- [`toDecimal256OrNull`](#todecimal256ornull)。
## toString {#tostring}

用于在数字、字符串（但不固定字符串）、日期和带时间的日期之间转换的函数。所有这些函数接受一个参数。

在转换为字符串或从字符串转换时，值使用与 TabSeparated 格式（以及几乎所有其他文本格式）相同的规则进行格式化或解析。如果字符串无法解析，则会抛出异常并取消请求。

在将日期转换为数字或反之时，日期对应于自 Unix 纪元开始以来的天数。在将带时间的日期转换为数字或反之时，带时间的日期对应于自 Unix 纪元开始以来的秒数。

toDate/toDateTime 函数的日期和带时间日期格式定义如下：

```response
YYYY-MM-DD
YYYY-MM-DD hh:mm:ss
```

作为例外，当从 UInt32、Int32、UInt64 或 Int64 数字类型转换为日期时，如果数字大于或等于 65536，则该数字被解释为 Unix 时间戳（而不是天数），并被四舍五入到日期。这支持了常见的情况，即写 `toDate(unix_timestamp)`，否则将出错，并需要编写更繁琐的 `toDate(toDateTime(unix_timestamp))`。

日期和带时间的日期之间的转换以自然方式进行：通过添加空时间或丢弃时间。

数字类型之间的转换使用与 C++ 中不同数字类型之间的赋值相同的规则。

此外，DateTime 参数的 toString 函数可以接受第二个字符串参数，其中包含时区的名称。例如：`Asia/Yekaterinburg`。在这种情况下，时间会按照指定的时区进行格式化。

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

另见 `toUnixTimestamp` 函数。
```

## toFixedString {#tofixedstring}

将一个 [String](../data-types/string.md) 类型的参数转换为 [FixedString(N)](../data-types/fixedstring.md) 类型（固定长度 N 的字符串）。如果字符串的字节数少于 N，则在右侧用空字节填充；如果字符串的字节数超过 N，则会抛出异常。

**语法**

```sql
toFixedString(s, N)
```

**参数**

- `s` — 要转换为固定字符串的字符串。 [String](../data-types/string.md)。
- `N` — 长度 N。 [UInt8](../data-types/int-uint.md)

**返回值**

- 一个长度为 N 的固定字符串，内容为 `s`。 [FixedString](../data-types/fixedstring.md)。

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

接受一个 String 或 FixedString 参数。返回内容在找到的第一个零字节位置截断的字符串。

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

将一个数值转换为字符串，输出的小数位数由用户指定。

**语法**

```sql
toDecimalString(number, scale)
```

**参数**

- `number` — 要表示为字符串的值， [Int, UInt](../data-types/int-uint.md), [Float](../data-types/float.md), [Decimal](../data-types/decimal.md)。
- `scale` — 小数位数， [UInt8](../data-types/int-uint.md)。
    * [Decimal](../data-types/decimal.md) 和 [Int, UInt](../data-types/int-uint.md) 类型的最大精度为 77（这是 Decimal 的最大有效数字位数），
    * [Float](../data-types/float.md) 的最大精度为 60。

**返回值**

- 输入值表示为 [String](../data-types/string.md)，带有给定的小数位数（scale）。如果请求的尺度小于原始数字的尺度，则按照通常的算术规则对数字进行四舍五入。

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

通过将输入值视为 UInt8 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsUInt8(x)
```

**参数**

- `x`: 要重解释为 UInt8 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 UInt8。 [UInt8](/sql-reference/data-types/int-uint)。

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

通过将输入值视为 UInt16 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsUInt16(x)
```

**参数**

- `x`: 要重解释为 UInt16 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 UInt16。 [UInt16](/sql-reference/data-types/int-uint)。

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

通过将输入值视为 UInt32 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsUInt32(x)
```

**参数**

- `x`: 要重解释为 UInt32 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 UInt32。 [UInt32](/sql-reference/data-types/int-uint)。

**示例**

查询：

```sql
SELECT
    toUInt16(257) AS x,
    toTypeName(x),
    reinterpretAsUInt32(x) AS res,
    toTypeName(res);
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt16        │ 257 │ UInt32          │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsUInt64 {#reinterpretasuint64}

通过将输入值视为 UInt64 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsUInt64(x)
```

**参数**

- `x`: 要重解释为 UInt64 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 UInt64。 [UInt64](/sql-reference/data-types/int-uint)。

**示例**

查询：

```sql
SELECT
    toUInt32(257) AS x,
    toTypeName(x),
    reinterpretAsUInt64(x) AS res,
    toTypeName(res);
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt32        │ 257 │ UInt64          │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsUInt128 {#reinterpretasuint128}

通过将输入值视为 UInt128 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsUInt128(x)
```

**参数**

- `x`: 要重解释为 UInt128 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 UInt128。 [UInt128](/sql-reference/data-types/int-uint)。

**示例**

查询：

```sql
SELECT
    toUInt64(257) AS x,
    toTypeName(x),
    reinterpretAsUInt128(x) AS res,
    toTypeName(res);
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt64        │ 257 │ UInt128         │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsUInt256 {#reinterpretasuint256}

通过将输入值视为 UInt256 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsUInt256(x)
```

**参数**

- `x`: 要重解释为 UInt256 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 UInt256。 [UInt256](/sql-reference/data-types/int-uint)。

**示例**

查询：

```sql
SELECT
    toUInt128(257) AS x,
    toTypeName(x),
    reinterpretAsUInt256(x) AS res,
    toTypeName(res);
```

结果：

```response
┌───x─┬─toTypeName(x)─┬─res─┬─toTypeName(res)─┐
│ 257 │ UInt128       │ 257 │ UInt256         │
└─────┴───────────────┴─────┴─────────────────┘
```
## reinterpretAsInt8 {#reinterpretasint8}

通过将输入值视为 Int8 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsInt8(x)
```

**参数**

- `x`: 要重解释为 Int8 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 Int8。 [Int8](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值视为 Int16 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsInt16(x)
```

**参数**

- `x`: 要重解释为 Int16 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 Int16。 [Int16](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值视为 Int32 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsInt32(x)
```

**参数**

- `x`: 要重解释为 Int32 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 Int32。 [Int32](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值视为 Int64 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsInt64(x)
```

**参数**

- `x`: 要重解释为 Int64 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 Int64。 [Int64](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值视为 Int128 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsInt128(x)
```

**参数**

- `x`: 要重解释为 Int128 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 Int128。 [Int128](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值视为 Int256 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsInt256(x)
```

**参数**

- `x`: 要重解释为 Int256 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 Int256。 [Int256](/sql-reference/data-types/int-uint#integer-ranges)。

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

通过将输入值视为 Float32 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsFloat32(x)
```

**参数**

- `x`: 要重解释为 Float32 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 Float32。 [Float32](../data-types/float.md)。

**示例**

查询：

```sql
SELECT reinterpretAsUInt32(toFloat32(0.2)) as x, reinterpretAsFloat32(x);
```

结果：

```response
┌──────────x─┬─reinterpretAsFloat32(x)─┐
│ 1045220557 │                     0.2 │
└────────────┴─────────────────────────┘
```
## reinterpretAsFloat64 {#reinterpretasfloat64}

通过将输入值视为 Float64 类型的值来执行字节重解释。与 [`CAST`](#cast) 不同，该函数不尝试保留原始值 - 如果目标类型无法表示输入类型，则输出是没有意义的。

**语法**

```sql
reinterpretAsFloat64(x)
```

**参数**

- `x`: 要重解释为 Float64 的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 将值 `x` 重新解释为 Float64。 [Float64](../data-types/float.md)。

**示例**

查询：

```sql
SELECT reinterpretAsUInt64(toFloat64(0.2)) as x, reinterpretAsFloat64(x);
```

结果：

```response
┌───────────────────x─┬─reinterpretAsFloat64(x)─┐
│ 4596373779694328218 │                     0.2 │
└─────────────────────┴─────────────────────────┘
```
## reinterpretAsDate {#reinterpretasdate}

接受一个字符串、固定字符串或数值，并将字节解释为一个主机顺序（小端）。返回从解释的数字表示的日期，表示为自 Unix 纪元开始的天数。

**语法**

```sql
reinterpretAsDate(x)
```

**参数**

- `x`: 自 Unix 纪元开始的天数。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 日期。 [Date](../data-types/date.md)。

**实现细节**

:::note
如果提供的字符串不足，则该函数的工作方式如下：假设字符串用所需数量的空字节进行填充。如果字符串长度超过了需要的长度，则额外的字节将被忽略。
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

这些函数接受一个字符串，并将字符串开始位置的字节解释为主机顺序（小端）的数字。返回的日期时间表示为自 Unix 纪元开始的秒数。

**语法**

```sql
reinterpretAsDateTime(x)
```

**参数**

- `x`: 自 Unix 纪元开始的秒数。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md), [UUID](../data-types/uuid.md), [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 日期和时间。 [DateTime](../data-types/datetime.md)。

**实现细节**

:::note
如果提供的字符串不足，则该函数的工作方式如下：假设字符串用所需数量的空字节进行填充。如果字符串长度超过了需要的长度，则额外的字节将被忽略。
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

该函数接受一个数字、日期或日期时间，并返回一个字符串，包含表示相应值的字节，采用主机顺序（小端）。末尾的空字节被丢弃。例如，一个 UInt32 类型的值 255 是一个字节长的字符串。

**语法**

```sql
reinterpretAsString(x)
```

**参数**

- `x`: 要重新解释为字符串的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md)。

**返回值**

- 包含表示 `x` 的字节的字符串。 [String](../data-types/fixedstring.md)。

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

该函数接受一个数字、日期或日期时间，并返回一个 FixedString，包含表示相应值的字节，采用主机顺序（小端）。末尾的空字节被丢弃。例如，一个 UInt32 类型的值 255 是一个长度为一个字节的 FixedString。

**语法**

```sql
reinterpretAsFixedString(x)
```

**参数**

- `x`: 要重新解释为字符串的值。[(U)Int*](../data-types/int-uint.md), [Float](../data-types/float.md), [Date](../data-types/date.md), [DateTime](../data-types/datetime.md)。

**返回值**

- 包含表示 `x` 的字节的固定字符串。 [FixedString](../data-types/fixedstring.md)。

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
除这里列出的 UUID 函数外，还有专门的 [UUID 函数文档](../functions/uuid-functions.md)。
:::

接受一个 16 字节的字符串，并通过将每个 8 字节的半部分以小端字节顺序解释为 UUID。如果字符串长度不足，则该函数的工作方式如下：假设字符串用所需数量的空字节进行填充。如果字符串超过 16 字节，末尾的额外字节将被忽略。

**语法**

```sql
reinterpretAsUUID(fixed_string)
```

**参数**

- `fixed_string` — 大端字节字符串。 [FixedString](/sql-reference/data-types/fixedstring)。

**返回值**

- UUID 类型的值。 [UUID](/sql-reference/data-types/uuid)。

**示例**

将字符串转换为 UUID。

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

在字符串与 UUID 之间相互转换。

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

使用 `x` 值中的相同源内存字节序列，并将其重新解释为目标类型。

**语法**

```sql
reinterpret(x, type)
```

**参数**

- `x` — 任何类型。
- `type` — 目标类型。 [String](../data-types/string.md)。

**返回值**

- 目标类型的值。

**示例**

查询：
```sql
SELECT reinterpret(toInt8(-1), 'UInt8') as int_to_uint,
    reinterpret(toInt8(1), 'Float32') as int_to_float,
    reinterpret('1', 'UInt32') as string_to_int;
```

结果：

```text
┌─int_to_uint─┬─int_to_float─┬─string_to_int─┐
│         255 │        1e-45 │            49 │
└─────────────┴──────────────┴───────────────┘
```
## CAST {#cast}

将输入值转换为指定的数据类型。与 [reinterpret](#reinterpret) 函数不同，`CAST` 尝试用新数据类型表示相同的值。如果转换无法完成，则会抛出异常。支持多种语法变体。

**语法**

```sql
CAST(x, T)
CAST(x AS t)
x::t
```

**参数**

- `x` — 要转换的值。可以是任何类型。
- `T` — 目标数据类型的名称。 [String](../data-types/string.md)。
- `t` — 目标数据类型。

**返回值**

- 转换后的值。

:::note
如果输入值不符合目标类型的范围，则结果将溢出。例如，`CAST(-1, 'UInt8')` 返回 `255`。
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

转换为 [FixedString (N)](../data-types/fixedstring.md) 仅适用于 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md) 类型的参数。

类型转换为 [Nullable](../data-types/nullable.md) 并且可以返回。

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

**另见**

- [cast_keep_nullable](../../operations/settings/settings.md/#cast_keep_nullable) 设置
## accurateCast(x, T) {#accuratecastx-t}

将 `x` 转换为 `T` 数据类型。

与 [cast](#cast) 的不同之处在于 `accurateCast` 不允许在转换时对数字类型溢出，如果值 `x` 不符合类型 `T` 的范围，则会抛出异常。例如，`accurateCast(-1, 'UInt8')` 会抛出异常。

**示例**

查询：

```sql
SELECT cast(-1, 'UInt8') as uint8;
```

结果：

```response
┌─uint8─┐
│   255 │
└───────┘
```

查询：

```sql
SELECT accurateCast(-1, 'UInt8') as uint8;
```

结果：

```response
Code: 70. DB::Exception: Received from localhost:9000. DB::Exception: Value in column Int8 cannot be safely converted into type UInt8: While processing accurateCast(-1, 'UInt8') AS uint8.
```
## accurateCastOrNull(x, T) {#accuratecastornullx-t}

将输入值 `x` 转换为指定的数据类型 `T`。始终返回 [Nullable](../data-types/nullable.md) 类型，如果转换值在目标类型中无法表示，则返回 [NULL](/sql-reference/syntax#null)。

**语法**

```sql
accurateCastOrNull(x, T)
```

**参数**

- `x` — 输入值。
- `T` — 返回数据类型的名称。

**返回值**

- 转换为指定数据类型 `T` 的值。

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
    accurateCastOrNull(-1, 'UInt8') as uint8,
    accurateCastOrNull(128, 'Int8') as int8,
    accurateCastOrNull('Test', 'FixedString(2)') as fixed_string;
```

结果：

```response
┌─uint8─┬─int8─┬─fixed_string─┐
│  ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │
└───────┴──────┴──────────────┘
```

## accurateCastOrDefault(x, T[, default_value]) {#accuratecastordefaultx-t-default_value}

将输入值 `x` 转换为指定的数据类型 `T`。如果转换值无法表示为目标类型，则返回默认类型值或指定的 `default_value`。

**语法**

```sql
accurateCastOrDefault(x, T)
```

**参数**

- `x` — 输入值。
- `T` — 返回数据类型的名称。
- `default_value` — 返回数据类型的默认值。

**返回值**

- 转换为指定数据类型 `T` 的值。

**示例**

查询：

``` sql
SELECT toTypeName(accurateCastOrDefault(5, 'UInt8'));
```

结果：

```response
┌─toTypeName(accurateCastOrDefault(5, 'UInt8'))─┐
│ UInt8                                         │
└───────────────────────────────────────────────┘
```

查询：

``` sql
SELECT
    accurateCastOrDefault(-1, 'UInt8') as uint8,
    accurateCastOrDefault(-1, 'UInt8', 5) as uint8_default,
    accurateCastOrDefault(128, 'Int8') as int8,
    accurateCastOrDefault(128, 'Int8', 5) as int8_default,
    accurateCastOrDefault('Test', 'FixedString(2)') as fixed_string,
    accurateCastOrDefault('Test', 'FixedString(2)', 'Te') as fixed_string_default;
```

结果：

```response
┌─uint8─┬─uint8_default─┬─int8─┬─int8_default─┬─fixed_string─┬─fixed_string_default─┐
│     0 │             5 │    0 │            5 │              │ Te                   │
└───────┴───────────────┴──────┴──────────────┴──────────────┴──────────────────────┘
```
## toIntervalYear {#tointervalyear}

返回 `n` 年的时间间隔，数据类型为 [IntervalYear](../data-types/special-data-types/interval.md)。

**语法**

``` sql
toIntervalYear(n)
```

**参数**

- `n` — 年的数量。整数或其字符串表示，以及浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

- `n` 年的时间间隔。 [IntervalYear](../data-types/special-data-types/interval.md)。

**示例**

查询：

``` sql
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

返回 `n` 季度的时间间隔，数据类型为 [IntervalQuarter](../data-types/special-data-types/interval.md)。

**语法**

``` sql
toIntervalQuarter(n)
```

**参数**

- `n` — 季度的数量。整数或其字符串表示，以及浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

- `n` 季度的时间间隔。 [IntervalQuarter](../data-types/special-data-types/interval.md)。

**示例**

查询：

``` sql
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

返回 `n` 个月的时间间隔，数据类型为 [IntervalMonth](../data-types/special-data-types/interval.md)。

**语法**

``` sql
toIntervalMonth(n)
```

**参数**

- `n` — 月份的数量。整数或其字符串表示，以及浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

- `n` 个月的时间间隔。 [IntervalMonth](../data-types/special-data-types/interval.md)。

**示例**

查询：

``` sql
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

返回 `n` 个星期的时间间隔，数据类型为 [IntervalWeek](../data-types/special-data-types/interval.md)。

**语法**

``` sql
toIntervalWeek(n)
```

**参数**

- `n` — 星期的数量。整数或其字符串表示，以及浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

- `n` 个星期的时间间隔。 [IntervalWeek](../data-types/special-data-types/interval.md)。

**示例**

查询：

``` sql
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

返回 `n` 天的时间间隔，数据类型为 [IntervalDay](../data-types/special-data-types/interval.md)。

**语法**

``` sql
toIntervalDay(n)
```

**参数**

- `n` — 天的数量。整数或其字符串表示，以及浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

- `n` 天的时间间隔。 [IntervalDay](../data-types/special-data-types/interval.md)。

**示例**

查询：

``` sql
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

返回 `n` 小时的时间间隔，数据类型为 [IntervalHour](../data-types/special-data-types/interval.md)。

**语法**

``` sql
toIntervalHour(n)
```

**参数**

- `n` — 小时数量。整数或其字符串表示，以及浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

- `n` 小时的时间间隔。 [IntervalHour](../data-types/special-data-types/interval.md)。

**示例**

查询：

``` sql
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

返回 `n` 分钟的时间间隔，数据类型为 [IntervalMinute](../data-types/special-data-types/interval.md)。

**语法**

``` sql
toIntervalMinute(n)
```

**参数**

- `n` — 分钟数量。整数或其字符串表示，以及浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

- `n` 分钟的时间间隔。 [IntervalMinute](../data-types/special-data-types/interval.md)。

**示例**

查询：

``` sql
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

返回 `n` 秒的时间间隔，数据类型为 [IntervalSecond](../data-types/special-data-types/interval.md)。

**语法**

``` sql
toIntervalSecond(n)
```

**参数**

- `n` — 秒的数量。整数或其字符串表示，以及浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

- `n` 秒的时间间隔。 [IntervalSecond](../data-types/special-data-types/interval.md)。

**示例**

查询：

``` sql
WITH
    toDate('2024-06-15') AS date,
    toIntervalSecond(30) AS interval_to_seconds
SELECT date + interval_to_seconds AS result
```

结果：

```response
┌──────────────result─┐
│ 2024-06-15 00:00:30 │
└─────────────────────┘
```
## toIntervalMillisecond {#tointervalmillisecond}

返回 `n` 毫秒的时间间隔，数据类型为 [IntervalMillisecond](../data-types/special-data-types/interval.md)。

**语法**

``` sql
toIntervalMillisecond(n)
```

**参数**

- `n` — 毫秒数量。整数或其字符串表示，以及浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

- `n` 毫秒的时间间隔。 [IntervalMilliseconds](../data-types/special-data-types/interval.md)。

**示例**

查询：

``` sql
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

返回 `n` 微秒的时间间隔，数据类型为 [IntervalMicrosecond](../data-types/special-data-types/interval.md)。

**语法**

``` sql
toIntervalMicrosecond(n)
```

**参数**

- `n` — 微秒数量。整数或其字符串表示，以及浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

- `n` 微秒的时间间隔。 [IntervalMicrosecond](../data-types/special-data-types/interval.md)。

**示例**

查询：

``` sql
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

返回 `n` 纳秒的时间间隔，数据类型为 [IntervalNanosecond](../data-types/special-data-types/interval.md)。

**语法**

``` sql
toIntervalNanosecond(n)
```

**参数**

- `n` — 纳秒数量。整数或其字符串表示，以及浮点数。[(U)Int*](../data-types/int-uint.md)/[Float*](../data-types/float.md)/[String](../data-types/string.md)。

**返回值**

- `n` 纳秒的时间间隔。 [IntervalNanosecond](../data-types/special-data-types/interval.md)。

**示例**

查询：

``` sql
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

将 [String](../data-types/string.md) 转换为 [DateTime](../data-types/datetime.md)，遵循 [MySQL 格式字符串](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)。

此函数是 [formatDateTime](/sql-reference/functions/date-time-functions#formatdatetime) 函数的反操作。

**语法**

``` sql
parseDateTime(str[, format[, timezone]])
```

**参数**

- `str` — 待解析的字符串
- `format` — 格式字符串。可选。如果未指定，则为 `%Y-%m-%d %H:%i:%s`。
- `timezone` — [时区](operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

根据 MySQL 风格格式字符串解析的 [DateTime](../data-types/datetime.md) 值。

**支持的格式说明符**

所有在 [formatDateTime](/sql-reference/functions/date-time-functions#formatdatetime) 中列出的格式说明符，除了：
- %Q: 季度 (1-4)

**示例**

``` sql
SELECT parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')

┌─parseDateTime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')─┐
│                                       2021-01-04 23:00:00 │
└───────────────────────────────────────────────────────────┘
```

别名： `TO_TIMESTAMP`。
## parseDateTimeOrZero {#parsedatetimeorzero}

同 [parseDateTime](#parsedatetime) 函数，除了在遇到无法处理的日期格式时返回零日期。
## parseDateTimeOrNull {#parsedatetimeornull}

同 [parseDateTime](#parsedatetime) 函数，除了在遇到无法处理的日期格式时返回 `NULL`。

别名： `str_to_date`。
## parseDateTimeInJodaSyntax {#parsedatetimeinjodasyntax}

类似于 [parseDateTime](#parsedatetime)，除了格式字符串是 [Joda](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)，而不是 MySQL 语法。

此函数是 [formatDateTimeInJodaSyntax](/sql-reference/functions/date-time-functions#formatdatetimeinjodasyntax) 函数的反操作。

**语法**

``` sql
parseDateTimeInJodaSyntax(str[, format[, timezone]])
```

**参数**

- `str` — 待解析的字符串
- `format` — 格式字符串。可选。如果未指定，则为 `yyyy-MM-dd HH:mm:ss`。
- `timezone` — [时区](operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

根据 Joda 风格格式字符串解析的 [DateTime](../data-types/datetime.md) 值。

**支持的格式说明符**

在 [formatDateTimeInJoda](/sql-reference/functions/date-time-functions#formatdatetime) 中列出的所有格式说明符都受支持，除了：
- S: 秒的小数部分
- z: 时区
- Z: 时区偏移/标识

**示例**

``` sql
SELECT parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')

┌─parseDateTimeInJodaSyntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss', 'Europe/Minsk')─┐
│                                                                     2023-02-24 14:53:31 │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```
## parseDateTimeInJodaSyntaxOrZero {#parsedatetimeinjodasyntaxorzero}

同 [parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax)，除了在遇到无法处理的日期格式时返回零日期。
## parseDateTimeInJodaSyntaxOrNull {#parsedatetimeinjodasyntaxornull}

同 [parseDateTimeInJodaSyntax](#parsedatetimeinjodasyntax)，除了在遇到无法处理的日期格式时返回 `NULL`。
## parseDateTime64 {#parsedatetime64}

将 [String](../data-types/string.md) 转换为 [DateTime64](../data-types/datetime64.md)，遵循一个 [MySQL 格式字符串](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_date-format)。

**语法**

``` sql
parseDateTime64(str[, format[, timezone]])
```

**参数**

- `str` — 待解析的字符串。
- `format` — 格式字符串。可选。如果未指定，则为 `%Y-%m-%d %H:%i:%s.%f`。
- `timezone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

根据 MySQL 风格格式字符串解析的 [DateTime64](../data-types/datetime64.md) 值。
返回值的精度为 6。
## parseDateTime64OrZero {#parsedatetime64orzero}

同 [parseDateTime64](#parsedatetime64)，除了在遇到无法处理的日期格式时返回零日期。
## parseDateTime64OrNull {#parsedatetime64ornull}

同 [parseDateTime64](#parsedatetime64)，除了在遇到无法处理的日期格式时返回 `NULL`。
## parseDateTime64InJodaSyntax {#parsedatetime64injodasyntax}

将 [String](../data-types/string.md) 转换为 [DateTime64](../data-types/datetime64.md)，遵循一个 [Joda 格式字符串](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)。

**语法**

``` sql
parseDateTime64InJodaSyntax(str[, format[, timezone]])
```

**参数**

- `str` — 待解析的字符串。
- `format` — 格式字符串。可选。如果未指定，则为 `yyyy-MM-dd HH:mm:ss`。
- `timezone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。可选。

**返回值**

根据 Joda 风格格式字符串解析的 [DateTime64](../data-types/datetime64.md) 值。
返回值的精度等于格式字符串中 `S` 占位符的数量（但最多为 6）。
## parseDateTime64InJodaSyntaxOrZero {#parsedatetime64injodasyntaxorzero}

同 [parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax)，除了在遇到无法处理的日期格式时返回零日期。
## parseDateTime64InJodaSyntaxOrNull {#parsedatetime64injodasyntaxornull}

同 [parseDateTime64InJodaSyntax](#parsedatetime64injodasyntax)，除了在遇到无法处理的日期格式时返回 `NULL`。
## parseDateTimeBestEffort {#parsedatetimebesteffort}
## parseDateTime32BestEffort {#parsedatetime32besteffort}

将 [String](../data-types/string.md) 表示形式的日期和时间转换为 [DateTime](/sql-reference/data-types/datetime) 数据类型。

该函数解析 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)、[RFC 1123 - 5.2.14 RFC-822 日期和时间规范](https://tools.ietf.org/html/rfc1123#page-55)、ClickHouse 及其他一些日期和时间格式。

**语法**

``` sql
parseDateTimeBestEffort(time_string [, time_zone])
```

**参数**

- `time_string` — 包含要转换的日期和时间的字符串。 [String](../data-types/string.md)。
- `time_zone` — 时区。该函数根据时区解析 `time_string`。 [String](../data-types/string.md)。

**支持的非标准格式**

- 包含 9..10 位 [unix 时间戳](https://en.wikipedia.org/wiki/Unix_time) 的字符串。
- 含有日期和时间成分的字符串：`YYYYMMDDhhmmss`、`DD/MM/YYYY hh:mm:ss`、`DD-MM-YY hh:mm`、`YYYY-MM-DD hh:mm:ss` 等。
- 含有日期但没有时间成分的字符串：`YYYY`、`YYYYMM`、`YYYY*MM`、`DD/MM/YYYY`、`DD-MM-YY` 等。
- 含有天和时间的字符串：`DD`、`DD hh`、`DD hh:mm`。在这种情况下，`MM` 由 `01` 替代。
- 包含日期和时间以及时区偏移信息的字符串：`YYYY-MM-DD hh:mm:ss ±h:mm` 等。例如，`2020-12-12 17:36:00 -5:00`。
- [syslog 时间戳](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)：`Mmm dd hh:mm:ss`。例如，`Jun  9 14:20:32`。

对于所有有分隔符的格式，函数解析月份名称，以其全名或月份名称的前三个字母表示。例子：`24/DEC/18`、`24-Dec-18`、`01-September-2018`。
如果未指定年份，则认为等于当前年份。如果结果的 DateTime 发生在未来（即使是当前时刻之后的一秒），则用前一年代替当前年份。

**返回值**

- 转换后的 [DateTime](../data-types/datetime.md) 数据类型的 `time_string`。

**示例**

查询：

``` sql
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

``` sql
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

``` sql
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

``` sql
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

``` sql
SELECT toYear(now()) as year, parseDateTimeBestEffort('10 20:19');
```

结果：

```response
┌─year─┬─parseDateTimeBestEffort('10 20:19')─┐
│ 2023 │                 2023-01-10 20:19:00 │
└──────┴─────────────────────────────────────┘
```

查询：

``` sql
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

**参见**

- [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123)
- [toDate](#todate)
- [toDateTime](#todatetime)
- [ISO 8601 @xkcd 的公告](https://xkcd.com/1179/)
- [RFC 3164](https://datatracker.ietf.org/doc/html/rfc3164#section-4.1.2)
## parseDateTimeBestEffortUS {#parsedatetimebesteffortus}

此函数的行为与 [parseDateTimeBestEffort](#parsedatetimebesteffort) 函数相同，针对 ISO 日期格式，例如 `YYYY-MM-DD hh:mm:ss`，以及其他日期格式，其中月份和日期组件可以不含歧义地提取，例如 `YYYYMMDDhhmmss`、`YYYY-MM`、`DD hh` 或 `YYYY-MM-DD hh:mm:ss ±h:mm`。如果月份和日期组件不能不含歧义地提取，例如 `MM/DD/YYYY`、`MM-DD-YYYY` 或 `MM-DD-YY`，它将优先选择美国日期格式，而不是 `DD/MM/YYYY`、`DD-MM-YYYY` 或 `DD-MM-YY`。作为后者的例外，如果月份大于 12 且小于或等于 31，则该函数回退到 [parseDateTimeBestEffort](#parsedatetimebesteffort) 的行为，例如 `15/08/2020` 将被解析为 `2020-08-15`。
## parseDateTimeBestEffortOrNull {#parsedatetimebesteffortornull}
## parseDateTime32BestEffortOrNull {#parsedatetime32besteffortornull}

同 [parseDateTimeBestEffort](#parsedatetimebesteffort) ，除了在遇到无法处理的日期格式时返回 `NULL`。
## parseDateTimeBestEffortOrZero {#parsedatetimebesteffortorzero}
## parseDateTime32BestEffortOrZero {#parsedatetime32besteffortorzero}

同 [parseDateTimeBestEffort](#parsedatetimebesteffort) ，除了在遇到无法处理的日期格式时返回零日期或零日期时间。
## parseDateTimeBestEffortUSOrNull {#parsedatetimebesteffortusornull}

同 [parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 函数，除了在遇到无法处理的日期格式时返回 `NULL`。
## parseDateTimeBestEffortUSOrZero {#parsedatetimebesteffortusorzero}

同 [parseDateTimeBestEffortUS](#parsedatetimebesteffortus) 函数，除了在遇到无法处理的日期格式时返回零日期（`1970-01-01`）或零日期与时间（`1970-01-01 00:00:00`）。 
## parseDateTime64BestEffort {#parsedatetime64besteffort}

同 [parseDateTimeBestEffort](#parsedatetimebesteffort) 函数，但还解析毫秒和微秒并返回 [DateTime](/sql-reference/data-types/datetime) 数据类型。

**语法**

``` sql
parseDateTime64BestEffort(time_string [, precision [, time_zone]])
```

**参数**

- `time_string` — 包含日期或日期时间的字符串。 [String](../data-types/string.md)。
- `precision` — 必需精度。`3` — 表示毫秒，`6` — 表示微秒。默认为 `3`。可选。 [UInt8](../data-types/int-uint.md)。
- `time_zone` — [时区](/operations/server-configuration-parameters/settings.md#timezone)。该函数根据时区解析 `time_string`。可选。 [String](../data-types/string.md)。

**返回值**

- 转换后的 [DateTime](../data-types/datetime.md) 数据类型。

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

同 [parseDateTime64BestEffort](#parsedatetime64besteffort) 函数，除了在模棱两可的情况下优先选择美国日期格式（`MM/DD/YYYY` 等）。
## parseDateTime64BestEffortOrNull {#parsedatetime64besteffortornull}

同 [parseDateTime64BestEffort](#parsedatetime64besteffort) 函数，除了在遇到无法处理的日期格式时返回 `NULL`。
## parseDateTime64BestEffortOrZero {#parsedatetime64besteffortorzero}

同 [parseDateTime64BestEffort](#parsedatetime64besteffort) 函数，除了在遇到无法处理的日期格式时返回零日期或零日期时间。
## parseDateTime64BestEffortUSOrNull {#parsedatetime64besteffortusornull}

同 [parseDateTime64BestEffort](#parsedatetime64besteffort) 函数，除了在模棱两可的情况下优先选择美国日期格式（`MM/DD/YYYY` 等），并在遇到无法处理的日期格式时返回 `NULL`。
## parseDateTime64BestEffortUSOrZero {#parsedatetime64besteffortusorzero}

同 [parseDateTime64BestEffort](#parsedatetime64besteffort) 函数，除了在模棱两可的情况下优先选择美国日期格式（`MM/DD/YYYY` 等），并在遇到无法处理的日期格式时返回零日期或零日期时间。
## toLowCardinality {#tolowcardinality}

将输入参数转换为相同数据类型的 [LowCardinality](../data-types/lowcardinality.md) 版本。

要将数据从 `LowCardinality` 数据类型转换，请使用 [CAST](#cast) 函数。例如： `CAST(x as String)`。

**语法**

```sql
toLowCardinality(expr)
```

**参数**

- `expr` — 结果为一种 [受支持的数据类型](/sql-reference/data-types) 的 [表达式](/sql-reference/syntax#expressions)。

**返回值**

- `expr` 的结果。 [LowCardinality](../data-types/lowcardinality.md) 类型的 `expr`。

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
## toUnixTimestamp64Second {#tounixtimestamp64second}

将 `DateTime64` 转换为具有固定秒精度的 `Int64` 值。输入值根据其精度适当缩放。

:::note
输出值为 UTC 时间戳，而不是 `DateTime64` 的时区。
:::

**语法**

```sql
toUnixTimestamp64Second(value)
```

**参数**

- `value` — 具有任意精度的 DateTime64 值。 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 转换为 `Int64` 数据类型的 `value`。 [Int64](../data-types/int-uint.md)。

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

将 `DateTime64` 转换为具有固定毫秒精度的 `Int64` 值。输入值根据其精度适当缩放。

:::note
输出值为 UTC 时间戳，而不是 `DateTime64` 的时区。
:::

**语法**

```sql
toUnixTimestamp64Milli(value)
```

**参数**

- `value` — 具有任意精度的 DateTime64 值。 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 转换为 `Int64` 数据类型的 `value`。 [Int64](../data-types/int-uint.md)。

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

将 `DateTime64` 转换为具有固定微秒精度的 `Int64` 值。输入值根据其精度适当缩放。

:::note
输出值为 UTC 时间戳，而不是 `DateTime64` 的时区。
:::

**语法**

```sql
toUnixTimestamp64Micro(value)
```

**参数**

- `value` — 具有任意精度的 DateTime64 值。 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 转换为 `Int64` 数据类型的 `value`。 [Int64](../data-types/int-uint.md)。

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

将 `DateTime64` 转换为具有固定纳秒精度的 `Int64` 值。输入值根据其精度适当缩放。

:::note
输出值为 UTC 时间戳，而不是 `DateTime64` 的时区。
:::

**语法**

```sql
toUnixTimestamp64Nano(value)
```

**参数**

- `value` — 具有任意精度的 DateTime64 值。 [DateTime64](../data-types/datetime64.md)。

**返回值**

- 转换为 `Int64` 数据类型的 `value`。 [Int64](../data-types/int-uint.md)。

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

将 `Int64` 转换为具有固定秒精度和可选时区的 `DateTime64` 值。输入值根据其精度适当缩放。

:::note
请注意，输入值被视为 UTC 时间戳，而不是给定（或隐式）时区的时间戳。
:::

**语法**

``` sql
fromUnixTimestamp64Second(value[, timezone])
```

**参数**

- `value` — 任意精度的值。 [Int64](../data-types/int-uint.md).
- `timezone` — （可选）结果的时区名称。 [String](../data-types/string.md).

**返回值**

- 将 `value` 转换为具有精度 `0` 的 DateTime64。 [DateTime64](../data-types/datetime64.md).

**示例**

查询:

``` sql
WITH CAST(1733935988, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Second(i64, 'UTC') AS x,
    toTypeName(x);
```

结果:

```response
┌───────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08 │ DateTime64(0, 'UTC') │
└─────────────────────┴──────────────────────┘
```
## fromUnixTimestamp64Milli {#fromunixtimestamp64milli}

将 `Int64` 转换为具有固定毫秒精度和可选时区的 `DateTime64` 值。输入值根据其精度适当缩放。

:::note
请注意，输入值被视为 UTC 时间戳，而不是给定（或隐式）时区的时间戳。
:::

**语法**

``` sql
fromUnixTimestamp64Milli(value[, timezone])
```

**参数**

- `value` — 任意精度的值。 [Int64](../data-types/int-uint.md).
- `timezone` — （可选）结果的时区名称。 [String](../data-types/string.md).

**返回值**

- 将 `value` 转换为具有精度 `3` 的 DateTime64。 [DateTime64](../data-types/datetime64.md).

**示例**

查询:

``` sql
WITH CAST(1733935988123, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Milli(i64, 'UTC') AS x,
    toTypeName(x);
```

结果:

```response
┌───────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123 │ DateTime64(3, 'UTC') │
└─────────────────────────┴──────────────────────┘
```
## fromUnixTimestamp64Micro {#fromunixtimestamp64micro}

将 `Int64` 转换为具有固定微秒精度和可选时区的 `DateTime64` 值。输入值根据其精度适当缩放。

:::note
请注意，输入值被视为 UTC 时间戳，而不是给定（或隐式）时区的时间戳。
:::

**语法**

``` sql
fromUnixTimestamp64Micro(value[, timezone])
```

**参数**

- `value` — 任意精度的值。 [Int64](../data-types/int-uint.md).
- `timezone` — （可选）结果的时区名称。 [String](../data-types/string.md).

**返回值**

- 将 `value` 转换为具有精度 `6` 的 DateTime64。 [DateTime64](../data-types/datetime64.md).

**示例**

查询:

``` sql
WITH CAST(1733935988123456, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Micro(i64, 'UTC') AS x,
    toTypeName(x);
```

结果:

```response
┌──────────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123456 │ DateTime64(6, 'UTC') │
└────────────────────────────┴──────────────────────┘
```
## fromUnixTimestamp64Nano {#fromunixtimestamp64nano}

将 `Int64` 转换为具有固定纳秒精度和可选时区的 `DateTime64` 值。输入值根据其精度适当缩放。

:::note
请注意，输入值被视为 UTC 时间戳，而不是给定（或隐式）时区的时间戳。
:::

**语法**

``` sql
fromUnixTimestamp64Nano(value[, timezone])
```

**参数**

- `value` — 任意精度的值。 [Int64](../data-types/int-uint.md).
- `timezone` — （可选）结果的时区名称。 [String](../data-types/string.md).

**返回值**

- 将 `value` 转换为具有精度 `9` 的 DateTime64。 [DateTime64](../data-types/datetime64.md).

**示例**

查询:

``` sql
WITH CAST(1733935988123456789, 'Int64') AS i64
SELECT
    fromUnixTimestamp64Nano(i64, 'UTC') AS x,
    toTypeName(x);
```

结果:

```response
┌─────────────────────────────x─┬─toTypeName(x)────────┐
│ 2024-12-11 16:53:08.123456789 │ DateTime64(9, 'UTC') │
└───────────────────────────────┴──────────────────────┘
```
## formatRow {#formatrow}

将任意表达式转换为通过给定格式生成的字符串。

**语法**

``` sql
formatRow(format, x, y, ...)
```

**参数**

- `format` — 文本格式。例如 [CSV](/interfaces/formats.md/#csv), [TSV](/interfaces/formats.md/#tabseparated).
- `x`,`y`, ... — 表达式。

**返回值**

- 格式化的字符串。（对于文本格式，通常以换行符结束）。

**示例**

查询:

``` sql
SELECT formatRow('CSV', number, 'good')
FROM numbers(3);
```

结果:

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

**注意**: 如果格式包含后缀/前缀，它将在每一行中写入。

**示例**

查询:

``` sql
SELECT formatRow('CustomSeparated', number, 'good')
FROM numbers(3)
SETTINGS format_custom_result_before_delimiter='<prefix>\n', format_custom_result_after_delimiter='<suffix>'
```

结果:

```response
┌─formatRow('CustomSeparated', number, 'good')─┐
│ <prefix>
0	good
<suffix>                   │
│ <prefix>
1	good
<suffix>                   │
│ <prefix>
2	good
<suffix>                   │
└──────────────────────────────────────────────┘
```

注意: 该函数仅支持基于行的格式。
## formatRowNoNewline {#formatrownonewline}

将任意表达式转换为通过给定格式生成的字符串。与 formatRow 的区别在于该函数会修剪最后一个 `\n`（如果有的话）。

**语法**

``` sql
formatRowNoNewline(format, x, y, ...)
```

**参数**

- `format` — 文本格式。例如 [CSV](/interfaces/formats.md/#csv), [TSV](/interfaces/formats.md/#tabseparated).
- `x`,`y`, ... — 表达式。

**返回值**

- 格式化的字符串。

**示例**

查询:

``` sql
SELECT formatRowNoNewline('CSV', number, 'good')
FROM numbers(3);
```

结果:

```response
┌─formatRowNoNewline('CSV', number, 'good')─┐
│ 0,"good"                                  │
│ 1,"good"                                  │
│ 2,"good"                                  │
└───────────────────────────────────────────┘
```
