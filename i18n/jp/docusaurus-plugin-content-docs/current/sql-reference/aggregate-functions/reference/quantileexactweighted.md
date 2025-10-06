---
'description': '数値データシーケンスの分位点を正確に計算し、各要素の重みを考慮に入れます。'
'sidebar_position': 174
'slug': '/sql-reference/aggregate-functions/reference/quantileexactweighted'
'title': 'quantileExactWeighted'
'doc_type': 'reference'
---


# quantileExactWeighted

数値データ系列の[分位数](https://en.wikipedia.org/wiki/Quantile)を正確に計算し、各要素の重みを考慮します。

正確な値を得るために、渡されたすべての値は配列にまとめられ、部分的にソートされます。各値は、その値が`weight`回存在するかのように、その重みと共にカウントされます。アルゴリズムにはハッシュテーブルが使用されます。このため、渡された値が頻繁に繰り返される場合、関数は[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)よりも少ないRAMを消費します。この関数を`quantileExact`の代わりに使用し、重みを1として指定することができます。

クエリ内で異なるレベルの複数の`quantile*`関数を使用する際には、内部状態が結合されず（つまり、クエリの効率が低下します）、この場合は[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

```sql
quantileExactWeighted(level)(expr, weight)
```

エイリアス: `medianExactWeighted`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の間の定数浮動小数点数です。`level`の値は`[0.01, 0.99]`の範囲内で使用することを推奨します。デフォルト値: 0.5。`level=0.5`の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)を持つカラム値に対する式。
- `weight` — シーケンスメンバーの重みを持つカラム。重みは[符号なし整数型](../../../sql-reference/data-types/int-uint.md)の値の出現回数です。

**返される値**

- 指定されたレベルの分位数。

タイプ：

- 数値データ型入力に対して[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

**例**

入力テーブル：

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

結果：

```text
┌─quantileExactWeighted(n, val)─┐
│                             1 │
└───────────────────────────────┘
```

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
