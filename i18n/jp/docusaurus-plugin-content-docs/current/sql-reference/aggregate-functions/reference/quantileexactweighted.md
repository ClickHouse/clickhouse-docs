---
description: '数値データ系列の分位点を正確に計算し、各要素の重みを考慮します。'
sidebar_position: 174
slug: /sql-reference/aggregate-functions/reference/quantileexactweighted
title: 'quantileExactWeighted'
---


# quantileExactWeighted

数値データ系列の[分位点](https://en.wikipedia.org/wiki/Quantile)を正確に計算し、各要素の重みを考慮します。

正確な値を得るために、渡された全ての値は配列にまとめられ、部分的にソートされます。各値はその重みでカウントされ、あたかも`weight`回存在するかのように扱われます。アルゴリズム内ではハッシュテーブルが使用されます。このため、渡された値が頻繁に繰り返される場合、関数は[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)よりも少ないRAMを消費します。この関数は`quantileExact`の代わりに使用でき、重み1を指定することができます。

クエリ内で異なるレベルの`quantile*`関数を複数使用する場合、内部状態は結合されません（つまり、クエリは効率的に動作しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

```sql
quantileExactWeighted(level)(expr, weight)
```

エイリアス: `medianExactWeighted`.

**引数**

- `level` — 分位点のレベル。オプションのパラメータ。0から1までの定数浮動小数点数です。`level`の値は`[0.01, 0.99]`の範囲を推奨します。デフォルト値: 0.5。`level=0.5`のとき、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)に対応するカラム値に対する式です。
- `weight` — シーケンスメンバーの重みを持つカラムです。重みは[符号なし整数型](../../../sql-reference/data-types/int-uint.md)の値出現回数です。

**返される値**

- 指定されたレベルの分位点。

型:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

入力テーブル:

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

クエリ:

```sql
SELECT quantileExactWeighted(n, val) FROM t
```

結果:

```text
┌─quantileExactWeighted(n, val)─┐
│                             1 │
└───────────────────────────────┘
```

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
