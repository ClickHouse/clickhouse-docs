---
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
sidebar_position: 172
---

# quantileDeterministic

数値データシーケンスの近似[分位数](https://ja.wikipedia.org/wiki/分位数)を計算します。

この関数は、最大8192のリザーバサイズを持つ[リザーバサンプリング](https://ja.wikipedia.org/wiki/リザーバサンプリング)を適用し、サンプリングの決定論的アルゴリズムを使用します。結果は決定論的です。正確な分位数を取得するには、[quantileExact](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexact)関数を使用してください。

複数の`quantile*`関数を異なるレベルでクエリで使用する場合、内部状態は組み合わされません（つまり、クエリは効率的に動作しません）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileDeterministic(level)(expr, determinator)
```

エイリアス: `medianDeterministic`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level` 値は `[0.01, 0.99]` の範囲を使用することをお勧めします。デフォルト値: 0.5。 `level=0.5` では、この関数は[中央値](https://ja.wikipedia.org/wiki/中央値)を計算します。
- `expr` — 数値[データ型](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)に相当するカラム値の式。
- `determinator` — リザーバサンプリングアルゴリズムでランダム数生成器の代わりに使用されるハッシュ化された数値。任意の決定論的な正の数（例: ユーザーIDやイベントID）を決定子として使用できます。同じ決定子の値が多すぎると、関数が正しく動作しなくなります。

**返される値**

- 指定されたレベルの近似分位数。

タイプ:

- 数値データ型入力の場合: [Float64](../../../sql-reference/data-types/float.md)。
- 入力値が`Date`型の場合: [Date](../../../sql-reference/data-types/date.md)。
- 入力値が`DateTime`型の場合: [DateTime](../../../sql-reference/data-types/datetime.md)。

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
