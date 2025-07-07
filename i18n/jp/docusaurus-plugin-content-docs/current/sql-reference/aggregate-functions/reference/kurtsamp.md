---
'description': 'Computes the sample kurtosis of a sequence.'
'sidebar_position': 158
'slug': '/sql-reference/aggregate-functions/reference/kurtsamp'
'title': 'kurtSamp'
---




# kurtSamp

シーケンスの[標本尖度](https://en.wikipedia.org/wiki/Kurtosis)を計算します。

これは、渡された値がそのサンプルを形成する場合、ランダム変数の尖度のバイアスのない推定値を表します。

```sql
kurtSamp(expr)
```

**引数**

`expr` — 数値を返す[式](/sql-reference/syntax#expressions)。

**返される値**

与えられた分布の尖度。タイプ — [Float64](../../../sql-reference/data-types/float.md)。もし `n <= 1`（`n`はサンプルのサイズ）であれば、関数は `nan` を返します。

**例**

```sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
