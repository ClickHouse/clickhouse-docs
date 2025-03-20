---
slug: /sql-reference/aggregate-functions/reference/quantilebfloat16
sidebar_position: 171
title: 'quantileBFloat16'
description: 'bfloat16 数値のサンプルの近似分位数を計算します。'
---

bfloat16 数値のサンプルの近似[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。`bfloat16`は、1ビットの符号ビット、8ビットの指数ビット、および7ビットの尾数ビットを持つ浮動小数点データ型です。関数は入力値を32ビットの浮動小数点数に変換し、最も重要な16ビットを取得します。次に、`bfloat16`分位数値を計算し、ゼロビットを追加して64ビットの浮動小数点数に変換します。この関数は、相対誤差が0.390625%を超えない高速な分位数推定器です。

**構文**

``` sql
quantileBFloat16[(level)](expr)
```

エイリアス: `medianBFloat16`

**引数**

- `expr` — 数値データを含むカラム。[整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md)。

**パラメータ**

- `level` — 分位数のレベル。省略可。可能な値は0から1の範囲です。デフォルト値: 0.5。[浮動小数点](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定されたレベルの近似分位数。

タイプ: [Float64](/sql-reference/data-types/float).

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

0.75分位数（第3四分位数）を計算するクエリ：

``` sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

結果：

``` text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```
例のすべての浮動小数点値は、`bfloat16`に変換する際に1.0に切り捨てられることに注意してください。


# quantileBFloat16Weighted

`quantileBFloat16`と同様ですが、各シーケンスメンバーの重みを考慮します。

**参照**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
