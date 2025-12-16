---
description: 't-digest アルゴリズムを使用して、数値データ列の近似分位数を計算します。'
sidebar_position: 179
slug: /sql-reference/aggregate-functions/reference/quantiletdigestweighted
title: 'quantileTDigestWeighted'
doc_type: 'reference'
---

# quantileTDigestWeighted {#quantiletdigestweighted}

数値データシーケンスに対して、[t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) アルゴリズムを用いておおよその [分位数](https://en.wikipedia.org/wiki/Quantile) を計算します。各要素の重みを考慮します。最大誤差は 1% です。メモリ消費量は `log(n)` に比例し、ここで `n` は値の数です。

この関数のパフォーマンスは、[quantile](/sql-reference/aggregate-functions/reference/quantile) や [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) よりも劣ります。State サイズと精度の比率という観点では、この関数は `quantile` よりも優れています。

結果はクエリの実行順序に依存し、非決定的です。

1 つのクエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、クエリは本来よりも非効率に動作します）。このような場合は、代わりに [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

:::note
`quantileTDigestWeighted` の使用は、[非常に小さなデータセットに対しては推奨されておらず](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275)、大きな誤差につながる可能性があります。このような場合は、代わりに [`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md) の利用を検討してください。
:::

**構文**

```sql
quantileTDigestWeighted(level)(expr, weight)
```

エイリアス: `medianTDigestWeighted`.

**引数**

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 までの定数の浮動小数点数です。`level` の値として `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` のとき、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
* `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) を結果とするカラム値に対する式。
* `weight` — シーケンス要素の重みを含むカラム。重みは値の出現回数です。

**戻り値**

* 指定したレベルの近似分位数。

型:

* 数値データ型の入力に対しては [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

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

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
