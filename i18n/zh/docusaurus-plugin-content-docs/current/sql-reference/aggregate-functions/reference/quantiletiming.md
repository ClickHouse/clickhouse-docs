---
description: '按预定精度计算数值序列的分位数。'
sidebar_position: 180
slug: /sql-reference/aggregate-functions/reference/quantiletiming
title: 'quantileTiming'
doc_type: 'reference'
---

# quantileTiming

在给定精度下计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。

结果是确定性的（不依赖于查询的处理顺序）。该函数针对处理描述分布的序列进行了优化，例如网页加载时间或后端响应时间。

在同一个查询中使用多个具有不同级别的 `quantile*` 函数时，它们的内部状态不会被合并（也就是说，查询的执行效率低于理论上的最优）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileTiming(level)(expr)
```

Alias: `medianTiming`.

**参数**

* `level` — 分位数的级别。可选参数。取值为 0 到 1 之间的常量浮点数。建议使用位于 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。

* `expr` — 针对列值计算的[表达式](/sql-reference/syntax#expressions)，返回一个 [Float*](../../../sql-reference/data-types/float.md) 类型的数值。

  * 如果向函数传入负值，其行为未定义。
  * 如果值大于 30,000（页面加载时间超过 30 秒），则按 30,000 处理。

**精度**

在以下情况下，计算结果是精确的：

* 值的总数不超过 5670。
* 值的总数超过 5670，但页面加载时间小于 1024 ms。

否则，计算结果会被四舍五入到最接近的 16 ms 的倍数。

:::note\
对于页面加载时间分位数的计算，此函数比 [quantile](/sql-reference/aggregate-functions/reference/quantile) 更高效且更精确。
:::

**返回值**

* 指定级别的分位数。

类型：`Float32`。

:::note\
如果未向函数传入任何值（在使用 `quantileTimingIf` 时），将返回 [NaN](/sql-reference/data-types/float#nan-and-inf)。这样做的目的是将这些情况与结果为零的情况区分开来。关于对 `NaN` 值进行排序的说明，请参见 [ORDER BY 子句](/sql-reference/statements/select/order-by)。
:::

**示例**

输入表：

```text
┌─response_time─┐
│            72 │
│           112 │
│           126 │
│           145 │
│           104 │
│           242 │
│           313 │
│           168 │
│           108 │
└───────────────┘
```

查询：

```sql
SELECT quantileTiming(response_time) FROM t
```

结果：

```text
┌─quantileTiming(response_time)─┐
│                           126 │
└───────────────────────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
