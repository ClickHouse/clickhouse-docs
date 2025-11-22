---
description: '各要素の重みを考慮し、線形補間を用いて数値データシーケンスの分位数を計算します。'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted
title: 'quantileInterpolatedWeighted'
doc_type: 'reference'
---

# quantileInterpolatedWeighted

各要素の重みを考慮し、線形補間を用いて数値データ列の[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

補間値を求めるために、まず渡されたすべての値を配列にまとめ、その配列を対応する重みによってソートします。次に、重みに基づいて累積分布を構成し、[重み付きパーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)に従って、重みと値を用いた線形補間を行うことで分位数補間を行います。

クエリ内で複数の `quantile*` 関数を異なるレベル（分位点）で使用する場合、内部状態は結合されません（つまり、クエリは本来可能なほど効率的には動作しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileInterpolatedWeighted(level)(expr, weight)
```

Alias: `medianInterpolatedWeighted`.

**Arguments**

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 の間の定数浮動小数点数。`level` の値として `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は [median](https://en.wikipedia.org/wiki/Median) を計算します。
* `expr` — 列値に対する式で、数値型の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)、または [DateTime](../../../sql-reference/data-types/datetime.md) を返します。
* `weight` — シーケンスの要素の重みを持つ列。重みは、値の出現回数です。

**Returned value**

* 指定したレベルの分位数。

Type:

* 数値データ型の入力に対しては [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**Example**

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
