---
description: 'ClickHouse における浮動小数点データ型: Float32、Float64、BFloat16 のドキュメント'
sidebar_label: 'Float32 | Float64 | BFloat16'
sidebar_position: 4
slug: /sql-reference/data-types/float
title: 'Float32 | Float64 | BFloat16 型'
doc_type: 'reference'
---

:::note
特に高い精度が求められる金融データや業務データを扱うなど、正確な計算が必要な場合は、代わりに [Decimal](../data-types/decimal.md) の利用を検討してください。

[浮動小数点数](https://en.wikipedia.org/wiki/IEEE_754)は、以下の例で示すように不正確な結果になる可能性があります。

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
ENGINE=MergeTree
ORDER BY tuple();
```

# 小数点以下2桁の乱数を 1 000 000 個生成し、float 型および decimal 型として保存する {#generate-1-000-000-random-numbers-with-2-decimal-places-and-store-them-as-a-float-and-as-a-decimal}

INSERT INTO float&#95;vs&#95;decimal SELECT round(randCanonical(), 3) AS res, res FROM system.numbers LIMIT 1000000;

````
```sql
SELECT sum(my_float), sum(my_decimal) FROM float_vs_decimal;

┌──────sum(my_float)─┬─sum(my_decimal)─┐
│ 499693.60500000004 │      499693.605 │
└────────────────────┴─────────────────┘

SELECT sumKahan(my_float), sumKahan(my_decimal) FROM float_vs_decimal;

┌─sumKahan(my_float)─┬─sumKahan(my_decimal)─┐
│         499693.605 │           499693.605 │
└────────────────────┴──────────────────────┘
````

:::

ClickHouse と C における対応する型は次のとおりです。

* `Float32` — `float`
* `Float64` — `double`

ClickHouse における浮動小数点数型には次のエイリアスがあります。

* `Float32` — `FLOAT`、`REAL`、`SINGLE`
* `Float64` — `DOUBLE`、`DOUBLE PRECISION`

テーブルを作成する際、浮動小数点数に対して数値パラメータを指定できます（例: `FLOAT(12)`、`FLOAT(15, 22)`、`DOUBLE(12)`、`DOUBLE(4, 18)`）が、ClickHouse はこれらを無視します。

## 浮動小数点数を使用する {#using-floating-point-numbers}

* 浮動小数点数での計算では、丸め誤差が発生することがあります。

{/* */ }

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

* 計算結果は、計算方法（コンピュータシステムのプロセッサの種類およびアーキテクチャ）によって異なります。
* 浮動小数点計算では、無限大（`Inf`）や &quot;not-a-number&quot;（`NaN`）といった値が結果として得られる場合があります。計算結果を処理する際には、この点を考慮する必要があります。
* 文字列から浮動小数点数を解析する場合、結果が最も近い機械表現可能な数値にならないことがあります。

## NaN と Inf {#nan-and-inf}

標準的な SQL とは異なり、ClickHouse は次のカテゴリの浮動小数点数をサポートしています。

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

* `NaN` — 「Not a Number」（数値ではないことを示す値）。

{/* */ }

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

`NaN` のソート規則については、[ORDER BY 句](../../sql-reference/statements/select/order-by.md) を参照してください。

## BFloat16 {#bfloat16}

`BFloat16` は、8 ビットの指数部、符号、7 ビットの仮数部を持つ 16 ビット浮動小数点データ型です。
機械学習や AI アプリケーションに有用です。

ClickHouse は `Float32` と `BFloat16` 間の変換をサポートしており、
[`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) または [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16) 関数で行えます。

:::note
その他のほとんどの演算はサポートされていません。
:::
