
# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

带符号的定点数，在加法、减法和乘法操作中保持精度。对于除法，最不重要的数字被丢弃（不进行四舍五入）。

## 参数 {#parameters}

- P - 精度。有效范围：\[ 1 : 76 \]。确定数字可以有多少位十进制数字（包括小数部分）。默认情况下，精度为10。
- S - 小数位数。有效范围：\[ 0 : P \]。确定小数部分可以有多少位十进制数字。

Decimal(P) 等价于 Decimal(P, 0)。同样，语法 Decimal 等价于 Decimal(10, 0)。

根据 P 参数值，Decimal(P, S) 是以下的同义词：
- P 从 \[ 1 : 9 \] - 对应 Decimal32(S)
- P 从 \[ 10 : 18 \] - 对应 Decimal64(S)
- P 从 \[ 19 : 38 \] - 对应 Decimal128(S)
- P 从 \[ 39 : 76 \] - 对应 Decimal256(S)

## Decimal 值范围 {#decimal-value-ranges}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例如，Decimal32(4) 可以包含从 -99999.9999 到 99999.9999 的数字，步长为 0.0001。

## 内部表示 {#internal-representation}

内部数据以相应的位宽表示正常的带符号整数。可以存储在内存中的实际值范围比上面指定的范围稍大，这仅在从字符串转换时进行检查。

由于现代CPU不支持128位和256位整数，因此对 Decimal128 和 Decimal256 的操作是通过模拟实现的。因此，Decimal128 和 Decimal256 的工作速度明显慢于 Decimal32/Decimal64。

## 操作和结果类型 {#operations-and-result-type}

对 Decimal 的二元操作会导致更宽的结果类型（无论参数顺序如何）。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

关于小数位的规则：

- 加法、减法： S = max(S1, S2)。
- 乘法： S = S1 + S2。
- 除法： S = S1。

对于 Decimal 和整数之间的类似操作，结果为与参数相同大小的 Decimal。

Decimal 与 Float32/Float64 之间的操作未定义。如果需要，可以使用 toDecimal32、toDecimal64、toDecimal128 或 toFloat32、toFloat64 内置函数显式转换其中一个参数。请记住，结果将会失去精度，并且类型转换是一个计算上昂贵的操作。

某些 Decimal 函数以 Float64 返回结果（例如，var 或 stddev）。中间计算仍可能在 Decimal 中进行，这可能导致 Float64 和具有相同值的 Decimal 输入之间的结果不同。

## 溢出检查 {#overflow-checks}

在对 Decimal 的计算过程中，可能会发生整数溢出。小数部分过多的数字会被丢弃（不进行四舍五入）。整数部分过多的数字将导致异常。

:::warning
Decimal128 和 Decimal256 不实现溢出检查。如果发生溢出，将返回不正确的结果，而不会抛出异常。
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

溢出检查不仅发生在算术操作中，也在值比较中发生：

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: Can't compare.
```

**另请参阅**
- [isDecimalOverflow](/sql-reference/functions/other-functions#isdecimaloverflow)
- [countDigits](/sql-reference/functions/other-functions#countdigits)
