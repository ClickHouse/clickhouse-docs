---
slug: /sql-reference/aggregate-functions/reference/quantiletiming
sidebar_position: 180
title: 'quantileTiming'
description: '指定された精度で数値データシーケンスの分位数を計算します。'
---


# quantileTiming

指定された精度で[分位数](https://en.wikipedia.org/wiki/Quantile)を数値データシーケンスから計算します。

結果は決定論的であり（クエリ処理の順序に依存しません）、この関数はウェブページの読み込み時間やバックエンドの応答時間など、分布を記述するシーケンスでの作業に最適化されています。

クエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態は結合されないため（すなわち、クエリの効率が低下します）、この場合は[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileTiming(level)(expr)
```

エイリアス: `medianTiming`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲を使用することをお勧めします。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — カラム値に対する[式](/sql-reference/syntax#expressions)で、[Float\*](../../../sql-reference/data-types/float.md)型の数値を返します。

    - 負の値が関数に渡された場合、その動作は未定義です。
    - 値が30,000を超える場合（30秒を超えるページ読み込み時間）、30,000であると見なします。

**精度**

計算が正確であるための条件:

- 値の総数が5670を超えない。
- 値の総数が5670を超えるが、ページの読み込み時間が1024ms未満である。

それ以外の場合、計算結果は最も近い16 msの倍数に丸められます。

:::note    
ページの読み込み時間の分位数を計算するには、この関数は[quantile](/sql-reference/aggregate-functions/reference/quantile)よりも効果的かつ正確です。
:::

**返される値**

- 指定されたレベルの分位数。

タイプ: `Float32`。

:::note    
関数に値が渡されない場合（`quantileTimingIf`を使用する場合）、[NaN](/sql-reference/data-types/float#nan-and-inf)が返されます。これは、これらのケースをゼロの結果となるケースと区別するためのものです。`NaN`値のソートに関しては[ORDER BY句](/sql-reference/statements/select/order-by)を参照してください。
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

**参照**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
