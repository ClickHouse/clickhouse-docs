---
'description': 't-digestアルゴリズムを使用して、数値データシーケンスの近似的な分位数を計算します。'
'sidebar_position': 178
'slug': '/sql-reference/aggregate-functions/reference/quantiletdigest'
'title': 'quantileTDigest'
'doc_type': 'reference'
---


# quantileTDigest

数値データ列の近似 [quantile](https://en.wikipedia.org/wiki/Quantile) を [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) アルゴリズムを使用して計算します。

メモリ消費は `log(n)` であり、ここで `n` は値の数です。結果はクエリの実行順序に依存し、非決定的です。

この関数の性能は、[quantile](/sql-reference/aggregate-functions/reference/quantile) または [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) の性能よりも劣ります。状態サイズと精度の比率に関しては、この関数は `quantile` よりはるかに優れています。

異なるレベルの複数の `quantile*` 関数をクエリ内で使用する場合、内部状態は結合されません（つまり、クエリは本来可能なほど効率よく機能しません）。その場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileTDigest(level)(expr)
```

エイリアス: `medianTDigest`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0 から 1 の間の定数浮動小数点数。`level` 値は `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は [median](https://en.wikipedia.org/wiki/Median) を計算します。
- `expr` — 数値の [データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) の列値に対する式。

**戻り値**

- 指定されたレベルの近似分位数。

タイプ:

- 数値データ型入力の場合は [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型であるなら [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型であるなら [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT quantileTDigest(number) FROM numbers(10)
```

結果:

```text
┌─quantileTDigest(number)─┐
│                     4.5 │
└─────────────────────────┘
```

**参考**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
