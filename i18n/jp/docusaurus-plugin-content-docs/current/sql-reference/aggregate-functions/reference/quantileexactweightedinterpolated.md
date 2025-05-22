---
'description': 'Computes quantile of a numeric data sequence using linear interpolation,
  taking into account the weight of each element.'
'sidebar_position': 176
'slug': '/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated'
'title': 'quantileExactWeightedInterpolated'
---




# quantileExactWeightedInterpolated

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を線形補間を使用して計算し、各要素の重みを考慮します。

補間された値を取得するために、渡されたすべての値は配列にまとめられ、それぞれの重みによってソートされます。その後、重みに基づいた累積分布を構築し、[加重パーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)を使用して分位数の補間が行われます。

異なるレベルの複数の `quantile*` 関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリはそれができるよりも効率が悪くなります）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数の使用をお勧めします。

`quantileExactWeightedInterpolated` は `quantileInterpolatedWeighted` よりも精度が高いので、`quantileExactWeightedInterpolated` を使用することを強くお勧めします。以下はその例です：

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

別名: `medianExactWeightedInterpolated`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の間の定数の浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲で使用することをお勧めします。デフォルト値: 0.5。`level=0.5` では、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) の結果となる列値に対する式。
- `weight` — シーケンスメンバーの重みを含むカラム。重みは、[符号なし整数型](../../../sql-reference/data-types/int-uint.md) の値の出現回数を示す数値です。

**返される値**

- 指定されたレベルの分位数。

型:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)です。
- 入力値が `Date` 型の場合は[Date](../../../sql-reference/data-types/date.md)です。
- 入力値が `DateTime` 型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)です。

**例**

入力テーブル:

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

結果:

```text
┌─quantileExactWeightedInterpolated(n, val)─┐
│                                       1.5 │
└───────────────────────────────────────────┘
```

**参照**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
