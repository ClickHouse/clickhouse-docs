---
description: 'ClickHouse における浮動小数点型 Float32、Float64、BFloat16 のドキュメント'
sidebar_label: 'Float32 | Float64 | BFloat16'
sidebar_position: 4
slug: /sql-reference/data-types/float
title: 'Float32 | Float64 | BFloat16 型'
doc_type: 'reference'
---

:::note
特に高精度が求められる金融データや業務データなど、正確な計算が必要な場合は、代わりに [Decimal](../data-types/decimal.md) の利用を検討してください。

[浮動小数点数](https://en.wikipedia.org/wiki/IEEE_754) は、以下に示すように不正確な結果を招くことがあります。

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
ENGINE=MergeTree
ORDER BY tuple();

# Generate 1 000 000 random numbers with 2 decimal places and store them as a float and as a decimal
INSERT INTO float_vs_decimal SELECT round(randCanonical(), 3) AS res, res FROM system.numbers LIMIT 1000000;
```

```sql
SELECT sum(my_float), sum(my_decimal) FROM float_vs_decimal;

┌──────sum(my_float)─┬─sum(my_decimal)─┐
│ 499693.60500000004 │      499693.605 │
└────────────────────┴─────────────────┘

SELECT sumKahan(my_float), sumKahan(my_decimal) FROM float_vs_decimal;

┌─sumKahan(my_float)─┬─sumKahan(my_decimal)─┐
│         499693.605 │           499693.605 │
└────────────────────┴──────────────────────┘
```

:::

ClickHouse と C の同等の型は以下のとおりです:

* `Float32` — `float`。
* `Float64` — `double`。

ClickHouse の Float 型には、次のエイリアスがあります:

* `Float32` — `FLOAT`、`REAL`、`SINGLE`。
* `Float64` — `DOUBLE`、`DOUBLE PRECISION`。

テーブルを作成するときに、浮動小数点数の数値パラメータを設定できます（例: `FLOAT(12)`、`FLOAT(15, 22)`、`DOUBLE(12)`、`DOUBLE(4, 18)`）が、ClickHouse はそれらを無視します。


## 浮動小数点数の使用 \{#using-floating-point-numbers\}

* 浮動小数点数を使用した計算では、丸め誤差が発生する可能性があります。

{/* */ }

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

* 計算の結果は、計算方法(プロセッサの種類とコンピュータシステムのアーキテクチャ)に依存します。
* 浮動小数点計算では、無限大(`Inf`)や「非数」(`NaN`)などの数値が生成される可能性があります。計算結果を処理する際には、これを考慮する必要があります。
* テキストから浮動小数点数を解析する場合、結果は最も近い機械表現可能な数値ではない可能性があります。


## NaN と Inf \{#nan-and-inf\}

標準 SQL とは対照的に、ClickHouse は次のカテゴリの浮動小数点数をサポートしています:

* `Inf` – 無限大。

{/* */ }

```sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

* `-Inf` — 負の無限大。

{/* */ }

```sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

* `NaN` — 非数。

{/* */ }

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

`NaN` のソートルールについては、[ORDER BY 句](../../sql-reference/statements/select/order-by.md)セクションを参照してください。


## BFloat16 \\{#bfloat16\\}

`BFloat16` は、8 ビットの指数、符号、および 7 ビットの仮数を持つ 16 ビット浮動小数点データ型です。
機械学習および AI アプリケーションに役立ちます。

ClickHouse は `Float32` と `BFloat16` 間の変換をサポートしており、[`toFloat32()`](../functions/type-conversion-functions.md/#toFloat32) または [`toBFloat16`](../functions/type-conversion-functions.md/#toBFloat16) 関数を使用して実行できます。

:::note
その他のほとんどの操作はサポートされていません。
:::