---
description: 'bfloat16 型の数値で構成される標本の近似分位数を計算します。'
sidebar_position: 171
slug: /sql-reference/aggregate-functions/reference/quantilebfloat16
title: 'quantileBFloat16'
doc_type: 'reference'
---

# quantileBFloat16Weighted

`quantileBFloat16` と同様ですが、シーケンス内の各要素の重みを考慮します。

[bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) 数値からなる標本の近似[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。`bfloat16` は、1 ビットの符号ビット、8 ビットの指数部、7 ビットの仮数部を持つ浮動小数点データ型です。
この関数は入力値を 32 ビットの単精度浮動小数点数に変換し、上位 16 ビットを取り出します。その後、`bfloat16` の分位数値を計算し、結果にゼロビットを追加することで 64 ビットの倍精度浮動小数点数に変換します。
この関数は、相対誤差が最大でも 0.390625% の高速な分位数推定器です。

**構文**

```sql
quantileBFloat16[(level)](expr)
```

エイリアス: `medianBFloat16`

**引数**

* `expr` — 数値データを含むカラム。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)。

**パラメータ**

* `level` — 分位数レベル。省略可能です。指定可能な値は 0 から 1 の範囲です。デフォルト値: 0.5。[Float](../../../sql-reference/data-types/float.md)。

**返される値**

* 指定されたレベルの近似分位数。

型: [Float64](/sql-reference/data-types/float)。

**例**

入力テーブルには、整数型カラムと浮動小数点型カラムがあります:

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

0.75分位数（第3四分位数）を計算するクエリ：

```sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

結果：

```text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```

`bfloat16` に変換すると、この例のすべての浮動小数点数は 1.0 に切り捨てられることに注意してください。

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
