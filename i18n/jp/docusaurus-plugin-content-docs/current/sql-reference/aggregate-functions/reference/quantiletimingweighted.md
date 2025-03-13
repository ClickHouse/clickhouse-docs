---
slug: /sql-reference/aggregate-functions/reference/quantiletimingweighted
sidebar_position: 181
title: 'quantileTimingWeighted'
description: '指定された精度で、各シーケンスメンバーの重みを考慮して数値データのシーケンスの分位数を計算します。'
---


# quantileTimingWeighted

指定された精度で、各シーケンスメンバーの重みを考慮して[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定的です（クエリ処理の順序に依存しません）。この関数は、ウェブページの読み込み時間やバックエンドの応答時間のような分布を表すシーケンスでの作業に最適化されています。

異なるレベルの`quantile*`関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリは本来よりも効率が悪くなります）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileTimingWeighted(level)(expr, weight)
```

エイリアス: `medianTimingWeighted`。

**引数**

- `level` — 分位数のレベル。オプションのパラメーター。0から1の間の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲で使用することを推奨します。デフォルト値: 0.5。`level=0.5`の時に関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — [式](/sql-reference/syntax#expressions)で、カラム値の上に浮動小数点数[Float\*](../../../sql-reference/data-types/float.md)-型を返します。

        - 負の値が関数に渡されると、動作は未定義です。
        - 値が30,000（ページの読み込み時間が30秒以上）の場合、30,000と見なされます。

- `weight` — シーケンス要素の重さを持つカラム。重さは値の出現回数を表します。

**精度**

計算は次の場合に正確です：

- 値の合計数が5670を超えない。
- 値の合計数が5670を超えるが、ページの読み込み時間が1024ms未満である。

それ以外の場合、計算結果は最寄りの16msの倍数に丸められます。

:::note    
ページの読み込み時間の分位数を計算するために、この関数は[quantile](/sql-reference/aggregate-functions/reference/quantile)よりも効果的かつ正確です。
:::

**戻り値**

- 指定されたレベルの分位数。

タイプ: `Float32`。

:::note    
関数に値が渡されない場合（`quantileTimingIf`を使用している場合）、[NaN](/sql-reference/data-types/float#nan-and-inf)が返されます。これはゼロとなるケースからこれらのケースを区別するための目的があります。`NaN`値のソートに関する注意は[ORDER BY句](/sql-reference/statements/select/order-by)を参照してください。
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

`quantileTimingWeighted`と同じですが、複数の分位レベルをパラメーターとして受け取り、それらの分位数の多くの値で満たされた配列を返します。

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

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
