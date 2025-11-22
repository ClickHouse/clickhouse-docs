---
description: '执行简单（单变量）线性回归。'
sidebar_position: 183
slug: /sql-reference/aggregate-functions/reference/simplelinearregression
title: 'simpleLinearRegression'
doc_type: 'reference'
---

# simpleLinearRegression

执行简单（一元）线性回归。

```sql
simpleLinearRegression(x, y)
```

参数：

* `x` — 包含自变量（解释变量）取值的列。
* `y` — 包含因变量取值的列。

返回值：

所得拟合直线 `y = k*x + b` 的常数 `(k, b)`。

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
