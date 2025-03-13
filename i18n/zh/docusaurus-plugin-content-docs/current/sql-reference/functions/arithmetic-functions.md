---
slug: /sql-reference/functions/arithmetic-functions
sidebar_position: 5
sidebar_label: 算术
---


# 算术函数

算术函数适用于任何两个类型为 `UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32`、`Int64`、`Float32` 或 `Float64` 的操作数。

在执行操作之前，两个操作数都会被转换为结果类型。结果类型的确定如下（除非在下面的函数文档中另有说明）：
- 如果两个操作数的位宽都不超过 32 位，结果类型的大小将是两个操作数中较大者的下一个更大类型的大小（整数大小推广）。例如，`UInt8 + UInt16 = UInt32` 或 `Float32 * Float32 = Float64`。
- 如果其中一个操作数有 64 位或更多，则结果类型的大小将与两个操作数中较大者的大小相同。例如，`UInt32 + UInt128 = UInt128` 或 `Float32 * Float64 = Float64`。
- 如果其中一个操作数是带符号的，则结果类型也将是带符号的，否则它将是无符号的。例如，`UInt32 * Int32 = Int64`。

这些规则确保结果类型将是可以表示所有可能结果的最小类型。虽然这在值范围边界附近引入了溢出的风险，但它确保使用 64 位的最大本机整数宽度快速执行计算。这种行为也保证了与许多其他提供 64 位整数（BIGINT）作为最大整数类型的数据库的兼容性。

示例：

```sql
SELECT toTypeName(0), toTypeName(0 + 0), toTypeName(0 + 0 + 0), toTypeName(0 + 0 + 0 + 0)
```

```text
┌─toTypeName(0)─┬─toTypeName(plus(0, 0))─┬─toTypeName(plus(plus(0, 0), 0))─┬─toTypeName(plus(plus(plus(0, 0), 0), 0))─┐
│ UInt8         │ UInt16                 │ UInt32                          │ UInt64                                   │
└───────────────┴────────────────────────┴─────────────────────────────────┴──────────────────────────────────────────┘
```

溢出产生的方式与 C++ 中相同。

## plus {#plus}

计算两个值 `a` 和 `b` 的和。

**语法**

```sql
plus(a, b)
```

可以将整数与日期或带时间的日期相加。前一种操作会增加日期中的天数，而后一种操作会增加带时间日期中的秒数。

别名：`a + b`（操作符）

## minus {#minus}

计算两个值 `a` 和 `b` 的差。结果始终为有符号类型。

与 `plus` 类似，可以从日期或带时间的日期中减去一个整数。

此外，支持带时间的日期之间的减法，得到它们之间的时间差。

**语法**

```sql
minus(a, b)
```

别名：`a - b`（操作符）

## multiply {#multiply}

计算两个值 `a` 和 `b` 的乘积。

**语法**

```sql
multiply(a, b)
```

别名：`a * b`（操作符）

## divide {#divide}

计算两个值 `a` 和 `b` 的商。结果类型始终为 [Float64](../data-types/float.md)。整数除法使用 `intDiv` 函数提供。

除以 0 返回 `inf`、`-inf` 或 `nan`。

**语法**

```sql
divide(a, b)
```

别名：`a / b`（操作符）

## intDiv {#intdiv}

对两个值 `a` 和 `b` 进行整数除法，即计算商并向下取整到下一个较小的整数。

结果的宽度与被除数（第一个参数）相同。

在除以零、商不适合被除数范围时，或在将最小负数除以负一时会抛出异常。

**语法**

```sql
intDiv(a, b)
```

**示例**

查询：

```sql
SELECT
    intDiv(toFloat64(1), 0.001) AS res,
    toTypeName(res)
```

```response
┌──res─┬─toTypeName(intDiv(toFloat64(1), 0.001))─┐
│ 1000 │ Int64                                   │
└──────┴─────────────────────────────────────────┘
```

```sql
SELECT
    intDiv(1, 0.001) AS res,
    toTypeName(res)
```

```response
Received exception from server (version 23.2.1):
Code: 153. DB::Exception: Received from localhost:9000. DB::Exception: Cannot perform integer division, because it will produce infinite or too large number: While processing intDiv(1, 0.001) AS res, toTypeName(res). (ILLEGAL_DIVISION)
```

## intDivOrZero {#intdivorzero}

与 `intDiv` 相同，但在除以零或将最小负数除以负一时返回零。

**语法**

```sql
intDivOrZero(a, b)
```

## isFinite {#isfinite}

如果 Float32 或 Float64 参数不是无穷大且不是 NaN，则返回 1；否则此函数返回 0。

**语法**

```sql
isFinite(x)
```

## isInfinite {#isinfinite}

如果 Float32 或 Float64 参数是无穷大，则返回 1；否则此函数返回 0。请注意，对于 NaN 返回 0。

**语法**

```sql
isInfinite(x)
```

## ifNotFinite {#ifnotfinite}

检查浮点值是否是有限的。

**语法**

```sql
ifNotFinite(x,y)
```

**参数**

- `x` — 要检查是否为无穷大的值。[Float\*](../data-types/float.md)。
- `y` — 回退值。[Float\*](../data-types/float.md)。

**返回值**

- 如果 `x` 是有限的，则返回 `x`。
- 如果 `x` 不是有限的，则返回 `y`。

**示例**

查询：

    SELECT 1/0 as infimum, ifNotFinite(infimum,42)

结果：

    ┌─infimum─┬─ifNotFinite(divide(1, 0), 42)─┐
    │     inf │                            42 │
    └─────────┴───────────────────────────────┘

您可以使用 [三元操作符](/sql-reference/functions/conditional-functions#if) 获得类似的结果：`isFinite(x) ? x : y`。

## isNaN {#isnan}

如果 Float32 和 Float64 参数是 NaN，则返回 1；否则此函数返回 0。

**语法**

```sql
isNaN(x)
```

## modulo {#modulo}

计算两个值 `a` 和 `b` 除法的余数。

如果两个输入都是整数，则结果类型为整数。如果其中一个输入是浮点数，则结果类型为 [Float64](../data-types/float.md)。

余数的计算方式与 C++ 中相同。对于负数使用截断除法。

在除以零或将最小负数除以负一时会抛出异常。

**语法**

```sql
modulo(a, b)
```

别名：`a % b`（操作符）

## moduloOrZero {#moduloorzero}

与 [modulo](#modulo) 相似，但在除数为零时返回零。

**语法**

```sql
moduloOrZero(a, b)
```

## positiveModulo(a, b) {#positivemoduloa-b}

与 [modulo](#modulo) 相似，但始终返回非负数。

此函数的速度比 `modulo` 慢 4-5 倍。

**语法**

```sql
positiveModulo(a, b)
```

别名：
- `positive_modulo(a, b)`
- `pmod(a, b)`

**示例**

查询：

```sql
SELECT positiveModulo(-1, 10)
```

结果：

```result
┌─positiveModulo(-1, 10)─┐
│                      9 │
└────────────────────────┘
```

## negate {#negate}

对值 `a` 取反。结果始终为有符号类型。

**语法**

```sql
negate(a)
```

别名：`-a`

## abs {#abs}

计算 `a` 的绝对值。如果 `a` 是无符号类型，则没有影响。如果 `a` 是带符号类型，则返回一个无符号数。

**语法**

```sql
abs(a)
```

## gcd {#gcd}

返回两个值 `a` 和 `b` 的最大公约数。

在除以零或将最小负数除以负一时会抛出异常。

**语法**

```sql
gcd(a, b)
```

## lcm(a, b) {#lcma-b}

返回两个值 `a` 和 `b` 的最小公倍数。

在除以零或将最小负数除以负一时会抛出异常。

**语法**

```sql
lcm(a, b)
```

## max2 {#max2}

返回两个值 `a` 和 `b` 中较大的一个。返回值类型为 [Float64](../data-types/float.md)。

**语法**

```sql
max2(a, b)
```

**示例**

查询：

```sql
SELECT max2(-1, 2);
```

结果：

```result
┌─max2(-1, 2)─┐
│           2 │
└─────────────┘
```

## min2 {#min2}

返回两个值 `a` 和 `b` 中较小的一个。返回值类型为 [Float64](../data-types/float.md)。

**语法**

```sql
min2(a, b)
```

**示例**

查询：

```sql
SELECT min2(-1, 2);
```

结果：

```result
┌─min2(-1, 2)─┐
│          -1 │
└─────────────┘
```

## multiplyDecimal {#multiplydecimal}

将两个十进制数 `a` 和 `b` 相乘。结果值类型为 [Decimal256](../data-types/decimal.md)。

结果的规模可以通过 `result_scale` 显式指定。如果未指定 `result_scale`，则假定为输入值的最大规模。

此函数的执行速度明显慢于普通的 `multiply`。如果不需要控制结果精度和/或需要快速计算，建议使用 `multiply`。

**语法**

```sql
multiplyDecimal(a, b[, result_scale])
```

**参数**

- `a` — 第一个值。[Decimal](../data-types/decimal.md)。
- `b` — 第二个值。[Decimal](../data-types/decimal.md)。
- `result_scale` — 结果的规模。[Int/UInt](../data-types/int-uint.md)。

**返回值**

- 带有给定规模的乘法结果。[Decimal256](../data-types/decimal.md)。

**示例**

```result
┌─multiplyDecimal(toDecimal256(-12, 0), toDecimal32(-2.1, 1), 1)─┐
│                                                           25.2 │
└────────────────────────────────────────────────────────────────┘
```

**与常规乘法的比较：**

```sql
SELECT toDecimal64(-12.647, 3) * toDecimal32(2.1239, 4);
SELECT toDecimal64(-12.647, 3) as a, toDecimal32(2.1239, 4) as b, multiplyDecimal(a, b);
```

结果：

```result
┌─multiply(toDecimal64(-12.647, 3), toDecimal32(2.1239, 4))─┐
│                                               -26.8609633 │
└───────────────────────────────────────────────────────────┘
┌───────a─┬──────b─┬─multiplyDecimal(toDecimal64(-12.647, 3), toDecimal32(2.1239, 4))─┐
│ -12.647 │ 2.1239 │                                                         -26.8609 │
└─────────┴────────┴──────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    toDecimal64(-12.647987876, 9) AS a,
    toDecimal64(123.967645643, 9) AS b,
    multiplyDecimal(a, b);

SELECT
    toDecimal64(-12.647987876, 9) AS a,
    toDecimal64(123.967645643, 9) AS b,
    a * b;
```

结果：

```result
┌─────────────a─┬─────────────b─┬─multiplyDecimal(toDecimal64(-12.647987876, 9), toDecimal64(123.967645643, 9))─┐
│ -12.647987876 │ 123.967645643 │                                                               -1567.941279108 │
└───────────────┴───────────────┴───────────────────────────────────────────────────────────────────────────────┘

Received exception from server (version 22.11.1):
Code: 407. DB::Exception: Received from localhost:9000. DB::Exception: Decimal math overflow: While processing toDecimal64(-12.647987876, 9) AS a, toDecimal64(123.967645643, 9) AS b, a * b. (DECIMAL_OVERFLOW)
```

## divideDecimal {#dividedecimal}

将两个十进制数 `a` 和 `b` 相除。结果值类型为 [Decimal256](../data-types/decimal.md)。

结果的规模可以通过 `result_scale` 显式指定。如果未指定 `result_scale`，则假定为输入值的最大规模。

此函数的执行速度明显慢于普通的 `divide`。如果不需要控制结果精度和/或需要快速计算，建议使用 `divide`。

**语法**

```sql
divideDecimal(a, b[, result_scale])
```

**参数**

- `a` — 第一个值：[Decimal](../data-types/decimal.md)。
- `b` — 第二个值：[Decimal](../data-types/decimal.md)。
- `result_scale` — 结果的规模：[Int/UInt](../data-types/int-uint.md)。

**返回值**

- 带有给定规模的除法结果。[Decimal256](../data-types/decimal.md)。

**示例**

```result
┌─divideDecimal(toDecimal256(-12, 0), toDecimal32(2.1, 1), 10)─┐
│                                                -5.7142857142 │
└──────────────────────────────────────────────────────────────┘
```

**与常规除法的比较：**

```sql
SELECT toDecimal64(-12, 1) / toDecimal32(2.1, 1);
SELECT toDecimal64(-12, 1) as a, toDecimal32(2.1, 1) as b, divideDecimal(a, b, 1), divideDecimal(a, b, 5);
```

结果：

```result
┌─divide(toDecimal64(-12, 1), toDecimal32(2.1, 1))─┐
│                                             -5.7 │
└──────────────────────────────────────────────────┘

┌───a─┬───b─┬─divideDecimal(toDecimal64(-12, 1), toDecimal32(2.1, 1), 1)─┬─divideDecimal(toDecimal64(-12, 1), toDecimal32(2.1, 1), 5)─┐
│ -12 │ 2.1 │                                                       -5.7 │                                                   -5.71428 │
└─────┴─────┴────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

```sql
SELECT toDecimal64(-12, 0) / toDecimal32(2.1, 1);
SELECT toDecimal64(-12, 0) as a, toDecimal32(2.1, 1) as b, divideDecimal(a, b, 1), divideDecimal(a, b, 5);
```

结果：

```result
DB::Exception: Decimal result's scale is less than argument's one: While processing toDecimal64(-12, 0) / toDecimal32(2.1, 1). (ARGUMENT_OUT_OF_BOUND)

┌───a─┬───b─┬─divideDecimal(toDecimal64(-12, 0), toDecimal32(2.1, 1), 1)─┬─divideDecimal(toDecimal64(-12, 0), toDecimal32(2.1, 1), 5)─┐
│ -12 │ 2.1 │                                                       -5.7 │                                                   -5.71428 │
└─────┴─────┴────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

## byteSwap {#byteswap}

反转一个整数的字节，即更改其 [字节序](https://en.wikipedia.org/wiki/Endianness)。

**语法**

```sql
byteSwap(a)
```

**示例**

```sql
byteSwap(3351772109)
```

结果：

```result
┌─byteSwap(3351772109)─┐
│           3455829959 │
└──────────────────────┘
```

以上示例的计算过程如下：
1. 将十进制整数转换为其在大端格式下的等效十六进制格式，即 3351772109 -> C7 C7 FB CD （4 字节）
2. 反转字节，即 C7 C7 FB CD -> CD FB C7 C7
3. 将结果重新转换为假设为大端的整数，即 CD FB C7 C7  -> 3455829959

此函数的一个用例是反转 IPv4：

```result
┌─toIPv4(byteSwap(toUInt32(toIPv4('205.251.199.199'))))─┐
│ 199.199.251.205                                       │
└───────────────────────────────────────────────────────┘
```
