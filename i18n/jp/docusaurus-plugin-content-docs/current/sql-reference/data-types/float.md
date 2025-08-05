---
description: 'Documentation for floating-point data types in ClickHouse: Float32,
  Float64, and BFloat16'
sidebar_label: 'Float32 | Float64 | BFloat16'
sidebar_position: 4
slug: '/sql-reference/data-types/float'
title: 'Float32 | Float64 | BFloat16 Types'
---



:::note
正確な計算が必要な場合、特に高精度を要求する財務データやビジネスデータを扱う場合は、代わりに [Decimal](../data-types/decimal.md) の使用を検討してください。

[Floating Point Numbers](https://en.wikipedia.org/wiki/IEEE_754) は、以下の例のように不正確な結果を引き起こす可能性があります：

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
Engine=MergeTree
ORDER BY tuple();


# 小数点以下2桁のランダムな数値を1,000,000生成し、floatとdecimalとして保存します
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

ClickHouseとCにおける対応する型は以下の通りです：

- `Float32` — `float`.
- `Float64` — `double`.

ClickHouseにおけるFloat型の別名は次の通りです：

- `Float32` — `FLOAT`, `REAL`, `SINGLE`.
- `Float64` — `DOUBLE`, `DOUBLE PRECISION`.

テーブルを作成する際には、浮動小数点数の数値パラメータを設定できます（例：`FLOAT(12)`, `FLOAT(15, 22)`, `DOUBLE(12)`, `DOUBLE(4, 18)`）、ですがClickHouseはこれらを無視します。

## 浮動小数点数の使用 {#using-floating-point-numbers}

- 浮動小数点数を使用した計算は、丸め誤差を生じる可能性があります。

<!-- -->

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- 計算の結果は、計算方法（プロセッサのタイプとコンピュータシステムのアーキテクチャ）によって異なります。
- 浮動小数点計算の結果として、無限大（`Inf`）や "数ではない"（`NaN`）のような数値が生じる可能性があります。計算結果を処理する際にはこれを考慮する必要があります。
- テキストから浮動小数点数を解析する場合、結果が最も近いマシン表現可能な数でない可能性があります。

## NaNとInf {#nan-and-inf}

標準SQLとは異なり、ClickHouseは以下のカテゴリーの浮動小数点数をサポートしています：

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

- `NaN` — 数ではない。

<!-- -->

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

`NaN`のソート規則については、[ORDER BY句](../../sql-reference/statements/select/order-by.md)のセクションを参照してください。

## BFloat16 {#bfloat16}

`BFloat16` は、8ビットの指数、符号、7ビットの仮数を持つ16ビット浮動小数点データ型です。 
機械学習やAIアプリケーションに役立ちます。

ClickHouseは、[`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) または [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16) 関数を使用して `Float32` と `BFloat16` の間の変換をサポートしています。

:::note
その他の操作はサポートされていないものがほとんどです。
:::
