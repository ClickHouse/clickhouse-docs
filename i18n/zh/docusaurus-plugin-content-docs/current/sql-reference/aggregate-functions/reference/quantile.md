---
description: '计算数值数据序列的近似分位数。'
sidebar_position: 170
slug: /sql-reference/aggregate-functions/reference/quantile
title: 'quantile'
doc_type: 'reference'
---

# quantile {#quantile}

计算数值数据序列的近似[分位数](https://en.wikipedia.org/wiki/Quantile)。

此函数对数值序列应用[水库抽样](https://en.wikipedia.org/wiki/Reservoir_sampling)，水库大小最多为 8192，并使用随机数生成器进行抽样。结果是非确定性的。若要获得精确分位数，请使用 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 函数。

在查询中对不同分位水平使用多个 `quantile*` 函数时，其内部状态不会被合并（也就是说，该查询的执行效率低于理论最优）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

请注意，对于空的数值序列，`quantile` 将返回 NaN，而其 `quantile*` 变体则可能返回 NaN，或根据具体变体返回该序列类型的默认值。

**语法**

```sql
quantile(level)(expr)
```

别名：`median`。

**参数**

* `level` — 分位数的级别。可选参数。取值为 0 到 1 的常量浮点数。建议将 `level` 的取值范围设置为 `[0.01, 0.99]`。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。
* `expr` — 针对列值的表达式，结果为数值型[数据类型](/sql-reference/data-types)、[Date](/sql-reference/data-types/date) 或 [DateTime](/sql-reference/data-types/datetime)。

**返回值**

* 指定级别的近似分位数。

类型：

* 对于数值型输入数据类型，返回 [Float64](/sql-reference/data-types/float)。
* 如果输入值类型为 `Date`，则返回 [Date](/sql-reference/data-types/date)。
* 如果输入值类型为 `DateTime`，则返回 [DateTime](/sql-reference/data-types/datetime)。

**示例**

输入表：

```text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

查询：

```sql
SELECT quantile(val) FROM t
```

结果：

```text
┌─quantile(val)─┐
│           1.5 │
└───────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles#quantiles)
