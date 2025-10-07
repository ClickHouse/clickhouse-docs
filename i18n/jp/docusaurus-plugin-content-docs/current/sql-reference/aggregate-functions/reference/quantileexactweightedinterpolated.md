---
'description': '数値データシーケンスの分位数を線形補間を使用して計算し、各要素の重みを考慮します。'
'sidebar_position': 176
'slug': '/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated'
'title': 'quantileExactWeightedInterpolated'
'doc_type': 'reference'
---


# quantileExactWeightedInterpolated

数値データ系列の[分位数](https://en.wikipedia.org/wiki/Quantile)を線形補間を使用して計算し、各要素の重みを考慮に入れます。

補間値を得るために、渡されたすべての値は配列にまとめられ、その後、対応する重みによってソートされます。その後、[重み付きパーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)を使用して累積分布を構築し、重みと値を用いて分位数を計算するために線形補間が行われます。

クエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態は統合されません（つまり、クエリはより効率的に動作しません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

`quantileExactWeightedInterpolated` は `quantileInterpolatedWeighted` よりも正確であるため、使用を強く推奨します。以下はその例です。

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

エイリアス: `medianExactWeightedInterpolated`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1までの定数浮動小数点数です。`level` の値は `[0.01, 0.99]` の範囲で使用することをお勧めします。デフォルト値: 0.5。`level=0.5` では、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) の列値に基づく式。
- `weight` — シーケンスメンバーの重みを持つカラム。重みは[符号なし整数型](../../../sql-reference/data-types/int-uint.md)の値の出現回数です。

**返される値**

- 指定されたレベルの分位数。

タイプ:

- 数値データ型入力の場合は [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

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

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
