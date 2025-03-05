---
slug: /sql-reference/aggregate-functions/reference/quantiletiming
sidebar_position: 180
title: "quantileTiming"
description: "指定された精度で数値データシーケンスの分位数を計算します。"
---


# quantileTiming

指定された精度で[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定的であり（クエリの処理順序に依存しません）、この関数はウェブページのロード時間やバックエンドの応答時間などの分布を記述するシーケンスでの動作に最適化されています。

異なるレベルの複数の `quantile*` 関数をクエリで使用する場合、内部状態は組み合わされません（つまり、クエリの効率が低下します）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

``` sql
quantileTiming(level)(expr)
```

エイリアス: `medianTiming`。

**引数**

- `level` — 分位数のレベル。任意のパラメータ。0から1の範囲の定数浮動小数点数。`level` 値は `[0.01, 0.99]` の範囲での使用を推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — カラム値に対する[式](../../../sql-reference/syntax.md#syntax-expressions)、[Float\*](../../../sql-reference/data-types/float.md)-型の数値を返します。

    - 負の値が関数に渡された場合、挙動は未定義です。
    - 値が30,000を超える場合（ページのロード時間が30秒を超える場合）、30,000と見なされます。

**精度**

計算が正確であるためには：

- 値の合計数が5670を超えないこと。
- 値の合計数が5670を超え、かつページのロード時間が1024ms未満であること。

それ以外の場合は、計算結果は最も近い16 msの倍数に丸められます。

:::note    
ページのロード時間の分位数を計算するには、この関数は[quantile](../../../sql-reference/aggregate-functions/reference/quantile.md#quantile)よりも効果的かつ正確です。
:::

**戻り値**

- 指定されたレベルの分位数。

型: `Float32`。

:::note    
関数に値が渡されなかった場合（`quantileTimingIf`を使用している場合）、[NaN](../../../sql-reference/data-types/float.md#data_type-float-nan-inf) が返されます。これは、これらのケースをゼロが結果となるケースから区別するための目的があります。[ORDER BY句](../../../sql-reference/statements/select/order-by.md#select-order-by)において `NaN` 値のソートに関する注意事項を参照してください。
:::

**例**

入力テーブル：

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

クエリ：

``` sql
SELECT quantileTiming(response_time) FROM t
```

結果：

``` text
┌─quantileTiming(response_time)─┐
│                           126 │
└───────────────────────────────┘
```

**関連項目**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
