---
description: '数値データシーケンスの近似四分位数を計算します。'
sidebar_position: 172
slug: '/sql-reference/aggregate-functions/reference/quantiledeterministic'
title: 'quantileDeterministic'
---




# quantileDeterministic

数値データシーケンスの近似[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

この関数は、最大8192のリザーバサイズと決定論的なサンプリングアルゴリズムによる[リザーバサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling)を適用します。結果は決定論的です。正確な分位数を取得するには、[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)関数を使用してください。

クエリ内で異なるレベルの複数の`quantile*`関数を使用する場合、内部状態は結合されません（つまり、クエリは効率が悪くなります）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

```sql
quantileDeterministic(level)(expr, determinator)
```

別名: `medianDeterministic`.

**引数**

- `level` — 分位数のレベル。オプションのパラメーター。0から1までの定数浮動小数点数。`level`の値を`[0.01, 0.99]`の範囲で使用することを推奨します。デフォルト値: 0.5。`level=0.5`では、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値の[データ型](/sql-reference/data-types)または[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)の列値に対する式。
- `determinator` — リザーバサンプリングアルゴリズムでランダム数生成器の代わりに使用されるハッシュの数。結果を決定論的にするために。決定子としては、ユーザーIDやイベントIDなどの任意の決定論的な正の数を使用できます。同じ決定子の値が多すぎると、関数が正しく機能しません。

**戻り値**

- 指定されたレベルの近似分位数。

タイプ:

- 数値データ型入力の場合は[Float64](../../../sql-reference/data-types/float.md)。
- 入力値の型が`Date`の場合は[Date](../../../sql-reference/data-types/date.md)。
- 入力値の型が`DateTime`の場合は[DateTime](../../../sql-reference/data-types/datetime.md)。

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

**参考情報**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
