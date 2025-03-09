---
slug: /sql-reference/aggregate-functions/reference/quantiletiming
sidebar_position: 180
title: 'quantileTiming'
description: '使用确定的精度计算数值数据序列的分位数。'
---


# quantileTiming

使用确定的精度计算[分位数](https://en.wikipedia.org/wiki/Quantile)的数值数据序列。

结果是确定性的（它不依赖于查询处理的顺序）。该函数针对描述分布的序列进行了优化，例如网页加载时间或后端响应时间。

当在一个查询中使用多个不同级别的 `quantile*` 函数时，内部状态不会合并（也就是说，该查询的效率低于它可能的效率）。在这种情况下，请使用[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)函数。

**语法**

``` sql
quantileTiming(level)(expr)
```

别名：`medianTiming`。

**参数**

- `level` — 分位数的级别。可选参数。从 0 到 1 的常量浮点数。我们建议使用 `[0.01, 0.99]` 范围内的 `level` 值。默认值：0.5。在 `level=0.5` 时，该函数计算[中位数](https://en.wikipedia.org/wiki/Median)。

- `expr` — [表达式](/sql-reference/syntax#expressions)，在列值上返回一个[Float\*](../../../sql-reference/data-types/float.md)类型的数字。

    - 如果传递负值给该函数，则行为未定义。
    - 如果值大于 30,000（页面加载时间超过 30 秒），则假定为 30,000。

**准确性**

计算是准确的条件是：

- 值的总数不超过 5670。
- 值的总数超过 5670，但页面加载时间少于 1024毫秒。

否则，计算结果将被四舍五入到最近的 16 毫秒的倍数。

:::note    
在计算页面加载时间的分位数时，该函数比 [quantile](/sql-reference/aggregate-functions/reference/quantile) 更有效和准确。
:::

**返回值**

- 指定级别的分位数。

类型：`Float32`。

:::note    
如果没有值传递给该函数（当使用 `quantileTimingIf` 时），将返回[NaN](/sql-reference/data-types/float#nan-and-inf)。这样做的目的是将这些情况与结果为零的情况区分开。有关排序 `NaN` 值的说明，请参见[ORDER BY 子句](/sql-reference/statements/select/order-by)。
:::

**示例**

输入表：

``` text
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

``` sql
SELECT quantileTiming(response_time) FROM t
```

结果：

``` text
┌─quantileTiming(response_time)─┐
│                           126 │
└───────────────────────────────┘
```

**另见**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
