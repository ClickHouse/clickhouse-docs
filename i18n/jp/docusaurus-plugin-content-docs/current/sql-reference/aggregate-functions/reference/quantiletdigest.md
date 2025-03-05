---
slug: /sql-reference/aggregate-functions/reference/quantiletdigest
sidebar_position: 178
title: "quantileTDigest"
description: "t-digestアルゴリズムを使用して数値データ系列の近似量を計算します。"
---


# quantileTDigest

[t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf)アルゴリズムを使用して数値データ系列の近似[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

メモリ使用量は`log(n)`で、ここで`n`は値の数です。結果はクエリの実行順序に依存し、非決定的です。

この関数のパフォーマンスは、[quantile](../../../sql-reference/aggregate-functions/reference/quantile.md#quantile)や[quantileTiming](../../../sql-reference/aggregate-functions/reference/quantiletiming.md#quantiletiming)のパフォーマンスよりも低いです。状態サイズと精度の比率の観点では、この関数は`quantile`よりもはるかに優れています。

異なるレベルの`quantile*`関数をクエリで複数使用する場合、内部状態は結合されません（つまり、クエリは本来よりも非効率に動作します）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileTDigest(level)(expr)
```

エイリアス: `medianTDigest`。

**引数**

- `level` — 分位数のレベル。オプションのパラメーター。0から1の間の定数浮動小数点数です。`level`の値は`[0.01, 0.99]`の範囲を使用することをお勧めします。デフォルト値: 0.5。`level=0.5`のとき、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)の結果となるカラム値に対する式。

**返される値**

- 指定されたレベルの近似分位数。

型:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

``` sql
SELECT quantileTDigest(number) FROM numbers(10)
```

結果:

``` text
┌─quantileTDigest(number)─┐
│                     4.5 │
└─────────────────────────┘
```

**関連項目**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
