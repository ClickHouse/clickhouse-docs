---
description: '在指定精度下，根据每个序列成员的权重计算数值数据序列的分位数。'
sidebar_position: 181
slug: /sql-reference/aggregate-functions/reference/quantiletimingweighted
title: 'quantileTimingWeighted'
doc_type: 'reference'
---

# quantileTimingWeighted

在给定精度下，根据序列中每个成员的权重计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。

结果是确定性的（不依赖于查询处理顺序）。该函数针对描述分布的序列进行了优化，例如网页加载时间或后端响应时间。

在一个查询中使用多个具有不同级别的 `quantile*` 函数时，其内部状态不会被合并（也就是说，查询的执行效率低于本可达到的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileTimingWeighted(level)(expr, weight)
```

别名：`medianTimingWeighted`。

**参数**

* `level` — 分位数的级别。可选参数。取值为 0 到 1 之间的常量浮点数。建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。当 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。

* `expr` — 对列值进行计算并返回 [Float*](../../../sql-reference/data-types/float.md) 类型数值的[表达式](/sql-reference/syntax#expressions)。

  * 如果向函数传递负值，其行为未定义。
  * 如果值大于 30,000（页面加载时间超过 30 秒），则按 30,000 处理。

* `weight` — 包含序列元素权重的列。权重表示该数值出现的次数。

**精度**

在以下情况下计算是精确的：

* 值的总数不超过 5670。
* 值的总数超过 5670，但页面加载时间小于 1024 ms。

否则，计算结果将四舍五入到最接近的 16 ms 的倍数。

:::note\
在计算页面加载时间分位数时，此函数比 [quantile](/sql-reference/aggregate-functions/reference/quantile) 更高效且更精确。
:::

**返回值**

* 指定级别的分位数。

类型：`Float32`。

:::note\
如果没有向函数传递任何值（在使用 `quantileTimingIf` 时），则会返回 [NaN](/sql-reference/data-types/float#nan-and-inf)。这样做的目的是将这些情况与结果为零的情况区分开来。关于对 `NaN` 值进行排序的说明，参见 [ORDER BY 子句](/sql-reference/statements/select/order-by)。
:::

**示例**

输入表：

```text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

查询：

```sql
SELECT quantileTimingWeighted(response_time, weight) FROM t
```

结果：

```text
┌─quantileTimingWeighted(response_time, weight)─┐
│                                           112 │
└───────────────────────────────────────────────┘
```


# quantilesTimingWeighted

与 `quantileTimingWeighted` 相同，但接受多个分位数水平作为参数，并返回一个 `Array`，其中包含这些分位数对应的多个取值。

**示例**

输入表：

```text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

查询：

```sql
SELECT quantilesTimingWeighted(0,5, 0.99)(response_time, weight) FROM t
```

结果：

```text
┌─quantilesTimingWeighted(0.5, 0.99)(response_time, weight)─┐
│ [112,162]                                                 │
└───────────────────────────────────────────────────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
