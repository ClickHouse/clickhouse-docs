---
description: '線形補間を使用してヒストグラムの分位数を計算します。'
sidebar_position: 364
slug: /sql-reference/aggregate-functions/reference/quantilePrometheusHistogram
title: 'quantilePrometheusHistogram'
doc_type: 'reference'
---

# quantilePrometheusHistogram {#quantileprometheushistogram}

線形補間を用いてヒストグラムの[分位数 (quantile)](https://en.wikipedia.org/wiki/Quantile) を計算します。各ヒストグラムバケットの累積値と上限値を考慮します。

補間された値を取得するために、渡されたすべての値を 1 つの配列に結合し、その配列を対応するバケットの上限値でソートします。その後、従来型のヒストグラムに対する PromQL の [histogram&#95;quantile()](https://prometheus.io/docs/prometheus/latest/querying/functions/#histogram_quantile) 関数と同様に分位数の補間を行い、分位数の位置が属するバケットの下限値と上限値を用いて線形補間を実行します。

**構文**

```sql
quantilePrometheusHistogram(level)(bucket_upper_bound, cumulative_bucket_value)
```

**引数**

* `level` — 分位点のレベル。省略可能なパラメータ。0 から 1 の範囲の定数の浮動小数点数。`level` の値として `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値：`0.5`。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

* `bucket_upper_bound` — ヒストグラムバケットの上限値。

  * 最も高いバケットは上限値として `+Inf` を持たなければなりません。

* `cumulative_bucket_value` — ヒストグラムバケットの累積 [UInt](../../../sql-reference/data-types/int-uint) または [Float64](../../../sql-reference/data-types/float.md) の値。

  * バケットの上限値が増加するにつれて、値は単調増加になっている必要があります。

**返される値**

* 指定されたレベルの分位点。

型：

* `Float64`。

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

結果：

```text
   ┌─quantilePrometheusHistogram(bucket_upper_bound, cumulative_bucket_value)─┐
1. │                                                                     0.35 │
   └──────────────────────────────────────────────────────────────────────────┘
```

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
