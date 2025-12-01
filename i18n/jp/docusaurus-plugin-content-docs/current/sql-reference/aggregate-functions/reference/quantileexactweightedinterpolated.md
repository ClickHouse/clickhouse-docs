---
description: '各要素の重みを考慮した線形補間により、数値データ列の分位数を計算します。'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated
title: 'quantileExactWeightedInterpolated'
doc_type: 'reference'
---

# quantileExactWeightedInterpolated {#quantileexactweightedinterpolated}

数値データ列の各要素の重みを考慮し、線形補間を用いて[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

補間値を求めるために、すべての入力値を配列にまとめ、それぞれに対応する重みに基づいてソートします。次に、重みに基づいて累積分布を構築し、その上で[重み付きパーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)を用いて分位数の補間を行います。このとき、重みと値を用いて線形補間を実行し、分位数を計算します。

クエリ内で異なるレベルを持つ複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、そのクエリは本来可能な場合よりも非効率に動作します）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

`quantileInterpolatedWeighted` よりも `quantileExactWeightedInterpolated` の使用を強く推奨します。`quantileExactWeightedInterpolated` の方が `quantileInterpolatedWeighted` よりも高い精度を持つためです。以下に例を示します。

```sql
SELECT
    quantileExactWeightedInterpolated(0.99)(number, 1),
    quantile(0.99)(number),
    quantileInterpolatedWeighted(0.99)(number, 1)
FROM numbers(9)
┌─quantileExactWeightedInterpolated(0.99)(number, 1)─┬─quantile(0.99)(number)─┬─quantileInterpolatedWeighted(0.99)(number, 1)─┐
│                                               7.92 │                   7.92 │                                             8 │
└────────────────────────────────────────────────────┴────────────────────────┴───────────────────────────────────────────────┘
```

**構文**

```sql
quantileExactWeightedInterpolated(level)(expr, weight)
```

エイリアス: `medianExactWeightedInterpolated`.

**引数**

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 の間の定数の浮動小数点数値。`level` の値として `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
* `expr` — 列の値に対して適用され、結果として数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) を返す式。
* `weight` — シーケンス要素の重みを格納する列。重みは、その値の出現回数を表す[符号なし整数型](../../../sql-reference/data-types/int-uint.md)の数値です。

**戻り値**

* 指定したレベルの分位数。

型:

* 数値データ型入力の場合は [Float64](../../../sql-reference/data-types/float.md)。
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

結果:

```text
┌─quantileExactWeightedInterpolated(n, val)─┐
│                                       1.5 │
└───────────────────────────────────────────┘
```

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
