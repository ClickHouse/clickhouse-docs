---
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
sidebar_position: 172
title: "quantileDeterministic"
description: "数値データのシーケンスの近似分位数を計算します。"
---


# quantileDeterministic

数値データのシーケンスの近似[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

この関数は[リザーバサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling)を適用し、リザーバのサイズは最大8192、サンプリングは決定論的アルゴリズムで行います。結果は決定論的です。正確な分位数を得るには、[quantileExact](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexact)関数を使用してください。

異なるレベルの複数の`quantile*`関数をクエリ内で使用する場合、内部状態は結合されません（つまり、クエリは効率的に動作しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileDeterministic(level)(expr, determinator)
```

エイリアス: `medianDeterministic`。

**引数**

- `level` — 分位数のレベル。任意のパラメータ。0から1までの定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲を使用することをお勧めします。デフォルト値: 0.5。`level=0.5`でこの関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](../../../sql-reference/data-types/index.md#data_types)、[日付](../../../sql-reference/data-types/date.md)、または[日付時刻](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。
- `determinator` — リザーバサンプリングアルゴリズムにおいてランダム数生成器の代わりにハッシュが使用される数。この数を決定因子として、ユーザーIDやイベントIDなどの任意の決定論的な正の数を使用できます。同じ決定因子の値が多すぎると、関数が正しく動作しません。

**返される値**

- 指定されたレベルの近似分位数。

タイプ:

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

**関連項目**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
