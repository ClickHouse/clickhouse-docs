---
slug: /sql-reference/aggregate-functions/reference/quantiletimingweighted
sidebar_position: 181
---

# quantileTimingWeighted

決定された精度で、各シーケンスメンバーの重みに基づいて数値データシーケンスの[分位点](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定的です（クエリ処理の順序には依存しません）。この関数は、ウェブページの読み込み時間やバックエンドの応答時間などの分布を記述するシーケンスでの動作に最適化されています。

異なるレベルの`quantile*`関数をクエリ内で複数使用する場合、内部状態は組み合わされません（つまり、クエリは本来より効率的に動作しないことがあります）。この場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

``` sql
quantileTimingWeighted(level)(expr, weight)
```

エイリアス: `medianTimingWeighted`。

**引数**

- `level` — 分位点のレベル。オプションのパラメータ。0から1の範囲の定数浮動小数点数。`level`の値は`[0.01, 0.99]`の範囲を推奨します。デフォルト値: 0.5。`level=0.5`では、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — 列の値に対する[式](../../../sql-reference/syntax.md#syntax-expressions)で、[Float\*](../../../sql-reference/data-types/float.md)-型の数値を返します。

        - 負の値が関数に渡された場合、その動作は未定義です。
        - 値が30,000（ページの読み込み時間が30秒を超える）を超える場合、30,000として扱われます。

- `weight` — シーケンス要素の重みを持つ列。重みは値の出現回数です。

**精度**

計算は以下の場合に正確です：

- 値の総数が5670を超えない。
- 値の総数が5670を超えるが、ページの読み込み時間が1024ms未満である。

それ以外の場合、計算結果は最寄りの16 msの倍数に丸められます。

:::note    
ページの読み込み時間の分位点を計算するには、この関数は[quantile](../../../sql-reference/aggregate-functions/reference/quantile.md#quantile)よりも効果的かつ正確です。
:::

**返される値**

- 指定されたレベルの分位点。

タイプ: `Float32`。

:::note    
関数に値が渡されない場合（`quantileTimingIf`を使用している場合）、[NaN](../../../sql-reference/data-types/float.md#data_type-float-nan-inf)が返されます。これにより、これらのケースがゼロになるケースと区別されます。[ORDER BY句](../../../sql-reference/statements/select/order-by.md#select-order-by)のナンバール順序付けに関する注意事項を参照してください。
:::

**例**

入力テーブル：

``` text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

クエリ：

``` sql
SELECT quantileTimingWeighted(response_time, weight) FROM t
```

結果：

``` text
┌─quantileTimingWeighted(response_time, weight)─┐
│                                           112 │
└───────────────────────────────────────────────┘
```

# quantilesTimingWeighted

`quantileTimingWeighted`と同じですが、複数の分位点レベルを持つパラメータを受け取り、複数の値で満たされた配列を返します。

**例**

入力テーブル：

``` text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

クエリ：

``` sql
SELECT quantilesTimingWeighted(0,5, 0.99)(response_time, weight) FROM t
```

結果：

``` text
┌─quantilesTimingWeighted(0.5, 0.99)(response_time, weight)─┐
│ [112,162]                                                 │
└───────────────────────────────────────────────────────────┘
```

**関連項目**

- [median](../../../sql-reference/aggregate-functions/reference/median.md#median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
