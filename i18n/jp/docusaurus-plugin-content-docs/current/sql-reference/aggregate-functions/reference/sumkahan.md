---
'description': 'Calculates the sum of the numbers with Kahan compensated summation
  algorithm'
'sidebar_position': 197
'slug': '/sql-reference/aggregate-functions/reference/sumkahan'
'title': 'sumKahan'
---



数の合計を [Kahan 補正加算アルゴリズム](https://en.wikipedia.org/wiki/Kahan_summation_algorithm) を使用して計算します。  
[sums](./sum.md) 関数よりも遅くなります。  
補正は [Float](../../../sql-reference/data-types/float.md) 型のみに適用されます。

**構文**

```sql
sumKahan(x)
```

**引数**

- `x` — 入力値で、[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または [Decimal](../../../sql-reference/data-types/decimal.md) でなければなりません。

**返される値**

- 数の合計。返される型は、入力引数の型に応じて [Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または [Decimal](../../../sql-reference/data-types/decimal.md) になります。

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
