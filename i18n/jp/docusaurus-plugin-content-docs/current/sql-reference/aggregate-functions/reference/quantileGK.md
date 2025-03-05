---
slug: /sql-reference/aggregate-functions/reference/quantileGK
sidebar_position: 175
title: "quantileGK"
description: "数値データ列の分位点を Greenwald-Khanna アルゴリズムを使用して計算します。"
---


# quantileGK

[分位点](https://en.wikipedia.org/wiki/Quantile)を[Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf)アルゴリズムを用いて数値データ列から計算します。Greenwald-Khannaアルゴリズムは、データストリーム上で分位点を非常に効率的に計算するためのアルゴリズムです。これは、2001年にマイケル・グリーンウォルドとサンジーヴ・カンナによって導入されました。リアルタイムで大規模データストリーム上で正確な分位点を計算する必要があるデータベースやビッグデータシステムで広く使用されています。このアルゴリズムは非常に効率的で、各アイテムにつきO(log n)の空間とO(log log n)の時間を要します（ここでnは入力のサイズです）。また、高い確率で近似的な分位点値を提供するため、非常に正確です。

`quantileGK`は、近似的な分位点結果の精度を制御できるため、ClickHouseの他の分位点関数とは異なります。

**構文**

``` sql
quantileGK(accuracy, level)(expr)
```

別名: `medianGK`.

**引数**

- `accuracy` — 分位点の精度。定数の正の整数。精度値が大きいほど誤差が少なくなります。例えば、精度の引数が100に設定されている場合、計算された分位点の誤差は高い確率で1%を超えません。計算された分位点の精度とアルゴリズムの計算複雑性の間にはトレードオフがあります。大きな精度は、分位点を正確に計算するためにより多くのメモリと計算リソースを必要とし、小さな精度の引数は、若干精度が低下しますが、より高速でメモリ効率の良い計算が可能です。

- `level` — 分位点のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。デフォルト値: 0.5。`level=0.5`では、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — 数値[データ型](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。


**返り値**

- 指定されたレベルと精度の分位点。


型:

- 数値データ型入力の場合: [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合: [Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合: [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

``` sql
SELECT quantileGK(1, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(1, 0.25)(plus(number, 1))─┐
│                                    1 │
└──────────────────────────────────────┘

SELECT quantileGK(10, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(10, 0.25)(plus(number, 1))─┐
│                                   156 │
└───────────────────────────────────────┘

SELECT quantileGK(100, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(100, 0.25)(plus(number, 1))─┐
│                                    251 │
└────────────────────────────────────────┘

SELECT quantileGK(1000, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(1000, 0.25)(plus(number, 1))─┐
│                                     249 │
└─────────────────────────────────────────┘
```


**関連項目**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
