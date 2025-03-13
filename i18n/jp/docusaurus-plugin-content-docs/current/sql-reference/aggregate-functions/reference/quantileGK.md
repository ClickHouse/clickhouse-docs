---
slug: '/sql-reference/aggregate-functions/reference/quantileGK'
sidebar_position: 175
title: 'quantileGK'
description: '数値データ列の分位数をGreenwald-Khannaアルゴリズムを使用して計算します。'
---


# quantileGK

数値データ列の[分位数](https://en.wikipedia.org/wiki/Quantile)を[Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf)アルゴリズムを使用して計算します。Greenwald-Khannaアルゴリズムは、高効率でデータストリーム上の分位数を計算するためのアルゴリズムで、2001年にマイケル・グリーンウォルドとサンジーブ・カンナによって紹介されました。このアルゴリズムは、リアルタイムで大きなデータストリームに対して正確な分位数を計算する必要があるデータベースやビッグデータシステムで広く使用されています。アルゴリズムは非常に効率的で、アイテムごとにO(log n)のスペースとO(log log n)の時間がかかります（ここでnは入力のサイズです）。また、非常に高精度で、高い確率で近似分位数値を提供します。

`quantileGK`は、ユーザーが近似分位数結果の精度を制御できるため、ClickHouseの他の分位数関数とは異なります。

**構文**

``` sql
quantileGK(accuracy, level)(expr)
```

別名: `medianGK`。

**引数**

- `accuracy` — 分位数の精度。定数の正の整数。精度の値が大きいほど誤差が少なくなります。例えば、精度引数が100に設定されている場合、計算された分位数の誤差は、高い確率で1%を超えないことが保証されます。計算された分位数の精度とアルゴリズムの計算複雑性の間にはトレードオフがあります。より大きな精度は、正確に分位数を計算するためにより多くのメモリと計算リソースを必要としますが、より小さな精度引数は、計算をより速く、よりメモリ効率よくすることができますが、わずかに低い精度になります。

- `level` — 分位数のレベル。オプションのパラメータ。0から1の間の定数浮動小数点数。デフォルト値: 0.5。`level=0.5`のとき、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — 数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対しての式です。

**戻り値**

- 指定されたレベルと精度の分位数。

タイプ:

- [Float64](../../../sql-reference/data-types/float.md)は数値データ型の入力。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

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

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
