---
description: 'Greenwald-Khanna アルゴリズムを使用して、数値データ系列の分位数を計算します。'
sidebar_position: 175
slug: /sql-reference/aggregate-functions/reference/quantileGK
title: 'quantileGK'
doc_type: 'reference'
---

# quantileGK

数値データ列の[分位数](https://en.wikipedia.org/wiki/Quantile)を、[Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf) アルゴリズムを用いて計算します。Greenwald-Khanna アルゴリズムは、データストリーム上の分位数を高効率に計算するためのアルゴリズムです。このアルゴリズムは 2001 年に Michael Greenwald と Sanjeev Khanna によって提案されました。大規模なデータストリームに対してリアルタイムに高精度な分位数計算が必要とされるデータベースやビッグデータシステムで広く利用されています。このアルゴリズムは非常に効率的であり、必要とする空間計算量は O(log n)、各要素あたりの時間計算量は O(log log n) です（n は入力サイズ）。また精度も非常に高く、高い確率で近似的な分位数値を提供します。

`quantileGK` は、近似分位数の結果の精度をユーザーが制御できるという点で、ClickHouse の他の分位数関数とは異なります。

**構文**

```sql
quantileGK(accuracy, level)(expr)
```

別名: `medianGK`。

**引数**

* `accuracy` — 分位数の精度。正の整数定数。値が大きいほど誤差は小さくなります。例えば、`accuracy` 引数を 100 に設定すると、計算された分位数の誤差は高い確率で 1% を超えません。計算された分位数の精度とアルゴリズムの計算量の間にはトレードオフがあります。accuracy の値を大きくすると分位数をより正確に計算できますが、その分多くのメモリと計算リソースが必要になります。一方で、accuracy の値を小さくすると、若干精度は低下しますが、より高速かつメモリ効率の高い計算が可能です。

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 の範囲の定数浮動小数点数。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

* `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) を結果とする列値に対する式。

**戻り値**

* 指定されたレベルと精度の分位数。

型:

* 数値データ型を入力とする場合は [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

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

**関連項目**

* [median]/sql-reference/aggregate-functions/reference/median
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
