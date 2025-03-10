---
slug: /sql-reference/data-types/decimal
sidebar_position: 6
sidebar_label: '十进制'
---


# 十进制, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

带符号的定点数，在加、减、乘操作中保持精度。对于除法，最低有效位被丢弃（未进行四舍五入）。

## 参数 {#parameters}

- P - 精度。有效范围：\[ 1 : 76 \]。确定数字可以具有多少个十进制位（包括小数部分）。默认情况下，精度为 10。
- S - 小数位数。有效范围：\[ 0 : P \]。确定小数部分可以具有的十进制位数。

Decimal(P) 相当于 Decimal(P, 0)。同样，语法 Decimal 相当于 Decimal(10, 0)。

根据 P 参数值，Decimal(P, S) 是以下的同义词：
- P 在 \[ 1 : 9 \] - 对于 Decimal32(S)
- P 在 \[ 10 : 18 \] - 对于 Decimal64(S)
- P 在 \[ 19 : 38 \] - 对于 Decimal128(S)
- P 在 \[ 39 : 76 \] - 对于 Decimal256(S)

## 十进制值范围 {#decimal-value-ranges}

- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例如，Decimal32(4) 可以包含从 -99999.9999 到 99999.9999，步长为 0.0001 的数字。

## 内部表示 {#internal-representation}

内部数据表示为具有相应位宽的正常带符号整数。可以存储在内存中的真实值范围比上述规定的范围稍大，只有在从字符串转换时才会进行检查。

由于现代 CPU 原生不支持 128 位和 256 位整数，因此 Decimal128 和 Decimal256 的操作是模拟的。因此，Decimal128 和 Decimal256 的速度显著慢于 Decimal32/Decimal64。

## 操作和结果类型 {#operations-and-result-type}

在 Decimal 上的二元操作会产生更宽的结果类型（参数的顺序无关）。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

比例规则：

- 加法、减法： S = max(S1, S2)。
- 乘法： S = S1 + S2。
- 除法： S = S1。

在 Decimal 和整数之间进行类似操作时，结果是与参数相同大小的 Decimal。

Decimal 和 Float32/Float64 之间的操作未被定义。如果需要它们，可以使用 toDecimal32、toDecimal64、toDecimal128 或 toFloat32、toFloat64 内置函数显式转换其中一个参数。请记住，结果将会失去精度，并且类型转换是一个计算开销很大的操作。

某些关于 Decimal 的函数返回结果为 Float64（例如，var 或 stddev）。中间计算可能仍在 Decimal 中执行，这可能导致相同值的 Float64 和 Decimal 输入之间的不同结果。

## 溢出检查 {#overflow-checks}

在 Decimal 的计算过程中，可能会发生整数溢出。小数部分中多余的数字将被丢弃（未进行四舍五入）。整数部分中的多余数字将导致异常。

:::warning
Decimal128 和 Decimal256 的溢出检查未实现。在溢出的情况下，将返回不正确的结果，并且不会抛出异常。
:::

``` sql
SELECT toDecimal32(2, 4) AS x, x / 3
```

``` text
┌──────x─┬─divide(toDecimal32(2, 4), 3)─┐
│ 2.0000 │                       0.6666 │
└────────┴──────────────────────────────┘
```

``` sql
SELECT toDecimal32(4.2, 8) AS x, x * x
```

``` text
DB::Exception: Scale is out of bounds.
```

``` sql
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

``` text
DB::Exception: Decimal math overflow.
```

溢出检查会导致操作速度变慢。如果知道溢出不可能发生，则可以使用 `decimal_check_overflow` 设置禁用检查。当禁用检查且发生溢出时，结果将不正确：

``` sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

``` text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

溢出检查不仅发生在算术操作中，也发生在值比较中：

``` sql
SELECT toDecimal32(1, 8) < 100
```

``` text
DB::Exception: Can't compare.
```

**另见**
- [isDecimalOverflow](/sql-reference/functions/other-functions#isdecimaloverflow)
- [countDigits](/sql-reference/functions/other-functions#countdigits)
