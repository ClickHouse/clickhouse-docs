---
'description': 'Computes quantile of a numeric data sequence using linear interpolation,
  taking into account the weight of each element.'
'sidebar_position': 176
'slug': '/sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted'
'title': 'quantileInterpolatedWeighted'
---




# quantileInterpolatedWeighted

数値データシーケンスの[分位点](https://en.wikipedia.org/wiki/Quantile)を、各要素の重みを考慮して線形補間を使用して計算します。

補間された値を取得するために、渡されたすべての値は配列にまとめられ、その後、対応する重みによってソートされます。分位点補間は、重みに基づく累積分布を構築し、[加重パーセンタイル法](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)を使用して行われ、重みと値を用いて分位点を計算するために線形補間が実行されます。

異なるレベルの`quantile*`関数をクエリ内で複数使用する場合、内部状態は統合されません（つまり、クエリは効率的に動作しません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

```sql
quantileInterpolatedWeighted(level)(expr, weight)
```

エイリアス: `medianInterpolatedWeighted`.

**引数**

- `level` — 分位点のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5`では、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)の列値に対する式、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)。
- `weight` — シーケンスメンバーの重みを持つカラム。重みは値の出現回数です。

**戻り値**

- 指定されたレベルの分位点。

型:

- 数値データ型の入力に対しては[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

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

クエリ:

```sql
SELECT quantileInterpolatedWeighted(n, val) FROM t
```

結果:

```text
┌─quantileInterpolatedWeighted(n, val)─┐
│                                    1 │
└──────────────────────────────────────┘
```

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
