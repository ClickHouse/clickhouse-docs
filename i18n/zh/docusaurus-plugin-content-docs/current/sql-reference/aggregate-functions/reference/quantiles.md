---
description: 'quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK'
sidebar_position: 177
slug: /sql-reference/aggregate-functions/reference/quantiles
title: 'quantiles 函数'
doc_type: 'reference'
---



# 分位数函数



## quantiles {#quantiles}

语法：`quantiles(level1, level2, ...)(x)`

所有分位数函数也都有对应的 `quantiles` 系列函数：`quantiles`、`quantilesDeterministic`、`quantilesTiming`、`quantilesTimingWeighted`、`quantilesExact`、`quantilesExactWeighted`、`quantileExactWeightedInterpolated`、`quantileInterpolatedWeighted`、`quantilesTDigest`、`quantilesBFloat16`、`quantilesDD`。这些函数在一次遍历中计算出所列各个分位水平的所有分位数，并返回包含结果值的数组。



## quantilesExactExclusive

精确计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得精确值，所有传入的值会被合并为一个数组，然后对该数组进行部分排序。因此，该函数会消耗 `O(n)` 的内存，其中 `n` 是传入值的数量。不过，在数据量较小时，该函数非常高效。

此函数等价于 Excel 中的 [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba) 函数（[R6 类型](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）。

在处理一组分位等级（levels）时，相比于 [quantileExactExclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactexclusive)，本函数效率更高。

**语法**

```sql
quantilesExactExclusive(level1, level2, ...)(expr)
```

**参数**

* `expr` — 对列值进行计算的表达式，结果为数值型 [数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**参数说明**

* `level` — 分位数的水平。可取值范围为 (0, 1)，不包含端点。类型为 [Float](../../../sql-reference/data-types/float.md)。

**返回值**

* 由指定水平的分位数组成的 [Array](../../../sql-reference/data-types/array.md)。

数组元素类型：

* 对于数值型输入，数组元素类型为 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值类型为 `Date`，则为 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值类型为 `DateTime`，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

结果：

```text
┌─quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.25,499.5,749.75,899.9,949.9499999999999,989.99,998.999]        │
└─────────────────────────────────────────────────────────────────────┘
```


## quantilesExactInclusive

精确计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得精确值，所有传入的值会被合并到一个数组中，然后对该数组进行部分排序。因此，该函数会消耗 `O(n)` 的内存，其中 `n` 是传入值的数量。不过，当传入值数量较少时，该函数非常高效。

此函数等价于 Excel 函数 [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed)（[R7 类型](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）。

在处理一组分位等级时，比 [quantileExactInclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactinclusive) 更高效。

**语法**

```sql
quantilesExactInclusive(level1, level2, ...)(expr)
```

**参数说明**

* `expr` — 作用于列值的表达式，结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**参数**

* `level` — 分位数的水平。可选值：[0, 1]（包含边界）。[Float](../../../sql-reference/data-types/float.md)。

**返回值**

* 一个包含指定水平分位数的 [Array](../../../sql-reference/data-types/array.md)。

数组元素类型：

* 数值型输入时为 [Float64](../../../sql-reference/data-types/float.md)。
* 输入值为 `Date` 类型时为 [Date](../../../sql-reference/data-types/date.md)。
* 输入值为 `DateTime` 类型时为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

结果：

```text
┌─quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.75,499.5,749.25,899.1,949.05,989.01,998.001]                   │
└─────────────────────────────────────────────────────────────────────┘
```


## quantilesGK

`quantilesGK` 的工作方式与 `quantileGK` 类似，但它允许我们同时计算多个不同分位点的数值，并返回一个数组。

**语法**

```sql
quantilesGK(accuracy, level1, level2, ...)(expr)
```

**返回值**

* 包含指定分位水平的[数组](../../../sql-reference/data-types/array.md)。

数组元素类型：

* 数值类型输入时为 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值为 `Date` 类型，则为 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值为 `DateTime` 类型，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
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
