---
description: '提供用于单因素方差分析（ANOVA 检验）的统计方法。它针对多组服从正态分布的观测值进行检验，以判断各组的均值是否相同。'
sidebar_position: 101
slug: /sql-reference/aggregate-functions/reference/analysis_of_variance
title: 'analysisOfVariance'
doc_type: 'reference'
---

# analysisOfVariance {#analysisofvariance}

提供用于单因素方差分析（ANOVA 检验）的统计检验方法。该检验针对多个服从正态分布的观测组，用于判断各组的均值是否相同。

**语法**

```sql
analysisOfVariance(val, group_no)
```

别名：`anova`

**参数**

* `val`：数值。
* `group_no`：`val` 所属的组号。

:::note
组从 0 开始编号，并且至少需要两个组才能执行检验。
至少应有一个组的观测值数量大于 1。
:::

**返回值**

* `(f_statistic, p_value)`。[Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md), [Float64](../../data-types/float.md))。

**示例**

查询：

```sql
SELECT analysisOfVariance(number, number % 2) FROM numbers(1048575);
```

结果：

```response
┌─analysisOfVariance(number, modulo(number, 2))─┐
│ (0,1)                                         │
└───────────────────────────────────────────────┘
```
