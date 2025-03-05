---
slug: /sql-reference/aggregate-functions/reference/quantile
sidebar_position: 170
title: "quantile"
description: "数値データシーケンスの近似量（quantile）を計算します。"
---


# quantile

数値データシーケンスの近似[量（quantile）](https://en.wikipedia.org/wiki/Quantile)を計算します。

この関数は、最大8192のリザーバサイズとサンプリング用の乱数生成器を用いた[リザーバサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling)を適用します。結果は決定論的ではありません。正確な量を得るには、[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)関数を使用してください。

異なるレベルの複数の`quantile*`関数をクエリ内で使用する場合、内部状態は結合されません（つまり、クエリは効率的に動作しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

空の数値シーケンスの場合、`quantile`はNaNを返しますが、その`quantile*`バリアントは、バリアントに応じてNaNまたはシーケンスタイプのデフォルト値を返します。

**構文**

``` sql
quantile(level)(expr)
```

エイリアス: `median`。

**引数**

- `level` — 量のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲を推奨します。デフォルト値: 0.5。`level=0.5`の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](/sql-reference/data-types/date)または[DateTime](/sql-reference/data-types/datetime)を生成するカラム値に対する式。

**返される値**

- 指定されたレベルの近似量。

タイプ:

- 入力が数値データ型の場合は[Float64](/sql-reference/data-types/float)。
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
