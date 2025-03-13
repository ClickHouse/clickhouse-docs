---
slug: '/sql-reference/aggregate-functions/reference/quantiletdigestweighted'
sidebar_position: 179
title: 'quantileTDigestWeighted'
description: '数値データシーケンスの近似分位数をt-digestアルゴリズムを使用して計算します。'
---


# quantileTDigestWeighted

[量子](https://en.wikipedia.org/wiki/Quantile)を使用して、数値データシーケンスの近似を計算します [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf)アルゴリズム。関数は、各シーケンスメンバーの重みを考慮します。最大誤差は1%です。メモリ消費は `log(n)` で、ここで `n` は値の数です。

この関数のパフォーマンスは、[quantile](/sql-reference/aggregate-functions/reference/quantile)または[quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)のパフォーマンスよりも低いです。状態のサイズと精度の比率に関して、この関数は `quantile` よりもはるかに優れています。

結果はクエリの実行順序に依存し、非決定的です。

異なるレベルの複数の `quantile*` 関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリは本来の効率的な動作よりも効率が悪くなります）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

:::note    
`quantileTDigestWeighted` を[小さなデータセット](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275)に使用することは推奨されておらず、重大な誤差を招く可能性があります。この場合、[`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md)を使用する可能性を検討してください。
:::

**構文**

``` sql
quantileTDigestWeighted(level)(expr, weight)
```

エイリアス: `medianTDigestWeighted`。

**引数**

- `level` — 分位数のレベル。オプションのパラメーター。0から1までの定数浮動小数点数。 `[0.01, 0.99]` の範囲の `level` 値を使用することをお勧めします。デフォルト値: 0.5。 `level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — カラム値に対する式で、数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)を生成します。
- `weight` — シーケンス要素の重みを示すカラム。重みは値の出現回数です。

**返される値**

- 指定されたレベルの近似分位数。

タイプ:

- 数値データ型入力については[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合、[Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合、[DateTime](../../../sql-reference/data-types/datetime.md)。

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

**参照**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
