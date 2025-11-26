---
description: '执行简单（单变量）线性回归。'
sidebar_position: 183
slug: /sql-reference/aggregate-functions/reference/simplelinearregression
title: 'simpleLinearRegression'
doc_type: 'reference'
---

# simpleLinearRegression

执行简单（一维）线性回归。

```sql
简单线性回归(x, y)
```

参数：

* `x` — 自变量取值所在的列。
* `y` — 因变量取值所在的列。

返回值：

拟合直线 `y = k*x + b` 的常数 `(k, b)`。

**示例**

```sql
SELECT arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [0, 1, 2, 3])
```

```text
┌─arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [0, 1, 2, 3])─┐
│ (1,0)                                                             │
└───────────────────────────────────────────────────────────────────┘
```

```sql
SELECT arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [3, 4, 5, 6])
```

```text
┌─arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [3, 4, 5, 6])─┐
│ (1,3)                                                             │
└───────────────────────────────────────────────────────────────────┘
```
