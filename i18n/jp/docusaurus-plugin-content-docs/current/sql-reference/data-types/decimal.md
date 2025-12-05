---
description: 'ClickHouse の Decimal データ型に関するドキュメント。Decimal は精度を構成可能な固定小数点演算を提供します'
sidebar_label: 'Decimal'
sidebar_position: 6
slug: /sql-reference/data-types/decimal
title: 'Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S),
  Decimal256(S)'
doc_type: 'reference'
---

# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S) {#decimal-decimalp-decimalp-s-decimal32s-decimal64s-decimal128s-decimal256s}

加算、減算、乗算の演算で精度を維持する符号付き固定小数点数です。除算では、小数点以下の末尾の桁は丸めずに切り捨てられます。

## パラメータ {#parameters}

- P - 精度。指定可能な範囲: \[ 1 : 76 \]。数値が持つことのできる 10 進数の桁数（小数部分を含む）を決定します。デフォルトの精度は 10 です。
- S - スケール。指定可能な範囲: \[ 0 : P \]。小数部分が持つことのできる 10 進数の桁数を決定します。

Decimal(P) は Decimal(P, 0) と同等です。同様に、構文 Decimal は Decimal(10, 0) と同等です。

P パラメータの値に応じて、Decimal(P, S) は次の型の別名になります:
- P が \[ 1 : 9 \] の場合 - Decimal32(S)
- P が \[ 10 : 18 \] の場合 - Decimal64(S)
- P が \[ 19 : 38 \] の場合 - Decimal128(S)
- P が \[ 39 : 76 \] の場合 - Decimal256(S)

## 10 進数値の範囲 {#decimal-value-ranges}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

たとえば、Decimal32(4) では、-99999.9999 から 99999.9999 までの数値を 0.0001 刻みで表現できます。

## 内部表現 {#internal-representation}

内部的には、データは対応するビット幅を持つ通常の符号付き整数として表現されます。メモリに格納可能な実際の値の範囲は、上記で指定したものよりわずかに広くなっていますが、この範囲は文字列からの変換時にのみ検査されます。

現代の CPU は 128 ビットおよび 256 ビット整数をネイティブにはサポートしていないため、Decimal128 と Decimal256 に対する演算はエミュレートされます。その結果、Decimal128 および Decimal256 は Decimal32/Decimal64 と比べて大幅に低速に動作します。

## 演算と結果の型 {#operations-and-result-type}

Decimal 同士の二項演算の結果は（引数の順序に関係なく）より大きな桁幅の結果型になります。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

スケールに関する規則:

- 加算、減算: S = max(S1, S2)。
- 乗算: S = S1 + S2。
- 除算: S = S1。

Decimal と整数との同様の演算では、結果は引数と同じサイズの Decimal になります。

Decimal と Float32/Float64 の間の演算は定義されていません。これらが必要な場合は、一方の引数を `toDecimal32`、`toDecimal64`、`toDecimal128` もしくは `toFloat32`、`toFloat64` のビルトインを使って明示的にキャストしてください。結果の精度が失われること、および型変換は計算コストの高い操作であることに注意してください。

Decimal に対する一部の関数は、結果を Float64 として返します（例えば `var` や `stddev`）。中間計算は依然として Decimal で実行される場合があり、そのため同じ値を持つ Float64 入力と Decimal 入力の間で結果が異なる可能性があります。

## オーバーフローのチェック {#overflow-checks}

Decimal で計算を行う際には、整数オーバーフローが発生する可能性があります。小数部の桁数が多すぎる場合は、余分な桁は切り捨てられます（丸めは行われません）。整数部の桁数が多すぎる場合は、例外がスローされます。

:::warning
Decimal128 および Decimal256 ではオーバーフローのチェックは実装されていません。オーバーフローが発生した場合は、例外はスローされず、不正な結果が返されます。
:::

```sql
SELECT toDecimal32(2, 4) AS x, x / 3
```

```text
┌──────x─┬─divide(toDecimal32(2, 4), 3)─┐
│ 2.0000 │                       0.6666 │
└────────┴──────────────────────────────┘
```

```sql
SELECT toDecimal32(4.2, 8) AS x, x * x
```

```text
DB::Exception: スケールが範囲外です。
```

```sql
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
DB::Exception: Decimal演算オーバーフロー。
```

オーバーフローのチェックは演算を遅くします。オーバーフローが発生しないことが分かっている場合は、`decimal_check_overflow` 設定を使用してチェックを無効化するのが有効です。チェックを無効化した状態でオーバーフローが発生すると、結果は正しくなくなります。

```sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

オーバーフロー検査は、算術演算だけでなく値の比較時にも行われます。

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: 比較できません。
```

**関連項目**

* [isDecimalOverflow](/sql-reference/functions/other-functions#isDecimalOverflow)
* [countDigits](/sql-reference/functions/other-functions#countDigits)
