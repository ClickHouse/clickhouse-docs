---
description: 'ClickHouse における浮動小数点データ型 Float32、Float64、BFloat16 のドキュメント'
sidebar_label: 'Float32 | Float64 | BFloat16'
sidebar_position: 4
slug: /sql-reference/data-types/float
title: 'Float32 | Float64 | BFloat16 型'
doc_type: 'reference'
---

:::note
特に高い精度が求められる財務データや業務データを扱う場合など、正確な計算が必要な場合には、代わりに [Decimal](../data-types/decimal.md) 型の使用を検討してください。

[浮動小数点数](https://en.wikipedia.org/wiki/IEEE_754) は、以下の例のように不正確な結果をもたらす可能性があります。

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
ENGINE=MergeTree
ORDER BY tuple();
```


# 100万個の小数点以下3桁の乱数を生成し、それらを float 型と decimal 型の両方で保存する

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

ClickHouse と C における型の対応関係は次のとおりです。

* `Float32` — `float`。
* `Float64` — `double`。

ClickHouse の浮動小数点型には次のエイリアスがあります。

* `Float32` — `FLOAT`、`REAL`、`SINGLE`。
* `Float64` — `DOUBLE`、`DOUBLE PRECISION`。

テーブル作成時に、浮動小数点数に対して数値パラメータを指定することができます（例: `FLOAT(12)`、`FLOAT(15, 22)`、`DOUBLE(12)`、`DOUBLE(4, 18)`）が、ClickHouse はこれらを無視します。


## 浮動小数点数の使用 {#using-floating-point-numbers}

- 浮動小数点数を用いた計算では、丸め誤差が発生する可能性があります。

<!-- -->

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- 計算結果は、計算方法(プロセッサの種類およびコンピュータシステムのアーキテクチャ)に依存します。
- 浮動小数点演算では、無限大(`Inf`)や非数(`NaN`)などの数値が結果として生じる可能性があります。計算結果を処理する際には、この点を考慮する必要があります。
- テキストから浮動小数点数を解析する際、結果が最も近い機械表現可能な数値にならない場合があります。


## NaNとInf {#nan-and-inf}

標準SQLとは異なり、ClickHouseは以下のカテゴリの浮動小数点数をサポートしています:

- `Inf` – 無限大。

<!-- -->

```sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

- `-Inf` — 負の無限大。

<!-- -->

```sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

- `NaN` — 非数。

<!-- -->

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

`NaN`のソート規則については、[ORDER BY句](../../sql-reference/statements/select/order-by.md)のセクションを参照してください。


## BFloat16 {#bfloat16}

`BFloat16`は、8ビットの指数部、符号ビット、および7ビットの仮数部を持つ16ビット浮動小数点データ型です。
機械学習およびAIアプリケーションで有用です。

ClickHouseは`Float32`と`BFloat16`間の変換をサポートしており、[`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32)または[`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16)関数を使用して実行できます。

:::note
その他のほとんどの操作はサポートされていません。
:::
