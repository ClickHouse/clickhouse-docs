---
'description': '線形補間を使用してヒストグラムの分位数を計算します。'
'sidebar_position': 364
'slug': '/sql-reference/aggregate-functions/reference/quantilePrometheusHistogram'
'title': 'quantilePrometheusHistogram'
'doc_type': 'reference'
---


# quantilePrometheusHistogram

ヒストグラムの[分位数](https://en.wikipedia.org/wiki/Quantile)を線形補間を使用して計算し、各ヒストグラムバケットの累積値と上限を考慮します。

補間値を取得するために、すべての渡された値が配列に結合され、その後対応するバケットの上限値によってソートされます。分位数の補間は、従来のヒストグラムに対するPromQLの[histogram_quantile()](https://prometheus.io/docs/prometheus/latest/querying/functions/#histogram_quantile)関数に似た方法で実行され、分位数位置が見つかったバケットの下限と上限を使用して線形補間を行います。

**構文**

```sql
quantilePrometheusHistogram(level)(bucket_upper_bound, cumulative_bucket_value)
```

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲を推奨します。デフォルト値: `0.5`。`level=0.5`の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `bucket_upper_bound` — ヒストグラムバケットの上限。

  - 最も高いバケットは`+Inf`の上限を持つ必要があります。

- `cumulative_bucket_value` — ヒストグラムバケットの累積[UInt](../../../sql-reference/data-types/int-uint)または[Float64](../../../sql-reference/data-types/float.md)値。

  - 値はバケットの上限が増加するにつれて単調増加である必要があります。

**戻り値**

- 指定されたレベルの分位数。

タイプ:

- `Float64`。

**例**

入力テーブル:

```text
   ┌─bucket_upper_bound─┬─cumulative_bucket_value─┐
1. │                  0 │                       6 │
2. │                0.5 │                      11 │
3. │                  1 │                      14 │
4. │                inf │                      19 │
   └────────────────────┴─────────────────────────┘
```

結果:

```text
   ┌─quantilePrometheusHistogram(bucket_upper_bound, cumulative_bucket_value)─┐
1. │                                                                     0.35 │
   └──────────────────────────────────────────────────────────────────────────┘
```

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
