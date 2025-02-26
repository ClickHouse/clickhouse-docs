---
slug: /sql-reference/aggregate-functions/reference/quantiletiming
sidebar_position: 180
---

# quantileTiming

指定された精度で数値データのシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定的であり（クエリ処理の順序には依存しません）、関数はウェブページの読み込み時間やバックエンドの応答時間などの分布を記述するシーケンスでの作業に最適化されています。

異なるレベルの複数の`quantile*`関数をクエリ内で使用すると、内部状態は結合されないため（つまり、クエリの効率が低下します）、この場合は[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileTiming(level)(expr)
```

エイリアス: `medianTiming`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の間の定数浮動小数点数を指定します。`level`は`[0.01, 0.99]`の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5`では、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — [カラム値の式](../../../sql-reference/syntax.md#syntax-expressions)、[Float\*](../../../sql-reference/data-types/float.md)-型の数値を返します。

    - 負の値が関数に渡されると、動作は未定義です。
    - 値が30,000（30秒以上のページの読み込み時間）を超える場合は、30,000として扱われます。

**精度**

計算が正確であるためには次の条件を満たす必要があります：

- 値の合計数が5670を超えないこと。
- 値の合計数が5670を超えるが、ページの読み込み時間が1024ms未満であること。

それ以外の場合、計算結果は最寄りの16 msの倍数に丸められます。

:::note    
ページの読み込み時間の分位数を計算する場合、この関数は[quantile](../../../sql-reference/aggregate-functions/reference/quantile.md#quantile)よりも効果的で正確です。
:::

**返される値**

- 指定されたレベルの分位数。

タイプ: `Float32`。

:::note    
関数に値が渡されない場合（`quantileTimingIf`を使用するとき）、[NaN](../../../sql-reference/data-types/float.md#data_type-float-nan-inf)が返されます。これは、これらの場合をゼロとなる場合と区別するためのものです。`NaN`のソートに関する注意については[ORDER BY句](../../../sql-reference/statements/select/order-by.md#select-order-by)を参照してください。
:::

**例**

入力テーブル：

``` text
┌─response_time─┐
│            72 │
│           112 │
│           126 │
│           145 │
│           104 │
│           242 │
│           313 │
│           168 │
│           108 │
└───────────────┘
```

クエリ：

``` sql
SELECT quantileTiming(response_time) FROM t
```

結果：

``` text
┌─quantileTiming(response_time)─┐
│                           126 │
└───────────────────────────────┘
```

**関連項目**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
