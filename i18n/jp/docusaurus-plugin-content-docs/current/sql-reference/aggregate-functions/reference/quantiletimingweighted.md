---
'description': '指定された精度で、各シーケンスメンバーの重み付けに従って数値データシーケンスの分位数を計算します。'
'sidebar_position': 181
'slug': '/sql-reference/aggregate-functions/reference/quantiletimingweighted'
'title': 'quantileTimingWeighted'
'doc_type': 'reference'
---


# quantileTimingWeighted

指定された精度で、各シーケンスメンバーの重みに従って、数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定的であり、クエリ処理の順序に依存しません。この関数は、ウェブページの読み込み時間やバックエンドの応答時間などの分布を示すシーケンスでの作業に最適化されています。

クエリ内で異なるレベルの複数の `quantile*` 関数を使用する場合、内部状態は組み合わされません（つまり、クエリはより効率的に機能することができません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileTimingWeighted(level)(expr, weight)
```

エイリアス: `medianTimingWeighted`。

**引数**

- `level` — 分位数のレベル。オプションのパラメーター。0から1の間の定数浮動小数点数。`level` の値は、`[0.01, 0.99]` の範囲を使用することをお勧めします。デフォルト値: 0.5。`level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — [式](/sql-reference/syntax#expressions) でカラムの値を対象にし、[Float\*](../../../sql-reference/data-types/float.md)型の数値を返します。

        - 負の値が関数に渡された場合、動作は未定義となります。
        - 値が30,000を超える場合（30秒を超えるページの読み込み時間）、30,000と見なされます。

- `weight` — シーケンス要素の重みを持つカラム。重みは値の出現回数です。

**精度**

計算は次の条件を満たす場合に正確です：

- 値の総数が5670を超えない。
- 値の総数が5670を超えますが、ページの読み込み時間が1024ms未満である。

そうでない場合、計算結果は最も近い16msの倍数に丸められます。

:::note    
ページの読み込み時間の分位数を計算する場合、この関数は[quantile](/sql-reference/aggregate-functions/reference/quantile)よりも効果的かつ正確です。
:::

**返される値**

- 指定されたレベルの分位数。

型: `Float32`。

:::note    
値が関数に渡されない場合（`quantileTimingIf`を使用している場合）、[NaN](/sql-reference/data-types/float#nan-and-inf)が返されます。これは、これらのケースをゼロを生成するケースから区別するためです。`NaN`値のソートに関する注意は[ORDER BY 句](/sql-reference/statements/select/order-by)を参照してください。
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

`quantileTimingWeighted` と同様ですが、複数のパラメーターを受け取り、さまざまな分位数の値で埋められた配列を返します。

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

**関連項目**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
