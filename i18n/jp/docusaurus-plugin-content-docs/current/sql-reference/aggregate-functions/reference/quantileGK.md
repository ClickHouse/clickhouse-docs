---
description: 'Computes the quantile of a numeric data sequence using the Greenwald-Khanna
  algorithm.'
sidebar_position: 175
slug: '/sql-reference/aggregate-functions/reference/quantileGK'
title: 'quantileGK'
---




# quantileGK

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を[Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf)アルゴリズムを使用して計算します。Greenwald-Khannaアルゴリズムは、データのストリーム上で分位数を非常に効率的に計算するためのアルゴリズムです。このアルゴリズムは、2001年にMichael GreenwaldとSanjeev Khannaによって導入されました。リアルタイムで大規模なデータのストリーム上で正確な分位数を計算する必要があるデータベースやビッグデータシステムで広く使用されています。このアルゴリズムは非常に効率的で、O(log n)のメモリと、各要素に対してO(log log n)の時間を必要とします（ここでnは入力のサイズを表します）。また、高い精度を提供し、高い確率で近似的な分位数値を提供します。

`quantileGK`はClickHouseの他の分位数関数とは異なり、近似分位数結果の精度を制御することができます。

**構文**

```sql
quantileGK(accuracy, level)(expr)
```

エイリアス: `medianGK`。

**引数**

- `accuracy` — 分位数の精度。定数の正の整数。大きい精度値は誤差が小さくなります。例えば、accuracy引数が100に設定されている場合、計算された分位数の誤差は高い確率で1%を超えません。計算された分位数の精度とアルゴリズムの計算複雑度との間にはトレードオフがあります。大きな精度は分位数を正確に計算するためにより多くのメモリと計算リソースを必要としますが、小さな精度引数は、迅速でメモリ効率の良い計算を可能にしますが、若干の低い精度になります。

- `level` — 分位数のレベル。オプションの引数。0から1までの定数浮動小数点数。デフォルト値: 0.5。`level=0.5`では、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — 数値[データ型](/sql-reference/data-types)または[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。


**返される値**

- 指定したレベルと精度の分位数。


タイプ:

- 数値データ型入力の場合、[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合、[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合、[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

```sql
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


**参照**

- [median]/sql-reference/aggregate-functions/reference/median
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
