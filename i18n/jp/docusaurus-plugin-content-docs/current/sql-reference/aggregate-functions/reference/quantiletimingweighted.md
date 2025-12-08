---
description: '指定された精度で、各シーケンス要素の重みに基づいて数値データシーケンスの分位数を計算します。'
sidebar_position: 181
slug: /sql-reference/aggregate-functions/reference/quantiletimingweighted
title: 'quantileTimingWeighted'
doc_type: 'reference'
---

# quantileTimingWeighted {#quantiletimingweighted}

指定された精度で、数値データのシーケンスに対して各要素の重みを考慮して [quantile](https://en.wikipedia.org/wiki/Quantile) を計算します。

結果は決定的です（クエリの処理順序に依存しません）。この関数は、Web ページの読み込み時間やバックエンドの応答時間など、分布を表すシーケンスを扱う用途向けに最適化されています。

1 つのクエリの中で異なるレベルを持つ複数の `quantile*` 関数を使用する場合、内部状態はマージされません（つまり、クエリは本来より非効率に動作します）。この場合は、代わりに [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileTimingWeighted(level)(expr, weight)
```

エイリアス: `medianTimingWeighted`.

**引数**

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 の間の定数の浮動小数点数。`level` の値として `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` の場合、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

* `expr` — カラム値に対する[式](/sql-reference/syntax#expressions)で、[Float*](../../../sql-reference/data-types/float.md) 型の数値を返します。

  * 負の値が関数に渡された場合、その動作は未定義です。
  * 値が 30,000（ページ読み込み時間が 30 秒超）より大きい場合は、30,000 であるとみなされます。

* `weight` — シーケンス要素の重みを含むカラム。重みは値の出現回数です。

**精度**

計算は次の場合に正確です:

* 値の総数が 5670 を超えない。
* 値の総数が 5670 を超えるが、ページ読み込み時間が 1024ms 未満である。

それ以外の場合、計算結果は 16 ms の倍数に丸められます。

:::note
ページ読み込み時間の分位数を計算する場合、この関数は [quantile](/sql-reference/aggregate-functions/reference/quantile) よりも効率的かつ高精度です。
:::

**返される値**

* 指定されたレベルの分位数。

型: `Float32`。

:::note
関数に値が 1 つも渡されない場合（`quantileTimingIf` を使用する場合）、[NaN](/sql-reference/data-types/float#nan-and-inf) が返されます。これは、そのようなケースを結果がゼロになるケースと区別するためです。`NaN` 値のソートに関する注意事項については、[ORDER BY 句](/sql-reference/statements/select/order-by) を参照してください。
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

クエリ：

```sql
SELECT quantileTimingWeighted(response_time, weight) FROM t
```

結果:

```text
┌─quantileTimingWeighted(response_time, weight)─┐
│                                           112 │
└───────────────────────────────────────────────┘
```

# quantilesTimingWeighted {#quantilestimingweighted}

`quantileTimingWeighted` と同様ですが、分位レベルを指定する複数の引数を受け取り、それらの分位に対応する値を格納した Array を返します。

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

クエリ：

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

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
