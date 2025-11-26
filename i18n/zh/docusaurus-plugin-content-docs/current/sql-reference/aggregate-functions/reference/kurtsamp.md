---
description: '计算序列的样本峰度。'
sidebar_position: 158
slug: /sql-reference/aggregate-functions/reference/kurtsamp
title: 'kurtSamp'
doc_type: 'reference'
---

# kurtSamp

计算序列的[样本峰度](https://en.wikipedia.org/wiki/Kurtosis)。

当传入的值构成某随机变量的样本时，该函数返回该随机变量峰度的无偏估计值。

```sql
kurtSamp(expr)
```

**参数**

`expr` — 返回数字的[表达式](/sql-reference/syntax#expressions)。

**返回值**

给定分布的峰度。返回类型为 [Float64](../../../sql-reference/data-types/float.md)。如果 `n <= 1`（`n` 为样本大小），则函数返回 `nan`。

**示例**

```sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
