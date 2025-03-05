---
slug: /sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted
sidebar_position: 176
title: "quantileInterpolatedWeighted"
description: "数値データシーケンスの分位数を線形補間を使用して計算し、各要素の重みを考慮に入れます。"
---


# quantileInterpolatedWeighted

数値データシーケンスの [分位数](https://en.wikipedia.org/wiki/Quantile) を線形補間を使用して計算し、各要素の重みを考慮に入れます。

補間値を取得するために、すべての渡された値が配列にまとめられ、その後、対応する重みによってソートされます。分位数補間は、重みに基づいて累積分布を構築し、その後、重みと値を使用して分位数を計算するための線形補間が行われる [加重パーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method) を使用して行われます。

異なるレベルの `quantile*` 関数をクエリ内で複数使用する場合、内部状態は結合されません（つまり、クエリは本来の効率よりも低下します）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

``` sql
quantileInterpolatedWeighted(level)(expr, weight)
```

エイリアス: `medianInterpolatedWeighted`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level` 値は `[0.01, 0.99]` の範囲内を使用することをお勧めします。デフォルト値: 0.5。`level=0.5` の場合、関数は [中央値](https://en.wikipedia.org/wiki/Median) を計算します。
- `expr` — 数値 [データ型](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) の結果を持つカラム値に対する式。
- `weight` — シーケンスメンバーの重みを持つカラム。重みは値の出現回数です。

**戻り値**

- 指定されたレベルの分位数。

タイプ:

- 数値データ型の入力の場合は [Float64](../../../sql-reference/data-types/float.md)。
- 入力値の型が `Date` の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値の型が `DateTime` の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

入力テーブル:

``` text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

クエリ:

``` sql
SELECT quantileInterpolatedWeighted(n, val) FROM t
```

結果:

``` text
┌─quantileInterpolatedWeighted(n, val)─┐
│                                    1 │
└──────────────────────────────────────┘
```

**参照**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
