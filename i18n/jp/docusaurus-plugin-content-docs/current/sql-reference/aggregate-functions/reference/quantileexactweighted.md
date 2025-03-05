---
slug: /sql-reference/aggregate-functions/reference/quantileexactweighted
sidebar_position: 174
title: "quantileExactWeighted"
description: "各要素の重みを考慮して、数値データシーケンスの分位点を正確に計算します。"
---


# quantileExactWeighted

各要素の重みを考慮して、数値データシーケンスの[分位点](https://en.wikipedia.org/wiki/Quantile)を正確に計算します。

正確な値を得るために、全ての渡された値は配列に結合され、その後部分的にソートされます。各値は、その値が`weight`回存在するかのように、その重みと共にカウントされます。アルゴリズムにはハッシュテーブルが使用されます。このため、渡された値が頻繁に繰り返される場合、この関数は[quantileExact](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexact)よりも少ないRAMを消費します。この関数は`quantileExact`の代わりに使用でき、重み1を指定できます。

異なるレベルで複数の`quantile*`関数をクエリで使用すると、内部状態は組み合わされません（つまり、クエリは本来の効率よりも低下します）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileExactWeighted(level)(expr, weight)
```

エイリアス: `medianExactWeighted`。

**引数**

- `level` — 分位点のレベル。オプションのパラメータ。0から1の間の定数浮動小数点数です。`level`の値は`[0.01, 0.99]`の範囲内を使用することをお勧めします。デフォルト値: 0.5。`level=0.5`で、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。
- `weight` — シーケンスメンバーの重みのカラム。重みは[符号なし整数型](../../../sql-reference/data-types/int-uint.md)による値の出現回数です。

**返される値**

- 指定されたレベルの分位点。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

入力テーブル:

``` text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

クエリ:

``` sql
SELECT quantileExactWeighted(n, val) FROM t
```

結果:

``` text
┌─quantileExactWeighted(n, val)─┐
│                             1 │
└───────────────────────────────┘
```

**関連項目**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
