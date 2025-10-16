---
'description': 'シーケンスの歪度を計算します。'
'sidebar_position': 185
'slug': '/sql-reference/aggregate-functions/reference/skewpop'
'title': 'skewPop'
'doc_type': 'reference'
---


# skewPop

シーケンスの[スキュー](https://en.wikipedia.org/wiki/Skewness)を計算します。

```sql
skewPop(expr)
```

**引数**

`expr` — 数字を返す[式](/sql-reference/syntax#expressions)。

**返される値**

指定された分布のスキュー。タイプ — [Float64](../../../sql-reference/data-types/float.md)

**例**

```sql
SELECT skewPop(value) FROM series_with_value_column;
```
