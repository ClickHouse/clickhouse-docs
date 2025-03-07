---
slug: /sql-reference/aggregate-functions/reference/quantile
sidebar_position: 170
title: 'quantile'
description: '数値データ列の近似分位数を計算します。'
---


# quantile

数値データ列の近似[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

この関数は、8192までのリザーバサイズを持つ[リザーバサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling)とサンプリング用の乱数発生器を適用します。結果は非決定的です。正確な分位数を取得するには、[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)関数を使用してください。

複数の`quantile*`関数を異なるレベルでクエリに使用する場合、内部状態は統合されません（つまり、クエリは効率的に機能しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

空の数値列の場合、`quantile`はNaNを返しますが、その`quantile*`の変種は、変種に応じてNaNまたはシーケンスタイプのデフォルト値を返します。

**構文**

``` sql
quantile(level)(expr)
```

エイリアス: `median`。

**引数**

- `level` — 分位数のレベル。オプションのパラメーター。0から1の範囲の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲を使用することをお勧めします。デフォルト値: 0.5。`level=0.5`で、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](/sql-reference/data-types/date)または[DateTime](/sql-reference/data-types/datetime)に結果するカラム値に対する式。

**戻り値**

- 指定されたレベルの近似分位数。

タイプ:

- 数値データ型入力の場合は[Float64](/sql-reference/data-types/float)。
- 入力値が`Date`型の場合は[Date](/sql-reference/data-types/date)。
- 入力値が`DateTime`型の場合は[DateTime](/sql-reference/data-types/datetime)。

**例**

入力テーブル:

``` text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

クエリ:

``` sql
SELECT quantile(val) FROM t
```

結果:

``` text
┌─quantile(val)─┐
│           1.5 │
└───────────────┘
```

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles#quantiles)
