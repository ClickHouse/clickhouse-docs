---
slug: /sql-reference/aggregate-functions/reference/quantilebfloat16
sidebar_position: 171
title: 'quantileBFloat16'
description: '计算由 bfloat16 数字组成的样本的近似分位数。'
---

计算由 [bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) 数字组成的样本的近似 [分位数](https://en.wikipedia.org/wiki/Quantile)。 `bfloat16` 是一种浮点数据类型，具有 1 个符号位、8 个指数位和 7 个尾数位。
该函数将输入值转换为 32 位浮点数，并取其最高的 16 位。然后，它计算 `bfloat16` 的分位数值，并通过附加零位将结果转换为 64 位浮点数。
该函数是一个快速的分位数估算器，相对误差不超过 0.390625%。

**语法**

``` sql
quantileBFloat16[(level)](expr)
```

别名: `medianBFloat16`

**参数**

- `expr` — 包含数字数据的列。 [整数](../../../sql-reference/data-types/int-uint.md), [浮点数](../../../sql-reference/data-types/float.md)。

**参数说明**

- `level` — 分位数的水平。可选。可能的值范围为 0 到 1。默认值: 0.5。 [浮点数](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定水平的近似分位数。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

输入表包含一个整数列和一个浮点列：

``` text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

计算 0.75 分位数（第三四分位数）的查询：

``` sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

结果:

``` text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```
请注意，示例中的所有浮点值在转换为 `bfloat16` 时都被截断为 1.0。


# quantileBFloat16Weighted

类似于 `quantileBFloat16`，但考虑到每个序列成员的权重。

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
