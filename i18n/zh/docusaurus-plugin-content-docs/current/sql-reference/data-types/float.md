---
slug: /sql-reference/data-types/float
sidebar_position: 4
sidebar_label: Float32 | Float64 | BFloat16
title: 'Float32 | Float64 | BFloat16 类型'
---

:::note
如果您需要精确的计算，特别是处理需要高精度的财务或商业数据时，您应该考虑使用 [Decimal](../data-types/decimal.md)。 

[浮点数](https://en.wikipedia.org/wiki/IEEE_754) 可能导致不准确的结果，如下所示：

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
Engine=MergeTree
ORDER BY tuple();


# 生成 1 000 000 个随机数字，保留 2 位小数，分别存储为浮点数和十进制数
INSERT INTO float_vs_decimal SELECT round(randCanonical(), 3) AS res, res FROM system.numbers LIMIT 1000000;
```
```sql
SELECT sum(my_float), sum(my_decimal) FROM float_vs_decimal;

┌──────sum(my_float)─┬─sum(my_decimal)─┐
│ 499693.60500000004 │      499693.605 │
└────────────────────┴─────────────────┘

SELECT sumKahan(my_float), sumKahan(my_decimal) FROM float_vs_decimal;

┌─sumKahan(my_float)─┬─sumKahan(my_decimal)─┐
│         499693.605 │           499693.605 │
└────────────────────┴──────────────────────┘
```
:::

ClickHouse 和 C 中的等效类型如下：

- `Float32` — `float`。
- `Float64` — `double`。

ClickHouse 中的浮点类型具有以下别名：

- `Float32` — `FLOAT`，`REAL`，`SINGLE`。
- `Float64` — `DOUBLE`，`DOUBLE PRECISION`。

创建表时，可以设置浮点数的数字参数（例如 `FLOAT(12)`，`FLOAT(15, 22)`，`DOUBLE(12)`，`DOUBLE(4, 18)`），但 ClickHouse 会忽略它们。

## 使用浮点数 {#using-floating-point-numbers}

- 使用浮点数进行计算可能会产生舍入误差。

<!-- -->

``` sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- 计算的结果依赖于计算方法（处理器类型和计算机系统的架构）。
- 浮点数计算可能导致数值如无穷大（`Inf`）和“非数值”（`NaN`）。在处理计算结果时应考虑这一点。
- 从文本中解析浮点数时，结果可能不是最接近的机器可表示数字。

## NaN 和 Inf {#nan-and-inf}

与标准 SQL 不同，ClickHouse 支持以下类别的浮点数：

- `Inf` – 无穷大。

<!-- -->

``` sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

- `-Inf` — 负无穷大。

<!-- -->

``` sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

- `NaN` — 非数字。

<!-- -->

``` sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

有关 `NaN` 排序的规则，请参见 [ORDER BY 子句](../../sql-reference/statements/select/order-by.md)。

## BFloat16 {#bfloat16}

`BFloat16` 是一种 16 位的浮点数据类型，具有 8 位指数、符号和 7 位尾数。 
它在机器学习和人工智能应用中非常有用。

ClickHouse 支持 `Float32` 和 `BFloat16` 之间的转换，可以使用 [`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) 或 [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16) 函数进行转换。

:::note
大多数其他操作不被支持。
:::
