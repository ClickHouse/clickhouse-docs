---
slug: /sql-reference/aggregate-functions/reference/quantile
sidebar_position: 170
title: "quantile"
description: "数値データシーケンスの近似量子を計算します。"
---


# quantile

数値データシーケンスの近似[量子](https://ja.wikipedia.org/wiki/%E9%87%8F%E5%AD%90)を計算します。

この関数は、最大8192のリザーバサイズとサンプリング用の乱数生成器を用いて[リザーバサンプリング](https://ja.wikipedia.org/wiki/%E3%83%AA%E3%82%B6%E3%83%BC%E3%83%90%E3%83%BC%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AA%E3%83%B3%E3%82%B0)を適用します。結果は決定論的ではありません。正確な量子を得るには、[quantileExact](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexact)関数を使用してください。

クエリ内で異なるレベルの`quantile*`関数を複数使用する場合、内部状態は結合されません（つまり、クエリは可能なよりも効率的に動作しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

空の数値シーケンスの場合、`quantile`はNaNを返しますが、その`quantile*`のバリアントは、バリアントに応じてNaNまたはシーケンスタイプのデフォルト値を返します。

**構文**

``` sql
quantile(level)(expr)
```

エイリアス: `median`.

**引数**

- `level` — 量子のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数です。`level`の値は`[0.01, 0.99]`の範囲を使用することをお勧めします。デフォルト値: 0.5。`level=0.5`では、関数は[中央値](https://ja.wikipedia.org/wiki/%E4%B8%AD%E5%BD%95)を計算します。
- `expr` — 数値の[データ型](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)の結果を生成するカラム値に対する式。

**返される値**

- 指定されたレベルの近似量子。

型:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

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

**参照**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
