---
'description': '执行简单（单维）线性回归。'
'sidebar_position': 183
'slug': '/sql-reference/aggregate-functions/reference/simplelinearregression'
'title': 'simpleLinearRegression'
---


# simpleLinearRegression

执行简单（单维）线性回归。

```sql
simpleLinearRegression(x, y)
```

参数：

- `x` — 含有解释变量值的列。
- `y` — 含有因变量值的列。

返回值：

结果线的常数 `(k, b)`，即 `y = k*x + b`。

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
