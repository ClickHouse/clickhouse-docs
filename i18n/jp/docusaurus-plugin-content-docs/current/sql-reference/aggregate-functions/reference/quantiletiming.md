---
'description': '指定された精度で数値データシーケンスのクアンタイルを計算します。'
'sidebar_position': 180
'slug': '/sql-reference/aggregate-functions/reference/quantiletiming'
'title': 'quantileTiming'
'doc_type': 'reference'
---


# quantileTiming

決定された精度で、数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定的であり（クエリ処理順序に依存しません）、Webページの読み込み時間やバックエンドの応答時間など、分布を示すシーケンスでの作業に最適化されています。

異なるレベルの複数の `quantile*` 関数をクエリで使用する際、内部状態は組み合わされません（つまり、クエリは効率が低下します）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileTiming(level)(expr)
```

エイリアス: `medianTiming`.

**引数**

- `level` — 分位数のレベル。オプションのパラメーターです。0から1の間の定数浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲で使用することを推奨します。デフォルト値: 0.5。`level=0.5` では、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — [表現](/sql-reference/syntax#expressions)で、カラムの値に対して[Float\*](../../../sql-reference/data-types/float.md)-型の数値を返します。

  - 負の値が関数に渡された場合、その動作は未定義です。
  - 値が30,000（30秒以上のページ読み込み時間）を超える場合、30,000であると見なされます。

**精度**

計算は以下の場合に正確です:

- 値の合計数が5670を超えない。
- 値の合計数が5670を超えますが、ページの読み込み時間が1024ms未満です。

それ以外の場合、計算結果は16msの最寄りの倍数に丸められます。

:::note    
ページ読み込み時間の分位数を計算するために、この関数は[quantile](/sql-reference/aggregate-functions/reference/quantile)よりも効果的で正確です。
:::

**返される値**

- 指定されたレベルの分位数。

タイプ: `Float32`.

:::note    
関数に値が渡されなかった場合（`quantileTimingIf`を使用する場合）、[NaN](/sql-reference/data-types/float#nan-and-inf)が返されます。これは、これらのケースをゼロになるケースと区別するためのものです。[ORDER BY 句](/sql-reference/statements/select/order-by)での`NaN`値のソートに関する注意を参照してください。
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

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
