---
description: '数値データ列の近似分位数を計算します。'
sidebar_position: 172
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
title: 'quantileDeterministic'
doc_type: 'reference'
---

# quantileDeterministic

数値データ系列の近似的な[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

この関数は、リザーバのサイズ最大 8192 の[リザーバサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling)と決定論的なサンプリングアルゴリズムを適用します。結果は決定論的です。厳密な分位数を取得するには、[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 関数を使用してください。

1 つのクエリで、異なるレベルを持つ複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、そのクエリは本来可能なほど効率的には動作しません）。このような場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileDeterministic(level)(expr, determinator)
```

エイリアス: `medianDeterministic`。

**引数**

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 までの定数浮動小数点数。`level` の値として `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は [median](https://en.wikipedia.org/wiki/Median) を計算します。
* `expr` — 数値型の[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) を結果とする、カラム値に対する式。
* `determinator` — そのハッシュ値がリザーバサンプリングアルゴリズムにおいて乱数生成器の代わりに使用される数値。これによりサンプリング結果を決定的にします。`determinator` として任意の決定的な正の数、例えばユーザー ID やイベント ID などを使用できます。同じ `determinator` の値が頻繁に出現しすぎると、この関数は正しく動作しません。

**戻り値**

* 指定されたレベルの近似分位数。

型:

* 数値データ型入力の場合は [Float64](../../../sql-reference/data-types/float.md)。
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
