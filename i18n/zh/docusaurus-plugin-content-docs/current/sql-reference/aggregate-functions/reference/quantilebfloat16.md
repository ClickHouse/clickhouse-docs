---
description: '计算由 bfloat16 格式数值组成的样本的近似分位数。'
sidebar_position: 171
slug: /sql-reference/aggregate-functions/reference/quantilebfloat16
title: 'quantileBFloat16'
doc_type: 'reference'
---

# quantileBFloat16Weighted

与 `quantileBFloat16` 类似，但会考虑序列中每个元素的权重。

计算由 [bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) 数值组成的样本的近似[分位数](https://en.wikipedia.org/wiki/Quantile)。`bfloat16` 是一种浮点数据类型，包含 1 个符号位、8 个指数位和 7 个尾数位。
该函数将输入值转换为 32 位浮点数，并取最高有效的 16 位。然后计算 `bfloat16` 分位数值，并通过追加零位将结果转换为 64 位浮点数。
该函数是一种快速的分位数估计器，其相对误差不超过 0.390625%。

**语法**

```sql
quantileBFloat16[(level)](expr)
```

别名：`medianBFloat16`

**参数**

* `expr` — 包含数值数据的列。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)。

**参数说明**

* `level` — 分位数级别。可选。取值范围为 0 到 1。默认值：0.5。[Float](../../../sql-reference/data-types/float.md)。

**返回值**

* 指定级别的近似分位数。

类型：[Float64](/sql-reference/data-types/float)。

**示例**

输入表包含一个整数列和一个浮点列：

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

用于计算 0.75 分位数（第三四分位数）的查询：

```sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

结果：

```text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```

请注意，在示例中，所有浮点数在转换为 `bfloat16` 时都会被截断为 1.0。

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
