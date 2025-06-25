---
'description': 'Arithmetic Functions 的文档'
'sidebar_label': 'Arithmetic'
'sidebar_position': 5
'slug': '/sql-reference/functions/arithmetic-functions'
'title': '算术函数'
---


# 算数函数

算数函数适用于任何两个类型为 `UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32`、`Int64`、`Float32` 或 `Float64` 的操作数。

在执行操作之前，两个操作数都被强制转换为结果类型。结果类型的确定方式如下（除非在下面的函数文档中另有说明）：
- 如果两个操作数的位宽都不超过32位，则结果类型的大小将为比两个操作数中较大者相应的下一个更大类型的大小（整数大小提升）。例如，`UInt8 + UInt16 = UInt32` 或 `Float32 * Float32 = Float64`。
- 如果其中一个操作数的位数为64位或更高，则结果类型的大小将与两个操作数中较大的那一个相同。例如，`UInt32 + UInt128 = UInt128` 或 `Float32 * Float64 = Float64`。
- 如果其中一个操作数为有符号，结果类型也将是有符号的，否则将为无符号。例如，`UInt32 * Int32 = Int64`。

这些规则确保结果类型将是最小的能够表示所有可能结果的类型。虽然这在值范围边界周围引入了溢出的风险，但它确保了使用最大本机整数宽度64位快速执行计算。这种行为还保证与许多提供64位整数（BIGINT）作为最大整数类型的其他数据库的兼容性。

示例：

```sql
SELECT toTypeName(0), toTypeName(0 + 0), toTypeName(0 + 0 + 0), toTypeName(0 + 0 + 0 + 0)
```

```text
┌─toTypeName(0)─┬─toTypeName(plus(0, 0))─┬─toTypeName(plus(plus(0, 0), 0))─┬─toTypeName(plus(plus(plus(0, 0), 0), 0))─┐
│ UInt8         │ UInt16                 │ UInt32                          │ UInt64                                   │
└───────────────┴────────────────────────┴─────────────────────────────────┴──────────────────────────────────────────┘
```

溢出产生的方式与 C++ 相同。

## plus {#plus}

计算两个值 `a` 和 `b` 的和。

**语法**

```sql
plus(a, b)
```

可以将一个整数与日期或带时间的日期相加。前者操作会增加日期中的天数，后者操作则会增加带时间的日期中的秒数。

别名：`a + b`（运算符）

## minus {#minus}

计算两个值 `a` 和 `b` 的差。结果始终为有符号。

与 `plus` 类似，可以从日期或带时间的日期中减去一个整数。

此外，支持带时间日期之间的减法，结果为它们之间的时间差。

**语法**

```sql
minus(a, b)
```

别名：`a - b`（运算符）

## multiply {#multiply}

计算两个值 `a` 和 `b` 的积。

**语法**

```sql
multiply(a, b)
```

别名：`a * b`（运算符）

## divide {#divide}

计算两个值 `a` 和 `b` 的商。结果类型始终为 [Float64](../data-types/float.md)。整数除法由 `intDiv` 函数提供。

除以 0 将返回 `inf`、`-inf` 或 `nan`。

**语法**

```sql
divide(a, b)
```

别名：`a / b`（运算符）

## divideOrNull {#divideornull}

如同 [divide](#divide)，但当除数为零时返回 null。

**语法**

```sql
divideOrNull(a, b)
```

## intDiv {#intdiv}

执行两个值 `a` 除以 `b` 的整数除法，即计算向下取整到下一个最小整数的商。

结果的宽度与被除数（第一个参数）相同。

当除以零、商不适合被除数的范围或者将最小负数除以 -1 时会抛出异常。

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

与 `intDiv` 相同，但在除以零或将最小负数除以 -1 时返回零。

**语法**

```sql
intDivOrZero(a, b)
```

## intDivOrNull {#intdivornull}

如同 [intDiv](#intdiv)，但当除数为零时返回 null。

**语法**

```sql
intDivOrNull(a, b)
```

## isFinite {#isfinite}

如果 Float32 或 Float64 参数不是无限大且不是 NaN，则返回 1；否则该函数返回 0。

**语法**

```sql
isFinite(x)
```

## isInfinite {#isinfinite}

如果 Float32 或 Float64 参数是无限大，则返回 1；否则该函数返回 0。注意 NaN 会返回 0。

**语法**

```sql
isInfinite(x)
```

## ifNotFinite {#ifnotfinite}

检查浮点值是否有限。

**语法**

```sql
ifNotFinite(x,y)
```

**参数**

- `x` — 要检查无限的值。[Float\*](../data-types/float.md)。
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

您可以通过使用 [三元运算符](/sql-reference/functions/conditional-functions#if) 获取类似结果：`isFinite(x) ? x : y`。

## isNaN {#isnan}

如果 Float32 和 Float64 参数是 NaN，则返回 1；否则该函数返回 0。

**语法**

```sql
isNaN(x)
```

## modulo {#modulo}

计算两值 `a` 除以 `b` 的余数。

如果两个输入都是整数，则结果类型为整数。如果其中一个输入是浮点数，则结果类型为 [Float64](../data-types/float.md)。

余数的计算方式与 C++ 相同。对负数使用截断除法。

当除以零或将最小负数除以 -1 时会抛出异常。

**语法**

```sql
modulo(a, b)
```

别名：`a % b`（运算符）

## moduloOrZero {#moduloorzero}

如同 [modulo](#modulo)，但当除数为零时返回零。

**语法**

```sql
moduloOrZero(a, b)
```

## moduloOrNull {#moduloornull}

如同 [modulo](#modulo)，但当除数为零时返回 null。

**语法**

```sql
moduloOrNull(a, b)
```

## positiveModulo(a, b) {#positivemoduloa-b}

如同 [modulo](#modulo)，但始终返回非负数。

此函数比 `modulo` 慢 4-5 倍。

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

如同 [positiveModulo](#positivemoduloa-b)，但当除数为零时返回 null。

**语法**

```sql
positiveModuloOrNull(a, b)
```

## negate {#negate}

对值 `a` 取反。结果始终为有符号。

**语法**

```sql
negate(a)
```

别名：`-a`

## abs {#abs}

计算 `a` 的绝对值。如果 `a` 为无符号类型，则无效。如果 `a` 为有符号类型，则返回无符号数。

**语法**

```sql
abs(a)
```

## gcd {#gcd}

返回两个值 `a` 和 `b` 的最大公约数。

当除以零或将最小负数除以 -1 时会抛出异常。

**语法**

```sql
gcd(a, b)
```

## lcm(a, b) {#lcma-b}

返回两个值 `a` 和 `b` 的最小公倍数。

当除以零或将最小负数除以 -1 时会抛出异常。

**语法**

```sql
lcm(a, b)
```

## max2 {#max2}

返回两个值 `a` 和 `b` 中较大的一个。返回值的类型为 [Float64](../data-types/float.md)。

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

返回两个值 `a` 和 `b` 中较小的一个。返回值的类型为 [Float64](../data-types/float.md)。

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

对两个小数 `a` 和 `b` 进行乘法运算。结果值将为 [Decimal256](../data-types/decimal.md) 类型。

结果的刻度可以通过 `result_scale` 明确指定。如果未指定 `result_scale`，则假设为输入值的最大刻度。

此函数的工作速度显著慢于普通 `multiply`。如果不需要控制结果精度和/或希望快速计算，可以考虑使用 `multiply`。

**语法**

```sql
multiplyDecimal(a, b[, result_scale])
```

**参数**

- `a` — 第一个值。[Decimal](../data-types/decimal.md)。
- `b` — 第二个值。[Decimal](../data-types/decimal.md)。
- `result_scale` — 结果的刻度。[Int/UInt](../data-types/int-uint.md)。

**返回值**

- 按给定刻度进行的乘法运算的结果。[Decimal256](../data-types/decimal.md)。

**示例**

```result
┌─multiplyDecimal(toDecimal256(-12, 0), toDecimal32(-2.1, 1), 1)─┐
│                                                           25.2 │
└────────────────────────────────────────────────────────────────┘
```

**与普通乘法的差异：**

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

对两个小数 `a` 和 `b` 进行除法运算。结果值将为 [Decimal256](../data-types/decimal.md) 类型。

结果的刻度可以通过 `result_scale` 明确指定。如果未指定 `result_scale`，则假设为输入值的最大刻度。

此函数的工作速度显著慢于普通 `divide`。如果不需要控制结果精度和/或希望快速计算，可以考虑使用 `divide`。

**语法**

```sql
divideDecimal(a, b[, result_scale])
```

**参数**

- `a` — 第一个值：[Decimal](../data-types/decimal.md)。
- `b` — 第二个值：[Decimal](../data-types/decimal.md)。
- `result_scale` — 结果的刻度：[Int/UInt](../data-types/int-uint.md)。

**返回值**

- 按给定刻度进行的除法运算的结果。[Decimal256](../data-types/decimal.md)。

**示例**

```result
┌─divideDecimal(toDecimal256(-12, 0), toDecimal32(2.1, 1), 10)─┐
│                                                -5.7142857142 │
└──────────────────────────────────────────────────────────────┘
```

**与普通除法的差异：**

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

上述示例可按以下方式计算：
1. 将十进制整数转换为其大端格式的十六进制格式，即 3351772109 -> C7 C7 FB CD（4 字节）
2. 反转字节，即 C7 C7 FB CD -> CD FB C7 C7
3. 假设为大端，将结果转换回整数，即 CD FB C7 C7 -> 3455829959

此函数的一个用例是反转 IPv4：

```result
┌─toIPv4(byteSwap(toUInt32(toIPv4('205.251.199.199'))))─┐
│ 199.199.251.205                                       │
└───────────────────────────────────────────────────────┘
```

<!-- 
下方标签的内部内容将在文档框架构建时替换为
从 system.functions 生成的文档。请勿修改或删除这些标签。
请参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
## abs {#abs}

引入于：v1.1

**语法**

```sql
abs(x)
```

**参数**

- `x` — 要获取绝对值的值

**返回值**

`x` 的绝对值

**示例**

**用法示例**

```sql title=Query
SELECT abs(-0.5)
```

```response title=Response
0.5
```



## byteSwap {#byteSwap}

引入于：v23.10

**语法**

```sql
byteSwap(x)
```

**参数**

- `x` — 一个整数值。

**返回值**

x 的字节反转

**示例**

**用法示例**

```sql title=Query
SELECT byteSwap(3351772109)
```

```response title=Response
3455829959
```

**8位**

```sql title=Query
SELECT byteSwap(54)
```

```response title=Response
54
```

**16位**

```sql title=Query
SELECT byteSwap(4135)
```

```response title=Response
10000
```

**32位**

```sql title=Query
SELECT byteSwap(3351772109)
```

```response title=Response
3455829959
```

**64位**

```sql title=Query
SELECT byteSwap(123294967295)
```

```response title=Response
18439412204227788800
```



## divide {#divide}

引入于：v1.1

**语法**

```sql
divide(x, y)
```

**参数**

- `x` — 被除数
- `y` — 除数

**返回值**

x 和 y 的商

**示例**

**除法计算**

```sql title=Query
SELECT divide(25,5) AS quotient, toTypeName(quotient)
```

```response title=Response
5 Float64
```

**除以零**

```sql title=Query
SELECT divide(25,0)
```

```response title=Response
inf
```



## divideDecimal {#divideDecimal}

引入于：v22.12

**语法**

```sql
divideDecimal(x, y[, result_scale])
```

**参数**

- `x` — 第一个值：[Decimal](/sql-reference/data-types/decimal)。
- `y` — 第二个值：[Decimal](/sql-reference/data-types/decimal)。
- `result_scale` — 结果的刻度。类型 [Int/UInt](/sql-reference/data-types/int-uint)。

**返回值**

按给定刻度进行的除法运算的结果。类型: [Decimal256](/sql-reference/data-types/decimal.md)。

**示例**

**示例 1**

```sql title=Query
divideDecimal(toDecimal256(-12, 0), toDecimal32(2.1, 1), 10)
```

```response title=Response
┌─divideDecimal(toDecimal256(-12, 0), toDecimal32(2.1, 1), 10)─┐
│                                                -5.7142857142 │
└──────────────────────────────────────────────────────────────┘
```

**示例 2**

```sql title=Query
SELECT toDecimal64(-12, 1) / toDecimal32(2.1, 1);
SELECT toDecimal64(-12, 1) as a, toDecimal32(2.1, 1) as b, divideDecimal(a, b, 1), divideDecimal(a, b, 5);
```

```response title=Response
┌─divide(toDecimal64(-12, 1), toDecimal32(2.1, 1))─┐
│                                             -5.7 │
└──────────────────────────────────────────────────┘
┌───a─┬───b─┬─divideDecimal(toDecimal64(-12, 1), toDecimal32(2.1, 1), 1)─┬─divideDecimal(toDecimal64(-12, 1), toDecimal32(2.1, 1), 5)─┐
│ -12 │ 2.1 │                                                       -5.7 │                                                   -5.71428 │
└─────┴─────┴────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```



## gcd {#gcd}

引入于：v1.1

**语法**

```sql
gcd(x, y)
```

**参数**

- `x` — 第一个整数
- `y` — 第二个整数

**返回值**

`x` 和 `y` 的最大公约数。

**示例**

**用法示例**

```sql title=Query
SELECT gcd(12, 18)
```

```response title=Response
6
```



## ifNotFinite {#ifNotFinite}

引入于：v20.3

**语法**

```sql
ifNotFinite(x,y)
```

**参数**

- `x` — 检查是否为无限的值。Float32/Float64
- `y` — 回退值。Float32/Float64

**返回值**

- 如果 `x` 是有限的，则返回 `x`。
- 如果 `x` 不是有限的，则返回 `y`。

**示例**

**用法示例**

```sql title=Query
SELECT 1/0 AS infimum, ifNotFinite(infimum,42)
```

```response title=Response
inf  42
```



## intDiv {#intDiv}

引入于：v1.1

**语法**

```sql
intDiv(x, y)
```

**参数**

- `x` — 左操作数。
- `y` — 右操作数。

**返回值**

`x` 和 `y` 的整数除法结果

**示例**

**两个浮点数的整数除法**

```sql title=Query
SELECT intDiv(toFloat64(1), 0.001) AS res, toTypeName(res)
```

```response title=Response
┌──res─┬─toTypeName(intDiv(toFloat64(1), 0.001))─┐
│ 1000 │ Int64                                   │
└──────┴─────────────────────────────────────────┘
```

**商不适合被除数的范围**

```sql title=Query
SELECT
intDiv(1, 0.001) AS res,
toTypeName(res)
```

```response title=Response
Received exception from server (version 23.2.1):
Code: 153. DB::Exception: Received from localhost:9000. DB::Exception:
Cannot perform integer division, because it will produce infinite or too
large number: While processing intDiv(1, 0.001) AS res, toTypeName(res).
(ILLEGAL_DIVISION)
```



## intDivOrZero {#intDivOrZero}

引入于：v1.1

**语法**

```sql
intDivOrZero(a, b)
```

**参数**

- `a` — 左操作数。
- `b` — 右操作数。

**返回值**

`a` 和 `b` 的整数除法结果，或零。

**示例**

**以零进行整数除法**

```sql title=Query
SELECT intDivOrZero(1, 0)
```

```response title=Response
0
```

**将最小负数除以负 1**

```sql title=Query
SELECT intDivOrZero(0.05, -1)
```

```response title=Response
0
```



## isFinite {#isFinite}

引入于：v1.1

**语法**

```sql
isFinite(x)
```

**参数**

- `x` — 检查有限性的数字。Float32 或 Float64。

**返回值**

如果 x 不是无限大且不是 `NaN`，则返回 `1`，否则返回 `0`。

**示例**

**测试数字是否有限**

```sql title=Query
SELECT isFinite(inf)
```

```response title=Response
0
```



## isInfinite {#isInfinite}

引入于：v1.1

**语法**

```sql
isInfinite(x)
```

**参数**

- `x` — 检查无限性的数字。Float32 或 Float64。

**返回值**

如果 x 是无限大，则返回 `1`，否则返回 `0`（包括 `NaN` 的情况）。

**示例**

**测试数字是否无限**

```sql title=Query
SELECT isInfinite(inf), isInfinite(NaN), isInfinite(10))
```

```response title=Response
1 0 0
```



## isNaN {#isNaN}

引入于：v1.1

**语法**

```sql
isNaN(x)
```

**参数**

- `x` — 要评估是否为 `NaN` 的参数

**返回值**

如果为 `NaN` 则返回 `1`，否则返回 `0`

**示例**

**用法示例**

```sql title=Query
SELECT isNaN(NaN)
```

```response title=Response
1
```



## lcm {#lcm}

引入于：v1.1

**语法**

```sql
lcm(x, y)
```

**参数**

- `x` — 第一个整数
- `y` — 第二个整数

**返回值**

`x` 和 `y` 的最小公倍数。

**示例**

**用法示例**

```sql title=Query
SELECT lcm(6, 8)
```

```response title=Response
24
```



## max2 {#max2}

引入于：v21.11

**语法**

```sql
max2(x, y)
```

**参数**

- `x` — 第一个值
- `y` — 第二个值

**返回值**

返回 `x` 和 `y` 中较大的值

**示例**

**用法示例**

```sql title=Query
SELECT max2(-1, 2)
```

```response title=Response
2
```



## min2 {#min2}

引入于：v21.11

**语法**

```sql
min2(x, y)
```

**参数**

- `x` — 第一个值
- `y` — 第二个值

**返回值**

返回 `x` 和 `y` 中较小的值

**示例**

**用法示例**

```sql title=Query
SELECT min2(-1, 2)
```

```response title=Response
-1
```



## minus {#minus}

引入于：v1.1

**语法**

```sql
minus(x, y)
```

**参数**

- `x` — 被减数
- `y` — 减数

**返回值**

x 减去 y

**示例**

**减去两个数字**

```sql title=Query
SELECT minus(10,5)
```

```response title=Response
5
```

**减去整数和日期**

```sql title=Query
SELECT minus(toDate('2025-01-01'),5)
```

```response title=Response
2024-12-27
```



## modulo {#modulo}

引入于：v1.1

**语法**

```sql
modulo(a, b)
```

**参数**

- `a` — 被除数
- `b` — 除数（模数）

**返回值**

`a % b` 的余数

**示例**

**用法示例**

```sql title=Query
SELECT modulo(5, 2)
```

```response title=Response
1
```



## moduloOrZero {#moduloOrZero}

引入于：v20.3

**语法**

```sql
moduloOrZero(a, b)
```

**参数**

- `a` — 被除数。[`(U)Int*`](/sql-reference/data-types/int-uint)/[`Float32/64`](/sql-reference/data-types/float)。
- `b` — 除数（模数）。[`(U)Int*`](/sql-reference/data-types/int-uint)/[`Float32/64`](/sql-reference/data-types/float)。

**返回值**

`a % b` 的余数，或者当除数为 `0` 时返回 `0`。

**示例**

**用法示例**

```sql title=Query
SELECT moduloOrZero(5, 0)
```

```response title=Response
0
```



## multiply {#multiply}

引入于：v1.1

**语法**

```sql
multiply(x, y)
```

**参数**

- `x` — 因子
- `y` — 因子

**返回值**

`x` 和 `y` 的积

**示例**

**乘以两个数字**

```sql title=Query
SELECT multiply(5,5)
```

```response title=Response
25
```



## multiplyDecimal {#multiplyDecimal}

引入于：v22.12

**语法**

```sql
multiplyDecimal(a, b[, result_scale])
```

**参数**

- `a` — 第一个值。类型 [Decimal](/sql-reference/data-types/decimal)。
- `b` — 第二个值。类型 [Decimal](/sql-reference/data-types/decimal)。
- `result_scale` — 结果的刻度。类型 [Int/UInt](/sql-reference/data-types/int-uint)。

**返回值**

按给定刻度进行的乘法运算的结果。类型：[Decimal256](/sql-reference/data-types/decimal)。

**示例**

**用法示例**

```sql title=Query
SELECT multiplyDecimal(toDecimal256(-12, 0), toDecimal32(-2.1, 1), 1)
```

```response title=Response
25.2
```

**与普通乘法的差异**

```sql title=Query
SELECT multiplyDecimal(toDecimal256(-12, 0), toDecimal32(-2.1, 1), 1)
```

```response title=Response
┌─multiply(toDecimal64(-12.647, 3), toDecimal32(2.1239, 4))─┐
│                                               -26.8609633 │
└───────────────────────────────────────────────────────────┘
┌─multiplyDecimal(toDecimal64(-12.647, 3), toDecimal32(2.1239, 4))─┐
│                                                         -26.8609 │
└──────────────────────────────────────────────────────────────────┘
```

**小数溢出**

```sql title=Query
SELECT
    toDecimal64(-12.647987876, 9) AS a,
    toDecimal64(123.967645643, 9) AS b,
    multiplyDecimal(a, b);
SELECT
    toDecimal64(-12.647987876, 9) AS a,
    toDecimal64(123.967645643, 9) AS b,
    a * b;
```

```response title=Response
┌─────────────a─┬─────────────b─┬─multiplyDecimal(toDecimal64(-12.647987876, 9), toDecimal64(123.967645643, 9))─┐
│ -12.647987876 │ 123.967645643 │                                                               -1567.941279108 │
└───────────────┴───────────────┴───────────────────────────────────────────────────────────────────────────────┘
Received exception from server (version 22.11.1):
Code: 407. DB::Exception: Received from localhost:9000. DB::Exception: Decimal math overflow:
While processing toDecimal64(-12.647987876, 9) AS a, toDecimal64(123.967645643, 9) AS b, a * b. (DECIMAL_OVERFLOW)
```



## negate {#negate}

引入于：v1.1

**语法**

```sql
negate(x)
```

**参数**

- `x` — 要取反的值。

**返回值**

返回 -x 从 x

**示例**

**用法示例**

```sql title=Query
SELECT negate(10)
```

```response title=Response
-10
```



## plus {#plus}

引入于：v1.1

**语法**

```sql
plus(x, y)
```

**参数**

- `x` — 左操作数。
- `y` — 右操作数。

**返回值**

`x` 和 `y` 的和

**示例**

**加上两个数字**

```sql title=Query
SELECT plus(5,5)
```

```response title=Response
10
```

**加上一个整数和一个日期**

```sql title=Query
SELECT plus(toDate('2025-01-01'),5)
```

```response title=Response
2025-01-06
```



## positiveModulo {#positiveModulo}

引入于：v22.11

**语法**

```sql
positiveModulo(x, y)
```

**参数**

- `x` — 被除数。[`(U)Int*`](/sql-reference/data-types/int-uint)/[`Float32/64`](/sql-reference/data-types/float)。
- `y` — 除数（模数）。[`(U)Int*`](/sql-reference/data-types/int-uint)/[`Float32/64`](/sql-reference/data-types/float)。

**返回值**

返回 `x` 和不大于 `x` 的最近整数的差，该整数可被 `y` 整除。

**示例**

**用法示例**

```sql title=Query
SELECT positiveModulo(-1, 10)
```

```response title=Response
9
```



## positiveModuloOrNull {#positiveModuloOrNull}

引入于：v22.11

**语法**

```sql
positiveModulo(x, y)
```

**参数**

- `x` — 被除数。[`(U)Int*`](/sql-reference/data-types/int-uint)/[`Float32/64`](/sql-reference/data-types/float)。
- `x` — 除数（模数）。[`(U)Int*`](/sql-reference/data-types/int-uint)/[`Float32/64`](/sql-reference/data-types/float)。

**返回值**

返回 `x` 和不大于 `x` 的最近整数的差，该整数可被 `y` 整除；当除数为零时返回 `null`。

**示例**

**positiveModulo**

```sql title=Query
SELECT positiveModulo(-1, 10)
```

```response title=Response
9
``` 

<!--AUTOGENERATED_END-->
