---
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
sidebar_position: 172
title: "quantileDeterministic"
description: "数値データ系列の近似的な分位数を計算します。"
---


# quantileDeterministic

数値データ系列の近似的な[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

この関数は、8192までのリザーバサイズと決定論的アルゴリズムによる[リザーバサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling)を適用します。結果は決定論的です。正確な分位数を得るには、[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 関数を使用してください。

複数の `quantile*` 関数を異なるレベルでクエリ内で使用すると、内部状態は結合されません（つまり、クエリが本来の効率よりも低下します）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

``` sql
quantileDeterministic(level)(expr, determinator)
```

エイリアス: `medianDeterministic`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲を推奨します。デフォルト値: 0.5。`level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md) または [DateTime](../../../sql-reference/data-types/datetime.md) の結果となるカラム値に対する式。
- `determinator` — リザーバサンプリングアルゴリズムでランダム数生成器の代わりに使用されるハッシュの対象となる数。この数によりサンプリングの結果が決定的になります。任意の決定論的な正の数をdeterminatorとして使用できます。例えば、ユーザーIDやイベントIDなどです。もし同じdeterminatorの値が頻繁に現れると、関数は正しく動作しません。

**戻り値**

- 指定されたレベルの近似的な分位数。

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
SELECT quantileDeterministic(val, 1) FROM t
```

結果:

``` text
┌─quantileDeterministic(val, 1)─┐
│                           1.5 │
└───────────────────────────────┘
```

**関連情報**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
