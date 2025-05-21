---
'description': '计算序列的峰度'
'sidebar_position': 157
'slug': '/sql-reference/aggregate-functions/reference/kurtpop'
'title': 'kurtPop'
---




# kurtPop

计算一个序列的 [kurtosis](https://en.wikipedia.org/wiki/Kurtosis)。

```sql
kurtPop(expr)
```

**参数**

`expr` — [表达式](/sql-reference/syntax#expressions)，返回一个数字。

**返回值**

给定分布的 kurtosis。类型 — [Float64](../../../sql-reference/data-types/float.md)

**示例**

```sql
SELECT kurtPop(value) FROM series_with_value_column;
```
