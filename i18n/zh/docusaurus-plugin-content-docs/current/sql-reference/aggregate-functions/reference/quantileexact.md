---
'description': 'quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive,
  quantileExactInclusive 函数'
'sidebar_position': 173
'slug': '/sql-reference/aggregate-functions/reference/quantileexact'
'title': 'quantileExact 函数'
---


# quantileExact 函数

## quantileExact {#quantileexact}

准确计算数值数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得准确值，所有传递的值会组合成一个数组，然后对其进行部分排序。因此，该函数消耗 `O(n)` 内存，其中 `n` 是传递的值的数量。然而，对于较少的值，该函数非常高效。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即，查询的效率不如可能的那样高）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileExact(level)(expr)
```

别名：`medianExact`。

**参数**

- `level` — 分位数的级别。可选参数。0到1之间的常量浮点数。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 表达式，针对列值生成数值 [数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数值数据类型，输出格式与输入格式相同。例如：

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

- 如果输入值的类型为 `Date`，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值的类型为 `DateTime`，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

与 `quantileExact` 类似，该函数计算数值数据序列的精确 [分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得准确值，所有传递的值会组合成一个数组，然后对其进行完全排序。排序 [算法](https://en.cppreference.com/w/cpp/algorithm/sort) 的复杂度为 `O(N·log(N))`，其中 `N = std::distance(first, last)` 比较。

返回值依赖于分位数级别和选择中的元素数量，即如果级别为 0.5，则对于偶数个元素函数返回较低的中位数值，对于奇数个元素返回中中位数值。中位数的计算与 python 中使用的 [median_low](https://docs.python.org/3/library/statistics.html#statistics.median_low) 实现类似。

对于所有其他级别，返回与 `level * size_of_array` 对应的索引的元素。例如：

```sql
SELECT quantileExactLow(0.1)(number) FROM numbers(10)

┌─quantileExactLow(0.1)(number)─┐
│                             1 │
└───────────────────────────────┘
```

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即，查询的效率不如可能的那样高）。在这种情况下，请使用 [quantiles](/sql-reference/aggregate-functions/reference/quantiles) 函数。

**语法**

```sql
quantileExactLow(level)(expr)
```

别名：`medianExactLow`。

**参数**

- `level` — 分位数的级别。可选参数。0到1之间的常量浮点数。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 表达式，针对列值生成数值 [数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数值数据类型输入返回 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值的类型为 `Date`，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值的类型为 `DateTime`，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

与 `quantileExact` 类似，该函数计算数值数据序列的精确 [分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得准确值，所有传递的值会组合成一个数组，然后对其进行完全排序。排序 [算法](https://en.cppreference.com/w/cpp/algorithm/sort) 的复杂度为 `O(N·log(N))`，其中 `N = std::distance(first, last)` 比较。

返回值依赖于分位数级别和选择中的元素数量，即如果级别为 0.5，则对于偶数个元素函数返回较高的中位数值，对于奇数个元素返回中中位数值。中位数的计算与 python 中使用的 [median_high](https://docs.python.org/3/library/statistics.html#statistics.median_high) 实现类似，对于所有其他级别，返回与 `level * size_of_array` 对应的索引的元素。

此实现行为与当前 `quantileExact` 实现完全相同。

在查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（即，查询的效率不如可能的那样高）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileExactHigh(level)(expr)
```

别名：`medianExactHigh`。

**参数**

- `level` — 分位数的级别。可选参数。0到1之间的常量浮点数。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。
- `expr` — 表达式，针对列值生成数值 [数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数值数据类型输入返回 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值的类型为 `Date`，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值的类型为 `DateTime`，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

准确计算数值数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得准确值，所有传递的值会组合成一个数组，然后对其进行部分排序。因此，该函数消耗 `O(n)` 内存，其中 `n` 是传递的值的数量。然而，对于较少的值，该函数非常高效。

此函数等价于 Excel 函数 [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba)，（[type R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）。

在查询中使用多个不同级别的 `quantileExactExclusive` 函数时，内部状态不会合并（即，查询的效率不如可能的那样高）。在这种情况下，请使用 [quantilesExactExclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactexclusive) 函数。

**语法**

```sql
quantileExactExclusive(level)(expr)
```

**参数**

- `expr` — 表达式，针对列值生成数值 [数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**参数**

- `level` — 分位数的级别。可选。可能的值： (0, 1) — 边界不包括。默认值：0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。 [Float](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数值数据类型输入返回 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值的类型为 `Date`，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值的类型为 `DateTime`，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

准确计算数值数据序列的 [分位数](https://en.wikipedia.org/wiki/Quantile)。

为了获得准确值，所有传递的值会组合成一个数组，然后对其进行部分排序。因此，该函数消耗 `O(n)` 内存，其中 `n` 是传递的值的数量。然而，对于较少的值，该函数非常高效。

此函数等价于 Excel 函数 [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed)，（[type R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)）。

在查询中使用多个不同级别的 `quantileExactInclusive` 函数时，内部状态不会合并（即，查询的效率不如可能的那样高）。在这种情况下，请使用 [quantilesExactInclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactinclusive) 函数。

**语法**

```sql
quantileExactInclusive(level)(expr)
```

**参数**

- `expr` — 表达式，针对列值生成数值 [数据类型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) 或 [DateTime](../../../sql-reference/data-types/datetime.md)。

**参数**

- `level` — 分位数的级别。可选。可能的值：[0, 1] — 边界包括。默认值：0.5。在 `level=0.5` 时，函数计算 [中位数](https://en.wikipedia.org/wiki/Median)。 [Float](../../../sql-reference/data-types/float.md)。

**返回值**

- 指定级别的分位数。

类型：

- 对于数值数据类型输入返回 [Float64](../../../sql-reference/data-types/float.md)。
- 如果输入值的类型为 `Date`，则返回 [Date](../../../sql-reference/data-types/date.md)。
- 如果输入值的类型为 `DateTime`，则返回 [DateTime](../../../sql-reference/data-types/datetime.md)。

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

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
