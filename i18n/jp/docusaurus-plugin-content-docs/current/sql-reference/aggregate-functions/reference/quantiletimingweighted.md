---
slug: /sql-reference/aggregate-functions/reference/quantiletimingweighted
sidebar_position: 181
title: "quantileTimingWeighted"
description: "指定された精度で、各シーケンスメンバーの重みに基づいて数値データシーケンスの分位点を計算します。"
---


# quantileTimingWeighted

指定された精度で、各シーケンスメンバーの重みに基づいて数値データシーケンスの[分位点](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定的であり（クエリ処理順序に依存しません）、この関数は、ウェブページの読み込み時間やバックエンドレスポンスタイムのような分布を記述するシーケンスでの動作に最適化されています。

異なるレベルの複数の `quantile*` 関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリの効率が低下します）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

``` sql
quantileTimingWeighted(level)(expr, weight)
```

別名: `medianTimingWeighted`。

**引数**

- `level` — 分位点のレベル。オプションのパラメータ。0から1の間の定数浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — [式](../../../sql-reference/syntax.md#syntax-expressions)（カラム値上）で、[Float\*](../../../sql-reference/data-types/float.md)型の数値を返します。

        - 負の値が関数に渡されると、動作は未定義です。
        - 値が30,000を超える場合（ページの読み込み時間が30秒を超える場合）、30,000であるとみなされます。

- `weight` — シーケンス要素の重みを持つカラム。重みは値の出現回数です。

**精度**

計算が正確であるのは以下の場合です：

- 値の総数が5670を超えない。
- 値の総数が5670を超えるが、ページの読み込み時間が1024ms未満である。

それ以外の場合、計算結果は16msの最も近い倍数に丸められます。

:::note    
ページの読み込み時間の分位点を計算するためには、この関数は[quantile](../../../sql-reference/aggregate-functions/reference/quantile.md#quantile)よりも効果的で正確です。
:::

**返される値**

- 指定されたレベルの分位点。

型: `Float32`。

:::note    
関数に値が渡されない場合（`quantileTimingIf`を使用する場合）、[NaN](../../../sql-reference/data-types/float.md#data_type-float-nan-inf)が返されます。これは、これらのケースをゼロになるケースと区別するためのものです。[ORDER BY句](../../../sql-reference/statements/select/order-by.md#select-order-by)での `NaN` 値の並べ替えについての注意を参照してください。
:::

**例**

入力テーブル：

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

クエリ：

``` sql
SELECT quantileTimingWeighted(response_time, weight) FROM t
```

結果：

``` text
┌─quantileTimingWeighted(response_time, weight)─┐
│                                           112 │
└───────────────────────────────────────────────┘
```


# quantilesTimingWeighted

`quantileTimingWeighted` と同様ですが、分位点レベルの複数のパラメータを受け取り、多くの分位点の値で満たされた配列を返します。

**例**

入力テーブル：

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

クエリ：

``` sql
SELECT quantilesTimingWeighted(0,5, 0.99)(response_time, weight) FROM t
```

結果：

``` text
┌─quantilesTimingWeighted(0.5, 0.99)(response_time, weight)─┐
│ [112,162]                                                 │
└───────────────────────────────────────────────────────────┘
```

**関連項目**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
