---
slug: /sql-reference/data-types/float
sidebar_position: 4
sidebar_label: Float32 | Float64 | BFloat16
title: Float32 | Float64 | BFloat16 型
---

:::note
正確な計算が必要な場合、特に高い精度を必要とする財務データやビジネスデータを扱う場合は、[Decimal](../data-types/decimal.md) の使用を検討すべきです。

[Floating Point Numbers](https://en.wikipedia.org/wiki/IEEE_754) は、以下に示すように不正確な結果を引き起こすことがあります:

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
Engine=MergeTree
ORDER BY tuple();


# 2 桁の小数を持つ 1,000,000 のランダムな数値を生成し、float と decimal として保存する
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

ClickHouse と C における同等の型は以下の通りです:

- `Float32` — `float`.
- `Float64` — `double`.

ClickHouse の Float 型には以下のエイリアスがあります:

- `Float32` — `FLOAT`, `REAL`, `SINGLE`.
- `Float64` — `DOUBLE`, `DOUBLE PRECISION`.

テーブルを作成する際、浮動小数点数のための数値パラメータ（例: `FLOAT(12)`, `FLOAT(15, 22)`, `DOUBLE(12)`, `DOUBLE(4, 18)`）を設定できますが、ClickHouse はこれらを無視します。

## 浮動小数点数の使用 {#using-floating-point-numbers}

- 浮動小数点数を用いた計算では、丸め誤差が発生する可能性があります。

<!-- -->

``` sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- 計算の結果は計算方法（プロセッサの種類とコンピュータシステムのアーキテクチャ）によって異なる場合があります。
- 浮動小数点計算は無限大（`Inf`）や「数ではない」（`NaN`）といった数値を生じることがあります。これは計算結果を処理する際に考慮する必要があります。
- テキストから浮動小数点数を解析する際、結果が最も近い機械表現可能な数でない可能性があります。

## NaN および Inf {#nan-and-inf}

標準 SQL に対して、ClickHouse は以下の浮動小数点数のカテゴリをサポートしています:

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

`NaN` のソートに関するルールについては、[ORDER BY 句](../../sql-reference/statements/select/order-by.md)のセクションを参照してください。

## BFloat16 {#bfloat16}

`BFloat16` は 8 ビットの指数、符号、および 7 ビットの仮数を持つ 16 ビット浮動小数点データ型です。
これは機械学習や AI アプリケーションに役立ちます。

ClickHouse は `Float32` と `BFloat16` の間の変換をサポートしており、これらは [`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) や [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16) 関数を用いて行うことができます。

:::note
ほとんどの他の操作はサポートされていません。
:::
