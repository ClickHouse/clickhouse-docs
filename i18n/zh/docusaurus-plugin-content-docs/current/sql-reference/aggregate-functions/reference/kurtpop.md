---
description: '计算数据序列的峰度。'
sidebar_position: 157
slug: /sql-reference/aggregate-functions/reference/kurtpop
title: 'kurtPop'
doc_type: 'reference'
---

# kurtPop

计算一个序列的[峰度](https://en.wikipedia.org/wiki/Kurtosis)。

```sql
kurtPop(expr)
```

**参数**

`expr` — 返回数值的[表达式](/sql-reference/syntax#expressions)。

**返回值**

给定分布的峰度。类型 — [Float64](../../../sql-reference/data-types/float.md)

**示例**

```sql
SELECT kurtPop(value) FROM series_with_value_column;
```
