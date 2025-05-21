---
description: '数値データ列の近似値の分位数を t-digest アルゴリズムを使用して計算します。'
sidebar_position: 179
slug: /sql-reference/aggregate-functions/reference/quantiletdigestweighted
title: 'quantileTDigestWeighted'
---


# quantileTDigestWeighted

[t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) アルゴリズムを使用して、数値データ列の近似的な [分位数](https://en.wikipedia.org/wiki/Quantile) を計算します。この関数は、各シーケンスメンバーの重みを考慮に入れます。最大誤差は 1％です。メモリ消費は `log(n)` で、`n` は値の数です。

この関数のパフォーマンスは、[quantile](/sql-reference/aggregate-functions/reference/quantile) または [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) のパフォーマンスよりも劣ります。State サイズに対する精度の比率に関して、この関数は `quantile` よりもはるかに優れています。

結果はクエリの実行順序に依存し、非決定的です。

異なるレベルの `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、クエリは効率的に機能しません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

:::note    
`t-ダイジェスト重み付き分位数` の使用は [小さなデータセットには推奨されません](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275) で、重大な誤差を引き起こす可能性があります。この場合、代わりに [`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md) の使用を検討してください。
:::

**構文**

```sql
quantileTDigestWeighted(level)(expr, weight)
```

エイリアス: `medianTDigestWeighted`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0 から 1 までの定数浮動小数点数。`level` 値は `[0.01, 0.99]` の範囲内を使用することをお勧めします。デフォルト値: 0.5。`level=0.5` の場合、関数は [中央値](https://en.wikipedia.org/wiki/Median) を計算します。
- `expr` — 数値 [データ型](/sql-reference/data-types)、[日付](../../../sql-reference/data-types/date.md) または [日時](../../../sql-reference/data-types/datetime.md) の結果となるカラム値に対する式。
- `weight` — シーケンス要素の重みを持つカラム。重みは値の出現回数です。

**返される値**

- 指定したレベルの近似分位数。

型:

- 数値データ型入力には [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

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

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
