---
description: '在一组值中计算最左端和最右端点之间斜率的聚合函数。'
sidebar_position: 114
slug: /sql-reference/aggregate-functions/reference/boundingRatio
title: 'boundingRatio'
doc_type: 'reference'
---

在一组值中计算最左端和最右端点之间斜率的聚合函数。

示例：

示例数据：

```sql
SELECT
    number,
    number * 1.5
FROM numbers(10)
```

```response
┌─number─┬─multiply(number, 1.5)─┐
│      0 │                     0 │
│      1 │                   1.5 │
│      2 │                     3 │
│      3 │                   4.5 │
│      4 │                     6 │
│      5 │                   7.5 │
│      6 │                     9 │
│      7 │                  10.5 │
│      8 │                    12 │
│      9 │                  13.5 │
└────────┴───────────────────────┘
```

`boundingRatio()` 函数返回最左端点和最右端点之间连线的斜率。在上述数据中，这两个点分别是 `(0,0)` 和 `(9,13.5)`。

```sql
SELECT boundingRatio(number, number * 1.5)
FROM numbers(10)
```

```response
┌─boundingRatio(number, multiply(number, 1.5))─┐
│                                          1.5 │
└──────────────────────────────────────────────┘
```
