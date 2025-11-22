---
description: '相対誤差を保証しつつ、標本の近似分位数を計算します。'
sidebar_position: 171
slug: /sql-reference/aggregate-functions/reference/quantileddsketch
title: 'quantileDD'
doc_type: 'reference'
---

相対誤差を保証しつつ、標本の近似的な[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。[DD](https://www.vldb.org/pvldb/vol12/p2195-masson.pdf)スケッチを構築することで動作します。

**構文**

```sql
quantileDD(relative_accuracy, [level])(expr)
```

**引数**

* `expr` — 数値データを含むカラム。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)。

**パラメータ**

* `relative_accuracy` — 分位点の相対精度。取りうる値の範囲は 0 から 1 です。[Float](../../../sql-reference/data-types/float.md)。スケッチのサイズはデータの範囲と相対精度に依存します。範囲が大きく、相対精度が小さいほど、スケッチは大きくなります。スケッチのおおよそのメモリ使用量は `log(max_value/min_value)/relative_accuracy` です。推奨値は 0.001 以上です。

* `level` — 分位点のレベル。省略可能。取りうる値の範囲は 0 から 1 です。デフォルト値: 0.5。[Float](../../../sql-reference/data-types/float.md)。

**返される値**

* 指定されたレベルの近似分位点。

型: [Float64](/sql-reference/data-types/float)。

**例**

入力テーブルには整数型カラムと浮動小数点数型カラムがあります:

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

0.75 分位数（第 3 四分位数）を計算するクエリ：

```sql
SELECT quantileDD(0.01, 0.75)(a), quantileDD(0.01, 0.75)(b) FROM example_table;
```

結果:

```text
┌─quantileDD(0.01, 0.75)(a)─┬─quantileDD(0.01, 0.75)(b)─┐
│               2.974233423476717 │                            1.01 │
└─────────────────────────────────┴─────────────────────────────────┘
```

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
