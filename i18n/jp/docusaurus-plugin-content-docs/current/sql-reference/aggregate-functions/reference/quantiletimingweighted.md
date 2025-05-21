description: '指定された精度で、各シーケンスメンバーの重みに基づいて数値データシーケンスの量子を計算します。'
sidebar_position: 181
slug: /sql-reference/aggregate-functions/reference/quantiletimingweighted
title: 'quantileTimingWeighted'
```


# quantileTimingWeighted

指定された精度で、各シーケンスメンバーの重みに基づいて[量子](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定論的であり（クエリ処理の順序に依存しません）、この関数は、ウェブページの読み込み時間やバックエンドの応答時間のような分布を説明するシーケンスでの使用に最適化されています。

クエリ内で異なるレベルの複数の`quantile*`関数を使用する場合、内部状態は結合されません（つまり、クエリは本来の効率よりも低下します）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

```sql
quantileTimingWeighted(level)(expr, weight)
```

エイリアス: `medianTimingWeighted`.

**引数**

- `level` — 量子のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲で使用することをお勧めします。デフォルト値: 0.5。`level=0.5`の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — カラム値に対する[式](/sql-reference/syntax#expressions)で、[Float*](../../../sql-reference/data-types/float.md)-型の数値を返します。

        - 負の値が関数に渡されると、動作は未定義です。
        - 値が30,000を超える場合（ページの読み込み時間が30秒を超える）、30,000として扱われます。

- `weight` — シーケンス要素の重みを持つカラム。重みは値の出現回数です。

**精度**

計算が正確であるための条件：

- 値の合計数が5670を超えないこと。
- 値の合計数が5670を超えるが、ページの読み込み時間が1024ms未満であること。

それ以外の場合、計算結果は最寄りの16 msの倍数に丸められます。

:::note    
ページの読み込み時間の量子を計算するために、この関数は[quantile](/sql-reference/aggregate-functions/reference/quantile)よりも効果的で正確です。
:::

**返される値**

- 指定されたレベルの量子。

タイプ: `Float32`。

:::note    
関数に値が渡されない場合（`quantileTimingIf`を使用している場合）、[NaN](/sql-reference/data-types/float#nan-and-inf)が返されます。これは、ゼロになるケースと区別するためのものです。`NaN`値のソートに関する注意は[ORDER BY句](/sql-reference/statements/select/order-by)を参照してください。
:::

**例**

入力テーブル:

```text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

クエリ:

```sql
SELECT quantileTimingWeighted(response_time, weight) FROM t
```

結果:

```text
┌─quantileTimingWeighted(response_time, weight)─┐
│                                           112 │
└───────────────────────────────────────────────┘
```


# quantilesTimingWeighted

`quantileTimingWeighted`と同様ですが、量子レベルで複数のパラメータを受け取り、多くの量子値で満たされた配列を返します。

**例**

入力テーブル:

```text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

クエリ:

```sql
SELECT quantilesTimingWeighted(0,5, 0.99)(response_time, weight) FROM t
```

結果:

```text
┌─quantilesTimingWeighted(0.5, 0.99)(response_time, weight)─┐
│ [112,162]                                                 │
└───────────────────────────────────────────────────────────┘
```

**参照**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
