---
slug: /sql-reference/aggregate-functions/reference/quantiletiming
sidebar_position: 180
title: "quantileTiming"
description: "指定された精度で数値データシーケンスの分位点を計算します。"
---


# quantileTiming

指定された精度で数値データシーケンスの[分位点](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定的です（クエリ処理の順序に依存しません）。この関数は、ウェブページの読み込み時間やバックエンド応答時間のような分布を記述するシーケンスでの動作に最適化されています。

クエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態は統合されません（つまり、クエリは効率が悪くなります）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

``` sql
quantileTiming(level)(expr)
```

エイリアス: `medianTiming`.

**引数**

- `level` — 分位点のレベル。オプションのパラメーター。0から1の範囲の定数浮動小数点数。`level` 値は `[0.01, 0.99]` の範囲を使用することをお勧めします。デフォルト値: 0.5。 `level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — カラム値に対する[式](/sql-reference/syntax#expressions)で、[Float\*](../../../sql-reference/data-types/float.md)-型の数値を返します。

    - 負の値が関数に渡された場合、動作は未定義です。
    - 値が30,000を超える場合（ページの読み込み時間が30秒以上）、30,000と見なされます。

**精度**

計算が正確である条件は以下の通りです：

- 値の総数が5670を超えない場合。
- 値の総数が5670を超えるが、ページの読み込み時間が1024ms未満の場合。

それ以外の場合は、計算結果は最も近い16msの倍数に丸められます。

:::note    
ページの読み込み時間の分位点を計算する場合、この関数は[quantile](../../../sql-reference/aggregate-functions/reference/quantile.md#quantile)よりも効果的かつ正確です。
:::

**返される値**

- 指定されたレベルの分位点。

型: `Float32`。

:::note    
関数に値が渡されない場合（`quantileTimingIf` を使用している時）、[NaN](../../../sql-reference/data-types/float.md#data_type-float-nan-inf)が返されます。これは、これらのケースがゼロの結果となるケースと区別される目的があります。[ORDER BY句](../../../sql-reference/statements/select/order-by.md#select-order-by)における `NaN` 値のソートに関する注意も参照してください。
:::

**例**

入力テーブル:

``` text
┌─response_time─┐
│            72 │
│           112 │
│           126 │
│           145 │
│           104 │
│           242 │
│           313 │
│           168 │
│           108 │
└───────────────┘
```

クエリ:

``` sql
SELECT quantileTiming(response_time) FROM t
```

結果:

``` text
┌─quantileTiming(response_time)─┐
│                           126 │
└───────────────────────────────┘
```

**関連情報**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
