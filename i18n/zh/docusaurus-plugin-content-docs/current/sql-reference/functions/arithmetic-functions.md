---
'description': 'Documentation for Arithmetic Functions'
'sidebar_label': 'Arithmetic'
'sidebar_position': 5
'slug': '/sql-reference/functions/arithmetic-functions'
'title': 'Arithmetic Functions'
---




# 算术函数

算术函数适用于任何两个操作数类型为 `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Int8`, `Int16`, `Int32`, `Int64`, `Float32` 或 `Float64` 的操作数。

在执行操作之前，两个操作数都会被转换为结果类型。结果类型的确定方式如下（除非在下面的函数文档中另有说明）：
- 如果两个操作数的位宽均不超过 32 位，则结果类型的大小将为两个操作数中较大的操作数的下一个更大类型的大小（整数大小提升）。例如，`UInt8 + UInt16 = UInt32` 或 `Float32 * Float32 = Float64`。
- 如果一个操作数的位数为 64 位或更高，则结果类型的大小将与较大的操作数的大小相同。例如，`UInt32 + UInt128 = UInt128` 或 `Float32 * Float64 = Float64`。
- 如果一个操作数是有符号的，则结果类型也将是有符号的，否则将是无符号的。例如，`UInt32 * Int32 = Int64`。

这些规则确保结果类型将是能够表示所有可能结果的最小类型。尽管这在值范围边界附近引入了溢出的风险，但它确保了计算使用最大的本机整数宽度（64 位）快速执行。这种行为还确保了与许多其他数据库的兼容性，这些数据库提供的最大整数类型为 64 位整数（BIGINT）。

示例：

```sql
SELECT toTypeName(0), toTypeName(0 + 0), toTypeName(0 + 0 + 0), toTypeName(0 + 0 + 0 + 0)
```

```text
┌─toTypeName(0)─┬─toTypeName(plus(0, 0))─┬─toTypeName(plus(plus(0, 0), 0))─┬─toTypeName(plus(plus(plus(0, 0), 0), 0))─┐
│ UInt8         │ UInt16                 │ UInt32                          │ UInt64                                   │
└───────────────┴────────────────────────┴─────────────────────────────────┴──────────────────────────────────────────┘
```

溢出以与 C++ 相同的方式产生。

## plus {#plus}

计算两个值 `a` 和 `b` 的和。

**语法**

```sql
plus(a, b)
```

可以将一个整数与日期或日期时间相加。前者操作会增加日期中的天数，后者操作会增加日期时间中的秒数。

别名：`a + b`（运算符）

## minus {#minus}

计算两个值 `a` 和 `b` 的差值。结果总是有符号的。

与 `plus` 类似，可以从日期或日期时间中减去一个整数。

另外，支持日期时间之间的减法，结果为它们之间的时间差。

**语法**

```sql
minus(a, b)
```

别名：`a - b`（运算符）

## multiply {#multiply}

计算两个值 `a` 和 `b` 的乘积。

**语法**

```sql
multiply(a, b)
```

别名：`a * b`（运算符）

## divide {#divide}

计算两个值 `a` 和 `b` 的商。结果类型始终为 [Float64](../data-types/float.md)。整数除法由 `intDiv` 函数提供。

除以 0 返回 `inf`, `-inf`, 或 `nan`。

**语法**

```sql
divide(a, b)
```

别名：`a / b`（运算符）

## divideOrNull {#divideornull}

像 [divide](#divide)，但当除数为零时返回 null。

**语法**

```sql
divideOrNull(a, b)
```

## intDiv {#intdiv}

对两个值 `a` 和 `b` 执行整数除法，即计算出商并向下舍入到下一个最小的整数。

结果与被除数（第一个参数）具有相同的宽度。

当除以零时、商不在被除数范围内时，或将一个最小的负数除以负一时，会抛出异常。

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

与 `intDiv` 相同，但在除以零或将一个最小的负数除以负一时返回零。

**语法**

```sql
intDivOrZero(a, b)
```

## intDivOrNull {#intdivornull}

像 [intDiv](#intdiv)，但在除数为零时返回 null。

**语法**

```sql
intDivOrNull(a, b)
```

## isFinite {#isfinite}

如果 Float32 或 Float64 参数是有限的且不是 NaN，则返回 1，否则返回 0。

**语法**

```sql
isFinite(x)
```

## isInfinite {#isinfinite}

如果 Float32 或 Float64 参数是无限的，则返回 1，否则返回 0。请注意，对于 NaN 返回的是 0。

**语法**

```sql
isInfinite(x)
```

## ifNotFinite {#ifnotfinite}

检查一个浮点值是否为有限。

**语法**

```sql
ifNotFinite(x,y)
```

**参数**

- `x` — 要检查是否为无限的值。[Float\*](../data-types/float.md)。
- `y` — 后备值。[Float\*](../data-types/float.md)。

**返回值**

- 如果 `x` 是有限的，返回 `x`。
- 如果 `x` 不是有限的，返回 `y`。

**示例**

查询：

    SELECT 1/0 as infimum, ifNotFinite(infimum,42)

结果：

    ┌─infimum─┬─ifNotFinite(divide(1, 0), 42)─┐
    │     inf │                            42 │
    └─────────┴───────────────────────────────┘

您可以使用 [三元运算符](/sql-reference/functions/conditional-functions#if) 来获取类似的结果：`isFinite(x) ? x : y`。

## isNaN {#isnan}

如果 Float32 或 Float64 参数是 NaN，则返回 1，否则返回 0。

**语法**

```sql
isNaN(x)
```

## modulo {#modulo}

计算两个值 `a` 和 `b` 之间除法的余数。

如果两个输入都是整数，则结果类型为整数。如果其中一个输入是浮点数，则结果类型为 [Float64](../data-types/float.md)。

余数的计算方式与 C++ 相同。对于负数使用截断除法。

当除以零或将一个最小的负数除以负一时会抛出异常。

**语法**

```sql
modulo(a, b)
```

别名：`a % b`（运算符）

## moduloOrZero {#moduloorzero}

像 [modulo](#modulo)，但当除数为零时返回零。

**语法**

```sql
moduloOrZero(a, b)
```

## moduloOrNull {#moduloornull}

像 [modulo](#modulo)，但当除数为零时返回 null。

**语法**

```sql
moduloOrNull(a, b)
```

## positiveModulo(a, b) {#positivemoduloa-b}

像 [modulo](#modulo)，但始终返回非负数。

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

## positiveModuloOrNull(a, b) {#positivemoduloornulla-b}

像 [positiveModulo](#positivemoduloa-b)，但在除数为零时返回 null。

**语法**

```sql
positiveModuloOrNull(a, b)
```

## negate {#negate}

取值 `a` 的相反数。结果总是有符号的。

**语法**

```sql
negate(a)
```

别名：`-a`

## abs {#abs}

计算 `a` 的绝对值。如果 `a` 是无符号类型则无效。如果 `a` 是有符号类型，则返回无符号数。

**语法**

```sql
abs(a)
```

## gcd {#gcd}

返回两个值 `a` 和 `b` 的最大公约数。

当除以零或将一个最小的负数除以负一时会抛出异常。

**语法**

```sql
gcd(a, b)
```

## lcm(a, b) {#lcma-b}

返回两个值 `a` 和 `b` 的最小公倍数。

当除以零或将一个最小的负数除以负一时会抛出异常。

**语法**

```sql
lcm(a, b)
```

## max2 {#max2}

返回两个值 `a` 和 `b` 中较大的值。返回值的类型为 [Float64](../data-types/float.md)。

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

返回两个值 `a` 和 `b` 中较小的值。返回值的类型为 [Float64](../data-types/float.md)。

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

将两个十进制数 `a` 和 `b` 相乘。结果值的类型为 [Decimal256](../data-types/decimal.md)。

可以通过 `result_scale` 明确指定结果的刻度。如果未指定 `result_scale`，则假设为输入值的最大刻度。

此函数的执行速度显著慢于常规的 `multiply`。如果不需要控制结果精度或希望快速计算，考虑使用 `multiply`。

**语法**

```sql
multiplyDecimal(a, b[, result_scale])
```

**参数**

- `a` — 第一个值。[Decimal](../data-types/decimal.md)。
- `b` — 第二个值。[Decimal](../data-types/decimal.md)。
- `result_scale` — 结果的刻度。[Int/UInt](../data-types/int-uint.md)。

**返回值**

- 具有给定刻度的乘积结果。[Decimal256](../data-types/decimal.md)。

**示例**

```result
┌─multiplyDecimal(toDecimal256(-12, 0), toDecimal32(-2.1, 1), 1)─┐
│                                                           25.2 │
└────────────────────────────────────────────────────────────────┘
```

**与常规乘法的区别：**

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


将两个十进制数 `a` 和 `b` 相除。结果值的类型为 [Decimal256](../data-types/decimal.md)。

可以通过 `result_scale` 明确指定结果的刻度。如果未指定 `result_scale`，则假设为输入值的最大刻度。

此函数的执行速度显著慢于常规的 `divide`。如果不需要控制结果精度或希望快速计算，考虑使用 `divide`。

**语法**

```sql
divideDecimal(a, b[, result_scale])
```

**参数**

- `a` — 第一个值：[Decimal](../data-types/decimal.md)。
- `b` — 第二个值：[Decimal](../data-types/decimal.md)。
- `result_scale` — 结果的刻度：[Int/UInt](../data-types/int-uint.md)。

**返回值**

- 具有给定刻度的除法结果。[Decimal256](../data-types/decimal.md)。

**示例**

```result
┌─divideDecimal(toDecimal256(-12, 0), toDecimal32(2.1, 1), 10)─┐
│                                                -5.7142857142 │
└──────────────────────────────────────────────────────────────┘
```

**与常规除法的区别：**

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

反转整数的字节，即改变其 [字节序](https://en.wikipedia.org/wiki/Endianness)。

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

上述示例可以通过以下步骤得出：
1. 将十进制整数转换为其在大字节序中的等效十六进制格式，即 3351772109 -> C7 C7 FB CD（4 字节）
2. 反转字节，即 C7 C7 FB CD -> CD FB C7 C7
3. 假定为大字节序，将结果转换回整数，即 CD FB C7 C7 -> 3455829959

此函数的一个用例是反转 IPv4 地址：

```result
┌─toIPv4(byteSwap(toUInt32(toIPv4('205.251.199.199'))))─┐
│ 199.199.251.205                                       │
└───────────────────────────────────────────────────────┘
```

<!-- 
以下标签内的内容在文档框架构建时将被
从 system.functions 生成的文档所替换。请勿修改或删除这些标签。
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
