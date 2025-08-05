---
description: '数値データシーケンスの近似パーセンタイルを計算します。'
sidebar_position: 170
slug: '/sql-reference/aggregate-functions/reference/quantile'
title: 'quantile'
---




# quantile

数値データシーケンスの近似[quantile](https://en.wikipedia.org/wiki/Quantile)を計算します。

この関数は、8192までのサイズのリザーバーとサンプリング用の乱数生成器を使用した[リザーバーサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling)を適用します。結果は非決定的です。正確なquantileを取得するには、[quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)関数を使用してください。

クエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、クエリは本来よりも効率が悪くなります）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

空の数値シーケンスの場合、`quantile` は NaN を返しますが、その `quantile*` バリアントは、バリアントに応じて、NaN またはシーケンスタイプのデフォルト値を返します。

**構文**

```sql
quantile(level)(expr)
```

エイリアス: `median`.

**引数**

- `level` — quantileのレベル。オプションのパラメータ。0から1の間の定数浮動小数点数。`level` 値は `[0.01, 0.99]` の範囲内を使用することをお勧めします。デフォルト値: 0.5。`level=0.5` の場合、関数は[median](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データ型](/sql-reference/data-types)、[Date](/sql-reference/data-types/date) または [DateTime](/sql-reference/data-types/datetime)のカラム値に対しての式。

**返される値**

- 指定されたレベルの近似quantile。

型:

- 数値データ型入力の場合は[Float64](/sql-reference/data-types/float)。
- 入力値が `Date` 型の場合は[Date](/sql-reference/data-types/date)。
- 入力値が `DateTime` 型の場合は[DateTime](/sql-reference/data-types/datetime)。

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
SELECT quantile(val) FROM t
```

結果:

```text
┌─quantile(val)─┐
│           1.5 │
└───────────────┘
```

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles#quantiles)
