---
slug: /sql-reference/aggregate-functions/reference/quantileexact
sidebar_position: 173
title: "quantileExact 函数"
description: "quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive, quantileExactInclusive 函数"
---


# quantileExact 函数

## quantileExact {#quantileexact}

准确计算数字数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得准确值，所有传递的值被组合成一个数组，然后进行部分排序。因此，该函数消耗 `O(n)` 的内存，其中 `n` 是传递的值的数量。尽管如此，对于少量值，该函数仍然非常有效。

当在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（也就是说，查询的效率低于其应有的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

``` sql
quantileExact(level)(expr)
```

别名: `medianExact`。

**参数**

- `level` — 分位数的级别。可选参数。常量浮点数，范围为 0 到 1。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值: 0.5。在 `level=0.5` 时，该函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，返回数字[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)或[DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数字数据类型，输出格式将与输入格式相同。例如：

```sql

SELECT
    toTypeName(quantileExact(number)) AS `quantile`,
    toTypeName(quantileExact(number::Int32)) AS `quantile_int32`,
    toTypeName(quantileExact(number::Float32)) AS `quantile_float32`,
    toTypeName(quantileExact(number::Float64)) AS `quantile_float64`,
    toTypeName(quantileExact(number::Int64)) AS `quantile_int64`
FROM numbers(1)


   ┌─quantile─┬─quantile_int32─┬─quantile_float32─┬─quantile_float64─┬─quantile_int64─┐
1. │ UInt64   │ Int32          │ Float32          │ Float64          │ Int64          │
   └──────────┴────────────────┴──────────────────┴──────────────────┴────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

- 如果输入值具有 `Date` 类型，则返回[Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则返回[DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

``` sql
SELECT quantileExact(number) FROM numbers(10)
```

结果：

``` text
┌─quantileExact(number)─┐
│                     5 │
└───────────────────────┘
```

## quantileExactLow {#quantileexactlow}

与 `quantileExact` 相似，该函数计算数字数据序列的确切[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得准确值，所有传递的值被组合在一起并完全排序。排序[算法](https://en.cppreference.com/w/cpp/algorithm/sort)的复杂度为 `O(N·log(N))`，其中 `N = std::distance(first, last)` 比较次数。

返回值取决于分位数级别和选择中元素的数量，即如果级别为 0.5，则该函数会返回偶数个元素的较低中位数值，以及奇数个元素的中间中位数值。中位数的计算方式类似于在 Python 中使用的 [median_low](https://docs.python.org/3/library/statistics.html#statistics.median_low) 实现。

对于所有其他级别，返回对应于 `level * size_of_array` 值的索引的元素。例如：

``` sql
SELECT quantileExactLow(0.1)(number) FROM numbers(10)

┌─quantileExactLow(0.1)(number)─┐
│                             1 │
└───────────────────────────────┘
```

当在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（也就是说，查询的效率低于其应有的效率）。在这种情况下，请使用 [quantiles](/sql-reference/aggregate-functions/reference/quantiles) 函数。

**语法**

``` sql
quantileExactLow(level)(expr)
```

别名: `medianExactLow`。

**参数**

- `level` — 分位数的级别。可选参数。常量浮点数，范围为 0 到 1。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值: 0.5。在 `level=0.5` 时，该函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，返回数字[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)或[DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数字数据类型输入，返回[Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值具有 `Date` 类型，则返回[Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则返回[DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

``` sql
SELECT quantileExactLow(number) FROM numbers(10)
```

结果：

``` text
┌─quantileExactLow(number)─┐
│                        4 │
└──────────────────────────┘
```

## quantileExactHigh {#quantileexacthigh}

与 `quantileExact` 相似，该函数计算数字数据序列的确切[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得准确值，所有传递的值被组合成一个数组，并进行完全排序。排序[算法](https://en.cppreference.com/w/cpp/algorithm/sort)的复杂度为 `O(N·log(N))`，其中 `N = std::distance(first, last)` 比较次数。

返回值取决于分位数级别和选择中元素的数量，即如果级别为 0.5，则该函数会返回偶数个元素的较高中位数值，以及奇数个元素的中间中位数值。中位数的计算方式类似于在 Python 中使用的 [median_high](https://docs.python.org/3/library/statistics.html#statistics.median_high) 实现。对于所有其他级别，返回对应于 `level * size_of_array` 值的索引的元素。

该实现的行为与当前的 `quantileExact` 实现是完全相同的。

当在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（也就是说，查询的效率低于其应有的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

``` sql
quantileExactHigh(level)(expr)
```

别名: `medianExactHigh`。

**参数**

- `level` — 分位数的级别。可选参数。常量浮点数，范围为 0 到 1。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值: 0.5。在 `level=0.5` 时，该函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 针对列值的表达式，返回数字[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)或[DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数字数据类型输入，返回[Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值具有 `Date` 类型，则返回[Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则返回[DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

``` sql
SELECT quantileExactHigh(number) FROM numbers(10)
```

结果：

``` text
┌─quantileExactHigh(number)─┐
│                         5 │
└───────────────────────────┘
```

## quantileExactExclusive {#quantileexactexclusive}

准确计算数字数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得准确值，所有传递的值被组合成一个数组，然后进行部分排序。因此，该函数消耗 `O(n)` 的内存，其中 `n` 是传递的值的数量。尽管如此，对于少量值，该函数仍然非常有效。

此函数等同于 Excel 函数 [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba)（[类型 R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）。

当在查询中使用多个不同级别的 `quantileExactExclusive` 函数时，内部状态不会合并（也就是说，查询的效率低于其应有的效率）。在这种情况下，请使用 [quantilesExactExclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactexclusive) 函数。

**语法**

``` sql
quantileExactExclusive(level)(expr)
```

**参数**

- `expr` — 针对列值的表达式，返回数字[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)或[DateTime](../../../sql-reference/data-types/datetime.md)。

**参数**

- `level` — 分位数的级别。可选。可能的值: (0, 1) — 不包括边界。默认值: 0.5。在 `level=0.5` 时，该函数计算[中位数](https://en.wikipedia.org/wiki/Median)。 [Float](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数字数据类型输入，返回[Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值具有 `Date` 类型，则返回[Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则返回[DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

``` sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactExclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

结果：

``` text
┌─quantileExactExclusive(0.6)(x)─┐
│                          599.6 │
└────────────────────────────────┘
```

## quantileExactInclusive {#quantileexactinclusive}

准确计算数字数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得准确值，所有传递的值被组合成一个数组，然后进行部分排序。因此，该函数消耗 `O(n)` 的内存，其中 `n` 是传递的值的数量。尽管如此，对于少量值，该函数仍然非常有效。

此函数等同于 Excel 函数 [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed)（[类型 R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）。

当在查询中使用多个不同级别的 `quantileExactInclusive` 函数时，内部状态不会合并（也就是说，查询的效率低于其应有的效率）。在这种情况下，请使用 [quantilesExactInclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactinclusive) 函数。

**语法**

``` sql
quantileExactInclusive(level)(expr)
```

**参数**

- `expr` — 针对列值的表达式，返回数字[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)或[DateTime](../../../sql-reference/data-types/datetime.md)。

**参数**

- `level` — 分位数的级别。可选。可能的值: [0, 1] — 包括边界。默认值: 0.5。在 `level=0.5` 时，该函数计算[中位数](https://en.wikipedia.org/wiki/Median)。 [Float](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数字数据类型输入，返回[Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值具有 `Date` 类型，则返回[Date](../../../sql-reference/data-types/date.md)。
- 如果输入值具有 `DateTime` 类型，则返回[DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

``` sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactInclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

结果：

``` text
┌─quantileExactInclusive(0.6)(x)─┐
│                          599.4 │
└────────────────────────────────┘
```

**参见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
