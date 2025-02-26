---
slug: /sql-reference/aggregate-functions/reference/quantileGK
sidebar_position: 175
---

# quantileGK

数値データ系列の[分位数](https://en.wikipedia.org/wiki/Quantile)を[Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf)アルゴリズムを使用して計算します。Greenwald-Khannaアルゴリズムは、データストリーム上で分位数を非常に効率的に計算するためのアルゴリズムです。このアルゴリズムは2001年にMichael GreenwaldとSanjeev Khannaによって導入されました。リアルタイムで大規模なデータストリーム上で正確な分位数を計算する必要があるデータベースやビッグデータシステムで広く使用されています。このアルゴリズムは非常に効率的で、各アイテムあたりO(log n)の空間とO(log log n)の時間しかかかりません（ここでnは入力のサイズです）。また、高い確率で近似的な分位数値を提供するため、非常に正確です。

`quantileGK`は、ユーザーが近似的な分位数結果の精度を制御できるため、ClickHouseの他の分位数関数とは異なります。

**構文**

``` sql
quantileGK(accuracy, level)(expr)
```

エイリアス: `medianGK`.

**引数**

- `accuracy` — 分位数の精度。正の整数を定数として指定します。精度の値が大きいほど、誤差が小さくなります。例えば、精度の引数が100に設定されている場合、計算された分位数は高い確率で1%を超える誤差がありません。計算された分位数の精度とアルゴリズムの計算の複雑さとの間にはトレードオフがあります。より大きな精度は、分位数を正確に計算するためにより多くのメモリと計算リソースを必要としますが、より小さな精度の引数は、若干の精度低下を伴いつつも、より高速でメモリ効率の良い計算を可能にします。

- `level` — 分位数のレベル。オプションのパラメータです。0から1の間の定数浮動小数点数。デフォルト値: 0.5。`level=0.5`の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — 数値の[データ型](../../../sql-reference/data-types/index.md#data_types)、[日付](../../../sql-reference/data-types/date.md)または[日付時間](../../../sql-reference/data-types/datetime.md)のカラム値に対する式です。

**返却値**

- 指定されたレベルと精度の分位数。

タイプ:

- 数値データ型入力の場合：[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合：[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合：[DateTime](../../../sql-reference/data-types/datetime.md)。

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

**関連情報**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [分位数](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
