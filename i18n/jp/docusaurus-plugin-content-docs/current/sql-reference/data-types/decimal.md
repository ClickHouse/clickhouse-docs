---
slug: '/sql-reference/data-types/decimal'
sidebar_position: 6
sidebar_label: 'Decimal'
keywords: ['Decimal', 'データ型[]', 'ClickHouse']
description: 'Decimal は、加算、減算、乗算の操作中に精度を保持する符号付き固定小数点数です。'
---


# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

符号付き固定小数点数で、加算、減算、乗算の操作中に精度を保持します。除算では最下位の桁が切り捨てられます（四捨五入はしません）。

## パラメータ {#parameters}

- P - 精度。有効範囲: \[ 1 : 76 \]。数字が持つことができる小数桁の数（整数部を含む）を決定します。デフォルトの精度は 10 です。
- S - スケール。有効範囲: \[ 0 : P \]。小数部分が持つことができる桁数を決定します。

Decimal(P) は Decimal(P, 0) と等価です。同様に、Decimalという構文は Decimal(10, 0) と同じです。

P パラメータの値によって、Decimal(P, S) は以下の同義語になります：
- P が \[ 1 : 9 \] の場合 - Decimal32(S)
- P が \[ 10 : 18 \] の場合 - Decimal64(S)
- P が \[ 19 : 38 \] の場合 - Decimal128(S)
- P が \[ 39 : 76 \] の場合 - Decimal256(S)

## Decimal 値の範囲 {#decimal-value-ranges}

- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

例えば、Decimal32(4) は -99999.9999 から 99999.9999 までの数値を 0.0001 の刻みで含むことができます。

## 内部表現 {#internal-representation}

内部的にデータは、それぞれのビット幅を持つ符号付き整数として表現されます。メモリに格納できる実際の値の範囲は、上記で指定されたものより少し大きく、これは文字列からの変換時のみチェックされます。

現代の CPU は 128 ビットおよび 256 ビットの整数をネイティブにサポートしていないため、Decimal128 および Decimal256 の操作はエミュレートされています。したがって、Decimal128 および Decimal256 は Decimal32/Decimal64 よりも著しく遅く動作します。

## 操作と結果の型 {#operations-and-result-type}

Decimal 上の二項演算は、結果の型をより広くします（引数の順序は問わない）。

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

スケールに関するルール：

- 加算、減算: S = max(S1, S2)。
- 乗算: S = S1 + S2。
- 除算: S = S1。

Decimal と整数の間での同様の操作に対して、結果は引数と同じサイズの Decimal になります。

Decimal と Float32/Float64 の間の操作は定義されていません。必要な場合は、引数のいずれかを toDecimal32、toDecimal64、toDecimal128 または toFloat32、toFloat64 のビルトインを使用して明示的にキャストできます。結果は精度を失うことに注意してください。また、型変換は計算的に高コストな操作です。

Decimal に関する一部の関数は、結果を Float64 として返します（例えば、var や stddev など）。中間計算は依然として Decimal で実行される場合があり、これにより同じ値を持つ Float64 と Decimal の入力間で異なる結果が生じることがあります。

## オーバーフローチェック {#overflow-checks}

Decimal の計算中に整数オーバーフローが発生する可能性があります。小数部分の桁数を超えた場合は切り捨てられます（四捨五入はしません）。整数部分の桁数が超えた場合は例外が発生します。

:::warning
Decimal128 および Decimal256 に対してオーバーフローチェックは実装されていません。オーバーフローが発生した場合、不正な結果が返され、例外はスローされません。
:::

``` sql
SELECT toDecimal32(2, 4) AS x, x / 3
```

``` text
┌──────x─┬─divide(toDecimal32(2, 4), 3)─┐
│ 2.0000 │                       0.6666 │
└────────┴──────────────────────────────┘
```

``` sql
SELECT toDecimal32(4.2, 8) AS x, x * x
```

``` text
DB::Exception: Scale is out of bounds.
```

``` sql
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

``` text
DB::Exception: Decimal math overflow.
```

オーバーフローチェックは操作の遅延を招きます。オーバーフローが発生しないことがわかっている場合は、`decimal_check_overflow` 設定を使用してチェックを無効にすることが理にかなっています。チェックが無効になってオーバーフローが発生した場合、結果は不正確になります：

``` sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

``` text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

オーバーフローチェックは、算術操作だけでなく値の比較でも行われます：

``` sql
SELECT toDecimal32(1, 8) < 100
```

``` text
DB::Exception: Can't compare.
```

**参照**
- [isDecimalOverflow](/sql-reference/functions/other-functions#isdecimaloverflow)
- [countDigits](/sql-reference/functions/other-functions#countdigits)
