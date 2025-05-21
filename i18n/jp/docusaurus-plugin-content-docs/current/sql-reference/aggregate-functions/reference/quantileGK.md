---
description: '数値データシーケンスの分位数を Greenwald-Khanna アルゴリズムを使用して計算します。'
sidebar_position: 175
slug: /sql-reference/aggregate-functions/reference/quantileGK
title: 'quantileGK'
---


# quantileGK

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を[Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf)アルゴリズムを使用して計算します。Greenwald-Khannaアルゴリズムは、データストリーム上の分位数を非常に効率的に計算するために使用されるアルゴリズムです。このアルゴリズムは、2001年にマイケル・グリーンウォルドとサンジーブ・カンナによって導入されました。リアルタイムで大きなデータストリームにおける正確な分位数を計算する必要があるデータベースやビッグデータシステムで広く使用されています。このアルゴリズムは非常に効率的で、アイテムごとにO(log n)の空間とO(log log n)の時間を要します（ここでnは入力のサイズです）。また、高い精度を提供し、高い確率で近似的な分位数値を提供します。

`quantileGK`は、ユーザーが近似的な分位数結果の精度を制御できるため、ClickHouseの他の分位数関数とは異なります。

**構文**

```sql
quantileGK(accuracy, level)(expr)
```

エイリアス: `medianGK`。

**引数**

- `accuracy` — 分位数の精度。定数の正の整数。精度が大きいほど誤差が少なくなります。たとえば、精度引数が100に設定されている場合、計算された分位数の誤差は高い確率で1%を超えません。計算された分位数の精度とアルゴリズムの計算複雑性との間にはトレードオフがあります。より大きな精度は、分位数を正確に計算するために、より多くのメモリと計算リソースを必要としますが、小さな精度引数では、より迅速でメモリ効率の良い計算が可能ですが、精度はわずかに低くなります。

- `level` — 分位数のレベル。オプションのパラメータ。0から1の間の定数浮動小数点数。デフォルト値: 0.5。`level=0.5`では、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — カラム値に対する式で、数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)、または[DateTime](../../../sql-reference/data-types/datetime.md)を返します。

**返される値**

- 指定されたレベルと精度の分位数。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

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
