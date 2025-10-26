---
'description': 'bfloat16 数のサンプルの近似分位点を計算します。'
'sidebar_position': 171
'slug': '/sql-reference/aggregate-functions/reference/quantilebfloat16'
'title': 'quantileBFloat16'
'doc_type': 'reference'
---


# quantileBFloat16Weighted

`quantileBFloat16`と同様ですが、各シーケンスメンバーの重みを考慮します。

[bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) 数値のサンプルの近似 [クオンタイル](https://en.wikipedia.org/wiki/Quantile) を計算します。`bfloat16` は、1つの符号ビット、8つの指数ビット、および7つの仮数ビットを持つ浮動小数点データ型です。関数は入力値を32ビット浮動小数点に変換し、最上位の16ビットを取得します。次に、`bfloat16` クオンタイル値を計算し、ゼロビットを追加して結果を64ビット浮動小数点に変換します。この関数は、相対誤差が最大0.390625%の高速クオンタイル推定器です。

**構文**

```sql
quantileBFloat16[(level)](expr)
```

エイリアス: `medianBFloat16`

**引数**

- `expr` — 数値データが格納されたカラム。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md)。

**パラメータ**

- `level` — クオンタイルのレベル。オプション。可能な値は0から1の範囲です。デフォルト値: 0.5。 [浮動小数点](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定されたレベルの近似クオンタイル。

型: [Float64](/sql-reference/data-types/float)。

**例**

入力テーブルには整数カラムと浮動小数点カラムがあります：

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

0.75-クオンタイル（第3四分位数）を計算するためのクエリ：

```sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

結果：

```text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```
例では、すべての浮動小数点値は`bfloat16`に変換する際に1.0に切り捨てられることに注意してください。

**関連情報**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
