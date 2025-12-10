---
description: '各要素の重みを考慮して、数値データ列の分位点を厳密に計算します。'
sidebar_position: 174
slug: /sql-reference/aggregate-functions/reference/quantileexactweighted
title: 'quantileExactWeighted'
doc_type: 'reference'
---

# quantileExactWeighted {#quantileexactweighted}

数値データ列について、各要素の重みを考慮して[分位数](https://en.wikipedia.org/wiki/Quantile)を厳密に計算します。

厳密な値を取得するために、渡されたすべての値は配列にまとめられ、その後部分的にソートされます。各値は、あたかも `weight` 回出現しているかのように、その重みを考慮してカウントされます。アルゴリズムではハッシュテーブルが使用されます。そのため、渡された値に同じ値が頻出する場合、この関数は [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) よりも RAM 消費量が少なくなります。この関数を `quantileExact` の代わりに使用し、重みとして 1 を指定することもできます。

1 つのクエリ内で、異なるレベルを持つ複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、そのクエリは本来よりも非効率に動作します）。このような場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileExactWeighted(level)(expr, weight)
```

Alias: `medianExactWeighted`.

**引数**

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 までの定数の浮動小数点値です。`level` の値には `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
* `expr` — カラム値に対する式で、その結果が数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) になります。
* `weight` — シーケンス要素の重みを格納するカラム。重みは、その値の出現回数を表す [Unsigned 整数型](../../../sql-reference/data-types/int-uint.md) の数値です。

**戻り値**

* 指定されたレベルの分位数。

型:

* 数値データ型入力の場合は [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

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

結果：

```text
┌─quantileExactWeighted(n, val)─┐
│                             1 │
└───────────────────────────────┘
```

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
