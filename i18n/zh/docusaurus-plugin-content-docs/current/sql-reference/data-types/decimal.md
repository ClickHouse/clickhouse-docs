---
description: '介绍 ClickHouse 中 Decimal 数据类型的文档，这些类型提供具有可配置精度的定点数运算'
sidebar_label: 'Decimal'
sidebar_position: 6
slug: /sql-reference/data-types/decimal
title: 'Decimal、Decimal(P)、Decimal(P, S)、Decimal32(S)、Decimal64(S)、Decimal128(S)、Decimal256(S)'
doc_type: 'reference'
---



# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

有符号定点数，在加、减和乘运算中保持精度。对于除法运算，最低有效数字会被舍去（不进行四舍五入）。



## 参数 {#parameters}

- P - 精度。有效范围：\[ 1 : 76 \]。决定数字可以包含多少位十进制数字(包括小数部分)。默认精度为 10。
- S - 标度。有效范围：\[ 0 : P \]。决定小数部分可以包含多少位十进制数字。

Decimal(P) 等同于 Decimal(P, 0)。同样,Decimal 语法等同于 Decimal(10, 0)。

根据 P 参数值,Decimal(P, S) 是以下类型的同义词:

- P 在 \[ 1 : 9 \] 范围内 - 对应 Decimal32(S)
- P 在 \[ 10 : 18 \] 范围内 - 对应 Decimal64(S)
- P 在 \[ 19 : 38 \] 范围内 - 对应 Decimal128(S)
- P 在 \[ 39 : 76 \] 范围内 - 对应 Decimal256(S)


## Decimal 值范围 {#decimal-value-ranges}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例如,Decimal32(4) 可以包含从 -99999.9999 到 99999.9999 的数值,步长为 0.0001。


## 内部表示 {#internal-representation}

在内部,数据以相应位宽的普通有符号整数形式表示。内存中可存储的实际值范围比上述指定范围略大,这些范围仅在从字符串转换时进行检查。

由于现代 CPU 不原生支持 128 位和 256 位整数,Decimal128 和 Decimal256 的操作通过模拟方式实现。因此,Decimal128 和 Decimal256 的运行速度明显慢于 Decimal32/Decimal64。


## 运算和结果类型 {#operations-and-result-type}

Decimal 类型的二元运算会产生更宽的结果类型(与参数顺序无关)。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

精度规则:

- 加法、减法:S = max(S1, S2)。
- 乘法:S = S1 + S2。
- 除法:S = S1。

对于 Decimal 和整数之间的类似运算,结果是与参数相同大小的 Decimal 类型。

Decimal 和 Float32/Float64 之间的运算未定义。如果需要进行此类运算,可以使用内置函数 toDecimal32、toDecimal64、toDecimal128 或 toFloat32、toFloat64 显式转换其中一个参数。请注意,结果会损失精度,且类型转换是计算开销较大的操作。

某些 Decimal 函数会返回 Float64 类型的结果(例如 var 或 stddev)。中间计算可能仍以 Decimal 类型执行,这可能导致相同值的 Float64 和 Decimal 输入产生不同的结果。


## 溢出检查 {#overflow-checks}

在对 Decimal 类型进行计算时,可能会发生整数溢出。小数部分的多余数字会被舍弃(不进行四舍五入)。整数部分的多余数字将导致抛出异常。

:::warning
Decimal128 和 Decimal256 未实现溢出检查。发生溢出时会返回错误的结果,不会抛出异常。
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

溢出检查会导致操作速度变慢。如果已知不会发生溢出,可以使用 `decimal_check_overflow` 设置来禁用检查。当检查被禁用且发生溢出时,结果将是错误的:

```sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

溢出检查不仅发生在算术运算中,也发生在值比较时:

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: Can't compare.
```

**另请参阅**

- [isDecimalOverflow](/sql-reference/functions/other-functions#isDecimalOverflow)
- [countDigits](/sql-reference/functions/other-functions#countDigits)
