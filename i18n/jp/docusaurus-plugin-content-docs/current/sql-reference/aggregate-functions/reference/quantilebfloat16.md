---
description: 'bfloat16 数値で構成されるサンプルの近似分位数を計算します。'
sidebar_position: 171
slug: /sql-reference/aggregate-functions/reference/quantilebfloat16
title: 'quantileBFloat16'
doc_type: 'reference'
---

# quantileBFloat16Weighted

`quantileBFloat16` と同様ですが、系列内の各要素の重みを考慮します。

[bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) 形式の数値からなる標本について、おおよその [分位数](https://en.wikipedia.org/wiki/Quantile) を計算します。`bfloat16` は、1 ビットの符号ビット、8 ビットの指数部、7 ビットの仮数部を持つ浮動小数点データ型です。
この関数は、入力値を 32 ビット浮動小数点数に変換し、その最上位 16 ビットを取得します。次に `bfloat16` の分位数値を計算し、ゼロビットを付加することで結果を 64 ビット浮動小数点数に変換します。
この関数は高速な分位数推定器であり、相対誤差は 0.390625% を超えません。

**構文**

```sql
quantileBFloat16[(level)](expr)
```

Alias: `medianBFloat16`

**引数**

* `expr` — 数値データを持つ列。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)。

**パラメータ**

* `level` — 分位数のレベル。省略可能。指定可能な値の範囲は 0 から 1。デフォルト値: 0.5。[Float](../../../sql-reference/data-types/float.md)。

**戻り値**

* 指定したレベルの近似分位数。

型: [Float64](/sql-reference/data-types/float).

**例**

入力テーブルには整数列と浮動小数点数列があります。

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

0.75 分位数（第3四分位数）を計算するクエリ：

```sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

結果：

```text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```

この例では、`bfloat16` へ変換すると、すべての浮動小数点値は 1.0 に切り捨てられることに注意してください。

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
