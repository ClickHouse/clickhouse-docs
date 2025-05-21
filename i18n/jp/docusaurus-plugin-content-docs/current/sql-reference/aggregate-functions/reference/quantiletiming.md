description: '定まった精度で数値データ系列の[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。'
sidebar_position: 180
slug: /sql-reference/aggregate-functions/reference/quantiletiming
title: 'quantileTiming'
```


# quantileTiming

定まった精度で数値データ系列の[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定論的です（クエリ処理の順序に依存しません）。この関数は、ウェブページの読み込み時間やバックエンドの応答時間のような分布を記述する系列での作業に最適化されています。

異なるレベルの`quantile*`関数をクエリ内で複数使用する場合、内部状態は組み合わされません（つまり、クエリは可能なほど効率的に機能しません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

```sql
quantileTiming(level)(expr)
```

エイリアス: `medianTiming`。

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1の間の定数浮動小数点数。`level`値は`[0.01, 0.99]`の範囲内を推奨します。デフォルト値: 0.5。`level=0.5`のとき、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — [カラム値](https://example.com)に対する[式](/sql-reference/syntax#expressions)で、[Float*](../../../sql-reference/data-types/float.md)-型の数値を返します。

    - 負の値が関数に渡された場合、その動作は未定義です。
    - 値が30,000（30秒以上のページ読み込み時間）を超える場合、30,000と見なされます。

**精度**

計算が正確であるためには：

- 値の総数が5670を超えないこと。
- 値の総数が5670を超えるが、ページ読み込み時間が1024ms未満であること。

その他の場合、計算結果は最も近い16 msの倍数に丸められます。

:::note    
ページ読み込み時間の分位数を計算するためには、この関数は[quantile](/sql-reference/aggregate-functions/reference/quantile)よりも効果的かつ正確です。
:::

**返される値**

- 指定されたレベルの分位数。

型: `Float32`.

:::note    
関数に値が渡されない場合（`quantileTimingIf`を使用する場合）、[NaN](/sql-reference/data-types/float#nan-and-inf)が返されます。これは、これらのケースをゼロを返すケースと区別するためのものです。[ORDER BY句](/sql-reference/statements/select/order-by)に関する注意事項を参照して、`NaN`値のソートについてご確認ください。
:::

**例**

入力テーブル:

```text
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

クエリ:

```sql
SELECT quantileTiming(response_time) FROM t
```

結果:

```text
┌─quantileTiming(response_time)─┐
│                           126 │
└───────────────────────────────┘
```

**参照**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
