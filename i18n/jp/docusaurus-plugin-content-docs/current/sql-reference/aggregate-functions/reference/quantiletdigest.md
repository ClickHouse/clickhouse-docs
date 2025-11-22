---
description: 't-digest アルゴリズムを使用して、数値データシーケンスの近似分位数を計算します。'
sidebar_position: 178
slug: /sql-reference/aggregate-functions/reference/quantiletdigest
title: 'quantileTDigest'
doc_type: 'reference'
---

# quantileTDigest

数値データ系列の概算[分位数](https://en.wikipedia.org/wiki/Quantile)を、[t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) アルゴリズムを用いて計算します。

メモリ消費量は `log(n)` で、ここで `n` は値の個数です。結果はクエリの実行順序に依存し、決定的ではありません。

この関数のパフォーマンスは、[quantile](/sql-reference/aggregate-functions/reference/quantile) や [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) よりも劣ります。状態サイズと精度の比率という観点では、この関数は `quantile` よりもはるかに優れています。

クエリ内で異なるレベルを持つ複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、そのクエリは本来よりも非効率に動作します）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileTDigest(level)(expr)
```

エイリアス: `medianTDigest`。

**引数**

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 の間の定数の浮動小数点数値です。`level` の値として `[0.01, 0.99]` の範囲を指定することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
* `expr` — 数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)、または [DateTime](../../../sql-reference/data-types/datetime.md) を結果とする、列の値に対する式。

**返される値**

* 指定されたレベルにおける近似分位数。

型:

* 数値データ型入力の場合は [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

クエリ:

```sql
SELECT quantileTDigest(number) FROM numbers(10)
```

結果：

```text
┌─quantileTDigest(number)─┐
│                     4.5 │
└─────────────────────────┘
```

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
