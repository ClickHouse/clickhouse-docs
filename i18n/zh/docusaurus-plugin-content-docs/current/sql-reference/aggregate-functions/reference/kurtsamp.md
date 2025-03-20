---
slug: /sql-reference/aggregate-functions/reference/kurtsamp
sidebar_position: 158
title: 'kurtSamp'
description: '计算序列的样本峰度。'
---


# kurtSamp

计算序列的 [样本峰度](https://en.wikipedia.org/wiki/Kurtosis)。

如果传递的值形成其样本，则它表示随机变量峰度的无偏估计。

``` sql
kurtSamp(expr)
```

**参数**

`expr` — [表达式](/sql-reference/syntax#expressions)，返回一个数字。

**返回值**

给定分布的峰度。类型 — [Float64](../../../sql-reference/data-types/float.md)。如果 `n <= 1`（`n` 是样本的大小），则该函数返回 `nan`。

**示例**

``` sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
