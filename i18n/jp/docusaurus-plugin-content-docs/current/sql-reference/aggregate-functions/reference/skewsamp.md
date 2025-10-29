---
'description': 'シーケンスのサンプル歪度を計算します。'
'sidebar_position': 186
'slug': '/sql-reference/aggregate-functions/reference/skewsamp'
'title': 'skewSamp'
'doc_type': 'reference'
---


# skewSamp

シーケンスの[サンプル歪度](https://en.wikipedia.org/wiki/Skewness)を計算します。

これは、渡された値がそのサンプルを形成する場合に、ランダム変数の歪度の偏りのない推定値を表します。

```sql
skewSamp(expr)
```

**引数**

`expr` — 数値を返す[式](/sql-reference/syntax#expressions)。

**戻り値**

指定された分布の歪度。型 — [Float64](../../../sql-reference/data-types/float.md)。`n <= 1`の場合（`n`はサンプルのサイズ）、関数は`nan`を返します。

**例**

```sql
SELECT skewSamp(value) FROM series_with_value_column;
```
