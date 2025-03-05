---
slug: /sql-reference/aggregate-functions/reference/quantiletdigestweighted
sidebar_position: 179
title: "quantileTDigestWeighted"
description: "t-digestアルゴリズムを使用して数値データシーケンスの近似分位点を計算します。"
---


# quantileTDigestWeighted

[t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf)アルゴリズムを使用して数値データシーケンスの近似[分位点](https://en.wikipedia.org/wiki/Quantile)を計算します。この関数は、各シーケンスメンバーの重みを考慮します。最大誤差は1%です。メモリ消費は `log(n)` であり、ここで `n` は値の数です。

この関数のパフォーマンスは、[quantile](../../../sql-reference/aggregate-functions/reference/quantile.md#quantile)や[quantileTiming](../../../sql-reference/aggregate-functions/reference/quantiletiming.md#quantiletiming)のパフォーマンスよりも劣ります。状態サイズと精度の比率の観点では、この関数は `quantile` よりもはるかに優れています。

結果はクエリの実行順序に依存し、非決定的です。

異なるレベルの `quantile*` 関数をクエリで使用する場合、内部状態は統合されません（つまり、クエリが可能なほど効率的に機能しません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

:::note    
`quantileTDigestWeighted` [は小さなデータセットには推奨されません](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275) であり、重大な誤差につながる可能性があります。この場合、[`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md)の使用を検討してください。
:::

**構文**

``` sql
quantileTDigestWeighted(level)(expr, weight)
```

エイリアス: `medianTDigestWeighted`。

**引数**

- `level` — 分位点のレベル。オプションのパラメータ。0から1までの定数浮動小数点数です。`level` の値は `[0.01, 0.99]` の範囲で使用することをお勧めします。デフォルト値: 0.5。`level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)の列値に対する式。
- `weight` — シーケンス要素の重みを含むカラム。重みは値の出現回数です。

**返される値**

- 指定されたレベルの近似分位点。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

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

**関連情報**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
