---
description: '単純な（1 次元の）線形回帰を実行します。'
sidebar_position: 183
slug: /sql-reference/aggregate-functions/reference/simplelinearregression
title: 'simpleLinearRegression'
doc_type: 'reference'
---

# simpleLinearRegression

単回帰（1 次元）線形回帰を実行します。

```sql
simpleLinearRegression(x, y)
```

パラメータ:

* `x` — 説明変数の値を含む列。
* `y` — 従属変数の値を含む列。

戻り値:

得られる直線 `y = k*x + b` の定数 `(k, b)`。

**例**

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
