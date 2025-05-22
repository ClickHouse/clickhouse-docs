---
'description': 'With the determined precision computes the quantile of a numeric data
  sequence.'
'sidebar_position': 180
'slug': '/sql-reference/aggregate-functions/reference/quantiletiming'
'title': 'quantileTiming'
---




# quantileTiming

決定された精度で数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定論的であり（クエリ処理の順序に依存しません）、この関数は、ウェブページの読み込み時間やバックエンドの応答時間のような分布を記述するシーケンスの処理に最適化されています。

異なるレベルの`quantile*`関数を複数使用する場合、内部状態は結合されません（すなわち、クエリが可能なほど効率的に動作しません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)関数を使用してください。

**構文**

```sql
quantileTiming(level)(expr)
```

エイリアス: `medianTiming`.

**引数**

- `level` — 分位数のレベル。オプションのパラメータ。0から1までの定数浮動小数点数です。`level`の値としては`[0.01, 0.99]`の範囲を推奨します。デフォルト値: 0.5。`level=0.5`の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — カラムの値に対する[式](/sql-reference/syntax#expressions)で、[Float\*](../../../sql-reference/data-types/float.md)-型の数値を返します。

    - 負の値が関数に渡されると、動作は未定義です。
    - 値が30,000を超える場合（30秒以上のページ読み込み時間の場合）、30,000と見なされます。

**精度**

計算は次の場合に正確です：

- 値の合計数が5670を超えない。
- 値の合計数が5670を超えるが、ページ読み込み時間が1024ms未満である。

そうでない場合、計算結果は最も近い16msの倍数に丸められます。

:::note    
ページ読み込み時間の分位数を計算するためには、この関数は[quantile](/sql-reference/aggregate-functions/reference/quantile)よりも効果的で正確です。
:::

**返される値**

- 指定されたレベルの分位数。

タイプ: `Float32`。

:::note    
関数に値が渡されない場合（`quantileTimingIf`を使用する場合）、[NaN](/sql-reference/data-types/float#nan-and-inf)が返されます。これにより、これらのケースをゼロになるケースと区別することが目的です。[ORDER BY句](/sql-reference/statements/select/order-by)については、`NaN`値のソートについての注意事項を参照してください。
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
