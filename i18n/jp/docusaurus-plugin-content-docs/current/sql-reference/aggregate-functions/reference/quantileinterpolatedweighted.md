---
slug: /sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted
sidebar_position: 176
title: 'quantileInterpolatedWeighted'
description: '数値データ系列の分位数を線形補間を用いて計算し、各要素の重みを考慮します。'
---


# quantileInterpolatedWeighted

[分位数](https://en.wikipedia.org/wiki/Quantile)を線形補間を用いて計算し、各要素の重みを考慮します。

補間値を取得するために、渡されたすべての値は配列に結合され、その後対応する重みによってソートされます。次に、[重み付けパーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)を使用して分位数補間が実行され、重みを元に累積分布が構築され、その後、重みと値を使用して分位数を計算するための線形補間が実行されます。

クエリ内で異なるレベルを持つ複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、クエリの効率が低下します）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

``` sql
quantileInterpolatedWeighted(level)(expr, weight)
```

エイリアス: `medianInterpolatedWeighted`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲内を使用することをお勧めします。デフォルト値: 0.5。`level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)の結果を生成するカラム値に対する式。
- `weight` — シーケンスメンバーの重みのカラム。重みは値の出現回数です。

**戻り値**

- 指定されたレベルの分位数。

型:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

入力テーブル:

``` text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

クエリ:

``` sql
SELECT quantileInterpolatedWeighted(n, val) FROM t
```

結果:

``` text
┌─quantileInterpolatedWeighted(n, val)─┐
│                                    1 │
└──────────────────────────────────────┘
```

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
