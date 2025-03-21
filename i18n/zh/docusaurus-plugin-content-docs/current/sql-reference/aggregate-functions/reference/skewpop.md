---
slug: /sql-reference/aggregate-functions/reference/skewpop
sidebar_position: 185
title: 'skewPop'
description: '计算序列的偏斜度。'
---


# skewPop

计算一个序列的 [偏斜度](https://en.wikipedia.org/wiki/Skewness)。

``` sql
skewPop(expr)
```

**参数**

`expr` — [表达式](/sql-reference/syntax#expressions) 返回一个数字。

**返回值**

给定分布的偏斜度。类型 — [Float64](../../../sql-reference/data-types/float.md)

**示例**

``` sql
SELECT skewPop(value) FROM series_with_value_column;
```
