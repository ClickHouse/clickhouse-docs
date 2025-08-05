---
description: '各シーケンスメンバーの重みに従って、数値データシーケンスの分位数を決定された精度で計算します。'
sidebar_position: 181
slug: '/sql-reference/aggregate-functions/reference/quantiletimingweighted'
title: 'quantileTimingWeighted'
---




# quantileTimingWeighted

決定された精度に基づいて、各シーケンスメンバーの重みに従って数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定的であり（クエリ処理順序に依存しない）、Webページの読み込み時間やバックエンドの応答時間などの分布を記述するシーケンスでの作業に最適化されています。

異なるレベルで複数の `quantile*` 関数をクエリで使用する場合、内部状態は結合されません（つまり、クエリは可能なより効率的に機能しません）。この場合、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileTimingWeighted(level)(expr, weight)
```

エイリアス: `medianTimingWeighted`。

**引数**

- `level` — 分位数のレベル。オプションのパラメーター。0から1までの定数浮動小数点数。 `level` の値は `[0.01, 0.99]` の範囲を使用することをお勧めします。デフォルト値: 0.5。 `level=0.5` の場合、関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

- `expr` — カラム値に対する[式](/sql-reference/syntax#expressions)で、[Float\*](../../../sql-reference/data-types/float.md)型の数値を返します。

        - 負の値が関数に渡されると、動作は未定義です。
        - 値が30,000を超える場合（30秒を超えるページの読み込み時間）、30,000であると見なされます。

- `weight` — シーケンス要素の重みを持つカラム。重みは値の出現回数です。

**精度**

計算は以下の場合に正確です：

- 値の合計数が5670を超えない。
- 値の合計数が5670を超えるが、ページの読み込み時間が1024ms未満である。

それ以外の場合、計算の結果は16 msの最も近い倍数に丸められます。

:::note    
ページ読み込み時間の分位数を計算するためには、この関数は[quantile](/sql-reference/aggregate-functions/reference/quantile)よりも効果的かつ正確です。
:::

**返される値**

- 指定されたレベルの分位数。

型: `Float32`。

:::note    
関数に値が渡されない場合（`quantileTimingIf` を使用している場合）、[NaN](/sql-reference/data-types/float#nan-and-inf)が返されます。これは、ゼロの結果が得られる場合との区別を目的としています。[ORDER BY句](/sql-reference/statements/select/order-by)のナンバのソートに関するメモを参照してください。
:::

**例**

入力テーブル：

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

クエリ：

```sql
SELECT quantileTimingWeighted(response_time, weight) FROM t
```

結果：

```text
┌─quantileTimingWeighted(response_time, weight)─┐
│                                           112 │
└───────────────────────────────────────────────┘
```


# quantilesTimingWeighted

`quantileTimingWeighted` と同様ですが、分位数レベルを持つ複数のパラメーターを受け取り、複数の分位数の値で満たされた配列を返します。

**例**

入力テーブル：

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

クエリ：

```sql
SELECT quantilesTimingWeighted(0,5, 0.99)(response_time, weight) FROM t
```

結果：

```text
┌─quantilesTimingWeighted(0.5, 0.99)(response_time, weight)─┐
│ [112,162]                                                 │
└───────────────────────────────────────────────────────────┘
```

**関連情報**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
