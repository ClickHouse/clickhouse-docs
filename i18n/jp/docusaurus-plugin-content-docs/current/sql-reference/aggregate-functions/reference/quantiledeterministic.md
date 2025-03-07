---
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
sidebar_position: 172
title: 'quantileDeterministic'
description: '数値データ系列の近似的な分位数を計算します。'
---


# quantileDeterministic

数値データ系列の近似的な[分位数](https://ja.wikipedia.org/wiki/%E5%88%86%E4%BD%8D%E6%95%B0)を計算します。

この関数は、最大8192のリザーバサイズを持つ[リザーバサンプリング](https://ja.wikipedia.org/wiki/%E3%83%AA%E3%82%B6%E3%83%BC%E3%83%90%E3%83%BC%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AA%E3%83%B3%E3%82%B0)を適用し、サンプリングの決定論的アルゴリズムを使用します。結果は決定論的です。正確な分位数を取得するには、[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)関数を使用してください。

異なるレベルの複数の `quantile*` 関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリは本来ほど効率的ではありません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileDeterministic(level)(expr, determinator)
```

エイリアス: `medianDeterministic`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲で使用することをお勧めします。デフォルト値: 0.5。`level=0.5` の場合、関数は[中央値](https://ja.wikipedia.org/wiki/%E4%B8%AD%E5%88%86%E8%AA%9E)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。
- `determinator` — リザーバサンプリングアルゴリズムでランダム数生成器の代わりに使用されるハッシュの数。決定論的な正の数（例えば、ユーザーIDやイベントID）を使用できます。同じ決定因子の値が頻繁に発生すると、関数が正しく動作しなくなります。

**戻り値**

- 指定されたレベルの近似的な分位数。

タイプ:

- 数値データ型入力に対して[Float64](../../../sql-reference/data-types/float.md)。
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

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
