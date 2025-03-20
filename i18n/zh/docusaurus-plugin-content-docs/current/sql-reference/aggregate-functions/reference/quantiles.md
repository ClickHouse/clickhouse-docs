---
slug: /sql-reference/aggregate-functions/reference/quantiles
sidebar_position: 177
title: "quantiles 函数"
description: "quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK"
---


# quantiles 函数

## quantiles {#quantiles}

语法: `quantiles(level1, level2, ...)(x)`

所有的分位数函数还有相应的分位数函数: `quantiles`, `quantilesDeterministic`, `quantilesTiming`, `quantilesTimingWeighted`, `quantilesExact`, `quantilesExactWeighted`, `quantileExactWeightedInterpolated`, `quantileInterpolatedWeighted`, `quantilesTDigest`, `quantilesBFloat16`, `quantilesDD`。这些函数可以在一次操作中计算出列出级别的所有分位数，并返回一个结果值的数组。

## quantilesExactExclusive {#quantilesexactexclusive}

准确计算数字数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获取精确值，所有传入的值被组合成一个数组，然后进行部分排序。因此，该函数消耗 `O(n)` 内存，其中 `n` 是传入的值的数量。然而，对于较少的值，该函数非常高效。

该函数相当于 Excel 函数 [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba)，([类型 R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample))。

在处理级别集合时，该函数比 [quantileExactExclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactexclusive) 更高效。

**语法**

``` sql
quantilesExactExclusive(level1, level2, ...)(expr)
```

**参数**

- `expr` — 对列值的表达式，结果为数字 [数据类型](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**参数说明**

- `level` — 分位数的级别。可能的值: (0, 1) — 不包括边界。 [Float](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定级别的 [Array](../../../sql-reference/data-types/array.md) 的分位数。

数组值的类型:

- 输入为数字数据类型时为 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值为 `Date` 类型，则为 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值为 `DateTime` 类型，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询:

``` sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

结果:

``` text
┌─quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.25,499.5,749.75,899.9,949.9499999999999,989.99,998.999]        │
└─────────────────────────────────────────────────────────────────────┘
```

## quantilesExactInclusive {#quantilesexactinclusive}

准确计算数字数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获取精确值，所有传入的值被组合成一个数组，然后进行部分排序。因此，该函数消耗 `O(n)` 内存，其中 `n` 是传入的值的数量。然而，对于较少的值，该函数非常高效。

该函数相当于 Excel 函数 [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed)，([类型 R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample))。

在处理级别集合时，该函数比 [quantileExactInclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactinclusive) 更高效。

**语法**

``` sql
quantilesExactInclusive(level1, level2, ...)(expr)
```

**参数**

- `expr` — 对列值的表达式，结果为数字 [数据类型](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**参数说明**

- `level` — 分位数的级别。可能的值: [0, 1] — 包括边界。 [Float](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定级别的 [Array](../../../sql-reference/data-types/array.md) 的分位数。

数组值的类型:

- 输入为数字数据类型时为 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值为 `Date` 类型，则为 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值为 `DateTime` 类型，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询:

``` sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

结果:

``` text
┌─quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.75,499.5,749.25,899.1,949.05,989.01,998.001]                   │
└─────────────────────────────────────────────────────────────────────┘
```

## quantilesGK {#quantilesgk}

`quantilesGK` 的工作方式与 `quantileGK` 类似，但允许我们同时计算不同级别的数量并返回一个数组。

**语法**

``` sql
quantilesGK(accuracy, level1, level2, ...)(expr)
```

**返回值**

- 指定级别的 [Array](../../../sql-reference/data-types/array.md) 的分位数。

数组值的类型:

- 输入为数字数据类型时为 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值为 `Date` 类型，则为 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值为 `DateTime` 类型，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询:

``` sql
SELECT quantilesGK(1, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(1, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [1,1,1]                                          │
└──────────────────────────────────────────────────┘

SELECT quantilesGK(10, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(10, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [156,413,659]                                     │
└───────────────────────────────────────────────────┘


SELECT quantilesGK(100, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(100, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [251,498,741]                                      │
└────────────────────────────────────────────────────┘

SELECT quantilesGK(1000, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(1000, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [249,499,749]                                       │
└─────────────────────────────────────────────────────┘
```
