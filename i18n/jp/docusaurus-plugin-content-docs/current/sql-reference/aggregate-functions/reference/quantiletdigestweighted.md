---
description: 'Computes an approximate quantile of a numeric data sequence using
  the t-digest algorithm.'
sidebar_position: 179
slug: '/sql-reference/aggregate-functions/reference/quantiletdigestweighted'
title: 'quantileTDigestWeighted'
---




# quantileTDigestWeighted

数値データシーケンスの近似[分位数](https://en.wikipedia.org/wiki/Quantile)を、[t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf)アルゴリズムを使用して計算します。この関数は、各シーケンスメンバーの重みを考慮します。最大誤差は1%です。メモリ消費は`log(n)`で、ここで`n`は値の数です。

この関数のパフォーマンスは、[quantile](/sql-reference/aggregate-functions/reference/quantile)や[quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)のパフォーマンスよりも低いです。状態サイズと精度の比率の観点では、この関数は`quantile`よりもはるかに優れています。

結果はクエリの実行順序に依存し、非決定的です。

異なるレベルの複数の`quantile*`関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリは効率的に動作しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

:::note    
`quantileTDigestWeighted`は[Tinyデータセットには推奨されません](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275)し、重大な誤差を引き起こす可能性があります。この場合、[`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md)を使用する可能性を検討してください。
:::

**構文**

```sql
quantileTDigestWeighted(level)(expr, weight)
```

エイリアス: `medianTDigestWeighted`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数を指定します。`level`の値は`[0.01, 0.99]`の範囲を推奨します。デフォルト値: 0.5。`level=0.5`のとき、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)を結果とするカラム値に対する式。
- `weight` — シーケンス要素の重みを持つカラム。重みは値の出現回数です。

**返される値**

- 指定されたレベルの近似分位数。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT quantileTDigestWeighted(number, 1) FROM numbers(10)
```

結果:

```text
┌─quantileTDigestWeighted(number, 1)─┐
│                                4.5 │
└────────────────────────────────────┘
```

**参照**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
