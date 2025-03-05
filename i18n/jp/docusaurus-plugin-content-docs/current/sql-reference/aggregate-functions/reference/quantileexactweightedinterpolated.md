---
slug: /sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated
sidebar_position: 176
title: "quantileExactWeightedInterpolated"
description: "重みを考慮して線形補間を使用して数値データ列の分位点を計算します。"
---


# quantileExactWeightedInterpolated

重みを考慮して線形補間を使用して数値データ列の[分位点](https://en.wikipedia.org/wiki/Quantile)を計算します。

補間値を取得するために、渡されたすべての値は配列に結合され、その後対応する重みによってソートされます。次に、重みに基づいて累積分布を構築し、重みと値を使用して分位点を計算するために線形補間が行われます。

クエリ内で異なるレベルの`quantile*`関数を複数使用する場合、内部状態は結合されません（つまり、クエリは効率的ではありません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

`quantileExactWeightedInterpolated`は`quantileInterpolatedWeighted`よりも正確であるため、`quantileInterpolatedWeighted`の代わりに`quantileExactWeightedInterpolated`を使用することを強くお勧めします。以下は例です：

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

エイリアス: `medianExactWeightedInterpolated`。

**引数**

- `level` — 分位点のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲での使用をお勧めします。デフォルト値: 0.5。`level=0.5`の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)を結果として得る列値に対する式。
- `weight` — シーケンスメンバーの重みを含むカラム。重みは[符号なし整数型](../../../sql-reference/data-types/int-uint.md)による値の出現数です。

**返される値**

- 指定されたレベルの分位点。

型:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型である場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型である場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

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

結果:

``` text
┌─quantileExactWeightedInterpolated(n, val)─┐
│                                       1.5 │
└───────────────────────────────────────────┘
```

**関連項目**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
