---
'description': 'Kahan 補正加算アルゴリズムを用いて数値の合計を計算します'
'sidebar_position': 197
'slug': '/sql-reference/aggregate-functions/reference/sumkahan'
'title': 'sumKahan'
'doc_type': 'reference'
---

数値の合計を計算します。[Kahan補正総和アルゴリズム](https://en.wikipedia.org/wiki/Kahan_summation_algorithm)を使用します。  
[sumsum](./sum.md) 関数よりも遅くなります。  
補正は [Float](../../../sql-reference/data-types/float.md) 型に対してのみ機能します。

**構文**

```sql
sumKahan(x)
```

**引数**

- `x` — 入力値、[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または [Decimal](../../../sql-reference/data-types/decimal.md) でなければなりません。

**返される値**

- 数値の合計、型は入力引数のタイプに依存し、[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または [Decimal](../../../sql-reference/data-types/decimal.md) になります。

**例**

クエリ:

```sql
SELECT sum(0.1), sumKahan(0.1) FROM numbers(10);
```

結果:

```text
┌───────────sum(0.1)─┬─sumKahan(0.1)─┐
│ 0.9999999999999999 │             1 │
└────────────────────┴───────────────┘
```
