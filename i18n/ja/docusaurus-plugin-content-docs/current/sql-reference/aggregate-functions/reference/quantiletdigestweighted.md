---
slug: /sql-reference/aggregate-functions/reference/quantiletdigestweighted
sidebar_position: 179
---

# quantileTDigestWeighted

数値データ列の近似 [分位数](https://en.wikipedia.org/wiki/Quantile) を [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) アルゴリズムを使用して計算します。この関数は、各列の要素の重みを考慮します。最大誤差は 1% です。メモリ消費は `log(n)` であり、ここで `n` は値の数です。

この関数のパフォーマンスは、[quantile](../../../sql-reference/aggregate-functions/reference/quantile.md#quantile) や [quantileTiming](../../../sql-reference/aggregate-functions/reference/quantiletiming.md#quantiletiming) のパフォーマンスよりも低いです。状態サイズと精度の比率に関して、この関数は `quantile` よりもはるかに優れています。

結果はクエリの実行順序に依存し、非決定論的です。

クエリ内で異なるレベルの `quantile*` 関数を複数使用する場合、内部状態は結合されず（つまり、クエリが可能なほど効率的に動作しません）、この場合は [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

:::note    
`quantileTDigestWeighted` を [小さなデータセットに対して使用することは推奨されません](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275) し、重大な誤差につながる可能性があります。この場合は [`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md) の使用を検討してください。
:::

**構文**

``` sql
quantileTDigestWeighted(level)(expr, weight)
```

エイリアス: `medianTDigestWeighted`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の間の定数浮動小数点数。`[0.01, 0.99]` の範囲の `level` 値を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、関数は [中央値](https://en.wikipedia.org/wiki/Median) を計算します。
- `expr` — 数値の [データ型](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) 結果を生成するカラム値に対する式。
- `weight` — 列の重みを持つ列。重みは値の出現回数です。

**返される値**

- 指定されたレベルの近似分位数。

タイプ:

- 数値データ型入力には [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

``` sql
SELECT quantileTDigestWeighted(number, 1) FROM numbers(10)
```

結果:

``` text
┌─quantileTDigestWeighted(number, 1)─┐
│                                4.5 │
└────────────────────────────────────┘
```

**関連項目**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
