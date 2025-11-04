---
'description': 'ClickHouseにおける浮動小数点データタイプに関する文書：Float32、Float64、BFloat16'
'sidebar_label': 'Float32 | Float64 | BFloat16'
'sidebar_position': 4
'slug': '/sql-reference/data-types/float'
'title': 'Float32 | Float64 | BFloat16 タイプ'
'doc_type': 'reference'
---

:::note
もし正確な計算が必要な場合、特に高い精度を要求する財務やビジネスデータを扱う場合は、代わりに [Decimal](../data-types/decimal.md) の使用を検討してください。 

[Floating Point Numbers](https://en.wikipedia.org/wiki/IEEE_754) は以下に示すように不正確な結果をもたらす可能性があります：

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

ClickHouse と C の同等の型は以下の通りです：

- `Float32` — `float`。
- `Float64` — `double`。

ClickHouse の Float 型には以下のエイリアスがあります：

- `Float32` — `FLOAT`、`REAL`、`SINGLE`。
- `Float64` — `DOUBLE`、`DOUBLE PRECISION`。

テーブルを作成する際、浮動小数点数の数値パラメータを設定することができます（例：`FLOAT(12)`、`FLOAT(15, 22)`、`DOUBLE(12)`、`DOUBLE(4, 18)`）、ただし ClickHouse はそれらを無視します。

## 浮動小数点数の使用 {#using-floating-point-numbers}

- 浮動小数点数での計算は丸め誤差を生じる可能性があります。

<!-- -->

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- 計算の結果は計算方法（プロセッサの種類やコンピュータシステムのアーキテクチャ）に依存します。
- 浮動小数点計算では無限大（`Inf`）や「数でない」（`NaN`）などの数が出力される可能性があります。計算結果を処理する際にはこれを考慮する必要があります。
- テキストから浮動小数点数を解析する際、結果は最も近い機械表現可能な数でない場合があります。

## NaN と Inf {#nan-and-inf}

標準 SQL と対照的に、ClickHouse は以下の種類の浮動小数点数をサポートしています：

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

`NaN` のソートに関するルールは、[ORDER BY句](../../sql-reference/statements/select/order-by.md)のセクションを参照してください。

## BFloat16 {#bfloat16}

`BFloat16` は 8 ビットの指数部、符号、7 ビットの仮数を持つ 16 ビット浮動小数点データ型です。 
これは機械学習や AI アプリケーションに便利です。

ClickHouse は `Float32` と `BFloat16` の間での変換をサポートしており、これは [`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) または [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16) 関数を使用して行うことができます。

:::note
ほとんどの他の操作はサポートされていません。
:::
