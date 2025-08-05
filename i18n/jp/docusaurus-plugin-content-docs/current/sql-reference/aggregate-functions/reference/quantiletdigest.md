---
description: 'Computes an approximate quantile of a numeric data sequence using
  the t-digest algorithm.'
sidebar_position: 178
slug: '/sql-reference/aggregate-functions/reference/quantiletdigest'
title: 'quantileTDigest'
---




# quantileTDigest

数値データ系列の近似[分位数](https://en.wikipedia.org/wiki/Quantile)を[t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf)アルゴリズムを使用して計算します。

メモリ消費量は`log(n)`であり、ここで`n`は値の数です。結果はクエリの実行順序に依存し、非決定的です。

この関数のパフォーマンスは、[quantile](/sql-reference/aggregate-functions/reference/quantile)や[quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)のパフォーマンスよりも低くなります。状態のサイズと精度の比率に関しては、この関数は`quantile`よりもはるかに優れています。

異なるレベルの複数の`quantile*`関数をクエリ内で使用する場合、内部状態は結合されません（つまり、クエリは効率的に機能しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

```sql
quantileTDigest(level)(expr)
```

エイリアス: `medianTDigest`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1までの定数浮動小数点数です。`level`の値は`[0.01, 0.99]`の範囲で使用することをお勧めします。デフォルト値: 0.5。`level=0.5`では、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)の列の値に基づく式。

**返される値**

- 指定されたレベルの近似分位数。

タイプ:

- 数値データ型の入力に対して[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

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

**関連情報**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
