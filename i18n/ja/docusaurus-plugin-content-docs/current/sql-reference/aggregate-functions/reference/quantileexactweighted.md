---
slug: /sql-reference/aggregate-functions/reference/quantileexactweighted
sidebar_position: 174
---

# quantileExactWeighted

数値データのシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を、各要素の重みを考慮して正確に計算します。

正確な値を得るために、すべての渡された値を配列に結合し、その後部分的にソートします。各値はその重みでカウントされ、`weight`回存在するかのように扱われます。アルゴリズムにはハッシュテーブルが使用されます。このため、渡された値が頻繁に繰り返される場合、関数は[quantileExact](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexact)よりも少ないRAMを消費します。この関数は`quantileExact`の代わりに使用することができ、重みを1と指定できます。

クエリ内で異なるレベルの複数の`quantile*`関数を使用する場合、内部状態は結合されません（つまり、クエリは効率的に動作しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileExactWeighted(level)(expr, weight)
```

エイリアス: `medianExactWeighted`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲で使用することを推奨します。デフォルト値: 0.5。`level=0.5`の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値の[データ型](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)を返すカラム値に対する式。
- `weight` — シーケンスメンバーの重みを持つカラム。重みは[符号なし整数型](../../../sql-reference/data-types/int-uint.md)の値の出現回数です。

**返される値**

- 指定されたレベルの分位数。

型:

- 数値データ型入力の場合の[Float64](../../../sql-reference/data-types/float.md)。
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

**関連情報**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
