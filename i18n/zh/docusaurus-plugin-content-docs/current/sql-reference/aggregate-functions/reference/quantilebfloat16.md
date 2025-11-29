---
description: '计算由 bfloat16 数值组成的样本的近似分位数。'
sidebar_position: 171
slug: /sql-reference/aggregate-functions/reference/quantilebfloat16
title: 'quantileBFloat16'
doc_type: 'reference'
---

# quantileBFloat16Weighted {#quantilebfloat16weighted}

类似于 `quantileBFloat16`，但会考虑序列中每个成员的权重。

对由 [bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) 数值构成的样本计算近似的[分位数](https://en.wikipedia.org/wiki/Quantile)。`bfloat16` 是一种浮点数据类型，具有 1 位符号位、8 位指数位和 7 位尾数位。
该函数将输入值转换为 32 位浮点数，并取其最高有效 16 位。然后计算 `bfloat16` 分位数值，并通过补零将结果转换为 64 位浮点数。
该函数是一个快速的分位数估计器，其相对误差不超过 0.390625%。

**语法**

```sql
quantileBFloat16[(level)](expr)
```

别名: `medianBFloat16`

**参数**

* `expr` — 包含数值数据的列。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)。

**参数说明**

* `level` — 分位数水平。可选。取值范围为 0 到 1。默认值：0.5。[Float](../../../sql-reference/data-types/float.md)。

**返回值**

* 指定分位数水平的近似值。

类型：[Float64](/sql-reference/data-types/float)。

**示例**

输入表包含一个整数列和一个浮点数列：

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

请注意，在转换为 `bfloat16` 时，示例中的所有浮点值都会被截断为 1.0。

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
