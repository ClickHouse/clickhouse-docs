---
description: 'ClickHouse 中 Decimal 数据类型的文档，这些类型提供具有可配置精度的定点数运算'
sidebar_label: 'Decimal'
sidebar_position: 6
slug: /sql-reference/data-types/decimal
title: 'Decimal、Decimal(P)、Decimal(P, S)、Decimal32(S)、Decimal64(S)、Decimal128(S)、Decimal256(S)'
doc_type: 'reference'
---

# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S) \{#decimal-decimalp-decimalp-s-decimal32s-decimal64s-decimal128s-decimal256s\}

有符号定点数，在执行加法、减法和乘法运算时保持精度。对于除法运算，最低有效数字会被直接截断（不进行四舍五入）。

## 参数 \{#parameters\}

- P - 精度。有效范围：\[ 1 : 76 \]。决定数字最多可以包含多少位十进制数字（包括小数部分）。默认精度为 10。
- S - 标度。有效范围：\[ 0 : P \]。决定小数部分最多可以包含多少位十进制数字。

Decimal(P) 等价于 Decimal(P, 0)。类似地，语法 Decimal 等价于 Decimal(10, 0)。

根据参数 P 的取值，Decimal(P, S) 等价于：
- P 在 \[ 1 : 9 \] 范围内 —— Decimal32(S)
- P 在 \[ 10 : 18 \] 范围内 —— Decimal64(S)
- P 在 \[ 19 : 38 \] 范围内 —— Decimal128(S)
- P 在 \[ 39 : 76 \] 范围内 —— Decimal256(S)

## Decimal 值范围 \{#decimal-value-ranges\}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例如，Decimal32(4) 的取值范围为 -99999.9999 到 99999.9999，步长为 0.0001。

## 内部表示 \{#internal-representation\}

在内部，数据表示为具有相应位宽的普通有符号整数。可在内存中存储的实际取值范围比上面指定的范围略大，只会在从字符串转换时进行范围检查。

由于现代 CPU 并不原生支持 128 位和 256 位整数，对 Decimal128 和 Decimal256 的运算是通过仿真实现的。因此，Decimal128 和 Decimal256 的运行速度明显慢于 Decimal32/Decimal64。

## 运算和结果类型 \{#operations-and-result-type\}

在 Decimal 上执行二元运算时，结果类型会被提升为位宽更大的类型（与参数顺序无关）。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

scale 的规则：

- 加、减：S = max(S1, S2)。
- 乘：S = S1 + S2。
- 除：S = S1。

对于 Decimal 与整数之间的类似运算，结果是与参与运算的 Decimal 参数位宽相同的 Decimal 类型。

Decimal 与 Float32/Float64 之间的运算未定义。如有需要，可以显式使用 toDecimal32、toDecimal64、toDecimal128 或 toFloat32、toFloat64 内置函数对其中一个参数进行类型转换。请注意，结果会丢失精度，并且类型转换是计算开销较大的操作。

某些作用于 Decimal 的函数会返回 Float64 结果（例如 var 或 stddev）。中间计算仍可能以 Decimal 进行，这可能导致在数值相同的前提下，使用 Float64 输入与使用 Decimal 输入得到的结果不同。

## 溢出检查 \{#overflow-checks\}

在对 Decimal 类型进行计算时，可能会发生整数溢出。小数部分中的多余位数会被直接截断（不会进行四舍五入）。整数部分中的多余位数会导致抛出异常。

:::warning
Decimal128 和 Decimal256 尚未实现溢出检查。在发生溢出的情况下，会返回不正确的结果，不会抛出异常。
:::

```sql
SELECT toDecimal32(2, 4) AS x, x / 3
```

```text
┌──────x─┬─divide(toDecimal32(2, 4), 3)─┐
│ 2.0000 │                       0.6666 │
└────────┴──────────────────────────────┘
```

```sql
SELECT toDecimal32(4.2, 8) AS x, x * x
```

```text
DB::Exception: Scale is out of bounds.
```

```sql
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
DB::Exception: Decimal math overflow.
```

溢出检查会导致运算变慢。如果能够确定不会发生溢出，则可以通过 `decimal_check_overflow` 设置来禁用检查。当检查被禁用且发生溢出时，结果将会不正确：

```sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

溢出检查不仅会在算术运算中进行，也会在值比较时进行：

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: Can't compare.
```

**另请参阅**

* [isDecimalOverflow](/sql-reference/functions/other-functions#isDecimalOverflow)
* [countDigits](/sql-reference/functions/other-functions#countDigits)
