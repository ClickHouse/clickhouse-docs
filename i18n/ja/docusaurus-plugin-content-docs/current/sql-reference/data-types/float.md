---
slug: /sql-reference/data-types/float
sidebar_position: 4
sidebar_label: Float32 | Float64 | BFloat16
title: Float32 | Float64 | BFloat16 タイプ
---

:::note
正確な計算が必要な場合、特に高い精度を要求される金融またはビジネスデータを扱う場合は、[Decimal](../data-types/decimal.md) の使用を検討してください。 

[Floating Point Numbers](https://en.wikipedia.org/wiki/IEEE_754) は、以下に示すように不正確な結果を生じる可能性があります：

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
Engine=MergeTree
ORDER BY tuple();

# 小数点以下2桁のランダムな数値を1,000,000生成し、floatおよびdecimalとして保存
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

ClickHouseとCにおける同等のタイプは以下の通りです：

- `Float32` — `float`.
- `Float64` — `double`.

ClickHouseの浮動小数点タイプには以下のエイリアスがあります：

- `Float32` — `FLOAT`, `REAL`, `SINGLE`.
- `Float64` — `DOUBLE`, `DOUBLE PRECISION`.

テーブルを作成する際、浮動小数点数の数値パラメータを設定することができます（例：`FLOAT(12)`, `FLOAT(15, 22)`, `DOUBLE(12)`, `DOUBLE(4, 18)`）、しかしClickHouseはそれらを無視します。

## 浮動小数点数の使用 {#using-floating-point-numbers}

- 浮動小数点数を使用した計算では、丸め誤差が生じる可能性があります。

<!-- -->

``` sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- 計算の結果は、計算手法（プロセッサの種類やコンピュータシステムのアーキテクチャ）によって異なる可能性があります。
- 浮動小数点計算は、無限大（`Inf`）や「数ではない」（`NaN`）のような数値を生成する可能性があります。これらは計算結果を処理する際に考慮する必要があります。
- テキストから浮動小数点数を解析する際、結果が最も近い機械で表現可能な数値ではないことがあります。

## NaNとInf {#nan-and-inf}

標準SQLとは対照的に、ClickHouseは以下のような浮動小数点数のカテゴリをサポートしています：

- `Inf` – 無限大。

<!-- -->

``` sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

- `-Inf` — 負の無限大。

<!-- -->

``` sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

- `NaN` — 数ではない。

<!-- -->

``` sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

`NaN`のソートルールについては、[ORDER BY句](../../sql-reference/statements/select/order-by.md)のセクションを参照してください。

## BFloat16 {#bfloat16}

`BFloat16`は、8ビットの指数部、符号部、および7ビットの仮数部を持つ16ビット浮動小数点データ型です。 
機械学習やAIアプリケーションに役立ちます。

ClickHouseは、[`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32)または[`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16)関数を使用して、`Float32`と`BFloat16`の間の変換をサポートしています。

:::note
他のほとんどの操作はサポートされていません。
:::
