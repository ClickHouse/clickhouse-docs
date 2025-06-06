---
'description': '计算一个序列的样本偏度。'
'sidebar_position': 186
'slug': '/sql-reference/aggregate-functions/reference/skewsamp'
'title': 'skewSamp'
---


# skewSamp

计算序列的 [样本偏斜度](https://en.wikipedia.org/wiki/Skewness)。

如果传递的值形成其样本，则它代表随机变量偏斜度的无偏估计。

```sql
skewSamp(expr)
```

**参数**

`expr` — [表达式](/sql-reference/syntax#expressions)，返回一个数字。

**返回值**

给定分布的偏斜度。类型 — [Float64](../../../sql-reference/data-types/float.md)。如果 `n <= 1` (`n` 是样本的大小)，则该函数返回 `nan`。

**示例**

```sql
SELECT skewSamp(value) FROM series_with_value_column;
```
