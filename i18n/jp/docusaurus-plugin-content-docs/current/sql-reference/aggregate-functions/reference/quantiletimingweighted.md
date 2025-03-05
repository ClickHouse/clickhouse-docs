---
slug: /sql-reference/aggregate-functions/reference/quantiletimingweighted
sidebar_position: 181
title: "quantileTimingWeighted"
description: "指定された精度で、各シーケンスメンバーの重みを考慮して数値データシーケンスの分位点を計算します。"
---


# quantileTimingWeighted

指定された精度で、各シーケンスメンバーの重みを考慮して[分位点](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定論的であり（クエリ処理の順序には依存しません）、ウェブページの読み込み時間やバックエンドの応答時間のような分布を記述するシーケンスの処理に最適化されています。

異なるレベルの`quantile*`関数を複数使用する場合、内部状態は結合されません（すなわち、クエリは最適な効率で動作しません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileTimingWeighted(level)(expr, weight)
```

エイリアス: `medianTimingWeighted`.

**引数**

- `level` — 分位点のレベル。オプションのパラメーター。0から1の範囲の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲を推奨します。デフォルト値: 0.5。`level=0.5`では、[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — [式](/sql-reference/syntax#expressions)で、カラムの値に対して[Float\*](../../../sql-reference/data-types/float.md)-型の数値を返します。

        - 負の値が関数に渡された場合、その動作は未定義です。
        - 値が30,000を超える場合（ページの読み込み時間が30秒を超える）、30,000として扱われます。

- `weight` — シーケンス要素の重みを持つカラム。重みは値の出現回数です。

**精度**

計算は次の条件で正確です：

- 値の合計数が5670を超えない。
- 値の合計数が5670を超えるが、ページの読み込み時間が1024ms未満である。

それ以外の場合、計算結果は最も近い16 msの倍数に丸められます。

:::note    
ページ読み込み時間の分位点を計算するために、この関数は[quantile](../../../sql-reference/aggregate-functions/reference/quantile.md#quantile)よりも効果的で正確です。
:::

**戻り値**

- 指定されたレベルの分位点。

型: `Float32`.

:::note    
関数に値が渡されない場合（`quantileTimingIf`を使用する場合）、[NaN](../../../sql-reference/data-types/float.md#data_type-float-nan-inf)が返されます。これは、ゼロになるケースと区別するためのものです。[ORDER BY句](../../../sql-reference/statements/select/order-by.md#select-order-by)には、`NaN`値のソートに関する注意があります。
:::

**例**

入力テーブル:

``` text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

クエリ:

``` sql
SELECT quantileTimingWeighted(response_time, weight) FROM t
```

結果:

``` text
┌─quantileTimingWeighted(response_time, weight)─┐
│                                           112 │
└───────────────────────────────────────────────┘
```


# quantilesTimingWeighted

`quantileTimingWeighted`と同じですが、分位点レベルの複数のパラメータを受け取り、複数の分位点値で満たされた配列を返します。

**例**

入力テーブル:

``` text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

クエリ:

``` sql
SELECT quantilesTimingWeighted(0,5, 0.99)(response_time, weight) FROM t
```

結果:

``` text
┌─quantilesTimingWeighted(0.5, 0.99)(response_time, weight)─┐
│ [112,162]                                                 │
└───────────────────────────────────────────────────────────┘
```

**参照**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
