---
description: '指定された精度で、各要素の重みに基づいて数値データ列の分位数を計算します。'
sidebar_position: 181
slug: /sql-reference/aggregate-functions/reference/quantiletimingweighted
title: 'quantileTimingWeighted'
doc_type: 'reference'
---

# quantileTimingWeighted {#quantiletimingweighted}

指定した精度で、数値データのシーケンスに対して、各要素の重みを考慮した[分位数](https://en.wikipedia.org/wiki/Quantile)を計算します。

結果は決定論的であり（クエリの処理順序には依存しません）、Web ページの読み込み時間やバックエンドの応答時間のような分布を表すシーケンスの処理に最適化されています。

1 つのクエリ内で、異なるレベルを指定した複数の `quantile*` 関数を使用する場合、内部状態は結合されません（つまり、そのクエリは本来より非効率に動作します）。このような場合は、[quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 関数を使用してください。

**構文**

```sql
quantileTimingWeighted(level)(expr, weight)
```

Alias: `medianTimingWeighted`.

**引数**

* `level` — 分位数のレベル。省略可能なパラメータ。0 から 1 の間の定数の浮動小数点数。`level` の値は `[0.01, 0.99]` の範囲で使用することを推奨します。デフォルト値: 0.5。`level=0.5` のとき、この関数は[中央値](https://en.wikipedia.org/wiki/Median)を計算します。

* `expr` — 列の値に対する[式](/sql-reference/syntax#expressions)で、[Float*](../../../sql-reference/data-types/float.md) 型の数値を返します。

  * 負の値が関数に渡された場合、その動作は未定義です。
  * 値が 30,000（30 秒を超えるページ読み込み時間）より大きい場合、30,000 であるとみなされます。

* `weight` — シーケンスの要素の重みを格納する列。重みは値の出現回数です。

**精度**

次の場合、計算は正確です:

* 値の総数が 5670 を超えない場合。
* 値の総数が 5670 を超える場合でも、ページ読み込み時間が 1024 ms 未満の場合。

それ以外の場合、計算結果は 16 ms の倍数のうち最も近い値に丸められます。

:::note\
ページ読み込み時間の分位数を計算する場合、この関数は [quantile](/sql-reference/aggregate-functions/reference/quantile) よりも効率的かつ高精度です。
:::

**戻り値**

* 指定したレベルの分位数。

型: `Float32`。

:::note\
関数に値が一つも渡されない場合（`quantileTimingIf` を使用する場合）、[NaN](/sql-reference/data-types/float#nan-and-inf) が返されます。これは、このようなケースを結果がゼロになるケースと区別することを目的としています。`NaN` 値のソートに関する注意点については、[ORDER BY 句](/sql-reference/statements/select/order-by)を参照してください。
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

結果：

```text
┌─quantileTimingWeighted(response_time, weight)─┐
│                                           112 │
└───────────────────────────────────────────────┘
```

# quantilesTimingWeighted {#quantilestimingweighted}

`quantileTimingWeighted` と同様ですが、複数の分位レベルをパラメータとして受け取り、それらの分位数に対応する値を要素とする Array を返します。

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
