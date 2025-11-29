---
description: 'ClickHouse 中浮点数据类型的文档：Float32、Float64 和 BFloat16'
sidebar_label: 'Float32 | Float64 | BFloat16'
sidebar_position: 4
slug: /sql-reference/data-types/float
title: 'Float32 | Float64 | BFloat16 类型'
doc_type: 'reference'
---

:::note
如果您需要进行精确计算，特别是处理需要高精度的金融或业务数据时，应考虑改用 [Decimal](../data-types/decimal.md)。

[浮点数](https://en.wikipedia.org/wiki/IEEE_754) 可能会导致不精确的结果，如下所示：

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
ENGINE=MergeTree
ORDER BY tuple();
```


# 生成 1 000 000 个保留 2 位小数的随机数，并分别以 float 和 decimal 类型存储 {#generate-1-000-000-random-numbers-with-2-decimal-places-and-store-them-as-a-float-and-as-a-decimal}

INSERT INTO float&#95;vs&#95;decimal SELECT round(randCanonical(), 3) AS res, res FROM system.numbers LIMIT 1000000;

````
```sql
SELECT sum(my_float), sum(my_decimal) FROM float_vs_decimal;

┌──────sum(my_float)─┬─sum(my_decimal)─┐
│ 499693.60500000004 │      499693.605 │
└────────────────────┴─────────────────┘

SELECT sumKahan(my_float), sumKahan(my_decimal) FROM float_vs_decimal;

┌─sumKahan(my_float)─┬─sumKahan(my_decimal)─┐
│         499693.605 │           499693.605 │
└────────────────────┴──────────────────────┘
````

:::

ClickHouse 中的浮点类型在 C 语言中的等价类型如下：

* `Float32` — `float`。
* `Float64` — `double`。

ClickHouse 中的浮点类型具有以下别名：

* `Float32` — `FLOAT`、`REAL`、`SINGLE`。
* `Float64` — `DOUBLE`、`DOUBLE PRECISION`。

在创建表时，可以为浮点数指定数值参数（例如 `FLOAT(12)`、`FLOAT(15, 22)`、`DOUBLE(12)`、`DOUBLE(4, 18)`），但 ClickHouse 会忽略这些参数。


## 使用浮点数 {#using-floating-point-numbers}

* 浮点数运算可能会产生舍入误差。

{/* */ }

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

* 计算结果取决于计算方式（包括计算机系统的处理器类型和架构）。
* 浮点运算可能产生诸如无穷大（`Inf`）和“非数字值”（`NaN`）之类的结果。在处理计算结果时应考虑这一点。
* 当从文本解析浮点数时，结果可能并不是最接近的机器可表示数值。


## NaN 和 Inf {#nan-and-inf}

与标准 SQL 相比，ClickHouse 支持以下几类浮点数：

* `Inf` – 无穷大。

{/* */ }

```sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

* `-Inf` — 负无穷大。

{/* */ }

```sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

* `NaN` — 表示“不是数字”（Not a Number）。

{/* */ }

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

请参阅 [ORDER BY 子句](../../sql-reference/statements/select/order-by.md) 部分中关于 `NaN` 排序的规则。


## BFloat16 {#bfloat16}

`BFloat16` 是一种 16 位浮点数数据类型，包含 8 位指数、1 位符号位和 7 位尾数位。  
它在机器学习和 AI 应用中非常实用。

ClickHouse 支持 `Float32` 与 `BFloat16` 之间的相互转换，
可以使用 [`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) 或 [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16) 函数来完成。

:::note
大多数其他操作当前尚不支持。
:::
