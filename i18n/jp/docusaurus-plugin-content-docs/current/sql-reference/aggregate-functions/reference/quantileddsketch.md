---
slug: /sql-reference/aggregate-functions/reference/quantileddsketch
sidebar_position: 171
title: quantileDD
description: "相対誤差保証付きで標本の近似分位数を計算します。"
---

相対誤差保証付きで標本の近似[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。これは[DD](https://www.vldb.org/pvldb/vol12/p2195-masson.pdf)を構築することで機能します。

**構文**

``` sql
quantileDD(relative_accuracy, [level])(expr)
```

**引数**

- `expr` — 数値データのカラム。[整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md)。

**パラメータ**

- `relative_accuracy` — 分位数の相対精度。可能な値は0から1の範囲です。[浮動小数点](../../../sql-reference/data-types/float.md)。スケッチのサイズはデータの範囲と相対精度に依存します。範囲が大きく、相対精度が小さいほど、スケッチは大きくなります。スケッチの概算メモリサイズは`log(max_value/min_value)/relative_accuracy`です。推奨値は0.001以上です。

- `level` — 分位数のレベル。オプション。可能な値は0から1の範囲です。デフォルト値：0.5。[浮動小数点](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定したレベルの近似分位数。

型: [Float64](/sql-reference/data-types/float)。

**例**

入力テーブルには整数と浮動小数点のカラムがあります：

``` text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

0.75-分位数（第三四分位数）を計算するためのクエリ：

``` sql
SELECT quantileDD(0.01, 0.75)(a), quantileDD(0.01, 0.75)(b) FROM example_table;
```

結果：

``` text
┌─quantileDD(0.01, 0.75)(a)─┬─quantileDD(0.01, 0.75)(b)─┐
│               2.974233423476717 │                            1.01 │
└─────────────────────────────────┴─────────────────────────────────┘
```

**関連情報**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
