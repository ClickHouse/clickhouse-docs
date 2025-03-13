---
slug: /sql-reference/aggregate-functions/reference/quantileexactweighted
sidebar_position: 174
title: 'quantileExactWeighted'
description: '数値データ列の分位数を正確に計算し、各要素の重みを考慮します。'
---


# quantileExactWeighted

数値データ列の[分位数](https://ja.wikipedia.org/wiki/%E5%88%86%E4%BD%8D%E6%95%B0)を正確に計算し、各要素の重みを考慮します。

正確な値を得るために、渡されたすべての値は配列に結合され、部分的にソートされます。各値は、その重みの分だけ存在するかのようにカウントされます。アルゴリズムではハッシュテーブルが使用されます。このため、渡された値が頻繁に繰り返される場合、この関数は[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)よりも少ないRAMを消費します。この関数は、`quantileExact`の代わりに使用し、重み1を指定することができます。

クエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態は結合されないため（つまり、クエリの効率が低下します）、この場合は[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileExactWeighted(level)(expr, weight)
```

エイリアス: `medianExactWeighted`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の間の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲で使用することを推奨します。デフォルト値: 0.5。`level=0.5`のとき、関数は[中央値](https://ja.wikipedia.org/wiki/%E4%B8%AD%E5%A5%97)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)の結果となるカラム値に対する式。
- `weight` — シーケンスメンバーの重みを持つカラム。重みは、[符号なし整数型](../../../sql-reference/data-types/int-uint.md)の値の発生回数です。

**返される値**

- 指定されたレベルの分位数。

型:

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

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
