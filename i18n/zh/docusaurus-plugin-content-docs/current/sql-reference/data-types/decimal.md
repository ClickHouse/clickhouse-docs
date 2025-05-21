---
'description': 'ClickHouse中用于提供可配置精度的定点算术的Decimal数据类型文档'
'sidebar_label': 'Decimal'
'sidebar_position': 6
'slug': '/sql-reference/data-types/decimal'
'title': 'Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S),
  Decimal256(S)'
---




# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

带符号的定点数，在加、减和乘运算中保持精度。在除法中，最小有效位会被丢弃（不进行四舍五入）。

## 参数 {#parameters}

- P - 精度。有效范围：\[ 1 : 76 \]。决定数字可以有多少个十进制位（包括小数部分）。默认情况下，精度为10。
- S - 小数位数。有效范围：\[ 0 : P \]。决定小数部分可以有多少个十进制位。

Decimal(P) 等同于 Decimal(P, 0)。类似地，语法 Decimal 等同于 Decimal(10, 0)。

根据 P 参数的值，Decimal(P, S) 是以下的同义词：
- P 在 \[ 1 : 9 \] 之间 - 对于 Decimal32(S)
- P 在 \[ 10 : 18 \] 之间 - 对于 Decimal64(S)
- P 在 \[ 19 : 38 \] 之间 - 对于 Decimal128(S)
- P 在 \[ 39 : 76 \] 之间 - 对于 Decimal256(S)

## Decimal 值范围 {#decimal-value-ranges}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例如，Decimal32(4) 可以包含从 -99999.9999 到 99999.9999 的数字，步长为 0.0001。

## 内部表示 {#internal-representation}

内部数据表示为正常的带符号整数，具有相应的位宽。存储在内存中的实际值范围比上述规定的范围略大，这些检查仅在从字符串转换时进行。

由于现代 CPU 不原生支持 128 位和 256 位整数，因此对 Decimal128 和 Decimal256 的操作是模拟的。因此，Decimal128 和 Decimal256 的工作速度显著慢于 Decimal32/Decimal64。

## 操作和结果类型 {#operations-and-result-type}

在 Decimal 上进行的二元操作会产生更宽的结果类型（无论参数顺序如何）。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

小数位数的规则：

- 加、减：S = max(S1, S2)。
- 乘：S = S1 + S2。
- 除：S = S1。

对于 Decimal 和整数之间的类似操作，结果为与参数相同大小的 Decimal。

Decimal 和 Float32/Float64 之间的操作未定义。如果需要，可以使用 toDecimal32、toDecimal64、toDecimal128 或 toFloat32、toFloat64 内置函数显式转换其中一个参数。请注意，结果将失去精度，类型转换是一个计算开销较大的操作。

一些对 Decimal 的函数会返回 Float64 结果（例如，var 或 stddev）。中间计算仍可能在 Decimal 中执行，这可能导致相同值的 Float64 和 Decimal 输入之间出现不同的结果。

## 溢出检查 {#overflow-checks}

在 Decimal 运算中，可能会发生整数溢出。小数部分过多的位会被丢弃（不进行四舍五入）。整数部分过多的位将导致异常。

:::warning
Decimal128 和 Decimal256 的溢出检查未实现。在溢出的情况下，返回不正确的结果，而不会抛出异常。
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

溢出检查会导致操作变慢。如果已知不会发生溢出，关闭检查是合理的，可以使用 `decimal_check_overflow` 设置。当检查被禁用且发生溢出时，结果将不正确：

```sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

溢出检查不仅在算术操作上发生，而且在值比较时也会发生：

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: Can't compare.
```

**另见**
- [isDecimalOverflow](/sql-reference/functions/other-functions#isdecimaloverflow)
- [countDigits](/sql-reference/functions/other-functions#countdigits)
