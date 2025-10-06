---
'description': 'サンプルの近似的な分位数を相対誤差保証付きで計算します。'
'sidebar_position': 171
'slug': '/sql-reference/aggregate-functions/reference/quantileddsketch'
'title': 'quantileDD'
'doc_type': 'reference'
---

サンプルの近似[分位数](https://en.wikipedia.org/wiki/Quantile)を相対誤差保証付きで計算します。これは[DD](https://www.vldb.org/pvldb/vol12/p2195-masson.pdf)を構築することによって機能します。

**構文**

```sql
quantileDD(relative_accuracy, [level])(expr)
```

**引数**

- `expr` — 数値データを持つカラム。[整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md)。

**パラメータ**

- `relative_accuracy` — 分位数の相対精度。可能な値は0から1の範囲です。[浮動小数点](../../../sql-reference/data-types/float.md)。スケッチのサイズはデータの範囲と相対精度に依存します。範囲が大きく、相対精度が小さいほど、スケッチは大きくなります。スケッチの大まかなメモリサイズは`log(max_value/min_value)/relative_accuracy`です。推奨値は0.001以上です。

- `level` — 分位数のレベル。オプション。可能な値は0から1の範囲です。デフォルト値: 0.5。[浮動小数点](../../../sql-reference/data-types/float.md)。

**返される値**

- 指定されたレベルの近似分位数。

タイプ: [Float64](/sql-reference/data-types/float)。

**例**

入力テーブルには整数および浮動小数点カラムがあります:

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

0.75分位数（第3四分位数）を計算するクエリ:

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

- [中央値](/sql-reference/aggregate-functions/reference/median)
- [分位数](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
