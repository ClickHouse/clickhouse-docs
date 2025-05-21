description: '数値データのシーケンスの分位数を、各要素の重みを考慮して線形補間を使用して計算します。'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated
title: 'quantileExactWeightedInterpolated'
```


# quantileExactWeightedInterpolated

数値データのシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を、各要素の重みを考慮して線形補間を使用して計算します。

補間値を取得するために、すべての渡された値は配列に結合され、その後、対応する重みによってソートされます。分位数補間は、重みに基づく累積分布を構築することによって[加重パーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)を使用して実行され、その後、重みと値を使用して分位数を計算するために線形補間が行われます。

異なるレベルの`quantile*`関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリは本来よりも非効率に動作します）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

`quantileExactWeightedInterpolated`は`quantileInterpolatedWeighted`よりも正確であるため、`quantileExactWeightedInterpolated`の使用を強くお勧めします。以下はその例です：

```sql
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

```sql
quantileExactWeightedInterpolated(level)(expr, weight)
```

エイリアス: `medianExactWeightedInterpolated`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲内を使用することをお勧めします。デフォルト値: 0.5。`level=0.5`のとき、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)のカラム値に対する式、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — シーケンスメンバーの重みを持つカラム。重みは、[符号なし整数型](../../../sql-reference/data-types/int-uint.md)の値の出現回数です。

**返される値**

- 指定されたレベルの分位数。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

入力テーブル：

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

結果：

```text
┌─quantileExactWeightedInterpolated(n, val)─┐
│                                       1.5 │
└───────────────────────────────────────────┘
```

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
