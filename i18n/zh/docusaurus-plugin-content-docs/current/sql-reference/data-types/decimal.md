---
'description': 'ClickHouse中Decimal数据类型的文档，它提供了可配置精度的定点算术'
'sidebar_label': 'Decimal'
'sidebar_position': 6
'slug': '/sql-reference/data-types/decimal'
'title': 'Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S),
  Decimal256(S)'
---


# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

带符号的定点数，在加、减和乘法操作中保持精度。对于除法，最低有效位将被丢弃（不进行舍入）。

## 参数 {#parameters}

- P - 精度。有效范围：\[ 1 : 76 \]。确定数字可以有多少个十进制位（包括小数部分）。默认情况下，精度为 10。
- S - 尺度。有效范围：\[ 0 : P \]。确定小数部分可以有多少个十进制位。

Decimal(P) 等价于 Decimal(P, 0)。同样，语法 Decimal 等价于 Decimal(10, 0)。

根据 P 参数值，Decimal(P, S) 是以下的同义词：
- P 从\[ 1 : 9 \] - 对应 Decimal32(S)
- P 从\[ 10 : 18 \] - 对应 Decimal64(S)
- P 从\[ 19 : 38 \] - 对应 Decimal128(S)
- P 从\[ 39 : 76 \] - 对应 Decimal256(S)

## Decimal 值范围 {#decimal-value-ranges}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例如，Decimal32(4) 可以包含从 -99999.9999 到 99999.9999 的数字，步长为 0.0001。

## 内部表示 {#internal-representation}

内部数据表示为正常的带符号整数，具有相应的位宽。可以存储在内存中的实际值范围比上面指定的略大，仅在从字符串转换时检查。

因为现代 CPU 不本地支持 128 位和 256 位整数，所以对 Decimal128 和 Decimal256 的操作是模拟的。因此，Decimal128 和 Decimal256 的工作速度明显慢于 Decimal32/Decimal64。

## 操作和结果类型 {#operations-and-result-type}

对 Decimal 的二元操作将导致更宽的结果类型（不论参数顺序）。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

尺度规则：

- 加法、减法：S = max(S1, S2)。
- 乘法：S = S1 + S2。
- 除法：S = S1。

对于 Decimal 和整数之间的类似操作，结果是与参数大小相同的 Decimal。

Decimal 与 Float32/Float64 之间的操作未定义。如果需要，可以使用 toDecimal32、toDecimal64、toDecimal128 或 toFloat32、toFloat64 内置函数显式转换其中一个参数。请注意，结果将失去精度，类型转换是一个计算上开销较大的操作。

一些对 Decimal 的函数返回结果为 Float64（例如，var 或 stddev）。中间计算可能仍然以 Decimal 进行，这可能导致具有相同值的 Float64 和 Decimal 输入之间的结果不同。

## 溢出检查 {#overflow-checks}

在对 Decimal 进行计算时，可能会发生整数溢出。小数部分的过多位数将被丢弃（不进行舍入）。整数部分的过多位数将导致异常。

:::warning
对于 Decimal128 和 Decimal256，未实现溢出检查。如果发生溢出，将返回不正确的结果，不会抛出异常。
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

溢出检查会导致操作减慢。如果知晓溢出不可能，禁用检查是有意义的，使用 `decimal_check_overflow` 设置。禁用检查后，如果发生溢出，则结果将不正确：

```sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

溢出检查不仅发生在算术操作中，还发生在值比较中：

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: Can't compare.
```

**另请参见**
- [isDecimalOverflow](/sql-reference/functions/other-functions#isdecimaloverflow)
- [countDigits](/sql-reference/functions/other-functions#countdigits)
