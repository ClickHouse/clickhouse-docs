---
description: 'Exactly computes the quantile of a numeric data sequence, taking into
  account the weight of each element.'
sidebar_position: 174
slug: '/sql-reference/aggregate-functions/reference/quantileexactweighted'
title: 'quantileExactWeighted'
---




# quantileExactWeighted

数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を正確に計算し、各要素の重みを考慮します。

正確な値を得るために、渡されたすべての値が配列に結合され、その後部分的にソートされます。各値はその重みに応じてカウントされ、まるで`weight`回存在するかのように扱われます。アルゴリズムではハッシュテーブルが使用されます。このため、渡された値が頻繁に繰り返される場合、関数は[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)よりも少ないRAMを消費します。この関数は`quantileExact`の代わりに使用でき、重み1を指定できます。

異なるレベルの`quantile*`関数をクエリで複数使用する場合、内部状態が組み合わされません（つまり、クエリは可能なより効率的に機能しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

```sql
quantileExactWeighted(level)(expr, weight)
```

エイリアス: `medianExactWeighted`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1までの定数浮動小数点数。`[0.01, 0.99]`の範囲内の`level`値を使用することをお勧めします。デフォルト値は0.5です。`level=0.5`の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)である列値に対する式、[日付](../../../sql-reference/data-types/date.md)または[日時](../../../sql-reference/data-types/datetime.md)。
- `weight` — シーケンスメンバーの重みを持つカラム。重みは[符号なし整数型](../../../sql-reference/data-types/int-uint.md)の値の出現回数です。

**返される値**

- 指定されたレベルの分位数。

タイプ:

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
