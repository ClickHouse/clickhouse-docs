---
description: '数値データ系列の近似的な [分位点](https://en.wikipedia.org/wiki/Quantile) を t-digest アルゴリズムを使用して計算します。'
sidebar_position: 178
slug: /sql-reference/aggregate-functions/reference/quantiletdigest
title: 'quantileTDigest'
---


# quantileTDigest

数値データ系列の近似的な [分位点](https://en.wikipedia.org/wiki/Quantile) を [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) アルゴリズムを使用して計算します。

メモリ消費量は `log(n)` で、`n` は値の数を示します。結果はクエリの実行順序に依存し、決定論的ではありません。

この関数のパフォーマンスは、[quantile](/sql-reference/aggregate-functions/reference/quantile) や [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) のパフォーマンスよりも低いです。状態のサイズと精度の比率に関して、この関数は `quantile` よりもはるかに優れています。

異なるレベルの複数の `quantile*` 関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリは効率的に動作しない可能性があります）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileTDigest(level)(expr)
```

エイリアス: `medianTDigest`。

**引数**

- `level` — 分位点のレベル。オプションのパラメータ。0 から 1 までの定数浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲を推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は [中央値](https://en.wikipedia.org/wiki/Median) を計算します。
- `expr` — 数値 [データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)、または [DateTime](../../../sql-reference/data-types/datetime.md) のカラム値に対する式。

**返される値**

- 指定されたレベルの近似的な分位点。

型:

- 数値データ型の入力に対して [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

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

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
