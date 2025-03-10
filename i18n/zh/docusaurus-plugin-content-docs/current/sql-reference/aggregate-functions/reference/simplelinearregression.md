---
slug: /sql-reference/aggregate-functions/reference/simplelinearregression
sidebar_position: 183
title: 'simpleLinearRegression'
description: '执行简单（单维）线性回归。'
---


# simpleLinearRegression

执行简单（单维）线性回归。

``` sql
simpleLinearRegression(x, y)
```

参数：

- `x` — 包含解释变量值的列。
- `y` — 包含因变量值的列。

返回值：

结果线的常量 `(k, b)`，表示 `y = k*x + b`。

**示例**

``` sql
SELECT arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [0, 1, 2, 3])
```

``` text
┌─arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [0, 1, 2, 3])─┐
│ (1,0)                                                             │
└───────────────────────────────────────────────────────────────────┘
```

``` sql
SELECT arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [3, 4, 5, 6])
```

``` text
┌─arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [3, 4, 5, 6])─┐
│ (1,3)                                                             │
└───────────────────────────────────────────────────────────────────┘
```
