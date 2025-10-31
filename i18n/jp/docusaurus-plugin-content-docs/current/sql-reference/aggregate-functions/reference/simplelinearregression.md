---
'description': '単純（単次元）線形回帰を実行します。'
'sidebar_position': 183
'slug': '/sql-reference/aggregate-functions/reference/simplelinearregression'
'title': 'simpleLinearRegression'
'doc_type': 'reference'
---


# simpleLinearRegression

簡単な（1次元）線形回帰を実行します。

```sql
simpleLinearRegression(x, y)
```

パラメータ:

- `x` — 説明変数の値を持つカラム。
- `y` — 従属変数の値を持つカラム。

返される値:

結果の直線 `y = k*x + b` の定数 `(k, b)`。

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
