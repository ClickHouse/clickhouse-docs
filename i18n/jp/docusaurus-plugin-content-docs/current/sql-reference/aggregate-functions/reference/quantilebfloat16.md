---
'description': 'Computes an approximate quantile of a sample consisting of bfloat16
  numbers.'
'sidebar_position': 171
'slug': '/sql-reference/aggregate-functions/reference/quantilebfloat16'
'title': 'quantileBFloat16'
---




# quantileBFloat16Weighted

`quantileBFloat16` と同様ですが、各シーケンスメンバーの重みを考慮します。

[bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) 数値からなるサンプルの近似[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。`bfloat16` は、1 ビットの符号ビット、8 ビットの指数ビット、および 7 ビットの仮数ビットを持つ浮動小数点データ型です。この関数は、入力値を 32 ビットの浮動小数点数に変換し、最も重要な 16 ビットを取得します。次に、`bfloat16` の分位数値を計算し、ゼロビットを追加して結果を 64 ビットの浮動小数点数に変換します。 この関数は、相対誤差が最大 0.390625% である迅速な分位数推定器です。

**構文**

```sql
quantileBFloat16[(level)](expr)
```

エイリアス: `medianBFloat16`

**引数**

- `expr` — 数値データを含むカラム。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md)。

**パラメーター**

- `level` — 分位数のレベル。オプション。可能な値は 0 から 1 の範囲内です。デフォルト値: 0.5。 [浮動小数点](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定レベルの近似分位数。

タイプ: [Float64](/sql-reference/data-types/float)。

**例**

入力テーブルには整数カラムと浮動小数点カラムがあります:

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

0.75-分位数（第 3 四分位数）を計算するためのクエリ:

```sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

結果:

```text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```
例に示すすべての浮動小数点値は、`bfloat16` に変換される際に 1.0 に切り捨てられることに注意してください。

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
