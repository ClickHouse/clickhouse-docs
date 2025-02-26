---
slug: /sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated
sidebar_position: 176
---

# quantileExactWeightedInterpolated

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を線形補間を用いて計算し、各要素の重みを考慮します。

補間値を取得するために、渡されたすべての値が配列に結合され、その後、それぞれの重みによってソートされます。次に、重みに基づく累積分布を構築し、[加重パーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)を使用して分位数補間が行われます。そして、重みと値を用いて分位数を計算するための線形補間が実行されます。

クエリで異なるレベルの`quantile*`関数を複数使用する場合、内部状態は結合されません（つまり、クエリの効率が低下します）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

`quantileExactWeightedInterpolated`は`quantileInterpolatedWeighted`よりも正確であるため、`quantileExactWeightedInterpolated`を使用することを強く推奨します。以下に例を示します:

``` sql
SELECT
    quantileExactWeightedInterpolated(0.99)(number, 1),
    quantile(0.99)(number),
    quantileInterpolatedWeighted(0.99)(number, 1)
FROM numbers(9)


┌─quantileExactWeightedInterpolated(0.99)(number, 1)─┬─quantile(0.99)(number)─┬─quantileInterpolatedWeighted(0.99)(number, 1)─┐
│                                               7.92 │                   7.92 │                                             8 │
└────────────────────────────────────────────────────┴────────────────────────┴───────────────────────────────────────────────┘
```

**構文**

``` sql
quantileExactWeightedInterpolated(level)(expr, weight)
```

エイリアス: `medianExactWeightedInterpolated`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1までの定数浮動小数点数。`[0.01, 0.99]`の範囲の`level`値を使用することを推奨します。デフォルト値: 0.5。`level=0.5`では、[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](../../../sql-reference/data-types/index.md#data_types)か[日付](../../../sql-reference/data-types/date.md)または[日時](../../../sql-reference/data-types/datetime.md)に結果するカラム値に対する式。
- `weight` — シーケンスのメンバーの重みを持つカラム。重みは[符号なし整数型](../../../sql-reference/data-types/int-uint.md)での値の出現回数です。

**返される値**

- 指定されたレベルの分位数。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
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

結果:

``` text
┌─quantileExactWeightedInterpolated(n, val)─┐
│                                       1.5 │
└───────────────────────────────────────────┘
```

**関連項目**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
