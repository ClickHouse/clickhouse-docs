---
description: '各要素の重みを考慮して、数値データ列の分位数を厳密に計算します。'
sidebar_position: 174
slug: /sql-reference/aggregate-functions/reference/quantileexactweighted
title: 'quantileExactWeighted'
doc_type: 'reference'
---

# quantileExactWeighted

数値データ列の[分位点](https://en.wikipedia.org/wiki/Quantile)を、各要素の重みを考慮して厳密に計算します。

厳密な値を得るために、渡されたすべての値を配列にまとめ、その配列を部分的にソートします。各値は、その値が `weight` 回存在するかのように、その重み付きで集計されます。アルゴリズムにはハッシュテーブルが使用されます。このため、渡された値に重複が多い場合には、この関数の方が [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) よりも RAM の消費量が少なくなります。この関数を `quantileExact` の代わりに使用し、重みとして 1 を指定することもできます。

1 つのクエリ内で複数の `quantile*` 関数を異なるレベルで使用する場合、内部状態は結合されません（つまり、そのクエリは本来よりも非効率に動作します）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileExactWeighted(level)(expr, weight)
```

エイリアス: `medianExactWeighted`.

**引数**

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 の間の定数の浮動小数点数値。`level` の値には `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
* `expr` — 列値に対する式で、その結果が数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) になるもの。
* `weight` — シーケンス要素の重みを格納する列。重みは、値の出現回数を表す [Unsigned integer types](../../../sql-reference/data-types/int-uint.md) の値です。

**返り値**

* 指定されたレベルの分位数。

型:

* 数値データ型の入力に対しては [Float64](../../../sql-reference/data-types/float.md)。
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

クエリ：

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

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
