---
description: 't-digest アルゴリズムを使用して数値データ系列の近似的な分位数を計算します。'
sidebar_position: 178
slug: /sql-reference/aggregate-functions/reference/quantiletdigest
title: 'quantileTDigest'
doc_type: 'reference'
---

# quantileTDigest

[t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) アルゴリズムを使用して、数値データ列の近似的な[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

メモリ消費量は `log(n)` であり、`n` は値の個数です。結果はクエリの実行順序に依存し、決定論的ではありません。

この関数のパフォーマンスは、[quantile](/sql-reference/aggregate-functions/reference/quantile) や [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) のパフォーマンスより劣ります。状態サイズと精度の比率という観点では、この関数は `quantile` よりも優れています。

異なるレベルを持つ複数の `quantile*` 関数を 1 つのクエリで使用する場合、内部状態は結合されません（つまり、そのクエリは本来可能なものよりも効率が低くなります）。このような場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileTDigest(level)(expr)
```

エイリアス: `medianTDigest`。

**引数**

* `level` — 分位数のレベル。省略可能なパラメーター。0 から 1 までの定数の浮動小数点数。`level` の値には `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` のとき、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
* `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) を返す、列値に対して適用される式。

**戻り値**

* 指定したレベルの近似分位数。

型:

* 数値データ型入力の場合は [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT quantileTDigest(number) FROM numbers(10)
```

結果:

```text
┌─quantileTDigest(number)─┐
│                     4.5 │
└─────────────────────────┘
```

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
