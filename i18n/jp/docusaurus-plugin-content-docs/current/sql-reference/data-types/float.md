---
description: 'ClickHouse における浮動小数点データ型のドキュメント: Float32、Float64、BFloat16'
sidebar_label: 'Float32 | Float64 | BFloat16'
sidebar_position: 4
slug: /sql-reference/data-types/float
title: 'Float32 | Float64 | BFloat16 タイプ'
---

:::note
正確な計算が必要な場合、特に高精度が要求される金融データやビジネスデータを扱う場合は、代わりに [Decimal](../data-types/decimal.md) の使用を検討するべきです。

[Floating Point Numbers](https://en.wikipedia.org/wiki/IEEE_754) は以下のように不正確な結果をもたらすことがあります：

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
Engine=MergeTree
ORDER BY tuple();


# 小数点以下2桁のランダムな数字を1,000,000個生成し、float型とdecimal型として保存
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

ClickHouse における型と C における型の対応は以下の通りです：

- `Float32` — `float`。
- `Float64` — `double`。

ClickHouse の浮動小数点型には以下のエイリアスがあります：

- `Float32` — `FLOAT`, `REAL`, `SINGLE`。
- `Float64` — `DOUBLE`, `DOUBLE PRECISION`。

テーブル作成時に浮動小数点数に対して数値パラメータを設定することができます（例：`FLOAT(12)`, `FLOAT(15, 22)`, `DOUBLE(12)`, `DOUBLE(4, 18)`）が、ClickHouse ではこれを無視します。

## 浮動小数点数の使用 {#using-floating-point-numbers}

- 浮動小数点数を用いた計算は丸め誤差を生じることがあります。

<!-- -->

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- 計算の結果は計算方法（プロセッサの種類およびコンピュータシステムのアーキテクチャ）に依存します。
- 浮動小数点計算の結果として無限大（`Inf`）や「数でない」値（`NaN`）が出ることがあります。この点は計算結果の処理の際に考慮する必要があります。
- テキストから浮動小数点数を解析する際、結果は最も近い機械表現可能な数値でない可能性があります。

## NaN と Inf {#nan-and-inf}

標準 SQL と異なり、ClickHouse は以下の浮動小数点数のカテゴリをサポートしています：

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

- `NaN` — 数でない。

<!-- -->

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

`NaN` のソートに関するルールはセクション [ORDER BY clause](../../sql-reference/statements/select/order-by.md) を参照してください。

## BFloat16 {#bfloat16}

`BFloat16` は、8ビットの指数、符号、および7ビットの仮数を持つ16ビット浮動小数点データ型です。
これは機械学習およびAIアプリケーションに役立ちます。

ClickHouse では `Float32` と `BFloat16` の間の変換をサポートしており、これは [`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) または [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16) 関数を使用して行うことができます。

:::note
その他の操作はサポートされていません。
:::
