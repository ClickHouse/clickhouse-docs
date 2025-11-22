---
description: '在给定精度下计算数值数据序列的分位数。'
sidebar_position: 180
slug: /sql-reference/aggregate-functions/reference/quantiletiming
title: 'quantileTiming'
doc_type: 'reference'
---

# quantileTiming

在指定精度下计算数值数据序列的[分位数](https://en.wikipedia.org/wiki/Quantile)。

结果是确定性的（不依赖于查询的处理顺序）。该函数针对描述分布的序列进行了优化，例如网页加载时间或后端响应时间。

在一个查询中使用多个具有不同 level 的 `quantile*` 函数时，这些函数的内部状态不会被合并（也就是说，查询的执行效率低于本可达到的效率）。在这种情况下，请使用 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 函数。

**语法**

```sql
quantileTiming(level)(expr)
```

别名：`medianTiming`。

**参数**

* `level` — 分位数的级别。可选参数。取值为 0 到 1 的常量浮点数。建议在 `[0.01, 0.99]` 范围内使用 `level` 值。默认值：0.5。在 `level=0.5` 时，函数计算[中位数](https://en.wikipedia.org/wiki/Median)。

* `expr` — 针对列值进行计算的[表达式](/sql-reference/syntax#expressions)，返回 [Float*](../../../sql-reference/data-types/float.md) 类型的数值。

  * 如果向函数传递负值，其行为未定义。
  * 如果值大于 30,000（页面加载时间超过 30 秒），则将其视为 30,000。

**精度**

在以下情况下，计算结果是精确的：

* 值的总数不超过 5670。
* 值的总数超过 5670，但页面加载时间小于 1024 毫秒。

否则，计算结果将四舍五入到最接近的 16 毫秒的倍数。

:::note\
在计算页面加载时间分位数时，该函数比 [quantile](/sql-reference/aggregate-functions/reference/quantile) 更高效且更精确。
:::

**返回值**

* 指定级别的分位数。

类型：`Float32`。

:::note\
如果没有向函数传递任何值（使用 `quantileTimingIf` 时），则返回 [NaN](/sql-reference/data-types/float#nan-and-inf)。这样做的目的是将这些情况与结果为零的情况区分开来。关于 `NaN` 值的排序说明，参见 [ORDER BY 子句](/sql-reference/statements/select/order-by)。
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
