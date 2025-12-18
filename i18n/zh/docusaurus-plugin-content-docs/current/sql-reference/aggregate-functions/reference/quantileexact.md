---
description: 'quantileExact、quantileExactLow、quantileExactHigh、quantileExactExclusive、
  quantileExactInclusive 函数'
sidebar_position: 173
slug: /sql-reference/aggregate-functions/reference/quantileexact
title: 'quantileExact 函数'
doc_type: 'reference'
---

# quantileExact 精确分位数函数 {#quantileexact-functions}

## quantileExact {#quantileexact}

精确计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了得到精确值，所有传入的值会被合并到一个数组中，然后对该数组进行部分排序。因此，该函数会消耗 `O(n)` 的内存，其中 `n` 是传入值的数量。不过，当值的数量较少时，该函数非常高效。

在一个查询中使用多个具有不同分位等级的 `quantile*` 函数时，其内部状态不会被合并（也就是说，该查询的执行效率低于理论上可能达到的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileExact(level)(expr)
```

别名：`medianExact`。

**参数**

* `level` — 分位数的级别。可选参数。取值为 0 到 1 之间的常量浮点数。建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 作用于列值的表达式，其结果类型为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

* 指定级别的分位数。

类型：

* 对于数值数据类型，输出格式与输入格式相同。例如：

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

* 如果输入值的类型为 `Date`，则为 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值的类型为 `DateTime`，则为 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
SELECT quantileExact(number) FROM numbers(10)
```

结果：

```text
┌─quantileExact(number)─┐
│                     5 │
└───────────────────────┘
```

## quantileExactLow {#quantileexactlow}

与 `quantileExact` 类似，此函数计算数值数据序列的精确[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得精确值，所有传入的值会先合并为一个数组，然后对该数组进行完全排序。排序[算法](https://en.cppreference.com/w/cpp/algorithm/sort)的复杂度为 `O(N·log(N))`，其中 `N = std::distance(first, last)` 为元素个数。

返回值取决于分位数水平（level）和所选元素的数量。也就是说，如果 level 为 0.5，那么当元素个数为偶数时，函数返回较低的中位数值，当元素个数为奇数时返回中间的中位数值。中位数的计算方式与 Python 中使用的 [median&#95;low](https://docs.python.org/3/library/statistics.html#statistics.median_low) 实现类似。

对于其他任意 level，会返回索引为 `level * size_of_array` 的元素。例如：

```sql
SELECT quantileExactLow(0.1)(number) FROM numbers(10)

┌─quantileExactLow(0.1)(number)─┐
│                             1 │
└───────────────────────────────┘
```

在查询中使用多个分位数等级不同的 `quantile*` 函数时，其内部状态不会被合并（也就是说，查询的执行效率会低于理想水平）。在这种情况下，请使用 [quantiles](/sql-reference/aggregate-functions/reference/quantiles) 函数。

**语法**

```sql
quantileExactLow(level)(expr)
```

别名：`medianExactLow`。

**参数**

* `level` — 分位水平。可选参数。取值为 0 到 1 之间的常量浮点数。推荐在 `[0.01, 0.99]` 范围内使用 `level` 值。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 对列值进行计算的表达式，结果为数值[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

* 指定分位水平的分位数。

类型：

* 对数值数据类型输入返回 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值的类型为 `Date`，则返回 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值的类型为 `DateTime`，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
SELECT quantileExactLow(number) FROM numbers(10)
```

结果：

```text
┌─quantileExactLow(number)─┐
│                        4 │
└──────────────────────────┘
```

## quantileExactHigh {#quantileexacthigh}

与 `quantileExact` 类似，该函数计算数值数据序列的精确[分位数](https://en.wikipedia.org/wiki/Quantile)。

所有传入的值会合并到一个数组中，然后对该数组进行完全排序，以获得精确值。排序[算法](https://en.cppreference.com/w/cpp/algorithm/sort)的复杂度为 `O(N·log(N))`，其中 `N = std::distance(first, last)` 为比较次数。

返回值取决于分位数水平（level）以及选定元素的数量。也就是说，如果 level 为 0.5，则当元素个数为偶数时，函数返回偏高的中位数值，当元素个数为奇数时，函数返回正中的中位数值。中位数的计算方式与 Python 中使用的 [median&#95;high](https://docs.python.org/3/library/statistics.html#statistics.median_high) 实现类似。对于其他所有 level，返回索引为 `level * size_of_array` 对应位置的元素。

该实现与当前的 `quantileExact` 实现的行为完全一致。

在一个查询中使用多个带有不同 level 的 `quantile*` 函数时，其内部状态不会被合并（也就是说，该查询的执行效率低于理论最优）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileExactHigh(level)(expr)
```

别名：`medianExactHigh`。

**参数**

* `level` — 分位数水平。可选参数，从 0 到 1 的常量浮点数。建议在 `[0.01, 0.99]` 范围内使用 `level` 值。默认值：0.5。当 `level = 0.5` 时，该函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 针对列值的表达式，结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

* 指定水平的分位数。

类型：

* 数值数据类型输入时返回 [Float64](../../../sql-reference/data-types/float.md)。
* 输入值为 `Date` 类型时返回 [Date](../../../sql-reference/data-types/date.md)。
* 输入值为 `DateTime` 类型时返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
SELECT quantileExactHigh(number) FROM numbers(10)
```

结果：

```text
┌─quantileExactHigh(number)─┐
│                         5 │
└───────────────────────────┘
```

## quantileExactExclusive {#quantileexactexclusive}

精确计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得精确值，所有传入的值会被合并到一个数组中，并对该数组进行部分排序。因此，该函数会消耗 `O(n)` 的内存，其中 `n` 为传入值的数量。不过，在数据量较小时，该函数非常高效。

此函数等价于 Excel 中的 [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba) 函数（[R6 类型](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）。

在同一个查询中以不同分位点多次使用 `quantileExactExclusive` 函数时，其内部状态不会被合并（也就是说，该查询的执行效率会低于本可以达到的最优效率）。在这种情况下，请使用 [quantilesExactExclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactexclusive) 函数。

**语法**

```sql
quantileExactExclusive(level)(expr)
```

**参数**

* `expr` — 作用于列值的表达式，结果为数值型 [data types](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**参数说明**

* `level` — 分位数级别。可选。取值范围：(0, 1) — 不包含边界。默认值：0.5。当 `level=0.5` 时，该函数计算[中位数](https://en.wikipedia.org/wiki/Median)。类型为 [Float](../../../sql-reference/data-types/float.md)。

**返回值**

* 指定级别的分位数。

类型：

* 对于数值型输入，返回 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值类型为 `Date`，返回 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值类型为 `DateTime`，返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactExclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

结果：

```text
┌─quantileExactExclusive(0.6)(x)─┐
│                          599.6 │
└────────────────────────────────┘
```

## quantileExactInclusive {#quantileexactinclusive}

精确计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。

为了得到精确值，所有传入的值会被收集到一个数组中，然后对该数组进行部分排序。因此，函数会消耗 `O(n)` 的内存，其中 `n` 是传入值的个数。不过，当值的数量较少时，该函数仍然非常高效。

此函数等价于 Excel 函数 [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed)（[R7 类型](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）。

在同一个查询中使用多个具有不同 level 的 `quantileExactInclusive` 函数时，其内部状态不会被合并（即查询的执行效率低于理论上的最优）。在这种情况下，请使用 [quantilesExactInclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactinclusive) 函数。

**语法**

```sql
quantileExactInclusive(level)(expr)
```

**参数**

* `expr` — 作用于列值的表达式，结果为数值型[数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**参数说明**

* `level` — 分位数级别。可选。取值范围为 [0, 1]（包含边界）。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。类型为 [Float](../../../sql-reference/data-types/float.md)。

**返回值**

* 指定级别的分位数。

类型：

* 对于数值数据类型输入，返回 [Float64](../../../sql-reference/data-types/float.md)。
* 如果输入值的类型为 `Date`，则返回 [Date](../../../sql-reference/data-types/date.md)。
* 如果输入值的类型为 `DateTime`，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

**示例**

查询：

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactInclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

结果：

```text
┌─quantileExactInclusive(0.6)(x)─┐
│                          599.4 │
└────────────────────────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
