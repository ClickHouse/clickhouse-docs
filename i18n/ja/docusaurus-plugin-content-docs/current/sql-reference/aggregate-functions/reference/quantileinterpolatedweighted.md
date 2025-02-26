---
slug: /sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted
sidebar_position: 176
---

# quantileInterpolatedWeighted

数値データのシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を線形補間を使用して計算し、各要素の重みを考慮に入れます。

補間値を得るために、渡されたすべての値を配列にまとめ、それらを対応する重みによってソートします。分位数の補間は、[加重パーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)を使用して、重みに基づいて累積分布を構築し、その後、重みと値を使用して分位数を計算するために線形補間を行います。

異なるレベルで複数の`quantile*`関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリの効率が低下します）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileInterpolatedWeighted(level)(expr, weight)
```

エイリアス: `medianInterpolatedWeighted`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1までの定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲内での使用を推奨します。デフォルト値: 0.5。`level=0.5`の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値の[データ型](../../../sql-reference/data-types/index.md#data_types)、[日付](../../../sql-reference/data-types/date.md)または[日時](../../../sql-reference/data-types/datetime.md)の結果となる列値に対する式。
- `weight` — シーケンスメンバーの重みを持つ列。重みは値の出現回数の数です。

**返される値**

- 指定されたレベルの分位数。

タイプ:

- 数値データ型の入力に対しては[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

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

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
