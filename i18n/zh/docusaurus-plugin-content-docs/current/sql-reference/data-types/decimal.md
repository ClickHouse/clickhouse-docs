---
'description': 'ClickHouse 中十进制数据类型的文档，提供了可配置精度的定点算术'
'sidebar_label': 'Decimal'
'sidebar_position': 6
'slug': '/sql-reference/data-types/decimal'
'title': '十进制，Decimal(P)，Decimal(P, S)，Decimal32(S)，Decimal64(S)，Decimal128(S)，Decimal256(S)'
'doc_type': 'reference'
---


# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

带符号的定点数在加法、减法和乘法操作中保持精度。对于除法，最不重要的数字被丢弃（不会进行四舍五入）。

## 参数 {#parameters}

- P - 精度。有效范围：\[ 1 : 76 \]。确定数字可以有多少个十进制数字（包括小数）。默认情况下，精度为 10。
- S - 小数位数。有效范围：\[ 0 : P \]。确定小数部分可以有多少个十进制数字。

Decimal(P) 等价于 Decimal(P, 0)。类似地，语法 Decimal 等价于 Decimal(10, 0)。

根据 P 参数值，Decimal(P, S) 是以下的同义词：
- P 从 \[ 1 : 9 \] - 对于 Decimal32(S)
- P 从 \[ 10 : 18 \] - 对于 Decimal64(S)
- P 从 \[ 19 : 38 \] - 对于 Decimal128(S)
- P 从 \[ 39 : 76 \] - 对于 Decimal256(S)

## Decimal 值范围 {#decimal-value-ranges}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例如，Decimal32(4) 可以包含从 -99999.9999 到 99999.9999 的数字，步长为 0.0001。

## 内部表示 {#internal-representation}

在内部，数据作为具有相应位宽的正常带符号整数表示。可以存储的真实值范围比上面指定的稍大，只有在从字符串转换时才进行检查。

由于现代 CPU 不支持原生的 128 位和 256 位整数，因此 Decimal128 和 Decimal256 上的操作是模拟的。因此，Decimal128 和 Decimal256 的工作速度显著慢于 Decimal32/Decimal64。

## 操作和结果类型 {#operations-and-result-type}

Decimal 上的二元操作会产生更宽的结果类型（参数顺序无关）。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

缩放规则：

- 加法、减法：S = max(S1, S2)。
- 乘法：S = S1 + S2。
- 除法：S = S1。

对于 Decimal 和整数之间的类似操作，结果是与参数相同大小的 Decimal。

Decimal 与 Float32/Float64 之间的操作未定义。如果需要，可以使用 toDecimal32、toDecimal64、toDecimal128 或 toFloat32、toFloat64 内置函数显式转换其中一个参数。请记住，结果将失去精度，类型转换是一种计算成本较高的操作。

某些 Decimal 函数返回的结果为 Float64（例如，var 或 stddev）。中间计算可能仍会在 Decimal 中执行，这可能导致相同值的 Float64 和 Decimal 输入之间产生不同的结果。

## 溢出检查 {#overflow-checks}

在 Decimal 上进行计算时，可能会发生整数溢出。过多的小数位将被丢弃（不会进行四舍五入）。整数部分的过多位数将导致异常。

:::warning
Decimal128 和 Decimal256 的溢出检查尚未实现。发生溢出时会返回不正确的结果，而不会抛出异常。
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

溢出检查会导致操作速度变慢。如果已知不可能发生溢出，则可以通过 `decimal_check_overflow` 设置禁用检查。当禁用检查且发生溢出时，结果将不正确：

```sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

溢出检查不仅在算术操作上发生，也在值比较中发生：

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: Can't compare.
```

**另请参见**
- [isDecimalOverflow](/sql-reference/functions/other-functions#isdecimaloverflow)
- [countDigits](/sql-reference/functions/other-functions#countdigits)
