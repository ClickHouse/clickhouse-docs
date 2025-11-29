---
description: '计算序列的样本偏度。'
sidebar_position: 186
slug: /sql-reference/aggregate-functions/reference/skewsamp
title: 'skewSamp'
doc_type: 'reference'
---

# skewSamp {#skewsamp}

计算序列的[样本偏度](https://en.wikipedia.org/wiki/Skewness)。

如果传入的值构成某个随机变量的样本，则该函数返回该随机变量偏度的无偏估计值。

```sql
skewSamp(expr)
```

**参数**

`expr` — 返回数值的[表达式](/sql-reference/syntax#expressions)。

**返回值**

给定分布的偏度值。类型为 [Float64](../../../sql-reference/data-types/float.md)。如果 `n <= 1`（`n` 为样本大小），则函数返回 `nan`。

**示例**

```sql
SELECT skewSamp(value) FROM series_with_value_column;
```
