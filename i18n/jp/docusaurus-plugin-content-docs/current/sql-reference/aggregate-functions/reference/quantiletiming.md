---
description: '指定された精度で数値データシーケンスの分位数を計算します。'
sidebar_position: 180
slug: /sql-reference/aggregate-functions/reference/quantiletiming
title: 'quantileTiming'
doc_type: 'reference'
---

# quantileTiming {#quantiletiming}

指定された精度で数値データシーケンスの[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定的であり（クエリの処理順序に依存しません）、Webページの読み込み時間やバックエンドのレスポンス時間のような分布を表すシーケンスで動作するよう最適化されています。

1 つのクエリ内で異なるレベルを持つ複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、そのクエリは本来可能な場合よりも効率が低下します）。このような場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileTiming(level)(expr)
```

Alias: `medianTiming`.

**引数**

* `level` — 分位数のレベル。省略可能なパラメーター。0 から 1 までの定数の浮動小数点数値。`level` の値には `[0.01, 0.99]` の範囲を使用することを推奨します。デフォルト値: 0.5。`level=0.5` のとき、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

* `expr` — カラム値に対する[式](/sql-reference/syntax#expressions)で、[Float*](../../../sql-reference/data-types/float.md) 型の数値を返します。

  * 負の値が関数に渡された場合、その動作は未定義です。
  * 値が 30,000（ページ読み込み時間が 30 秒超）より大きい場合、30,000 とみなされます。

**精度**

計算は次の場合に正確です:

* 値の総数が 5670 を超えない。
* 値の総数が 5670 を超えるが、ページ読み込み時間が 1024 ms 未満である。

それ以外の場合、計算結果は 16 ms の最も近い倍数に丸められます。

:::note\
ページ読み込み時間の分位数を計算する場合、この関数は [quantile](/sql-reference/aggregate-functions/reference/quantile) よりも効率的かつ高精度です。
:::

**戻り値**

* 指定されたレベルの分位数。

型: `Float32`。

:::note\
（`quantileTimingIf` を使用していて）関数に値が 1 つも渡されない場合、[NaN](/sql-reference/data-types/float#nan-and-inf) が返されます。これは、結果が 0 になるケースと区別することを目的としています。`NaN` 値のソートに関する注意事項については、[ORDER BY 句](/sql-reference/statements/select/order-by)を参照してください。
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

結果：

```text
┌─quantileTiming(response_time)─┐
│                           126 │
└───────────────────────────────┘
```

**関連項目**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
