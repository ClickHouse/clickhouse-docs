---
'description': 'ClickHouse 中浮点数据类型的文档：Float32、Float64 和 BFloat16'
'sidebar_label': 'Float32 | Float64 | BFloat16'
'sidebar_position': 4
'slug': '/sql-reference/data-types/float'
'title': 'Float32 | Float64 | BFloat16 类型'
---

:::note
如果您需要准确的计算，特别是当您处理需要高精度的财务或商业数据时，您应该考虑使用 [Decimal](../data-types/decimal.md)。

[浮点数](https://en.wikipedia.org/wiki/IEEE_754) 可能会导致不准确的结果，如下所示：

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
Engine=MergeTree
ORDER BY tuple();


# Generate 1 000 000 random numbers with 2 decimal places and store them as a float and as a decimal
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

创建表时，可以设置浮点数的数值参数（例如 `FLOAT(12)`，`FLOAT(15, 22)`，`DOUBLE(12)`，`DOUBLE(4, 18)`），但 ClickHouse 会忽略这些参数。

## 使用浮点数 {#using-floating-point-numbers}

- 使用浮点数进行计算可能会产生舍入误差。

<!-- -->

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- 计算结果取决于计算方法（处理器类型和计算机系统的架构）。
- 浮点计算可能会导致如无穷大（`Inf`）和“非数”（`NaN`）这样的数字出现。在处理计算结果时应考虑这一点。
- 从文本解析浮点数时，结果可能不是最接近的机器可表示的数字。

## NaN 和 Inf {#nan-and-inf}

与标准 SQL 不同，ClickHouse 支持以下类别的浮点数：

- `Inf` – 无穷大。

<!-- -->

```sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

- `-Inf` — 负无穷大。

<!-- -->

```sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

- `NaN` — 非数。

<!-- -->

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

有关 `NaN` 排序的规则，请参见 [ORDER BY 子句](../../sql-reference/statements/select/order-by.md) 部分。

## BFloat16 {#bfloat16}

`BFloat16` 是一种 16 位浮点数据类型，具有 8 位指数、符号和 7 位尾数。
它对于机器学习和人工智能应用非常有用。

ClickHouse 支持在 `Float32` 和 `BFloat16` 之间的转换，可以使用 [`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) 或 [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16) 函数进行转换。

:::note
大多数其他操作不被支持。
:::
