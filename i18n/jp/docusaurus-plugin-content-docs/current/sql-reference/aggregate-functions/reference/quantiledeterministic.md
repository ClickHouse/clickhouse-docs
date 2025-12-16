---
description: '数値データの並びに対する近似分位数を計算します。'
sidebar_position: 172
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
title: 'quantileDeterministic'
doc_type: 'reference'
---

# quantileDeterministic {#quantiledeterministic}

数値データ系列の概算[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

この関数は、最大 8192 のリザーバーサイズを持つ[リザーバサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling)と決定論的なサンプリングアルゴリズムを適用します。結果は決定論的です。厳密な分位数を取得するには、[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 関数を使用します。

1 つのクエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態はマージされません（つまり、そのクエリは本来よりも非効率になります）。このような場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用します。

**構文**

```sql
quantileDeterministic(level)(expr, determinator)
```

別名: `medianDeterministic`.

**引数**

* `level` — 分位点のレベル。省略可能な引数。0 から 1 までの定数の浮動小数点数。`level` の値として `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は [median](https://en.wikipedia.org/wiki/Median) を計算します。
* `expr` — 列値に対する式で、その結果が数値の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) となるもの。
* `determinator` — サンプリング結果を決定的にするために、リザーバサンプリングアルゴリズムで乱数生成器の代わりに、そのハッシュ値が使用される数値。`determinator` としては、ユーザー ID やイベント ID など、任意の決定的な正の数を使用できます。同じ `determinator` の値があまりに頻繁に出現する場合、この関数は正しく動作しません。

**返される値**

* 指定されたレベルの近似分位点。

型:

* 数値データ型の入力に対しては [Float64](../../../sql-reference/data-types/float.md)。
* 入力値が `Date` 型の場合は [Date](../../../sql-reference/data-types/date.md)。
* 入力値が `DateTime` 型の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

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
SELECT quantileDeterministic(val, 1) FROM t
```

結果：

```text
┌─quantileDeterministic(val, 1)─┐
│                           1.5 │
└───────────────────────────────┘
```

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
