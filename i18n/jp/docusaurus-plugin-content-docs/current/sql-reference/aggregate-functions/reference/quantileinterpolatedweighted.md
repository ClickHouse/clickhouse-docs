---
description: '各要素の重みを考慮し、線形補間を用いて数値データシーケンスの分位数を計算します。'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted
title: 'quantileInterpolatedWeighted'
doc_type: 'reference'
---

# quantileInterpolatedWeighted

数値データ列の[分位数](https://en.wikipedia.org/wiki/Quantile)を、各要素の重みを考慮した線形補間により計算します。

補間値を求めるために、渡されたすべての値を1つの配列にまとめ、その対応する重みに基づいてソートします。次に、重みに基づいて累積分布を構築し、その上で[重み付きパーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)を用いて分位数の補間を行います。このとき、重みと値を用いて線形補間を実行し、分位数を計算します。

1つのクエリ内で複数の `quantile*` 関数を異なるレベル（分位点）で使用すると、内部状態は結合されません（つまり、そのクエリは本来よりも効率が低くなります）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileInterpolatedWeighted(level)(expr, weight)
```

Alias: `medianInterpolatedWeighted`.

**引数**

* `level` — 分位数レベル。省略可能なパラメータ。0 以上 1 以下の定数の浮動小数点数です。`level` の値には `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
* `expr` — 列の値に対して評価され、数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)、または [DateTime](../../../sql-reference/data-types/datetime.md) のいずれかになる式。
* `weight` — シーケンス要素の重みを持つ列。重みは値の出現回数を表す数値です。

**返される値**

* 指定したレベルの分位数。

型:

* 数値データ型の入力に対しては [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

入力テーブル:

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

クエリ：

```sql
SELECT quantileInterpolatedWeighted(n, val) FROM t
```

結果:

```text
┌─quantileInterpolatedWeighted(n, val)─┐
│                                    1 │
└──────────────────────────────────────┘
```

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
