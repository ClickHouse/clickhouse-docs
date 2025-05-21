---
description: '数値データ系列の近似的な quantile を計算します。'
sidebar_position: 172
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
title: 'quantileDeterministic'
---


# quantileDeterministic

数値データ系列の近似的な [quantile](https://en.wikipedia.org/wiki/Quantile) を計算します。

この関数は、最大8192のサイズのリザーバを使用した [リザーバサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling) と決定論的なサンプリングアルゴリズムを適用します。結果は決定論的です。正確な quantile を取得するには、[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 関数を使用してください。

異なるレベルの複数の `quantile*` 関数をクエリ内で使用する場合、内部状態は結合されません（つまり、クエリは可能なほど効率的に動作しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileDeterministic(level)(expr, determinator)
```

エイリアス: `medianDeterministic`.

**引数**

- `level` — quantile のレベル。オプションのパラメータ。0から1までの定数浮動小数点数です。`level` 値は `[0.01, 0.99]` の範囲が推奨されます。デフォルト値: 0.5。`level=0.5` の場合、この関数は [中央値](https://en.wikipedia.org/wiki/Median) を計算します。
- `expr` — 数値 [データ型](/sql-reference/data-types)、[Date](../../../sql-reference/data-types/date.md)、または [DateTime](../../../sql-reference/data-types/datetime.md) の結果を生成するカラム値に対する式。
- `determinator` — リザーバサンプリングアルゴリズム内でランダム数ジェネレータの代わりにハッシュが使用される数値。決定論的な正の整数（たとえば、ユーザーIDやイベントIDなど）を任意に determinator として使用できます。同じ determinator 値が頻繁に発生する場合、関数は正しく動作しません。

**返される値**

- 指定されたレベルの近似 quantile。

型:

- 数値データ型入力の場合は [Float64](../../../sql-reference/data-types/float.md)。
- 入力値の型が `Date` の場合は [Date](../../../sql-reference/data-types/date.md)。
- 入力値の型が `DateTime` の場合は [DateTime](../../../sql-reference/data-types/datetime.md)。

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

クエリ:

```sql
SELECT quantileDeterministic(val, 1) FROM t
```

結果:

```text
┌─quantileDeterministic(val, 1)─┐
│                           1.5 │
└───────────────────────────────┘
```

**関連情報**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
