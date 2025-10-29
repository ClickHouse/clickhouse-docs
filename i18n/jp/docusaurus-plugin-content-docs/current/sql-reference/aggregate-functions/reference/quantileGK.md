---
'description': '数値データシーケンスの分位数をGreenwald-Khannaアルゴリズムを使用して計算します。'
'sidebar_position': 175
'slug': '/sql-reference/aggregate-functions/reference/quantileGK'
'title': 'quantileGK'
'doc_type': 'reference'
---


# quantileGK

数値データ列の[分位数](https://en.wikipedia.org/wiki/Quantile)を[Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf)アルゴリズムを使用して計算します。Greenwald-Khannaアルゴリズムは、データストリーム上で非常に効率的に分位数を計算するためのアルゴリズムです。これは2001年にMichael GreenwaldとSanjeev Khannaによって導入されました。このアルゴリズムは、リアルタイムで大規模なデータストリーム上で正確な分位数を計算する必要があるデータベースやビッグデータシステムで広く使用されています。このアルゴリズムは非常に効率的で、O(log n)の空間とO(log log n)の時間（ここでnは入力のサイズ）で各アイテムを処理します。また、高い確率で近似的な分位数値を提供する高い精度も持っています。

`quantileGK`は、ユーザーが近似分位数結果の精度を制御できるため、ClickHouseの他の分位数関数とは異なります。

**構文**

```sql
quantileGK(accuracy, level)(expr)
```

エイリアス: `medianGK`.

**引数**

- `accuracy` — 分位数の精度。定数正の整数。精度値が大きいほど誤差が少なくなります。たとえば、accuracy引数が100に設定されている場合、計算された分位数の誤差は高い確率で1%を超えることはありません。計算される分位数の精度とアルゴリズムの計算の複雑さの間にはトレードオフがあります。精度を高くするには、分位数を正確に計算するためにさらに多くのメモリと計算リソースが必要になり、精度引数を小さくすると、計算はより高速でメモリ効率も向上しますが、精度はやや低下します。

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。デフォルト値: 0.5。`level=0.5`のとき、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — 数値の[データ型](/sql-reference/data-types)または[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)の値となる列の値に対する式。

**返される値**

- 指定したレベルと精度の分位数。

タイプ:

- 数値データタイプの入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
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

**関連情報**

- [median](sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
