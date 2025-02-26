---
slug: /sql-reference/aggregate-functions/reference/quantile
sidebar_position: 170
---

# quantile

数値データのシーケンスの近似[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

この関数は、最大8192のリザーバサイズとリザーバサンプリング用の乱数生成器を使用して[リザーバサンプリング](https://en.wikipedia.org/wiki/Reservoir_sampling)を適用します。結果は非決定的です。正確な分位数を取得するには、[quantileExact](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexact)関数を使用してください。

異なるレベルの複数の`quantile*`関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリは効率的に機能しません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

空の数値シーケンスに対しては、`quantile`はNaNを返しますが、その`quantile*`のバリアントは、バリアントに応じてNaNまたはシーケンスタイプのデフォルト値を返します。

**構文**

``` sql
quantile(level)(expr)
```

エイリアス: `median`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の範囲の固定小数点数。`[0.01, 0.99]`の範囲の`level`値を使用することをお勧めします。デフォルト値: 0.5。`level=0.5`の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。
- `expr` — 数値[データタイプ](../../../sql-reference/data-types/index.md#data_types)、[Date](../../../sql-reference/data-types/date.md)または[DateTime](../../../sql-reference/data-types/datetime.md)のカラム値に対する式。

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
SELECT quantile(val) FROM t
```

結果:

``` text
┌─quantile(val)─┐
│           1.5 │
└───────────────┘
```

**関連情報**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
