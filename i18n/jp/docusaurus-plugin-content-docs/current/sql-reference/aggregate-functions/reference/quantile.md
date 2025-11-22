---
description: '数値データ列の近似分位数を計算します。'
sidebar_position: 170
slug: /sql-reference/aggregate-functions/reference/quantile
title: 'quantile'
doc_type: 'reference'
---

# quantile

数値データ列の近似的な[分位点 (quantile)](https://en.wikipedia.org/wiki/Quantile) を計算します。

この関数は、最大 8192 のリザーバのサイズを持つ[リザーバサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling)と乱数生成器を用いてサンプリングを行います。結果は非決定的です。厳密な分位点を取得するには、[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 関数を使用してください。

1 つのクエリ内で異なるレベルを持つ複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、クエリは本来の効率より低い形で動作します）。このような場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

数値列が空の場合、`quantile` は NaN を返しますが、`quantile*` の各バリアントは、その種類に応じて NaN かシーケンス型のデフォルト値のいずれかを返すことに注意してください。

**構文**

```sql
quantile(level)(expr)
```

別名: `median`。

**引数**

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 の間の定数の浮動小数点数。`level` の値として `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は [median](https://en.wikipedia.org/wiki/Median) を計算します。
* `expr` — 結果が数値の [データ型](/sql-reference/data-types)、[Date](/sql-reference/data-types/date)、または [DateTime](/sql-reference/data-types/datetime) となる、列値に対する式。

**返される値**

* 指定されたレベルの近似的な分位数。

Type:

* 数値データ型の入力の場合は [Float64](/sql-reference/data-types/float)。
* 入力値が `Date` 型の場合は [Date](/sql-reference/data-types/date)。
* 入力値が `DateTime` 型の場合は [DateTime](/sql-reference/data-types/datetime)。

**例**

入力テーブル:

```text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

クエリ：

```sql
SELECT quantile(val) FROM t
```

結果:

```text
┌─quantile(val)─┐
│           1.5 │
└───────────────┘
```

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles#quantiles)
