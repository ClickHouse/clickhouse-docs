---
slug: '/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated'
sidebar_position: 176
title: 'quantileExactWeightedInterpolated'
description: '数値データ列の分位点を線形補間を用いて計算し、各要素の重みを考慮します。'
---


# quantileExactWeightedInterpolated

数値データ列の [分位点](https://en.wikipedia.org/wiki/Quantile) を線形補間を使用して計算し、各要素の重みを考慮します。

補間値を取得するために、渡された全ての値が配列に統合され、その後、対応する重みに応じてソートされます。分位点の補間は、重みに基づいて累積分布を構築し、次に重みと値を使用して分位点を計算するために線形補間を実行する [加重パーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method) を使用して行われます。

異なるレベルの複数の `quantile*` 関数をクエリで使用すると、内部状態が結合されないため（つまり、クエリは本来の効率性を発揮しません）、この場合は [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用することをお勧めします。

`quantileExactWeightedInterpolated` は `quantileInterpolatedWeighted` よりも正確なので、`quantileExactWeightedInterpolated` の使用を強く推奨します。以下はその例です：

``` sql
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

``` sql
quantileExactWeightedInterpolated(level)(expr, weight)
```

別名：`medianExactWeightedInterpolated`。

**引数**

- `level` — 分位点のレベル。省略可能なパラメータ。0から1の範囲の定数浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲を使用することをお勧めします。デフォルト値：0.5。`level=0.5` の場合、関数は [中央値](https://en.wikipedia.org/wiki/Median) を計算します。
- `expr` — 数値 [データ型](/sql-reference/data-types) 、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) に対するカラム値の式。
- `weight` — シーケンスメンバーの重みを持つカラム。重みは、[符号なし整数型](../../../sql-reference/data-types/int-uint.md) としての値の出現数です。

**返される値**

- 指定されたレベルの分位点。

型：

- 数値データ型の入力の場合は [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

入力テーブル：

``` text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

結果：

``` text
┌─quantileExactWeightedInterpolated(n, val)─┐
│                                       1.5 │
└───────────────────────────────────────────┘
```

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
